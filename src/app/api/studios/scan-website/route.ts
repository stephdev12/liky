import { NextRequest, NextResponse } from "next/server";

// Protection SSRF stricte : interdiction des IP locales et schémas dangereux
function isSafeUrl(rawUrl: string): { safe: boolean; error?: string; parsed?: URL } {
  try {
    const parsed = new URL(rawUrl);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { safe: false, error: "Protocole non supporté. Utilisez https:// ou http://" };
    }

    const host = parsed.hostname.toLowerCase();

    // Rejet des adresses locales et privées
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      host.endsWith(".lan") ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      /^169\.254\./.test(host)
    ) {
      return { safe: false, error: "Les adresses IP locales et privées ne peuvent pas être analysées." };
    }

    return { safe: true, parsed };
  } catch {
    return { safe: false, error: "Format d'adresse URL invalide." };
  }
}

// Extraction des métadonnées et contenu HTML
function extractHtmlMetadata(html: string, baseUrl: string) {
  // Titre
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  const title = (ogTitleMatch?.[1] || titleMatch?.[1] || "").trim();

  // Description
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i) ||
                    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  const description = (descMatch?.[1] || "").trim();

  // Logo / Favicon
  let logoUrl: string | null = null;
  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  
  const iconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i) ||
                    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i) ||
                    html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i);

  // Recherche explicite d'une image avec "logo" dans l'attribut src ou alt
  const imgLogoMatch = html.match(/<img[^>]+src=["']([^"']*(?:logo)[^"']*)["'][^>]*>/i);

  const resolveUrl = (src: string) => {
    try {
      return new URL(src, baseUrl).href;
    } catch {
      return null;
    }
  };

  if (imgLogoMatch?.[1]) {
    logoUrl = resolveUrl(imgLogoMatch[1]);
  } else if (iconMatch?.[1]) {
    logoUrl = resolveUrl(iconMatch[1]);
  } else if (ogImageMatch?.[1]) {
    logoUrl = resolveUrl(ogImageMatch[1]);
  }

  // Couleurs CSS
  const colorMatches: string[] = [];
  
  // Variables CSS
  const cssVarRegex = /--(?:primary|brand|accent|main|color|theme)[^:]*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/gi;
  let varMatch;
  while ((varMatch = cssVarRegex.exec(html)) !== null) {
    if (varMatch[1]) colorMatches.push(varMatch[1].trim());
  }

  // Hex codes dans le code CSS / HTML
  const hexRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
  let hexMatch;
  const hexCounts: Record<string, number> = {};
  while ((hexMatch = hexRegex.exec(html)) !== null) {
    const raw = hexMatch[0].toLowerCase();
    const hex = raw.length === 4 ? `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}` : raw;
    // Ignorer blanc pur et noir absolu pour les dominantes
    if (hex !== "#ffffff" && hex !== "#000000" && hex !== "#f8f8f5" && hex !== "#171717") {
      hexCounts[hex] = (hexCounts[hex] || 0) + 1;
    }
  }

  // Trier les couleurs les plus récurrentes
  const sortedColors = Object.entries(hexCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c);

  // Palette par défaut
  let primary = sortedColors[0] || "#171717";
  let secondary = sortedColors[1] || "#7d7d78";
  let accent = sortedColors[2] || "#D8FF64";
  let background = "#F8F8F5";
  let text = "#171717";

  const palette = [
    primary,
    secondary,
    accent,
    sortedColors[3] || "#E2E2DC",
    sortedColors[4] || "#262624",
  ];

  // Typographies
  const detectedFonts: string[] = [];
  const googleFontsMatch = html.match(/fonts\.googleapis\.com\/css2\?family=([^&"']+)/gi);
  if (googleFontsMatch) {
    for (const gfm of googleFontsMatch) {
      const match = gfm.match(/family=([^&"']+)/i);
      if (match?.[1]) {
        const families = decodeURIComponent(match[1]).split(";")[0].split(":")[0].replace(/\+/g, " ");
        if (!detectedFonts.includes(families)) detectedFonts.push(families);
      }
    }
  }

  const fontFamilyRegex = /font-family:\s*([^;}{"']+)/gi;
  let ffMatch;
  while ((ffMatch = fontFamilyRegex.exec(html)) !== null) {
    const firstFont = ffMatch[1].split(",")[0].replace(/['"]/g, "").trim();
    if (
      firstFont &&
      !["inherit", "initial", "sans-serif", "serif", "monospace", "system-ui"].includes(firstFont.toLowerCase()) &&
      !detectedFonts.includes(firstFont)
    ) {
      detectedFonts.push(firstFont);
    }
  }

  const headingFont = detectedFonts[0] || "Newsreader";
  const bodyFont = detectedFonts[1] || detectedFonts[0] || "Geist";

  // Images du site (produits, hero, illustrations)
  const images: string[] = [];
  if (ogImageMatch?.[1]) {
    const fullOg = resolveUrl(ogImageMatch[1]);
    if (fullOg) images.push(fullOg);
  }

  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let imgM;
  while ((imgM = imgRegex.exec(html)) !== null) {
    const src = imgM[1];
    if (
      !src.startsWith("data:") &&
      !src.includes("tracking") &&
      !src.includes("pixel") &&
      !src.includes("1x1") &&
      !src.includes(".svg") &&
      /\.(jpe?g|png|webp|avif)/i.test(src)
    ) {
      const resolved = resolveUrl(src);
      if (resolved && !images.includes(resolved) && images.length < 8) {
        images.push(resolved);
      }
    }
  }

  // Analyse du ton et texte
  const textChunks: string[] = [];
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
  if (h1Match) {
    h1Match.forEach((h) => textChunks.push(h.replace(/<[^>]+>/g, "").trim()));
  }

  const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi);
  if (h2Match) {
    h2Match.slice(0, 4).forEach((h) => textChunks.push(h.replace(/<[^>]+>/g, "").trim()));
  }

  const combinedText = (title + " " + description + " " + textChunks.join(" ")).toLowerCase();

  // Détection du ton
  const toneAdjectives: string[] = [];
  if (/luxe|prestige|élégan|premium|artisan|haute|raffin/i.test(combinedText)) {
    toneAdjectives.push("Premium", "Raffiné", "Sobre");
  } else if (/ia|tech|software|saas|api|auto|cloud|code|data/i.test(combinedText)) {
    toneAdjectives.push("Innovant", "Précis", "Moderne");
  } else if (/nature|bio|vert|éco|durable|planète|santé/i.test(combinedText)) {
    toneAdjectives.push("Chaleureux", "Authentique", "Éco-responsable");
  } else if (/mode|fashion|street|jeune|fun|dynam|créa/i.test(combinedText)) {
    toneAdjectives.push("Audacieux", "Dynamique", "Énergique");
  } else {
    toneAdjectives.push("Chaleureux", "Direct", "Proche du client");
  }

  return {
    title: title || new URL(baseUrl).hostname,
    description: description || "Marque et créations présentées sur le site officiel.",
    colors: {
      primary,
      secondary,
      accent,
      background,
      text,
      palette,
    },
    fonts: {
      heading: headingFont,
      body: bodyFont,
    },
    logoUrl,
    images: images.length > 0 ? images : [logoUrl || "/assets/studios/studio-ad-builder.jpg"],
    tone: {
      adjectives: toneAdjectives,
      summary: `Ton ${toneAdjectives.join(", ").toLowerCase()} valorisant la clarté et l'engagement client.`,
      targetAudience: "Acheteurs et créateurs digitaux",
      language: /[éèêàùîïô]/i.test(combinedText) ? "Français" : "Anglais",
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Veuillez fournir une URL de site valide." },
        { status: 400 }
      );
    }

    url = url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    const check = isSafeUrl(url);
    if (!check.safe || !check.parsed) {
      return NextResponse.json(
        { error: check.error || "URL interdite ou non sécurisée." },
        { status: 400 }
      );
    }

    // Requête réelle avec timeout de 12 secondes
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 LikyAIBot/1.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        redirect: "follow",
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        return NextResponse.json(
          { error: "Le site a mis plus de 12 secondes à répondre (délai dépassé)." },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { error: `Impossible d'accéder au site (${err.message || "erreur réseau"}).` },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Le site a répondu avec le statut HTTP ${response.status}.` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const finalUrl = response.url || url;
    const parsedData = extractHtmlMetadata(html, finalUrl);

    const brandKit = {
      id: `bk_${Date.now()}`,
      url: finalUrl,
      domain: new URL(finalUrl).hostname.replace(/^www\./, ""),
      ...parsedData,
      scannedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      brandKit,
    });
  } catch (error: any) {
    console.error("[SCAN_WEBSITE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne lors de l'analyse du site." },
      { status: 500 }
    );
  }
}

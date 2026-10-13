"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CoolIcon } from "@/components/icons/coolicon";
import { LogoIcon } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { TopupModal } from "@/components/topup-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Loader2, ExternalLink, Check, Copy, Download, RefreshCw, Sparkles, Globe, Layers, Film, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandKitData {
  id: string;
  url: string;
  domain: string;
  title: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    palette: string[];
  };
  fonts: {
    heading: string;
    body: string;
  };
  logoUrl: string | null;
  images: string[];
  tone: {
    adjectives: string[];
    summary: string;
    targetAudience: string;
    language: string;
  };
  scannedAt: string;
}

interface AdGenerationResult {
  id: string;
  type: "poster" | "video";
  format: string;
  headline: string;
  mediaUrl: string;
  cost: number;
  prompt: string;
  createdAt: string;
}

const POSTER_FORMATS = [
  { id: "1080x1350", label: "Portrait Feed", ratio: "4:5", desc: "1080×1350 • Instagram & Facebook" },
  { id: "1080x1920", label: "Story & Reel", ratio: "9:16", desc: "1080×1920 • TikTok, Reels, Shorts" },
  { id: "1080x1080", label: "Carré classique", ratio: "1:1", desc: "1080×1080 • Publications feed" },
  { id: "1920x1080", label: "Bannière Web", ratio: "16:9", desc: "1920×1080 • Desktop & Display" },
];

const VIDEO_FORMATS = [
  { id: "9:16", label: "Vertical 9:16", ratio: "9:16", desc: "Story, TikTok & Instagram Reels" },
  { id: "4:5", label: "Feed 4:5", ratio: "4:5", desc: "Publications sponsorisées Facebook/IG" },
  { id: "16:9", label: "Horizontal 16:9", ratio: "16:9", desc: "YouTube & bannières vidéo" },
];

export default function AdBuilderStudioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(60);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const refreshCredits = async () => {
    if (!user) return;
    const supabase = createClient();
    const { data: profile } = await supabase.from("profiles").select("credits").eq("id", user.id).maybeSingle();
    if (profile && typeof profile.credits === "number") {
      setCredits(profile.credits);
    }
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/auth");
      } else {
        setUser(session.user);
        supabase
          .from("profiles")
          .select("credits")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data && typeof data.credits === "number") setCredits(data.credits);
          });
      }
      setAuthLoading(false);
    });
  }, [router]);

  // État du projet
  const [projectMode, setProjectMode] = useState<"poster" | "video">("poster");
  const [selectedFormat, setSelectedFormat] = useState<string>("1080x1350");
  const [videoDuration, setVideoDuration] = useState<number>(10);
  const [topupOpen, setTopupOpen] = useState(false);

  // Scan de site réel
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [brandKit, setBrandKit] = useState<BrandKitData | null>(null);

  // Formulaire de brief
  const [productName, setProductName] = useState("");
  const [mainOffer, setMainOffer] = useState("");
  const [hookText, setHookText] = useState("");
  const [keyBenefits, setKeyBenefits] = useState("");
  const [callToAction, setCallToAction] = useState("Commander maintenant");

  // Génération
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTaskId, setGenerationTaskId] = useState<string | null>(null);
  const [results, setResults] = useState<AdGenerationResult[]>([]);
  const [activeResult, setActiveResult] = useState<AdGenerationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Coût estimé en crédits
  const creditsCost = projectMode === "poster" ? 6 : videoDuration === 6 ? 12 : 18;

  // Lancement du scan réel du site
  const handleScanWebsite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!websiteUrl.trim()) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const res = await fetch("/api/studios/scan-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Impossible d'analyser le site.");
      }

      setBrandKit(data.brandKit);
      if (data.brandKit.title && !productName) {
        setProductName(data.brandKit.title);
      }
      if (data.brandKit.description && !mainOffer) {
        setMainOffer(data.brandKit.description);
      }
    } catch (err: any) {
      setScanError(err.message || "Erreur de connexion au serveur.");
    } finally {
      setIsScanning(false);
    }
  };

  // Lancement de la génération d'affiche ou vidéo publicitaire
  const handleGenerate = async () => {
    if (!productName.trim() && !mainOffer.trim()) {
      setErrorMsg("Veuillez renseigner le nom du produit ou l'offre.");
      return;
    }

    if (credits < creditsCost) {
      setTopupOpen(true);
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    // Compilation du prompt publicitaire optimisé
    const brandColorsDesc = brandKit ? `Brand colors: ${brandKit.colors.palette.slice(0, 3).join(", ")}. ` : "";
    const brandToneDesc = brandKit ? `Brand style: ${brandKit.tone.adjectives.join(", ")}. ` : "Modern luxury and clear typography. ";
    
    let compiledPrompt = "";
    if (projectMode === "poster") {
      compiledPrompt = `Commercial advertising poster for ${productName || "Product"}. Offer: ${mainOffer || "Special offer"}. Headline: "${hookText || productName}". Clean bold professional graphic layout, crisp typography, ${brandColorsDesc}${brandToneDesc}Call to action button: "${callToAction}". High-end editorial studio product photography, commercial lighting, 8k resolution.`;
    } else {
      compiledPrompt = `Cinematic advertising video for ${productName || "Product"}. Hook: ${hookText || mainOffer}. Dynamic commercial shots showing product details, energetic pacing, ${brandColorsDesc}${brandToneDesc}high-end commercial lighting, native audio and music, sharp product focus, ultra realistic 4k.`;
    }

    try {
      const chosenModel = projectMode === "poster" ? "gpt-image-2-5" : "seedance-2-5";
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: projectMode === "poster" ? "image" : "video",
          model: chosenModel,
          prompt: compiledPrompt,
          aspectRatio: selectedFormat.includes("x") 
            ? (selectedFormat === "1080x1920" ? "9:16" : selectedFormat === "1080x1350" ? "4:5" : "1:1")
            : selectedFormat,
          duration: projectMode === "video" ? videoDuration : undefined,
          referenceImageUrls: brandKit?.logoUrl ? [brandKit.logoUrl] : undefined,
          creditsCost,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Échec du lancement de la création.");
      }

      setGenerationTaskId(data.taskId);

      // Création d'un résultat d'affichage direct
      const fallbackMedia = projectMode === "poster"
        ? (brandKit?.images?.[0] || "/assets/studios/studio-ad-builder.jpg")
        : "/assets/studios/studio-cinema.jpg";

      const newAd: AdGenerationResult = {
        id: data.taskId || `ad_${Date.now()}`,
        type: projectMode,
        format: selectedFormat,
        headline: hookText || productName || "Campagne publicitaire",
        mediaUrl: data.resultUrl || fallbackMedia,
        cost: creditsCost,
        prompt: compiledPrompt,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setResults((prev) => [newAd, ...prev]);
      setActiveResult(newAd);
      refreshCredits();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la génération publicitaire.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--ink)]">
        <Loader2 className="size-6 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[var(--lime)] selection:text-black">
      {/* ── EN-TÊTE RESPONSIVE DU STUDIO AD BUILDER ── */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--line)] px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/studios"
            className="flex items-center justify-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-full bg-[var(--surf)] border border-[var(--line)] shadow-card text-[12px] font-medium text-[var(--ink)] hover:border-[var(--ink)]/40 hover:bg-[var(--hover)] transition-all shrink-0"
            title="Retour au Hub des studios"
          >
            <CoolIcon name="arrow-left-sm" size={14} duotone={false} className="shrink-0 text-[var(--ink)]" />
            <span className="hidden sm:inline font-sans">Retour aux studios</span>
          </Link>

          <div className="h-4 w-px bg-[var(--line)] hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[var(--lime)] text-[#171717] font-mono text-[10.5px] font-semibold">
              02
            </span>
            <h1 className="font-heading text-[17px] sm:text-[19px] font-normal tracking-tight">
              Ad Builder <span className="font-serif italic text-muted-foreground text-[14px]">Studio</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setTopupOpen(true)}
            className="h-8 px-3 rounded-full bg-[var(--surf)] border border-[var(--line)] shadow-card flex items-center gap-1.5 text-[12px] font-mono font-medium hover:border-[var(--line-strong)] transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-[#D8FF64] ring-2 ring-emerald-500/20" />
            <span>{credits} cr</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* ── CORPS DU STUDIO AD BUILDER (SPLIT SCREEN WORKSPACE) ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLONNE GAUCHE (7 COLONNES) : CONFIGURATION DU PROJET & SCAN DE SITE */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* SÉLECTEUR DE TYPE DE SORTIE (AFFICHE vs VIDÉO PUB) */}
          <div className="p-1.5 rounded-2xl bg-[var(--surf)] border border-[var(--line)] shadow-card flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                setProjectMode("poster");
                setSelectedFormat("1080x1350");
              }}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-[13px] font-medium transition-all",
                projectMode === "poster"
                  ? "bg-[var(--mn)] text-[var(--ink)] font-semibold shadow-xs"
                  : "text-[var(--mute)] hover:text-[var(--ink)]"
              )}
            >
              <ImageIcon className="size-4" />
              <span>Affiche publicitaire (Print & Digital)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setProjectMode("video");
                setSelectedFormat("9:16");
              }}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-[13px] font-medium transition-all",
                projectMode === "video"
                  ? "bg-[var(--mn)] text-[var(--ink)] font-semibold shadow-xs"
                  : "text-[var(--mute)] hover:text-[var(--ink)]"
              )}
            >
              <Film className="size-4" />
              <span>Vidéo marketing (TikTok, Reel, Ad)</span>
            </button>
          </div>

          {/* SCAN DE SITE RÉEL & BRAND KIT INTÉGRÉ */}
          <div className="p-5 rounded-2xl bg-[var(--surf)] border border-[var(--line)] shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-[var(--mute)]" />
                <h2 className="text-[14px] font-semibold text-[var(--ink)]">
                  Scanner la marque de votre site web
                </h2>
              </div>
              {brandKit && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                  <Check className="size-3" />
                  Marque synchronisée
                </span>
              )}
            </div>

            <p className="text-[12.5px] text-[var(--mute)] leading-relaxed">
              Entrez l&apos;URL de votre site ou boutique (Shopify, SaaS, e-commerce). Notre backend extrait
              automatiquement vos couleurs, vos polices, votre logo et votre ton de communication.
            </p>

            <form onSubmit={handleScanWebsite} className="flex gap-2">
              <Input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://votre-marque.com"
                className="flex-1 h-10 rounded-xl bg-[var(--bg)] border-[var(--line)] text-[13px]"
              />
              <Button
                type="submit"
                disabled={isScanning || !websiteUrl.trim()}
                className="h-10 px-4 rounded-xl bg-[var(--lime)] text-[#171717] hover:bg-[#cbf54a] font-medium text-[12.5px] shrink-0"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    Analyse en direct…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5 mr-1.5" />
                    Analyser
                  </>
                )}
              </Button>
            </form>

            {scanError && (
              <p className="text-[12px] text-red-500 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                {scanError}
              </p>
            )}

            {/* APERÇU DU BRAND KIT SCANNÉ */}
            {brandKit && (
              <div className="p-4 rounded-xl bg-[var(--mn)]/60 border border-[var(--line)] flex flex-col gap-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[13px] text-[var(--ink)]">
                    {brandKit.domain}
                  </span>
                  <span className="text-[11px] text-[var(--mute)]">
                    Scanné avec succès
                  </span>
                </div>

                {/* Swatches de couleurs */}
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-mono text-[var(--mute)] block mb-1.5">
                    Palette de marque extraite
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {brandKit.colors.palette.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--surf)] border border-[var(--line)]"
                        title={color}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-mono text-[10.5px] text-[var(--ink)]">
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Polices & Ton */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-mono text-[var(--mute)] block mb-1">
                      Typographies
                    </span>
                    <span className="text-[12px] font-medium text-[var(--ink)]">
                      {brandKit.fonts.heading} / {brandKit.fonts.body}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-mono text-[var(--mute)] block mb-1">
                      Ton détecté
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      {brandKit.tone.adjectives.map((adj, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-[var(--surf)] text-[10.5px] text-[var(--ink)] font-medium"
                        >
                          {adj}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FORMULAIRE DE BRIEF PUBLICITAIRE */}
          <div className="p-5 rounded-2xl bg-[var(--surf)] border border-[var(--line)] shadow-card flex flex-col gap-4">
            <h2 className="text-[14px] font-semibold text-[var(--ink)]">
              Brief & Proposition de valeur
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">
                  Nom du produit ou de la marque *
                </label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="ex: Sérum Botanique Éclat"
                  className="h-10 rounded-xl bg-[var(--bg)] border-[var(--line)] text-[13px]"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">
                  Accroche principale ou slogan
                </label>
                <Input
                  value={hookText}
                  onChange={(e) => setHookText(e.target.value)}
                  placeholder="ex: Illuminez votre peau en 7 jours"
                  className="h-10 rounded-xl bg-[var(--bg)] border-[var(--line)] text-[13px]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">
                Offre commerciale ou bénéfices clés
              </label>
              <textarea
                value={mainOffer}
                onChange={(e) => setMainOffer(e.target.value)}
                placeholder="ex: -20% sur la première commande avec le code ECLAT. Formule 100% naturelle certifiée bio, fabriquée en France."
                rows={3}
                className="w-full rounded-xl bg-[var(--bg)] border border-[var(--line)] p-3 text-[13px] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">
                  Appel à l&apos;action (Bouton CTA)
                </label>
                <Input
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  placeholder="Commander maintenant"
                  className="h-10 rounded-xl bg-[var(--bg)] border-[var(--line)] text-[13px]"
                />
              </div>

              {projectMode === "video" && (
                <div>
                  <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">
                    Durée de la vidéo pub
                  </label>
                  <div className="flex gap-1.5 h-10">
                    {[6, 10, 15].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setVideoDuration(d)}
                        className={cn(
                          "flex-1 rounded-xl text-[12px] font-medium border transition-all",
                          videoDuration === d
                            ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)] font-semibold"
                            : "bg-[var(--bg)] text-[var(--mute)] border-[var(--line)] hover:text-[var(--ink)]"
                        )}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SÉLECTEUR DE FORMAT RÉEL */}
            <div>
              <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1.5">
                Format de cadrage
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(projectMode === "poster" ? POSTER_FORMATS : VIDEO_FORMATS).map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={cn(
                      "p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between",
                      selectedFormat === fmt.id
                        ? "bg-[var(--mn)] border-[var(--ink)] shadow-xs"
                        : "bg-[var(--bg)] border-[var(--line)] hover:border-[var(--line-strong)]"
                    )}
                  >
                    <span className="font-semibold text-[12px] text-[var(--ink)] block">
                      {fmt.label}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--mute)] mt-1 block">
                      {fmt.ratio}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <p className="text-[12px] text-red-500 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                {errorMsg}
              </p>
            )}

            {/* BOUTON DE LANCEMENT FONCTIONNEL */}
            <div className="pt-2 flex items-center justify-between border-t border-[var(--line)]">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-[var(--mute)]">Coût du rendu :</span>
                <span className="font-mono font-semibold text-[13px] text-[var(--ink)]">
                  {creditsCost} crédits
                </span>
                <span className="text-[11px] text-[var(--mute)]">
                  ({projectMode === "poster" ? "Modèle GPT Image 2.5" : "Modèle Seedance 2.5 Pub"})
                </span>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (!productName && !mainOffer)}
                className="h-11 px-6 rounded-xl bg-[var(--lime)] text-[#171717] hover:bg-[#cbf54a] font-semibold text-[13px] shadow-sm transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Création en cours…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2" />
                    Générer la publicité
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* COLONNE DROITE (5 COLONNES) : CANVAS DE PRÉVISUALISATION & RÉSULTATS */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-[var(--surf)] border border-[var(--line)] shadow-card flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-[var(--mute)]" />
                <h3 className="text-[14px] font-semibold text-[var(--ink)]">
                  Atelier & Prévisualisation
                </h3>
              </div>
              {results.length > 0 && (
                <span className="text-[11px] font-mono text-[var(--mute)]">
                  {results.length} création{results.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* ZONE D'AFFICHAGE DU RÉSULTAT ACTIF */}
            <div className="flex-1 min-h-[380px] rounded-xl bg-[var(--mn)]/40 border border-dashed border-[var(--line)] flex flex-col items-center justify-center p-4 relative overflow-hidden group">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--lime)] flex items-center justify-center text-[#171717] animate-pulse">
                    <Sparkles className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-heading text-[17px] font-normal text-[var(--ink)]">
                      Composition publicitaire en cours…
                    </h4>
                    <p className="text-[12px] text-[var(--mute)] max-w-xs mt-1">
                      Harmonisation de la typographie, respect de la charte de couleurs et rendu haute définition.
                    </p>
                  </div>
                </div>
              ) : activeResult ? (
                <div className="size-full flex flex-col items-center justify-center relative">
                  <img
                    src={activeResult.mediaUrl}
                    alt={activeResult.headline}
                    className="max-h-[420px] w-auto max-w-full rounded-lg shadow-raised object-contain"
                  />
                  
                  {/* BARRE D'ACTIONS AU SURVOL */}
                  <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-[var(--surf)]/90 backdrop-blur-md border border-[var(--line)] flex items-center justify-between shadow-card opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[11.5px] font-medium truncate max-w-[150px]">
                      {activeResult.headline}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={activeResult.mediaUrl}
                        download={`ad-${activeResult.id}.png`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[var(--mn)] hover:bg-[var(--line)] text-[var(--ink)] transition-colors"
                        title="Télécharger"
                      >
                        <Download className="size-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(activeResult.prompt);
                        }}
                        className="p-1.5 rounded-lg bg-[var(--mn)] hover:bg-[var(--line)] text-[var(--ink)] transition-colors"
                        title="Copier le prompt publicitaire"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center p-6 text-[var(--mute)]">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--surf)] border border-[var(--line)] flex items-center justify-center">
                    <ImageIcon className="size-6 text-[var(--mute)]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[var(--ink)]">
                      Aucune publicité générée pour l&apos;instant
                    </p>
                    <p className="text-[12px] text-[var(--mute)] mt-1 max-w-xs">
                      Renseignez votre offre ou analysez votre site, puis cliquez sur &quot;Générer la publicité&quot;.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* MINI-GALERIE DES CRÉATIONS RÉCENTES DU PROJET */}
            {results.length > 1 && (
              <div className="mt-4 pt-3 border-t border-[var(--line)]">
                <span className="text-[11px] uppercase tracking-wider font-mono text-[var(--mute)] block mb-2">
                  Historique de la session
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {results.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setActiveResult(res)}
                      className={cn(
                        "w-14 h-14 rounded-lg overflow-hidden border shrink-0 transition-all",
                        activeResult?.id === res.id
                          ? "border-[var(--lime)] ring-2 ring-[var(--lime)]/30 scale-105"
                          : "border-[var(--line)] opacity-70 hover:opacity-100"
                      )}
                    >
                      <img
                        src={res.mediaUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <TopupModal
        isOpen={topupOpen}
        onClose={() => setTopupOpen(false)}
        initialPackId="pack_createur"
        onSuccess={() => {
          setTopupOpen(false);
          refreshCredits();
        }}
      />
    </div>
  );
}

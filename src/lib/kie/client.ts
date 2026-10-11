/**
 * Client officiel KIE.ai pour likyAI
 * Documentation d'intégration : api.kie.ai & kieai.redpandaai.co
 */

export interface KieModelSummary {
  model: string;
  slug: string;
  title: string;
  provider: string;
  taskType: string[];
  description: string | null;
  pricingDesc: string;
}

export interface KieTaskResponse {
  taskId: string;
  recordId?: string;
}

export interface KieRecordInfo {
  taskId: string;
  model: string;
  state: "waiting" | "queuing" | "generating" | "success" | "fail";
  successFlag: number;
  costTime?: number;
  creditsConsumed?: number;
  failCode?: string | null;
  failMsg?: string | null;
  response?: {
    resultUrls?: string[];
    data?: Array<{
      audio_url?: string;
      stream_audio_url?: string;
      image_url?: string;
      title?: string;
      duration?: number;
    }>;
    resultObject?: {
      lyricsData?: Array<{ text: string }>;
    };
  };
}

const KIE_BASE_URL = "https://api.kie.ai";

/**
 * Récupère la clé API KIE depuis les variables d'environnement
 */
export function getKieApiKey(): string | undefined {
  return process.env.KIE_API_KEY;
}

/**
 * Liste les modèles KIE depuis le catalogue officiel
 */
export async function fetchKieModels(params?: {
  taskType?: string;
  provider?: string;
  q?: string;
}): Promise<KieModelSummary[]> {
  const apiKey = getKieApiKey();
  if (!apiKey) {
    return [];
  }

  const queryParams = new URLSearchParams();
  if (params?.taskType) queryParams.set("taskType", params.taskType);
  if (params?.provider) queryParams.set("provider", params.provider);
  if (params?.q) queryParams.set("q", params.q);

  const url = `${KIE_BASE_URL}/api/v1/models${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 3600 }, // Cache Next.js 1h
    });

    if (!res.ok) {
      console.warn(`[KIE] fetchModels failed with HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (data.code === 200 && data.data?.models) {
      return data.data.models;
    }
    return [];
  } catch (err) {
    console.error("[KIE] Error fetching models from KIE:", err);
    return [];
  }
}

/**
 * Récupère le schéma OpenAPI complet d'un modèle
 */
export async function fetchKieModelSchema(model: string) {
  const apiKey = getKieApiKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(`${KIE_BASE_URL}/api/v1/models/${model}/schema`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const data = await res.json();
    if (data.code === 200) {
      return data.data?.openapi;
    }
    return null;
  } catch (err) {
    console.error(`[KIE] Error fetching schema for ${model}:`, err);
    return null;
  }
}

/**
 * Normalise les identifiants de modèles LikyAI vers les slugs officiels KIE.ai
 */
export function resolveKieModel(tool: "image" | "video" | "music" | "voice", rawModelId?: string): string {
  const m = (rawModelId || "").toLowerCase();

  if (tool === "image") {
    if (m.includes("banana") || m.includes("nano")) return "nano-banana-2";
    if (m.includes("z-image") || m.includes("soul") || m.includes("turbo")) return "z-image";
    if (m.includes("seed") || m.includes("dream")) return "seedream/5-lite-text-to-image";
    if (m.includes("gpt")) return "gpt-image-2-text-to-image";
    return "nano-banana-2";
  }

  if (tool === "video") {
    if (m.includes("seedance") || m.includes("bytedance")) return "bytedance/seedance-2-mini";
    if (m.includes("kling")) return "kling/v3-turbo-text-to-video";
    if (m.includes("wan")) return "wan/2-7-image";
    if (m.includes("veo") || m.includes("omni")) return "bytedance/seedance-2-mini";
    return "bytedance/seedance-2-mini";
  }

  if (tool === "music") {
    return "ai-music-api/generate";
  }

  if (tool === "voice") {
    return "elevenlabs/text-to-speech-turbo-2-5";
  }

  return rawModelId || "nano-banana-2";
}

/**
 * Nettoie et prépare le payload 'input' selon le schéma du modèle KIE
 */
export function buildKieInputPayload(
  tool: "image" | "video" | "music" | "voice",
  kieModel: string,
  prompt: string,
  params?: Record<string, unknown>
): Record<string, unknown> {
  const p = params || {};

  // Extraction propre du ratio d'aspect
  let aspectRatio = "1:1";
  const rawFormat = (p.format || p.Format || p.Plateforme || p.plateforme || "") as string;
  if (rawFormat.includes("9:16") || rawFormat.includes("TikTok") || rawFormat.includes("Reels") || rawFormat.includes("Shorts") || rawFormat.includes("Vertical")) {
    aspectRatio = "9:16";
  } else if (rawFormat.includes("16:9") || rawFormat.includes("YouTube") || rawFormat.includes("Paysage")) {
    aspectRatio = "16:9";
  } else if (rawFormat.includes("4:5") || rawFormat.includes("Portrait") || rawFormat.includes("Facebook")) {
    aspectRatio = "4:5";
  } else if (rawFormat.includes("3:4")) {
    aspectRatio = "3:4";
  } else if (rawFormat.includes("4:3")) {
    aspectRatio = "4:3";
  }

  // Modèles Image
  if (tool === "image") {
    if (kieModel === "nano-banana-2") {
      const res = (p.qual || p.resolution || "1K") as string;
      const validRes = ["1K", "2K", "4K"].includes(res) ? res : "1K";
      return {
        prompt,
        aspect_ratio: aspectRatio,
        resolution: validRes,
        output_format: "jpg",
      };
    }

    if (kieModel === "z-image") {
      return {
        prompt,
        aspect_ratio: aspectRatio,
      };
    }

    if (kieModel.includes("seedream")) {
      const q = (p.qual || "basic") as string;
      const quality = q.includes("4K") ? "ultra" : q.includes("2K") ? "high" : "basic";
      return {
        prompt,
        aspect_ratio: aspectRatio,
        quality,
        output_format: "png",
      };
    }

    return {
      prompt,
      aspect_ratio: aspectRatio,
    };
  }

  // Modèles Vidéo
  if (tool === "video") {
    const rawDur = String(p["Durée"] || p.duration || "5");
    const durSec = parseInt(rawDur.replace(/\D/g, "")) || 5;

    if (kieModel.includes("seedance")) {
      return {
        prompt,
        aspect_ratio: aspectRatio,
        duration: Math.min(15, Math.max(4, durSec)),
        resolution: "480p",
        generate_audio: false,
      };
    }

    if (kieModel.includes("kling")) {
      return {
        prompt,
        duration: String(Math.min(15, Math.max(3, durSec))),
        aspect_ratio: ["1:1", "9:16", "16:9"].includes(aspectRatio) ? aspectRatio : "16:9",
        resolution: "720p",
      };
    }

    return {
      prompt,
      aspect_ratio: aspectRatio,
      duration: durSec,
    };
  }

  // Musique (Suno V6)
  if (tool === "music") {
    return {
      prompt,
      custom_mode: false,
      instrumental: false,
      model: "V6",
    };
  }

  // Voix (ElevenLabs)
  if (tool === "voice") {
    return {
      text: prompt,
      voice_id: "EkK5I93UQWFDigLMpZcX", // Bella - Voix douce et naturelle
      stability: 0.5,
      similarity_boost: 0.75,
    };
  }

  return { prompt };
}

/**
 * Crée une tâche de génération sur KIE
 */
export async function createKieTask(
  model: string,
  input: Record<string, unknown>,
  callBackUrl?: string
): Promise<{ taskId: string } | { error: string; code?: number }> {
  const apiKey = getKieApiKey();
  if (!apiKey) {
    return { error: "Clé KIE_API_KEY manquante", code: 401 };
  }

  try {
    const res = await fetch(`${KIE_BASE_URL}/api/v1/jobs/createTask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input,
        ...(callBackUrl ? { callBackUrl } : {}),
      }),
    });

    const data = await res.json();
    if (data.code !== 200) {
      return {
        error: data.msg || `Erreur KIE (code ${data.code})`,
        code: data.code,
      };
    }

    return { taskId: data.data.taskId };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Erreur de connexion à KIE" };
  }
}

/**
 * Interroge l'état d'avancement d'une tâche de génération KIE
 */
export async function pollKieTask(
  taskId: string
): Promise<KieRecordInfo | { error: string; code?: number }> {
  const apiKey = getKieApiKey();
  if (!apiKey) {
    return { error: "Clé KIE_API_KEY manquante", code: 401 };
  }

  try {
    const res = await fetch(
      `${KIE_BASE_URL}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const data = await res.json();
    if (data.code !== 200) {
      return {
        error: data.msg || `Erreur statut KIE (code ${data.code})`,
        code: data.code,
      };
    }

    const info = data.data as KieRecordInfo & { resultJson?: string };

    // Si resultUrls n'est pas directement sous response, mais dans resultJson
    if (!info.response?.resultUrls && info.resultJson) {
      try {
        const parsed = JSON.parse(info.resultJson);
        if (Array.isArray(parsed.resultUrls) && parsed.resultUrls.length > 0) {
          info.response = {
            ...(info.response || {}),
            resultUrls: parsed.resultUrls,
          };
        } else if (Array.isArray(parsed.data) && parsed.data[0]?.audio_url) {
          info.response = {
            ...(info.response || {}),
            resultUrls: [parsed.data[0].audio_url],
            data: parsed.data,
          };
        }
      } catch {
        // format non-JSON ignoré
      }
    }

    return info;
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Erreur de statut KIE" };
  }
}

/**
 * Récupère le solde de crédits KIE restant
 */
export async function getKieBalance(): Promise<number | null> {
  const apiKey = getKieApiKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(`${KIE_BASE_URL}/api/v1/chat/credit`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const data = await res.json();
    if (data.code === 200 && typeof data.data === "number") {
      return data.data;
    }
    return null;
  } catch {
    return null;
  }
}

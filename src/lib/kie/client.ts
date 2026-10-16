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
export function resolveKieModel(
  tool: "image" | "video" | "music" | "voice",
  rawModelId?: string,
  opts?: { hasReferenceImage?: boolean }
): string {
  const m = (rawModelId || "").toLowerCase();

  if (tool === "image") {
    return "google/nano-banana";
  }

  if (tool === "video") {
    if (
      opts?.hasReferenceImage ||
      m.includes("i2v") ||
      m.includes("image-to-video") ||
      m.includes("genjutsu") ||
      m.includes("motion")
    ) {
      return "bytedance/v1-lite-image-to-video";
    }
    return "bytedance/v1-lite-text-to-video";
  }

  if (tool === "music") {
    return "ai-music-api/generate";
  }

  if (tool === "voice") {
    return "elevenlabs/text-to-speech-turbo-2-5";
  }

  return "google/nano-banana";
}

/**
 * Nettoie et prépare le payload 'input' selon le schéma vérifié du modèle KIE
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
  const rawFormat = (p.format || p.Format || p.Plateforme || p.plateforme || p.aspectRatio || "") as string;
  if (
    rawFormat.includes("9:16") ||
    rawFormat.includes("TikTok") ||
    rawFormat.includes("Reels") ||
    rawFormat.includes("Shorts") ||
    rawFormat.includes("Vertical")
  ) {
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

  // Modèles Image (google/nano-banana)
  if (tool === "image") {
    const validRatios = ["1:1", "9:16", "16:9", "3:4", "4:3", "4:5"];
    return {
      prompt,
      aspect_ratio: validRatios.includes(aspectRatio) ? aspectRatio : "1:1",
      output_format: "png",
    };
  }

  // Modèles Vidéo (bytedance/v1-lite-*)
  if (tool === "video") {
    const rawDur = String(p["Durée"] || p.duration || "5");
    const durSec = parseInt(rawDur.replace(/\D/g, "")) || 5;
    const durationStr = durSec > 7 ? "10" : "5";
    const validVideoRatios = ["16:9", "4:3", "1:1", "3:4", "9:16", "9:21"];
    const validRatio = validVideoRatios.includes(aspectRatio) ? aspectRatio : "16:9";

    const refImage =
      (p.image_url as string) ||
      (Array.isArray(p.image_urls) ? (p.image_urls[0] as string) : undefined) ||
      (Array.isArray(p.referenceImageUrls) ? (p.referenceImageUrls[0] as string) : undefined);

    if (kieModel.includes("image-to-video") && refImage) {
      return {
        prompt: prompt || "Cinematic fluid camera motion and realistic texture movement",
        image_url: refImage,
        resolution: "720p",
        duration: durationStr,
      };
    }

    return {
      prompt,
      aspect_ratio: validRatio,
      resolution: "720p",
      duration: durationStr,
    };
  }

  // Musique (Suno ai-music-api/generate)
  if (tool === "music") {
    return {
      prompt,
      custom_mode: false,
      instrumental: false,
      model: "V3_5",
    };
  }

  // Voix (ElevenLabs)
  if (tool === "voice") {
    return {
      text: prompt,
      voice_id: "EkK5I93UQWFDigLMpZcX", // Bella
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

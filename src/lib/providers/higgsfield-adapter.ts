import {
  ProviderAdapter,
  ProviderId,
  ProviderEstimation,
  ProviderSubmitOptions,
  ProviderStatusResult,
} from "./types";
import { persistMediaToSupabase, createSignedMediaUrl } from "@/lib/storage/supabase-storage";

const HIGGSFIELD_BASE_URL = "https://api.higgsfield.ai";

export class HiggsfieldAdapter implements ProviderAdapter {
  readonly id: ProviderId = "higgsfield";

  private getAuth(): { keyId: string; keySecret: string } | null {
    const creds = process.env.HF_CREDENTIALS || process.env.HF_KEY;
    if (creds && creds.includes(":")) {
      const [keyId, keySecret] = creds.split(":");
      return { keyId, keySecret };
    }
    const keyId = process.env.HF_API_KEY;
    const keySecret = process.env.HF_API_SECRET;
    if (keyId && keySecret) return { keyId, keySecret };
    return null;
  }

  private resolveEndpoint(modelId: string, opts: ProviderSubmitOptions): string {
    // Si modelId est déjà un endpoint explicite Higgsfield
    if (modelId.includes("/")) return modelId;

    if (modelId === "motion_transfer" || opts.referenceVideoUrl) {
      return "higgsfiled/genjutsu/motion-transfer/v1.0";
    }
    if (modelId === "restyle") {
      return "higgsfield/genjutsu/restyle/v1.0";
    }
    if (modelId === "soul_2" || modelId === "soul") {
      return "higgsfield-ai/soul/v2/standard";
    }
    if (modelId === "ai_influencer") {
      return "higgsfield-ai/ai-influencer/v1.0";
    }
    if (modelId === "marketing_studio_image") {
      return "higgsfield-ai/marketing-studio-image/v1.0";
    }
    if (modelId === "cinema_studio_4") {
      return "higgsfield-ai/cinema-studio-4/v1.0";
    }

    // Modèle par défaut pour la vidéo : Seedance 2.5
    if (opts.referenceImageUrls && opts.referenceImageUrls.length > 0) {
      return "bytedance/seedance-2.5/reference-to-video";
    }
    return "bytedance/seedance-2.5/text-to-video";
  }

  async estimate(
    modelId: string,
    params: Record<string, any>
  ): Promise<ProviderEstimation> {
    const auth = this.getAuth();
    const endpointId = this.resolveEndpoint(modelId, { params });

    if (!auth) {
      const defaultCredits = params?.duration && params.duration > 8 ? 24 : 16;
      return { credits: defaultCredits, usd: defaultCredits * 0.005 };
    }

    try {
      const res = await fetch(`${HIGGSFIELD_BASE_URL}/estimate/${endpointId}`, {
        method: "POST",
        headers: {
          Authorization: `Key ${auth.keyId}:${auth.keySecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: params.prompt || "test",
          aspect_ratio: params.aspectRatio || "16:9",
          duration: params.duration || 5,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const usdVal = parseFloat(data.usd || "0.08");
        // Règle de marge likyAI : 1 crédit ≈ 0.005$ d'API
        const calculatedCredits = Math.max(2, Math.ceil(usdVal / 0.005));
        return {
          credits: calculatedCredits,
          usd: usdVal,
        };
      }
    } catch (err) {
      console.warn("[Higgsfield] /estimate non joignable, fallback barème interne:", err);
    }

    const fallbackCredits = params?.duration && params.duration > 8 ? 24 : 16;
    return { credits: fallbackCredits, usd: fallbackCredits * 0.005 };
  }

  async submit(
    modelId: string,
    prompt: string,
    opts: ProviderSubmitOptions
  ): Promise<{
    requestId: string;
    mode: "live" | "demo";
    statusUrl?: string;
    cancelUrl?: string;
    raw?: any;
  }> {
    const auth = this.getAuth();

    if (!auth) {
      throw new Error("Higgsfield API credentials non configurés.");
    }

    const endpointId = this.resolveEndpoint(modelId, opts);

    // Préparation des URLs publiques signées pour les médias de référence
    const signedImageUrls: string[] = [];
    if (opts.referenceImageUrls) {
      for (const rawUrl of opts.referenceImageUrls) {
        const signed = await createSignedMediaUrl(rawUrl, 3600);
        signedImageUrls.push(signed);
      }
    }

    let signedVideoUrl: string | undefined = undefined;
    if (opts.referenceVideoUrl) {
      signedVideoUrl = await createSignedMediaUrl(opts.referenceVideoUrl, 3600);
    }

    // Construction du payload adapté à l'endpoint Higgsfield
    const payload: Record<string, any> = {
      prompt,
      aspect_ratio: opts.aspectRatio || "16:9",
      duration: opts.duration || 5,
      resolution: opts.resolution || "720p",
      ...opts.params,
    };

    if (signedImageUrls.length > 0) {
      payload.image_urls = signedImageUrls;
    }
    if (signedVideoUrl) {
      payload.video_url = signedVideoUrl;
    }

    // URL avec webhook si configuré
    let submitUrl = `${HIGGSFIELD_BASE_URL}/${endpointId}`;
    if (opts.webhookUrl) {
      submitUrl += `?hf_webhook=${encodeURIComponent(opts.webhookUrl)}`;
    }

    const headers: Record<string, string> = {
      Authorization: `Key ${auth.keyId}:${auth.keySecret}`,
      "Content-Type": "application/json",
    };

    if (opts.idempotencyKey) {
      headers["Idempotency-Key"] = opts.idempotencyKey;
    }

    console.log(`[Higgsfield] Soumission tâche à ${endpointId}:`, JSON.stringify(payload));

    const res = await fetch(submitUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      // Détection de saturation de concurrence (HTTP 400 "Maximum number of concurrent requests reached")
      if (res.status === 400 && data.detail?.includes("concurrent")) {
        throw new Error(`[Higgsfield Concurrency Exceeded] ${data.detail}`);
      }
      throw new Error(`[Higgsfield API Error] ${data.detail || data.error || res.statusText} (code: ${res.status})`);
    }

    const requestId = data.request_id || data.id;

    return {
      requestId,
      mode: "live",
      statusUrl: data.status_url,
      cancelUrl: data.cancel_url,
      raw: data,
    };
  }

  async status(requestId: string): Promise<ProviderStatusResult> {
    const auth = this.getAuth();
    if (!auth) {
      return { state: "waiting" };
    }

    try {
      const res = await fetch(`${HIGGSFIELD_BASE_URL}/requests/${requestId}/status`, {
        headers: {
          Authorization: `Key ${auth.keyId}:${auth.keySecret}`,
        },
      });

      if (!res.ok) {
        return {
          state: "fail",
          error: `Erreur HTTP ${res.status} lors de la lecture du statut`,
        };
      }

      const data = await res.json();
      const rawStatus = (data.status || "").toLowerCase();

      // Mapping des états Higgsfield -> Standard likyAI
      let state: ProviderStatusResult["state"] = "waiting";
      if (rawStatus === "completed") state = "success";
      else if (rawStatus === "in_progress") state = "running";
      else if (rawStatus === "queued") state = "waiting";
      else if (rawStatus === "failed") state = "fail";
      else if (rawStatus === "nsfw") state = "nsfw";
      else if (rawStatus === "canceled") state = "canceled";

      let outputs: ProviderStatusResult["outputs"] = [];

      // Si le média est prêt, le transférer IMMÉDIATEMENT vers Supabase Storage
      // pour éviter la perte après la limite de rétention de 7 jours de Higgsfield !
      if (state === "success") {
        const rawMediaUrls: string[] = [];

        // Recherche des vidéos
        if (data.payload?.video?.url) {
          rawMediaUrls.push(data.payload.video.url);
        } else if (data.video?.url) {
          rawMediaUrls.push(data.video.url);
        }

        // Recherche des images
        if (Array.isArray(data.payload?.images)) {
          for (const img of data.payload.images) {
            if (img.url) rawMediaUrls.push(img.url);
          }
        } else if (Array.isArray(data.images)) {
          for (const img of data.images) {
            if (img.url) rawMediaUrls.push(img.url);
          }
        }

        // Sauvegarde dans Supabase Storage
        const persisted = await Promise.all(
          rawMediaUrls.map(async (rawUrl) => {
            const isVideo = rawUrl.includes(".mp4") || rawUrl.includes("video");
            const type: "image" | "video" = isVideo ? "video" : "image";

            const storageRes = await persistMediaToSupabase(rawUrl, "generations");
            return {
              type,
              url: storageRes.permanentUrl || rawUrl,
            };
          })
        );

        outputs = persisted;
      }

      return {
        state,
        outputs,
        error: data.error || (state === "nsfw" ? "Contenu modéré (NSFW)" : undefined),
        rawResponse: data,
      };
    } catch (err: any) {
      console.error(`[Higgsfield] Erreur polling status ${requestId}:`, err);
      return {
        state: "fail",
        error: err.message || "Impossible de contacter l'API Higgsfield",
      };
    }
  }

  async cancel(requestId: string): Promise<boolean> {
    const auth = this.getAuth();
    if (!auth) return false;

    try {
      const res = await fetch(`${HIGGSFIELD_BASE_URL}/requests/${requestId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Key ${auth.keyId}:${auth.keySecret}`,
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async verifyWebhook(req: Request): Promise<{
    requestId: string;
    isValid: boolean;
    statusResult?: ProviderStatusResult;
  }> {
    try {
      // 1. Validation du jeton secret dans l'URL
      const url = new URL(req.url);
      const token = url.searchParams.get("t");
      const expectedToken = process.env.HF_WEBHOOK_SECRET || "likyai-hf-secret";

      if (token !== expectedToken) {
        console.warn("[Higgsfield Webhook] Jeton secret invalide");
        return { requestId: "", isValid: false };
      }

      const body = await req.json();
      const requestId = body.request_id || body.id;

      if (!requestId) {
        return { requestId: "", isValid: false };
      }

      // 2. RÈGLE CRITIQUE : Relecture authentifiée auprès de Higgsfield
      // Ne jamais faire confiance aveugle au corps reçu sans signature
      const verifiedStatus = await this.status(requestId);

      return {
        requestId,
        isValid: true,
        statusResult: verifiedStatus,
      };
    } catch (err) {
      console.error("[Higgsfield Webhook] Exception verifyWebhook:", err);
      return { requestId: "", isValid: false };
    }
  }
}

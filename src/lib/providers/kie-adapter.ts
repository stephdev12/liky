import {
  ProviderAdapter,
  ProviderId,
  ProviderEstimation,
  ProviderSubmitOptions,
  ProviderStatusResult,
} from "./types";
import {
  createKieTask,
  pollKieTask,
  getKieApiKey,
  resolveKieModel,
  buildKieInputPayload,
} from "@/lib/kie/client";
import { persistMediaToSupabase } from "@/lib/storage/supabase-storage";

export class KieAdapter implements ProviderAdapter {
  readonly id: ProviderId = "kie";

  async estimate(
    modelId: string,
    params: Record<string, any>
  ): Promise<ProviderEstimation> {
    // KIE utilise une tarification par paliers de crédits fixes
    const defaultCost = params?.duration && params.duration > 5 ? 24 : 16;
    return {
      credits: params?.creditsCost || defaultCost,
      usd: ((params?.creditsCost || defaultCost) * 0.005),
    };
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
    const apiKey = getKieApiKey();

    if (!apiKey) {
      // Mode simulation / démo
      const simTaskId = `sim-kie-${Date.now()}`;
      return {
        requestId: simTaskId,
        mode: "demo",
      };
    }

    const officialKieModel = resolveKieModel(opts.params?.tool || "video", modelId);
    const inputPayload = buildKieInputPayload(
      opts.params?.tool || "video",
      officialKieModel,
      prompt,
      {
        ...opts.params,
        aspectRatio: opts.aspectRatio,
        duration: opts.duration,
        image_urls: opts.referenceImageUrls,
      }
    );

    const result = await createKieTask(officialKieModel, inputPayload, opts.webhookUrl);

    if ("error" in result) {
      throw new Error(`[KIE API Error] ${result.error} (code: ${result.code})`);
    }

    return {
      requestId: result.taskId,
      mode: "live",
      raw: result,
    };
  }

  async status(requestId: string): Promise<ProviderStatusResult> {
    const record = await pollKieTask(requestId);

    if ("error" in record) {
      return {
        state: "fail",
        error: record.error,
        failCode: String(record.code),
      };
    }

    const stateMap: Record<string, ProviderStatusResult["state"]> = {
      waiting: "waiting",
      queuing: "waiting",
      generating: "running",
      success: "success",
      fail: "fail",
    };

    const state = stateMap[record.state] || "waiting";

    // Si terminé avec succès, extraire les URLs de résultat et les persister dans Supabase Storage
    let outputs: ProviderStatusResult["outputs"] = [];
    if (state === "success") {
      const rawUrls: string[] = [];

      if (record.response?.resultUrls && record.response.resultUrls.length > 0) {
        rawUrls.push(...record.response.resultUrls);
      } else if (record.response?.data) {
        for (const item of record.response.data) {
          if (item.image_url) rawUrls.push(item.image_url);
          if (item.audio_url) rawUrls.push(item.audio_url);
          if (item.stream_audio_url) rawUrls.push(item.stream_audio_url);
        }
      }

      // Persistance automatique vers Supabase Storage pour rétention durable
      const persistedOutputs = await Promise.all(
        rawUrls.map(async (url) => {
          const isVideo = url.includes(".mp4") || url.includes("video");
          const isAudio = url.includes(".mp3") || url.includes(".wav") || url.includes("audio");
          const type: "image" | "video" | "audio" = isVideo ? "video" : isAudio ? "audio" : "image";

          // Sauvegarde dans Supabase Storage
          const storageRes = await persistMediaToSupabase(url, "generations");
          return {
            type,
            url: storageRes.permanentUrl || url,
          };
        })
      );

      outputs = persistedOutputs;
    }

    return {
      state,
      outputs,
      creditsConsumed: record.creditsConsumed,
      error: record.failMsg || undefined,
      failCode: record.failCode || undefined,
      rawResponse: record,
    };
  }

  async cancel(_requestId: string): Promise<boolean> {
    // kie.ai n'expose pas de méthode d'annulation publique documentée
    return false;
  }

  async verifyWebhook(req: Request): Promise<{
    requestId: string;
    isValid: boolean;
    statusResult?: ProviderStatusResult;
  }> {
    try {
      const body = await req.json();
      const taskId = body.taskId || body.data?.taskId;
      if (!taskId) {
        return { requestId: "", isValid: false };
      }

      // Relecture de l'état officiel auprès de KIE
      const currentStatus = await this.status(taskId);
      return {
        requestId: taskId,
        isValid: true,
        statusResult: currentStatus,
      };
    } catch (err) {
      console.error("[KIE Webhook] Erreur de décodage:", err);
      return { requestId: "", isValid: false };
    }
  }
}

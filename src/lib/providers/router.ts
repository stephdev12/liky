import {
  ProviderAdapter,
  ProviderId,
  ProviderEstimation,
  ProviderSubmitOptions,
  ProviderStatusResult,
} from "./types";
import { KieAdapter } from "./kie-adapter";
import { HiggsfieldAdapter } from "./higgsfield-adapter";

// Modèles exclusifs Higgsfield (introuvables sur kie.ai)
const HIGGSFIELD_EXCLUSIVE_PATTERNS = [
  "soul",
  "genjutsu",
  "motion_transfer",
  "restyle",
  "object_swap",
  "ai_influencer",
  "cinema_studio_4",
  "marketing_studio_image",
  "higgsfield",
];

// Modèles exclusifs KIE (introuvables sur Higgsfield)
const KIE_EXCLUSIVE_PATTERNS = [
  "veo",
  "suno",
  "elevenlabs",
  "gpt-image",
  "nano-banana",
  "gemini-tts",
  "topaz",
  "seedream",
];

export class ProviderRouter {
  private kieAdapter = new KieAdapter();
  private hfAdapter = new HiggsfieldAdapter();

  /**
   * Sélectionne le fournisseur cible en appliquant la consigne :
   * - Priorité par défaut sur KIE
   * - Higgsfield pour les fonctionnalités exclusives d'identité et de mouvement
   */
  public selectProvider(modelId: string, opts?: ProviderSubmitOptions): ProviderAdapter {
    const lowerModel = (modelId || "").toLowerCase();

    // 1. Si le modèle nécessite expressément les technologies exclusives Higgsfield
    if (
      opts?.referenceVideoUrl ||
      HIGGSFIELD_EXCLUSIVE_PATTERNS.some((pattern) => lowerModel.includes(pattern))
    ) {
      return this.hfAdapter;
    }

    // 2. Si le modèle est exclusif KIE
    if (KIE_EXCLUSIVE_PATTERNS.some((pattern) => lowerModel.includes(pattern))) {
      return this.kieAdapter;
    }

    // 3. Règle : Priorité sur KIE par défaut pour tous les modèles communs (ex: Seedance 2.5)
    return this.kieAdapter;
  }

  public getAdapter(providerId: ProviderId): ProviderAdapter {
    return providerId === "higgsfield" ? this.hfAdapter : this.kieAdapter;
  }

  /**
   * Estimation du coût avec le fournisseur sélectionné
   */
  public async estimate(
    modelId: string,
    params: Record<string, any>
  ): Promise<{ provider: ProviderId; estimation: ProviderEstimation }> {
    const adapter = this.selectProvider(modelId, { params });
    const estimation = await adapter.estimate(modelId, params);
    return {
      provider: adapter.id,
      estimation,
    };
  }

  /**
   * Soumission avec bascule automatique (failover)
   */
  public async submitWithFailover(
    modelId: string,
    prompt: string,
    opts: ProviderSubmitOptions
  ): Promise<{
    provider: ProviderId;
    requestId: string;
    mode: "live" | "demo";
    fallbackOf?: ProviderId;
    raw?: any;
  }> {
    const primaryAdapter = this.selectProvider(modelId, opts);
    const lowerModel = (modelId || "").toLowerCase();

    // Est-ce un modèle éligible au failover bilatéral ? (ex: Seedance 2.5)
    const isDualCompatible =
      !HIGGSFIELD_EXCLUSIVE_PATTERNS.some((p) => lowerModel.includes(p)) &&
      !KIE_EXCLUSIVE_PATTERNS.some((p) => lowerModel.includes(p));

    try {
      console.log(`[Router] Tentative principale avec fournisseur ${primaryAdapter.id} pour ${modelId}`);
      const res = await primaryAdapter.submit(modelId, prompt, opts);
      return {
        provider: primaryAdapter.id,
        requestId: res.requestId,
        mode: res.mode,
        raw: res.raw,
      };
    } catch (primaryError: any) {
      console.warn(
        `[Router] Échec fournisseur principal (${primaryAdapter.id}):`,
        primaryError.message
      );

      // Si le modèle n'a pas d'alternative de l'autre côté, propager l'erreur
      if (!isDualCompatible) {
        throw primaryError;
      }

      // Bascule vers le fournisseur secondaire
      const secondaryAdapter =
        primaryAdapter.id === "kie" ? this.hfAdapter : this.kieAdapter;

      console.log(
        `[Router] BASCULE AUTOMATIQUE vers ${secondaryAdapter.id} sans frais supplémentaires pour l'utilisateur...`
      );

      try {
        const fallbackRes = await secondaryAdapter.submit(modelId, prompt, opts);
        return {
          provider: secondaryAdapter.id,
          requestId: fallbackRes.requestId,
          mode: fallbackRes.mode,
          fallbackOf: primaryAdapter.id,
          raw: fallbackRes.raw,
        };
      } catch (secondaryError: any) {
        console.error(
          `[Router] Échec du fournisseur de repli (${secondaryAdapter.id}):`,
          secondaryError.message
        );
        throw new Error(
          `Erreur des deux fournisseurs (${primaryAdapter.id}: ${primaryError.message} | ${secondaryAdapter.id}: ${secondaryError.message})`
        );
      }
    }
  }

  /**
   * Récupère le statut d'une tâche selon son ID et/ou son préfixe
   */
  public async getStatus(
    taskId: string,
    preferredProvider?: ProviderId
  ): Promise<{ provider: ProviderId; result: ProviderStatusResult }> {
    // Détection par préfixe ou UUID
    let provider: ProviderId = preferredProvider || "kie";

    if (taskId.startsWith("sim-hf-") || taskId.startsWith("hf_") || taskId.includes("/")) {
      provider = "higgsfield";
    } else if (taskId.startsWith("sim-kie-") || taskId.startsWith("kie_")) {
      provider = "kie";
    }

    const adapter = this.getAdapter(provider);
    const result = await adapter.status(taskId);

    return {
      provider,
      result,
    };
  }
}

export const providerRouter = new ProviderRouter();

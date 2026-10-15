export type ProviderId = "kie" | "higgsfield";

export interface ProviderOutput {
  type: "image" | "video" | "audio";
  url: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface ProviderStatusResult {
  state: "waiting" | "running" | "success" | "fail" | "nsfw" | "canceled";
  outputs?: ProviderOutput[];
  error?: string;
  failCode?: string;
  creditsConsumed?: number;
  rawResponse?: any;
}

export interface ProviderEstimation {
  credits: number;
  usd: number;
}

export interface ProviderSubmitOptions {
  webhookUrl?: string;
  idempotencyKey?: string;
  referenceImageUrls?: string[];
  referenceVideoUrl?: string;
  referenceAudioUrl?: string;
  aspectRatio?: string;
  duration?: number;
  resolution?: string;
  params?: Record<string, any>;
}

export interface ProviderAdapter {
  readonly id: ProviderId;

  /**
   * Estime le coût en crédits et en dollars de la requête
   */
  estimate(
    modelId: string,
    params: Record<string, any>
  ): Promise<ProviderEstimation>;

  /**
   * Soumet une tâche asynchrone au fournisseur
   */
  submit(
    modelId: string,
    prompt: string,
    opts: ProviderSubmitOptions
  ): Promise<{
    requestId: string;
    mode: "live" | "demo";
    statusUrl?: string;
    cancelUrl?: string;
    raw?: any;
  }>;

  /**
   * Récupère le statut actuel d'une tâche
   */
  status(requestId: string): Promise<ProviderStatusResult>;

  /**
   * Tente d'annuler une requête en file d'attente
   */
  cancel(requestId: string): Promise<boolean>;

  /**
   * Vérifie et décode un payload de webhook reçu du fournisseur
   */
  verifyWebhook(req: Request): Promise<{
    requestId: string;
    isValid: boolean;
    statusResult?: ProviderStatusResult;
  }>;
}

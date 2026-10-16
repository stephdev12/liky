export interface PollTaskResult {
  success: boolean;
  state: "success" | "fail" | "running" | "waiting";
  resultUrl?: string;
  resultUrls?: string[];
  creditsConsumed?: number;
  error?: string;
}

/**
 * Polls /api/tasks/[taskId] until task succeeds or fails
 */
export async function pollTaskUntilComplete(
  taskId: string,
  onProgress?: (elapsedSeconds: number, status: string) => void,
  maxWaitSeconds: number = 180
): Promise<PollTaskResult> {
  const startTime = Date.now();
  const maxAttempts = Math.ceil(maxWaitSeconds / 1.8);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, 1800));
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.failMsg || data.error || `Erreur serveur (${res.status})`);
      }

      const state = data.state || data.status;

      if (onProgress) {
        onProgress(elapsed, state);
      }

      if (state === "success") {
        const resultUrl =
          data.resultUrl ||
          data.response?.resultUrls?.[0] ||
          data.mediaUrl;

        return {
          success: true,
          state: "success",
          resultUrl,
          resultUrls: data.response?.resultUrls || (resultUrl ? [resultUrl] : []),
          creditsConsumed: data.creditsConsumed,
        };
      }

      if (state === "fail") {
        throw new Error(data.failMsg || data.error || "La génération a échoué.");
      }
    } catch (err: any) {
      if (err.message && (err.message.includes("échoué") || err.message.includes("rejeté"))) {
        throw err;
      }
      // Réessayer en cas de micro-coupure réseau temporaire
    }
  }

  throw new Error("Délai de traitement dépassé.");
}

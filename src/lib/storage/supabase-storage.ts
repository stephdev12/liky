import { createAdminClient } from "@/lib/supabase/admin";

export const MEDIA_BUCKET = "creations";

/**
 * Télécharge un fichier multimédia depuis une URL distante (ex: CDN Higgsfield qui expire à J+7, ou kie.ai)
 * et le stocke de manière permanente dans le bucket Supabase Storage `likyai-media`.
 */
export async function persistMediaToSupabase(
  remoteUrl: string,
  destinationFolder: "generations" | "references" | "brand" = "generations",
  customFilename?: string
): Promise<{ permanentUrl: string; path: string; error?: string }> {
  try {
    if (!remoteUrl || remoteUrl.startsWith("data:") || remoteUrl.startsWith("/")) {
      return { permanentUrl: remoteUrl, path: "" };
    }

    const supabase = createAdminClient();

    // Téléchargement du binaire depuis l'URL distante
    const response = await fetch(remoteUrl);
    if (!response.ok) {
      console.warn(`[Storage] Impossible de télécharger l'URL distante (${response.status}): ${remoteUrl}`);
      return { permanentUrl: remoteUrl, path: "" };
    }

    const blob = await response.blob();
    const contentType = response.headers.get("content-type") || blob.type || "application/octet-stream";

    // Détermination de l'extension
    let ext = "bin";
    if (contentType.includes("video/mp4")) ext = "mp4";
    else if (contentType.includes("video/webm")) ext = "webm";
    else if (contentType.includes("image/jpeg")) ext = "jpg";
    else if (contentType.includes("image/png")) ext = "png";
    else if (contentType.includes("image/webp")) ext = "webp";
    else if (contentType.includes("audio/mpeg") || contentType.includes("audio/mp3")) ext = "mp3";
    else if (contentType.includes("audio/wav")) ext = "wav";

    const filename = customFilename || `${destinationFolder}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `${destinationFolder}/${filename}`;

    // Upload vers Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(filePath, blob, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[Storage] Erreur upload Supabase Storage:", uploadError);
      return { permanentUrl: remoteUrl, path: "", error: uploadError.message };
    }

    // Récupération de l'URL publique permanente
    const { data: publicUrlData } = supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(filePath);

    return {
      permanentUrl: publicUrlData.publicUrl,
      path: filePath,
    };
  } catch (err: any) {
    console.error("[Storage] Exception lors de la persistance média:", err);
    return { permanentUrl: remoteUrl, path: "", error: err.message };
  }
}

/**
 * Génère une URL signée temporaire accessible publiquement (ex: pour transmettre
 * une image ou vidéo à Higgsfield / kie sans exposer publiquement le bucket).
 */
export async function createSignedMediaUrl(
  filePathOrUrl: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  try {
    // Si c'est déjà une URL HTTPS publique externe, on la retourne
    if (filePathOrUrl.startsWith("http://") || filePathOrUrl.startsWith("https://")) {
      return filePathOrUrl;
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .createSignedUrl(filePathOrUrl, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.warn("[Storage] Impossible de générer l'URL signée:", error);
      return filePathOrUrl;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("[Storage] Exception createSignedMediaUrl:", err);
    return filePathOrUrl;
  }
}

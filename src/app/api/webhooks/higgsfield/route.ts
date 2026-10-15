import { NextRequest, NextResponse } from "next/server";
import { HiggsfieldAdapter } from "@/lib/providers/higgsfield-adapter";

// Cache in-memory pour dédupliquer les webhooks réessayés par Higgsfield
const processedWebhooks = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const adapter = new HiggsfieldAdapter();
    const verification = await adapter.verifyWebhook(req);

    if (!verification.isValid || !verification.requestId) {
      return NextResponse.json({ error: "Signature ou token invalide" }, { status: 401 });
    }

    const { requestId, statusResult } = verification;
    const dedupeKey = `${requestId}:${statusResult?.state}`;

    if (processedWebhooks.has(dedupeKey)) {
      return NextResponse.json({ status: "already_processed" });
    }

    processedWebhooks.add(dedupeKey);
    // Nettoyage après 1h
    setTimeout(() => processedWebhooks.delete(dedupeKey), 3600 * 1000);

    console.log(`[Higgsfield Webhook] Tâche ${requestId} -> État vérifié: ${statusResult?.state}`);

    if (statusResult?.state === "success") {
      console.log(`[Higgsfield Webhook] Médias persistés avec succès dans Supabase Storage:`, statusResult.outputs);
    } else if (statusResult?.state === "nsfw" || statusResult?.state === "fail") {
      console.warn(`[Higgsfield Webhook] Tâche ${requestId} non aboutie (${statusResult.state})`);
    }

    // Réponse rapide < 10s exigée par la documentation Higgsfield
    return NextResponse.json({
      status: "received",
      requestId,
      state: statusResult?.state,
    });
  } catch (err: any) {
    console.error("[Higgsfield Webhook Error]:", err);
    return NextResponse.json({ error: "Erreur traitement webhook" }, { status: 500 });
  }
}

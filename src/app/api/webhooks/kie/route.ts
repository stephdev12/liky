import { NextRequest, NextResponse } from "next/server";
import { KieAdapter } from "@/lib/providers/kie-adapter";

const processedKieWebhooks = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const adapter = new KieAdapter();
    const verification = await adapter.verifyWebhook(req);

    if (!verification.isValid || !verification.requestId) {
      return NextResponse.json({ error: "Payload webhook KIE invalide" }, { status: 400 });
    }

    const { requestId, statusResult } = verification;
    const dedupeKey = `${requestId}:${statusResult?.state}`;

    if (processedKieWebhooks.has(dedupeKey)) {
      return NextResponse.json({ status: "already_processed" });
    }

    processedKieWebhooks.add(dedupeKey);
    setTimeout(() => processedKieWebhooks.delete(dedupeKey), 3600 * 1000);

    console.log(`[KIE Webhook] Tâche ${requestId} -> État: ${statusResult?.state}`);

    return NextResponse.json({
      status: "received",
      taskId: requestId,
      state: statusResult?.state,
    });
  } catch (err: any) {
    console.error("[KIE Webhook Error]:", err);
    return NextResponse.json({ error: "Erreur traitement webhook KIE" }, { status: 500 });
  }
}

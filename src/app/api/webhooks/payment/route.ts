import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature, getWebhookSigningSecret } from "@/lib/payment/client";
import { PaymentWebhookPayload } from "@/lib/payment/types";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    const eventHeader = req.headers.get("x-webhook-event");

    const webhookSecret = getWebhookSigningSecret();

    // Vérification cryptographique si le secret webhook est configuré
    if (webhookSecret) {
      const isValid = verifyWebhookSignature(rawBody, signature, timestamp, webhookSecret);
      if (!isValid) {
        console.warn("[Payment Webhook] Signature invalide ou horodatage expiré (> 5 min).");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    let payload: PaymentWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { event, data } = payload;
    console.log(`[Payment Webhook] Événement reçu: ${event || eventHeader} (ID: ${data?.id})`);

    // Traitement du succès de paiement
    if (event === "transaction.success" || data?.status === "SUCCESS") {
      const transactionId = data.id;
      const metadata = data.metadata || {};
      const userId = metadata.user_id as string | undefined;
      const creditsToAdd = Number(metadata.credits) || 60;
      const amountFcfa = Math.round(parseFloat(data.amount || "1000"));
      const network = data.network || "Mobile Money";
      const phone = data.msisdn || "";

      if (userId) {
        const adminClient = createAdminClient();

        // 1. Crédit atomique du profil utilisateur
        await adminClient.rpc("add_credits", {
          p_user_id: userId,
          p_credits_amount: creditsToAdd,
          p_amount_fcfa: amountFcfa,
          p_operator: network,
          p_phone: phone,
          p_reference: transactionId,
        });

        // 2. Mise à jour de la transaction correspondante
        await adminClient
          .from("transactions")
          .update({ status: "completed" })
          .eq("reference", transactionId);

        console.log(`[Payment Webhook] Compte ${userId} crédité de +${creditsToAdd} crédits avec succès.`);
      }
    }

    if (event === "transaction.failed" || event === "transaction.cancelled") {
      const adminClient = createAdminClient();
      await adminClient
        .from("transactions")
        .update({ status: "failed" })
        .eq("reference", data.id);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("[Payment Webhook] Erreur traitement:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur interne" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayment } from "@/lib/payment/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    if (!paymentId) {
      return NextResponse.json({ error: "Identifiant de paiement manquant" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 1. Vérification auprès de la passerelle
    const verification = await verifyPayment(paymentId);

    // 2. Si le statut est validé (SUCCESS), on crédite immédiatement l'utilisateur si pas déjà fait
    if (verification.status === "SUCCESS") {
      const adminClient = createAdminClient();

      // Rechercher la transaction correspondante
      const { data: txn } = await adminClient
        .from("transactions")
        .select("*")
        .eq("reference", paymentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (txn && txn.status === "pending") {
        // Déclencher le crédit atomique
        const creditsToAdd = txn.amount || 60;
        const amountFcfa = txn.amount_fcfa || 1000;
        const operatorName = txn.operator || "Mobile Money";

        const { data: rpcRes, error: rpcError } = await adminClient.rpc("add_credits", {
          p_user_id: user.id,
          p_credits_amount: creditsToAdd,
          p_amount_fcfa: amountFcfa,
          p_operator: operatorName,
          p_phone: txn.phone || "",
          p_reference: paymentId,
        });

        // Mettre à jour la transaction en 'completed'
        await adminClient
          .from("transactions")
          .update({ status: "completed" })
          .eq("id", txn.id);

        return NextResponse.json({
          status: "SUCCESS",
          message: "Paiement confirmé avec succès !",
          creditsAdded: creditsToAdd,
          totalCredits: rpcRes?.total_credits,
        });
      }

      // Si la transaction était déjà complétée
      return NextResponse.json({
        status: "SUCCESS",
        message: "Paiement déjà validé.",
      });
    }

    if (verification.status === "FAILED" || verification.status === "CANCELLED") {
      const adminClient = createAdminClient();
      await adminClient
        .from("transactions")
        .update({ status: "failed" })
        .eq("reference", paymentId)
        .eq("user_id", user.id);

      return NextResponse.json({
        status: verification.status,
        message: verification.message || "Le paiement n'a pas pu aboutir.",
      });
    }

    // En attente (PENDING)
    return NextResponse.json({
      status: "PENDING",
      message: "En attente de confirmation de votre opérateur...",
    });
  } catch (err: unknown) {
    console.error("[Payment Verify API] Erreur:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur interne de vérification" },
      { status: 500 }
    );
  }
}

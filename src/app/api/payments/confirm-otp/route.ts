import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { confirmOtp } from "@/lib/payment/client";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { paymentId, otp } = body;

    if (!paymentId || !otp) {
      return NextResponse.json(
        { error: "Identifiant de paiement et code OTP requis." },
        { status: 400 }
      );
    }

    const result = await confirmOtp(paymentId, otp);

    if (result.status === "FAILED") {
      return NextResponse.json(
        { error: result.message || "Code OTP incorrect ou expiré." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      message: result.message || "Code OTP validé avec succès.",
    });
  } catch (err: unknown) {
    console.error("[Payment OTP API] Erreur:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur lors de la validation OTP" },
      { status: 500 }
    );
  }
}

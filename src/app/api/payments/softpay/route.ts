import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initiateSoftpay } from "@/lib/payment/client";
import { normalizePhoneNumber, getNetworkByCode, getCountryByIso } from "@/lib/payment/catalog";
import { CREDIT_PACKS } from "@/lib/billing/pricing-calculator";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Veuillez vous connecter pour recharger vos crédits." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { packId, country: rawCountry, network, phone, otp, returnUrl } = body;

    // 1. Validation du pack de crédits
    const selectedPack = CREDIT_PACKS.find((p) => p.id === packId);
    if (!selectedPack) {
      return NextResponse.json(
        { error: "Pack de crédits introuvable." },
        { status: 400 }
      );
    }

    // 2. Validation du réseau et du pays
    const netInfo = getNetworkByCode(network);
    if (!netInfo) {
      return NextResponse.json(
        { error: "Réseau de paiement non reconnu ou indisponible." },
        { status: 400 }
      );
    }

    const countryIso = (rawCountry || netInfo.country.iso).toUpperCase();
    const countryConfig = getCountryByIso(countryIso) || netInfo.country;

    // 3. Validation et normalisation du numéro de téléphone
    if (!phone && network !== "card") {
      return NextResponse.json(
        { error: "Numéro de téléphone requis pour le paiement Mobile Money." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone || "+22900000000", countryIso);

    // 4. Validation OTP préalable si exigé par l'opérateur (Orange CI, Orange BF)
    if (netInfo.network.type === "prepayment_otp" && (!otp || otp.trim().length < 3)) {
      return NextResponse.json(
        {
          error: "Code temporaire (OTP) requis pour ce réseau. Veuillez composer le code USSD sur votre téléphone avant de valider.",
          code: "prepayment_otp_missing",
        },
        { status: 422 }
      );
    }

    // 5. Profil client pour la passerelle
    const customerNameParts = (user.user_metadata?.full_name || user.email?.split("@")[0] || "Client LikyAI").split(" ");
    const firstName = customerNameParts[0] || "Client";
    const lastName = customerNameParts.slice(1).join(" ") || "LikyAI";

    // 6. Initiation de la transaction via Softpay
    const appOrigin = req.nextUrl.origin || "https://liky.ai";
    const resolvedReturnUrl = returnUrl || `${appOrigin}/studio?payment_return=1`;

    const softpayResult = await initiateSoftpay({
      amount: selectedPack.priceFcfa,
      currency: countryConfig.currency,
      country: countryIso === "INT" ? "XX" : countryIso,
      network: netInfo.network.code,
      description: `Recharge ${selectedPack.credits} crédits LikyAI`,
      customer: {
        email: user.email || "client@liky.ai",
        first_name: firstName,
        last_name: lastName,
        phone: normalizedPhone,
      },
      otp: otp?.trim(),
      metadata: {
        user_id: user.id,
        pack_id: selectedPack.id,
        credits: selectedPack.credits,
        price_fcfa: selectedPack.priceFcfa,
      },
      returnUrl: resolvedReturnUrl,
    });

    if (softpayResult.status === "FAILED") {
      return NextResponse.json(
        {
          error: softpayResult.message || "Échec de l'initialisation du paiement.",
          code: softpayResult.code,
        },
        { status: 422 }
      );
    }

    // 7. Enregistrement de la transaction en attente dans Supabase
    try {
      const adminClient = createAdminClient();
      await adminClient.from("transactions").insert({
        user_id: user.id,
        type: "topup",
        amount: selectedPack.credits,
        description: `Recharge ${netInfo.network.name} (${selectedPack.priceFcfa.toLocaleString("fr-FR")} FCFA)`,
        operator: netInfo.network.name,
        phone: normalizedPhone,
        amount_fcfa: selectedPack.priceFcfa,
        status: "pending",
        reference: softpayResult.id,
      });
    } catch (dbErr) {
      console.warn("[Payment DB] Erreur enregistrement transaction en attente:", dbErr);
    }

    return NextResponse.json({
      success: true,
      paymentId: softpayResult.id,
      status: softpayResult.status,
      checkoutUrl: softpayResult.checkout_url || "",
      message: softpayResult.message,
      isRedirect: Boolean(softpayResult.checkout_url),
      postOtp: netInfo.network.type === "postpayment_otp",
    });
  } catch (err: unknown) {
    console.error("[Payment API] Erreur initiation softpay:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur interne de traitement" },
      { status: 500 }
    );
  }
}

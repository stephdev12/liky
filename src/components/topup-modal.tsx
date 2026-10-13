"use client";

import React, { useState, useEffect, useRef } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import { CREDIT_PACKS, CreditPack } from "@/lib/billing/pricing-calculator";
import {
  PAYMENT_COUNTRIES,
  PaymentCountry,
  PaymentNetwork,
  getCountryByIso,
  getNetworkByCode,
} from "@/lib/payment/catalog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPackId?: string;
  onSuccess?: (addedCredits: number, newTotalCredits?: number) => void;
}

type ModalStep = "select" | "waiting_push" | "waiting_otp" | "success" | "error";

export function TopupModal({
  isOpen,
  onClose,
  initialPackId = "pack_createur",
  onSuccess,
}: TopupModalProps) {
  const [step, setStep] = useState<ModalStep>("select");
  const [selectedPackId, setSelectedPackId] = useState<string>(initialPackId);
  const [selectedCountryIso, setSelectedCountryIso] = useState<string>("CI");
  const [selectedNetworkCode, setSelectedNetworkCode] = useState<string>("wave_ci");
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollingSeconds, setPollingSeconds] = useState<number>(0);
  const [addedCreditsSummary, setAddedCreditsSummary] = useState<number>(0);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronise le pack initial à l'ouverture
  useEffect(() => {
    if (isOpen) {
      if (initialPackId) setSelectedPackId(initialPackId);
      setStep("select");
      setErrorMessage(null);
      setLoading(false);
      setOtp("");
      setPaymentId(null);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
  }, [isOpen, initialPackId]);

  // Synchronise l'opérateur par défaut quand le pays change
  const currentCountry: PaymentCountry =
    getCountryByIso(selectedCountryIso) || PAYMENT_COUNTRIES[0];

  useEffect(() => {
    if (currentCountry.networks.length > 0) {
      const exists = currentCountry.networks.some((n) => n.code === selectedNetworkCode);
      if (!exists) {
        setSelectedNetworkCode(currentCountry.networks[0].code);
      }
    }
  }, [selectedCountryIso, currentCountry, selectedNetworkCode]);

  const currentNetwork: PaymentNetwork =
    currentCountry.networks.find((n) => n.code === selectedNetworkCode) ||
    currentCountry.networks[0];

  const selectedPack: CreditPack =
    CREDIT_PACKS.find((p) => p.id === selectedPackId) || CREDIT_PACKS[1];

  // Gestion du polling en arrière-plan pendant la validation USSD
  const startPolling = (id: string, credits: number) => {
    setPollingSeconds(0);
    const startTime = Date.now();

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setPollingSeconds(elapsed);

      // Timeout après 90 secondes de tentative
      if (elapsed > 90) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setStep("error");
        setErrorMessage(
          "Le délai de confirmation a expiré. Si votre compte a été débité, vos crédits seront ajoutés automatiquement d'ici quelques instants."
        );
        return;
      }

      try {
        const res = await fetch(`/api/payments/verify/${encodeURIComponent(id)}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "SUCCESS") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setAddedCreditsSummary(credits);
          setStep("success");
          if (onSuccess) {
            onSuccess(credits, data.totalCredits);
          }
        } else if (data.status === "FAILED" || data.status === "CANCELLED") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setStep("error");
          setErrorMessage(data.message || "La transaction a été annulée ou a échoué.");
        }
      } catch {
        // Retry polling silently
      }
    }, 2500);
  };

  // Lancement du paiement
  const handleInitiatePayment = async () => {
    setErrorMessage(null);

    // Validation du numéro si mobile money
    if (currentNetwork.code !== "card") {
      const cleanDigits = phone.replace(/\D/g, "");
      if (cleanDigits.length < currentCountry.phoneMinDigits) {
        setErrorMessage(
          `Veuillez entrer un numéro valide à ${currentCountry.phoneMinDigits} chiffres pour ${currentCountry.name}.`
        );
        return;
      }
    }

    // Validation OTP pré-paiement
    if (currentNetwork.type === "prepayment_otp" && (!otp || otp.trim().length < 3)) {
      setErrorMessage(
        "Veuillez générer votre code temporaire sur votre téléphone (#144*82#) et le saisir ci-dessous."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/payments/softpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: selectedPack.id,
          country: currentCountry.iso,
          network: currentNetwork.code,
          phone: phone.trim(),
          otp: otp.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoading(false);
        setErrorMessage(data.error || "Impossible d'initier la transaction.");
        return;
      }

      setPaymentId(data.paymentId);

      // Cas 1 : Redirection vers page hébergée (Wave ou Carte)
      if (data.isRedirect && data.checkoutUrl) {
        setLoading(false);
        // Ouvre dans un nouvel onglet ou redirige
        window.location.href = data.checkoutUrl;
        return;
      }

      // Cas 2 : Demande d'OTP post-paiement (Wizall SN)
      if (data.postOtp) {
        setLoading(false);
        setStep("waiting_otp");
        return;
      }

      // Cas 3 : Push USSD direct sur le mobile
      setLoading(false);
      setStep("waiting_push");
      startPolling(data.paymentId, selectedPack.credits);
    } catch (err: unknown) {
      setLoading(false);
      setErrorMessage(
        err instanceof Error ? err.message : "Erreur de connexion au serveur"
      );
    }
  };

  // Confirmation OTP post-paiement
  const handleConfirmPostOtp = async () => {
    if (!paymentId || !otp || otp.trim().length < 4) {
      setErrorMessage("Veuillez saisir le code reçu par SMS.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/payments/confirm-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Code OTP incorrect.");
        return;
      }

      // Passer au suivi
      setStep("waiting_push");
      startPolling(paymentId, selectedPack.credits);
    } catch {
      setLoading(false);
      setErrorMessage("Erreur lors de la validation du code.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!loading && step !== "waiting_push") onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4 bg-[var(--surface)]">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[var(--field)] border border-[var(--line)] flex items-center justify-center text-foreground">
              <CoolIcon name="credit-card-01" size={17} duotone={false} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Recharger mes crédits
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Paiement instantané par Mobile Money & Carte
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            disabled={loading || step === "waiting_push"}
            className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-[var(--hover)] hover:text-foreground transition-colors cursor-pointer disabled:opacity-40"
          >
            <CoolIcon name="close-md" size={15} duotone={false} />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* ÉTAPE 1 : CHOIX DU PACK, PAYS ET OPÉRATEUR */}
          {step === "select" && (
            <>
              {/* Grille des packs de crédits */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  1. Choisissez votre pack
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CREDIT_PACKS.map((p) => {
                    const isSelected = selectedPackId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPackId(p.id)}
                        className={cn(
                          "relative p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px]",
                          isSelected
                            ? "border-foreground bg-[var(--field)] ring-1 ring-foreground/40 shadow-xs"
                            : "border-[var(--line)] bg-[var(--surf)] hover:border-[var(--line-strong)] hover:bg-[var(--hover)]"
                        )}
                      >
                        {p.bonusPercent > 0 && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            +{p.bonusPercent}%
                          </span>
                        )}
                        <div>
                          <div className="text-[11.5px] font-medium text-muted-foreground">
                            {p.name}
                          </div>
                          <div className="font-heading text-xl font-bold text-foreground mt-0.5 tracking-tight">
                            {p.credits}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                              cr
                            </span>
                          </div>
                        </div>
                        <div className="text-[12px] font-semibold text-foreground/90 mt-2 font-mono">
                          {p.priceFcfa.toLocaleString("fr-FR")} FCFA
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sélection du Pays & Réseau */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    2. Moyen de paiement
                  </label>
                  {/* Coss Select pour le pays */}
                  <Select
                    value={selectedCountryIso}
                    onValueChange={(val) => {
                      if (val) setSelectedCountryIso(val);
                    }}
                  >
                    <SelectTrigger className="h-7 px-2.5 text-xs rounded-lg">
                      <SelectValue placeholder="Choisir un pays" />
                    </SelectTrigger>
                    <SelectPopup>
                      {PAYMENT_COUNTRIES.map((c) => (
                        <SelectItem key={c.iso} value={c.iso}>
                          <span className="mr-2">{c.flag}</span>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                </div>

                {/* Opérateurs du pays sélectionné */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {currentCountry.networks.map((net) => {
                    const isNetSelected = selectedNetworkCode === net.code;
                    return (
                      <button
                        key={net.code}
                        type="button"
                        onClick={() => setSelectedNetworkCode(net.code)}
                        className={cn(
                          "p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[64px]",
                          isNetSelected
                            ? "border-foreground bg-[var(--field)] ring-1 ring-foreground/40 shadow-xs"
                            : "border-[var(--line)] bg-[var(--surf)] hover:border-[var(--line-strong)] hover:bg-[var(--hover)]"
                        )}
                      >
                        <span className="text-[12.5px] font-semibold text-foreground">
                          {net.name}
                        </span>
                        {net.badge && (
                          <span className="text-[9.5px] font-medium text-muted-foreground">
                            {net.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Indication opérateur contextuelle */}
                <div className="rounded-xl border border-[var(--line)] bg-[var(--field)] p-3 text-xs text-muted-foreground flex items-start gap-2.5">
                  <CoolIcon
                    name="info"
                    size={15}
                    duotone={false}
                    className="shrink-0 mt-0.5 text-foreground"
                  />
                  <div className="space-y-1">
                    <p className="text-foreground/90 font-medium">
                      {currentNetwork.instruction}
                    </p>
                    {currentNetwork.otpHelp && (
                      <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                        {currentNetwork.otpHelp}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Champ Numéro de téléphone */}
              {currentNetwork.code !== "card" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Numéro {currentNetwork.name} ({currentCountry.dialCode})
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="h-9 px-3 rounded-[12px] border border-[var(--line)] bg-[var(--field)] flex items-center text-xs font-mono text-muted-foreground shrink-0">
                      {currentCountry.dialCode}
                    </div>
                    <Input
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={currentCountry.phonePlaceholder}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Champ OTP pré-paiement (Orange CI / Orange BF) */}
              {currentNetwork.type === "prepayment_otp" && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      Code d&apos;autorisation temporaire (OTP)
                    </label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      USSD #144*82#
                    </span>
                  </div>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={currentNetwork.otpPlaceholder || "Ex: 4829"}
                    className="font-mono tracking-widest text-center text-base"
                  />
                </div>
              )}

              {/* Message d'erreur */}
              {errorMessage && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500 dark:text-red-400 flex items-start gap-2">
                  <CoolIcon
                    name="circle-warning"
                    size={14}
                    duotone={false}
                    className="shrink-0 mt-0.5 text-red-500"
                  />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}

          {/* ÉTAPE 2 : ATTENTE DU PUSH USSD / VALIDATION TÉLÉPHONE */}
          {step === "waiting_push" && (
            <div className="py-8 px-4 flex flex-col items-center text-center space-y-4">
              <div className="relative size-16 rounded-full bg-[var(--field)] border border-[var(--line)] flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-foreground" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  Demande envoyée sur votre mobile
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Consultez votre téléphone {currentCountry.dialCode} {phone} et tapez votre code
                  secret pour autoriser le débit de{" "}
                  <strong className="text-foreground">
                    {selectedPack.priceFcfa.toLocaleString("fr-FR")} FCFA
                  </strong>
                  .
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--field)] border border-[var(--line)] text-xs text-muted-foreground font-mono">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Attente de confirmation… ({pollingSeconds}s)
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : CONFIRMATION OTP POST-PAIEMENT (Wizall SN) */}
          {step === "waiting_otp" && (
            <div className="py-4 space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Confirmation par code SMS
                </h3>
                <p className="text-xs text-muted-foreground">
                  Entrez le code à 6 chiffres reçu par SMS sur votre mobile.
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  className="font-mono text-center tracking-widest text-lg h-11"
                />
                <Button
                  onClick={handleConfirmPostOtp}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Valider mon paiement"
                  )}
                </Button>
              </div>

              {errorMessage && (
                <p className="text-center text-xs text-red-500">{errorMessage}</p>
              )}
            </div>
          )}

          {/* ÉTAPE 4 : SUCCÈS CONFIRMÉ */}
          {step === "success" && (
            <div className="py-8 px-4 flex flex-col items-center text-center space-y-4">
              <div className="size-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CoolIcon name="check-big" size={28} duotone={false} />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-heading text-xl font-bold text-foreground">
                  Recharge réussie !
                </h3>
                <p className="text-xs text-muted-foreground">
                  Votre compte LikyAI a été crédité de{" "}
                  <strong className="text-foreground">
                    +{addedCreditsSummary} crédits
                  </strong>
                  . Vos créations sont immédiatement disponibles dans le Studio.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={onClose}
                className="mt-2 text-xs h-8 px-5"
              >
                Retour au Studio
              </Button>
            </div>
          )}

          {/* ÉTAPE 5 : ERREUR */}
          {step === "error" && (
            <div className="py-6 px-4 flex flex-col items-center text-center space-y-4">
              <div className="size-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <CoolIcon name="circle-warning" size={24} duotone={false} />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  Paiement non abouti
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {errorMessage || "Une erreur est survenue lors de la tentative de débit."}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                  className="text-xs h-8"
                >
                  Réessayer
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-xs h-8 text-muted-foreground"
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Étape Select) */}
        {step === "select" && (
          <div className="border-t border-[var(--line)] px-6 py-4 bg-[var(--surface)] flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Total à payer :{" "}
              <strong className="text-foreground font-mono text-sm">
                {selectedPack.priceFcfa.toLocaleString("fr-FR")} FCFA
              </strong>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={loading}
                className="text-xs"
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleInitiatePayment}
                disabled={loading}
                className="text-xs font-semibold min-w-[130px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    Traitement…
                  </>
                ) : (
                  `Payer ${selectedPack.priceFcfa.toLocaleString("fr-FR")} F`
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CoolIcon } from "@/components/icons/coolicon";
import { Button } from "@/components/ui/button";
import { AuthPage } from "@/components/auth";

function AuthorizeContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client_id") || "ChatGPT";
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        // Charge les crédits de l'utilisateur
        const { data: profile } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", session.user.id)
          .maybeSingle();

        setCredits(profile && typeof profile.credits === "number" ? profile.credits : 0);
      }
      setLoading(false);
    });
  }, [supabase]);

  const handleAuthorize = async () => {
    if (!user || !redirectUri) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/mcp/oauth/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          clientId,
          redirectUri,
          state,
        }),
      });

      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setError(data.error || "Échec de l'autorisation");
        setSubmitting(false);
      }
    } catch {
      setError("Erreur de connexion au serveur");
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (redirectUri) {
      const url = new URL(redirectUri);
      url.searchParams.set("error", "access_denied");
      if (state) url.searchParams.set("state", state);
      window.location.href = url.toString();
    } else {
      window.history.back();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-foreground">
        <div className="flex items-center gap-3 text-sm font-mono text-muted-foreground">
          <div className="size-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span>Vérification de votre session LikyAI...</span>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher le formulaire d'authentification
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] p-4">
        <div className="mb-6 text-center max-w-sm">
          <h1 className="text-xl font-bold text-foreground">Connexion requise</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Connectez-vous à votre compte LikyAI pour autoriser la connexion MCP avec {clientId}.
          </p>
        </div>
        <AuthPage
          onSuccess={() => {
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 shadow-xl space-y-6">
        {/* En-tête avec logos */}
        <div className="flex items-center justify-center gap-4">
          <div className="size-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-xl shadow-xs">
            L
          </div>
          <CoolIcon name="arrow-right-sm" size={18} duotone={false} className="text-muted-foreground" />
          <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-semibold text-sm">
            {clientId.slice(0, 7)}
          </div>
        </div>

        <div className="text-center space-y-1.5">
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            Autoriser {clientId} à accéder à votre compte LikyAI
          </h1>
          <p className="text-xs text-muted-foreground">
            L&apos;agent utilisera votre compte pour générer des assets selon vos demandes.
          </p>
        </div>

        {/* Détails du compte et solde */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--field)] p-4 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Compte connecté :</span>
            <span className="font-semibold text-foreground">{user.email}</span>
          </div>
          <div className="flex justify-between items-center border-t border-[var(--line)] pt-2.5">
            <span className="text-muted-foreground">Vos crédits disponibles :</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
              {credits !== null ? `${credits} crédits` : "Chargement..."}
            </span>
          </div>
        </div>

        {/* Avertissement d'usage */}
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-[11.5px] text-emerald-800 dark:text-emerald-300 leading-relaxed flex items-start gap-2.5">
          <CoolIcon name="shield-check" size={16} duotone secondaryColor="currentColor" className="shrink-0 mt-0.5 text-emerald-700 dark:text-emerald-400" />
          <span>
            Chaque génération d&apos;image (5 crédits), vidéo ou musique demandée dans {clientId} débitera uniquement <strong>vos propres crédits</strong> LikyAI.
          </span>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="space-y-2.5 pt-2">
          <Button
            onClick={handleAuthorize}
            disabled={submitting}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all"
          >
            {submitting ? "Autorisation en cours..." : "Autoriser la connexion"}
          </Button>

          <Button
            onClick={handleCancel}
            disabled={submitting}
            variant="outline"
            className="w-full h-10 rounded-xl text-xs font-medium border-border"
          >
            Refuser et Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-foreground">
          <div className="size-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <AuthorizeContent />
    </Suspense>
  );
}

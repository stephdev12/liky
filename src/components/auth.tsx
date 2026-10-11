"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { GithubIcon } from "@/components/icons/github-icon";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { AuthDivider } from "@/components/auth-divider";
import { DecorIcon } from "@/components/decor-icon";
import { AtSign, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AuthProps {
  onSuccess?: () => void;
  className?: string;
  isModal?: boolean;
}

export function AuthPage({ onSuccess, className, isModal = false }: AuthProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<"google" | "github" | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSentMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSentMessage("Un lien de connexion magique a été envoyé à votre adresse e-mail.");
        onSuccess?.();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setIsOAuthLoading(provider);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsOAuthLoading(null);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Erreur OAuth.");
      setIsOAuthLoading(null);
    }
  };

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden px-4 md:px-8 select-none",
        isModal ? "py-4" : "min-h-screen py-10",
        className
      )}
    >
      <div
        className={cn(
          "relative flex w-full max-w-sm flex-col justify-between p-6 md:p-8",
          "rounded-[22px] bg-[var(--surf)] border border-[var(--line)] shadow-raised",
          "dark:bg-[radial-gradient(50%_80%_at_20%_0%,rgba(216,255,100,0.06),transparent)]"
        )}
      >
        <div className="absolute -inset-y-6 -left-px w-px bg-[var(--line)]" />
        <div className="absolute -inset-y-6 -right-px w-px bg-[var(--line)]" />
        <div className="absolute -inset-x-6 -top-px h-px bg-[var(--line)]" />
        <div className="absolute -inset-x-6 -bottom-px h-px bg-[var(--line)]" />
        <DecorIcon position="top-left" className="text-[var(--lime)] stroke-[var(--lime)]" />
        <DecorIcon position="bottom-right" className="text-[var(--lime)] stroke-[var(--lime)]" />

        <div className="w-full max-w-sm animate-in space-y-6">
          {/* En-tête */}
          <div className="flex flex-col space-y-1.5">
            <h1 className="font-bold text-2xl tracking-tight text-[var(--ink)]">
              Rejoindre likyAI
            </h1>
            <p className="text-[13px] text-[var(--mute)]">
              Connectez-vous ou créez votre compte studio en quelques secondes.
            </p>
          </div>

          {/* Messages de statut */}
          {sentMessage && (
            <div className="flex items-start gap-2 p-3 rounded-[12px] bg-[var(--mn)] border border-[var(--lime)]/50 text-[12.5px] text-[var(--ink)]">
              <CheckCircle2 className="size-4 text-[var(--lime)] shrink-0 mt-0.5" />
              <span>{sentMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-[12px] bg-red-500/10 border border-red-500/30 text-[12.5px] text-red-500">
              {errorMessage}
            </div>
          )}

          {/* Formulaire E-mail */}
          <div className="space-y-4">
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <AtSign className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="votre.email@exemple.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </InputGroup>

              <Button
                className="w-full font-semibold"
                size="default"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Envoi en cours…</span>
                  </>
                ) : (
                  "Continuer avec l'e-mail"
                )}
              </Button>
            </form>

            <AuthDivider>OU</AuthDivider>

            {/* Boutons Sociaux OAuth (Google & GitHub) */}
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                className="w-full font-medium"
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isOAuthLoading !== null}
              >
                {isOAuthLoading === "google" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                <span>Google</span>
              </Button>
              <Button
                className="w-full font-medium"
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("github")}
                disabled={isOAuthLoading !== null}
              >
                {isOAuthLoading === "github" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <GithubIcon />
                )}
                <span>GitHub</span>
              </Button>
            </div>
          </div>

          {/* Mentions légales */}
          <p className="text-[11.5px] text-[var(--mute)] leading-relaxed text-center">
            En continuant, vous acceptez nos{" "}
            <a
              className="underline underline-offset-4 hover:text-[var(--ink)] transition-colors"
              href="#"
            >
              Conditions d&apos;utilisation
            </a>{" "}
            et notre{" "}
            <a
              className="underline underline-offset-4 hover:text-[var(--ink)] transition-colors"
              href="#"
            >
              Politique de confidentialité
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

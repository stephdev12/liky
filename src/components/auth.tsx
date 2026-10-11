"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { GithubIcon } from "@/components/icons/github-icon";
import { GoogleIcon } from "@/components/icons/google-icon";
import { CoolIcon } from "@/components/icons/coolicon";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { AuthDivider } from "@/components/auth-divider";
import { DecorIcon } from "@/components/decor-icon";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AuthProps {
  onSuccess?: () => void;
  className?: string;
  isModal?: boolean;
}

export function AuthPage({ onSuccess, className, isModal = false }: AuthProps) {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<"google" | "github" | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Si l'utilisateur est déjà connecté, redirection vers le studio
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.replace("/");
        }
      }
    });
  }, [supabase, router, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (authMode === "signup" && password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === "signin") {
        // Connexion avec email et mot de passe
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setErrorMessage("Adresse e-mail ou mot de passe incorrect.");
          } else if (error.message.includes("Email not confirmed")) {
            setErrorMessage("Veuillez confirmer votre adresse e-mail avant de vous connecter.");
          } else {
            setErrorMessage(error.message);
          }
          return;
        }

        if (data.session) {
          setStatusMessage("Connexion réussie ! Redirection en cours…");
          if (onSuccess) {
            onSuccess();
          } else {
            router.replace("/");
          }
        }
      } else {
        // Inscription avec email et mot de passe
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            setErrorMessage("Un compte existe déjà avec cette adresse e-mail. Connectez-vous.");
            setAuthMode("signin");
          } else {
            setErrorMessage(error.message);
          }
          return;
        }

        if (data.session) {
          // Session directe (auto-confirmation activée dans Supabase)
          setStatusMessage("Compte créé avec succès ! Bienvenue sur likyAI.");
          if (onSuccess) {
            onSuccess();
          } else {
            router.replace("/");
          }
        } else if (data.user) {
          // Si Supabase requiert confirmation d'email
          setStatusMessage(
            "Compte créé avec succès ! Si un e-mail de confirmation est exigé, vérifiez votre boîte de réception, ou tentez de vous connecter dès à présent."
          );
          setAuthMode("signin");
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setIsOAuthLoading(provider);
    setErrorMessage(null);
    setStatusMessage(null);

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

        <div className="w-full max-w-sm animate-in space-y-5">
          {/* En-tête avec logo */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--lime)] flex items-center justify-center shadow-sm text-[#171717]">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z" />
              </svg>
            </div>
            <h1 className="font-bold text-2xl tracking-tight text-[var(--ink)]">
              {authMode === "signin" ? "Connexion à likyAI" : "Créer un compte"}
            </h1>
            <p className="text-[12.5px] text-[var(--mute)] max-w-xs">
              {authMode === "signin"
                ? "Accédez à votre plan de travail et retrouvez toutes vos créations IA."
                : "Rejoignez le studio likyAI avec 60 crédits offerts pour démarrer."}
            </p>
          </div>

          {/* Sélecteur d'onglets Connexion / Inscription */}
          <div className="flex rounded-[12px] bg-[var(--mn)] p-1 border border-[var(--line)]">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setErrorMessage(null);
                setStatusMessage(null);
              }}
              className={cn(
                "flex-1 py-1.5 text-[12px] font-medium rounded-[9px] transition-all cursor-pointer",
                authMode === "signin"
                  ? "bg-[var(--surf)] text-[var(--ink)] shadow-xs"
                  : "text-[var(--mute)] hover:text-[var(--ink)]"
              )}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setErrorMessage(null);
                setStatusMessage(null);
              }}
              className={cn(
                "flex-1 py-1.5 text-[12px] font-medium rounded-[9px] transition-all cursor-pointer",
                authMode === "signup"
                  ? "bg-[var(--surf)] text-[var(--ink)] shadow-xs"
                  : "text-[var(--mute)] hover:text-[var(--ink)]"
              )}
            >
              Inscription (Gratuit)
            </button>
          </div>

          {/* Messages de statut & erreur */}
          {statusMessage && (
            <div className="flex items-start gap-2 p-3 rounded-[12px] bg-[var(--mn)] border border-[var(--lime)]/50 text-[12px] text-[var(--ink)]">
              <CheckCircle2 className="size-4 text-[var(--lime)] shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-[12px] bg-red-500/10 border border-red-500/30 text-[12px] text-red-500">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulaire E-mail + Mot de passe */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--mute)] uppercase tracking-wider">
                Adresse e-mail
              </label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <CoolIcon name="mail" size={15} duotone secondaryColor="var(--lime)" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="nom@exemple.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="email"
                />
              </InputGroup>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--mute)] uppercase tracking-wider">
                Mot de passe
              </label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <CoolIcon name="lock" size={15} duotone secondaryColor="var(--lime)" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder={authMode === "signup" ? "Au moins 6 caractères" : "••••••••"}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete={authMode === "signin" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((p) => !p)}
                  className="px-3 text-[var(--mute)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                  title={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </InputGroup>
            </div>

            {authMode === "signup" && (
              <div className="space-y-1 animate-in fade-in">
                <label className="text-[11px] font-medium text-[var(--mute)] uppercase tracking-wider">
                  Confirmer le mot de passe
                </label>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <CoolIcon name="lock" size={15} duotone secondaryColor="var(--lime)" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Répétez le mot de passe"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="new-password"
                  />
                </InputGroup>
              </div>
            )}

            <Button
              className="w-full font-semibold mt-2 h-10 bg-[var(--lime)] text-[#171717] hover:bg-[var(--lime)]/90"
              size="default"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Traitement en cours…</span>
                </>
              ) : authMode === "signin" ? (
                "Se connecter"
              ) : (
                "Créer mon compte studio"
              )}
            </Button>
          </form>

          <AuthDivider>OU AVEC</AuthDivider>

          {/* Boutons Sociaux OAuth (Google & GitHub) */}
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              className="w-full font-medium h-9 text-[12.5px]"
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isOAuthLoading !== null || isLoading}
            >
              {isOAuthLoading === "google" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span>Google</span>
            </Button>
            <Button
              className="w-full font-medium h-9 text-[12.5px]"
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn("github")}
              disabled={isOAuthLoading !== null || isLoading}
            >
              {isOAuthLoading === "github" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <GithubIcon />
              )}
              <span>GitHub</span>
            </Button>
          </div>

          {/* Mentions légales */}
          <p className="text-[11px] text-[var(--mute)] leading-relaxed text-center pt-1">
            En continuant, vous acceptez les{" "}
            <a className="underline underline-offset-4 hover:text-[var(--ink)] transition-colors" href="#">
              Conditions
            </a>{" "}
            et la{" "}
            <a className="underline underline-offset-4 hover:text-[var(--ink)] transition-colors" href="#">
              Confidentialité
            </a>{" "}
            de likyAI.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

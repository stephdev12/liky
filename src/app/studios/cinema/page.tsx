"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CoolIcon } from "@/components/icons/coolicon";
import { ThemeToggle } from "@/components/theme-toggle";
import { TopupModal } from "@/components/topup-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Loader2, Clapperboard, Sparkles, Film, Video, Download, Copy, Play, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CinemaModel {
  id: string;
  name: string;
  provider: string;
  resolution: string;
  features: string[];
  creditsPerClip: number;
  badge?: string;
  maxDuration: number;
}

const CINEMA_MODELS: CinemaModel[] = [
  {
    id: "veo-3-1",
    name: "Google Veo 3.1",
    provider: "DeepMind",
    resolution: "1080p / 4K",
    features: ["Éclairage photoréaliste", "Prise en compte caméra avancée", "Fluidité 24fps"],
    creditsPerClip: 24,
    badge: "Référence Cinéma",
    maxDuration: 8,
  },
  {
    id: "seedance-2-5",
    name: "Seedance 2.5",
    provider: "ByteDance",
    resolution: "4K UHD",
    features: ["Audio natif synchrone", "Mouvements rapides complexes", "Durée jusqu'à 15s"],
    creditsPerClip: 18,
    badge: "Audio natif",
    maxDuration: 15,
  },
  {
    id: "kling-3-0",
    name: "Kling 3.0 Pro",
    provider: "Kuaishou",
    resolution: "1080p HD",
    features: ["Excellente fidélité physique", "Mouvements de caméra amples", "Gestion des visages"],
    creditsPerClip: 16,
    maxDuration: 10,
  },
  {
    id: "minimax-h3",
    name: "MiniMax Hailuo 3",
    provider: "MiniMax",
    resolution: "1080p HD",
    features: ["Expressions faciales naturelles", "Dynamisme visuel élevé", "Génération rapide"],
    creditsPerClip: 14,
    maxDuration: 6,
  },
];

const CAMERA_PRESETS = [
  { id: "travelling_in", label: "Travelling avant lent", promptAdd: "slow smooth push-in camera dolly shot" },
  { id: "orbit", label: "Orbite 360°", promptAdd: "360-degree cinematic orbiting camera movement" },
  { id: "anamorphic_pan", label: "Panoramique anamorphique", promptAdd: "wide anamorphic horizontal pan with lens flare" },
  { id: "low_angle", label: "Contre-plongée dramatique", promptAdd: "dramatic low-angle shot with towering depth of field" },
  { id: "aerial_drone", label: "Drone cinématique", promptAdd: "sweeping high-altitude cinematic drone landscape shot" },
  { id: "handheld_smooth", label: "Caméra épaule fluide", promptAdd: "immersive natural handheld camera motion, organic shake" },
];

const RATIOS = [
  { id: "16:9", label: "16:9 Cinéma", desc: "Standard 4K / TV" },
  { id: "2.39:1", label: "2.39:1 Anamorphique", desc: "Format Scope Grand Écran" },
  { id: "9:16", label: "9:16 Vertical", desc: "Cinéma Mobile Plein Écran" },
];

export default function CinemaStudioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(60);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const refreshCredits = async () => {
    if (!user) return;
    const supabase = createClient();
    const { data: profile } = await supabase.from("profiles").select("credits").eq("id", user.id).maybeSingle();
    if (profile && typeof profile.credits === "number") {
      setCredits(profile.credits);
    }
  };

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/auth");
      } else {
        setUser(session.user);
        supabase
          .from("profiles")
          .select("credits")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data && typeof data.credits === "number") setCredits(data.credits);
          });
      }
      setAuthLoading(false);
    });
  }, [router]);

  const [selectedModel, setSelectedModel] = useState<string>("veo-3-1");
  const [selectedRatio, setSelectedRatio] = useState<string>("16:9");
  const [selectedDuration, setSelectedDuration] = useState<number>(8);
  const [selectedPreset, setSelectedPreset] = useState<string>("travelling_in");
  const [prompt, setPrompt] = useState<string>(
    "A 35mm film still of a solitary explorer stepping into an ancient illuminated cathedral, dust particles dancing in anamorphic sunbeams, moody chiaroscuro lighting, subtle cinematic mist, 8k resolution, Master cinematography by Roger Deakins."
  );

  const [topupOpen, setTopupOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Historique des plans
  const [generatedClips, setGeneratedClips] = useState<Array<{
    id: string;
    model: string;
    prompt: string;
    ratio: string;
    mediaUrl: string;
    createdAt: string;
  }>>([]);
  const [activeClip, setActiveClip] = useState<{
    id: string;
    model: string;
    prompt: string;
    ratio: string;
    mediaUrl: string;
  } | null>(null);

  const activeModelObj = CINEMA_MODELS.find((m) => m.id === selectedModel) || CINEMA_MODELS[0];
  const creditsCost = activeModelObj.creditsPerClip;

  const handleLaunchCinemaShot = async () => {
    if (!prompt.trim()) {
      setErrorMsg("Veuillez décrire votre plan de cinéma.");
      return;
    }

    if (credits < creditsCost) {
      setTopupOpen(true);
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    const cameraPresetObj = CAMERA_PRESETS.find((p) => p.id === selectedPreset);
    const cameraPrompt = cameraPresetObj ? `, ${cameraPresetObj.promptAdd}` : "";
    const compiledCinemaPrompt = `${prompt.trim()}${cameraPrompt}, 24fps motion, high production film set, master lighting.`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "video",
          model: selectedModel,
          prompt: compiledCinemaPrompt,
          aspectRatio: selectedRatio === "2.39:1" ? "16:9" : selectedRatio,
          duration: selectedDuration,
          creditsCost,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du rendu cinématographique.");
      }

      const newClip = {
        id: data.taskId || `cin_${Date.now()}`,
        model: activeModelObj.name,
        prompt: compiledCinemaPrompt,
        ratio: selectedRatio,
        mediaUrl: data.resultUrl || "/assets/studios/studio-cinema.jpg",
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setGeneratedClips((prev) => [newClip, ...prev]);
      setActiveClip(newClip);
      refreshCredits();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la génération du plan.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--ink)]">
        <Loader2 className="size-6 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0E] text-[#F8F8F5] flex flex-col selection:bg-[var(--lime)] selection:text-black">
      {/* ── EN-TÊTE SOMBRE CINÉMA STUDIO ── */}
      <header className="sticky top-0 z-40 bg-[#0F0F0E]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/studios"
            className="flex items-center justify-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-full bg-white/5 border border-white/10 shadow-card text-[12px] font-medium text-white hover:border-white/30 hover:bg-white/10 transition-all shrink-0"
            title="Retour au Hub des studios"
          >
            <CoolIcon name="arrow-left-sm" size={14} duotone={false} className="shrink-0 text-white" />
            <span className="hidden sm:inline font-sans">Retour aux studios</span>
          </Link>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#D8FF64] text-[#171717] font-mono text-[10.5px] font-semibold">
              03
            </span>
            <h1 className="font-heading text-[17px] sm:text-[19px] font-normal tracking-tight text-white">
              Cinéma Studio <span className="font-serif italic text-white/50 text-[14px]">35mm Master</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setTopupOpen(true)}
            className="h-8 px-3 rounded-full bg-white/5 border border-white/10 shadow-card flex items-center gap-1.5 text-[12px] font-mono font-medium hover:border-white/20 transition-all text-white"
          >
            <span className="w-2 h-2 rounded-full bg-[#D8FF64] ring-2 ring-emerald-500/20" />
            <span>{credits} cr</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* ── GRILLE DE PRODUCTION CINÉMATOGRAPHIQUE ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLONNE GAUCHE (7 COLONNES) : SÉLECTION MODÈLE COMPARATIF & RÉGLAGES CAMÉRA */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* CARTES COMPARATIVES DES MODÈLES CINÉMA */}
          <div className="p-5 rounded-2xl bg-[#1A1A19] border border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clapperboard className="size-4 text-white/60" />
                <h2 className="text-[14px] font-semibold text-white">
                  Moteurs de rendu vidéo cinématique
                </h2>
              </div>
              <span className="text-[11px] text-white/40 font-mono">
                Modèles certifiés 4K & Film
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {CINEMA_MODELS.map((model) => {
                const active = selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setSelectedModel(model.id);
                      if (selectedDuration > model.maxDuration) {
                        setSelectedDuration(model.maxDuration);
                      }
                    }}
                    className={cn(
                      "p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between",
                      active
                        ? "bg-[#252523] border-[#D8FF64] shadow-md ring-1 ring-[#D8FF64]/40"
                        : "bg-[#141413] border-white/5 hover:border-white/20"
                    )}
                  >
                    {model.badge && (
                      <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-[#D8FF64]/20 text-[#D8FF64] text-[9.5px] font-mono font-medium">
                        {model.badge}
                      </span>
                    )}
                    <div>
                      <span className="font-semibold text-[13px] text-white block">
                        {model.name}
                      </span>
                      <span className="text-[11px] text-white/50 font-mono block mt-0.5">
                        {model.provider} • {model.resolution}
                      </span>
                    </div>

                    <ul className="my-2 space-y-0.5">
                      {model.features.slice(0, 2).map((feat, i) => (
                        <li key={i} className="text-[11px] text-white/70 flex items-center gap-1.5">
                          <span className="size-1 rounded-full bg-[#D8FF64]" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[11px]">
                      <span className="text-white/50">Max {model.maxDuration}s</span>
                      <span className="font-semibold text-[#D8FF64]">{model.creditsPerClip} cr</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RÉGLAGES DU PLAN DE TOURNAGE (CAMÉRA, FORMAT, DURÉE) */}
          <div className="p-5 rounded-2xl bg-[#1A1A19] border border-white/10 flex flex-col gap-4">
            <h2 className="text-[14px] font-semibold text-white">
              Cadrage & Direction photo
            </h2>

            {/* Mouvement de caméra prédéfini */}
            <div>
              <label className="text-[11.5px] font-medium text-white/50 block mb-1.5">
                Mouvement de caméra cinématique
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CAMERA_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPreset(p.id)}
                    className={cn(
                      "p-2 rounded-xl text-left border text-[11.5px] transition-all",
                      selectedPreset === p.id
                        ? "bg-[#252523] border-[#D8FF64] text-white font-medium"
                        : "bg-[#141413] border-white/5 text-white/60 hover:text-white"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Format & Durée */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11.5px] font-medium text-white/50 block mb-1.5">
                  Ratio d&apos;aspect
                </label>
                <div className="flex gap-2">
                  {RATIOS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRatio(r.id)}
                      className={cn(
                        "flex-1 p-2 rounded-xl border text-center transition-all text-[11.5px]",
                        selectedRatio === r.id
                          ? "bg-[#252523] border-[#D8FF64] text-white font-medium"
                          : "bg-[#141413] border-white/5 text-white/60 hover:text-white"
                      )}
                    >
                      <span className="font-mono block">{r.id}</span>
                      <span className="text-[9.5px] text-white/40 block mt-0.5">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11.5px] font-medium text-white/50 block mb-1.5">
                  Durée du plan
                </label>
                <div className="flex gap-2">
                  {[5, 8, 10, 15]
                    .filter((d) => d <= activeModelObj.maxDuration)
                    .map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDuration(d)}
                        className={cn(
                          "flex-1 p-2 rounded-xl border font-mono text-[12px] transition-all text-center",
                          selectedDuration === d
                            ? "bg-[#252523] border-[#D8FF64] text-white font-semibold"
                            : "bg-[#141413] border-white/5 text-white/60 hover:text-white"
                        )}
                      >
                        {d}s
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Prompt Cinématique */}
            <div>
              <label className="text-[11.5px] font-medium text-white/50 block mb-1.5">
                Description du plan cinématique (Prompt)
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Décrivez votre scène avec détails de lumière, optique, sujet et ambiance..."
                rows={4}
                className="w-full rounded-xl bg-[#141413] border border-white/10 text-white p-3 text-[13px] leading-relaxed resize-none font-sans focus:outline-none focus:border-[#D8FF64]"
              />
            </div>

            {errorMsg && (
              <p className="text-[12px] text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                {errorMsg}
              </p>
            )}

            {/* Bouton Action Déclenchement */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <div className="flex items-center gap-1.5 font-mono text-[12px] text-white/60">
                <span>Coût :</span>
                <span className="text-[#D8FF64] font-semibold text-[13px]">{creditsCost} crédits</span>
                <span>• {activeModelObj.name}</span>
              </div>

              <Button
                onClick={handleLaunchCinemaShot}
                disabled={isGenerating || !prompt.trim()}
                className="h-11 px-6 rounded-xl bg-[#D8FF64] text-[#171717] hover:bg-[#cbf54a] font-semibold text-[13px] shadow-sm transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Rendu cinématique en cours…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2" />
                    Tourner le plan ({creditsCost} cr)
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* COLONNE DROITE (5 COLONNES) : MONITEUR DE VISIONNAGE & RUSHES */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-[#1A1A19] border border-white/10 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Video className="size-4 text-white/60" />
                <h3 className="text-[14px] font-semibold text-white">
                  Moniteur de tournage
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#D8FF64]">
                REC 4K MASTER
              </span>
            </div>

            {/* MONITEUR VIDÉO */}
            <div className="flex-1 min-h-[360px] rounded-xl bg-[#10100F] border border-white/10 flex flex-col items-center justify-center p-4 relative overflow-hidden group">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="size-12 rounded-2xl bg-[#D8FF64] text-[#171717] flex items-center justify-center animate-pulse">
                    <Film className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-heading text-[17px] font-normal text-white">
                      Rendu de scène en cours…
                    </h4>
                    <p className="text-[12px] text-white/50 max-w-xs mt-1">
                      Calcul des rayons volumétriques et cohérence du mouvement caméra.
                    </p>
                  </div>
                </div>
              ) : activeClip ? (
                <div className="size-full flex flex-col items-center justify-center relative">
                  <img
                    src={activeClip.mediaUrl}
                    alt=""
                    className="max-h-[400px] w-auto max-w-full rounded-lg shadow-2xl object-contain"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-[#D8FF64]">
                    {activeClip.model} • {activeClip.ratio}
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-black/80 backdrop-blur border border-white/10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[11px] text-white/80 font-mono truncate max-w-[200px]">
                      {activeClip.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={activeClip.mediaUrl}
                        download={`cinema-${activeClip.id}.mp4`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Télécharger le master"
                      >
                        <Download className="size-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(activeClip.prompt)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Copier le prompt"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center p-6 text-white/40">
                  <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Clapperboard className="size-6 text-white/40" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-white">
                      Aucun plan tourné dans cette session
                    </p>
                    <p className="text-[12px] text-white/50 mt-1 max-w-xs">
                      Sélectionnez un moteur de rendu, réglez votre caméra et lancez le tournage.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* MINI GALLERIE DES RUSHES */}
            {generatedClips.length > 1 && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <span className="text-[11px] uppercase tracking-wider font-mono text-white/40 block mb-2">
                  Rushes du projet
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {generatedClips.map((clip) => (
                    <button
                      key={clip.id}
                      type="button"
                      onClick={() => setActiveClip(clip)}
                      className={cn(
                        "w-14 h-14 rounded-lg overflow-hidden border shrink-0 transition-all",
                        activeClip?.id === clip.id
                          ? "border-[#D8FF64] ring-2 ring-[#D8FF64]/40 scale-105"
                          : "border-white/10 opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={clip.mediaUrl} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <TopupModal
        isOpen={topupOpen}
        onClose={() => setTopupOpen(false)}
        initialPackId="pack_createur"
        onSuccess={() => {
          setTopupOpen(false);
          refreshCredits();
        }}
      />
    </div>
  );
}

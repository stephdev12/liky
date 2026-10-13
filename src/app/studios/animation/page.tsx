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
import { Loader2, Clapperboard, Sparkles, Film, Palette, Layers, Download, Copy, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimationStyle {
  id: string;
  name: string;
  desc: string;
  previewUrl: string;
}

const STYLES: AnimationStyle[] = [
  { id: "3d_stylized", name: "3D Stylisé (Pixar/Disney)", desc: "Personnages expressifs, textures douces et éclairage magique", previewUrl: "/assets/studios/studio-animation.jpg" },
  { id: "2d_anime", name: "2D Anime & Manga", desc: "Trait dynamique japonais, ombrages cel-shading et vitesse", previewUrl: "/assets/studios/studio-cinema.jpg" },
  { id: "stickman", name: "Stickman Viral TikTok", desc: "Animations d'action minimalistes ultra-fluides et addictives", previewUrl: "/assets/studios/studio-libre.jpg" },
  { id: "dark_fantasy", name: "Dark Fantasy Stylisé", desc: "Ambiance médiévale mystique, armures et créatures féeriques", previewUrl: "/assets/studios/studio-ad-builder.jpg" },
];

export default function AnimationStudioPage() {
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

  const [selectedStyle, setSelectedStyle] = useState<string>("3d_stylized");
  const [characterName, setCharacterName] = useState<string>("Boby le Petit Robot");
  const [storyIdea, setStoryIdea] = useState<string>(
    "Un petit robot curieux trouve la dernière fleur vivante dans une mégalopole futuriste sous la pluie."
  );

  // Découpage en 3 scènes virales
  const [scene1, setScene1] = useState<string>("Plan d'ensemble : Boby découvre une petite fleur lumineuse sous un néon.");
  const [scene2, setScene2] = useState<string>("Plan rapproché : Un drone de nettoyage s'approche menaçant, Boby la protège de son corps.");
  const [scene3, setScene3] = useState<string>("Chute : Le drone scanne la fleur, sourit et partage un rayon de soleil avec Boby.");

  const [aspectRatio, setAspectRatio] = useState<string>("9:16");
  const [topupOpen, setTopupOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [renderedScene, setRenderedScene] = useState<{
    id: string;
    mediaUrl: string;
    title: string;
    style: string;
  } | null>(null);

  const creditsCost = 18; // Modèle Veo 3.1 Animation

  const handleGenerateStory = async () => {
    if (!storyIdea.trim()) {
      setErrorMsg("Veuillez décrire l'histoire ou l'idée de votre court-métrage.");
      return;
    }

    if (credits < creditsCost) {
      setTopupOpen(true);
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    const styleObj = STYLES.find((s) => s.id === selectedStyle) || STYLES[0];
    const compiledPrompt = `High quality animated short scene in ${styleObj.name} aesthetic. Character: ${characterName}. Narrative: ${storyIdea}. Scene action: ${scene1}. Stylized 3D rendering, expressive facial animation, cinematic framing, smooth whimsical motion, vibrant color grading.`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "video",
          model: "veo-3-1",
          prompt: compiledPrompt,
          aspectRatio,
          duration: 8,
          creditsCost,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du rendu de l'animation.");
      }

      setRenderedScene({
        id: data.taskId || `anim_${Date.now()}`,
        mediaUrl: data.resultUrl || "/assets/studios/studio-animation.jpg",
        title: characterName,
        style: styleObj.name,
      });
      refreshCredits();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de génération.");
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[var(--lime)] selection:text-black">
      {/* ── HEADER DE L'ANIMATION STUDIO ── */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--line)] px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/studios"
            className="flex items-center justify-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-full bg-[var(--surf)] border border-[var(--line)] shadow-card text-[12px] font-medium text-[var(--ink)] hover:border-[var(--ink)]/40 hover:bg-[var(--hover)] transition-all shrink-0"
          >
            <CoolIcon name="arrow-left-sm" size={14} duotone={false} className="shrink-0 text-[var(--ink)]" />
            <span className="hidden sm:inline font-sans">Retour aux studios</span>
          </Link>
          <div className="h-4 w-px bg-[var(--line)] hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[var(--lime)] text-[#171717] font-mono text-[10.5px] font-semibold">
              05
            </span>
            <h1 className="font-heading text-[17px] sm:text-[19px] font-normal tracking-tight">
              Animation Studio <span className="font-serif italic text-muted-foreground text-[14px]">Storytelling IA</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setTopupOpen(true)}
            className="h-8 px-3 rounded-full bg-[var(--surf)] border border-[var(--line)] shadow-card flex items-center gap-1.5 text-[12px] font-mono font-medium hover:border-[var(--line-strong)] transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-[#D8FF64] ring-2 ring-emerald-500/20" />
            <span>{credits} cr</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* ── WORKSPACE ANIMATION ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CONFIGURATION SCÉNARIO & STYLE (7 COLONNES) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* ÉTAPE 1 : STYLE GRAPHIQUE */}
          <div className="p-5 rounded-2xl bg-[var(--surf)] border border-[var(--line)] shadow-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="size-4 text-[var(--mute)]" />
                <h2 className="text-[14px] font-semibold text-[var(--ink)]">
                  1. Direction artistique & Style d&apos;animation
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {STYLES.map((st) => {
                const active = selectedStyle === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStyle(st.id)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all flex flex-col justify-between",
                      active
                        ? "bg-[var(--mn)] border-[var(--ink)] shadow-xs ring-1 ring-[var(--ink)]"
                        : "bg-[var(--bg)] border-[var(--line)] hover:border-[var(--line-strong)]"
                    )}
                  >
                    <span className="font-semibold text-[13px] text-[var(--ink)] block">
                      {st.name}
                    </span>
                    <span className="text-[11px] text-[var(--mute)] block mt-1 leading-relaxed">
                      {st.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ÉTAPE 2 : PERSONNAGE & HISTOIRE */}
          <div className="p-5 rounded-2xl bg-[var(--surf)] border border-[var(--line)] shadow-card flex flex-col gap-4">
            <h2 className="text-[14px] font-semibold text-[var(--ink)]">
              2. Personnage & Scénario
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">
                  Nom du personnage principal
                </label>
                <Input
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="h-10 rounded-xl bg-[var(--bg)] border-[var(--line)] text-[13px]"
                />
              </div>

              <div>
                <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">
                  Cadrage
                </label>
                <div className="flex gap-2">
                  {["9:16", "16:9"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={cn(
                        "flex-1 h-10 rounded-xl border font-mono text-[12px] transition-all",
                        aspectRatio === r
                          ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)] font-semibold"
                          : "bg-[var(--bg)] text-[var(--mute)] border-[var(--line)]"
                      )}
                    >
                      {r} {r === "9:16" ? "(TikTok)" : "(Ciné)"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">
                Idée centrale de l&apos;histoire
              </label>
              <textarea
                value={storyIdea}
                onChange={(e) => setStoryIdea(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-[var(--bg)] border border-[var(--line)] p-3 text-[13px] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] resize-none"
              />
            </div>

            {/* DÉCOUPAGE EN SCÈNES */}
            <div className="space-y-2.5 pt-1">
              <label className="text-[11.5px] font-medium text-[var(--mute)] block">
                Découpage en scènes d&apos;animation
              </label>
              <div className="p-3 rounded-xl bg-[var(--mn)]/40 border border-[var(--line)] space-y-2">
                <div>
                  <span className="text-[10.5px] uppercase font-mono text-[var(--mute)] block mb-0.5">Scène 1 • Accroche</span>
                  <Input value={scene1} onChange={(e) => setScene1(e.target.value)} className="h-8 bg-[var(--bg)] text-[12px]" />
                </div>
                <div>
                  <span className="text-[10.5px] uppercase font-mono text-[var(--mute)] block mb-0.5">Scène 2 • Péripétie</span>
                  <Input value={scene2} onChange={(e) => setScene2(e.target.value)} className="h-8 bg-[var(--bg)] text-[12px]" />
                </div>
                <div>
                  <span className="text-[10.5px] uppercase font-mono text-[var(--mute)] block mb-0.5">Scène 3 • Chute</span>
                  <Input value={scene3} onChange={(e) => setScene3(e.target.value)} className="h-8 bg-[var(--bg)] text-[12px]" />
                </div>
              </div>
            </div>

            {errorMsg && (
              <p className="text-[12px] text-red-500 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                {errorMsg}
              </p>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-[var(--line)]">
              <span className="text-[12px] text-[var(--mute)] font-mono">
                Coût du plan : <b>{creditsCost} crédits</b> (Google Veo 3.1)
              </span>

              <Button
                onClick={handleGenerateStory}
                disabled={isGenerating || !storyIdea.trim()}
                className="h-11 px-6 rounded-xl bg-[var(--lime)] text-[#171717] hover:bg-[#cbf54a] font-semibold text-[13px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Animation de la scène…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2" />
                    Générer la scène animée
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* COLONNE VISIONNAGE COURT-MÉTRAGE (5 COLONNES) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-[var(--surf)] border border-[var(--line)] shadow-card flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clapperboard className="size-4 text-[var(--mute)]" />
                <h3 className="text-[14px] font-semibold text-[var(--ink)]">
                  Table d&apos;animation
                </h3>
              </div>
            </div>

            <div className="flex-1 min-h-[360px] rounded-xl bg-[var(--mn)]/40 border border-dashed border-[var(--line)] flex flex-col items-center justify-center p-4 relative overflow-hidden group">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <Loader2 className="size-8 animate-spin text-emerald-600 dark:text-emerald-400" />
                  <p className="text-[12px] text-[var(--mute)] font-medium">
                    Interpolation des poses clés et rendu de la scène…
                  </p>
                </div>
              ) : renderedScene ? (
                <div className="size-full flex flex-col items-center justify-center relative">
                  <img src={renderedScene.mediaUrl} alt="" className="max-h-[400px] w-auto max-w-full rounded-lg shadow-raised object-contain" />
                  <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-[var(--surf)]/90 backdrop-blur border border-[var(--line)] flex items-center justify-between">
                    <span className="text-[11px] font-medium truncate max-w-[200px]">
                      {renderedScene.title} • {renderedScene.style}
                    </span>
                    <a
                      href={renderedScene.mediaUrl}
                      download={`animation-${renderedScene.id}.mp4`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-[var(--mn)] text-[var(--ink)] transition-colors"
                      title="Télécharger"
                    >
                      <Download className="size-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-6 text-center text-[var(--mute)]">
                  <Film className="size-8 text-[var(--mute)]" />
                  <span className="text-[12px] font-medium text-[var(--ink)]">
                    Scène animée en attente
                  </span>
                  <span className="text-[11px] text-[var(--mute)]">
                    Configurez le style et les scènes puis lancez le moteur
                  </span>
                </div>
              )}
            </div>
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

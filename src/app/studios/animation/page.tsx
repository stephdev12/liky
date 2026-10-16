"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CoolIcon } from "@/components/icons/coolicon";
import { LogoIcon } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { TopupModal } from "@/components/topup-modal";
import { SectionShowcase } from "@/components/section-showcase";
import { ResultBubble, type GenerationResultData } from "@/components/result-bubble";
import { StudioPromptBubble, type StudioImageRef } from "@/components/studios/studio-prompt-bubble";
import { AnimationStoryDrawer, type AnimationStoryData } from "@/components/studios/studio-drawers";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AnimationStudioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(60);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [topupOpen, setTopupOpen] = useState(false);

  // État du prompt et réglages Animation
  const [prompt, setPrompt] = useState(
    "Animation 3D féerique d'un petit robot découvrant une fleur lumineuse dans une ruelle futuriste sous la pluie néon, textures Pixar, rendu volumétrique doux."
  );
  const [settings, setSettings] = useState({
    style: "3d_stylized",
    format: "9:16",
    duration: 8,
  });

  // Drawer Scénario
  const [storyDrawerOpen, setStoryDrawerOpen] = useState(false);
  const [storyData, setStoryData] = useState<AnimationStoryData>({
    scene1: "Plan d'ensemble : Boby découvre une petite fleur lumineuse sous un néon.",
    scene2: "Plan rapproché : Un drone de nettoyage s'approche menaçant, Boby la protège de son corps.",
    scene3: "Chute : Le drone scanne la fleur, sourit et partage un rayon de soleil avec Boby.",
  });

  // Images uploadées pour les mentions @ (croquis de personnage, concept art...)
  const [uploadedImages, setUploadedImages] = useState<StudioImageRef[]>([]);

  // Cartes de générations
  const [cards, setCards] = useState<any[]>([]);
  const [activeResultCard, setActiveResultCard] = useState<GenerationResultData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Coût
  const cost = 18;

  // Chargement profil
  const refreshCredits = async () => {
    if (!user) return;
    const supabase = createClient();
    const { data: profile } = await supabase.from("profiles").select("credits").eq("id", user.id).maybeSingle();
    if (profile && typeof profile.credits === "number") setCredits(profile.credits);
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/auth");
      } else {
        setUser(session.user);
        supabase.from("profiles").select("credits").eq("id", session.user.id).maybeSingle().then(({ data }) => {
          if (data && typeof data.credits === "number") setCredits(data.credits);
        });
      }
      setAuthLoading(false);
    });
  }, [router]);

  // Upload d'images
  const handleAddImages = (files: FileList) => {
    Array.from(files).forEach((file, idx) => {
      const url = URL.createObjectURL(file);
      const cleanName = file.name.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || `char_${Date.now()}`;
      setUploadedImages((prev) => [
        ...prev,
        {
          id: `anim_${Date.now()}_${idx}`,
          name: cleanName,
          url,
        },
      ]);
    });
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Génération Animation
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (credits < cost) {
      setTopupOpen(true);
      return;
    }

    setIsGenerating(true);
    const cardId = `anim_${Date.now()}`;
    const newCard = {
      id: cardId,
      mode: "video",
      modelName: "veo-3-1",
      fullPrompt: prompt,
      status: "generating",
      creditsCost: cost,
      createdAt: Date.now(),
      orgIndex: 4,
    };

    setCards((prev) => [newCard, ...prev]);

    // Assemblage scénario si renseigné
    const styleLabel =
      settings.style === "3d_stylized"
        ? "3D stylized Pixar render"
        : settings.style === "2d_anime"
        ? "Japanese 2D Anime cel-shaded"
        : settings.style === "stickman"
        ? "Minimalist stickman fluid motion"
        : "Dark fantasy mystical aesthetic";

    const scenesDesc = storyData.scene1
      ? `, Narrative beat 1: ${storyData.scene1}, beat 2: ${storyData.scene2}, beat 3: ${storyData.scene3}`
      : "";
    const compiledPrompt = `${prompt.trim()}, Style: ${styleLabel}${scenesDesc}`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "video",
          model: "veo-3-1",
          prompt: compiledPrompt,
          aspectRatio: settings.format,
          duration: settings.duration,
          creditsCost: cost,
          referenceImageUrls: uploadedImages.map((i) => i.url),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? {
                ...c,
                status: "ready",
                mediaUrl: data.resultUrl || "/assets/studios/studio-animation.jpg",
              }
            : c
        )
      );
      refreshCredits();
    } catch {
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? {
                ...c,
                status: "ready",
                mediaUrl: "/assets/studios/studio-animation.jpg",
              }
            : c
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)] text-[var(--ink)]">
        <CoolIcon name="loading" size={24} className="animate-spin text-emerald-600 dark:text-emerald-400" duotone={false} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg)] text-[var(--ink)] overflow-x-hidden selection:bg-[var(--lime)] selection:text-black">
      {/* ── TOP BAR GAUCHE : RETOUR AUX STUDIOS + LOGO LIKYAI ── */}
      <header className="fixed top-[calc(14px+env(safe-area-inset-top,0px))] left-3 sm:left-4 z-30 flex items-center gap-2 sm:gap-2.5 pointer-events-auto">
        <button
          type="button"
          onClick={() => router.push("/studios")}
          className="flex items-center justify-center gap-1.5 h-[34px] sm:h-[36px] px-2.5 sm:px-3 rounded-full bg-[var(--surf)] border border-[var(--line)] shadow-card text-[12px] font-medium text-[var(--ink)] hover:border-[var(--ink)]/40 hover:bg-[var(--hover)] transition-all cursor-pointer shrink-0"
          title="Retour au Hub des studios"
        >
          <CoolIcon name="arrow-left-sm" size={14} duotone={false} className="shrink-0 text-[var(--ink)]" />
          <span className="hidden sm:inline font-sans text-[12px] font-medium text-[var(--ink)] tracking-normal">
            Retour aux studios
          </span>
        </button>

        <div className="cursor-pointer flex items-center gap-2 select-none hover:opacity-85 transition-opacity" onClick={() => router.push("/")}>
          <LogoIcon />
          <span className="hidden min-[420px]:inline font-heading text-[18px] sm:text-[20px] font-normal tracking-tight text-[var(--ink)]">
            Animation <span className="font-serif italic text-muted-foreground text-[14px]">Studio</span>
          </span>
        </div>
      </header>

      {/* ── ACTIONS HAUT DROITE (CRÉDITS, DRAWER SCÉNARIO & THÈME) ── */}
      <div className="fixed top-[calc(14px+env(safe-area-inset-top,0px))] right-3 sm:right-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setStoryDrawerOpen(true)}
          className="h-[34px] sm:h-[36px] px-3 rounded-full bg-[var(--surf)] border border-[var(--line)] shadow-card flex items-center gap-1.5 text-[12px] font-medium text-[var(--ink)] hover:border-[var(--line-strong)] transition-all cursor-pointer"
          title="Découpage en 3 scènes"
        >
          <CoolIcon name="note" size={14} duotone />
          <span className="hidden sm:inline">Scénario</span>
        </button>

        <button
          type="button"
          onClick={() => setTopupOpen(true)}
          className="h-[34px] sm:h-[36px] px-3 rounded-full bg-[var(--surf)] border border-[var(--line)] shadow-card flex items-center gap-1.5 text-[12px] font-mono font-medium hover:border-[var(--line-strong)] transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#D8FF64] ring-2 ring-emerald-500/20" />
          <span>{credits} cr</span>
        </button>
        <ThemeToggle />
      </div>

      {/* ── CANVAS DE TRAVAIL (GRILLE DES ANIMATIONS) ── */}
      <main id="board" className="relative w-full min-h-screen overflow-y-auto">
        <SectionShowcase
          mode="video"
          cards={cards}
          allModeCardsCount={cards.length}
          onOpenCard={(c) =>
            setActiveResultCard({
              id: c.id,
              tool: "video",
              modelName: c.modelName,
              prompt: c.fullPrompt,
              mediaUrl: c.mediaUrl || "/assets/studios/studio-animation.jpg",
              creditsCost: c.creditsCost,
              createdAt: Date.now(),
            })
          }
          onRetryCard={(c) => {
            setPrompt(c.fullPrompt);
            handleGenerate();
          }}
          onEditCard={(c) => setPrompt(c.fullPrompt)}
          onOpenLibrary={() => {}}
        />
      </main>

      {/* ── PROMPT BUBBLE DOCKÉE EN BAS ── */}
      <div className="dock fixed bottom-[calc(14px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-30 px-3 sm:px-4 pointer-events-auto">
        <StudioPromptBubble
          studio="animation"
          prompt={prompt}
          setPrompt={setPrompt}
          uploadedImages={uploadedImages}
          onAddImages={handleAddImages}
          onRemoveImage={handleRemoveImage}
          settings={settings}
          setSettings={setSettings}
          onOpenDrawer={() => setStoryDrawerOpen(true)}
          drawerLabel="Scénario & Scènes"
          drawerIcon="note"
          cost={cost}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />
      </div>

      {/* Drawer Scénario */}
      <AnimationStoryDrawer
        isOpen={storyDrawerOpen}
        onClose={() => setStoryDrawerOpen(false)}
        storyData={storyData}
        setStoryData={setStoryData}
      />

      {/* Modal de résultat */}
      {activeResultCard && (
        <ResultBubble
          isOpen={Boolean(activeResultCard)}
          onClose={() => setActiveResultCard(null)}
          result={activeResultCard}
          onRetry={(r) => {
            setPrompt(r.prompt);
            handleGenerate();
          }}
          onEdit={(r) => {
            setPrompt(r.prompt);
            setActiveResultCard(null);
          }}
        />
      )}

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

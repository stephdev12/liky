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
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

export default function CinemaStudioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(60);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [topupOpen, setTopupOpen] = useState(false);

  // État du prompt et réglages cinématiques
  const [prompt, setPrompt] = useState(
    "A 35mm film still of a solitary explorer stepping into an ancient cathedral, dust particles dancing in sunbeams, anamorphic lens flare, moody chiaroscuro lighting, 8k cinematic master."
  );
  const [settings, setSettings] = useState({
    model: "veo-3-1",
    ratio: "16:9",
    duration: 8,
    quality: "4K",
  });

  // Images uploadées pour les mentions @
  const [uploadedImages, setUploadedImages] = useState<StudioImageRef[]>([]);

  // Cartes de générations
  const [cards, setCards] = useState<any[]>([]);
  const [activeResultCard, setActiveResultCard] = useState<GenerationResultData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Coût calculé
  const cost = settings.model === "veo-3-1" ? 24 : settings.model === "seedance-2-5" ? 18 : 16;

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

  // Upload d'images de référence
  const handleAddImages = (files: FileList) => {
    Array.from(files).forEach((file, idx) => {
      const url = URL.createObjectURL(file);
      const cleanName = file.name.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || `ref_${Date.now()}`;
      setUploadedImages((prev) => [
        ...prev,
        {
          id: `img_${Date.now()}_${idx}`,
          name: cleanName,
          url,
        },
      ]);
    });
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Lancement du rendu cinématique
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (credits < cost) {
      setTopupOpen(true);
      return;
    }

    setIsGenerating(true);
    const cardId = `cin_${Date.now()}`;
    const newCard = {
      id: cardId,
      mode: "video",
      modelName: settings.model,
      fullPrompt: prompt,
      status: "generating",
      creditsCost: cost,
      createdAt: Date.now(),
      orgIndex: 1,
    };

    setCards((prev) => [newCard, ...prev]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "video",
          model: settings.model,
          prompt,
          aspectRatio: settings.ratio === "2.39:1" ? "16:9" : settings.ratio,
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
                mediaUrl: data.resultUrl || "/assets/studios/studio-cinema.jpg",
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
                mediaUrl: "/assets/studios/studio-cinema.jpg",
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
        <Loader2 className="size-6 animate-spin text-emerald-600 dark:text-emerald-400" />
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
            Cinéma <span className="font-serif italic text-muted-foreground text-[14px]">Studio</span>
          </span>
        </div>
      </header>

      {/* ── ACTIONS HAUT DROITE (CRÉDITS & THÈME) ── */}
      <div className="fixed top-[calc(14px+env(safe-area-inset-top,0px))] right-3 sm:right-4 z-30 flex items-center gap-2">
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

      {/* ── CANVAS DE TRAVAIL (GRILLE DES 4 DERNIÈRES CRÉATIONS) ── */}
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
              mediaUrl: c.mediaUrl || "/assets/studios/studio-cinema.jpg",
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
          studio="cinema"
          prompt={prompt}
          setPrompt={setPrompt}
          uploadedImages={uploadedImages}
          onAddImages={handleAddImages}
          onRemoveImage={handleRemoveImage}
          settings={settings}
          setSettings={setSettings}
          cost={cost}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />
      </div>

      {/* Modal de prévisualisation de résultat */}
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

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
import { UgcProductDrawer, type UgcProductData } from "@/components/studios/studio-drawers";
import { pollTaskUntilComplete } from "@/lib/tasks/poll-task";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function UgcStudioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(60);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [topupOpen, setTopupOpen] = useState(false);

  // État du prompt et réglages UGC
  const [prompt, setPrompt] = useState(
    "Léa teste le produit face caméra, montre la texture sur le dos de la main et partage son retour d'expérience avec enthousiasme et spontanéité."
  );
  const [settings, setSettings] = useState({
    creator: "lea",
    format: "9:16",
    style: "review",
    language: "Français",
  });

  // Drawer Produit UGC
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [productData, setProductData] = useState<UgcProductData>({
    name: "Sérum Botanique Éclat",
    url: "",
    benefits: "Hydratation instantanée, éclat naturel du teint en 3 jours",
  });

  // Images uploadées pour les mentions @ (flacon, packshot, texture...)
  const [uploadedImages, setUploadedImages] = useState<StudioImageRef[]>([]);

  // Cartes de générations
  const [cards, setCards] = useState<any[]>([]);
  const [activeResultCard, setActiveResultCard] = useState<GenerationResultData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Coût
  const cost = 16;

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
      const cleanName = file.name.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || `produit_${Date.now()}`;
      setUploadedImages((prev) => [
        ...prev,
        {
          id: `ugc_${Date.now()}_${idx}`,
          name: cleanName,
          url,
        },
      ]);
    });
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Génération UGC
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (credits < cost) {
      setTopupOpen(true);
      return;
    }

    setIsGenerating(true);
    const cardId = `ugc_${Date.now()}`;
    const newCard = {
      id: cardId,
      mode: "video",
      modelName: "seedance-2-5",
      fullPrompt: prompt,
      status: "generating",
      creditsCost: cost,
      createdAt: Date.now(),
      orgIndex: 3,
    };

    setCards((prev) => [newCard, ...prev]);

    // Assemblage contexte produit
    const productInfo = productData.name ? `, Produit: ${productData.name}` : "";
    const benefitsInfo = productData.benefits ? `, Points forts: ${productData.benefits}` : "";
    const creatorInfo = `, Créateur: ${settings.creator}, Style: ${settings.style}, Langue: ${settings.language}`;
    const compiledPrompt = `${prompt.trim()}${productInfo}${benefitsInfo}${creatorInfo}`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "video",
          model: "seedance-2-5",
          prompt: compiledPrompt,
          aspectRatio: settings.format,
          creditsCost: cost,
          referenceImageUrls: uploadedImages.map((i) => i.url),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de génération");

      if (data.taskId) {
        const pollResult = await pollTaskUntilComplete(data.taskId, (elapsed) => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === cardId ? { ...c, status: "thinking", elapsed } : c
            )
          );
        });

        if (pollResult.resultUrl) {
          setCards((prev) =>
            prev.map((c) =>
              c.id === cardId
                ? {
                    ...c,
                    status: "ready",
                    mediaUrl: pollResult.resultUrl,
                  }
                : c
            )
          );
        }
      } else if (data.resultUrl) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === cardId
              ? {
                  ...c,
                  status: "ready",
                  mediaUrl: data.resultUrl,
                }
              : c
          )
        );
      }
      refreshCredits();
    } catch (err: any) {
      console.error("UGC generation failed:", err);
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? {
                ...c,
                status: "failed",
                error: err?.message || "Échec de génération",
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
            UGC <span className="font-serif italic text-muted-foreground text-[14px]">Studio</span>
          </span>
        </div>
      </header>

      {/* ── ACTIONS HAUT DROITE (CRÉDITS, DRAWER PRODUIT & THÈME) ── */}
      <div className="fixed top-[calc(14px+env(safe-area-inset-top,0px))] right-3 sm:right-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setProductDrawerOpen(true)}
          className="h-[34px] sm:h-[36px] px-3 rounded-full bg-[var(--surf)] border border-[var(--line)] shadow-card flex items-center gap-1.5 text-[12px] font-medium text-[var(--ink)] hover:border-[var(--line-strong)] transition-all cursor-pointer"
          title="Fiche produit (nom, bénéfices, lien)"
        >
          <CoolIcon name="shopping-bag-01" size={14} duotone />
          <span className="hidden sm:inline">Produit</span>
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

      {/* ── CANVAS DE TRAVAIL (GRILLE DES VIDÉOS UGC) ── */}
      <main id="board" className="relative w-full min-h-screen overflow-y-auto">
        <SectionShowcase
          mode="video"
          cards={cards}
          allModeCardsCount={cards.length}
          onOpenCard={(c) => {
            if (!c.mediaUrl) return;
            setActiveResultCard({
              id: c.id,
              tool: "video",
              modelName: c.modelName,
              prompt: c.fullPrompt,
              mediaUrl: c.mediaUrl,
              creditsCost: c.creditsCost,
              createdAt: Date.now(),
            });
          }}
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
          studio="ugc"
          prompt={prompt}
          setPrompt={setPrompt}
          uploadedImages={uploadedImages}
          onAddImages={handleAddImages}
          onRemoveImage={handleRemoveImage}
          settings={settings}
          setSettings={setSettings}
          onOpenDrawer={() => setProductDrawerOpen(true)}
          drawerLabel="Fiche Produit"
          drawerIcon="shopping-bag-01"
          cost={cost}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />
      </div>

      {/* Drawer Produit UGC */}
      <UgcProductDrawer
        isOpen={productDrawerOpen}
        onClose={() => setProductDrawerOpen(false)}
        productData={productData}
        setProductData={setProductData}
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

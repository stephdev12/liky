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
import { AdBrandDrawer, type AdBrandData } from "@/components/studios/studio-drawers";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

export default function AdBuilderStudioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(60);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [topupOpen, setTopupOpen] = useState(false);

  // État du prompt et réglages publicitaires
  const [prompt, setPrompt] = useState(
    "Affiche publicitaire pour parfum d'exception. Flacon en verre ciselé posé sur marbre noir, reflets dorés, typographie sobre et élégante, 8k commercial photography."
  );
  const [settings, setSettings] = useState({
    type: "poster",
    format: "1080x1350",
    duration: 10,
  });

  // Drawer Marque & Brand Kit
  const [brandDrawerOpen, setBrandDrawerOpen] = useState(false);
  const [brandData, setBrandData] = useState<AdBrandData>({
    colors: ["#1B2E15", "#4B6B38", "#D8FF64", "#F4F7EE"],
    fonts: ["Newsreader", "Geist"],
    tone: ["Chaleureux", "Direct", "Accessible"],
  });

  // Images uploadées pour les mentions @
  const [uploadedImages, setUploadedImages] = useState<StudioImageRef[]>([]);

  // Cartes de générations
  const [cards, setCards] = useState<any[]>([]);
  const [activeResultCard, setActiveResultCard] = useState<GenerationResultData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Coût
  const cost = settings.type === "poster" ? 6 : settings.duration === 6 ? 12 : 18;

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
      const cleanName = file.name.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || `asset_${Date.now()}`;
      setUploadedImages((prev) => [
        ...prev,
        {
          id: `ad_${Date.now()}_${idx}`,
          name: cleanName,
          url,
        },
      ]);
    });
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Génération publicitaire
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (credits < cost) {
      setTopupOpen(true);
      return;
    }

    setIsGenerating(true);
    const cardId = `ad_${Date.now()}`;
    const newCard = {
      id: cardId,
      mode: settings.type === "poster" ? "image" : "video",
      modelName: settings.type === "poster" ? "gpt-image-2-5" : "seedance-2-5",
      fullPrompt: prompt,
      status: "generating",
      creditsCost: cost,
      createdAt: Date.now(),
      orgIndex: 2,
    };

    setCards((prev) => [newCard, ...prev]);

    // Intégration de la charte de marque dans le prompt
    const brandColorHint = brandData.colors.length > 0 ? `, Brand colors: ${brandData.colors.slice(0, 3).join(", ")}` : "";
    const brandToneHint = brandData.tone.length > 0 ? `, Style: ${brandData.tone.join(", ")}` : "";
    const compiledPrompt = `${prompt.trim()}${brandColorHint}${brandToneHint}`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: settings.type === "poster" ? "image" : "video",
          model: settings.type === "poster" ? "gpt-image-2-5" : "seedance-2-5",
          prompt: compiledPrompt,
          aspectRatio: settings.format.includes("x")
            ? (settings.format === "1080x1920" ? "9:16" : settings.format === "1080x1350" ? "4:5" : "1:1")
            : settings.format,
          duration: settings.type === "video" ? settings.duration : undefined,
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
                mediaUrl: data.resultUrl || "/assets/studios/studio-ad-builder.jpg",
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
                mediaUrl: "/assets/studios/studio-ad-builder.jpg",
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
            Ad Builder <span className="font-serif italic text-muted-foreground text-[14px]">Studio</span>
          </span>
        </div>
      </header>

      {/* ── ACTIONS HAUT DROITE (CRÉDITS, DRAWER MARQUE & THÈME) ── */}
      <div className="fixed top-[calc(14px+env(safe-area-inset-top,0px))] right-3 sm:right-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setBrandDrawerOpen(true)}
          className="h-[34px] sm:h-[36px] px-3 rounded-full bg-[var(--surf)] border border-[var(--line)] shadow-card flex items-center gap-1.5 text-[12px] font-medium text-[var(--ink)] hover:border-[var(--line-strong)] transition-all cursor-pointer"
          title="Gérer la marque (couleurs, polices, logo)"
        >
          <CoolIcon name="layers" size={14} duotone />
          <span className="hidden sm:inline">Ma Marque</span>
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

      {/* ── CANVAS DE TRAVAIL (RÉSULTATS DE CAMPAGNES) ── */}
      <main id="board" className="relative w-full min-h-screen overflow-y-auto">
        <SectionShowcase
          mode={settings.type === "poster" ? "image" : "video"}
          cards={cards}
          allModeCardsCount={cards.length}
          onOpenCard={(c) =>
            setActiveResultCard({
              id: c.id,
              tool: c.mode,
              modelName: c.modelName,
              prompt: c.fullPrompt,
              mediaUrl: c.mediaUrl || "/assets/studios/studio-ad-builder.jpg",
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
          studio="ad"
          prompt={prompt}
          setPrompt={setPrompt}
          uploadedImages={uploadedImages}
          onAddImages={handleAddImages}
          onRemoveImage={handleRemoveImage}
          settings={settings}
          setSettings={setSettings}
          onOpenDrawer={() => setBrandDrawerOpen(true)}
          drawerLabel="Marque & Brand Kit"
          drawerIcon="layers"
          cost={cost}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />
      </div>

      {/* Drawer Marque & Brand Kit */}
      <AdBrandDrawer
        isOpen={brandDrawerOpen}
        onClose={() => setBrandDrawerOpen(false)}
        brandData={brandData}
        setBrandData={setBrandData}
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

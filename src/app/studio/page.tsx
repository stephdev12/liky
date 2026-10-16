"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CoolIcon, type CoolIconKey } from "@/components/icons/coolicon";
import { LogoIcon } from "@/components/logo";
import { ResultBubble, type GenerationResultData } from "@/components/result-bubble";
import { SectionShowcase } from "@/components/section-showcase";
import { LibraryModal, type LibraryCardItem } from "@/components/library-modal";
import { TopupModal } from "@/components/topup-modal";
import { UnifiedPromptBubble } from "@/components/studio/unified-prompt-bubble";
import { SidebarDrawer } from "@/components/studio/sidebar-drawer";
import { ModelSelectorModal, ALL_MODELS, type ModelOption } from "@/components/studio/model-selector-modal";
import { AssetsModal, type AssetItem } from "@/components/studio/assets-modal";
import { InfluencerBuilderDrawer } from "@/components/studio/influencer-builder-drawer";
import { GenjutsuDrawer } from "@/components/studio/genjutsu-drawer";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
 * CATÉGORIES PRINCIPALES (Image · Vidéo · Musique · Voix off)
 * ───────────────────────────────────────────────────────── */
const CATEGORIES: { id: "image" | "video" | "music" | "voice"; label: string; icon: CoolIconKey }[] = [
  { id: "video", label: "Vidéo", icon: "camera" },
  { id: "image", label: "Image", icon: "image-01" },
  { id: "music", label: "Musique", icon: "headphones" },
  { id: "voice", label: "Voix off", icon: "user-voice" },
];

/* Type de carte pour le canvas et la bibliothèque */
export type CanvasCard = LibraryCardItem & {
  vt?: string | null;
  thinkingStage?: number;
  expandedThinking?: boolean;
};

export default function StudioPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // État de création & paramètres de génération
  const [mode, setMode] = useState<"image" | "video" | "music" | "voice">("video");
  const [selectedModelId, setSelectedModelId] = useState<string>("auto");
  const [selectedModelName, setSelectedModelName] = useState<string>("Auto");
  const [aspectRatio, setAspectRatio] = useState<string>("9:16");
  const [prompt, setPrompt] = useState<string>("");
  const [credits, setCredits] = useState<number>(60);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [cards, setCards] = useState<CanvasCard[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Assets sélectionnés pour les références et mentions @
  const [selectedAssets, setSelectedAssets] = useState<AssetItem[]>([]);
  const [customAssets, setCustomAssets] = useState<AssetItem[]>([]);

  // Modales & Tiroirs
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [assetsModalOpen, setAssetsModalOpen] = useState(false);
  const [influencerOpen, setInfluencerOpen] = useState(false);
  const [genjutsuOpen, setGenjutsuOpen] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  // Bulle d'affichage du résultat
  const [activeResult, setActiveResult] = useState<GenerationResultData | null>(null);
  const [resultBubbleOpen, setResultBubbleOpen] = useState(false);

  // Thème clair / sombre
  const [isDark, setIsDark] = useState(true);

  /* Calcul du coût en crédits dynamique selon le modèle choisi */
  const calculateCurrentCost = (): number => {
    if (selectedModelId !== "auto") {
      const found = ALL_MODELS.find((m) => m.id === selectedModelId);
      if (found) return found.creditsCost;
    }
    // Modèle Auto selon la catégorie
    switch (mode) {
      case "video":
        return 16;
      case "image":
        return 5;
      case "music":
        return 10;
      case "voice":
        return 2;
      default:
        return 16;
    }
  };

  const currentCost = calculateCurrentCost();

  /* Toast notification */
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  /* Chargement des données réelles de l'utilisateur (Supabase) */
  const loadUserData = async (userId: string) => {
    const supabase = createClient();
    try {
      // 1. Profil & crédits réels
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", userId)
        .maybeSingle();

      if (profile && typeof profile.credits === "number") {
        setCredits(profile.credits);
      }

      // 2. Créations réelles de cet utilisateur
      const { data: userGens, error } = await supabase
        .from("generations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (userGens && !error && userGens.length > 0) {
        const formattedCards: CanvasCard[] = userGens.map((g, idx) => ({
          id: g.task_id || g.id,
          mode: g.tool as "image" | "video" | "music" | "voice",
          caption: g.prompt.slice(0, 46) + (g.prompt.length > 46 ? "…" : ""),
          fullPrompt: g.prompt,
          modelName: g.model_name,
          mediaUrl: g.media_url || (g.thumbnail_url ?? undefined),
          thumbnailUrl: g.thumbnail_url || (g.tool === "video" ? undefined : g.media_url),
          creditsCost: g.credits_cost,
          status: g.status === "success" || g.status === "fail" ? "ready" : "thinking",
          elapsed: g.duration_seconds || 0,
          orgIndex: idx % 4,
          params: (g.parameters as Record<string, any>) || {},
          createdAt: new Date(g.created_at).getTime(),
        }));
        setCards(formattedCards);
      }
    } catch (err) {
      console.warn("Erreur chargement Supabase studio:", err);
    }
  };

  /* Vérification authentification & Session Supabase */
  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (!session?.user) {
        router.replace("/auth");
      } else {
        setUser(session.user);
        loadUserData(session.user.id);
      }
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (!session?.user) {
        router.replace("/auth");
      } else {
        setUser(session.user);
      }
    });

    // Initialisation Thème
    try {
      const savedTheme = localStorage.getItem("studio_theme") as "light" | "dark" | null;
      if (savedTheme) {
        document.documentElement.dataset.theme = savedTheme;
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
        setIsDark(savedTheme === "dark");
      } else {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDark(mq.matches);
        document.documentElement.classList.toggle("dark", mq.matches);
      }
    } catch {}

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  /* Sauvegarde solde crédits */
  const saveCredits = async (newCredits: number) => {
    setCredits(newCredits);
    if (user) {
      try {
        const supabase = createClient();
        await supabase.from("profiles").update({ credits: newCredits }).eq("id", user.id);
      } catch {}
    }
  };

  /* Bascule de thème */
  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setIsDark(next === "dark");
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("studio_theme", next);
    } catch {}
  };

  /* Déconnexion */
  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Erreur déconnexion:", err);
    }
    setUser(null);
    router.replace("/auth");
  };

  /* Polling de la tâche de génération jusqu'à complétion */
  const pollTaskUntilDone = (
    taskId: string,
    cardId: string,
    modelName: string,
    fullPromptText: string,
    cost: number
  ) => {
    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = 120; // 3 minutes max

    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setIsGenerating(false);
        setCards((cur) =>
          cur.map((c) =>
            c.id === cardId
              ? { ...c, status: "ready", caption: "Délai de traitement dépassé" }
              : c
          )
        );
        showToast("Le traitement a pris plus de temps que prévu.");
        return;
      }

      try {
        const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.state === "generating" || data.status === "generating") {
          setCards((cur) =>
            cur.map((c) =>
              c.id === cardId
                ? {
                    ...c,
                    status: "thinking",
                    elapsed: Math.round((Date.now() - startTime) / 1000),
                  }
                : c
            )
          );
        } else if (data.state === "success" || data.status === "success") {
          clearInterval(interval);
          setIsGenerating(false);

          const finalUrl =
            data.response?.resultUrls?.[0] ||
            data.resultUrl ||
            data.mediaUrl ||
            `/assets/organic/organic-${Math.floor(Math.random() * 4) + 1}.webp`;

          const finalElapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));

          setCards((cur) =>
            cur.map((c) =>
              c.id === cardId
                ? {
                    ...c,
                    status: "ready",
                    mediaUrl: finalUrl,
                    elapsed: finalElapsed,
                  }
                : c
            )
          );

          // Synchronisation Supabase
          if (user) {
            try {
              const supabase = createClient();
              supabase
                .from("generations")
                .update({
                  status: "success",
                  media_url: finalUrl,
                  duration_seconds: finalElapsed,
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", user.id)
                .eq("task_id", cardId)
                .then(() => {});
            } catch {}
          }

          showToast("Votre création est prête !");

          // Ouvre la bulle de résultat
          setActiveResult({
            id: cardId,
            tool: mode,
            modelName,
            prompt: fullPromptText,
            mediaUrl: finalUrl,
            creditsCost: cost,
            elapsedTime: finalElapsed,
            params: {
              aspectRatio,
              modelId: selectedModelId,
            },
            createdAt: Date.now(),
          });
          setResultBubbleOpen(true);
        } else if (data.state === "fail" || data.status === "fail") {
          clearInterval(interval);
          setIsGenerating(false);
          const errorMsg = data.failMsg || data.error || "La génération a échoué";
          setCards((cur) =>
            cur.map((c) =>
              c.id === cardId
                ? {
                    ...c,
                    status: "ready",
                    caption: `Échec : ${errorMsg}`,
                  }
                : c
            )
          );
          showToast(`Erreur : ${errorMsg}`);
        }
      } catch (err) {
        console.warn("Erreur polling studio:", err);
      }
    }, 1500);
  };

  /* Lancement de la génération depuis la UnifiedPromptBubble */
  const handleGenerate = async () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      showToast("Veuillez décrire votre création");
      return;
    }

    if (currentCost > credits) {
      showToast("Solde insuffisant pour cette création.");
      setTopupOpen(true);
      return;
    }

    setIsGenerating(true);

    // Déduction des crédits
    const newCredits = credits - currentCost;
    saveCredits(newCredits);

    const cardId = `card-${Date.now()}`;
    const chosenModelName =
      selectedModelId === "auto"
        ? `Auto (${mode === "video" ? "Seedance 2.5" : mode === "image" ? "Nano Banana 2.1" : mode === "music" ? "Suno v6" : "ElevenLabs"})`
        : selectedModelName;

    const newCard: CanvasCard = {
      id: cardId,
      mode,
      caption: cleanPrompt.slice(0, 46) + (cleanPrompt.length > 46 ? "…" : ""),
      fullPrompt: cleanPrompt,
      modelName: chosenModelName,
      creditsCost: currentCost,
      status: "thinking",
      elapsed: 0,
      orgIndex: Math.floor(Math.random() * 4),
      params: {
        aspectRatio,
        modelId: selectedModelId,
        assetsCount: selectedAssets.length,
      },
      createdAt: Date.now(),
    };

    setCards((cur) => [newCard, ...cur]);
    setPrompt("");

    // Enregistrement initial dans Supabase
    if (user) {
      try {
        const supabase = createClient();
        supabase
          .from("generations")
          .insert({
            user_id: user.id,
            task_id: cardId,
            tool: mode,
            model_name: chosenModelName,
            prompt: cleanPrompt,
            status: "generating",
            credits_cost: currentCost,
            parameters: {
              aspectRatio,
              modelId: selectedModelId,
              selectedAssets: selectedAssets.map((a) => a.name),
            },
          })
          .then(() => {});
      } catch {}
    }

    // Détermination de l'ID du modèle à router
    const targetModelId =
      selectedModelId === "auto"
        ? mode === "video"
          ? "seedance-2-5"
          : mode === "image"
          ? "nano-banana-2-1"
          : mode === "music"
          ? "suno-v6"
          : "elevenlabs"
        : selectedModelId;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: mode,
          modelId: targetModelId,
          prompt: cleanPrompt,
          aspectRatio,
          referenceImageUrls: selectedAssets.map((a) => a.url),
          creditsCost: currentCost,
          params: {
            aspectRatio,
            assets: selectedAssets.map((a) => ({ id: a.id, name: a.name, url: a.url })),
          },
        }),
      });

      const data = await res.json();

      if (data.success && data.taskId) {
        pollTaskUntilDone(data.taskId, cardId, chosenModelName, cleanPrompt, currentCost);
      } else {
        const errorMsg = data.error || "Échec lors du lancement de la tâche";
        setIsGenerating(false);
        setCards((cur) =>
          cur.map((c) =>
            c.id === cardId
              ? {
                  ...c,
                  status: "ready",
                  caption: `Erreur : ${errorMsg}`,
                }
              : c
          )
        );
        showToast(`Erreur : ${errorMsg}`);
      }
    } catch (err) {
      console.error("Erreur appel /api/generate:", err);
      setIsGenerating(false);
      setCards((cur) =>
        cur.map((c) =>
          c.id === cardId
            ? {
                ...c,
                status: "ready",
                caption: "Erreur de connexion au serveur",
              }
            : c
        )
      );
      showToast("Erreur de connexion lors du lancement.");
    }
  };

  /* Ouvre la bulle de résultat */
  const openResultForCard = (c: CanvasCard) => {
    if (c.status !== "ready") return;
    setActiveResult({
      id: c.id,
      tool: c.mode,
      modelName: c.modelName,
      prompt: c.fullPrompt,
      mediaUrl: c.mediaUrl || `/assets/organic/organic-${((c.orgIndex ?? 0) % 4) + 1}.webp`,
      creditsCost: c.creditsCost,
      elapsedTime: c.elapsed,
      params: c.params,
      createdAt: c.createdAt || Date.now(),
    });
    setResultBubbleOpen(true);
  };

  /* Animer une image en vidéo */
  const handleAnimateImage = (item: { mediaUrl?: string; fullPrompt?: string; prompt?: string }) => {
    setResultBubbleOpen(false);
    setMode("video");
    setSelectedModelId("seedance-2-5");
    setSelectedModelName("Seedance 2.5");
    if (item.mediaUrl) {
      const assetRef: AssetItem = {
        id: `anim-${Date.now()}`,
        name: "Image source",
        url: item.mediaUrl,
        type: "upload",
      };
      setSelectedAssets([assetRef]);
    }
    setPrompt(
      item.fullPrompt
        ? `Animation cinématographique dynamique : ${item.fullPrompt}`
        : "Animation vidéo cinématographique fluide, lumière vivante"
    );
    showToast("Image ajoutée en référence ! Cliquez sur générer pour animer.");
  };

  /* Modifier depuis un résultat */
  const handleEditFromResult = (res: GenerationResultData) => {
    setResultBubbleOpen(false);
    setMode(res.tool);
    setPrompt(res.prompt);
    showToast("Paramètres chargés dans la zone de texte");
  };

  /* Réessayer depuis un résultat */
  const handleRetryFromResult = (res: GenerationResultData) => {
    setResultBubbleOpen(false);
    setMode(res.tool);
    setPrompt(res.prompt);
    setTimeout(() => {
      handleGenerate();
    }, 100);
  };

  /* Gestion de la création d'un influenceur IA */
  const handleCharacterCreated = (char: { id: string; name: string; avatarUrl: string; summary: string }) => {
    const newAsset: AssetItem = {
      id: char.id,
      name: char.name,
      url: char.avatarUrl,
      type: "influencer",
    };
    setCustomAssets((prev) => [newAsset, ...prev]);
    setSelectedAssets((prev) => [...prev, newAsset]);
    setPrompt((prev) => `${prev} @${char.name} `.trimStart());
    showToast(`Personnage ${char.name} créé et ajouté en référence (@) !`);
  };

  /* Gestion du transfert de mouvement Genjutsu */
  const handleGenjutsuLaunch = (data: {
    mode: "motion" | "swap";
    videoUrl?: string;
    imageUrls: string[];
    prompt?: string;
    quality: string;
  }) => {
    setGenjutsuOpen(false);
    setMode("video");
    setSelectedModelId("genjutsu-motion");
    setSelectedModelName("Genjutsu Motion Transfer");
    if (data.imageUrls.length > 0) {
      const imgAssets: AssetItem[] = data.imageUrls.map((url, i) => ({
        id: `genjutsu-img-${i}`,
        name: `Référence ${i + 1}`,
        url,
        type: "upload",
      }));
      setSelectedAssets(imgAssets);
    }
    setPrompt(data.prompt || "Transfert de mouvement fluide haute fidélité");
    showToast("Paramètres Genjutsu appliqués ! Lancez la création.");
  };

  /* Gestion du téléversement de fichiers */
  const handleUploadFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        if (url) {
          const newAsset: AssetItem = {
            id: `up-${Date.now()}-${Math.random()}`,
            name: file.name.replace(/\.[^/.]+$/, ""),
            url,
            type: "upload",
          };
          setCustomAssets((prev) => [newAsset, ...prev]);
          setSelectedAssets((prev) => [...prev, newAsset]);
          showToast(`Fichier "${file.name}" ajouté aux références !`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  /* Loader initial pendant la vérification Supabase */
  if (authLoading || !user) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--ink)] select-none">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-[16px] bg-[#D8FF64] flex items-center justify-center shadow-lg text-black">
            <CoolIcon name="star" size={24} className="text-black" duotone={false} />
          </div>
          <div className="flex items-center gap-2">
            <CoolIcon name="loading" size={16} className="animate-spin text-[#D8FF64]" duotone={false} />
            <span className="text-[13px] font-medium text-[var(--mute)]">
              Accès sécurisé au Studio likyAI…
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[#D8FF64] selection:text-black transition-colors duration-200">
      {/* ── TOP BAR ÉPURÉE : TOGGLE SIDEBAR + UPGRADE CRÉDITS + THEMETOGGLE + AVATAR ── */}
      <header className="fixed top-0 inset-x-0 h-14 sm:h-16 px-3 sm:px-6 z-30 flex items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-md">
        {/* Côté Gauche : Bouton Navbar Latérale */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-full bg-[var(--field)] hover:bg-[var(--hover)] border border-[var(--line)] flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--ink)] transition-all cursor-pointer"
            title="Ouvrir le menu des studios"
            aria-label="Ouvrir le menu"
          >
            <CoolIcon name="hamburger-md" size={18} duotone={false} />
          </button>

          <div
            className="cursor-pointer flex items-center gap-2 select-none hover:opacity-85 transition-opacity pl-1"
            onClick={() => router.push("/")}
            title="Accueil LikyAI"
          >
            <LogoIcon />
            <span className="font-heading text-[18px] sm:text-[19px] font-semibold tracking-tight text-[var(--ink)]">
              liky<span className="text-[#D8FF64]">AI</span>
            </span>
          </div>
        </div>

        {/* Côté Droit : Upgrade Crédits + ThemeToggle + Bibliothèque + Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Bouton Upgrade Lime avec Diamant / Étoile */}
          <button
            type="button"
            onClick={() => setTopupOpen(true)}
            className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-full bg-[#D8FF64] hover:bg-[#cbf54a] text-black font-semibold text-[12px] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Recharger vos crédits"
          >
            <CoolIcon name="star" size={13} duotone={false} className="text-black fill-current" />
            <span>Upgrade</span>
            <span className="font-mono text-[11px] opacity-75 font-normal">({credits} cr)</span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Bibliothèque */}
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--field)] hover:bg-[var(--hover)] border border-[var(--line)] flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--ink)] transition-all cursor-pointer"
            title="Bibliothèque de créations"
          >
            <CoolIcon name="folder-open" size={16} duotone className="text-[var(--mute)]" />
          </button>

          {/* Avatar utilisateur */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--field)] border border-[var(--line)] text-[var(--ink)] font-medium text-[12px] sm:text-[13px] flex items-center justify-center cursor-pointer hover:border-[#D8FF64]/50 transition-colors"
            title={user?.email || "Mon compte"}
          >
            {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
          </button>
        </div>
      </header>

      {/* ── WORKSPACE CENTRAL ÉPURÉ ── */}
      <main className="flex-1 w-full flex flex-col pt-18 sm:pt-20 pb-16 overflow-y-auto">
        {cards.length === 0 ? (
          /* Écran d'accueil centralisé avec Unified Prompt Bubble & Carousel */
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-6 sm:py-10 text-center animate-in fade-in duration-300 w-full">
            
            {/* Logo Central LikyAI */}
            <div className="flex flex-col items-center gap-3 mb-6 select-none">
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center shadow-md p-2.5">
                <LogoIcon />
              </div>
              <h1 className="font-heading text-xl sm:text-2xl font-semibold tracking-tight text-[var(--ink)]">
                What image or video would you like to create?
              </h1>
            </div>

            {/* Bulle de prompt unifiée centrale */}
            <div className="w-full mb-3.5">
              <UnifiedPromptBubble
                prompt={prompt}
                setPrompt={setPrompt}
                selectedModelName={selectedModelName}
                onOpenModelSelector={() => setModelSelectorOpen(true)}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                onOpenAssets={() => setAssetsModalOpen(true)}
                selectedAssets={selectedAssets}
                onRemoveAsset={(id) => setSelectedAssets((cur) => cur.filter((a) => a.id !== id))}
                onOpenInfluencerBuilder={() => setInfluencerOpen(true)}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                creditsCost={currentCost}
              />
            </div>

            {/* Pill de connexion MCP / Outils IA */}
            <button
              type="button"
              onClick={() => router.push("/mcp/authorize")}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--line)] text-[12px] text-[var(--ink-2)] hover:text-[var(--ink)] transition-all cursor-pointer mb-8 group shadow-xs"
            >
              <CoolIcon name="instance" size={14} duotone className="text-[var(--mute)] group-hover:text-[#D8FF64]" />
              <span>Extension MCP & API connectée</span>
              <span className="text-[#8ca825] dark:text-[#D8FF64] font-medium flex items-center gap-0.5">
                Connect <CoolIcon name="arrow-right-sm" size={11} duotone={false} />
              </span>
            </button>

            {/* Carrousel horizontal de tous les studios (adapté Thème Clair / Sombre) */}
            <div className="w-full">
              <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory">
                {/* 1. Genjutsu (FREE) */}
                <button
                  type="button"
                  onClick={() => setGenjutsuOpen(true)}
                  className="flex flex-col text-left w-[130px] sm:w-[140px] shrink-0 p-2 rounded-2xl bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--line)] hover:border-[#D8FF64]/40 transition-all cursor-pointer group snap-start shadow-card"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/10 dark:bg-black/40 border border-[var(--line)] mb-2">
                    <img
                      src="/assets/studios/studio-cinema.jpg"
                      alt="Genjutsu"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-pink-500 text-white text-[9px] font-bold tracking-wider">
                      FREE
                    </span>
                  </div>
                  <span className="text-[12px] font-semibold text-[var(--ink)] group-hover:text-[#8ca825] dark:group-hover:text-[#D8FF64] truncate">
                    likyAI Genjutsu
                  </span>
                  <span className="text-[10px] text-[var(--mute)] truncate">Motion & Swap</span>
                </button>

                {/* 2. AI Influencer (NEW) */}
                <button
                  type="button"
                  onClick={() => setInfluencerOpen(true)}
                  className="flex flex-col text-left w-[130px] sm:w-[140px] shrink-0 p-2 rounded-2xl bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--line)] hover:border-[#D8FF64]/40 transition-all cursor-pointer group snap-start shadow-card"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/10 dark:bg-black/40 border border-[var(--line)] mb-2">
                    <img
                      src="/assets/influencer/gender_female.jpg"
                      alt="AI Influencer"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#D8FF64] text-black text-[9px] font-bold tracking-wider">
                      NEW
                    </span>
                  </div>
                  <span className="text-[12px] font-semibold text-[var(--ink)] group-hover:text-[#8ca825] dark:group-hover:text-[#D8FF64] truncate">
                    AI Influencer
                  </span>
                  <span className="text-[10px] text-[var(--mute)] truncate">Clone cohérent</span>
                </button>

                {/* 3. Cinema Studio (POPULAR) */}
                <button
                  type="button"
                  onClick={() => router.push("/studios/cinema")}
                  className="flex flex-col text-left w-[130px] sm:w-[140px] shrink-0 p-2 rounded-2xl bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--line)] hover:border-[#D8FF64]/40 transition-all cursor-pointer group snap-start shadow-card"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/10 dark:bg-black/40 border border-[var(--line)] mb-2">
                    <img
                      src="/assets/studios/studio-cinema.jpg"
                      alt="Cinema Studio"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-purple-500 text-white text-[9px] font-bold tracking-wider">
                      POPULAR
                    </span>
                  </div>
                  <span className="text-[12px] font-semibold text-[var(--ink)] group-hover:text-[#8ca825] dark:group-hover:text-[#D8FF64] truncate">
                    Cinema Studio
                  </span>
                  <span className="text-[10px] text-[var(--mute)] truncate">Master 35mm 4K</span>
                </button>

                {/* 4. Ads Studio */}
                <button
                  type="button"
                  onClick={() => router.push("/studios/ad-builder")}
                  className="flex flex-col text-left w-[130px] sm:w-[140px] shrink-0 p-2 rounded-2xl bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--line)] hover:border-[#D8FF64]/40 transition-all cursor-pointer group snap-start shadow-card"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/10 dark:bg-black/40 border border-[var(--line)] mb-2">
                    <img
                      src="/assets/gallery/banner_ads.jpg"
                      alt="Ads Studio"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-[var(--ink)] group-hover:text-[#8ca825] dark:group-hover:text-[#D8FF64] truncate">
                    Ads Studio
                  </span>
                  <span className="text-[10px] text-[var(--mute)] truncate">Scan de marque & pubs</span>
                </button>

                {/* 5. UGC Studio */}
                <button
                  type="button"
                  onClick={() => router.push("/studios/ugc")}
                  className="flex flex-col text-left w-[130px] sm:w-[140px] shrink-0 p-2 rounded-2xl bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--line)] hover:border-[#D8FF64]/40 transition-all cursor-pointer group snap-start shadow-card"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/10 dark:bg-black/40 border border-[var(--line)] mb-2">
                    <img
                      src="/assets/studios/studio-ugc.jpg"
                      alt="UGC Studio"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-[var(--ink)] group-hover:text-[#8ca825] dark:group-hover:text-[#D8FF64] truncate">
                    UGC Studio
                  </span>
                  <span className="text-[10px] text-[var(--mute)] truncate">Témoignages spontanés</span>
                </button>

                {/* 6. Animation Studio */}
                <button
                  type="button"
                  onClick={() => router.push("/studios/animation")}
                  className="flex flex-col text-left w-[130px] sm:w-[140px] shrink-0 p-2 rounded-2xl bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--line)] hover:border-[#D8FF64]/40 transition-all cursor-pointer group snap-start shadow-card"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/10 dark:bg-black/40 border border-[var(--line)] mb-2">
                    <img
                      src="/assets/studios/studio-animation.jpg"
                      alt="Animation Studio"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-[var(--ink)] group-hover:text-[#8ca825] dark:group-hover:text-[#D8FF64] truncate">
                    Animation Studio
                  </span>
                  <span className="text-[10px] text-[var(--mute)] truncate">Dessins & Anime</span>
                </button>

                {/* 7. Mes Assets */}
                <button
                  type="button"
                  onClick={() => setAssetsModalOpen(true)}
                  className="flex flex-col text-left w-[130px] sm:w-[140px] shrink-0 p-2 rounded-2xl bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--line)] hover:border-[#D8FF64]/40 transition-all cursor-pointer group snap-start shadow-card"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[var(--field)] border border-[var(--line)] mb-2 flex items-center justify-center">
                    <CoolIcon name="folder-open" size={28} duotone className="text-[var(--mute)] group-hover:text-[#8ca825] dark:group-hover:text-[#D8FF64]" />
                  </div>
                  <span className="text-[12px] font-semibold text-[var(--ink)] group-hover:text-[#8ca825] dark:group-hover:text-[#D8FF64] truncate">
                    All Assets
                  </span>
                  <span className="text-[10px] text-[var(--mute)] truncate">Images & Éléments</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Grille des générations existantes avec Unified Prompt Bubble en bas */
          <div className="w-full max-w-5xl mx-auto px-4 pt-2 pb-24">
            <SectionShowcase
              mode={mode}
              cards={cards}
              allModeCardsCount={cards.length}
              onOpenCard={(c) => openResultForCard(c as CanvasCard)}
              onAnimateCard={handleAnimateImage}
              onRetryCard={(c) =>
                handleRetryFromResult({
                  id: c.id,
                  tool: c.mode,
                  modelName: c.modelName,
                  prompt: c.fullPrompt,
                  mediaUrl: c.mediaUrl || `/assets/organic/organic-${((c.orgIndex || 0) % 4) + 1}.webp`,
                  creditsCost: c.creditsCost,
                  params: c.params,
                  createdAt: Date.now(),
                })
              }
              onEditCard={(c) =>
                handleEditFromResult({
                  id: c.id,
                  tool: c.mode,
                  modelName: c.modelName,
                  prompt: c.fullPrompt,
                  mediaUrl: c.mediaUrl || `/assets/organic/organic-${((c.orgIndex || 0) % 4) + 1}.webp`,
                  creditsCost: c.creditsCost,
                  params: c.params,
                  createdAt: Date.now(),
                })
              }
              onOpenLibrary={() => setLibraryOpen(true)}
              onSelectSamplePrompt={(sample) => {
                setPrompt(sample);
              }}
            />

            {/* Bulle de prompt flottante en bas quand il y a des créations */}
            <div className="fixed bottom-4 sm:bottom-6 inset-x-0 z-40 px-3 sm:px-4 pointer-events-none">
              <div className="max-w-2xl mx-auto w-full pointer-events-auto">
                <UnifiedPromptBubble
                  prompt={prompt}
                  setPrompt={setPrompt}
                  selectedModelName={selectedModelName}
                  onOpenModelSelector={() => setModelSelectorOpen(true)}
                  aspectRatio={aspectRatio}
                  setAspectRatio={setAspectRatio}
                  onOpenAssets={() => setAssetsModalOpen(true)}
                  selectedAssets={selectedAssets}
                  onRemoveAsset={(id) => setSelectedAssets((cur) => cur.filter((a) => a.id !== id))}
                  onOpenInfluencerBuilder={() => setInfluencerOpen(true)}
                  isGenerating={isGenerating}
                  onGenerate={handleGenerate}
                  creditsCost={currentCost}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── TIROIRS & MODALES BRANCHÉS ── */}

      {/* Menu latéral gauche */}
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userEmail={user.email}
        credits={credits}
        onOpenTopup={() => {
          setSidebarOpen(false);
          setTopupOpen(true);
        }}
        onOpenInfluencerBuilder={() => {
          setSidebarOpen(false);
          setInfluencerOpen(true);
        }}
        onOpenGenjutsu={() => {
          setSidebarOpen(false);
          setGenjutsuOpen(true);
        }}
        onOpenAssets={() => {
          setSidebarOpen(false);
          setAssetsModalOpen(true);
        }}
      />

      {/* Modale de sélection de modèle */}
      <ModelSelectorModal
        isOpen={modelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
        selectedModel={selectedModelId}
        onSelectModel={(modelId, modelName) => {
          setSelectedModelId(modelId);
          setSelectedModelName(modelName);
          setModelSelectorOpen(false);
          // Met à jour la catégorie associée si applicable
          const target = ALL_MODELS.find((m) => m.id === modelId);
          if (target) {
            if (target.category === "image") setMode("image");
            if (target.category === "video") setMode("video");
            if (target.category === "audio") setMode("music");
          }
          showToast(`Modèle "${modelName}" sélectionné`);
        }}
      />

      {/* Modale des Assets (+ et @) */}
      <AssetsModal
        isOpen={assetsModalOpen}
        onClose={() => setAssetsModalOpen(false)}
        selectedAssetIds={selectedAssets.map((a) => a.id)}
        onToggleAsset={(asset) => {
          setSelectedAssets((cur) => {
            const exists = cur.some((a) => a.id === asset.id);
            if (exists) {
              return cur.filter((a) => a.id !== asset.id);
            } else {
              return [...cur, asset];
            }
          });
        }}
        onApply={() => setAssetsModalOpen(false)}
        onOpenInfluencerBuilder={() => {
          setAssetsModalOpen(false);
          setInfluencerOpen(true);
        }}
        customAssets={customAssets}
        onUploadFiles={handleUploadFiles}
      />

      {/* Constructeur modulaire AI Influencer */}
      <InfluencerBuilderDrawer
        isOpen={influencerOpen}
        onClose={() => setInfluencerOpen(false)}
        onCharacterCreated={handleCharacterCreated}
      />

      {/* Tiroir Genjutsu Motion Transfer & Swap */}
      <GenjutsuDrawer
        isOpen={genjutsuOpen}
        onClose={() => setGenjutsuOpen(false)}
        onGenerateMotion={handleGenjutsuLaunch}
      />

      {/* Modale de recharge Mobile Money */}
      <TopupModal
        isOpen={topupOpen}
        onClose={() => setTopupOpen(false)}
        onSuccess={(addedCredits, newTotal) => {
          if (typeof newTotal === "number") {
            setCredits(newTotal);
          } else {
            setCredits((prev) => prev + addedCredits);
          }
          showToast(`+${addedCredits} crédits ajoutés à votre solde !`);
        }}
      />

      {/* Modale Bibliothèque de créations */}
      <LibraryModal
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        items={cards}
        onSelectItem={(item) => openResultForCard(item as CanvasCard)}
        onRetryItem={(item) =>
          handleRetryFromResult({
            id: item.id,
            tool: item.mode,
            modelName: item.modelName,
            prompt: item.fullPrompt,
            mediaUrl: item.mediaUrl || `/assets/organic/organic-${((item.orgIndex || 0) % 4) + 1}.webp`,
            creditsCost: item.creditsCost,
            params: item.params,
            createdAt: item.createdAt || Date.now(),
          })
        }
        onEditItem={(item) =>
          handleEditFromResult({
            id: item.id,
            tool: item.mode,
            modelName: item.modelName,
            prompt: item.fullPrompt,
            mediaUrl: item.mediaUrl || `/assets/organic/organic-${((item.orgIndex || 0) % 4) + 1}.webp`,
            creditsCost: item.creditsCost,
            params: item.params,
            createdAt: item.createdAt || Date.now(),
          })
        }
        onDeleteItem={(id) => {
          setCards((cur) => cur.filter((c) => c.id !== id));
          showToast("Création supprimée");
        }}
      />

      {/* Bulle d'affichage du résultat */}
      <ResultBubble
        result={activeResult}
        isOpen={resultBubbleOpen}
        onClose={() => setResultBubbleOpen(false)}
        onRetry={handleRetryFromResult}
        onEdit={handleEditFromResult}
        onAnimate={handleAnimateImage}
      />

      {/* Toast Notification */}
      <div className={cn("toast", toastMsg ? "show" : "")} id="toast">
        {toastMsg}
      </div>
    </div>
  );
}

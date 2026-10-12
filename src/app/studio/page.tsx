"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createShader, playSweep, accentChain, ACCENTS } from "glimm";
import { PromptBubble } from "@/components/prompt-bubble";
import { CoolIcon, type CoolIconKey } from "@/components/icons/coolicon";
import { ResultBubble, type GenerationResultData } from "@/components/result-bubble";
import { SectionShowcase } from "@/components/section-showcase";
import { LibraryModal, type LibraryCardItem } from "@/components/library-modal";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
 * CONFIGURATION DU STUDIO LIKYAI (Ground Truth Prototype)
 * ───────────────────────────────────────────────────────── */

const CATEGORIES: { id: "image" | "video" | "music" | "voice"; label: string; icon: CoolIconKey }[] = [
  { id: "image", label: "Image", icon: "image-01" },
  { id: "video", label: "Vidéo", icon: "camera" },
  { id: "music", label: "Musique", icon: "headphones" },
  { id: "voice", label: "Voix off", icon: "user-voice" },
];

const MODELS_CONFIG = {
  image: [
    { id: "nano", n: "Nano Banana 2", base: 6, q: ["1K", "2K", "4K"], qm: [1, 1.5, 2.5] },
    { id: "soul", n: "Z-Image Turbo", base: 2, q: ["1K", "2K"], qm: [1, 1.5] },
    { id: "seed", n: "Seedream 5", base: 5, q: ["2K", "4K"], qm: [1, 1.8] },
  ],
  video: [
    { id: "seedance", n: "Seedance 2.0 Mini", base: 4 },
    { id: "kling", n: "Kling 3.0 Turbo", base: 18 },
    { id: "wan", n: "Wan 2.7", base: 12 },
  ],
};

const FORMATS: Record<string, string> = {
  "1:1 · Carré": "1:1",
  "9:16 · Vertical": "9:16",
  "16:9 · Paysage": "16:9",
  "4:5 · Portrait": "4:5",
};

const PLATFORMS: Record<string, string> = {
  TikTok: "9:16",
  "Reels Instagram": "9:16",
  "YouTube Shorts": "9:16",
  Facebook: "4:5",
  YouTube: "16:9",
  LinkedIn: "1:1",
};

type VideoField = {
  k: string;
  o?: string[];
  t?: string;
  file?: number;
};

type VideoTypeConfig = {
  n: string;
  d: string;
  ph: string;
  f: VideoField[];
};

const VTYPES: Record<string, VideoTypeConfig> = {
  ugc: {
    n: "UGC",
    d: "Avis client filmé",
    ph: "Ex. Une cliente présente ma crème de karité et explique pourquoi elle l'adore…",
    f: [
      { k: "Plateforme", o: Object.keys(PLATFORMS) },
      { k: "Avatar", o: ["Femme", "Homme", "Jeune", "Senior"] },
      { k: "Langue", o: ["Français", "Anglais"] },
      { k: "Durée", o: ["10 s", "15 s", "30 s"] },
    ],
  },
  marketing: {
    n: "Marketing",
    d: "Pub produit ou service",
    ph: "Ex. Pub pour mon restaurant à Douala, ambiance chaleureuse, offre du weekend…",
    f: [
      { k: "Plateforme", o: Object.keys(PLATFORMS) },
      { k: "Ton", o: ["Dynamique", "Luxe", "Humoristique", "Sobre"] },
      { k: "Durée", o: ["5 s", "10 s", "15 s"] },
      { k: "Appel à l'action", t: "Ex. Commander maintenant" },
    ],
  },
  animation: {
    n: "Animer une image",
    d: "Donne vie à ta photo",
    ph: "Ex. Le tissu bouge doucement, la lumière change…",
    f: [
      { k: "Image", file: 1 },
      { k: "Mouvement", o: ["Naturel", "Zoom avant", "Zoom arrière", "Rotation", "Travelling"] },
      { k: "Format", o: Object.keys(PLATFORMS) },
      { k: "Durée", o: ["5 s", "10 s"] },
    ],
  },
  saas: {
    n: "Présentation SaaS",
    d: "Démo d'un logiciel",
    ph: "Ex. Présenter mon application de gestion de stock en 3 temps forts…",
    f: [
      { k: "Site du produit", t: "https://…" },
      { k: "Format", o: Object.keys(PLATFORMS) },
      { k: "Style", o: ["Minimal", "Dynamique", "Corporate"] },
      { k: "Durée", o: ["10 s", "15 s", "30 s"] },
    ],
  },
  libre: {
    n: "Libre",
    d: "Tu décides de tout",
    ph: "Décris la scène que tu imagines…",
    f: [
      { k: "Format", o: Object.keys(PLATFORMS) },
      { k: "Style", o: ["Réaliste", "Cinéma", "Animation 3D", "Illustration"] },
      { k: "Audio", o: ["Avec son", "Sans son"] },
      { k: "Durée", o: ["5 s", "10 s", "15 s"] },
    ],
  },
};

const PACKS = [
  { f: 1000, c: 50 },
  { f: 2500, c: 140 },
  { f: 5000, c: 300 },
];

const HUES = [
  [250, 320],
  [20, 340],
  [160, 220],
  [40, 10],
  [200, 270],
  [300, 30],
];

/* Monochromatic Lime & Emerald shader palette for likyAI (No rainbow) */
const LIME_SWEEP = accentChain([
  ACCENTS.green,
  ACCENTS.cyan,
  ACCENTS.green,
]);

/* Glyphes & Brands pour l'autocomplétion @ et / */
const SOURCES = [
  { key: "attach", name: "Ajouter photos & fichiers", desc: "Importer depuis votre appareil" },
  { key: "scoop", name: "Données de vente", desc: "Métriques et churn" },
  { key: "flavors", name: "Catalogue produits", desc: "26 fiches et références" },
  { key: "web", name: "Recherche web", desc: "Informations en temps réel" },
  { key: "figma", name: "Figma", desc: "Maquettes & design system" },
  { key: "slack", name: "Slack", desc: "Discussions d'équipe" },
  { key: "gmail", name: "Gmail", desc: "Emails et fournisseurs" },
];

const COMMANDS = [
  { key: "compare", name: "/comparer", desc: "Comparer avec l'année dernière" },
  { key: "churn-plan", name: "/plan-fidelite", desc: "Créer un plan de rétention" },
  { key: "restock", name: "/reassort", desc: "Générer un bon de commande" },
  { key: "draft-email", name: "/email-client", desc: "Rédiger un email commercial" },
  { key: "summarize", name: "/resumer", desc: "Synthétiser le fil actuel" },
];

function parseToken(text: string): { kind: "at" | "slash"; query: string; start: number } | null {
  const match = /(^|\s)([@/])([\w-]*)$/.exec(text);
  if (!match) return null;
  return {
    kind: match[2] === "@" ? "at" : "slash",
    query: match[3].toLowerCase(),
    start: match.index + match[1].length,
  };
}

/* Card type on canvas / library */
type CanvasCard = LibraryCardItem & {
  vt?: string | null;
  thinkingStage?: number;
  expandedThinking?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  px?: number;
  py?: number;
};
// Espace de travail vierge et isolé : chaque utilisateur dispose de ses propres créations depuis Supabase.

export default function StudioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [mode, setMode] = useState<"image" | "video" | "music" | "voice">("image");
  const [vt, setVt] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(60);
  const [pack, setPack] = useState<number>(1);
  const [operator, setOperator] = useState<string>("MTN MoMo");
  const [phone, setPhone] = useState<string>("");
  const [cards, setCards] = useState<CanvasCard[]>([]);
  const [log, setLog] = useState<{ t: string; d: string; v: number }[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  /* Bulle d'affichage du résultat */
  const [activeResult, setActiveResult] = useState<GenerationResultData | null>(null);
  const [resultBubbleOpen, setResultBubbleOpen] = useState(false);

  /* Bibliothèque de créations */
  const [libraryOpen, setLibraryOpen] = useState(false);

  /* Menus & Modales */
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrim1Open, setScrim1Open] = useState(false); // Recharge
  const [scrim2Open, setScrim2Open] = useState(false); // Historique
  const [scrim3Open, setScrim3Open] = useState(false); // Paramètres
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "auto">("auto");
  const [isDark, setIsDark] = useState(false);

  /* Valeurs des inputs & chips du dock */
  const [vals, setVals] = useState<Record<string, string>>({
    model: "nano",
    qual: "2K",
    count: "1",
    format: "1:1 · Carré",
    style: "Photo réaliste",
    vmodel: "seedance",
    Durée: "5 s",
    MDurée: "30 s",
    Genre: "Afrobeat",
    Vocal: "Instrumental",
    Voix: "Femme chaleureuse",
    Langue: "Français",
    Vitesse: "Normale",
    Plateforme: "TikTok",
    Avatar: "Femme",
    prompt: "",
    fileName: "",
  });

  /* Token @ et / */
  const [activeTokenRow, setActiveTokenRow] = useState(0);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const glimmRef = useRef<HTMLCanvasElement>(null);
  const shaderRef = useRef<ReturnType<typeof createShader> | null>(null);
  const zCounter = useRef<number>(10);
  const dragJustEndedRef = useRef<boolean>(false);
  const [isPromptShrunk, setIsPromptShrunk] = useState<boolean>(false);

  /* Chargement des données réelles de l'utilisateur (isolation stricte par user_id) */
  const loadUserData = async (userId: string) => {
    const supabase = createClient();
    try {
      // 1. Profil & solde réel de crédits
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
          creditsCost: g.credits_cost,
          status: g.status === "success" || g.status === "fail" ? "ready" : "thinking",
          elapsed: g.duration_seconds || 0,
          orgIndex: idx % 4,
          params: (g.parameters as Record<string, any>) || {},
          createdAt: new Date(g.created_at).getTime(),
        }));
        setCards(formattedCards);
      } else {
        // Plan de travail totalement vierge et isolé
        setCards([]);
      }
    } catch (err) {
      console.warn("Erreur chargement Supabase:", err);
      setCards([]);
    }
  };

  /* Vérification obligatoire de l'authentification & écoute de session */
  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (!session?.user) {
        // Redirection obligatoire si non authentifié
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

    // Initialisation du thème
    try {
      const savedTheme = localStorage.getItem("studio_theme") as "light" | "dark" | null;
      if (savedTheme) {
        setThemeMode(savedTheme);
        document.documentElement.dataset.theme = savedTheme;
        setIsDark(savedTheme === "dark");
      } else {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDark(mq.matches);
      }
    } catch {}

    // Sur mobile, réduire la bulle par défaut pour dégager complètement l'espace de travail
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setIsPromptShrunk(true);
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Erreur déconnexion:", err);
    }
    setUser(null);
    setCards([]);
    router.replace("/auth");
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  const saveCredits = async (newCredits: number) => {
    setCredits(newCredits);
    if (user) {
      try {
        const supabase = createClient();
        await supabase.from("profiles").update({ credits: newCredits }).eq("id", user.id);
      } catch {}
    }
  };

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setThemeMode(next);
    setIsDark(next === "dark");
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("studio_theme", next);
    } catch {
      // ignore
    }
  };

  const applyThemeSetting = (t: "light" | "dark" | "auto") => {
    setThemeMode(t);
    if (t === "auto") {
      delete document.documentElement.dataset.theme;
      try {
        localStorage.removeItem("studio_theme");
      } catch {
        // ignore
      }
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    } else {
      document.documentElement.dataset.theme = t;
      try {
        localStorage.setItem("studio_theme", t);
      } catch {
        // ignore
      }
      setIsDark(t === "dark");
    }
  };

  /* Initialisation du shader glimm */
  useEffect(() => {
    const canvas = glimmRef.current;
    if (!canvas) return;
    try {
      shaderRef.current = createShader({
        canvas,
        palette: LIME_SWEEP,
        direction: "ltr",
        bandTight: 10,
        swellAmount: 0.85,
      });
    } catch {
      // glimm init fallback
    }
    return () => {
      shaderRef.current?.destroy();
      shaderRef.current = null;
    };
  }, []);

  const triggerGlimmSweep = () => {
    const canvas = glimmRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      shaderRef.current?.destroy();
      const shader = createShader({
        canvas,
        palette: LIME_SWEEP,
        direction: "ltr",
        bandTight: 10,
        swellAmount: 0.85,
      });
      shaderRef.current = shader;
      if (shader) {
        playSweep(shader, {
          palette: LIME_SWEEP,
          direction: "ltr",
          sweepMs: 650,
          outroMs: 90,
          peakAlpha: 1.3,
          bandTight: 10,
          brightness: 1.4,
          swellAmount: 1,
          waveSpeed: 1.8,
          easing: "easeOutExpo",
        });
      }
    } catch {
      // sweep fallback
    }
  };

  /* Calcul du coût en crédits */
  const calculateCost = (): number => {
    if (mode === "music") {
      const dur = parseInt(vals["MDurée"] || "30") || 30;
      return 10 * Math.ceil(dur / 15);
    }
    if (mode === "voice") {
      const len = (vals.prompt || "").length;
      return Math.max(2, 2 * Math.ceil(len / 100));
    }
    if (mode === "image") {
      const ms = MODELS_CONFIG.image;
      const m = ms.find((x) => x.id === vals.model) || ms[0];
      const qi = m.q.indexOf(vals.qual || m.q[0]);
      const mult = qi >= 0 ? m.qm[qi] : 1;
      const cnt = parseInt(vals.count || "1") || 1;
      return Math.round(m.base * mult * cnt);
    }
    if (mode === "video") {
      const m2 = MODELS_CONFIG.video.find((x) => x.id === vals.vmodel) || MODELS_CONFIG.video[0];
      const d = parseInt(vals["Durée"] || "5") || 5;
      return m2.base * d;
    }
    return 5;
  };

  const currentCost = calculateCost();

  /* Ouvre la bulle d'affichage du résultat */
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
      createdAt: Date.now(),
    });
    setResultBubbleOpen(true);
  };

  /* Action MODIFIER : Ouvre la bulle de prompt avec le texte et réglages */
  const handleEditFromResult = (res: GenerationResultData) => {
    setResultBubbleOpen(false);
    setIsPromptShrunk(false);
    setMode(res.tool);
    setVals((prev) => ({
      ...prev,
      prompt: res.prompt,
      ...(res.params || {}),
    }));
    setTimeout(() => {
      promptInputRef.current?.focus();
    }, 150);
    showToast("Création chargée dans la bulle de prompt pour modification.");
  };

  /* Action RÉESSAYER : Relance la génération avec les mêmes paramètres */
  const handleRetryFromResult = (res: GenerationResultData) => {
    setResultBubbleOpen(false);
    setMode(res.tool);
    setVals((prev) => ({
      ...prev,
      prompt: res.prompt,
      ...(res.params || {}),
    }));
    setTimeout(() => {
      handleGenerate();
    }, 50);
  };

  /* Polling de l'état d'une tâche de génération */
  const pollTaskUntilDone = (
    taskId: string,
    cardId: string,
    modelName: string,
    promptText: string,
    costAmount: number
  ) => {
    const startTime = Date.now();
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.state === "waiting") {
          setCards((cur) =>
            cur.map((c) =>
              c.id === cardId
                ? {
                    ...c,
                    status: "thinking",
                    thinkingStage: 0,
                    elapsed: Math.round((Date.now() - startTime) / 1000),
                  }
                : c
            )
          );
        } else if (data.state === "generating") {
          setCards((cur) =>
            cur.map((c) =>
              c.id === cardId
                ? {
                    ...c,
                    status: "generating",
                    thinkingStage: 1,
                    elapsed: Math.round((Date.now() - startTime) / 1000),
                  }
                : c
            )
          );
        } else if (data.state === "success") {
          clearInterval(interval);
          const finalUrl =
            data.response?.resultUrls?.[0] ||
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

          // Synchronisation Supabase de la création terminée
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

          showToast("Ta création est prête.");

          // Ouvre automatiquement la bulle d'affichage du résultat
          setActiveResult({
            id: cardId,
            tool: mode,
            modelName,
            prompt: promptText,
            mediaUrl: finalUrl,
            creditsCost: costAmount,
            elapsedTime: finalElapsed,
            params: { ...vals },
            createdAt: Date.now(),
          });
          setResultBubbleOpen(true);
        } else if (data.state === "fail") {
          clearInterval(interval);
          setCards((cur) =>
            cur.map((c) =>
              c.id === cardId
                ? {
                    ...c,
                    status: "ready",
                    caption: `Échec : ${data.failMsg || "Erreur de génération"}`,
                  }
                : c
            )
          );
          showToast(`Erreur : ${data.failMsg || "La génération a échoué"}`);
        }
      } catch (err) {
        console.error("Erreur polling:", err);
      }
    }, 1500);
  };

  /* Génération d'une nouvelle carte sur le canvas */
  const handleGenerate = () => {
    const p = (vals.prompt || "").trim();
    if (!p) {
      showToast("Décris d'abord ce que tu veux créer");
      promptInputRef.current?.focus();
      return;
    }
    if (currentCost > credits) {
      showToast("Tu n'as plus assez de crédits pour cette création.");
      setScrim1Open(true);
      return;
    }

    triggerGlimmSweep();

    // Déduction des crédits
    const newCreds = credits - currentCost;
    saveCredits(newCreds);
    setLog((prev) => [
      { t: "Création", d: p.slice(0, 28).replace(/[<>&]/g, ""), v: -currentCost },
      ...prev,
    ]);

    const isImg = mode === "image";
    const count = isImg ? parseInt(vals.count || "1") || 1 : 1;
    const aud = mode === "music" || mode === "voice";

    const fmt = aud
      ? "16:9"
      : isImg
      ? FORMATS[vals.format || "1:1 · Carré"] || "1:1"
      : PLATFORMS[vals["Plateforme"] || vals["Format"] || "TikTok"] || "9:16";

    const parts = fmt.split(":");
    const ar = (parseFloat(parts[0]) || 1) / (parseFloat(parts[1]) || 1);

    const bw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const bh = typeof window !== "undefined" ? window.innerHeight : 800;

    let H = Math.min(250, bh * 0.3);
    let W = Math.round(H * ar);
    const mw = Math.min(300, bw - 32);
    if (W > mw) {
      W = mw;
      H = Math.round(W / ar);
    }

    const chosenModelName =
      mode === "image"
        ? vals.model || "Nano Banana"
        : mode === "video"
        ? vals.vmodel || "Kling"
        : mode === "music"
        ? vals.Genre || "Suno V6"
        : vals.Voix || "ElevenLabs";

    const newCardsBatch: CanvasCard[] = [];

    for (let i = 0; i < count; i++) {
      const cardId = `card-${Date.now()}-${i}`;
      const hue = HUES[Math.floor(Math.random() * HUES.length)];
      const orgIdx = Math.floor(Math.random() * 4);

      const waveformsList = aud ? Array.from({ length: 28 }, () => Math.round(12 + Math.random() * 60)) : undefined;

      const captionPrefix = aud ? (mode === "music" ? "Musique · " : "Voix off · ") : isImg ? "" : vt ? `${VTYPES[vt]?.n || "Vidéo"} · ` : "";
      const capText = `${captionPrefix}${p.slice(0, 46)}${p.length > 46 ? "…" : ""}`;

      newCardsBatch.push({
        id: cardId,
        mode,
        vt,
        caption: capText,
        fullPrompt: p,
        modelName: chosenModelName,
        creditsCost: Math.round(currentCost / count),
        status: "thinking",
        elapsed: 0,
        thinkingStage: 0,
        expandedThinking: false,
        hues: hue,
        orgIndex: orgIdx,
        waveforms: waveformsList,
        params: { ...vals },
        createdAt: Date.now(),
      });

      // Enregistrement initial dans Supabase pour ce compte
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
              prompt: p,
              status: "generating",
              credits_cost: Math.round(currentCost / count),
              parameters: vals,
            })
            .then(() => {});
        } catch {}
      }

      // Appel réel backend /api/generate
      fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: mode,
          modelId: mode === "image" ? vals.model || "nano" : mode === "video" ? vals.vmodel || "seedance" : "standard",
          prompt: p,
          params: vals,
          creditsCost: Math.round(currentCost / count),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.taskId) {
            pollTaskUntilDone(data.taskId, cardId, chosenModelName, p, Math.round(currentCost / count));
          } else {
            const errorMsg = data.error || "Échec lors de la génération avec KIE.ai";
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
        })
        .catch((err) => {
          console.error("Erreur appel /api/generate:", err);
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
          showToast("Erreur de connexion lors du lancement de la création.");
        });
    }

    // Ajoute en première position (les 4 plus récentes apparaissent toujours en tête)
    setCards((cur) => [...newCardsBatch, ...cur]);
    setVals((prev) => ({ ...prev, prompt: "" }));
  };

  /* Timer de chargement actif pour les cartes en cours */
  useEffect(() => {
    const hasLoading = cards.some((c) => c.status !== "ready");
    if (!hasLoading) return;
    const interval = setInterval(() => {
      setCards((cur) =>
        cur.map((c) => (c.status !== "ready" ? { ...c, elapsed: c.elapsed + 1 } : c))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [cards]);

  /* Token @ et / */
  const token = parseToken(vals.prompt || "");
  const tokenRows =
    token?.kind === "at"
      ? SOURCES.filter((s) => s.name.toLowerCase().includes(token.query))
      : token?.kind === "slash"
      ? COMMANDS.filter((c) => c.name.slice(1).startsWith(token.query))
      : [];

  const handleSelectToken = (item: { name: string }) => {
    if (!token) return;
    const before = (vals.prompt || "").slice(0, token.start);
    const after = (vals.prompt || "").slice(token.start + token.query.length + 1);
    const insert = `${item.name} `;
    setVals((prev) => ({ ...prev, prompt: `${before}${insert}${after}` }));
    promptInputRef.current?.focus();
  };

  /* Auto-redimensionnement du textarea */
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setVals((prev) => ({ ...prev, prompt: v }));
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  /* Validation Mobile Money */
  const handlePayment = () => {
    const raw = phone.replace(/\D/g, "");
    if (raw.length < 8) {
      showToast("Entre un numéro mobile money valide (min 8 chiffres)");
      return;
    }
    const chosenPack = PACKS[pack];
    const newCreds = credits + chosenPack.c;
    saveCredits(newCreds);
    setLog((prev) => [
      { t: `Recharge ${operator}`, d: `${chosenPack.f.toLocaleString("fr-FR")} FCFA`, v: chosenPack.c },
      ...prev,
    ]);
    setScrim1Open(false);
    showToast(`+${chosenPack.c} crédits ajoutés (démo)`);
  };

  if (authLoading || !user) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--ink)] select-none">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-[14px] bg-[var(--lime)] flex items-center justify-center shadow-raised text-[#171717]">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-emerald-600 dark:text-emerald-400" />
            <span className="text-[13px] font-medium text-[var(--mute)]">
              Accès sécurisé au Studio likyAI…
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── WORKSPACE : LES 4 DERNIÈRES GÉNÉRATIONS DE LA SECTION ── */}
      <main id="board" className="relative w-full min-h-screen overflow-y-auto">
        <SectionShowcase
          mode={mode}
          cards={cards.filter((c) => c.mode === mode)}
          allModeCardsCount={cards.filter((c) => c.mode === mode).length}
          onOpenCard={(c) => openResultForCard(c as CanvasCard)}
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
            setVals((prev) => ({ ...prev, prompt: sample }));
            setIsPromptShrunk(false);
            setTimeout(() => promptInputRef.current?.focus(), 120);
          }}
        />
      </main>

      {/* ── LOGO OFFICIEL SUPÉRIEUR GAUCHE ── */}
      <div className="logo">
        <b>
          <svg viewBox="0 0 24 24">
            <path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z" />
          </svg>
        </b>
        <span>likyAI</span>
      </div>

      {/* ── NAVIGATION CENTRALE HAUTE (4 OUTILS - DESKTOP) ── */}
      <div className="top hidden sm:flex">
        <div className="nav" id="nav">
          {CATEGORIES.map((cat) => {
            const active = mode === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={active ? "on" : ""}
                onClick={() => {
                  setMode(cat.id);
                  setVt(null);
                }}
              >
                <CoolIcon
                  name={cat.icon}
                  duotone
                  size={24}
                  secondaryColor="currentColor"
                  secondaryOpacity={active ? 0.45 : 0.2}
                  className={active ? "text-[var(--ink)]" : "text-[var(--mute)]"}
                />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ACTIONS HAUT DROITE RESPONSIVES (BIBLIOTHÈQUE UNIQUE, THÈME & AVATAR) ── */}
      <div className="top-actions">
        {/* Bouton Bibliothèque unique (compact sur mobile, développé sur desktop) */}
        <button
          type="button"
          className="h-[36px] sm:h-[38px] px-2.5 sm:px-3.5 rounded-full bg-[var(--surf)] border border-[var(--line)] shadow-card flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[12.5px] font-medium text-[var(--ink)] hover:border-[var(--ink)]/40 transition-all cursor-pointer"
          onClick={() => setLibraryOpen(true)}
          title="Ouvrir la bibliothèque de créations"
        >
          <CoolIcon name="folders" duotone size={16} secondaryColor="currentColor" secondaryOpacity={0.4} />
          <span className="hidden sm:inline">Bibliothèque</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[var(--mn)] text-[10px] sm:text-[10.5px] font-mono text-[var(--mute)]">
            {cards.length}
          </span>
        </button>

        {/* Bouton Thème */}
        <button
          type="button"
          className="theme"
          id="theme"
          onClick={toggleTheme}
          title={isDark ? "Passer en clair" : "Passer en sombre"}
          aria-label="Changer de thème"
        >
          {isDark ? (
            <CoolIcon name="sun" duotone size={19} secondaryColor="currentColor" secondaryOpacity={0.45} />
          ) : (
            <CoolIcon name="moon" duotone size={19} secondaryColor="var(--ink)" secondaryOpacity={0.25} />
          )}
        </button>

        {/* Menu Profil / Avatar */}
        <div className="avatar">
          <button
            type="button"
            className="av"
            id="av"
            aria-label="Profil"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <i>{user?.email ? user.email.charAt(0).toUpperCase() : "A"}</i>
          </button>

          <div className={`menu ${menuOpen ? "open" : ""}`} id="menu">
            <div className="px-3 py-2 border-b border-[var(--line)]">
              <small className="block text-[10.5px] text-[var(--mute)] truncate">Connecté en tant que</small>
              <strong className="block text-[12px] font-semibold text-[var(--ink)] truncate max-w-[200px]">
                {user?.email || "Compte studio"}
              </strong>
            </div>

            <div className="cred">
              <div className="w-10 h-10 rounded-[12px] bg-[var(--mn)] border border-[var(--line)] flex items-center justify-center shrink-0 text-[var(--ink)]">
                <CoolIcon name="credit-card-01" duotone size={22} secondaryColor="currentColor" secondaryOpacity={0.45} />
              </div>
              <div>
                <small>Crédits</small>
                <strong id="credits">{credits}</strong>
              </div>
            </div>

            <button
              type="button"
              className="mi pri"
              id="topup"
              onClick={() => {
                setMenuOpen(false);
                setScrim1Open(true);
              }}
            >
              Recharger
            </button>
            <button
              type="button"
              className="mi"
              id="hs"
              onClick={() => {
                setMenuOpen(false);
                setScrim2Open(true);
              }}
            >
              <div className="w-6 h-6 rounded-[7px] bg-[var(--mn)] border border-[var(--line)] flex items-center justify-center shrink-0 text-[var(--ink)]">
                <CoolIcon name="folder" duotone size={15} />
              </div>
              Historique
            </button>
            <button
              type="button"
              className="mi"
              id="st"
              onClick={() => {
                setMenuOpen(false);
                setScrim3Open(true);
              }}
            >
              <div className="w-6 h-6 rounded-[7px] bg-[var(--mn)] border border-[var(--line)] flex items-center justify-center shrink-0 text-[var(--ink)]">
                <CoolIcon name="settings" duotone size={15} />
              </div>
              Paramètres
            </button>
            <div className="hr" />
            <button
              type="button"
              className="mi text-red-400 hover:text-red-300"
              id="out"
              onClick={() => {
                setMenuOpen(false);
                handleSignOut();
              }}
            >
              <div className="w-6 h-6 rounded-[7px] bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
                <CoolIcon name="log-out" duotone size={15} />
              </div>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      {/* ── DOCK INFÉRIEUR ── */}
      <div className="dock" id="dock" ref={dockRef}>
        {/* Navigation des catégories sur Mobile (placée en bas pour libérer l'espace de travail) */}
        <div className="flex sm:hidden justify-center mb-2 pointer-events-auto">
          <div className="flex items-center gap-1 p-1 bg-[var(--surf)] border border-[var(--line)] rounded-full shadow-card backdrop-blur-md">
            {CATEGORIES.map((cat) => {
              const active = mode === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setMode(cat.id);
                    setVt(null);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-medium transition-all cursor-pointer whitespace-nowrap",
                    active
                      ? "bg-[var(--ink)] text-[var(--bg)] shadow-xs font-semibold"
                      : "text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--mn)]"
                  )}
                >
                  <CoolIcon
                    name={cat.icon}
                    duotone
                    size={13}
                    secondaryColor="currentColor"
                    secondaryOpacity={active ? 0.9 : 0.3}
                  />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Vidéo sans type choisi -> Grille de cartes .types avec textures organiques */}
        {mode === "video" && !vt ? (
          <div className="types">
            {Object.entries(VTYPES).map(([k, cfg], i) => (
              <button
                key={k}
                type="button"
                className={`o${i % 4}`}
                onClick={() => setVt(k)}
              >
                <b>{cfg.n}</b>
                <span>{cfg.d}</span>
              </button>
            ))}
          </div>
        ) : (
          <PromptBubble
            mode={mode}
            vt={vt}
            setVt={setVt}
            vals={vals}
            setVals={setVals}
            onGenerate={handleGenerate}
            cost={currentCost}
            glimmRef={glimmRef}
            isShrunk={isPromptShrunk}
            setIsShrunk={setIsPromptShrunk}
          />
        )}
      </div>

      {/* ── MODALE 1 : RECHARGE MOBILE MONEY ── */}
      <div
        className={`scrim ${scrim1Open ? "open" : ""}`}
        id="scrim"
        onClick={(e) => {
          if (e.target === e.currentTarget) setScrim1Open(false);
        }}
      >
        <div className="modal">
          <h3>Recharger mes crédits</h3>
          <p>Paiement par mobile money, sans carte bancaire.</p>

          <div className="packs" id="packs">
            {PACKS.map((p, i) => (
              <button
                key={p.c}
                type="button"
                className={i === pack ? "on" : ""}
                onClick={() => setPack(i)}
              >
                <b>{p.c}</b>
                <span>{p.f.toLocaleString("fr-FR")} FCFA</span>
              </button>
            ))}
          </div>

          <div className="ops" id="ops">
            <button
              type="button"
              className={operator === "MTN MoMo" ? "on" : ""}
              onClick={() => setOperator("MTN MoMo")}
            >
              MTN MoMo
            </button>
            <button
              type="button"
              className={operator === "Orange Money" ? "on" : ""}
              onClick={() => setOperator("Orange Money")}
            >
              Orange Money
            </button>
          </div>

          <input
            className="field"
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Numéro mobile money (ex. 6 70 00 00 00)"
          />

          <button type="button" className="pay" id="pay" onClick={handlePayment}>
            Payer {PACKS[pack].f.toLocaleString("fr-FR")} FCFA
          </button>

          <button
            type="button"
            className="x"
            id="close"
            onClick={() => setScrim1Open(false)}
          >
            Annuler
          </button>
        </div>
      </div>

      {/* ── MODALE 2 : HISTORIQUE ── */}
      <div
        className={`scrim ${scrim2Open ? "open" : ""}`}
        id="scrim2"
        onClick={(e) => {
          if (e.target === e.currentTarget) setScrim2Open(false);
        }}
      >
        <div className="modal">
          <h3>Historique</h3>
          <p>Tes recharges et créations récentes.</p>
          <div id="hist" className="max-h-60 overflow-y-auto pr-1">
            {log.length ? (
              log.map((item, idx) => (
                <div key={idx} className="hr2">
                  <div>
                    {item.t}
                    <br />
                    <span>{item.d}</span>
                  </div>
                  <b>
                    {item.v > 0 ? "+" : ""}
                    {item.v} cr
                  </b>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-[var(--mute)]">Aucune transaction pour le moment.</p>
            )}
          </div>
          <button
            type="button"
            className="x"
            id="close2"
            onClick={() => setScrim2Open(false)}
          >
            Fermer
          </button>
        </div>
      </div>

      {/* ── MODALE 3 : PARAMÈTRES D'APPARENCE ── */}
      <div
        className={`scrim ${scrim3Open ? "open" : ""}`}
        id="scrim3"
        onClick={(e) => {
          if (e.target === e.currentTarget) setScrim3Open(false);
        }}
      >
        <div className="modal">
          <h3>Paramètres</h3>
          <p>Choisis l'apparence de likyAI.</p>
          <div className="ops" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <button
              type="button"
              className={themeMode === "light" ? "on" : ""}
              onClick={() => applyThemeSetting("light")}
            >
              Clair
            </button>
            <button
              type="button"
              className={themeMode === "dark" ? "on" : ""}
              onClick={() => applyThemeSetting("dark")}
            >
              Sombre
            </button>
            <button
              type="button"
              className={themeMode === "auto" ? "on" : ""}
              onClick={() => applyThemeSetting("auto")}
            >
              Auto
            </button>
          </div>
          <button
            type="button"
            className="x"
            id="close3"
            onClick={() => setScrim3Open(false)}
          >
            Fermer
          </button>
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      <div className={`toast ${toastMsg ? "show" : ""}`} id="toast">
        {toastMsg}
      </div>

      {/* ── MODALE BIBLIOTHÈQUE DE CRÉATIONS ── */}
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
          showToast("Création supprimée de la bibliothèque");
        }}
      />

      {/* ── BULLE D'AFFICHAGE DU RÉSULTAT (RÉESSAYER · TÉLÉCHARGER · MODIFIER) ── */}
      <ResultBubble
        result={activeResult}
        isOpen={resultBubbleOpen}
        onClose={() => setResultBubbleOpen(false)}
        onRetry={handleRetryFromResult}
        onEdit={handleEditFromResult}
      />
    </>
  );
}

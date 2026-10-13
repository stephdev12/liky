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
import { Loader2, Smartphone, Sparkles, User as UserIcon, ShoppingBag, Globe, Download, Copy, Play, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatorPreset {
  id: string;
  name: string;
  niche: string;
  avatarUrl: string;
  tone: string;
}

const CREATORS: CreatorPreset[] = [
  { id: "lea", name: "Léa", niche: "Beauté & Soins (24 ans)", avatarUrl: "/assets/studios/studio-ugc.jpg", tone: "Naturelle, souriante & spontanée" },
  { id: "thomas", name: "Thomas", niche: "Tech & Gadgets (28 ans)", avatarUrl: "/assets/studios/studio-ad-builder.jpg", tone: "Dynamique, précis & enthousiaste" },
  { id: "amina", name: "Amina", niche: "Mode & Lifestyle (26 ans)", avatarUrl: "/assets/studios/studio-ugc.jpg", tone: "Chaleureuse, élégante & directe" },
  { id: "marcus", name: "Marcus", niche: "Fitness & Nutrition (30 ans)", avatarUrl: "/assets/studios/studio-cinema.jpg", tone: "Motivant, percutant & expert" },
];

const UGC_FORMATS = [
  { id: "review", label: "Avis face caméra", desc: "Le créateur partage son expérience sincère avec le produit" },
  { id: "unboxing", label: "Unboxing & Découverte", desc: "Déballage du colis, découverte des textures et détails" },
  { id: "problem_solution", label: "Problème → Solution", desc: "Accroche percutante sur une douleur et résolution par le produit" },
  { id: "tutorial", label: "Tutoriel & Démonstration", desc: "Application ou utilisation étape par étape" },
];

export default function UgcStudioPage() {
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

  // Étape 1 : Choix du créateur
  const [selectedCreator, setSelectedCreator] = useState<string>("lea");
  // Étape 2 : Produit & Lien
  const [productUrl, setProductUrl] = useState<string>("");
  const [productName, setProductName] = useState<string>("Flacon Élixir Hydratant");
  const [productBenefits, setProductBenefits] = useState<string>("Résultats visibles en 3 jours, formule bio non collante");
  const [isScanningProduct, setIsScanningProduct] = useState<boolean>(false);
  
  // Étape 3 : Format & Script
  const [selectedFormat, setSelectedFormat] = useState<string>("review");
  const [selectedHook, setSelectedHook] = useState<string>(
    "J'ai testé ce produit pendant 2 semaines, et honnêtement je m'attendais pas à ça !"
  );
  const [language, setLanguage] = useState<string>("Français");

  const [topupOpen, setTopupOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Rendu
  const [activeVideo, setActiveVideo] = useState<{
    id: string;
    mediaUrl: string;
    creator: string;
    hook: string;
  } | null>(null);

  const creditsCost = 16; // Modèle Seedance UGC natif

  // Scan réel du produit via l'API scan-website
  const handleScanProductUrl = async () => {
    if (!productUrl.trim()) return;
    setIsScanningProduct(true);
    try {
      const res = await fetch("/api/studios/scan-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: productUrl }),
      });
      const data = await res.json();
      if (res.ok && data.brandKit) {
        setProductName(data.brandKit.title);
        setProductBenefits(data.brandKit.description);
        setSelectedHook(`Pourquoi tout le monde parle de ${data.brandKit.title} sur TikTok en ce moment ?`);
      }
    } catch {
      // Garde les données actuelles
    } finally {
      setIsScanningProduct(false);
    }
  };

  const handleGenerateUgc = async () => {
    if (credits < creditsCost) {
      setTopupOpen(true);
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    const creatorObj = CREATORS.find((c) => c.id === selectedCreator) || CREATORS[0];
    const compiledPrompt = `Authentic viral TikTok UGC video of a creator (${creatorObj.name}, ${creatorObj.niche}) talking directly to camera about ${productName}. Creator holding the product bottle, showing it to camera. Hook spoken in ${language}: "${selectedHook}". Format: vertical 9:16 smartphone recording, bright ring-light, natural bedroom/studio background, synchronized realistic lipsync, high energy commercial UGC.`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "video",
          model: "seedance-2-5",
          prompt: compiledPrompt,
          aspectRatio: "9:16",
          duration: 10,
          creditsCost,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur de génération UGC.");
      }

      setActiveVideo({
        id: data.taskId || `ugc_${Date.now()}`,
        mediaUrl: data.resultUrl || "/assets/studios/studio-ugc.jpg",
        creator: creatorObj.name,
        hook: selectedHook,
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
      {/* ── HEADER DU STUDIO UGC ── */}
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
              04
            </span>
            <h1 className="font-heading text-[17px] sm:text-[19px] font-normal tracking-tight">
              UGC Studio <span className="font-serif italic text-muted-foreground text-[14px]">Créateurs TikTok</span>
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

      {/* ── WORKSPACE UGC ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLONNE CONFIGURATION (7 COLONNES) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* ÉTAPE 1 : CHOIX DU CRÉATEUR VIRAL */}
          <div className="p-5 rounded-2xl bg-[var(--surf)] border border-[var(--line)] shadow-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="size-4 text-[var(--mute)]" />
                <h2 className="text-[14px] font-semibold text-[var(--ink)]">
                  1. Choisissez votre créateur IA
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[var(--mute)]">
                Voix & Synchronisation labiale
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {CREATORS.map((c) => {
                const active = selectedCreator === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCreator(c.id)}
                    className={cn(
                      "p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 relative",
                      active
                        ? "bg-[var(--mn)] border-[var(--ink)] shadow-xs ring-1 ring-[var(--ink)]"
                        : "bg-[var(--bg)] border-[var(--line)] hover:border-[var(--line-strong)]"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--line)]">
                      <img src={c.avatarUrl} alt={c.name} className="size-full object-cover" />
                    </div>
                    <div>
                      <span className="font-semibold text-[13px] text-[var(--ink)] block">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-[var(--mute)] block leading-tight mt-0.5">
                        {c.niche}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ÉTAPE 2 : INFORMATIONS PRODUIT / LIEN */}
          <div className="p-5 rounded-2xl bg-[var(--surf)] border border-[var(--line)] shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-[var(--mute)]" />
                <h2 className="text-[14px] font-semibold text-[var(--ink)]">
                  2. Le produit à promouvoir
                </h2>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="Coller l'URL de la fiche produit (Shopify, Amazon...)"
                className="h-10 rounded-xl bg-[var(--bg)] border-[var(--line)] text-[13px]"
              />
              <Button
                type="button"
                onClick={handleScanProductUrl}
                disabled={isScanningProduct || !productUrl.trim()}
                className="h-10 px-4 rounded-xl bg-[var(--mn)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--hover)] font-medium text-[12px] shrink-0"
              >
                {isScanningProduct ? <Loader2 className="size-3.5 animate-spin" /> : "Extraire"}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">
                  Nom du produit
                </label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="h-10 rounded-xl bg-[var(--bg)] border-[var(--line)] text-[13px]"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">
                  Bénéfice majeur
                </label>
                <Input
                  value={productBenefits}
                  onChange={(e) => setProductBenefits(e.target.value)}
                  className="h-10 rounded-xl bg-[var(--bg)] border-[var(--line)] text-[13px]"
                />
              </div>
            </div>
          </div>

          {/* ÉTAPE 3 : FORMAT UGC & ACCROCHE SCRIPT */}
          <div className="p-5 rounded-2xl bg-[var(--surf)] border border-[var(--line)] shadow-card flex flex-col gap-4">
            <h2 className="text-[14px] font-semibold text-[var(--ink)]">
              3. Format & Accroche virale (Hook)
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {UGC_FORMATS.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all",
                    selectedFormat === fmt.id
                      ? "bg-[var(--mn)] border-[var(--ink)] shadow-xs"
                      : "bg-[var(--bg)] border-[var(--line)] hover:border-[var(--line-strong)]"
                  )}
                >
                  <span className="font-semibold text-[12px] text-[var(--ink)] block">
                    {fmt.label}
                  </span>
                  <span className="text-[10.5px] text-[var(--mute)] block line-clamp-1 mt-0.5">
                    {fmt.desc}
                  </span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">
                Accroche parlée dans la vidéo (Hook)
              </label>
              <textarea
                value={selectedHook}
                onChange={(e) => setSelectedHook(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-[var(--bg)] border border-[var(--line)] p-3 text-[13px] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] resize-none"
              />
            </div>

            {errorMsg && (
              <p className="text-[12px] text-red-500 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                {errorMsg}
              </p>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-[var(--line)]">
              <span className="text-[12px] text-[var(--mute)] font-mono">
                Coût vidéo 10s : <b>{creditsCost} crédits</b> (Seedance 2.5 Audio)
              </span>

              <Button
                onClick={handleGenerateUgc}
                disabled={isGenerating || !productName.trim()}
                className="h-11 px-6 rounded-xl bg-[var(--lime)] text-[#171717] hover:bg-[#cbf54a] font-semibold text-[13px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Génération du créateur…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2" />
                    Générer la vidéo UGC (9:16)
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* COLONNE PRÉVISUALISATION SMARTPHONE (5 COLONNES) */}
        <section className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full max-w-[320px] aspect-[9/16] rounded-[36px] p-3 bg-black border-4 border-[#262624] shadow-2xl relative flex flex-col overflow-hidden">
            {/* ENCOCHE SMARTPHONE */}
            <div className="w-24 h-4 bg-black rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-20" />

            <div className="size-full rounded-[24px] overflow-hidden bg-[var(--mn)] relative flex items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <Loader2 className="size-8 animate-spin text-[var(--lime)]" />
                  <p className="text-[12px] text-white/80 font-medium">
                    Tournage du créateur avec synchronisation labiale…
                  </p>
                </div>
              ) : activeVideo ? (
                <div className="size-full relative">
                  <img src={activeVideo.mediaUrl} alt="" className="size-full object-cover" />
                  <div className="absolute bottom-6 left-4 right-4 p-3 rounded-xl bg-black/60 backdrop-blur text-white text-[11px] leading-tight">
                    <span className="font-semibold block text-[var(--lime)] mb-0.5">
                      @{activeVideo.creator.toLowerCase()}
                    </span>
                    &quot;{activeVideo.hook}&quot;
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-6 text-center text-[var(--mute)]">
                  <Smartphone className="size-8 text-[var(--mute)]" />
                  <span className="text-[12px] font-medium text-[var(--ink)]">
                    Format 9:16 TikTok / Reel
                  </span>
                  <span className="text-[11px] text-[var(--mute)]">
                    Le rendu s&apos;affichera ici avec le créateur en action
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

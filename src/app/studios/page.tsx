"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { CoolIcon } from "@/components/icons/coolicon";
import { TopupModal } from "@/components/topup-modal";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface StudioCardConfig {
  id: "libre" | "ad" | "cinema" | "ugc" | "anim";
  num: string;
  name: string;
  desc: string;
  chips: string[];
  image: string;
  route: string;
  themeStyle: "light" | "lime" | "dark" | "stone" | "warm";
  bullets: string[];
}

const STUDIOS_DATA: StudioCardConfig[] = [
  {
    id: "libre",
    num: "01",
    name: "Studio Libre",
    desc: "Image, vidéo, musique et voix. Tous les modèles, aucun cadre.",
    chips: ["Tous les modèles", "Tu règles tout"],
    image: "/assets/studios/studio-libre.jpg",
    route: "/studio",
    themeStyle: "light",
    bullets: [
      "Choisis le modèle, le format, la qualité",
      "Image, vidéo, musique, voix off",
      "Le studio que tu connais déjà",
    ],
  },
  {
    id: "ad",
    num: "02",
    name: "Ad Builder",
    desc: "Affiches et vidéos publicitaires, aux couleurs de ta marque.",
    chips: ["Modèle automatique", "Affiches · Vidéos pub"],
    image: "/assets/studios/studio-ad-builder.jpg",
    route: "/ad",
    themeStyle: "lime",
    bullets: [
      "Aucun choix de modèle : le meilleur est sélectionné pour toi",
      "Tu choisis seulement le format et ton message",
      "Projet libre ou pub pour ton site (analyse automatique de l'URL)",
    ],
  },
  {
    id: "cinema",
    num: "03",
    name: "Cinéma Studio",
    desc: "Vidéos haute qualité avec les meilleurs modèles du moment.",
    chips: ["Choix du modèle", "@ images"],
    image: "/assets/studios/studio-cinema.jpg",
    route: "/cinema",
    themeStyle: "dark",
    bullets: [
      "Seulement les meilleurs moteurs vidéo (Veo 3.1, Kling 3.0, Wan 2.7)",
      "Format, qualité et durée au choix",
      "Cite tes images dans le prompt avec @homme, @produit…",
    ],
  },
  {
    id: "ugc",
    num: "04",
    name: "UGC Studio",
    desc: "Un influenceur IA qui présente ton produit, filmé comme un vrai avis.",
    chips: ["Influenceur IA", "Image ou lien produit"],
    image: "/assets/studios/studio-ugc.jpg",
    route: "/ugc",
    themeStyle: "stone",
    bullets: [
      "Crée ton personnage ou choisis-en un dans la galerie",
      "Ajoute ton produit : photo ou lien web",
      "Vidéo verticale prête pour TikTok et Instagram Reels",
    ],
  },
  {
    id: "anim",
    num: "05",
    name: "Animation Studio",
    desc: "Courts-métrages et mini-histoires pour TikTok et les réseaux.",
    chips: ["Stickman · 2D · 3D", "Histoires en scènes"],
    image: "/assets/studios/studio-animation.jpg",
    route: "/animation",
    themeStyle: "warm",
    bullets: [
      "Écris ou génère une histoire en scènes cohérentes",
      "Personnages constants d'une scène à l'autre",
      "Voix, musique et sous-titres animés inclus",
    ],
  },
];

type AdModalStep = "start" | "url" | "scan" | "brand";

export default function StudiosHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(60);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [topupOpen, setTopupOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // État de la feuille de dialogue active
  const [activeStudioModal, setActiveStudioModal] = useState<StudioCardConfig | null>(null);

  // Flux Ad Builder
  const [adStep, setAdStep] = useState<AdModalStep>("start");
  const [siteUrl, setSiteUrl] = useState<string>("");
  const [scanStepIndex, setScanStepIndex] = useState<number>(0);
  const [brandResult, setBrandResult] = useState<{
    colors: string[];
    fonts: string[];
    tone: string[];
  } | null>(null);

  // Notifications toast
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  // Chargement profil Supabase
  const loadUserData = async (userId: string) => {
    const supabase = createClient();
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", userId)
        .maybeSingle();

      if (profile && typeof profile.credits === "number") {
        setCredits(profile.credits);
      }
    } catch (err) {
      console.warn("Erreur chargement Supabase:", err);
    }
  };

  // Authentification et thème
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

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setIsDark(next === "dark");
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("studio_theme", next);
    } catch {}
  };

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

  const handleOpenStudio = (studio: StudioCardConfig) => {
    if (studio.id === "ad") {
      setAdStep("start");
      setSiteUrl("");
      setActiveStudioModal(studio);
      return;
    }
    setActiveStudioModal(studio);
  };

  const handleLaunchStudioRoute = (studio: StudioCardConfig) => {
    setActiveStudioModal(null);
    if (studio.id === "libre") {
      router.push("/studio");
      return;
    }
    if (studio.id === "cinema") {
      router.push("/studio?mode=video&vt=libre");
      return;
    }
    if (studio.id === "ugc") {
      router.push("/studio?mode=video&vt=ugc");
      return;
    }
    if (studio.id === "anim") {
      router.push("/studio?mode=video&vt=animation");
      return;
    }
    router.push("/studio");
  };

  // Simulation d'analyse Ad Builder
  const handleStartScan = (url: string) => {
    if (!url.trim()) return;
    setAdStep("scan");
    setScanStepIndex(0);

    const steps = [
      () => setScanStepIndex(1),
      () => setScanStepIndex(2),
      () => setScanStepIndex(3),
      () => {
        setScanStepIndex(4);
        setBrandResult({
          colors: ["#1B2E15", "#4B6B38", "#D8FF64", "#F4F7EE"],
          fonts: ["Sentient Display", "Geist Sans"],
          tone: ["Chaleureux", "Direct", "Accessible"],
        });
        setAdStep("brand");
      },
    ];

    steps.forEach((fn, idx) => {
      setTimeout(fn, (idx + 1) * 750);
    });
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
              Accès au Hub des Studios…
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[var(--lime)] selection:text-black">
      {/* ── EN-TÊTE DU HUB ── */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo />
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Pill Solde de Crédits */}
            <button
              type="button"
              onClick={() => setTopupOpen(true)}
              className="h-9 px-3.5 rounded-full bg-[var(--surf)] border border-[var(--line)] shadow-card flex items-center gap-2 text-[12.5px] font-medium hover:border-[var(--line-strong)] hover:bg-[var(--mn)] transition-all cursor-pointer"
              title="Recharger vos crédits"
            >
              <span className="w-2 h-2 rounded-full bg-[#D8FF64] shadow-[0_0_0_1px_rgba(23,23,23,0.25)]" />
              <span>{credits} crédits</span>
            </button>

            {/* Bouton Thème */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-[var(--surf)] border border-[var(--line)] shadow-card flex items-center justify-center text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-[var(--mn)] transition-all cursor-pointer"
              title={isDark ? "Passer en thème clair" : "Passer en thème sombre"}
              aria-label="Basculer le thème"
            >
              {isDark ? (
                <CoolIcon name="sun" duotone size={17} secondaryColor="currentColor" secondaryOpacity={0.45} />
              ) : (
                <CoolIcon name="moon" duotone size={17} secondaryColor="currentColor" secondaryOpacity={0.25} />
              )}
            </button>

            {/* Menu Utilisateur / Avatar */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-[#D8FF64] text-[#171717] font-semibold text-[13px] flex items-center justify-center shadow-card hover:opacity-90 transition-all cursor-pointer select-none"
                aria-label="Menu profil"
              >
                {user?.email ? user.email.charAt(0).toUpperCase() : "A"}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-[18px] bg-[var(--surf)] border border-[var(--line)] shadow-overlay p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[var(--line)]">
                    <small className="block text-[10.5px] text-[var(--mute)]">Connecté en tant que</small>
                    <strong className="block text-[12px] font-semibold text-[var(--ink)] truncate">
                      {user?.email}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setTopupOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12.5px] rounded-[10px] hover:bg-[var(--mn)] text-[var(--ink)] font-medium transition-colors cursor-pointer mt-1"
                  >
                    <CoolIcon name="credit-card-01" duotone size={16} />
                    <span>Recharger des crédits</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/studio");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12.5px] rounded-[10px] hover:bg-[var(--mn)] text-[var(--ink)] font-medium transition-colors cursor-pointer"
                  >
                    <CoolIcon name="image-01" duotone size={16} />
                    <span>Studio Libre direct</span>
                  </button>

                  <div className="my-1 border-t border-[var(--line)]" />

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12.5px] rounded-[10px] text-red-500 hover:bg-red-500/10 font-medium transition-colors cursor-pointer"
                  >
                    <CoolIcon name="log-out" duotone size={16} />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── CORPS DU HUB : TITRE & GRILLE DES STUDIOS ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-20">
        {/* Titre & phrase d'introduction du PRD v3 */}
        <div className="mb-10 sm:mb-12">
          <h1 className="font-heading text-[34px] sm:text-[46px] md:text-[52px] leading-[1.08] tracking-tight mb-3">
            <em className="not-italic block">Choisis ton studio.</em>
            <em className="italic font-normal text-[var(--ink)]/90 block">Tes idées prennent vie.</em>
          </h1>
          <p className="text-[14.5px] sm:text-[15.5px] text-[var(--mute)] max-w-xl leading-relaxed">
            Chaque studio est pensé pour un résultat précis. Les modèles sont choisis pour toi, sauf dans le Studio Libre et le Cinéma Studio.
          </p>
        </div>

        {/* Grille responsive des 5 Studios + carte Bientôt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {STUDIOS_DATA.map((s) => {
            const isDarkCard = s.themeStyle === "dark";
            const isLimeCard = s.themeStyle === "lime";

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleOpenStudio(s)}
                className={cn(
                  "group relative overflow-hidden min-h-[270px] sm:min-h-[290px] rounded-[22px] p-6 text-left flex flex-col justify-between",
                  "border border-[var(--line)] shadow-card transition-all duration-300 ease-out",
                  "hover:-translate-y-1 hover:shadow-overlay cursor-pointer select-none",
                  isDarkCard
                    ? "bg-gradient-to-br from-[#2b2b29] to-[#171717] text-[#f8f8f5] border-white/10"
                    : isLimeCard
                    ? "bg-gradient-to-br from-[#D8FF64]/20 via-[#D8FF64]/05 to-[var(--surf)] border-[#D8FF64]/40 text-[var(--ink)]"
                    : "bg-gradient-to-br from-[var(--surf)] to-[var(--mn)]/70 text-[var(--ink)]"
                )}
              >
                {/* ── ARRIÈRE-PLAN : VRAIE ILLUSTRATION REPRÉSENTANT LE STUDIO AVEC MASQUE DÉGRADÉ ── */}
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden rounded-[22px]"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      "absolute -inset-y-[8%] -right-[15%] w-[68%] transition-transform duration-700 ease-out",
                      "group-hover:scale-105 group-hover:rotate-1",
                      isDarkCard ? "opacity-45 mix-blend-screen" : "opacity-60 dark:opacity-40 mix-blend-multiply"
                    )}
                    style={{
                      backgroundImage: `url(${s.image})`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                      maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 30%, #000 100%)",
                      WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 30%, #000 100%)",
                    }}
                  />
                </div>

                {/* ── TOP : NUMÉRO + BOUTON FLÈCHE ── */}
                <div className="relative z-10 flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[12px] font-mono font-medium tracking-wider",
                      isDarkCard ? "text-white/60" : "text-[var(--mute)]"
                    )}
                  >
                    {s.num}
                  </span>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-[11px] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1",
                      isDarkCard
                        ? "bg-[#f8f8f5] text-[#171717]"
                        : "bg-[var(--ink)] text-[var(--bg)]"
                    )}
                  >
                    <CoolIcon name="arrow-right-sm" size={15} duotone={false} />
                  </div>
                </div>

                {/* ── BOTTOM : TITRE SERIF + DESCRIPTION + CHIPS ── */}
                <div className="relative z-10 mt-6">
                  <h2 className="font-heading text-[27px] sm:text-[30px] leading-[1.08] mb-2 font-normal">
                    {s.name}
                  </h2>
                  <p
                    className={cn(
                      "text-[13px] sm:text-[13.5px] leading-relaxed max-w-[250px] mb-4 line-clamp-2",
                      isDarkCard ? "text-white/80" : "text-[var(--ink)]/80"
                    )}
                  >
                    {s.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.chips.map((c, i) => (
                      <span
                        key={i}
                        className={cn(
                          "text-[11.5px] font-medium px-2.5 py-1 rounded-[10px] backdrop-blur-md",
                          isDarkCard
                            ? "bg-white/12 text-white/90"
                            : "bg-[var(--ink)]/07 text-[var(--ink)]/90"
                        )}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Carte 6 : Un nouveau studio arrive bientôt */}
          <div className="relative min-h-[270px] sm:min-h-[290px] rounded-[22px] p-6 border-1.5 border-dashed border-[var(--line)] flex flex-col items-center justify-center text-center select-none bg-transparent">
            <div className="w-10 h-10 rounded-full bg-[var(--mn)]/70 border border-[var(--line)] flex items-center justify-center text-[var(--mute)] mb-3">
              <CoolIcon name="add-plus" size={16} />
            </div>
            <span className="text-[13px] font-medium text-[var(--mute)] max-w-[180px]">
              Un nouveau studio arrive bientôt
            </span>
          </div>
        </div>
      </main>

      {/* ── MODALE / DIALOGUE DE DÉMARRAGE DU STUDIO (COMPOSANTS COSS) ── */}
      {activeStudioModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveStudioModal(null);
          }}
        >
          <div
            className={cn(
              "relative w-full max-w-[480px] bg-[var(--surf)] border border-[var(--line)] shadow-overlay rounded-t-[24px] sm:rounded-[22px] p-6 sm:p-7 text-[var(--ink)] max-h-[90vh] overflow-y-auto",
              "animate-in zoom-in-95 duration-200"
            )}
          >
            {/* Cas Spécifique : Flux Ad Builder */}
            {activeStudioModal.id === "ad" ? (
              <div>
                {adStep === "start" && (
                  <>
                    <h3 className="font-heading text-[26px] leading-tight mb-1.5">
                      Nouveau projet Ad Builder
                    </h3>
                    <p className="text-[13.5px] text-[var(--mute)] leading-relaxed mb-5">
                      Ad Builder choisit le meilleur modèle pour toi. Tu n&apos;as qu&apos;à décrire ton idée.
                    </p>

                    <div className="space-y-2.5 mb-5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStudioModal(null);
                          showToast("Projet libre créé dans Ad Builder");
                          router.push("/studio?mode=image&style=Affiche");
                        }}
                        className="w-full text-left p-4 rounded-[16px] border border-[var(--line)] hover:border-[var(--ink)] hover:bg-[var(--mn)] transition-all cursor-pointer"
                      >
                        <strong className="block text-[14px] font-medium mb-0.5">
                          Projet libre
                        </strong>
                        <span className="text-[12.5px] text-[var(--mute)] block">
                          Pars d&apos;une page blanche pour une affiche publicitaire ou un spot vidéo.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdStep("url")}
                        className="w-full text-left p-4 rounded-[16px] border border-[var(--line)] hover:border-[var(--ink)] hover:bg-[var(--mn)] transition-all cursor-pointer"
                      >
                        <strong className="block text-[14px] font-medium mb-0.5">
                          Pub pour mon site
                        </strong>
                        <span className="text-[12.5px] text-[var(--mute)] block">
                          On analyse ton site pour reprendre tes couleurs, tes polices, tes images et ton ton.
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveStudioModal(null)}
                      className="w-full h-11 rounded-[14px] bg-[var(--mn)] text-[var(--ink)] font-medium text-[13px] hover:bg-[var(--hover)] transition-colors cursor-pointer"
                    >
                      Fermer
                    </button>
                  </>
                )}

                {adStep === "url" && (
                  <>
                    <h3 className="font-heading text-[26px] leading-tight mb-1.5">
                      Ton site
                    </h3>
                    <p className="text-[13.5px] text-[var(--mute)] leading-relaxed mb-4">
                      Colle l&apos;adresse de ton site. On extrait l&apos;identité visuelle pour que l&apos;IA génère des pubs fidèles.
                    </p>

                    <input
                      type="url"
                      placeholder="https://monsite.com"
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-[12px] bg-[var(--mn)] border border-[var(--line)] text-[13.5px] text-[var(--ink)] placeholder:text-[var(--mute)] focus:outline-none focus:border-[var(--ink)] focus:ring-2 focus:ring-[#D8FF64] mb-4"
                    />

                    <button
                      type="button"
                      onClick={() => handleStartScan(siteUrl)}
                      className="w-full h-11 rounded-[14px] bg-[#D8FF64] text-[#171717] font-semibold text-[13px] hover:opacity-90 transition-opacity cursor-pointer mb-2"
                    >
                      Analyser mon site
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdStep("start")}
                      className="w-full h-10 rounded-[14px] bg-[var(--mn)] text-[var(--ink)] font-medium text-[13px] hover:bg-[var(--hover)] transition-colors cursor-pointer"
                    >
                      Retour
                    </button>
                  </>
                )}

                {adStep === "scan" && (
                  <>
                    <h3 className="font-heading text-[26px] leading-tight mb-1.5">
                      Analyse en cours…
                    </h3>
                    <p className="text-[13.5px] text-[var(--mute)] truncate mb-5">
                      {siteUrl || "https://monsite.com"}
                    </p>

                    <div className="space-y-3 mb-6">
                      {[
                        "Couleurs de la marque",
                        "Typographies",
                        "Images et logo",
                        "Façon de communiquer",
                      ].map((stepLabel, idx) => {
                        const done = scanStepIndex > idx;
                        return (
                          <div
                            key={idx}
                            className={cn(
                              "flex items-center gap-3 text-[13.5px] transition-colors",
                              done ? "text-[var(--ink)] font-medium" : "text-[var(--mute)]"
                            )}
                          >
                            <span
                              className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center text-[11px] border",
                                done
                                  ? "bg-[#D8FF64] border-[#171717] text-[#171717]"
                                  : "border-[var(--line)] text-[var(--mute)]"
                              )}
                            >
                              {done ? "✓" : idx + 1}
                            </span>
                            <span>{stepLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {adStep === "brand" && brandResult && (
                  <>
                    <h3 className="font-heading text-[26px] leading-tight mb-1.5">
                      Voici ta marque
                    </h3>
                    <p className="text-[13.5px] text-[var(--mute)] leading-relaxed mb-4">
                      Vérifie l&apos;identité extraite, puis lance ton projet.
                    </p>

                    {/* Couleurs */}
                    <div className="mb-3.5">
                      <div className="text-[12px] font-medium text-[var(--mute)] mb-1.5">Couleurs</div>
                      <div className="flex gap-2">
                        {brandResult.colors.map((c, i) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-[12px] border border-black/10 shadow-xs"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Typographies */}
                    <div className="mb-3.5">
                      <div className="text-[12px] font-medium text-[var(--mute)] mb-1.5">Typographies</div>
                      <div className="flex gap-2">
                        {brandResult.fonts.map((f, i) => (
                          <span key={i} className="text-[12px] font-medium px-2.5 py-1 rounded-[8px] bg-[var(--mn)] text-[var(--ink)]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Ton */}
                    <div className="mb-5">
                      <div className="text-[12px] font-medium text-[var(--mute)] mb-1.5">Ton de la marque</div>
                      <div className="flex flex-wrap gap-1.5">
                        {brandResult.tone.map((t, i) => (
                          <span key={i} className="text-[11.5px] font-medium px-2.5 py-1 rounded-[8px] bg-[var(--mn)] text-[var(--ink)]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveStudioModal(null);
                        showToast("Marque injectée ! Projet Ad Builder prêt.");
                        router.push("/studio?mode=image&style=Affiche");
                      }}
                      className="w-full h-11 rounded-[14px] bg-[#D8FF64] text-[#171717] font-semibold text-[13px] hover:opacity-90 transition-opacity cursor-pointer mb-2"
                    >
                      Créer le projet
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdStep("start")}
                      className="w-full h-10 rounded-[14px] bg-[var(--mn)] text-[var(--ink)] font-medium text-[13px] hover:bg-[var(--hover)] transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* Dialogue standard pour les autres studios */
              <div>
                <h3 className="font-heading text-[26px] leading-tight mb-1.5">
                  {activeStudioModal.name}
                </h3>
                <p className="text-[13.5px] text-[var(--mute)] leading-relaxed mb-4">
                  {activeStudioModal.desc}
                </p>

                <ul className="space-y-2 mb-6 text-[13.5px] leading-relaxed list-disc pl-5 text-[var(--ink)]/90">
                  {activeStudioModal.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleLaunchStudioRoute(activeStudioModal)}
                  className="w-full h-11 rounded-[14px] bg-[#D8FF64] text-[#171717] font-semibold text-[13px] hover:opacity-90 transition-opacity cursor-pointer mb-2"
                >
                  Ouvrir le studio
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStudioModal(null)}
                  className="w-full h-10 rounded-[14px] bg-[var(--mn)] text-[var(--ink)] font-medium text-[13px] hover:bg-[var(--hover)] transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODALE TOPUP / RECHARGE CRÉDITS ── */}
      <TopupModal
        isOpen={topupOpen}
        onClose={() => setTopupOpen(false)}
        onSuccess={(addedCredits, newTotal) => {
          if (typeof newTotal === "number") {
            setCredits(newTotal);
          } else {
            setCredits((prev) => prev + addedCredits);
          }
          showToast(`+${addedCredits} crédits ajoutés à votre compte !`);
        }}
      />

      {/* ── NOTIFICATION TOAST FLUIDE ── */}
      <div
        className={cn(
          "fixed left-1/2 bottom-6 -translate-x-1/2 bg-[var(--ink)] text-[var(--bg)] px-4 py-2.5 rounded-full text-[13px] font-medium shadow-overlay transition-opacity duration-200 z-50 pointer-events-none max-w-[90vw] truncate",
          toastMsg ? "opacity-100" : "opacity-0"
        )}
      >
        {toastMsg}
      </div>
    </div>
  );
}

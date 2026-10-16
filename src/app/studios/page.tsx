"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CoolIcon } from "@/components/icons/coolicon";
import { LogoIcon } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarDrawer } from "@/components/studio/sidebar-drawer";
import { TopupModal } from "@/components/topup-modal";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

/* ── PRESETS DATA (Haute Définition & Vidéos Réelles avec Posters) ── */
interface PresetItem {
  id: string;
  type: "image" | "video";
  category: "image" | "video" | "assets" | "mcp";
  mediaUrl: string;
  thumbnailUrl?: string;
  prompt: string;
  aspect?: string;
}

const COMMUNITY_PRESETS: PresetItem[] = [
  {
    id: "preset-1",
    type: "image",
    category: "image",
    mediaUrl: "/assets/gallery/preset_beach.jpg",
    thumbnailUrl: "/assets/gallery/preset_beach.jpg",
    prompt: "Two friends smiling at a tropical luxury beach resort, warm sunset rim light, cinematic 35mm film",
    aspect: "4/5",
  },
  {
    id: "preset-2",
    type: "image",
    category: "image",
    mediaUrl: "/assets/gallery/preset_pink_girl.jpg",
    thumbnailUrl: "/assets/gallery/preset_pink_girl.jpg",
    prompt: "Cozy morning portrait, soft window illumination, pastel blush knitwear, hyperdetailed skin texture",
    aspect: "3/4",
  },
  {
    id: "preset-3",
    type: "image",
    category: "image",
    mediaUrl: "/assets/gallery/preset_mountain.jpg",
    thumbnailUrl: "/assets/gallery/preset_mountain.jpg",
    prompt: "Wide cinematic landscape, traveler in white standing in golden grass before majestic mountain peaks at dawn",
    aspect: "16/9",
  },
  {
    id: "preset-4",
    type: "video",
    category: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "/assets/gallery/preset_backstage.jpg",
    prompt: "Backstage concert hallway, warm red neon lighting, dynamic camera tracking speaker through crew",
    aspect: "9/16",
  },
  {
    id: "preset-5",
    type: "video",
    category: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "/assets/gallery/preset_subway.jpg",
    prompt: "Subway station speed blur, stylish figure running parallel to arriving train, cinematic motion",
    aspect: "9/16",
  },
  {
    id: "preset-6",
    type: "video",
    category: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    thumbnailUrl: "/assets/gallery/preset_cyber_atrium.jpg",
    prompt: "Futuristic skyscraper atrium with reflective steel columns, dancer in silver metallic streetwear",
    aspect: "9/16",
  },
  {
    id: "preset-7",
    type: "image",
    category: "image",
    mediaUrl: "/assets/gallery/preset_night_park.jpg",
    thumbnailUrl: "/assets/gallery/preset_night_park.jpg",
    prompt: "Atmospheric night scene in park, single vintage streetlamp glow, mysterious cinematic shadows",
    aspect: "3/4",
  },
  {
    id: "preset-8",
    type: "image",
    category: "assets",
    mediaUrl: "/assets/studios/studio-ugc.jpg",
    thumbnailUrl: "/assets/studios/studio-ugc.jpg",
    prompt: "Authentic UGC creator smiling in natural studio setting, reviewing beauty product with soft light",
    aspect: "1/1",
  },
  {
    id: "preset-9",
    type: "image",
    category: "assets",
    mediaUrl: "/assets/studios/studio-libre.jpg",
    thumbnailUrl: "/assets/studios/studio-libre.jpg",
    prompt: "High fashion editorial studio portrait, dramatic chiaroscuro lighting, minimalist aesthetics",
    aspect: "4/3",
  },
  {
    id: "preset-10",
    type: "video",
    category: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "/assets/studios/studio-animation.jpg",
    prompt: "Fluid organic motion simulation, iridescent translucent liquid spheres colliding in zero gravity",
    aspect: "1/1",
  },
  {
    id: "preset-11",
    type: "image",
    category: "mcp",
    mediaUrl: "/assets/gallery/banner_ads.jpg",
    thumbnailUrl: "/assets/gallery/banner_ads.jpg",
    prompt: "Winning modern brand static ad campaign, high conversion commercial visual layout",
    aspect: "16/9",
  },
];

/* ── STUDIOS FEATURED BANNER ── */
interface FeaturedBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  route: string;
}

const FEATURED_BANNERS: FeaturedBanner[] = [
  {
    id: "ad",
    title: "ADS STUDIO",
    subtitle: "Winning static ads at scale",
    image: "/assets/gallery/banner_ads.jpg",
    route: "/studios/ad-builder",
  },
  {
    id: "cinema",
    title: "CINEMA STUDIO",
    subtitle: "Master 35mm 4K cinematic video",
    image: "/assets/studios/studio-cinema.jpg",
    route: "/studios/cinema",
  },
  {
    id: "genjutsu",
    title: "GENJUTSU",
    subtitle: "Motion transfer & character swap",
    image: "/assets/studios/studio-libre.jpg",
    route: "/studios/genjutsu",
  },
  {
    id: "influencer",
    title: "AI INFLUENCER",
    subtitle: "Consistent digital persona",
    image: "/assets/influencer/gender_female.jpg",
    route: "/studios/ai-influencer",
  },
  {
    id: "ugc",
    title: "UGC STUDIO",
    subtitle: "Viral authentic customer reviews",
    image: "/assets/studios/studio-ugc.jpg",
    route: "/studios/ugc",
  },
  {
    id: "animation",
    title: "ANIMATION STUDIO",
    subtitle: "Cartoons & multi-scene stories",
    image: "/assets/studios/studio-animation.jpg",
    route: "/studios/animation",
  },
];

export default function StudiosExplorePage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [credits, setCredits] = useState<number>(60);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);

  // Filtre de catégorie (Image, Video, Assets, MCP)
  const [activeCategory, setActiveCategory] = useState<"all" | "image" | "video" | "assets" | "mcp">("all");

  // Recherche
  const [searchQuery, setSearchQuery] = useState("");

  // Carrousel banner index actif
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Modal aperçu d'un preset
  const [selectedPreset, setSelectedPreset] = useState<PresetItem | null>(null);
  const [userGenerations, setUserGenerations] = useState<PresetItem[]>([]);

  // Lecture aléatoire (Shuffle Play)
  const [isShufflePlaying, setIsShufflePlaying] = useState(false);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Chargement auth & Supabase
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        supabase
          .from("profiles")
          .select("credits")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.credits !== undefined) setCredits(data.credits);
          });

        // Chargement des créations de l'utilisateur pour la galerie
        supabase
          .from("generations")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(10)
          .then(({ data: gens }) => {
            if (gens && gens.length > 0) {
              const formatted: PresetItem[] = gens
                .filter((g) => g.media_url || g.thumbnail_url)
                .map((g) => ({
                  id: g.id || g.task_id,
                  type: g.tool === "video" ? "video" : "image",
                  category: g.tool === "video" ? "video" : "image",
                  mediaUrl: g.media_url || g.thumbnail_url,
                  thumbnailUrl: g.thumbnail_url || (g.tool === "video" ? undefined : g.media_url),
                  prompt: g.prompt,
                }));
              setUserGenerations(formatted);
            }
          });
      }
    });
  }, []);

  // Détection du scroll du carrousel pour mettre à jour les points de pagination
  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    setActiveBannerIdx(index);
  };

  // Filtrage des créations
  const allItems = [...userGenerations, ...COMMUNITY_PRESETS];
  const filteredPresets = allItems.filter((item) => {
    const matchCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchSearch =
      !searchQuery.trim() ||
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Gestion de la lecture aléatoire (Shuffle Play)
  const toggleShufflePlay = () => {
    const nextState = !isShufflePlaying;
    setIsShufflePlaying(nextState);

    Object.values(videoRefs.current).forEach((v) => {
      if (!v) return;
      if (nextState) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  };

  const handleRecreate = (promptText: string) => {
    setSelectedPreset(null);
    router.push(`/studio?prompt=${encodeURIComponent(promptText)}`);
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-28 selection:bg-[#D8FF64] selection:text-black transition-colors duration-200">
      {/* ── TOP BAR ÉPURÉE (Thème Clair / Sombre cohérent) ── */}
      <header className="fixed top-0 inset-x-0 h-14 sm:h-16 px-4 sm:px-6 z-30 flex items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 rounded-full bg-[var(--field)] hover:bg-[var(--hover)] border border-[var(--line)] flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--ink)] transition-all cursor-pointer"
          title="Menu des studios"
          aria-label="Menu"
        >
          <CoolIcon name="hamburger-md" size={18} duotone={false} />
        </button>

        <h1 className="font-heading text-[16px] sm:text-[17px] font-semibold text-[var(--ink)] tracking-tight">
          Explore
        </h1>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setTopupOpen(true)}
            className="h-8 sm:h-9 px-3.5 rounded-full bg-[#D8FF64] hover:bg-[#cbf54a] text-black font-semibold text-[12px] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Recharger vos crédits"
          >
            <CoolIcon name="star" size={13} duotone={false} className="text-black fill-current" />
            <span className="font-mono text-[12px] font-bold">{credits} cr</span>
          </button>
        </div>
      </header>

      {/* ── CONTENU EXPLORE ── */}
      <main className="max-w-2xl mx-auto px-4 pt-18 sm:pt-20 space-y-6">
        
        {/* 1. CARROUSEL BANNER DES FONCTIONNALITÉS EN DÉFILEMENT HORIZONTAL */}
        <div className="relative w-full">
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex items-center gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-2xl"
          >
            {FEATURED_BANNERS.map((banner) => (
              <div
                key={banner.id}
                onClick={() => router.push(banner.route)}
                className="relative w-full shrink-0 aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden cursor-pointer group snap-center border border-[var(--line)] shadow-sm"
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-5">
                  <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white mb-0.5">
                    {banner.title}
                  </h2>
                  <p className="text-[12.5px] text-white/80 font-normal">
                    {banner.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Points de pagination du carrousel */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {FEATURED_BANNERS.map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  "rounded-full transition-all",
                  activeBannerIdx === idx
                    ? "w-2.5 h-1.5 bg-[#D8FF64]"
                    : "w-1.5 h-1.5 bg-[var(--line-strong)]"
                )}
              />
            ))}
          </div>
        </div>

        {/* 2. CATÉGORIES HORIZONTALES (Image · Video · Assets · MCP) */}
        <div className="grid grid-cols-4 gap-2.5 pt-1">
          {[
            { id: "image", label: "Image", img: "/assets/gallery/cat_image.jpg" },
            { id: "video", label: "Video", img: "/assets/gallery/cat_video.jpg" },
            { id: "assets", label: "Assets", img: "/assets/gallery/cat_assets.jpg" },
            { id: "mcp", label: "MCP", icon: "instance" },
          ].map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setActiveCategory((cur) => (cur === cat.id ? "all" : (cat.id as any)))
                }
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div
                  className={cn(
                    "w-full aspect-[4/3] rounded-2xl overflow-hidden border transition-all flex items-center justify-center",
                    active
                      ? "border-[#D8FF64] ring-2 ring-[#D8FF64]/40 bg-[#D8FF64]/10"
                      : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)]"
                  )}
                >
                  {cat.img ? (
                    <img
                      src={cat.img}
                      alt={cat.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--field)] flex items-center justify-center">
                      <CoolIcon
                        name="instance"
                        size={22}
                        duotone
                        className={active ? "text-[#D8FF64]" : "text-[var(--mute)]"}
                      />
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[12px] font-medium transition-colors",
                    active ? "text-[#D8FF64] font-semibold" : "text-[var(--mute)] group-hover:text-[var(--ink)]"
                  )}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. SECTION HEADER : RECREATE WITH ONE TAP / COMMUNITY PRESETS + LECTURE ALÉATOIRE */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <span className="text-[11.5px] font-semibold text-[#8ca825] dark:text-[#D8FF64] tracking-wide block">
              Recreate with one tap ✨
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--ink)] tracking-tight">
                Community presets
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Bouton de lecture aléatoire des vidéos */}
            <button
              type="button"
              onClick={toggleShufflePlay}
              className={cn(
                "h-8 px-3 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer border",
                isShufflePlaying
                  ? "bg-[#D8FF64] text-black border-[#D8FF64] shadow-sm animate-pulse"
                  : "bg-[var(--surface)] hover:bg-[var(--hover)] text-[var(--ink-2)] hover:text-[var(--ink)] border-[var(--line)]"
              )}
              title="Activer ou désactiver la lecture aléatoire des vidéos"
            >
              <CoolIcon
                name={isShufflePlaying ? "pause" : "play"}
                size={11}
                duotone={false}
                className={isShufflePlaying ? "text-black fill-current" : "fill-current"}
              />
              <span>{isShufflePlaying ? "Pause aléatoire" : "Lecture aléatoire"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className="text-[12px] text-[var(--mute)] hover:text-[var(--ink)] transition-colors cursor-pointer flex items-center gap-0.5 px-2 py-1"
            >
              <span>View all</span>
              <CoolIcon name="arrow-right-sm" size={13} duotone={false} />
            </button>
          </div>
        </div>

        {/* 4. GRILLE MASONRY ÉPURÉE EN 2 COLONNES (VIDÉOS FLUIDES & MINIATURES HAUTE DÉFINITION) */}
        <div className="columns-2 gap-2.5 sm:gap-3 space-y-2.5 sm:space-y-3 pt-1">
          {filteredPresets.map((preset) => {
            const isVideo = preset.type === "video" || preset.mediaUrl.endsWith(".mp4");

            return (
              <div
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className="relative w-full rounded-2xl overflow-hidden cursor-pointer group break-inside-avoid border border-[var(--line)] bg-[var(--surface)] transition-all hover:border-[var(--line-strong)] hover:scale-[1.01] shadow-card"
              >
                {isVideo ? (
                  <div className="relative w-full overflow-hidden bg-black">
                    <video
                      ref={(el) => {
                        videoRefs.current[preset.id] = el;
                      }}
                      src={`${preset.mediaUrl}#t=0.001`}
                      poster={preset.thumbnailUrl}
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-auto object-cover block"
                      onMouseEnter={(e) => {
                        if (!isShufflePlaying) e.currentTarget.play().catch(() => {});
                      }}
                      onMouseLeave={(e) => {
                        if (!isShufflePlaying) e.currentTarget.pause();
                      }}
                    />
                    {/* Badge Play discret */}
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white pointer-events-none group-hover:scale-110 transition-transform">
                      <CoolIcon name="play" size={10} duotone={false} className="fill-current text-white translate-x-[0.5px]" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={preset.mediaUrl}
                    alt={preset.prompt}
                    loading="lazy"
                    className="w-full h-auto object-cover block group-hover:scale-102 transition-transform duration-300"
                  />
                )}

                {/* Voile discret au survol avec bouton Recreate */}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRecreate(preset.prompt);
                    }}
                    className="w-full py-1.5 px-3 rounded-full bg-[#D8FF64] text-black font-semibold text-[11px] flex items-center justify-center gap-1 shadow-md hover:bg-[#cbf54a] transition-all cursor-pointer"
                  >
                    <CoolIcon name="star" size={11} duotone={false} className="text-black fill-current" />
                    <span>Recreate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ── 5. BARRE DE RECHERCHE FLOTTANTE EN BAS (Design tokens) ── */}
      <div className="fixed bottom-5 inset-x-0 z-30 px-4 pointer-events-none flex justify-center">
        <div className="w-full max-w-md pointer-events-auto">
          <div className="relative flex items-center w-full h-12 rounded-full bg-[var(--surface)]/90 backdrop-blur-xl border border-[var(--line)] px-4 shadow-2xl">
            <CoolIcon name="search-magnifying-glass" size={16} duotone={false} className="text-[var(--mute)] shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search presets and creations…"
              className="w-full bg-transparent text-[13px] text-[var(--ink)] placeholder-[var(--mute)] outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 text-[var(--mute)] hover:text-[var(--ink)]"
              >
                <CoolIcon name="close-md" size={14} duotone={false} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL APERÇU & RECREATE DU PRESET (Support Image & Vidéo avec contrôles) ── */}
      {selectedPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedPreset(null)}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            {/* Média principal */}
            <div className="relative w-full max-h-[50vh] overflow-hidden bg-black flex items-center justify-center">
              {selectedPreset.type === "video" || selectedPreset.mediaUrl.endsWith(".mp4") ? (
                <video
                  src={selectedPreset.mediaUrl}
                  poster={selectedPreset.thumbnailUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full max-h-[50vh] object-contain"
                />
              ) : (
                <img
                  src={selectedPreset.mediaUrl}
                  alt={selectedPreset.prompt}
                  className="w-full h-full object-contain"
                />
              )}
              <button
                type="button"
                onClick={() => setSelectedPreset(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <CoolIcon name="close-md" size={16} duotone={false} />
              </button>
            </div>

            {/* Prompt & Bouton Recreate */}
            <div className="p-4 space-y-3">
              <p className="text-[12.5px] text-[var(--ink-2)] leading-relaxed max-h-24 overflow-y-auto">
                {selectedPreset.prompt}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPreset.prompt);
                  }}
                  className="px-3.5 h-10 rounded-full bg-[var(--field)] hover:bg-[var(--hover)] border border-[var(--line)] text-[var(--ink)] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CoolIcon name="copy" size={13} duotone={false} />
                  <span>Copy</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRecreate(selectedPreset.prompt)}
                  className="flex-1 h-10 rounded-full bg-[#D8FF64] hover:bg-[#cbf54a] text-black font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <CoolIcon name="star" size={13} duotone={false} className="text-black fill-current" />
                  <span>Recreate in Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TIROIR SIDEBAR ── */}
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userEmail={user?.email}
        credits={credits}
        onOpenTopup={() => {
          setSidebarOpen(false);
          setTopupOpen(true);
        }}
      />

      {/* ── MODALE TOPUP / UPGRADE ── */}
      <TopupModal
        isOpen={topupOpen}
        onClose={() => setTopupOpen(false)}
        onSuccess={(added) => {
          setCredits((c) => c + added);
          setTopupOpen(false);
        }}
      />
    </div>
  );
}

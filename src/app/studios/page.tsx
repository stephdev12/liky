"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CoolIcon } from "@/components/icons/coolicon";
import { LogoIcon } from "@/components/logo";
import { SidebarDrawer } from "@/components/studio/sidebar-drawer";
import { TopupModal } from "@/components/topup-modal";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

/* ── PRESETS DATA (Identique aux références fournies) ── */
interface PresetItem {
  id: string;
  type: "image" | "video";
  category: "image" | "video" | "assets" | "mcp";
  mediaUrl: string;
  prompt: string;
  aspect?: string;
}

const COMMUNITY_PRESETS: PresetItem[] = [
  {
    id: "preset-1",
    type: "image",
    category: "image",
    mediaUrl: "/assets/gallery/preset_beach.jpg",
    prompt: "Two friends smiling at a tropical luxury beach resort, warm sunset rim light, cinematic 35mm film",
    aspect: "4/5",
  },
  {
    id: "preset-2",
    type: "image",
    category: "image",
    mediaUrl: "/assets/gallery/preset_pink_girl.jpg",
    prompt: "Cozy morning portrait, soft window illumination, pastel pink aesthetic, hyperdetailed skin texture",
    aspect: "3/4",
  },
  {
    id: "preset-3",
    type: "image",
    category: "image",
    mediaUrl: "/assets/gallery/preset_mountain.jpg",
    prompt: "Wide cinematic landscape, traveler in white standing in golden grass before majestic mountain peaks at dawn",
    aspect: "16/9",
  },
  {
    id: "preset-4",
    type: "video",
    category: "video",
    mediaUrl: "/assets/gallery/preset_backstage.jpg",
    prompt: "Backstage concert hallway, warm red neon lighting, dynamic camera tracking speaker through crew",
    aspect: "9/16",
  },
  {
    id: "preset-5",
    type: "video",
    category: "video",
    mediaUrl: "/assets/gallery/preset_subway.jpg",
    prompt: "Subway station speed blur, stylish figure running parallel to arriving train, cinematic motion",
    aspect: "9/16",
  },
  {
    id: "preset-6",
    type: "video",
    category: "video",
    mediaUrl: "/assets/gallery/preset_cyber_atrium.jpg",
    prompt: "Futuristic skyscraper atrium with reflective steel columns, dancer in silver metallic streetwear",
    aspect: "9/16",
  },
  {
    id: "preset-7",
    type: "image",
    category: "image",
    mediaUrl: "/assets/gallery/preset_night_park.jpg",
    prompt: "Atmospheric night scene in park, single vintage streetlamp glow, mysterious cinematic shadows",
    aspect: "3/4",
  },
  {
    id: "preset-8",
    type: "image",
    category: "assets",
    mediaUrl: "/assets/organic/organic-1.webp",
    prompt: "High fashion editorial studio portrait, dramatic chiaroscuro lighting, minimalist aesthetics",
    aspect: "1/1",
  },
  {
    id: "preset-9",
    type: "image",
    category: "assets",
    mediaUrl: "/assets/organic/organic-2.webp",
    prompt: "Modern architectural interior with brutalist organic forms, warm sunlight beams across polished concrete",
    aspect: "4/3",
  },
  {
    id: "preset-10",
    type: "video",
    category: "video",
    mediaUrl: "/assets/organic/organic-3.webp",
    prompt: "Fluid organic motion simulation, iridescent translucent liquid spheres colliding in zero gravity",
    aspect: "1/1",
  },
  {
    id: "preset-11",
    type: "image",
    category: "mcp",
    mediaUrl: "/assets/organic/organic-4.webp",
    prompt: "Cyberpunk urban alleyway at midnight, reflective rain puddles, neon green holograms",
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
    image: "/assets/influencer/type_bold.jpg",
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

  const handleRecreate = (promptText: string) => {
    setSelectedPreset(null);
    router.push(`/studio?prompt=${encodeURIComponent(promptText)}`);
  };

  return (
    <div className="relative min-h-screen bg-[#111110] text-[#F8F8F5] pb-28 selection:bg-[#D8FF64] selection:text-black">
      {/* ── TOP BAR ÉPURÉE ── */}
      <header className="fixed top-0 inset-x-0 h-14 sm:h-16 px-4 sm:px-6 z-30 flex items-center justify-between border-b border-white/5 bg-[#111110]/85 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
          title="Menu"
          aria-label="Menu"
        >
          <CoolIcon name="hamburger-md" size={18} duotone={false} />
        </button>

        <h1 className="font-heading text-[16px] sm:text-[17px] font-semibold text-white tracking-tight">
          Explore
        </h1>

        <button
          type="button"
          onClick={() => setTopupOpen(true)}
          className="h-8 sm:h-9 px-3.5 rounded-full bg-[#D8FF64] hover:bg-[#cbf54a] text-black font-semibold text-[12px] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
        >
          <CoolIcon name="star" size={13} duotone={false} className="text-black fill-current" />
          <span>Upgrade</span>
        </button>
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
                className="relative w-full shrink-0 aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden cursor-pointer group snap-center border border-white/10"
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
                    ? "w-2.5 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/20"
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
                      : "border-white/10 bg-[#1A1A18] hover:border-white/25"
                  )}
                >
                  {cat.img ? (
                    <img
                      src={cat.img}
                      alt={cat.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <CoolIcon
                        name="instance"
                        size={22}
                        duotone
                        className={active ? "text-[#D8FF64]" : "text-white/80"}
                      />
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[12px] font-medium transition-colors",
                    active ? "text-[#D8FF64] font-semibold" : "text-white/80 group-hover:text-white"
                  )}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. SECTION HEADER : RECREATE WITH ONE TAP / COMMUNITY PRESETS */}
        <div className="pt-2">
          <span className="text-[11.5px] font-semibold text-[#D8FF64] tracking-wide block">
            Recreate with one tap ✨
          </span>
          <div className="flex items-center justify-between mt-0.5">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
              Community presets
            </h2>
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className="text-[12px] text-white/50 hover:text-white transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <span>View all</span>
              <CoolIcon name="arrow-right-sm" size={13} duotone={false} />
            </button>
          </div>
        </div>

        {/* 4. GRILLE MASONRY ÉPURÉE EN 2 COLONNES (AUCUN TEXTE TECHNIQUE, 100% VISUEL) */}
        <div className="columns-2 gap-2.5 sm:gap-3 space-y-2.5 sm:space-y-3 pt-1">
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => setSelectedPreset(preset)}
              className="relative w-full rounded-2xl overflow-hidden cursor-pointer group break-inside-avoid border border-white/5 bg-[#181817] transition-all hover:border-white/20 hover:scale-[1.01]"
            >
              <img
                src={preset.mediaUrl}
                alt={preset.prompt}
                loading="lazy"
                className="w-full h-auto object-cover block"
              />
              {/* Voile discret au survol avec bouton Recreate */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
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
          ))}
        </div>
      </main>

      {/* ── 5. BARRE DE RECHERCHE FLOTTANTE EN BAS (Exactement comme dans la capture) ── */}
      <div className="fixed bottom-5 inset-x-0 z-30 px-4 pointer-events-none flex justify-center">
        <div className="w-full max-w-md pointer-events-auto">
          <div className="relative flex items-center w-full h-12 rounded-full bg-[#181817]/90 backdrop-blur-xl border border-white/10 px-4 shadow-2xl">
            <CoolIcon name="search-magnifying-glass" size={16} duotone={false} className="text-white/40 shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-[13px] text-white placeholder-white/40 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 text-white/40 hover:text-white"
              >
                <CoolIcon name="close-md" size={14} duotone={false} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL APERÇU & RECREATE DU PRESET ── */}
      {selectedPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedPreset(null)}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-[#181817] border border-white/10 overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            {/* Image principale */}
            <div className="relative w-full max-h-[50vh] overflow-hidden bg-black">
              <img
                src={selectedPreset.mediaUrl}
                alt={selectedPreset.prompt}
                className="w-full h-full object-contain"
              />
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
              <p className="text-[12.5px] text-white/80 leading-relaxed max-h-24 overflow-y-auto">
                {selectedPreset.prompt}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPreset.prompt);
                  }}
                  className="px-3.5 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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

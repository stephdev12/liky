"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CoolIcon } from "@/components/icons/coolicon";
import { LogoIcon } from "@/components/logo";
import { TopupModal } from "@/components/topup-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { GenjutsuDrawer } from "@/components/studio/genjutsu-drawer";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface ShowcaseItem {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  views: string;
  likes: string;
  tag: string;
}

export default function GenjutsuStudioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(60);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [topupOpen, setTopupOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"trending" | "newest" | "likyai">("trending");

  const showcaseItems: ShowcaseItem[] = [
    {
      id: "g1",
      title: "Runway Fashion Walk Motion",
      author: "@amina_ai",
      thumbnail: "/assets/studios/studio-cinema.jpg",
      views: "142K",
      likes: "12.4K",
      tag: "Fashion",
    },
    {
      id: "g2",
      title: "Afro Beats Street Dance 60fps",
      author: "@steph_studio",
      thumbnail: "/assets/studios/studio-ugc.jpg",
      views: "98K",
      likes: "8.1K",
      tag: "Dance",
    },
    {
      id: "g3",
      title: "Hyperreal Product Holding Motion",
      author: "@brand_agency",
      thumbnail: "/assets/studios/studio-ad-builder.jpg",
      views: "74K",
      likes: "5.9K",
      tag: "Commercial",
    },
    {
      id: "g4",
      title: "Anime Flight & Combat Move",
      author: "@kenji_art",
      thumbnail: "/assets/studios/studio-animation.jpg",
      views: "210K",
      likes: "19.3K",
      tag: "Action",
    },
  ];

  useEffect(() => {
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
            if (data?.credits !== undefined) setCredits(data.credits);
            setAuthLoading(false);
          });
      }
    });
  }, [router]);

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)] text-[var(--ink)]">
        <CoolIcon name="loading" size={24} className="animate-spin text-[#D8FF64]" duotone={false} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg)] text-[var(--ink)] overflow-x-hidden selection:bg-[#D8FF64] selection:text-black transition-colors duration-200">
      {/* ── TOP BAR : RETOUR AUX STUDIOS + LOGO + THEMETOGGLE + CRÉDITS ── */}
      <header className="fixed top-0 inset-x-0 h-14 sm:h-16 px-3 sm:px-6 z-30 flex items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => router.push("/studios")}
            className="flex items-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-[var(--field)] hover:bg-[var(--hover)] border border-[var(--line)] text-[12px] font-medium text-[var(--ink-2)] hover:text-[var(--ink)] transition-all cursor-pointer"
            title="Retour au Hub des studios"
          >
            <CoolIcon name="arrow-left-sm" size={14} duotone={false} className="shrink-0" />
            <span>Studios</span>
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

      {/* ── HERO GENJUTSU ── */}
      <main className="max-w-5xl mx-auto px-4 pt-24 sm:pt-28 pb-20">
        <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-3)]">
              likyAI
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-black tracking-tight text-[var(--ink)] mb-3">
            GENJUTSU
          </h1>

          <p className="text-[13px] sm:text-[14px] text-[var(--ink-2)] leading-relaxed mb-6">
            Transfer motion to your characters or swap objects while keeping the rest unchanged.{" "}
            <span className="text-[#D8FF64] dark:text-[#D8FF64] text-neutral-900 font-medium hover:underline cursor-pointer">Learn more</span>
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="px-6 py-2.5 rounded-full bg-[#D8FF64] hover:bg-[#cbf54a] text-black font-bold text-[13px] transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            >
              Start generating
            </button>

            <button
              type="button"
              onClick={() => router.push("/studio")}
              className="px-5 py-2.5 rounded-full bg-[var(--field)] hover:bg-[var(--hover)] border border-[var(--line)] text-[var(--ink)] font-medium text-[13px] transition-colors cursor-pointer"
            >
              My generations
            </button>
          </div>
        </div>

        {/* ── TABS COMMUNAUTÉ ── */}
        <div className="flex items-center justify-center gap-2 mb-8 border-b border-[var(--line)] pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("trending")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer",
              activeTab === "trending"
                ? "bg-[var(--ink)] text-[var(--bg)] font-semibold shadow-md"
                : "text-[var(--ink-2)] hover:text-[var(--ink)]"
            )}
          >
            <CoolIcon name="star" size={13} duotone={false} />
            <span>Community trending</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("newest")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer",
              activeTab === "newest"
                ? "bg-[var(--ink)] text-[var(--bg)] font-semibold shadow-md"
                : "text-[var(--ink-2)] hover:text-[var(--ink)]"
            )}
          >
            <span>Community newest</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("likyai")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer",
              activeTab === "likyai"
                ? "bg-[var(--ink)] text-[var(--bg)] font-semibold shadow-md"
                : "text-[var(--ink-2)] hover:text-[var(--ink)]"
            )}
          >
            <span className="font-semibold text-emerald-600 dark:text-[#D8FF64]">likyAI Official</span>
          </button>
        </div>

        {/* ── GRILLE DES VITRINES VIDÉOS GENJUTSU ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {showcaseItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setDrawerOpen(true)}
              className="group relative rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--line-strong)] transition-all cursor-pointer shadow-lg flex flex-col"
            >
              <div className="relative aspect-[9/16] w-full overflow-hidden bg-black/60">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
                
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-white">
                  {item.tag}
                </span>

                <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-[11px] text-white/80">
                  <span className="truncate font-medium">{item.author}</span>
                  <span className="font-mono text-[10px] bg-black/50 px-1.5 py-0.5 rounded">
                    {item.views}
                  </span>
                </div>
              </div>

              <div className="p-3">
                <h3 className="text-xs font-semibold text-[var(--ink)] group-hover:text-emerald-600 dark:group-hover:text-[#D8FF64] truncate">
                  {item.title}
                </h3>
                <span className="text-[10.5px] text-[var(--ink-3)] block mt-0.5">
                  Cliquez pour réutiliser le mouvement
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── TIROIR GENJUTSU BRANCHÉ ── */}
      <GenjutsuDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onGenerateMotion={() => {
          router.push("/studio");
        }}
      />

      {/* ── TOPUP MODAL ── */}
      <TopupModal
        isOpen={topupOpen}
        onClose={() => setTopupOpen(false)}
        onSuccess={(addedCredits, newTotal) => {
          if (typeof newTotal === "number") setCredits(newTotal);
          else setCredits((p) => p + addedCredits);
        }}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CoolIcon } from "@/components/icons/coolicon";
import { LogoIcon } from "@/components/logo";
import { TopupModal } from "@/components/topup-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { InfluencerBuilderDrawer } from "@/components/studio/influencer-builder-drawer";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

export default function AiInfluencerStudioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(60);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [topupOpen, setTopupOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

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

      {/* ── HERO BANNER & SHOWCASE ── */}
      <main className="max-w-4xl mx-auto px-4 pt-24 sm:pt-28 pb-20 text-center">
        <div className="relative w-full h-40 sm:h-48 rounded-3xl overflow-hidden bg-gradient-to-r from-[#1c1c1a] via-[#2a2a26] to-[#1c1c1a] border border-white/10 flex items-center justify-between px-6 sm:px-12 shadow-2xl mb-8">
          <div className="w-24 h-36 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-end justify-center shadow-lg transform -rotate-3">
            <div className="w-20 h-32 bg-gradient-to-t from-[#D8FF64]/20 to-transparent flex items-center justify-center">
              <CoolIcon name="user-01" size={48} duotone secondaryColor="#D8FF64" className="text-white/80" />
            </div>
          </div>

          <div className="text-center px-4">
            <span className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-[#D8FF64] drop-shadow-[0_0_20px_rgba(216,255,100,0.35)] block">
              AI INFLUENCER
            </span>
            <p className="text-[12px] sm:text-[13px] text-white/70 max-w-sm mx-auto mt-2 leading-relaxed">
              Créez des ambassadeurs virtuels cohérents. Modifiez traits, style et postures réutilisables dans tous vos studios.
            </p>
          </div>

          <div className="w-24 h-36 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-end justify-center shadow-lg transform rotate-3">
            <div className="w-20 h-32 bg-gradient-to-t from-emerald-500/20 to-transparent flex items-center justify-center">
              <CoolIcon name="user-01" size={48} duotone secondaryColor="#34D399" className="text-white/80" />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="px-8 py-3 rounded-full bg-[#D8FF64] hover:bg-[#cbf54a] text-black font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          Ouvrir le créateur d&apos;influenceur
        </button>
      </main>

      {/* ── TIROIR INFLUENCER BUILDER BRANCHÉ ── */}
      <InfluencerBuilderDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCharacterCreated={(char) => {
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

"use client";

import React from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { cn } from "@/lib/utils";
import type { LibraryCardItem } from "./library-modal";

interface SectionShowcaseProps {
  mode: "image" | "video" | "music" | "voice";
  cards: LibraryCardItem[];
  allModeCardsCount: number;
  onOpenCard: (card: LibraryCardItem) => void;
  onRetryCard: (card: LibraryCardItem) => void;
  onEditCard: (card: LibraryCardItem) => void;
  onAnimateCard?: (card: LibraryCardItem) => void;
  onOpenLibrary: () => void;
  onSelectSamplePrompt?: (prompt: string) => void;
}

export function SectionShowcase({
  cards,
  onOpenCard,
  onAnimateCard,
  onRetryCard,
}: SectionShowcaseProps) {
  if (cards.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pt-4 pb-28">
      {/* Grille ultra-minimaliste 2 colonnes (mobile) à 3/4 colonnes (desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((c) => {
          const isAudio = c.mode === "music" || c.mode === "voice";
          const isVideo = c.mode === "video";
          const fallbackImg = `/assets/organic/organic-${((c.orgIndex || 0) % 4) + 1}.webp`;
          const mediaUrl = c.mediaUrl || fallbackImg;

          return (
            <div
              key={c.id}
              onClick={() => {
                if (c.status === "ready") onOpenCard(c);
              }}
              className={cn(
                "group relative rounded-2xl overflow-hidden bg-[#181817] border border-white/5 transition-all duration-200 aspect-[9/14] flex flex-col justify-between",
                c.status === "ready"
                  ? "hover:border-white/20 hover:scale-[1.01] cursor-pointer shadow-lg"
                  : "cursor-default"
              )}
            >
              {c.status !== "ready" ? (
                /* État de génération épuré */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center bg-black/60">
                  <CoolIcon name="loading" size={20} className="animate-spin text-[#D8FF64]" duotone={false} />
                  <span className="text-[11px] font-medium text-white/70">
                    Génération…
                  </span>
                </div>
              ) : (
                /* Média pleine surface (Image, Vidéo, Audio) sans badges ni textes techniques */
                <>
                  {c.mode === "image" ? (
                    <img
                      src={mediaUrl}
                      alt={c.caption || "Création"}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : isVideo ? (
                    <div className="relative w-full h-full bg-black flex items-center justify-center">
                      <img
                        src={mediaUrl}
                        alt={c.caption || "Vidéo"}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-103 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                          <CoolIcon name="play" duotone size={16} secondaryColor="currentColor" />
                        </div>
                      </div>
                    </div>
                  ) : isAudio ? (
                    <div className="w-full h-full flex flex-col justify-between p-4 bg-gradient-to-b from-[#1C1C1A] to-[#121211]">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#D8FF64]">
                        <CoolIcon name={c.mode === "music" ? "headphones" : "user-voice"} size={16} duotone />
                      </div>
                      <div className="flex items-end gap-1 h-12">
                        {[40, 70, 45, 90, 60, 80, 50, 75, 95, 60].map((h, i) => (
                          <span
                            key={i}
                            className="flex-1 rounded-full bg-[#D8FF64]/80"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Actions discrètes au survol */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {c.mode === "image" && onAnimateCard && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAnimateCard(c);
                          }}
                          className="w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center border border-white/10 transition-colors"
                          title="Animer en vidéo"
                        >
                          <CoolIcon name="camera" size={13} duotone />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetryCard(c);
                        }}
                        className="w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center border border-white/10 transition-colors"
                        title="Rejouer"
                      >
                        <CoolIcon name="redo" size={13} duotone={false} />
                      </button>
                    </div>

                    <div className="p-1 rounded-xl bg-black/60 backdrop-blur-xs border border-white/10">
                      <p className="text-[10.5px] text-white/90 line-clamp-2 leading-tight">
                        {c.fullPrompt}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  onOpenLibrary: () => void;
  onSelectSamplePrompt: (prompt: string) => void;
}

const SECTION_META = {
  image: {
    title: "Images",
    label: "Créations récentes · Images",
    icon: "image-01" as const,
    emptyTitle: "Aucune image générée pour l'instant",
    emptyDesc: "Décrivez ce que vous imaginez ou inspirez-vous de ces suggestions :",
    samples: [
      "Flacon de parfum en verre minimaliste, ombre portée douce et marbre noir",
      "Portrait cyberpunk futuriste sous la pluie néon à Douala, 8k",
      "Café design contemporain baigné de lumière dorée du matin",
    ],
  },
  video: {
    title: "Vidéos",
    label: "Créations récentes · Vidéos",
    icon: "camera" as const,
    emptyTitle: "Aucune vidéo générée pour l'instant",
    emptyDesc: "Créez une vidéo cinématique, un avis client UGC ou une publicité :",
    samples: [
      "Avis client filmé en lumière naturelle présentant une crème de karité bio",
      "Vue drone cinématographique au coucher du soleil sur les vagues de l'océan",
      "Démo dynamique d'une application mobile moderne, transitions fluides",
    ],
  },
  music: {
    title: "Musique",
    label: "Créations récentes · Musique",
    icon: "headphones" as const,
    emptyTitle: "Aucun morceau de musique généré",
    emptyDesc: "Composez une mélodie instrumentale ou un titre complet avec Suno :",
    samples: [
      "Afrobeat chaleureux et dansant avec guitare acoustique et basse profonde",
      "Piano solo mélancolique et méditatif, ambiance feutrée de nuit",
      "Lo-Fi hip hop chill pour étudier, sonorités douces et pluie en fond",
    ],
  },
  voice: {
    title: "Voix off",
    label: "Créations récentes · Voix off",
    icon: "user-voice" as const,
    emptyTitle: "Aucune voix off générée",
    emptyDesc: "Donnez une voix humaine et engageante à vos textes et vidéos :",
    samples: [
      "Bienvenue sur LikyAI, votre studio de création créative propulsé par l'intelligence artificielle.",
      "Découvrez notre nouvelle collection inspirée de la nature africaine et du savoir-faire artisanal.",
      "En quelques clics, transformez vos idées en images, vidéos et musique haute fidélité.",
    ],
  },
};

export function SectionShowcase({
  mode,
  cards,
  allModeCardsCount,
  onOpenCard,
  onRetryCard,
  onEditCard,
  onOpenLibrary,
  onSelectSamplePrompt,
}: SectionShowcaseProps) {
  const meta = SECTION_META[mode];

  // Les 4 dernières générations de la section (le début du tableau est le plus récent)
  const lastFour = cards.slice(0, 4);

  return (
    <div className="w-full max-w-4xl mx-auto px-3.5 sm:px-4 pt-[118px] sm:pt-24 pb-[320px] sm:pb-40 sm:min-h-[calc(100dvh-120px)] sm:flex sm:flex-col sm:justify-center transition-all duration-300">
      {/* Barre supérieure compacte de section : Titre & indicateur d'ordre */}
      <div className="flex items-center justify-between gap-2.5 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-[var(--surf)] border border-[var(--line)] shadow-sm flex items-center justify-center text-[var(--ink)] shrink-0">
            <CoolIcon
              name={meta.icon}
              duotone
              size={17}
              secondaryColor="var(--lime)"
              secondaryOpacity={0.45}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[14px] font-semibold tracking-tight text-[var(--ink)]">
                {meta.label}
              </h1>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-[var(--surf)] border border-[var(--line)] text-[var(--mute)]">
                {lastFour.length}/4
              </span>
            </div>
            <p className="text-[11px] text-[var(--mute)]">
              4 dernières créations générées
            </p>
          </div>
        </div>
      </div>

      {/* Grille des 4 cartes compactes (ou état vide si 0) */}
      {lastFour.length === 0 ? (
        <div className="w-full bg-[var(--surf)]/70 backdrop-blur-md border border-[var(--line)] rounded-[18px] p-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-[14px] bg-[var(--mn)] border border-[var(--line)] flex items-center justify-center mx-auto mb-3 text-[var(--ink)] shadow-sm">
            <CoolIcon
              name={meta.icon}
              duotone
              size={24}
              secondaryColor="var(--lime)"
              secondaryOpacity={0.45}
            />
          </div>
          <h2 className="text-[14px] font-semibold text-[var(--ink)] mb-1">
            {meta.emptyTitle}
          </h2>
          <p className="text-[11.5px] text-[var(--mute)] max-w-sm mx-auto mb-4">
            {meta.emptyDesc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xl mx-auto">
            {meta.samples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSamplePrompt(sample)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--ink)] text-[11px] text-left text-[var(--ink)]/90 hover:text-[var(--ink)] transition-all cursor-pointer shadow-xs"
              >
                <CoolIcon
                  name="edit-pencil-01"
                  size={10}
                  duotone
                  secondaryColor="var(--lime)"
                  className="shrink-0 text-[var(--mute)] group-hover:text-[var(--ink)]"
                />
                <span className="line-clamp-1">{sample}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {lastFour.map((c, index) => {
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
                  "group relative flex flex-col bg-[var(--surf)] border border-[var(--line)] rounded-[16px] overflow-hidden shadow-card transition-all duration-200",
                  c.status === "ready"
                    ? "hover:border-[var(--ink)]/40 hover:-translate-y-0.5 hover:shadow-overlay cursor-pointer"
                    : "cursor-default"
                )}
              >
                {/* Badge d'ordre compact (1 à 4) */}
                <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white text-[9.5px] font-medium leading-none">
                  <span className="font-mono text-[var(--lime)] font-semibold">#{index + 1}</span>
                  <span className="opacity-60">·</span>
                  <span className="capitalize">{c.mode}</span>
                </div>

                {/* Zone de contenu média compacte (hauteur maîtrisée) */}
                <div className="relative w-full h-[105px] sm:h-[115px] bg-[var(--mn)] overflow-hidden">
                  {c.status !== "ready" ? (
                    /* État de chargement compact */
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2 text-center select-none bg-gradient-to-br from-[var(--surf)] via-[var(--mn)] to-[var(--bg)]">
                      {/* Pixel grid loader miniature */}
                      <div className="grid grid-cols-3 gap-0.5 shrink-0">
                        {Array.from({ length: 9 }).map((_, idx) => (
                          <span
                            key={idx}
                            className="w-1.5 h-1.5 rounded-[1px] bg-[var(--ink)]"
                            style={{
                              animation: `pixel-on 650ms ease-in-out ${(idx % 3 + Math.floor(idx / 3)) * 90}ms infinite`,
                              opacity: 0.25,
                            }}
                          />
                        ))}
                      </div>

                      <span className="font-medium text-[11px] text-[var(--ink)] line-clamp-1">
                        {c.status === "thinking" ? "Analyse…" : "Synthèse…"}
                      </span>

                      <span className="font-mono text-[10px] text-[var(--mute)] tabular-nums px-1.5 py-0.2 rounded-full bg-[var(--bg)] border border-[var(--line)] leading-none">
                        {String(Math.floor(c.elapsed / 60)).padStart(2, "0")}:
                        {String(c.elapsed % 60).padStart(2, "0")}
                      </span>
                    </div>
                  ) : (
                    /* Rendu média final compact */
                    <>
                      {c.mode === "image" ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={mediaUrl}
                          alt={c.caption}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : isVideo ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mediaUrl}
                            alt={c.caption}
                            className="w-full h-full object-cover opacity-85"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                            <div className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110">
                              <CoolIcon name="play" duotone size={13} secondaryColor="var(--lime)" />
                            </div>
                          </div>
                        </div>
                      ) : isAudio ? (
                        <div
                          className="w-full h-full flex flex-col justify-between p-2.5"
                          style={{
                            background: c.hues
                              ? `linear-gradient(135deg, hsl(${c.hues[0]} 40% 18%), hsl(${c.hues[1]} 50% 12%))`
                              : "linear-gradient(135deg, #1f1f23, #121214)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] font-medium px-1.5 py-0.2 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10 leading-none">
                              {c.mode === "music" ? "Musique" : "Voix"}
                            </span>
                            <CoolIcon
                              name={c.mode === "music" ? "headphones" : "user-voice"}
                              duotone
                              size={13}
                              secondaryColor="var(--lime)"
                            />
                          </div>

                          <div className="flex items-end gap-0.5 h-8 px-0.5">
                            {(c.waveforms || [25, 55, 40, 75, 45, 70, 35, 60, 85, 40, 55, 65, 30, 75]).map(
                              (h, wi) => (
                                <span
                                  key={wi}
                                  className="flex-1 rounded-full bg-[var(--lime)] opacity-85"
                                  style={{ height: `${h}%` }}
                                />
                              )
                            )}
                          </div>
                        </div>
                      ) : null}

                      {/* Actions rapides au survol (Haut Droite) */}
                      <div
                        className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-black/70 backdrop-blur-md p-0.5 rounded-lg border border-white/15 z-20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetryCard(c);
                          }}
                          className="p-1 hover:bg-white/20 rounded-md text-white transition-colors cursor-pointer"
                          title="Réessayer"
                        >
                          <CoolIcon name="redo" duotone size={11} secondaryColor="var(--lime)" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const a = document.createElement("a");
                            a.href = mediaUrl;
                            a.download = `likyai-${c.mode}-${Date.now()}.${isAudio ? "mp3" : isVideo ? "mp4" : "png"}`;
                            a.target = "_blank";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          className="p-1 hover:bg-white/20 rounded-md text-white transition-colors cursor-pointer"
                          title="Télécharger"
                        >
                          <CoolIcon name="download" duotone size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditCard(c);
                          }}
                          className="p-1 hover:bg-white/20 rounded-md text-white transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <CoolIcon name="edit-pencil-01" duotone size={11} secondaryColor="var(--lime)" />
                        </button>
                      </div>

                      {/* Badge "Aperçu" au centre au survol */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                        <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-medium flex items-center gap-1 shadow-md">
                          <CoolIcon name="expand" duotone size={10} secondaryColor="var(--lime)" />
                          <span>Aperçu</span>
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Pied de carte compact avec description et modèle */}
                <div className="p-2 sm:p-2.5 flex flex-col justify-between bg-[var(--surf)] border-t border-[var(--line)]">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10.5px] font-semibold text-[var(--ink)] truncate max-w-[100px]">
                        {c.modelName}
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[var(--mn)] text-[var(--mute)] leading-none">
                        {c.creditsCost} cr
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--ink)]/80 line-clamp-1 leading-snug">
                      {c.fullPrompt}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Emplacements restants vides compacts (si < 4) */}
          {Array.from({ length: Math.max(0, 4 - lastFour.length) }).map((_, placeholderIdx) => (
            <div
              key={`empty-slot-${placeholderIdx}`}
              className="relative hidden sm:flex flex-col items-center justify-center p-3 border border-dashed border-[var(--line)] rounded-[16px] bg-[var(--bg)]/30 text-center select-none h-full min-h-[145px]"
            >
              <div className="w-7 h-7 rounded-full bg-[var(--mn)]/70 border border-[var(--line)] flex items-center justify-center text-[var(--mute)] mb-1.5">
                <CoolIcon name="add-plus" size={13} />
              </div>
              <span className="text-[11px] font-medium text-[var(--mute)]">
                Emplacement #{lastFour.length + placeholderIdx + 1}
              </span>
              <p className="text-[9.5px] text-[var(--mute)]/70 max-w-[100px] mt-0.5">
                Prêt pour votre création
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

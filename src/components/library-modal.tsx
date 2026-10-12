"use client";

import React, { useState, useMemo } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { cn } from "@/lib/utils";

export interface LibraryCardItem {
  id: string;
  mode: "image" | "video" | "music" | "voice";
  caption: string;
  fullPrompt: string;
  modelName: string;
  mediaUrl?: string;
  creditsCost: number;
  status: "thinking" | "generating" | "ready";
  elapsed: number;
  params?: Record<string, string>;
  createdAt?: number;
  orgIndex?: number;
  hues?: number[];
  waveforms?: number[];
}

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LibraryCardItem[];
  onSelectItem: (item: LibraryCardItem) => void;
  onRetryItem: (item: LibraryCardItem) => void;
  onEditItem: (item: LibraryCardItem) => void;
  onDeleteItem?: (id: string) => void;
}

type FilterCategory = "all" | "image" | "video" | "music" | "voice";

export function LibraryModal({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onRetryItem,
  onEditItem,
  onDeleteItem,
}: LibraryModalProps) {
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = filter === "all" || item.mode === filter;
      const matchesSearch =
        !searchQuery.trim() ||
        item.fullPrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caption.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, filter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: items.length,
      image: items.filter((i) => i.mode === "image").length,
      video: items.filter((i) => i.mode === "video").length,
      music: items.filter((i) => i.mode === "music").length,
      voice: items.filter((i) => i.mode === "voice").length,
    };
  }, [items]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/55 backdrop-blur-md animate-in fade-in-0 duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-5xl h-[90vh] sm:h-[88vh] max-h-[820px] flex flex-col bg-[var(--surf)] border border-[var(--line)] rounded-[20px] sm:rounded-[24px] shadow-overlay overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la bibliothèque */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-5 border-b border-[var(--line)] shrink-0 bg-[var(--surf)]/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[14px] bg-[var(--mn)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] shadow-sm shrink-0">
              <CoolIcon
                name="folders"
                duotone
                size={20}
                secondaryColor="currentColor"
                secondaryOpacity={0.4}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[16px] sm:text-[18px] font-semibold tracking-tight text-[var(--ink)]">
                  Bibliothèque de créations
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-mono font-medium bg-[var(--mn)] border border-[var(--line)] text-[var(--mute)]">
                  {items.length} {items.length > 1 ? "fichiers" : "fichier"}
                </span>
              </div>
              <p className="text-[11.5px] sm:text-[12.5px] text-[var(--mute)] truncate">
                Retrouvez, téléchargez ou modifiez l&apos;ensemble de vos générations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--mn)] hover:bg-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Fermer la bibliothèque"
          >
            <CoolIcon name="close-md" size={15} />
          </button>
        </div>

        {/* Barre d'outils : Filtres par catégorie et Recherche */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-b border-[var(--line)] bg-[var(--bg)]/50 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Onglets Filtres */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer whitespace-nowrap",
                filter === "all"
                  ? "bg-[var(--ink)] text-[var(--bg)] shadow-sm"
                  : "bg-[var(--surf)] border border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)] hover:border-[var(--ink)]/40"
              )}
            >
              <CoolIcon name="more-grid-big" size={13} duotone={filter !== "all"} />
              <span>Tout</span>
              <span
                className={cn(
                  "ml-0.5 text-[10.5px] font-mono px-1.5 py-0.2 rounded-full",
                  filter === "all" ? "bg-white/20 text-white" : "bg-[var(--mn)] text-[var(--mute)]"
                )}
              >
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("image")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer whitespace-nowrap",
                filter === "image"
                  ? "bg-[var(--ink)] text-[var(--bg)] shadow-sm"
                  : "bg-[var(--surf)] border border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)] hover:border-[var(--ink)]/40"
              )}
            >
              <CoolIcon
                name="image-01"
                size={14}
                duotone
                secondaryColor="currentColor"
              />
              <span>Images</span>
              <span
                className={cn(
                  "ml-0.5 text-[10.5px] font-mono px-1.5 py-0.2 rounded-full",
                  filter === "image" ? "bg-white/20 text-white" : "bg-[var(--mn)] text-[var(--mute)]"
                )}
              >
                {counts.image}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("video")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer whitespace-nowrap",
                filter === "video"
                  ? "bg-[var(--ink)] text-[var(--bg)] shadow-sm"
                  : "bg-[var(--surf)] border border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)] hover:border-[var(--ink)]/40"
              )}
            >
              <CoolIcon
                name="camera"
                size={14}
                duotone
                secondaryColor="currentColor"
              />
              <span>Vidéos</span>
              <span
                className={cn(
                  "ml-0.5 text-[10.5px] font-mono px-1.5 py-0.2 rounded-full",
                  filter === "video" ? "bg-white/20 text-white" : "bg-[var(--mn)] text-[var(--mute)]"
                )}
              >
                {counts.video}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("music")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer whitespace-nowrap",
                filter === "music"
                  ? "bg-[var(--ink)] text-[var(--bg)] shadow-sm"
                  : "bg-[var(--surf)] border border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)] hover:border-[var(--ink)]/40"
              )}
            >
              <CoolIcon
                name="headphones"
                size={14}
                duotone
                secondaryColor="currentColor"
              />
              <span>Musique</span>
              <span
                className={cn(
                  "ml-0.5 text-[10.5px] font-mono px-1.5 py-0.2 rounded-full",
                  filter === "music" ? "bg-white/20 text-white" : "bg-[var(--mn)] text-[var(--mute)]"
                )}
              >
                {counts.music}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("voice")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer whitespace-nowrap",
                filter === "voice"
                  ? "bg-[var(--ink)] text-[var(--bg)] shadow-sm"
                  : "bg-[var(--surf)] border border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)] hover:border-[var(--ink)]/40"
              )}
            >
              <CoolIcon
                name="user-voice"
                size={14}
                duotone
                secondaryColor="currentColor"
              />
              <span>Voix off</span>
              <span
                className={cn(
                  "ml-0.5 text-[10.5px] font-mono px-1.5 py-0.2 rounded-full",
                  filter === "voice" ? "bg-white/20 text-white" : "bg-[var(--mn)] text-[var(--mute)]"
                )}
              >
                {counts.voice}
              </span>
            </button>
          </div>

          {/* Recherche */}
          <div className="relative w-full sm:w-64 shrink-0">
            <CoolIcon
              name="file-search"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mute)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par prompt ou modèle…"
              className="w-full pl-9 pr-3 py-1.5 text-[12.5px] rounded-full bg-[var(--surf)] border border-[var(--line)] text-[var(--ink)] placeholder:text-[var(--mute)] focus:outline-none focus:border-[var(--ink)] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--mute)] hover:text-[var(--ink)] p-0.5"
              >
                <CoolIcon name="close-md" size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Grille des cartes de la bibliothèque */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-[20px] bg-[var(--mn)] border border-[var(--line)] flex items-center justify-center text-[var(--mute)] mb-4">
                <CoolIcon name="folder" duotone size={32} secondaryColor="currentColor" secondaryOpacity={0.4} />
              </div>
              <h3 className="text-[15px] font-semibold text-[var(--ink)] mb-1">
                Aucune création trouvée
              </h3>
              <p className="text-[13px] text-[var(--mute)] max-w-sm mb-4">
                {searchQuery
                  ? `Aucun résultat ne correspond à "${searchQuery}". Essayez un autre mot-clé.`
                  : "Vous n'avez pas encore généré d'élément dans cette catégorie."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-1.5 text-[12.5px] font-medium rounded-full bg-[var(--mn)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--ink)] transition-colors cursor-pointer"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const isAudio = item.mode === "music" || item.mode === "voice";
                const isVideo = item.mode === "video";
                const fallbackImg = `/assets/organic/organic-${((item.orgIndex || 0) % 4) + 1}.webp`;
                const mediaUrl = item.mediaUrl || fallbackImg;

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="group relative flex flex-col bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--ink)]/40 rounded-[18px] overflow-hidden shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-overlay cursor-pointer"
                  >
                    {/* Zone de prévisualisation média */}
                    <div className="relative w-full aspect-[4/3] bg-[var(--mn)] overflow-hidden">
                      {item.mode === "image" ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={mediaUrl}
                          alt={item.caption}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : isVideo ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mediaUrl}
                            alt={item.caption}
                            className="w-full h-full object-cover opacity-80"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                            <div className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110">
                              <CoolIcon name="play" duotone size={16} secondaryColor="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Audio / Voix off */
                        <div
                          className="w-full h-full flex flex-col justify-between p-4"
                          style={{
                            background: item.hues
                              ? `linear-gradient(135deg, hsl(${item.hues[0]} 40% 18%), hsl(${item.hues[1]} 50% 12%))`
                              : "linear-gradient(135deg, #1f1f23, #121214)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10">
                              {item.mode === "music" ? "Musique" : "Voix off"}
                            </span>
                            <CoolIcon
                              name={item.mode === "music" ? "headphones" : "user-voice"}
                              duotone
                              size={15}
                              secondaryColor="currentColor"
                            />
                          </div>
                          {/* Mini waveforms */}
                          <div className="flex items-end gap-1 h-10 px-1">
                            {(item.waveforms || [30, 60, 45, 80, 50, 75, 40, 65, 90, 45, 60, 70, 35, 80]).map(
                              (h, idx) => (
                                <span
                                  key={idx}
                                  className="flex-1 rounded-full bg-emerald-500 opacity-85"
                                  style={{ height: `${h}%` }}
                                />
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Badge du type d'outil (Haut Gauche) */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-[10.5px] font-medium">
                        <CoolIcon
                          name={
                            item.mode === "image"
                              ? "image-01"
                              : item.mode === "video"
                              ? "camera"
                              : item.mode === "music"
                              ? "headphones"
                              : "user-voice"
                          }
                          duotone
                          size={11}
                          secondaryColor="currentColor"
                        />
                        <span className="capitalize">{item.mode}</span>
                      </div>

                      {/* Actions rapides au survol (Haut Droite) */}
                      <div
                        className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-black/65 backdrop-blur-md p-1 rounded-xl border border-white/15"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetryItem(item);
                          }}
                          className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
                          title="Réessayer"
                        >
                          <CoolIcon name="redo" duotone size={13} secondaryColor="currentColor" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const a = document.createElement("a");
                            a.href = mediaUrl;
                            a.download = `likyai-${item.mode}-${Date.now()}.${isAudio ? "mp3" : isVideo ? "mp4" : "png"}`;
                            a.target = "_blank";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
                          title="Télécharger"
                        >
                          <CoolIcon name="download" duotone size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditItem(item);
                          }}
                          className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <CoolIcon name="edit-pencil-01" duotone size={13} secondaryColor="currentColor" />
                        </button>
                        {onDeleteItem && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteItem(item.id);
                            }}
                            className="p-1 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <CoolIcon name="trash-empty" duotone size={13} />
                          </button>
                        )}
                      </div>

                      {/* Bouton Voir l'aperçu au centre au survol */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium flex items-center gap-1.5 shadow-md">
                          <CoolIcon name="expand" duotone size={12} secondaryColor="currentColor" />
                          <span>Ouvrir l&apos;aperçu</span>
                        </span>
                      </div>
                    </div>

                    {/* Informations carte */}
                    <div className="p-3.5 flex flex-col justify-between flex-1 bg-[var(--surf)]">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[11px] font-semibold text-[var(--ink)] truncate max-w-[140px]">
                            {item.modelName}
                          </span>
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-[var(--mn)] text-[var(--mute)]">
                            {item.creditsCost} cr
                          </span>
                        </div>
                        <p className="text-[12px] text-[var(--ink)]/85 line-clamp-2 leading-snug">
                          {item.fullPrompt}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[var(--line)] flex items-center justify-between text-[11px] text-[var(--mute)]">
                        <span className="truncate max-w-[140px]">
                          {item.params?.format || item.params?.Format || item.params?.qual || "Standard"}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[10.5px] group-hover:underline">
                          Détails →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pied de la modale */}
        <div className="px-6 py-3.5 border-t border-[var(--line)] bg-[var(--surf)]/90 flex items-center justify-between text-[12px] text-[var(--mute)] shrink-0">
          <span>
            Affichage de <b className="text-[var(--ink)]">{filteredItems.length}</b> sur{" "}
            <b className="text-[var(--ink)]">{items.length}</b> créations
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[var(--mn)] hover:bg-[var(--line)] text-[var(--ink)] font-medium transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

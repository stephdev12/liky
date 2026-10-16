"use client";

import React, { useRef, useState, useEffect } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { cn } from "@/lib/utils";
import type { AssetItem } from "./assets-modal";

interface UnifiedPromptBubbleProps {
  prompt: string;
  setPrompt: (p: string) => void;
  selectedModelName: string;
  onOpenModelSelector: () => void;
  aspectRatio: string;
  setAspectRatio: (r: string) => void;
  onOpenAssets: () => void;
  selectedAssets: AssetItem[];
  onRemoveAsset: (id: string) => void;
  onOpenInfluencerBuilder: () => void;
  isGenerating: boolean;
  onGenerate: () => void;
  creditsCost?: number;
}

const RATIOS = [
  { id: "9:16", label: "9:16 Vertical", desc: "TikTok, Reels, Shorts" },
  { id: "16:9", label: "16:9 Paysage", desc: "YouTube, Cinéma, Écrans" },
  { id: "1:1", label: "1:1 Carré", desc: "Feed Instagram, Profil" },
  { id: "4:5", label: "4:5 Portrait", desc: "Optimisé mobile Instagram" },
  { id: "3:4", label: "3:4 Portrait standard", desc: "Photographie classique" },
  { id: "2:3", label: "2:3 Photo reflex", desc: "Standard shooting photo" },
  { id: "21:9", label: "21:9 Cinémascope", desc: "Bandeau ultra-large" },
];

export function UnifiedPromptBubble({
  prompt,
  setPrompt,
  selectedModelName,
  onOpenModelSelector,
  aspectRatio,
  setAspectRatio,
  onOpenAssets,
  selectedAssets,
  onRemoveAsset,
  onOpenInfluencerBuilder,
  isGenerating,
  onGenerate,
  creditsCost = 16,
}: UnifiedPromptBubbleProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [ratioDropdownOpen, setRatioDropdownOpen] = useState(false);

  // Détection du token @ pour le popover de mention
  const [atQuery, setAtQuery] = useState<string | null>(null);
  const [atPopoverOpen, setAtPopoverOpen] = useState(false);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPrompt(text);

    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;

    const cursor = e.target.selectionStart;
    const beforeCursor = text.slice(0, cursor);
    const match = /(?:^|\s)@([a-zA-Z0-9_-]*)$/.exec(beforeCursor);

    if (match) {
      setAtQuery(match[1].toLowerCase());
      setAtPopoverOpen(true);
    } else {
      setAtPopoverOpen(false);
      setAtQuery(null);
    }
  };

  const handleSelectMention = (asset: AssetItem) => {
    if (!textareaRef.current) return;
    const text = prompt;
    const cursor = textareaRef.current.selectionStart || text.length;
    const beforeCursor = text.slice(0, cursor);
    const afterCursor = text.slice(cursor);

    const replacedBefore = beforeCursor.replace(/(?:^|\s)@([a-zA-Z0-9_-]*)$/, ` @${asset.name} `);
    const newText = `${replacedBefore}${afterCursor}`;

    setPrompt(newText);
    setAtPopoverOpen(false);
    setAtQuery(null);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!isGenerating && prompt.trim()) {
        onGenerate();
      }
    }
    if (e.key === "Escape") {
      setAtPopoverOpen(false);
      setRatioDropdownOpen(false);
    }
  };

  const filteredAssets = atQuery
    ? selectedAssets.filter((a) => a.name.toLowerCase().includes(atQuery))
    : selectedAssets;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* ── POPOVER DE MENTION @ FLOTTANTE ── */}
      {atPopoverOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setAtPopoverOpen(false)}
          />
          <div className="absolute left-2 bottom-full mb-3 w-80 p-3 rounded-[20px] bg-[var(--surface)] border border-[var(--line)] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--line)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--mute)]">
                Mentionner un élément (@)
              </span>
              <button
                type="button"
                onClick={onOpenInfluencerBuilder}
                className="text-[11px] font-medium text-[#D8FF64] hover:underline flex items-center gap-1 cursor-pointer"
              >
                + Créer
              </button>
            </div>

            {filteredAssets.length === 0 ? (
              <div className="py-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--field)] flex items-center justify-center mx-auto text-[var(--mute)]">
                  <CoolIcon name="layers" size={20} duotone />
                </div>
                <p className="text-[12px] text-[var(--mute)]">Vos éléments apparaîtront ici</p>
                <button
                  type="button"
                  onClick={() => {
                    setAtPopoverOpen(false);
                    onOpenAssets();
                  }}
                  className="px-3 py-1.5 rounded-full bg-[var(--hover)] hover:bg-[var(--hover-2)] text-[var(--ink)] text-[11.5px] font-medium transition-colors cursor-pointer"
                >
                  + Ajouter des assets
                </button>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => handleSelectMention(asset)}
                    className="w-full flex items-center gap-2.5 p-1.5 rounded-xl text-left hover:bg-[var(--hover)] transition-colors group cursor-pointer"
                  >
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-8 h-8 rounded-lg object-cover bg-black/40 border border-[var(--line)] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[12.5px] font-medium text-[var(--ink)] group-hover:text-[#D8FF64] block truncate">
                        @{asset.name}
                      </span>
                      <span className="text-[10px] text-[var(--mute)]">Cliquez pour insérer</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── CADRE PRINCIPAL DE LA PROMPT BUBBLE (SANS overflow-hidden pour ne jamais couper les tiroirs) ── */}
      <div className="relative w-full rounded-[24px] bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--line)] hover:border-[var(--line-strong)] focus-within:border-[var(--ink)]/40 focus-within:ring-1 focus-within:ring-[var(--ink)]/20 shadow-2xl transition-all duration-200">
        {/* Badges d'assets sélectionnés en référence */}
        {selectedAssets.length > 0 && (
          <div className="flex items-center gap-1.5 px-3.5 pt-2.5 pb-1 overflow-x-auto scrollbar-none border-b border-[var(--line)] rounded-t-[24px]">
            <span className="text-[10.5px] font-mono text-[var(--mute)] shrink-0">Références:</span>
            {selectedAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-[var(--field)] border border-[var(--line)] text-[11px] text-[var(--ink)] shrink-0"
              >
                <img src={asset.url} alt="" className="w-4 h-4 rounded-full object-cover" />
                <span>@{asset.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveAsset(asset.id)}
                  className="text-[var(--mute)] hover:text-[var(--ink)] ml-0.5"
                >
                  <CoolIcon name="close-sm" size={12} duotone={false} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Zone de saisie du texte */}
        <div className="p-3">
          <textarea
            ref={textareaRef}
            rows={2}
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            placeholder="Décrivez votre idée créative, ou tapez @ pour vos éléments..."
            className="w-full bg-transparent border-0 resize-none outline-none text-[14px] leading-relaxed text-[var(--ink)] placeholder:text-[var(--mute)] min-h-[44px] max-h-[120px] px-1"
          />

          {/* Barre d'outils inférieure intégrée */}
          <div className="flex items-center justify-between pt-2 mt-1">
            <div className="flex items-center gap-1.5">
              {/* Bouton [+] Ouvre Assets */}
              <button
                type="button"
                onClick={onOpenAssets}
                className="w-8 h-8 rounded-full bg-[var(--field)] hover:bg-[var(--hover)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] transition-all cursor-pointer"
                title="Ajouter des images, vidéos ou personnages (+)"
              >
                <CoolIcon name="add-plus" size={15} duotone={false} />
              </button>

              {/* Bouton Modèle (ex: [✨ Auto ▾]) */}
              <button
                type="button"
                onClick={onOpenModelSelector}
                className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-[var(--field)] hover:bg-[var(--hover)] border border-[var(--line)] text-[12px] font-medium text-[var(--ink)] transition-all cursor-pointer"
              >
                <CoolIcon name="star" size={13} duotone secondaryColor="#D8FF64" className="text-[#D8FF64]" />
                <span className="truncate max-w-[110px]">{selectedModelName}</span>
                <CoolIcon name="chevron-down" size={11} duotone={false} className="text-[var(--mute)]" />
              </button>

              {/* Bouton Ratio (ex: [▯ 9:16 ▾]) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRatioDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-[var(--field)] hover:bg-[var(--hover)] border border-[var(--line)] text-[11.5px] font-mono text-[var(--ink)] transition-all cursor-pointer"
                >
                  <span className="font-sans text-[11px] opacity-60">▯</span>
                  <span>{aspectRatio}</span>
                  <CoolIcon name="chevron-down" size={11} duotone={false} className="text-[var(--mute)]" />
                </button>

                {ratioDropdownOpen && (
                  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div
                      className="fixed inset-0"
                      onClick={() => setRatioDropdownOpen(false)}
                    />
                    <div className="relative z-10 w-full sm:w-80 rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl p-4 space-y-2 animate-in slide-in-from-bottom duration-200">
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                        <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink)]">
                          Format & Ratio
                        </span>
                        <button
                          type="button"
                          onClick={() => setRatioDropdownOpen(false)}
                          className="w-7 h-7 rounded-full bg-[var(--field)] hover:bg-[var(--hover)] flex items-center justify-center text-[var(--ink-2)] cursor-pointer"
                        >
                          <CoolIcon name="close-md" size={14} duotone={false} />
                        </button>
                      </div>
                      <div className="space-y-1 max-h-80 overflow-y-auto">
                        {RATIOS.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setAspectRatio(r.id);
                              setRatioDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full px-3 py-2.5 rounded-xl text-left transition-colors flex items-center justify-between cursor-pointer",
                              aspectRatio === r.id
                                ? "bg-[var(--hover)] text-emerald-600 dark:text-[#D8FF64] font-semibold"
                                : "text-[var(--ink)] hover:bg-[var(--hover)]"
                            )}
                          >
                            <div>
                              <span className="text-[13px] font-medium block">{r.label}</span>
                              <span className="text-[11px] text-[var(--mute)] block">{r.desc}</span>
                            </div>
                            {aspectRatio === r.id && (
                              <CoolIcon name="check" size={14} duotone={false} className="text-emerald-600 dark:text-[#D8FF64] shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bouton de génération circulaire jaune/lime [↑] */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--mute)] hidden sm:inline">
                {creditsCost} cr
              </span>

              <button
                type="button"
                onClick={onGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={cn(
                  "w-9 h-9 rounded-full bg-[#D8FF64] text-black flex items-center justify-center shadow-md transition-all cursor-pointer",
                  isGenerating || !prompt.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105 active:scale-95 hover:bg-[#cbf54a]"
                )}
                title="Lancer la création (Entrée)"
              >
                {isGenerating ? (
                  <CoolIcon name="loading" size={16} className="animate-spin text-black" duotone={false} />
                ) : (
                  <CoolIcon name="arrow-up-md" size={18} strokeWidth={2.5} duotone={false} className="text-black" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  { id: "9:16", label: "9:16 Vertical (TikTok/Reels)" },
  { id: "16:9", label: "16:9 Paysage (YouTube/Cinéma)" },
  { id: "1:1", label: "1:1 Carré (Instagram Feed)" },
  { id: "4:5", label: "4:5 Portrait (Facebook/Insta)" },
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
        <div className="absolute left-2 bottom-full mb-3 w-80 p-3 rounded-[20px] bg-[#1A1A19] border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
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
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto text-white/40">
                <CoolIcon name="layers" size={20} duotone className="text-white/40" />
              </div>
              <p className="text-[12px] text-white/60">Vos éléments apparaîtront ici</p>
              <button
                type="button"
                onClick={() => {
                  setAtPopoverOpen(false);
                  onOpenAssets();
                }}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11.5px] font-medium transition-colors cursor-pointer"
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
                  className="w-full flex items-center gap-2.5 p-1.5 rounded-xl text-left hover:bg-white/10 transition-colors group cursor-pointer"
                >
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-8 h-8 rounded-lg object-cover bg-black/40 border border-white/10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[12.5px] font-medium text-white group-hover:text-[#D8FF64] block truncate">
                      @{asset.name}
                    </span>
                    <span className="text-[10px] text-white/40">Cliquez pour insérer</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CADRE PRINCIPAL DE LA PROMPT BUBBLE ── */}
      <div className="relative w-full rounded-[24px] bg-[#1A1A19]/95 backdrop-blur-md border border-white/10 hover:border-white/20 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 shadow-2xl transition-all duration-200 overflow-hidden">
        {/* Badges d'assets sélectionnés en référence */}
        {selectedAssets.length > 0 && (
          <div className="flex items-center gap-1.5 px-3.5 pt-2.5 pb-1 overflow-x-auto scrollbar-none border-b border-white/5">
            <span className="text-[10.5px] font-mono text-white/40 shrink-0">Références:</span>
            {selectedAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white shrink-0"
              >
                <img src={asset.url} alt="" className="w-4 h-4 rounded-full object-cover" />
                <span>@{asset.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveAsset(asset.id)}
                  className="text-white/40 hover:text-white ml-0.5"
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
            className="w-full bg-transparent border-0 resize-none outline-none text-[14px] leading-relaxed text-white placeholder:text-white/40 min-h-[44px] max-h-[120px] px-1"
          />

          {/* Barre d'outils inférieure intégrée */}
          <div className="flex items-center justify-between pt-2 mt-1">
            <div className="flex items-center gap-1.5">
              {/* Bouton [+] Ouvre Assets */}
              <button
                type="button"
                onClick={onOpenAssets}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
                title="Ajouter des images, vidéos ou personnages (+)"
              >
                <CoolIcon name="add-plus" size={15} duotone={false} />
              </button>

              {/* Bouton Modèle (ex: [✨ Auto ▾]) */}
              <button
                type="button"
                onClick={onOpenModelSelector}
                className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[12px] font-medium text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <CoolIcon name="star" size={13} duotone secondaryColor="#D8FF64" className="text-[#D8FF64]" />
                <span className="truncate max-w-[110px]">{selectedModelName}</span>
                <CoolIcon name="chevron-down" size={11} duotone={false} className="text-white/40" />
              </button>

              {/* Bouton Ratio (ex: [▯ 9:16 ▾]) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRatioDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11.5px] font-mono text-white/80 hover:text-white transition-all cursor-pointer"
                >
                  <span>{aspectRatio}</span>
                  <CoolIcon name="chevron-down" size={11} duotone={false} className="text-white/40" />
                </button>

                {ratioDropdownOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-48 p-1 rounded-xl bg-[#1A1A19] border border-white/10 shadow-2xl z-50 space-y-0.5">
                    {RATIOS.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setAspectRatio(r.id);
                          setRatioDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full px-2.5 py-1.5 rounded-lg text-left text-[11.5px] transition-colors flex items-center justify-between cursor-pointer",
                          aspectRatio === r.id
                            ? "bg-white/10 text-[#D8FF64] font-medium"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bouton de génération circulaire jaune/lime [↑] */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-white/40 hidden sm:inline">
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

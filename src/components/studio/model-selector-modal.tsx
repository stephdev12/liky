"use client";

import React, { useState, useMemo } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ModelOption {
  id: string;
  name: string;
  category: "image" | "video" | "audio";
  provider: "kie" | "higgsfield" | "hybrid";
  tagline: string;
  specs?: string;
  badge?: "TOP" | "NEW" | "PRO";
  creditsCost: number;
}

export const ALL_MODELS: ModelOption[] = [
  // ── IMAGES ──
  {
    id: "soul-2",
    name: "Higgsfield Soul 2.0",
    category: "image",
    provider: "higgsfield",
    tagline: "Génération photo et mode photoréaliste de niveau éditorial",
    specs: "1080p-4K · Rendu humain sans défaut",
    badge: "TOP",
    creditsCost: 4,
  },
  {
    id: "gpt-image-2-5",
    name: "GPT Image 2.5 Sunburst",
    category: "image",
    provider: "kie",
    tagline: "Qualité exceptionnelle, rendu précis des textes et typographie",
    specs: "2K · Net pour affiches et packaging",
    badge: "PRO",
    creditsCost: 8,
  },
  {
    id: "nano-banana-2-1",
    name: "Nano Banana 2.1",
    category: "image",
    provider: "kie",
    tagline: "Modèle image polyvalent, rapide et ultra-fidèle",
    specs: "1K-4K · Rapide",
    badge: "NEW",
    creditsCost: 5,
  },
  {
    id: "seedream-5",
    name: "Seedream 5.0 Pro",
    category: "image",
    provider: "kie",
    tagline: "Images cohérentes et riches en détails fins",
    specs: "2K-4K · Composition avancée",
    creditsCost: 5,
  },

  // ── VIDÉO ──
  {
    id: "seedance-2-5",
    name: "Seedance 2.5",
    category: "video",
    provider: "hybrid",
    tagline: "Marketing & pub, synchronisation et son natif",
    specs: "1080p · 4s–30s · Audio natif",
    badge: "TOP",
    creditsCost: 16,
  },
  {
    id: "veo-3-1",
    name: "Google Veo 3.1",
    category: "video",
    provider: "kie",
    tagline: "Cinématographie d'exception et mouvements de caméra fluides",
    specs: "4K Master · 5s–8s · Son spatial",
    badge: "PRO",
    creditsCost: 28,
  },
  {
    id: "cinema_studio_4",
    name: "Cinema Studio 4.0",
    category: "video",
    provider: "higgsfield",
    tagline: "Rendu pellicule 35mm et format anamorphique Hollywood",
    specs: "1080p · Éclairage cinéma naturel",
    badge: "NEW",
    creditsCost: 22,
  },
  {
    id: "kling-3-0",
    name: "Kling 3.0 Pro",
    category: "video",
    provider: "hybrid",
    tagline: "Physique réaliste des corps et mouvements expressifs",
    specs: "1080p · 5s–10s",
    creditsCost: 20,
  },
  {
    id: "minimax-h3",
    name: "MiniMax Hailuo 3",
    category: "video",
    provider: "kie",
    tagline: "Dynamisme d'action et plans complexes",
    specs: "2K · 5s–15s",
    creditsCost: 16,
  },

  // ── AUDIO ──
  {
    id: "suno-v6",
    name: "Suno V6",
    category: "audio",
    provider: "kie",
    tagline: "Génération musicale complète avec voix et arrangement",
    specs: "Stéréo 320kbps · 2 pistes générées",
    badge: "TOP",
    creditsCost: 10,
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs Turbo 2.5",
    category: "audio",
    provider: "kie",
    tagline: "Voix off ultra-naturelle, expressive et multilingue",
    specs: "Audio HD · Synchronisation labiale",
    creditsCost: 2,
  },
];

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string; // "auto" ou id du modèle
  onSelectModel: (modelId: string, modelName: string) => void;
}

export function ModelSelectorModal({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
}: ModelSelectorModalProps) {
  const [search, setSearch] = useState("");

  const filteredModels = useMemo(() => {
    if (!search.trim()) return ALL_MODELS;
    const q = search.toLowerCase();
    return ALL_MODELS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.tagline.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }, [search]);

  if (!isOpen) return null;

  const imageModels = filteredModels.filter((m) => m.category === "image");
  const videoModels = filteredModels.filter((m) => m.category === "video");
  const audioModels = filteredModels.filter((m) => m.category === "audio");

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Bottom sheet / Modal */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-xl max-h-[88vh] bg-[#171717] text-[#F8F8F5] border border-white/10 sm:rounded-[24px] rounded-t-[24px] shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
          <div className="w-8" />
          <h3 className="font-heading text-[17px] font-medium text-white tracking-tight">
            Modèles d'IA
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <CoolIcon name="close-md" size={16} duotone={false} />
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="px-5 pt-3 pb-2">
          <div className="relative">
            <CoolIcon
              name="search-magnifying-glass"
              size={15}
              duotone={false}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un modèle..."
              className="h-10 pl-9 pr-4 rounded-xl bg-white/5 border-white/10 text-[13px] text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#D8FF64]"
            />
          </div>
        </div>

        {/* Liste des modèles scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4">
          {/* Option Mode Auto */}
          {!search && (
            <button
              type="button"
              onClick={() => {
                onSelectModel("auto", "Auto");
                onClose();
              }}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer",
                selectedModel === "auto"
                  ? "bg-white/10 border-[#D8FF64]/60"
                  : "bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D8FF64]/10 border border-[#D8FF64]/20 flex items-center justify-center text-[#D8FF64]">
                  <CoolIcon name="star" size={20} duotone secondaryColor="#D8FF64" className="text-[#D8FF64]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[14px] text-white">Mode Auto</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#D8FF64]/20 text-[#D8FF64]">
                      Recommandé
                    </span>
                  </div>
                  <p className="text-[11.5px] text-white/60">
                    likyAI choisit automatiquement le moteur le plus adapté à votre prompt
                  </p>
                </div>
              </div>

              {selectedModel === "auto" && (
                <div className="w-6 h-6 rounded-full bg-[#D8FF64] text-black flex items-center justify-center shrink-0">
                  <CoolIcon name="check" size={14} duotone={false} className="text-black stroke-[3]" />
                </div>
              )}
            </button>
          )}

          {/* Section Vidéo */}
          {videoModels.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2 px-1">
                <CoolIcon name="monitor-play" size={14} duotone className="text-white/40" />
                <span>Vidéo ({videoModels.length})</span>
              </div>
              <div className="space-y-1.5">
                {videoModels.map((m) => (
                  <ModelItem
                    key={m.id}
                    model={m}
                    isSelected={selectedModel === m.id}
                    onSelect={() => {
                      onSelectModel(m.id, m.name);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section Image */}
          {imageModels.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2 px-1">
                <CoolIcon name="image-01" size={14} duotone className="text-white/40" />
                <span>Image ({imageModels.length})</span>
              </div>
              <div className="space-y-1.5">
                {imageModels.map((m) => (
                  <ModelItem
                    key={m.id}
                    model={m}
                    isSelected={selectedModel === m.id}
                    onSelect={() => {
                      onSelectModel(m.id, m.name);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section Audio */}
          {audioModels.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2 px-1">
                <CoolIcon name="headphones" size={14} duotone className="text-white/40" />
                <span>Audio & Voix ({audioModels.length})</span>
              </div>
              <div className="space-y-1.5">
                {audioModels.map((m) => (
                  <ModelItem
                    key={m.id}
                    model={m}
                    isSelected={selectedModel === m.id}
                    onSelect={() => {
                      onSelectModel(m.id, m.name);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ModelItem({
  model,
  isSelected,
  onSelect,
}: {
  model: ModelOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer group",
        isSelected
          ? "bg-white/10 border-[#D8FF64]/60"
          : "bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <div className="w-9 h-9 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
          {model.category === "video" ? (
            <CoolIcon name="monitor-play" size={16} duotone className="text-white/70 group-hover:text-white" />
          ) : model.category === "image" ? (
            <CoolIcon name="image-01" size={16} duotone className="text-white/70 group-hover:text-white" />
          ) : (
            <CoolIcon name="user-voice" size={16} duotone className="text-white/70 group-hover:text-white" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-[13.5px] text-white truncate">
              {model.name}
            </span>
            {model.badge && (
              <span
                className={cn(
                  "text-[9.5px] font-mono font-semibold px-1.5 py-0.2 rounded",
                  model.badge === "TOP"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : model.badge === "NEW"
                    ? "bg-[#D8FF64]/20 text-[#D8FF64] border border-[#D8FF64]/30"
                    : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                )}
              >
                {model.badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/60 truncate">{model.tagline}</p>
          {model.specs && (
            <span className="text-[10px] font-mono text-white/40 block mt-0.5">
              {model.specs}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-[11px] text-white/50">
          {model.creditsCost} cr
        </span>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-[#D8FF64] text-black flex items-center justify-center">
            <CoolIcon name="check" size={12} duotone={false} className="text-black stroke-[3]" />
          </div>
        )}
      </div>
    </button>
  );
}

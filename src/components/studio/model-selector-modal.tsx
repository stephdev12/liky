"use client";

import React, { useState, useMemo } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
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
  logo: "higgsfield" | "openai" | "google" | "bytedance" | "minimax" | "kling" | "suno" | "elevenlabs" | "wan";
}

export const ALL_MODELS: ModelOption[] = [
  // ── IMAGES ──
  {
    id: "soul-2",
    name: "Soul 2.0",
    category: "image",
    provider: "higgsfield",
    tagline: "Next generation ultra-realistic fashion visuals",
    specs: "1080p-4K",
    creditsCost: 4,
    logo: "higgsfield",
  },
  {
    id: "gpt-image-2-5",
    name: "GPT Image 2.5 Sunburst",
    category: "image",
    provider: "kie",
    tagline: "Exceptional quality, precise edits",
    specs: "2K",
    creditsCost: 8,
    logo: "openai",
  },
  {
    id: "nano-banana-2-1",
    name: "Nano Banana 2.1",
    category: "image",
    provider: "kie",
    tagline: "Google's next-gen flagship image model",
    specs: "1K-4K",
    badge: "NEW",
    creditsCost: 5,
    logo: "google",
  },
  {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    category: "image",
    provider: "kie",
    tagline: "Google's flagship generation model",
    specs: "4K",
    creditsCost: 6,
    logo: "google",
  },
  {
    id: "seedream-5",
    name: "Seedream 5.0 Pro",
    category: "image",
    provider: "kie",
    tagline: "Logically consistent images with intelligence",
    specs: "2K-4K",
    creditsCost: 5,
    logo: "bytedance",
  },

  // ── VIDÉO ──
  {
    id: "seedance-2-5",
    name: "Seedance 2.5",
    category: "video",
    provider: "hybrid",
    tagline: "1080p · 4s-30s",
    badge: "TOP",
    creditsCost: 16,
    logo: "bytedance",
  },
  {
    id: "seedance-2-5-edit",
    name: "Seedance 2.5 Edit",
    category: "video",
    provider: "hybrid",
    tagline: "480p-720p · Edit Video · Audio",
    badge: "TOP",
    creditsCost: 14,
    logo: "bytedance",
  },
  {
    id: "seedance-2-0",
    name: "Seedance 2.0",
    category: "video",
    provider: "hybrid",
    tagline: "4K · 4s-15s",
    creditsCost: 18,
    logo: "bytedance",
  },
  {
    id: "minimax-h3",
    name: "MiniMax H3",
    category: "video",
    provider: "kie",
    tagline: "2K · 5s-15s",
    creditsCost: 16,
    logo: "minimax",
  },
  {
    id: "veo-3-1",
    name: "Google Veo 3.1",
    category: "video",
    provider: "kie",
    tagline: "4K Master · 5s-8s Cinematic",
    badge: "PRO",
    creditsCost: 28,
    logo: "google",
  },
  {
    id: "kling-3-0",
    name: "Kling 3.0 Pro",
    category: "video",
    provider: "hybrid",
    tagline: "1080p · 5s-10s Physical simulation",
    creditsCost: 20,
    logo: "kling",
  },
  {
    id: "wan-2-7",
    name: "Wan 2.7 Video",
    category: "video",
    provider: "kie",
    tagline: "1080p · Natural character fluid motion",
    badge: "NEW",
    creditsCost: 18,
    logo: "wan",
  },

  // ── AUDIO ──
  {
    id: "suno-v6",
    name: "Suno V6",
    category: "audio",
    provider: "kie",
    tagline: "Studio quality music with vocals & lyrics",
    specs: "Stéréo 320kbps",
    creditsCost: 10,
    logo: "suno",
  },
  {
    id: "elevenlabs-turbo-2-5",
    name: "ElevenLabs Turbo 2.5",
    category: "audio",
    provider: "kie",
    tagline: "Hyper-realistic voice cloning & narration",
    specs: "Ultra-low latency",
    creditsCost: 2,
    logo: "elevenlabs",
  },
];

/* ── COMPOSANT LOGOS SVG OFFICIELS DES FOURNISSEURS ── */
function ModelBrandLogo({ logo }: { logo: ModelOption["logo"] }) {
  switch (logo) {
    case "openai":
      return (
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3428 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3428 7.8956zm16.0993 3.8558L12.5993 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6725a.79.79 0 0 0-.4021-.6857zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L8.909 9.2298V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6702 4.6534zm-9.74 4.9061l-2.46-1.4209 2.46-1.421 2.46 1.421-2.46 1.421z" />
        </svg>
      );
    case "google":
      return (
        <span className="font-heading font-black text-[20px] text-white tracking-tighter">
          G
        </span>
      );
    case "bytedance":
      return (
        <div className="flex items-end gap-0.5 h-4 text-white">
          <span className="w-1 h-3 rounded-xs bg-white" />
          <span className="w-1 h-4 rounded-xs bg-white" />
          <span className="w-1 h-2 rounded-xs bg-white" />
          <span className="w-1 h-3.5 rounded-xs bg-white" />
        </div>
      );
    case "minimax":
      return (
        <div className="flex items-center gap-0.5 h-3 text-white">
          <span className="w-0.5 h-2 rounded-full bg-white" />
          <span className="w-0.5 h-3 rounded-full bg-white" />
          <span className="w-0.5 h-1.5 rounded-full bg-white" />
          <span className="w-0.5 h-2.5 rounded-full bg-white" />
          <span className="w-0.5 h-1 rounded-full bg-white" />
        </div>
      );
    case "higgsfield":
      return (
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12c0-3.3 2.7-6 6-6s6 6 6 6-2.7 6-6 6-6-2.7-6-6z" />
          <path d="M14 12c0-3.3 2.7-6 6-6s6 6 6 6-2.7 6-6 6-6-2.7-6-6z" />
        </svg>
      );
    case "kling":
      return (
        <span className="font-heading font-bold text-[16px] text-white tracking-wider">
          K
        </span>
      );
    case "wan":
      return (
        <span className="font-heading font-bold text-[15px] text-white tracking-tight">
          W
        </span>
      );
    case "suno":
      return (
        <CoolIcon name="headphones" size={17} duotone={false} className="text-white" />
      );
    case "elevenlabs":
      return (
        <div className="flex items-center gap-1 text-white">
          <span className="w-1 h-4 rounded-full bg-white" />
          <span className="w-1 h-4 rounded-full bg-white" />
        </div>
      );
  }
}

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (id: string, name: string) => void;
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
        m.tagline.toLowerCase().includes(q)
    );
  }, [search]);

  const imageModels = filteredModels.filter((m) => m.category === "image");
  const videoModels = filteredModels.filter((m) => m.category === "video");
  const audioModels = filteredModels.filter((m) => m.category === "audio");

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Container (exacte réplique Higgsfield) */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-[420px] max-h-[90vh] sm:max-h-screen bg-[var(--surface)] text-[var(--ink)] border-t sm:border-t-0 sm:border-l border-[var(--line)] shadow-2xl z-50 flex flex-col justify-between overflow-hidden rounded-t-[28px] sm:rounded-none animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
        
        {/* Poignée centrale mobile */}
        <div className="w-full flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[var(--line-strong)]" />
        </div>

        {/* Header : Model + Fermer */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--line)] shrink-0">
          <div className="w-7" />
          <h2 className="font-heading text-[16px] font-semibold tracking-tight text-[var(--ink)]">
            Model
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[var(--field)] hover:bg-[var(--hover)] flex items-center justify-center text-[var(--mute)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          >
            <CoolIcon name="close-md" size={15} duotone={false} />
          </button>
        </div>

        {/* Barre de recherche Q Search */}
        <div className="px-5 pt-3 pb-2 shrink-0">
          <div className="relative flex items-center w-full h-10 rounded-full bg-[var(--field)] border border-[var(--line)] px-3.5">
            <CoolIcon name="search-magnifying-glass" size={15} duotone={false} className="text-[var(--mute)] mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-[13px] text-[var(--ink)] placeholder:text-[var(--mute)] outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-1 text-[var(--mute)] hover:text-[var(--ink)]"
              >
                <CoolIcon name="close-md" size={12} duotone={false} />
              </button>
            )}
          </div>
        </div>

        {/* Liste scrollable des modèles */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4 scrollbar-thin">
          
          {/* Option : Auto mode (exacte réplique de la capture) */}
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
                  ? "bg-[var(--field)] border-[#D8FF64]/50"
                  : "bg-[var(--field)]/60 border-transparent hover:bg-[var(--field)]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-white shrink-0">
                  <CoolIcon name="star" size={18} duotone={false} className="text-white fill-current" />
                </div>
                <div>
                  <span className="font-heading text-[14px] font-semibold text-[var(--ink)] block">
                    Auto mode
                  </span>
                  <p className="text-[11.5px] text-[var(--mute)]">
                    Auto picks a model for you
                  </p>
                </div>
              </div>

              {selectedModel === "auto" && (
                <div className="w-5 h-5 rounded-full bg-[#D8FF64] text-black flex items-center justify-center shrink-0">
                  <CoolIcon name="check" size={12} duotone={false} className="text-black stroke-[3]" />
                </div>
              )}
            </button>
          )}

          {/* Section Image */}
          {imageModels.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--mute)] mb-2 px-1">
                <CoolIcon name="image-01" size={13} duotone={false} />
                <span>Image &gt;</span>
              </div>
              <div className="space-y-1">
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

          {/* Section Vidéo */}
          {videoModels.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--mute)] mb-2 px-1">
                <CoolIcon name="camera" size={13} duotone={false} />
                <span>Video &gt;</span>
              </div>
              <div className="space-y-1">
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

          {/* Section Audio */}
          {audioModels.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--mute)] mb-2 px-1">
                <CoolIcon name="headphones" size={13} duotone={false} />
                <span>Audio &gt;</span>
              </div>
              <div className="space-y-1">
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
        "w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all cursor-pointer group",
        isSelected
          ? "bg-[var(--field)] border border-[#D8FF64]/40"
          : "hover:bg-[var(--hover)] border border-transparent"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
          <ModelBrandLogo logo={model.logo} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-heading text-[13.5px] font-medium text-[var(--ink)] truncate">
              {model.name}
            </span>
          </div>
          <span className="text-[11.5px] text-[var(--mute)] truncate block">
            {model.tagline}
          </span>
        </div>
      </div>

      {isSelected && (
        <div className="w-5 h-5 rounded-full bg-[#D8FF64] text-black flex items-center justify-center shrink-0">
          <CoolIcon name="check" size={12} duotone={false} className="text-black stroke-[3]" />
        </div>
      )}
    </button>
  );
}

"use client";

import React, { useState, useRef } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { cn } from "@/lib/utils";

export interface AssetItem {
  id: string;
  name: string;
  url: string;
  type: "upload" | "influencer" | "preset" | "element";
}

interface AssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssetIds: string[];
  onToggleAsset: (asset: AssetItem) => void;
  onApply: () => void;
  onOpenInfluencerBuilder?: () => void;
  customAssets?: AssetItem[];
  onUploadFiles?: (files: FileList) => void;
}

export function AssetsModal({
  isOpen,
  onClose,
  selectedAssetIds,
  onToggleAsset,
  onApply,
  onOpenInfluencerBuilder,
  customAssets = [],
  onUploadFiles,
}: AssetsModalProps) {
  const [activeTab, setActiveTab] = useState<"uploads" | "influencer" | "presets" | "elements">("uploads");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const defaultPresets: AssetItem[] = [
    { id: "pre_1", name: "Cyberpunk Néon", url: "/assets/organic/organic-1.webp", type: "preset" },
    { id: "pre_2", name: "Cinéma Anamorphique", url: "/assets/organic/organic-2.webp", type: "preset" },
    { id: "pre_3", name: "Luxe Minimaliste", url: "/assets/organic/organic-3.webp", type: "preset" },
    { id: "pre_4", name: "Nature Sauvage", url: "/assets/organic/organic-4.webp", type: "preset" },
  ];

  const defaultInfluencers: AssetItem[] = [
    { id: "inf_1", name: "Léa (Beauté)", url: "/assets/studios/studio-ugc.jpg", type: "influencer" },
    { id: "inf_2", name: "Thomas (Tech)", url: "/assets/studios/studio-ad-builder.jpg", type: "influencer" },
    { id: "inf_3", name: "Amina (Mode)", url: "/assets/studios/studio-cinema.jpg", type: "influencer" },
  ];

  const displayedAssets =
    activeTab === "uploads"
      ? customAssets.filter((a) => a.type === "upload")
      : activeTab === "influencer"
      ? [...customAssets.filter((a) => a.type === "influencer"), ...defaultInfluencers]
      : activeTab === "presets"
      ? defaultPresets
      : customAssets.filter((a) => a.type === "element");

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-xl max-h-[85vh] bg-[#171717] text-[#F8F8F5] border border-white/10 sm:rounded-[24px] rounded-t-[24px] shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
          <div className="w-8" />
          <div className="text-center">
            <h3 className="font-heading text-[17px] font-medium text-white tracking-tight">
              Assets & Références
            </h3>
            <span className="text-[11px] font-mono text-white/50">
              {selectedAssetIds.length} sur 14 sélectionnés
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <CoolIcon name="close-md" size={16} duotone={false} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 px-5 pt-3 pb-2 overflow-x-auto scrollbar-none border-b border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab("uploads")}
            className={cn(
              "px-3 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer shrink-0",
              activeTab === "uploads"
                ? "bg-white text-black"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            Uploads
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("influencer")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer shrink-0",
              activeTab === "influencer"
                ? "bg-[#D8FF64] text-black"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <span>AI Influencer</span>
            <span className="text-[9.5px] font-mono font-semibold px-1 rounded bg-black/10">Free ✨</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={cn(
              "px-3 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer shrink-0",
              activeTab === "presets"
                ? "bg-white text-black"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            Presets
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("elements")}
            className={cn(
              "px-3 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer shrink-0",
              activeTab === "elements"
                ? "bg-white text-black"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            Éléments
          </button>
        </div>

        {/* Corps de la modale */}
        <div className="flex-1 overflow-y-auto p-5 min-h-[260px] max-h-[380px]">
          {/* Grille d'Assets */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {/* Tuile d'upload (dans l'onglet uploads) */}
            {activeTab === "uploads" && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-white/20 hover:border-[#D8FF64]/60 bg-white/5 hover:bg-white/8 transition-all flex flex-col items-center justify-center gap-1.5 text-white/70 hover:text-white cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-[#D8FF64]/20 group-hover:text-[#D8FF64] flex items-center justify-center transition-colors">
                  <CoolIcon name="folder-upload" size={20} duotone />
                </div>
                <span className="text-[11.5px] font-medium">Importer</span>
              </button>
            )}

            {/* Bouton créer influenceur (dans l'onglet influenceur) */}
            {activeTab === "influencer" && onOpenInfluencerBuilder && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInfluencerBuilder();
                }}
                className="aspect-square rounded-2xl border-2 border-dashed border-[#D8FF64]/40 hover:border-[#D8FF64] bg-[#D8FF64]/5 hover:bg-[#D8FF64]/10 transition-all flex flex-col items-center justify-center gap-1.5 text-[#D8FF64] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#D8FF64]/20 flex items-center justify-center">
                  <CoolIcon name="add-plus" size={18} duotone={false} className="stroke-[2.5]" />
                </div>
                <span className="text-[11.5px] font-medium text-center px-1">Créer avatar</span>
              </button>
            )}

            {/* Liste des éléments */}
            {displayedAssets.map((asset) => {
              const isSelected = selectedAssetIds.includes(asset.id);
              return (
                <div
                  key={asset.id}
                  onClick={() => onToggleAsset(asset)}
                  className={cn(
                    "relative aspect-square rounded-2xl overflow-hidden border cursor-pointer group transition-all select-none",
                    isSelected
                      ? "border-[#D8FF64] ring-2 ring-[#D8FF64]/40"
                      : "border-white/10 hover:border-white/30"
                  )}
                >
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <span className="text-[10.5px] font-medium text-white truncate block">
                      @{asset.name}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#D8FF64] text-black flex items-center justify-center shadow">
                      <CoolIcon name="check" size={12} duotone={false} className="stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {displayedAssets.length === 0 && activeTab !== "uploads" && (
            <div className="py-12 text-center text-white/40 text-[12.5px]">
              Aucun asset disponible dans cette section.
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="p-4 border-t border-white/10 bg-[#171717] flex items-center justify-between gap-3">
          <span className="text-[12px] text-white/50">
            {selectedAssetIds.length} sélectionné(s)
          </span>
          <button
            type="button"
            onClick={() => {
              onApply();
              onClose();
            }}
            className="px-6 py-2.5 rounded-full bg-white hover:bg-white/90 text-black font-semibold text-[13px] transition-all cursor-pointer"
          >
            Appliquer
          </button>
        </div>

        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0 && onUploadFiles) {
              onUploadFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />
      </div>
    </>
  );
}

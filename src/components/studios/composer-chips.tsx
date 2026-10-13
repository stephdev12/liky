"use client";

import React from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { StudioConfig, QualityTier } from "@/lib/studios/types";
import { cn } from "@/lib/utils";

interface ComposerChipsProps {
  studio: StudioConfig;
  onOpenStudioSelector: () => void;
  onOpenBrandKit: () => void;
  onOpenCharacterModal: () => void;
  onOpenScraperModal: () => void;
  selectedCharacterName?: string;
  selectedProductName?: string;
  qualityTier: QualityTier;
  onChangeQualityTier: (tier: QualityTier) => void;
  selectedFormat: string;
  onChangeFormat: (format: string) => void;
}

export function ComposerChips({
  studio,
  onOpenStudioSelector,
  onOpenBrandKit,
  onOpenCharacterModal,
  onOpenScraperModal,
  selectedCharacterName,
  selectedProductName,
  qualityTier,
  onChangeQualityTier,
  selectedFormat,
  onChangeFormat,
}: ComposerChipsProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap px-3 py-2 border-b border-[var(--line)] bg-[var(--surf)]/50 text-xs">
      {/* Studio Selector Pill */}
      <button
        type="button"
        onClick={onOpenStudioSelector}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-foreground font-semibold hover:border-[var(--line-strong)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
      >
        <CoolIcon name={studio.icon} size={13} duotone={false} />
        <span>{studio.name}</span>
        <CoolIcon name="arrow-down-sm" size={11} duotone={false} className="text-muted-foreground" />
      </button>

      {/* Chip @Personnage */}
      <button
        type="button"
        onClick={onOpenCharacterModal}
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer",
          selectedCharacterName
            ? "border-foreground bg-[var(--field)] text-foreground font-medium"
            : "border-[var(--line)] bg-[var(--surface)] text-muted-foreground hover:text-foreground hover:border-[var(--line-strong)]"
        )}
      >
        <CoolIcon name="user-01" size={12} duotone={false} />
        <span>{selectedCharacterName ? `@${selectedCharacterName}` : "@Personnage"}</span>
      </button>

      {/* Chip Produit / Click-to-Ad (pertinent pour UGC et Affiches) */}
      {(studio.id === "ugc" || studio.id === "posters") && (
        <button
          type="button"
          onClick={onOpenScraperModal}
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer",
            selectedProductName
              ? "border-foreground bg-[var(--field)] text-foreground font-medium"
              : "border-[var(--line)] bg-[var(--surface)] text-muted-foreground hover:text-foreground hover:border-[var(--line-strong)]"
          )}
        >
          <CoolIcon name="link-break" size={12} duotone={false} />
          <span>{selectedProductName ? `📦 ${selectedProductName}` : "URL Produit"}</span>
        </button>
      )}

      {/* Chip Brand Kit */}
      <button
        type="button"
        onClick={onOpenBrandKit}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-muted-foreground hover:text-foreground hover:border-[var(--line-strong)] transition-colors cursor-pointer"
      >
        <CoolIcon name="folder-check" size={12} duotone={false} />
        <span>Brand Kit</span>
      </button>

      {/* Sélecteur de format */}
      {studio.formats.length > 0 && (
        <select
          value={selectedFormat}
          onChange={(e) => onChangeFormat(e.target.value)}
          className="h-6.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer focus:outline-hidden"
        >
          {studio.formats.map((f) => (
            <option key={f.ratio} value={f.ratio}>
              {f.label}
            </option>
          ))}
        </select>
      )}

      <div className="ml-auto flex items-center gap-1">
        {/* Bascule Brouillon / Final */}
        <div className="flex items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] p-0.5 text-[10.5px] font-mono">
          <button
            type="button"
            onClick={() => onChangeQualityTier("draft")}
            className={cn(
              "px-2 py-0.5 rounded-md transition-all cursor-pointer",
              qualityTier === "draft"
                ? "bg-[var(--field)] text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Brouillon ({studio.supportedModels.draft.credits} cr)
          </button>
          <button
            type="button"
            onClick={() => onChangeQualityTier("final")}
            className={cn(
              "px-2 py-0.5 rounded-md transition-all cursor-pointer",
              qualityTier === "final"
                ? "bg-[var(--field)] text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Final ({studio.supportedModels.final.credits} cr)
          </button>
        </div>
      </div>
    </div>
  );
}

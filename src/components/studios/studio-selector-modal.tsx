"use client";

import React from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { STUDIOS } from "@/lib/studios/config";
import { StudioSlug } from "@/lib/studios/types";
import { cn } from "@/lib/utils";

interface StudioSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudio: StudioSlug | null;
  onSelectStudio: (slug: StudioSlug) => void;
}

export function StudioSelectorModal({
  isOpen,
  onClose,
  currentStudio,
  onSelectStudio,
}: StudioSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4 bg-[var(--surface)]">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[var(--field)] border border-[var(--line)] flex items-center justify-center text-foreground">
              <CoolIcon name="more-grid-big" size={17} duotone={false} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Studios de Création
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Des parcours guidés de bout en bout pour concevoir des contenus publiables
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-[var(--hover)] hover:text-foreground transition-colors cursor-pointer"
          >
            <CoolIcon name="close-md" size={15} duotone={false} />
          </button>
        </div>

        {/* Studios Grid */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STUDIOS.map((studio) => {
            const isSelected = currentStudio === studio.id;
            return (
              <div
                key={studio.id}
                onClick={() => {
                  onSelectStudio(studio.id);
                  onClose();
                }}
                className={cn(
                  "relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group",
                  isSelected
                    ? "border-foreground bg-[var(--field)] ring-1 ring-foreground/40 shadow-xs"
                    : "border-[var(--line)] bg-[var(--surf)] hover:border-[var(--line-strong)] hover:bg-[var(--hover)]"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="size-10 rounded-xl bg-[var(--field)] border border-[var(--line)] flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                      <CoolIcon name={studio.icon} size={20} duotone={false} />
                    </div>
                    {studio.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-foreground/10 text-foreground border border-foreground/15 font-mono">
                        {studio.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading text-base font-semibold text-foreground mt-3.5 tracking-tight">
                    {studio.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {studio.shortDesc}
                  </p>

                  <ul className="mt-3.5 space-y-1.5 border-t border-[var(--line)] pt-3">
                    {studio.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <span className="size-1 rounded-full bg-foreground/40" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-[var(--line)] flex items-center justify-between">
                  <span className="text-[11.5px] font-mono text-muted-foreground">
                    Dès <strong className="text-foreground">{studio.startingCredits} cr</strong>
                  </span>
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    {isSelected ? "Actif" : "Ouvrir"}
                    <CoolIcon name="arrow-right-sm" size={13} duotone={false} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--line)] px-6 py-3.5 bg-[var(--surface)] flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Mode libre disponible : générez des visuels avec les outils unitaires dans le Studio standard.
          </span>
          <button
            type="button"
            onClick={() => {
              onSelectStudio("ugc");
              onClose();
            }}
            className="text-xs font-medium text-foreground hover:underline cursor-pointer"
          >
            Studio par défaut (Pubs & UGC)
          </button>
        </div>
      </div>
    </div>
  );
}

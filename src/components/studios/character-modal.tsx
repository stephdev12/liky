"use client";

import React, { useState } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Character, CharacterTraits } from "@/lib/studios/types";
import { cn } from "@/lib/utils";

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCharacter: (character: Character) => void;
}

const GENDER_OPTIONS = ["Femme", "Homme", "Androgyne", "Stylisé"];
const AGE_OPTIONS = ["18-24 ans", "25-34 ans", "35-45 ans", "50+ ans"];
const STYLE_OPTIONS = [
  "Streetwear Moderne",
  "Minimaliste Luxe",
  "Haute Couture",
  "Casual Chic",
  "Corporate / Business",
  "Sport & Athleisure",
];
const NICHE_OPTIONS = [
  "Mode & Beauté",
  "Tech & IA",
  "Lifestyle & Voyages",
  "Fitness & Bien-être",
  "Business & Entrepreneuriat",
];

export function CharacterModal({
  isOpen,
  onClose,
  onSaveCharacter,
}: CharacterModalProps) {
  const [name, setName] = useState<string>("");
  const [gender, setGender] = useState<string>("Femme");
  const [ageGroup, setAgeGroup] = useState<string>("25-34 ans");
  const [dressStyle, setDressStyle] = useState<string>("Minimaliste Luxe");
  const [niche, setNiche] = useState<string>("Mode & Beauté");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) return;

    setLoading(true);
    const traits: CharacterTraits = {
      gender,
      ageGroup,
      dressStyle,
      niche,
      personality: "Confiant, élégant et photogénique",
    };

    const newChar: Character = {
      id: `char-${Date.now()}`,
      userId: "local-user",
      name: name.trim(),
      description: description.trim() || `${gender}, ${ageGroup}, style ${dressStyle} (${niche})`,
      traits,
      referenceImages: [
        "/assets/showcase/char-1.png",
        "/assets/showcase/char-2.png",
      ],
      defaultLanguage: "fr",
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setLoading(false);
      onSaveCharacter(newChar);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4 bg-[var(--surface)]">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[var(--field)] border border-[var(--line)] flex items-center justify-center text-foreground">
              <CoolIcon name="user-check" size={17} duotone={false} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Créer un Personnage IA
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Identité visuelle stable réutilisable dans vos images et vidéos (@Personnage)
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

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Nom du personnage */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              1. Nom du personnage
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Maya, Alex, Sonia V..."
              className="font-medium text-sm"
            />
          </div>

          {/* Genre & Âge */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Genre</label>
              <div className="grid grid-cols-2 gap-1.5">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={cn(
                      "p-2 rounded-xl border text-xs text-center transition-all cursor-pointer font-medium",
                      gender === g
                        ? "border-foreground bg-[var(--field)] text-foreground font-semibold"
                        : "border-[var(--line)] bg-[var(--surf)] text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Tranche d&apos;âge</label>
              <div className="grid grid-cols-2 gap-1.5">
                {AGE_OPTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAgeGroup(a)}
                    className={cn(
                      "p-2 rounded-xl border text-xs text-center transition-all cursor-pointer font-medium",
                      ageGroup === a
                        ? "border-foreground bg-[var(--field)] text-foreground font-semibold"
                        : "border-[var(--line)] bg-[var(--surf)] text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Style Vestimentaire */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              2. Style vestimentaire & esthétique
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STYLE_OPTIONS.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setDressStyle(st)}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs text-center transition-all cursor-pointer",
                    dressStyle === st
                      ? "border-foreground bg-[var(--field)] text-foreground font-semibold"
                      : "border-[var(--line)] bg-[var(--surf)] text-muted-foreground hover:text-foreground"
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Niche / Industrie */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              3. Domaine & Niche d&apos;activité
            </label>
            <div className="flex flex-wrap gap-2">
              {NICHE_OPTIONS.map((ni) => (
                <button
                  key={ni}
                  type="button"
                  onClick={() => setNiche(ni)}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-xs transition-all cursor-pointer",
                    niche === ni
                      ? "border-foreground bg-[var(--field)] text-foreground font-semibold"
                      : "border-[var(--line)] bg-[var(--surf)] text-muted-foreground hover:text-foreground"
                  )}
                >
                  {ni}
                </button>
              ))}
            </div>
          </div>

          {/* Description libre */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Détails visuels supplémentaires (Optionnel)
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Teint chaud, cheveux bouclés bruns, yeux noisette, sourire discret..."
              className="text-xs"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[var(--line)] px-6 py-4 bg-[var(--surface)] flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Coût de création planche : <strong className="text-foreground font-mono">8 crédits</strong>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={!name.trim() || loading}
              onClick={handleCreate}
              className="text-xs font-semibold"
            >
              {loading ? "Génération en cours…" : "Créer le Personnage"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

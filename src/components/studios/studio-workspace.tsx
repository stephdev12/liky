"use client";

import React, { useState } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { STUDIOS, getStudioBySlug, TEMPLATES } from "@/lib/studios/config";
import { StudioSlug, QualityTier, Character, StudioConfig } from "@/lib/studios/types";
import { cn } from "@/lib/utils";

interface StudioWorkspaceProps {
  activeStudio: StudioSlug;
  onSelectStudio: (slug: StudioSlug) => void;
  onCloseStudio: () => void;
  credits: number;
  onOpenTopup: () => void;
  selectedCharacter: Character | null;
  onOpenCharacterModal: () => void;
  onClearCharacter: () => void;
  selectedProduct: { title: string; price?: string; currency?: string; keyBenefits?: string[] } | null;
  onOpenProductScraper: () => void;
  onClearProduct: () => void;
  onOpenBrandKit: () => void;
  qualityTier: QualityTier;
  onChangeQualityTier: (tier: QualityTier) => void;
  onGenerate: (prompt: string, studioSlug: StudioSlug, params: Record<string, any>) => void;
  recentGenerations: any[];
  onOpenResult: (card: any) => void;
}

export function StudioWorkspace({
  activeStudio,
  onSelectStudio,
  onCloseStudio,
  credits,
  onOpenTopup,
  selectedCharacter,
  onOpenCharacterModal,
  onClearCharacter,
  selectedProduct,
  onOpenProductScraper,
  onClearProduct,
  onOpenBrandKit,
  qualityTier,
  onChangeQualityTier,
  onGenerate,
  recentGenerations,
  onOpenResult,
}: StudioWorkspaceProps) {
  const studio = getStudioBySlug(activeStudio) || STUDIOS[0];

  // États locaux de formulaire selon le studio
  const [adFormat, setAdFormat] = useState<string>("ugc");
  const [promptText, setPromptText] = useState<string>("");
  const [posterTitle, setPosterTitle] = useState<string>("");
  const [posterSubtitle, setPosterSubtitle] = useState<string>("");
  const [posterCta, setPosterCta] = useState<string>("");
  const [posterRatio, setPosterRatio] = useState<string>("4:5");
  const [saasUrl, setSaasUrl] = useState<string>("");
  const [assetStyle, setAssetStyle] = useState<string>("3D Clay & Glassmorphism");
  const [assetType, setAssetType] = useState<string>("pack-icons");

  const currentCost = studio.supportedModels[qualityTier].credits;

  const handleLaunch = () => {
    let finalPrompt = promptText.trim();

    if (activeStudio === "ugc") {
      const prodInfo = selectedProduct
        ? ` Produit: ${selectedProduct.title} (${selectedProduct.price || ""} ${selectedProduct.currency || ""}). Points forts: ${(selectedProduct.keyBenefits || []).join(", ")}.`
        : "";
      const actorInfo = selectedCharacter ? ` Acteur/Avatar: ${selectedCharacter.name}.` : "";
      finalPrompt = `${finalPrompt || `Spot publicitaire format ${adFormat.toUpperCase()}`}.${prodInfo}${actorInfo}`;
    } else if (activeStudio === "posters") {
      finalPrompt = `${posterTitle ? `Titre: "${posterTitle}". ` : ""}${posterSubtitle ? `Sous-titre: "${posterSubtitle}". ` : ""}${posterCta ? `CTA/Prix: "${posterCta}". ` : ""}${finalPrompt || "Affiche publicitaire moderne et épurée."}`;
    } else if (activeStudio === "saas") {
      finalPrompt = `Démonstration logicielle SaaS ${saasUrl ? `(${saasUrl})` : ""}: ${finalPrompt || "Présentation moderne de l'interface et des fonctionnalités phares."}`;
    } else if (activeStudio === "assets") {
      finalPrompt = `Pack d'éléments graphiques pour web/app. Style: ${assetStyle}. Type: ${assetType}. ${finalPrompt}`;
    }

    onGenerate(finalPrompt, activeStudio, {
      studio: activeStudio,
      qualityTier,
      adFormat,
      format: activeStudio === "posters" ? posterRatio : "9:16",
      character: selectedCharacter ? { id: selectedCharacter.id, name: selectedCharacter.name } : undefined,
      product: selectedProduct ? { title: selectedProduct.title, price: selectedProduct.price, currency: selectedProduct.currency } : undefined,
    });
  };

  return (
    <div className="relative z-20 min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col pt-16 sm:pt-20 pb-24 px-4 sm:px-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* ── BARRE DE CONTRÔLE SUPÉRIEURE DU STUDIO ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCloseStudio}
            className="h-9 px-3 rounded-full bg-[var(--surf)] border border-[var(--line)] hover:border-[var(--ink)]/40 flex items-center gap-2 text-xs font-medium text-[var(--ink)] transition-colors cursor-pointer"
            title="Revenir au Canvas libre"
          >
            <CoolIcon name="arrow-undo-down-left" size={14} duotone={false} />
            <span>Création Libre</span>
          </button>

          <div className="h-4 w-px bg-[var(--line)] hidden sm:block" />

          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink)] flex items-center gap-2">
              <CoolIcon name={studio.icon} size={22} duotone secondaryColor="currentColor" secondaryOpacity={0.4} />
              <span>{studio.name}</span>
              {studio.badge && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--mn)] text-[var(--ink)] border border-[var(--line)]">
                  {studio.badge}
                </span>
              )}
            </h1>
            <p className="text-xs text-[var(--mute)] mt-0.5 max-w-xl">
              {studio.tagline}
            </p>
          </div>
        </div>

        {/* Actions secondaires : Brand Kit & Solde */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onOpenBrandKit}
            className="h-9 px-3 rounded-full bg-[var(--surf)] border border-[var(--line)] hover:border-[var(--ink)]/40 flex items-center gap-2 text-xs font-medium text-[var(--ink)] transition-colors cursor-pointer"
          >
            <CoolIcon name="image-01" size={14} duotone secondaryColor="currentColor" secondaryOpacity={0.4} />
            <span>Brand Kit</span>
          </button>

          <div className="h-9 px-3 rounded-full bg-[var(--surf)] border border-[var(--line)] flex items-center gap-2 text-xs font-medium text-[var(--ink)]">
            <span className="text-[var(--mute)]">Solde :</span>
            <strong className="font-mono">{credits} cr</strong>
          </div>
        </div>
      </div>

      {/* ── ONGLETS DES 6 STUDIOS DISPONIBLES ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-4 border-b border-[var(--line)] scrollbar-none">
        {STUDIOS.map((s) => {
          const isActive = s.id === activeStudio;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectStudio(s.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-[var(--ink)] text-[var(--bg)] shadow-xs font-semibold"
                  : "bg-[var(--surf)] text-[var(--mute)] border border-[var(--line)] hover:text-[var(--ink)] hover:border-[var(--ink)]/30"
              )}
            >
              <CoolIcon
                name={s.icon}
                size={15}
                duotone={isActive}
                secondaryColor="currentColor"
                secondaryOpacity={0.5}
              />
              <span>{s.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── CONTENU SPÉCIFIQUE AU STUDIO SÉLECTIONNÉ ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Colonne Principale : Le Compositeur Dédié du Studio */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. STUDIO UGC & PUBLICITÉS (Click-to-Ad) */}
          {activeStudio === "ugc" && (
            <div className="p-5 sm:p-6 rounded-2xl border border-[var(--line)] bg-[var(--surf)] space-y-5 shadow-xs">
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--ink)] flex items-center gap-2">
                  <CoolIcon name="link-break" size={16} duotone={false} />
                  <span>1. Extraction du Produit (Click-to-Ad)</span>
                </h2>
                <p className="text-xs text-[var(--mute)] mt-0.5">
                  Importez les données de votre boutique ou collez l'URL d'un produit (Shopify, Amazon, site vitrine).
                </p>
              </div>

              {selectedProduct ? (
                <div className="p-3.5 rounded-xl border border-[var(--ink)]/20 bg-[var(--mn)] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[var(--mute)] uppercase tracking-wider block">Produit actif</span>
                    <strong className="text-sm font-semibold text-[var(--ink)]">{selectedProduct.title}</strong>
                    {selectedProduct.price && (
                      <span className="text-xs font-mono ml-2 text-[var(--mute)]">
                        {selectedProduct.price} {selectedProduct.currency || "€"}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClearProduct}
                    className="text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Changer de produit
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={onOpenProductScraper}
                    className="h-10 px-4 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-medium text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                  >
                    <CoolIcon name="link-break" size={15} duotone={false} />
                    <span>Coller une URL de Produit (Click-to-Ad)</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenBrandKit}
                    className="h-10 px-4 rounded-xl bg-[var(--surf)] border border-[var(--line)] text-[var(--ink)] font-medium text-xs flex items-center justify-center gap-2 hover:border-[var(--ink)]/40 transition-colors cursor-pointer"
                  >
                    <CoolIcon name="image-01" size={15} duotone={false} />
                    <span>Choisir depuis mon Brand Kit</span>
                  </button>
                </div>
              )}

              {/* 2. Format de l'annonce UGC */}
              <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                <label className="text-xs font-semibold text-[var(--ink)] block">
                  2. Format Publicitaire Viral
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "ugc", label: "Avis UGC", desc: "Face caméra parlant" },
                    { id: "unboxing", label: "Unboxing", desc: "Déballage & textures" },
                    { id: "commercial", label: "Spot Promo", desc: "3 temps forts & CTA" },
                    { id: "tryon", label: "Try-On", desc: "Démonstration directe" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setAdFormat(f.id)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all cursor-pointer",
                        adFormat === f.id
                          ? "border-[var(--ink)] bg-[var(--mn)] text-[var(--ink)] font-semibold shadow-xs"
                          : "border-[var(--line)] bg-[var(--surf)] text-[var(--mute)] hover:text-[var(--ink)]"
                      )}
                    >
                      <span className="block text-xs font-medium text-[var(--ink)]">{f.label}</span>
                      <span className="block text-[11px] text-[var(--mute)] mt-0.5">{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Acteur ou Influenceur IA */}
              <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--ink)]">
                    3. Acteur / Influenceur IA (@Personnage)
                  </label>
                  {selectedCharacter && (
                    <button
                      type="button"
                      onClick={onClearCharacter}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Désélectionner
                    </button>
                  )}
                </div>

                {selectedCharacter ? (
                  <div className="p-3 rounded-xl border border-[var(--ink)]/20 bg-[var(--mn)] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-[var(--field)] border border-[var(--line)] flex items-center justify-center text-xs font-semibold">
                        {selectedCharacter.name.charAt(0)}
                      </div>
                      <div>
                        <strong className="text-xs font-semibold text-[var(--ink)]">@{selectedCharacter.name}</strong>
                        <span className="text-[11px] text-[var(--mute)] ml-2">{selectedCharacter.traits?.dressStyle}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenCharacterModal}
                      className="text-xs text-[var(--ink)] font-medium hover:underline cursor-pointer"
                    >
                      Changer
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenCharacterModal}
                    className="h-10 px-4 rounded-xl border border-[var(--line)] bg-[var(--surf)] hover:border-[var(--ink)]/40 w-full flex items-center justify-center gap-2 text-xs font-medium text-[var(--ink)] transition-colors cursor-pointer"
                  >
                    <CoolIcon name="user-01" size={15} duotone={false} />
                    <span>Sélectionner ou créer un Personnage IA (@Soul ID)</span>
                  </button>
                )}
              </div>

              {/* 4. Script et Consignes */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--line)]">
                <label className="text-xs font-semibold text-[var(--ink)] block">
                  4. Pitch & Consignes particulières (Optionnel)
                </label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ex: Le créateur commence par 'J'ai testé cette crème pendant 14 jours...', ton enthousiaste, lumière naturelle..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] placeholder-[var(--mute)] focus:outline-none focus:border-[var(--ink)] resize-none"
                />
              </div>
            </div>
          )}

          {/* 2. STUDIO PERSONNAGES (Soul ID) */}
          {activeStudio === "characters" && (
            <div className="p-5 sm:p-6 rounded-2xl border border-[var(--line)] bg-[var(--surf)] space-y-5 shadow-xs">
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--ink)] flex items-center gap-2">
                  <CoolIcon name="user-01" size={16} duotone={false} />
                  <span>Gestion des Personnages & Influenceurs IA (Soul ID)</span>
                </h2>
                <p className="text-xs text-[var(--mute)] mt-0.5">
                  Concevez des personnages photoréalistes cohérents plan après plan sans entraînement lourd.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg)] flex flex-col items-center justify-center text-center py-8">
                <div className="size-12 rounded-2xl bg-[var(--mn)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] mb-3">
                  <CoolIcon name="user-01" size={24} duotone secondaryColor="currentColor" secondaryOpacity={0.4} />
                </div>
                <h3 className="text-sm font-semibold text-[var(--ink)]">
                  {selectedCharacter ? `@${selectedCharacter.name} sélectionné` : "Aucun personnage actif"}
                </h3>
                <p className="text-xs text-[var(--mute)] max-w-sm mt-1 mb-4">
                  {selectedCharacter
                    ? `Style : ${selectedCharacter.traits?.dressStyle || "Moderne"} · Niche : ${selectedCharacter.traits?.niche || "Généraliste"}`
                    : "Créez une personnalité virtuelle en 19 critères pour garantir la fidélité de ses traits."}
                </p>
                <button
                  type="button"
                  onClick={onOpenCharacterModal}
                  className="h-10 px-5 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-medium text-xs flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                >
                  <CoolIcon name="user-01" size={15} duotone={false} />
                  <span>{selectedCharacter ? "Modifier le Personnage" : "+ Créer un Personnage (19 attributs)"}</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--ink)] block">
                  Action, décor et pose à générer
                </label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ex: Assise dans un café moderne à Milan, travaillant sur un ordinateur portable, lumière douce du matin, plan moyen..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] placeholder-[var(--mute)] focus:outline-none focus:border-[var(--ink)] resize-none"
                />
              </div>
            </div>
          )}

          {/* 3. STUDIO AFFICHES & VISUELS */}
          {activeStudio === "posters" && (
            <div className="p-5 sm:p-6 rounded-2xl border border-[var(--line)] bg-[var(--surf)] space-y-5 shadow-xs">
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--ink)] flex items-center gap-2">
                  <CoolIcon name="file-blank" size={16} duotone={false} />
                  <span>Affiches & Visuels avec Typographie Exacte</span>
                </h2>
                <p className="text-xs text-[var(--mute)] mt-0.5">
                  Conception graphique avec contrôle qualité OCR pour des textes nets et lisibles sans défaut.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--ink)] block">Titre principal</label>
                  <input
                    type="text"
                    value={posterTitle}
                    onChange={(e) => setPosterTitle(e.target.value)}
                    placeholder="Ex: FESTIVAL DE JAZZ"
                    className="w-full h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--ink)] block">Sous-titre / Date</label>
                  <input
                    type="text"
                    value={posterSubtitle}
                    onChange={(e) => setPosterSubtitle(e.target.value)}
                    placeholder="Ex: 24 - 26 JUIN 2026"
                    className="w-full h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--ink)] block">CTA ou Prix</label>
                  <input
                    type="text"
                    value={posterCta}
                    onChange={(e) => setPosterCta(e.target.value)}
                    placeholder="Ex: BILLETTERIE OUVERTE"
                    className="w-full h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--ink)] block">
                  Direction artistique & Ambiance
                </label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ex: Style minimaliste suisse, contrastes forts, typographie géométrique nette, fond sombre texturé..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] placeholder-[var(--mute)] focus:outline-none focus:border-[var(--ink)] resize-none"
                />
              </div>
            </div>
          )}

          {/* 4. AUTRES STUDIOS (SaaS, Assets, Motion) */}
          {(activeStudio === "saas" || activeStudio === "assets" || activeStudio === "motion") && (
            <div className="p-5 sm:p-6 rounded-2xl border border-[var(--line)] bg-[var(--surf)] space-y-5 shadow-xs">
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--ink)] flex items-center gap-2">
                  <CoolIcon name={studio.icon} size={16} duotone={false} />
                  <span>{studio.name}</span>
                </h2>
                <p className="text-xs text-[var(--mute)] mt-0.5">
                  {studio.shortDesc}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--ink)] block">
                  Description du projet
                </label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder={studio.defaultPlaceholder}
                  rows={4}
                  className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] placeholder-[var(--mute)] focus:outline-none focus:border-[var(--ink)] resize-none"
                />
              </div>
            </div>
          )}

          {/* ── BARRE D'ACTION ET DE QUALITÉ ── */}
          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--line)] bg-[var(--surf)] flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Choix Brouillon vs Rendu Final */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[var(--mute)] font-medium">Qualité :</span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--mn)] border border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => onChangeQualityTier("draft")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    qualityTier === "draft"
                      ? "bg-[var(--ink)] text-[var(--bg)] shadow-xs font-semibold"
                      : "text-[var(--mute)] hover:text-[var(--ink)]"
                  )}
                >
                  Brouillon ({studio.supportedModels.draft.credits} cr)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeQualityTier("final")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    qualityTier === "final"
                      ? "bg-[var(--ink)] text-[var(--bg)] shadow-xs font-semibold"
                      : "text-[var(--mute)] hover:text-[var(--ink)]"
                  )}
                >
                  Rendu Final ({studio.supportedModels.final.credits} cr)
                </button>
              </div>
            </div>

            {/* Bouton de génération du Studio */}
            <button
              type="button"
              onClick={handleLaunch}
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-heading font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-md"
            >
              <CoolIcon name="play" size={14} duotone={false} />
              <span>Lancer la création ({currentCost} crédits)</span>
            </button>
          </div>
        </div>

        {/* Colonne Latérale : Gabarits & Conseils du Studio */}
        <div className="lg:col-span-4 space-y-5">
          {/* Bloc Fonctionnalités clés du Studio */}
          <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surf)] space-y-3">
            <h3 className="font-heading text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
              Fonctionnalités de ce Studio
            </h3>
            <ul className="space-y-2 text-xs text-[var(--mute)]">
              {studio.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[var(--ink)] font-bold">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Gabarits / Templates prêts à l'emploi */}
          <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surf)] space-y-3">
            <h3 className="font-heading text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
              Templates suggérés ({studio.name})
            </h3>
            <div className="space-y-2.5">
              {TEMPLATES.filter((t) => t.studioSlug === activeStudio).slice(0, 3).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPromptText(t.promptTemplate)}
                  className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-left hover:border-[var(--ink)]/40 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-semibold text-[var(--ink)] group-hover:text-[var(--ink)]">
                      {t.title}
                    </strong>
                    {t.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--mn)] text-[var(--mute)]">
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--mute)] mt-1 line-clamp-2">
                    {t.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── HISTORIQUE RÉCENT DES CRÉATIONS DE CE STUDIO ── */}
      {recentGenerations.length > 0 && (
        <div className="mt-12 pt-8 border-t border-[var(--line)]">
          <h2 className="font-heading text-lg font-bold text-[var(--ink)] mb-4">
            Créations récentes dans ce Studio
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentGenerations.slice(0, 4).map((card) => (
              <div
                key={card.id}
                onClick={() => onOpenResult(card)}
                className="group relative rounded-xl border border-[var(--line)] overflow-hidden bg-[var(--surf)] cursor-pointer hover:border-[var(--ink)] transition-all shadow-xs"
              >
                {card.mediaUrl ? (
                  <div className="aspect-[9/16] bg-[var(--mn)] overflow-hidden">
                    {card.mode === "video" ? (
                      <video src={card.mediaUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={card.mediaUrl} alt={card.caption} className="w-full h-full object-cover" />
                    )}
                  </div>
                ) : (
                  <div className="aspect-[9/16] bg-[var(--mn)] flex items-center justify-center text-xs text-[var(--mute)]">
                    En cours de création...
                  </div>
                )}
                <div className="p-2.5">
                  <p className="text-xs font-medium text-[var(--ink)] truncate">{card.caption}</p>
                  <span className="text-[11px] font-mono text-[var(--mute)]">{card.modelName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

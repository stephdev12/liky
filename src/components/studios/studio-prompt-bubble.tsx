"use client";

import React, { useRef, useState, useEffect } from "react";
import { CoolIcon, type CoolIconKey } from "@/components/icons/coolicon";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface StudioImageRef {
  id: string;
  name: string;
  url: string;
}

export type StudioSlug = "cinema" | "ad" | "ugc" | "animation";

interface StudioPromptBubbleProps {
  studio: StudioSlug;
  prompt: string;
  setPrompt: (p: string) => void;
  uploadedImages: StudioImageRef[];
  onAddImages: (files: FileList) => void;
  onRemoveImage: (id: string) => void;
  settings: Record<string, any>;
  setSettings: React.Dispatch<React.SetStateAction<any>>;
  onOpenDrawer?: () => void;
  drawerLabel?: string;
  drawerIcon?: CoolIconKey;
  cost: number;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function StudioPromptBubble({
  studio,
  prompt,
  setPrompt,
  uploadedImages,
  onAddImages,
  onRemoveImage,
  settings,
  setSettings,
  onOpenDrawer,
  drawerLabel,
  drawerIcon = "layers",
  cost,
  isGenerating,
  onGenerate,
}: StudioPromptBubbleProps) {
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Détection du token @ pour le popover de mention
  const [atQuery, setAtQuery] = useState<string | null>(null);
  const [atPopoverOpen, setAtPopoverOpen] = useState(false);
  const [listening, setListening] = useState(false);

  // Analyse du texte pour détecter @
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPrompt(text);

    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 130)}px`;

    // Détection de @ en fin de mot
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

  const handleSelectMention = (img: StudioImageRef) => {
    if (!promptInputRef.current) return;
    const text = prompt;
    const cursor = promptInputRef.current.selectionStart || text.length;
    const beforeCursor = text.slice(0, cursor);
    const afterCursor = text.slice(cursor);

    // Remplace le @partiel par @nom
    const replacedBefore = beforeCursor.replace(/(?:^|\s)@([a-zA-Z0-9_-]*)$/, ` @${img.name} `);
    const newText = `${replacedBefore}${afterCursor}`;

    setPrompt(newText);
    setAtPopoverOpen(false);
    setAtQuery(null);

    setTimeout(() => {
      promptInputRef.current?.focus();
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
    }
  };

  // Filtrage des images mentionnables
  const filteredImages = atQuery
    ? uploadedImages.filter((img) => img.name.toLowerCase().includes(atQuery))
    : uploadedImages;

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* ── MODALE / POPOVER DE MENTIONS D'IMAGES (@) ── */}
      {atPopoverOpen && (
        <div className="absolute left-3 bottom-full mb-3 w-80 p-2 rounded-[16px] bg-[var(--surf)] border border-[var(--line)] shadow-overlay z-50 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-[var(--line)]/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--mute)]">
              Mentionner une image (@)
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-medium text-[var(--ink)] hover:underline flex items-center gap-1"
            >
              + Importer
            </button>
          </div>

          {filteredImages.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-[12px] text-[var(--mute)] mb-2">
                {uploadedImages.length === 0
                  ? "Aucune image importée pour l'instant."
                  : "Aucune image ne correspond à cette recherche."}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-[var(--mn)] text-[11.5px] font-medium text-[var(--ink)] hover:bg-[var(--hover)] transition-colors"
              >
                Importer une image
              </button>
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto space-y-1">
              {filteredImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => handleSelectMention(img)}
                  className="w-full flex items-center gap-2.5 p-1.5 rounded-[10px] text-left hover:bg-[var(--mn)] transition-colors group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-[8px] overflow-hidden border border-[var(--line)] bg-black/5 shrink-0">
                    <img src={img.url} alt={img.name} className="size-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-mono font-medium text-[var(--ink)] group-hover:underline">
                      @{img.name}
                    </div>
                    <div className="text-[10.5px] text-[var(--mute)]">
                      Cliquez pour insérer
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CONTENEUR PRINCIPAL DE LA BULLE DE PROMPT ── */}
      <div className="bubble relative w-full overflow-hidden transition-all duration-200 border border-[var(--line)] bg-[var(--surf)] focus-within:border-[var(--line-strong)] focus-within:ring-1 focus-within:ring-[var(--line-strong)] shadow-raised rounded-[22px]">
        {/* VIGNETTES D'IMAGES IMPORTÉES (AU-DESSUS DE LA SAISIE) */}
        {uploadedImages.length > 0 && (
          <div className="flex items-center gap-2 px-3 pt-2.5 pb-1 overflow-x-auto scrollbar-none border-b border-[var(--line)]/50">
            <span className="text-[11px] font-mono text-[var(--mute)] shrink-0">
              Références :
            </span>
            {uploadedImages.map((img) => (
              <div
                key={img.id}
                className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-[var(--mn)] border border-[var(--line)] text-[11px] font-mono shrink-0 select-none group"
              >
                <div className="w-4 h-4 rounded-full overflow-hidden bg-black/10 shrink-0">
                  <img src={img.url} alt="" className="size-full object-cover" />
                </div>
                <span className="text-[var(--ink)] font-medium">@{img.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveImage(img.id)}
                  className="text-[var(--mute)] hover:text-red-500 transition-colors ml-0.5"
                  title="Supprimer la référence"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── ZONE DE SAISIE DU TEXTE ── */}
        <div className="relative flex flex-col p-2">
          <textarea
            ref={promptInputRef}
            rows={2}
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            placeholder={
              studio === "cinema"
                ? "Décrivez le plan cinématique (éclairage, sujet, mouvements… tapez @ pour vos images de référence)"
                : studio === "ad"
                ? "Décrivez l'affiche ou la vidéo publicitaire (offre, message, produit… tapez @ pour vos visuels)"
                : studio === "ugc"
                ? "Décrivez la vidéo UGC (ce que le créateur dit ou présente… tapez @ pour le produit)"
                : "Décrivez l'histoire ou l'action de la scène animée…"
            }
            className="w-full border-0 bg-transparent resize-none outline-none min-h-[44px] max-h-[130px] px-2 py-1 text-[13.5px] sm:text-[14px] leading-relaxed text-[var(--ink)] placeholder:text-[var(--mute)]"
          />

          {/* BARRE D'OUTILS DE LA BULLE : UPLOAD, MENTION & EFFACER */}
          <div className="flex items-center justify-between px-2 pt-1 pb-1 border-t border-[var(--line)]/60 mt-1">
            <div className="flex items-center gap-1 text-[var(--mute)]">
              {/* Bouton Upload Image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-[8px] hover:bg-[var(--mn)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                title="Importer des images de référence"
              >
                <CoolIcon name="paperclip-attechment-tilt" size={15} duotone />
              </button>

              {/* Bouton Mention @ */}
              <button
                type="button"
                onClick={() => {
                  setAtPopoverOpen((o) => !o);
                  setAtQuery("");
                }}
                className={cn(
                  "p-1.5 rounded-[8px] transition-colors cursor-pointer",
                  atPopoverOpen
                    ? "bg-[var(--mn)] text-[var(--ink)]"
                    : "hover:bg-[var(--mn)] hover:text-[var(--ink)]"
                )}
                title="Mentionner une image (@)"
              >
                <CoolIcon name="mention" size={15} duotone />
              </button>

              {/* Bouton Outil Dédié / Drawer (si applicable) */}
              {onOpenDrawer && drawerLabel && (
                <button
                  type="button"
                  onClick={onOpenDrawer}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-[8px] bg-[var(--mn)]/70 hover:bg-[var(--mn)] text-[var(--ink)] text-[11.5px] font-medium transition-colors ml-1 cursor-pointer"
                  title={drawerLabel}
                >
                  <CoolIcon name={drawerIcon} size={14} duotone />
                  <span className="hidden sm:inline">{drawerLabel}</span>
                </button>
              )}
            </div>

            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt("")}
                className="flex items-center gap-1 text-[11px] text-[var(--mute)] hover:text-[var(--ink)] transition-colors cursor-pointer px-1.5 py-0.5 rounded-[6px] hover:bg-[var(--mn)]"
                title="Effacer le texte"
              >
                <CoolIcon name="close-sm" size={12} duotone={false} />
                <span>Effacer</span>
              </button>
            )}
          </div>
        </div>

        {/* ── PUCES & PARAMÈTRES SPÉCIFIQUES AU STUDIO (CHIPS COSS UI) ── */}
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--mn)]/50 border-t border-[var(--line)] gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            {/* PARAMÈTRES CINÉMA STUDIO */}
            {studio === "cinema" && (
              <>
                {/* Modèle Cinéma */}
                <Select
                  value={settings.model || "veo-3-1"}
                  onValueChange={(val) => updateSetting("model", val)}
                >
                  <SelectTrigger className="h-7 text-[11px] font-mono px-2 rounded-[8px] bg-[var(--surf)] border-[var(--line)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="veo-3-1">Google Veo 3.1 (Cinéma Master)</SelectItem>
                    <SelectItem value="seedance-2-5">Seedance 2.5 (Audio natif)</SelectItem>
                    <SelectItem value="kling-3-0">Kling 3.0 Pro</SelectItem>
                    <SelectItem value="minimax-h3">MiniMax Hailuo 3</SelectItem>
                  </SelectPopup>
                </Select>

                {/* Format */}
                <Select
                  value={settings.ratio || "16:9"}
                  onValueChange={(val) => updateSetting("ratio", val)}
                >
                  <SelectTrigger className="h-7 text-[11px] font-mono px-2 rounded-[8px] bg-[var(--surf)] border-[var(--line)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="16:9">16:9 Cinéma</SelectItem>
                    <SelectItem value="2.39:1">2.39:1 Anamorphique Scope</SelectItem>
                    <SelectItem value="9:16">9:16 Vertical</SelectItem>
                  </SelectPopup>
                </Select>

                {/* Durée */}
                <Select
                  value={String(settings.duration || "8")}
                  onValueChange={(val) => updateSetting("duration", Number(val))}
                >
                  <SelectTrigger className="h-7 text-[11px] font-mono px-2 rounded-[8px] bg-[var(--surf)] border-[var(--line)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="5">5 secondes</SelectItem>
                    <SelectItem value="8">8 secondes</SelectItem>
                    <SelectItem value="10">10 secondes</SelectItem>
                    <SelectItem value="15">15 secondes</SelectItem>
                  </SelectPopup>
                </Select>

                {/* Qualité */}
                <Select
                  value={settings.quality || "4K"}
                  onValueChange={(val) => updateSetting("quality", val)}
                >
                  <SelectTrigger className="h-7 text-[11px] font-mono px-2 rounded-[8px] bg-[var(--surf)] border-[var(--line)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="1080p">1080p HD</SelectItem>
                    <SelectItem value="4K">4K Master</SelectItem>
                  </SelectPopup>
                </Select>
              </>
            )}

            {/* PARAMÈTRES AD BUILDER STUDIO */}
            {studio === "ad" && (
              <>
                {/* Type de sortie */}
                <Select
                  value={settings.type || "poster"}
                  onValueChange={(val) => updateSetting("type", val)}
                >
                  <SelectTrigger className="h-7 text-[11px] font-medium px-2 rounded-[8px] bg-[var(--surf)] border-[var(--line)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="poster">Affiche publicitaire (Image)</SelectItem>
                    <SelectItem value="video">Vidéo marketing (Pub)</SelectItem>
                  </SelectPopup>
                </Select>

                {/* Format publicitaire */}
                <Select
                  value={settings.format || (settings.type === "video" ? "9:16" : "1080x1350")}
                  onValueChange={(val) => updateSetting("format", val)}
                >
                  <SelectTrigger className="h-7 text-[11px] font-mono px-2 rounded-[8px] bg-[var(--surf)] border-[var(--line)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    {settings.type === "video" ? (
                      <>
                        <SelectItem value="9:16">9:16 Story / TikTok / Reel</SelectItem>
                        <SelectItem value="4:5">4:5 Feed Instagram / FB</SelectItem>
                        <SelectItem value="16:9">16:9 YouTube / Web</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="1080x1350">1080×1350 Portrait Feed (4:5)</SelectItem>
                        <SelectItem value="1080x1920">1080×1920 Story Plein écran (9:16)</SelectItem>
                        <SelectItem value="1080x1080">1080×1080 Carré classique (1:1)</SelectItem>
                        <SelectItem value="1920x1080">1920×1080 Bannière Web (16:9)</SelectItem>
                      </>
                    )}
                  </SelectPopup>
                </Select>

                {/* Durée si vidéo */}
                {settings.type === "video" && (
                  <Select
                    value={String(settings.duration || "10")}
                    onValueChange={(val) => updateSetting("duration", Number(val))}
                  >
                    <SelectTrigger className="h-7 text-[11px] font-mono px-2 rounded-[8px] bg-[var(--surf)] border-[var(--line)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      <SelectItem value="6">6 secondes</SelectItem>
                      <SelectItem value="10">10 secondes</SelectItem>
                      <SelectItem value="15">15 secondes</SelectItem>
                    </SelectPopup>
                  </Select>
                )}
              </>
            )}

            {/* PARAMÈTRES UGC STUDIO */}
            {studio === "ugc" && (
              <>
                {/* Avatar / Créateur */}
                <Select
                  value={settings.creator || "lea"}
                  onValueChange={(val) => updateSetting("creator", val)}
                >
                  <SelectTrigger className="h-7 text-[11px] font-medium px-2 rounded-[8px] bg-[var(--surf)] border-[var(--line)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="lea">Léa (Beauté & Soins 24 ans)</SelectItem>
                    <SelectItem value="thomas">Thomas (Tech & Gadgets 28 ans)</SelectItem>
                    <SelectItem value="amina">Amina (Mode & Lifestyle 26 ans)</SelectItem>
                    <SelectItem value="marcus">Marcus (Fitness 30 ans)</SelectItem>
                  </SelectPopup>
                </Select>

                {/* Format */}
                <Select
                  value={settings.format || "9:16"}
                  onValueChange={(val) => updateSetting("format", val)}
                >
                  <SelectTrigger className="h-7 text-[11px] font-mono px-2 rounded-[8px] bg-[var(--surf)] border-[var(--line)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="9:16">9:16 Vertical TikTok / Reel</SelectItem>
                    <SelectItem value="16:9">16:9 Horizontal YouTube</SelectItem>
                  </SelectPopup>
                </Select>

                {/* Type de vidéo */}
                <Select
                  value={settings.style || "review"}
                  onValueChange={(val) => updateSetting("style", val)}
                >
                  <SelectTrigger className="h-7 text-[11px] font-medium px-2 rounded-[8px] bg-[var(--surf)] border-[var(--line)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="review">Avis face caméra</SelectItem>
                    <SelectItem value="unboxing">Unboxing immersif</SelectItem>
                    <SelectItem value="tutorial">Démonstration & Try-on</SelectItem>
                  </SelectPopup>
                </Select>

                {/* Langue */}
                <Select
                  value={settings.language || "Français"}
                  onValueChange={(val) => updateSetting("language", val)}
                >
                  <SelectTrigger className="h-7 text-[11px] font-medium px-2 rounded-[8px] bg-[var(--surf)] border-[var(--line)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="Français">Français</SelectItem>
                    <SelectItem value="Anglais">Anglais (US)</SelectItem>
                    <SelectItem value="Espagnol">Espagnol</SelectItem>
                  </SelectPopup>
                </Select>
              </>
            )}

            {/* PARAMÈTRES ANIMATION STUDIO */}
            {studio === "animation" && (
              <>
                {/* Style */}
                <Select
                  value={settings.style || "3d_stylized"}
                  onValueChange={(val) => updateSetting("style", val)}
                >
                  <SelectTrigger className="h-7 text-[11px] font-medium px-2 rounded-[8px] bg-[var(--surf)] border-[var(--line)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="3d_stylized">3D Stylisé (Pixar)</SelectItem>
                    <SelectItem value="2d_anime">2D Anime & Manga</SelectItem>
                    <SelectItem value="stickman">Stickman viral TikTok</SelectItem>
                    <SelectItem value="dark_fantasy">Dark Fantasy</SelectItem>
                  </SelectPopup>
                </Select>

                {/* Format */}
                <Select
                  value={settings.format || "9:16"}
                  onValueChange={(val) => updateSetting("format", val)}
                >
                  <SelectTrigger className="h-7 text-[11px] font-mono px-2 rounded-[8px] bg-[var(--surf)] border-[var(--line)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="9:16">9:16 Vertical TikTok</SelectItem>
                    <SelectItem value="16:9">16:9 Cinématographique</SelectItem>
                  </SelectPopup>
                </Select>

                {/* Durée */}
                <Select
                  value={String(settings.duration || "8")}
                  onValueChange={(val) => updateSetting("duration", Number(val))}
                >
                  <SelectTrigger className="h-7 text-[11px] font-mono px-2 rounded-[8px] bg-[var(--surf)] border-[var(--line)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="5">5 secondes</SelectItem>
                    <SelectItem value="8">8 secondes</SelectItem>
                    <SelectItem value="10">10 secondes</SelectItem>
                  </SelectPopup>
                </Select>
              </>
            )}
          </div>

          {/* ── COÛT & BOUTON ACTION ── */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[11px] font-medium text-[var(--mute)] px-2 py-0.5 rounded-md bg-[var(--surf)] border border-[var(--line)]">
              {cost} cr
            </span>

            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={cn(
                "h-8 px-3.5 rounded-full bg-[#D8FF64] text-[#171717] font-semibold text-[12px]",
                "flex items-center gap-1.5 shadow-sm transition-all cursor-pointer",
                isGenerating || !prompt.trim()
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-[#cbf54a] active:scale-95"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-3 animate-spin text-[#171717]" />
                  <span>Rendu…</span>
                </>
              ) : (
                <>
                  <CoolIcon name="arrow-up-sm" size={13} duotone={false} className="text-[#171717]" />
                  <span>Créer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Input de fichier caché pour l'upload d'images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onAddImages(e.target.files);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}

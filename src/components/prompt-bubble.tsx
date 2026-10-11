"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { CoolIcon, type CoolIconKey } from "@/components/icons/coolicon";
import { cn } from "@/lib/utils";

export const MODELS_CONFIG = {
  image: [
    { id: "soul", n: "Soul", base: 4, q: ["1K", "2K"], qm: [1, 1.6], desc: "Rendu artistique & portraits" },
    { id: "nano", n: "Nano Banana", base: 6, q: ["1K", "2K", "4K"], qm: [1, 1.5, 2.5], desc: "Ultra-fidèle & rapide (Défaut)" },
    { id: "seed", n: "Seedream", base: 5, q: ["2K", "4K"], qm: [1, 1.8], desc: "Haute résolution 4K" },
  ],
  video: [
    { id: "kling", n: "Kling", base: 3, desc: "Mouvements réalistes fluides" },
    { id: "veo", n: "Veo", base: 8, desc: "Qualité cinéma premium" },
    { id: "seedance", n: "Seedance", base: 4, desc: "Marketing & UGC dynamique" },
  ],
};

export const FORMATS: Record<string, string> = {
  "1:1 · Carré": "1:1",
  "9:16 · Vertical": "9:16",
  "16:9 · Paysage": "16:9",
  "4:5 · Portrait": "4:5",
};

export const PLATFORMS: Record<string, string> = {
  TikTok: "9:16",
  "Reels Instagram": "9:16",
  "YouTube Shorts": "9:16",
  Facebook: "4:5",
  YouTube: "16:9",
  LinkedIn: "1:1",
};

export type VideoField = {
  k: string;
  o?: string[];
  t?: string;
  file?: number;
};

export type VideoTypeConfig = {
  n: string;
  d: string;
  ph: string;
  f: VideoField[];
};

export const VTYPES: Record<string, VideoTypeConfig> = {
  ugc: {
    n: "UGC",
    d: "Avis client filmé",
    ph: "Ex. Une cliente présente ma crème de karité et explique pourquoi elle l'adore…",
    f: [
      { k: "Plateforme", o: Object.keys(PLATFORMS) },
      { k: "Avatar", o: ["Femme", "Homme", "Jeune", "Senior"] },
      { k: "Langue", o: ["Français", "Anglais"] },
      { k: "Durée", o: ["10 s", "15 s", "30 s"] },
    ],
  },
  marketing: {
    n: "Marketing",
    d: "Pub produit ou service",
    ph: "Ex. Pub pour mon restaurant à Douala, ambiance chaleureuse, offre du weekend…",
    f: [
      { k: "Plateforme", o: Object.keys(PLATFORMS) },
      { k: "Ton", o: ["Dynamique", "Luxe", "Humoristique", "Sobre"] },
      { k: "Durée", o: ["5 s", "10 s", "15 s"] },
      { k: "Appel à l'action", t: "Ex. Commander maintenant" },
    ],
  },
  animation: {
    n: "Animer une image",
    d: "Donne vie à ta photo",
    ph: "Ex. Le tissu bouge doucement, la lumière change…",
    f: [
      { k: "Image", file: 1 },
      { k: "Mouvement", o: ["Naturel", "Zoom avant", "Zoom arrière", "Rotation", "Travelling"] },
      { k: "Format", o: Object.keys(PLATFORMS) },
      { k: "Durée", o: ["5 s", "10 s"] },
    ],
  },
  saas: {
    n: "Présentation SaaS",
    d: "Démo d'un logiciel",
    ph: "Ex. Présenter mon application de gestion de stock en 3 temps forts…",
    f: [
      { k: "Site du produit", t: "https://…" },
      { k: "Format", o: Object.keys(PLATFORMS) },
      { k: "Style", o: ["Minimal", "Dynamique", "Corporate"] },
      { k: "Durée", o: ["10 s", "15 s", "30 s"] },
    ],
  },
  libre: {
    n: "Libre",
    d: "Tu décides de tout",
    ph: "Décris la scène que tu imagines…",
    f: [
      { k: "Format", o: Object.keys(PLATFORMS) },
      { k: "Style", o: ["Réaliste", "Cinéma", "Animation 3D", "Illustration"] },
      { k: "Audio", o: ["Avec son", "Sans son"] },
      { k: "Durée", o: ["5 s", "10 s", "15 s"] },
    ],
  },
};

const SOURCES: { key: string; name: string; desc: string; iconName: CoolIconKey }[] = [
  { key: "attach", name: "Photos & fichiers", desc: "Importer depuis votre appareil", iconName: "paperclip-attechment-tilt" },
  { key: "scoop", name: "Données de vente", desc: "Métriques, churn et clients", iconName: "chart-bar-vertical-01" },
  { key: "flavors", name: "Catalogue produits", desc: "Fiches et références", iconName: "layers" },
  { key: "web", name: "Recherche web", desc: "Infos en direct et tendances", iconName: "planet" },
];

const COMMANDS: { key: string; name: string; desc: string; iconName: CoolIconKey }[] = [
  { key: "compare", name: "/comparer", desc: "Comparer avec la saison passée", iconName: "chart-bar-vertical-01" },
  { key: "churn-plan", name: "/plan-fidelite", desc: "Générer un calendrier d'offres", iconName: "folder-document" },
  { key: "restock", name: "/reassort", desc: "Établir un bon de commande", iconName: "layers" },
  { key: "draft-email", name: "/email-client", desc: "Rédiger un email commercial", iconName: "folder-document" },
  { key: "summarize", name: "/resumer", desc: "Synthétiser la discussion", iconName: "folder-document" },
];

function parseToken(text: string): { kind: "at" | "slash"; query: string; start: number } | null {
  const match = /(^|\s)([@/])([\w-]*)$/.exec(text);
  if (!match) return null;
  return {
    kind: match[2] === "@" ? "at" : "slash",
    query: match[3].toLowerCase(),
    start: match.index + match[1].length,
  };
}

interface PromptBubbleProps {
  mode: "image" | "video" | "music" | "voice";
  vt: string | null;
  setVt: (vt: string | null) => void;
  vals: Record<string, string>;
  setVals: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onGenerate: () => void;
  cost: number;
  glimmRef: React.RefObject<HTMLCanvasElement | null>;
  isShrunk?: boolean;
  setIsShrunk?: (shrunk: boolean) => void;
}

export function PromptBubble({
  mode,
  vt,
  setVt,
  vals,
  setVals,
  onGenerate,
  cost,
  glimmRef,
  isShrunk: externalShrunk,
  setIsShrunk: externalSetIsShrunk,
}: PromptBubbleProps) {
  const [internalShrunk, setInternalShrunk] = useState(false);
  const isShrunk = externalShrunk !== undefined ? externalShrunk : internalShrunk;
  const setIsShrunk = externalSetIsShrunk || setInternalShrunk;
  const [listening, setListening] = useState(false);
  const [dynamicModels, setDynamicModels] = useState<
    Array<{ id: string; name: string; baseCost: number; tagline: string }>
  >([]);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/models?tool=${mode}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success && Array.isArray(data.models) && data.models.length > 0) {
          setDynamicModels(
            data.models.map((m: { id: string; name: string; baseCost: number; tagline: string }) => ({
              id: m.id,
              name: m.name,
              baseCost: m.baseCost,
              tagline: m.tagline,
            }))
          );
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [mode]);

  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = parseToken(vals.prompt || "");
  const tokenRows =
    token?.kind === "at"
      ? SOURCES.filter((s) => s.name.toLowerCase().includes(token.query))
      : token?.kind === "slash"
      ? COMMANDS.filter((c) => c.name.slice(1).startsWith(token.query))
      : [];

  const handleSelectToken = (item: { name: string }) => {
    if (!token) return;
    const before = (vals.prompt || "").slice(0, token.start);
    const after = (vals.prompt || "").slice(token.start + token.query.length + 1);
    const insert = `${item.name} `;
    setVals((prev) => ({ ...prev, prompt: `${before}${insert}${after}` }));
    promptInputRef.current?.focus();
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setVals((prev) => ({ ...prev, prompt: v }));
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onGenerate();
    }
  };

  const toggleDictation = () => {
    if (listening) {
      setListening(false);
      return;
    }
    setListening(true);
    setTimeout(() => {
      setVals((prev) => ({
        ...prev,
        prompt: prev.prompt
          ? `${prev.prompt.trimEnd()} Présenter notre offre en 15 secondes`
          : "Présenter notre offre en 15 secondes",
      }));
      setListening(false);
      promptInputRef.current?.focus();
    }, 1800);
  };

  const imageModelList =
    dynamicModels.length > 0 && mode === "image"
      ? dynamicModels
      : MODELS_CONFIG.image.map((m) => ({ id: m.id, name: m.n, baseCost: m.base, tagline: m.desc }));

  const videoModelList =
    dynamicModels.length > 0 && mode === "video"
      ? dynamicModels
      : MODELS_CONFIG.video.map((m) => ({ id: m.id, name: m.n, baseCost: m.base, tagline: m.desc }));

  const currentModel =
    mode === "image"
      ? imageModelList.find((m) => m.id === vals.model) || imageModelList[0]
      : videoModelList.find((m) => m.id === vals.vmodel) || videoModelList[0];

  /* ── VERSION RÉDUITE (SHRUNK / PILL MODE) ── */
  if (isShrunk) {
    return (
      <div
        onClick={() => {
          setIsShrunk(false);
          setTimeout(() => promptInputRef.current?.focus(), 60);
        }}
        className={cn(
          "bubble-shrunk relative w-full flex items-center justify-between gap-3 h-12 px-4 py-2",
          "border border-[var(--line)] bg-[var(--surf)]/95 backdrop-blur-md shadow-raised rounded-full",
          "cursor-pointer hover:border-[var(--line-strong)] hover:shadow-overlay transition-all duration-200 select-none",
          "animate-in fade-in zoom-in-95"
        )}
      >
        <canvas
          ref={glimmRef}
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-full"
          aria-hidden="true"
        />

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--mn)] text-[var(--ink)] border border-[var(--line)] shrink-0">
            <CoolIcon
              name={
                mode === "image"
                  ? "image-01"
                  : mode === "video"
                  ? "camera"
                  : mode === "music"
                  ? "headphones"
                  : "user-voice"
              }
              size={15}
              duotone
              secondaryColor="var(--lime)"
              secondaryOpacity={0.45}
            />
          </div>
          <span className="text-[13px] font-medium text-[var(--ink)] truncate">
            {vals.prompt ? (
              vals.prompt
            ) : (
              <span className="text-[var(--mute)]">
                {mode === "image"
                  ? "Décris ton image… (clique pour créer)"
                  : mode === "video"
                  ? "Décris ta vidéo… (clique pour créer)"
                  : mode === "music"
                  ? "Décris ta musique… (clique pour créer)"
                  : "Saisis ton texte pour la voix off…"}
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11.5px] font-semibold text-[var(--mute)] bg-[var(--mn)] px-2.5 py-1 rounded-full border border-[var(--line)]">
            {cost} cr
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsShrunk(false);
              setTimeout(() => promptInputRef.current?.focus(), 60);
            }}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-[#D8FF64] text-[#171717] font-semibold text-[12px] shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <CoolIcon name="expand" duotone size={13} secondaryColor="#171717" />
            <span>Créer</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bubble relative w-full overflow-hidden transition-all duration-200 border border-[var(--line)] bg-[var(--surf)] focus-within:border-[var(--line-strong)] focus-within:ring-1 focus-within:ring-[var(--line-strong)] shadow-raised rounded-[22px]">
      {/* ── CANVAS DE BALAYAGE GLIMM LIME ── */}
      <canvas
        ref={glimmRef}
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-[22px]"
        aria-hidden="true"
      />

      {/* ── POPUP D'AUTOCOMPLÉTION COSS POUR @ ET / ── */}
      {token && tokenRows.length > 0 && (
        <div className="absolute left-3 bottom-full mb-2 w-72 p-1.5 rounded-[14px] bg-[var(--surf)] border border-[var(--line)] shadow-overlay z-40 animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--mute)]">
            {token.kind === "at" ? "Sources de données" : "Commandes rapides"}
          </div>
          <div className="max-h-52 overflow-y-auto space-y-0.5">
            {tokenRows.map((row) => {
              return (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => handleSelectToken(row)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-left text-[12.5px] transition-colors hover:bg-[var(--mn)] cursor-pointer text-[var(--ink)]"
                >
                  <span className="p-1 rounded-[7px] bg-[var(--hover)] text-[var(--ink)] shrink-0">
                    <CoolIcon name={row.iconName} size={15} duotone />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium leading-tight">{row.name}</div>
                    <div className="text-[11px] text-[var(--mute)] truncate">{row.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ZONE DE SAISIE DU PROMPT AVEC CONTRÔLES D'APPOINT ── */}
      <div className="relative flex flex-col p-2">
        <textarea
          ref={promptInputRef}
          id="prompt"
          rows={2}
          value={vals.prompt || ""}
          onChange={handlePromptChange}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "image"
              ? "Décris l'image que tu veux générer… (tape @ pour des sources, / pour des commandes)"
              : mode === "music"
              ? "Décris la musique : ambiance, rythme, instruments, BPM…"
              : mode === "voice"
              ? "Écris le texte que tu souhaites convertir en voix off humaine…"
              : vt
              ? VTYPES[vt]?.ph
              : "Décris ta création…"
          }
          className="w-full border-0 bg-transparent resize-none outline-none min-h-[48px] max-h-[140px] px-2 py-1 text-[14px] leading-relaxed text-[var(--ink)] placeholder:text-[var(--mute)]"
        />

        {/* Barre d'outils secondaire intégrée à la saisie */}
        <div className="flex items-center justify-between px-2 pt-1 pb-1 border-t border-[var(--line)]/60 mt-1">
          <div className="flex items-center gap-1 text-[var(--mute)]">
            <button
              type="button"
              onClick={() => {
                setVals((p) => ({ ...p, prompt: `${p.prompt || ""} @` }));
                promptInputRef.current?.focus();
              }}
              className="p-1.5 rounded-[8px] hover:bg-[var(--mn)] hover:text-[var(--ink)] transition-colors"
              title="Ajouter une source (@)"
            >
              <CoolIcon name="mention" size={15} duotone />
            </button>
            <button
              type="button"
              onClick={() => {
                setVals((p) => ({ ...p, prompt: `${p.prompt || ""} /` }));
                promptInputRef.current?.focus();
              }}
              className="p-1.5 rounded-[8px] hover:bg-[var(--mn)] hover:text-[var(--ink)] transition-colors"
              title="Exécuter une commande (/)"
            >
              <CoolIcon name="command" size={15} duotone />
            </button>
            <button
              type="button"
              onClick={toggleDictation}
              className={cn(
                "p-1.5 rounded-[8px] transition-colors",
                listening
                  ? "bg-[var(--lime)] text-[#171717] animate-pulse"
                  : "hover:bg-[var(--mn)] hover:text-[var(--ink)]"
              )}
              title="Dicter le prompt à voix haute"
            >
              <CoolIcon
                name="user-voice"
                size={15}
                duotone
                secondaryColor={listening ? "#171717" : "currentColor"}
              />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {vals.prompt && (
              <button
                type="button"
                onClick={() => setVals((p) => ({ ...p, prompt: "" }))}
                className="flex items-center gap-1 text-[11px] text-[var(--mute)] hover:text-[var(--ink)] transition-colors cursor-pointer px-1.5 py-0.5 rounded-[6px] hover:bg-[var(--mn)]"
                title="Effacer le texte du prompt"
              >
                <CoolIcon name="close-sm" size={13} duotone={false} />
                Effacer
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsShrunk(true)}
              className="flex items-center gap-1 text-[11px] text-[var(--mute)] hover:text-[var(--ink)] transition-colors cursor-pointer px-2 py-0.5 rounded-[6px] hover:bg-[var(--mn)] border border-[var(--line)]"
              title="Réduire la bulle pour libérer la vue du board"
            >
              <CoolIcon name="chevron-down" size={13} duotone={false} />
              <span>Réduire</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── LIGNE DES DROPDOWNS COSS & ACTION DE GÉNÉRATION ── */}
      <div className="row flex flex-wrap items-center justify-between gap-2.5 px-3 pb-2.5 pt-1">
        <div className="chips flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* ════ MODE IMAGE : DROPDOWNS COSS ════ */}
          {mode === "image" && (
            <>
              {/* Select Modèle Coss */}
              <Select
                value={vals.model || "nano"}
                onValueChange={(val) => val && setVals((p) => ({ ...p, model: val }))}
              >
                <SelectTrigger label="Modèle">
                  <SelectValue placeholder="Modèle" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectLabel>Modèles d'image</SelectLabel>
                  {imageModelList.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex flex-col">
                        <span>{m.name} · <span className="font-semibold text-[var(--mute)]">{m.baseCost} cr</span></span>
                        <span className="text-[11px] text-[var(--mute)] font-normal">{m.tagline}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>

              {/* Select Format Coss */}
              <Select
                value={vals.format || "1:1 · Carré"}
                onValueChange={(val) => val && setVals((p) => ({ ...p, format: val }))}
              >
                <SelectTrigger label="Format">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectLabel>Ratios d'affichage</SelectLabel>
                  {Object.keys(FORMATS).map((fmt) => (
                    <SelectItem key={fmt} value={fmt}>
                      {fmt}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>

              {/* Select Nombre Coss */}
              <Select
                value={vals.count || "1"}
                onValueChange={(val) => val && setVals((p) => ({ ...p, count: val }))}
              >
                <SelectTrigger label="Nombre">
                  <SelectValue placeholder="Nombre" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectLabel>Quantité générée</SelectLabel>
                  {["1", "2", "3", "4"].map((cnt) => (
                    <SelectItem key={cnt} value={cnt}>
                      {cnt} {cnt === "1" ? "image" : "images"}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>

              {/* Select Qualité Coss */}
              <Select
                value={vals.qual || "1K"}
                onValueChange={(val) => val && setVals((p) => ({ ...p, qual: val }))}
              >
                <SelectTrigger label="Qualité">
                  <SelectValue placeholder="Qualité" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectLabel>Résolution de sortie</SelectLabel>
                  {(
                    MODELS_CONFIG.image.find((x) => x.id === vals.model)?.q || ["1K", "2K"]
                  ).map((q) => (
                    <SelectItem key={q} value={q}>
                      {q}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>

              {/* Select Style Coss */}
              <Select
                value={vals.style || "Photo réaliste"}
                onValueChange={(val) => val && setVals((p) => ({ ...p, style: val }))}
              >
                <SelectTrigger label="Style">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectLabel>Direction artistique</SelectLabel>
                  {["Photo réaliste", "Produit", "Portrait", "Illustration", "3D", "Affiche"].map(
                    (st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    )
                  )}
                </SelectPopup>
              </Select>
            </>
          )}

          {/* ════ MODE MUSIQUE : DROPDOWNS COSS ════ */}
          {mode === "music" && (
            <>
              {/* Select Genre */}
              <Select
                value={vals.Genre || "Afrobeat"}
                onValueChange={(val) => val && setVals((p) => ({ ...p, Genre: val }))}
              >
                <SelectTrigger label="Genre">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectLabel>Style musical</SelectLabel>
                  {["Afrobeat", "Amapiano", "Pop", "Lo-fi", "Cinématique", "Gospel"].map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>

              {/* Select Durée */}
              <Select
                value={vals.MDurée || "30 s"}
                onValueChange={(val) => val && setVals((p) => ({ ...p, MDurée: val }))}
              >
                <SelectTrigger label="Durée">
                  <SelectValue placeholder="Durée" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectLabel>Longueur de la piste</SelectLabel>
                  {["15 s", "30 s", "60 s"].map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>

              {/* Select Voix / Instrumental */}
              <Select
                value={vals.Vocal || "Instrumental"}
                onValueChange={(val) => val && setVals((p) => ({ ...p, Vocal: val }))}
              >
                <SelectTrigger label="Vocal">
                  <SelectValue placeholder="Vocal" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectLabel>Présence de voix</SelectLabel>
                  {["Instrumental", "Avec voix"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </>
          )}

          {/* ════ MODE VOIX OFF : DROPDOWNS COSS ════ */}
          {mode === "voice" && (
            <>
              {/* Select Type de Voix */}
              <Select
                value={vals.Voix || "Femme chaleureuse"}
                onValueChange={(val) => val && setVals((p) => ({ ...p, Voix: val }))}
              >
                <SelectTrigger label="Voix">
                  <SelectValue placeholder="Voix" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectLabel>Acteur vocal</SelectLabel>
                  {["Femme chaleureuse", "Homme posé", "Jeune dynamique", "Narrateur"].map((vx) => (
                    <SelectItem key={vx} value={vx}>
                      {vx}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>

              {/* Select Langue */}
              <Select
                value={vals.Langue || "Français"}
                onValueChange={(val) => val && setVals((p) => ({ ...p, Langue: val }))}
              >
                <SelectTrigger label="Langue">
                  <SelectValue placeholder="Langue" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectLabel>Langue de diction</SelectLabel>
                  {["Français", "Anglais"].map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>

              {/* Select Vitesse */}
              <Select
                value={vals.Vitesse || "Normale"}
                onValueChange={(val) => val && setVals((p) => ({ ...p, Vitesse: val }))}
              >
                <SelectTrigger label="Vitesse">
                  <SelectValue placeholder="Vitesse" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectLabel>Débit d'élocution</SelectLabel>
                  {["Normale", "Lente", "Rapide"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </>
          )}

          {/* ════ MODE VIDÉO (AVEC TYPE CHOISI) : DROPDOWNS COSS ════ */}
          {mode === "video" && vt && (
            <>
              {/* Badge type avec suppression */}
              <button
                type="button"
                onClick={() => setVt(null)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[12px] bg-[var(--ink)] text-[var(--bg)] text-[12.5px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                title="Changer de préréglage vidéo"
              >
                <span>{VTYPES[vt]?.n}</span>
                <span className="text-[10px] opacity-70">✕</span>
              </button>

              {/* Select Modèle Vidéo */}
              <Select
                value={vals.vmodel || "kling"}
                onValueChange={(val) => val && setVals((p) => ({ ...p, vmodel: val }))}
              >
                <SelectTrigger label="Modèle">
                  <SelectValue placeholder="Modèle vidéo" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectLabel>Moteurs vidéo</SelectLabel>
                  {videoModelList.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex flex-col">
                        <span>{m.name} · <span className="font-semibold text-[var(--mute)]">{m.baseCost} cr/s</span></span>
                        <span className="text-[11px] text-[var(--mute)] font-normal">{m.tagline}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>

              {/* Champs dynamiques du sous-type vidéo */}
              {VTYPES[vt]?.f.map((fld) => {
                if (fld.o) {
                  return (
                    <Select
                      key={fld.k}
                      value={vals[fld.k] || fld.o[0]}
                      onValueChange={(val) => val && setVals((p) => ({ ...p, [fld.k]: val }))}
                    >
                      <SelectTrigger label={fld.k}>
                        <SelectValue placeholder={fld.k} />
                      </SelectTrigger>
                      <SelectPopup>
                        <SelectLabel>{fld.k}</SelectLabel>
                        {fld.o.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectPopup>
                    </Select>
                  );
                }

                if (fld.t) {
                  return (
                    <div
                      key={fld.k}
                      className="inline-flex items-center h-8 gap-1.5 px-3 rounded-[12px] bg-[var(--mn)] text-[var(--ink)] border border-[var(--line)] focus-within:border-[var(--ink)] focus-within:ring-2 focus-within:ring-[var(--lime)] transition-all"
                    >
                      <span className="text-[var(--mute)] font-normal text-[12px]">{fld.k}</span>
                      <input
                        type="text"
                        placeholder={fld.t}
                        value={vals[fld.k] || ""}
                        onChange={(e) => setVals((p) => ({ ...p, [fld.k]: e.target.value }))}
                        className="bg-transparent border-0 outline-none text-[12.5px] font-medium text-[var(--ink)] w-32 placeholder:text-[var(--mute)]"
                      />
                    </div>
                  );
                }

                if (fld.file) {
                  return (
                    <label
                      key={fld.k}
                      className="inline-flex items-center h-8 gap-1.5 px-3 rounded-[12px] bg-[var(--mn)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--line-strong)] hover:bg-[var(--hover)] cursor-pointer select-none transition-all"
                    >
                      <CoolIcon name="paperclip-attechment-tilt" size={15} duotone className="text-[var(--mute)]" />
                      <span className="text-[12.5px] font-medium text-[var(--ink)] max-w-[140px] truncate">
                        {vals.fileName || "Ajouter une image"}
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setVals((p) => ({ ...p, fileName: f.name.slice(0, 18) }));
                          }
                        }}
                      />
                    </label>
                  );
                }

                return null;
              })}
            </>
          )}
        </div>

        {/* ════ BOUTON GÉNÉRER HAUTE VISIBILITÉ (LIGHT + DARK THEME) ════ */}
        <button
          type="button"
          id="go"
          onClick={onGenerate}
          className="go shrink-0 flex items-center justify-center gap-2 h-[38px] px-5 rounded-[14px] font-semibold text-[13.5px] cursor-pointer select-none transition-all duration-150 active:scale-[0.98]"
          style={{
            backgroundColor: "#D8FF64",
            color: "#171717",
            boxShadow: "0 2px 12px rgba(216, 255, 100, 0.35)",
          }}
        >
          <CoolIcon
            name="bulb"
            size={16}
            duotone
            secondaryColor="#171717"
            secondaryOpacity={0.25}
            className="text-[#171717]"
          />
          <span>Générer</span>
          <span
            className="px-2 py-0.5 rounded-full font-bold text-[11.5px] tracking-tight"
            style={{
              backgroundColor: "rgba(23, 23, 23, 0.12)",
              color: "#171717",
            }}
          >
            {cost} cr
          </span>
        </button>
      </div>
    </div>
  );
}

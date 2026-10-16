"use client";

import React, { useState, useRef } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { cn } from "@/lib/utils";

interface GenjutsuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateMotion: (data: {
    mode: "motion" | "swap";
    videoUrl?: string;
    imageUrls: string[];
    prompt?: string;
    quality: string;
  }) => void;
}

export function GenjutsuDrawer({
  isOpen,
  onClose,
  onGenerateMotion,
}: GenjutsuDrawerProps) {
  const [tab, setTab] = useState<"motion" | "swap">("motion");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoName, setVideoName] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [quality, setQuality] = useState<"720p" | "1080p" | "4K">("720p");
  const [promptEnabled, setPromptEnabled] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string>("Cinematic 35mm");
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [freeGens, setFreeGens] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const presets = [
    { id: "p1", name: "High Fashion Runway Walk", duration: "8s", url: "/assets/studios/studio-cinema.jpg" },
    { id: "p2", name: "Viral TikTok Street Dance", duration: "12s", url: "/assets/studios/studio-ugc.jpg" },
    { id: "p3", name: "Martial Arts Dynamic Kick", duration: "6s", url: "/assets/studios/studio-animation.jpg" },
    { id: "p4", name: "Close-up Talking & Emotes", duration: "10s", url: "/assets/studios/studio-ad-builder.jpg" },
  ];

  const styles = [
    { id: "s1", name: "Cinematic 35mm", desc: "Grain argentique, éclairage volumétrique doux" },
    { id: "s2", name: "Cyberpunk Neon", desc: "Néons vibrants, reflets pluvieux et reflets futuristes" },
    { id: "s3", name: "Anime Makoto Shinkai", desc: "Ciels célestes peints à la main et lumière dorée" },
    { id: "s4", name: "Hyperreal Studio 8K", desc: "Piqué ultra-détaillé et textures réelles de peau" },
  ];

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoName(file.name);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls: string[] = [];
      Array.from(files).forEach((file) => {
        urls.push(URL.createObjectURL(file));
      });
      setSelectedImages((prev) => [...prev, ...urls].slice(0, 30));
    }
  };

  const handleLaunch = () => {
    setIsSubmitting(true);
    onGenerateMotion({
      mode: tab,
      videoUrl: videoUrl || presets[0].url,
      imageUrls: selectedImages.length > 0 ? selectedImages : ["/assets/studios/studio-ugc.jpg"],
      prompt: promptEnabled ? prompt : undefined,
      quality,
    });
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-[490px] h-[92vh] sm:h-screen bg-[var(--surface)] text-[var(--ink)] border-t sm:border-t-0 sm:border-l border-[var(--line)] shadow-2xl z-50 flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)] shrink-0">
          <div className="w-8" />
          <h2 className="font-heading text-[16px] font-semibold text-[var(--ink)] tracking-tight">
            likyAI Genjutsu
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--field)] hover:bg-[var(--hover)] flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          >
            <CoolIcon name="close-md" size={16} duotone={false} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-[13px] scrollbar-thin">
          
          {/* Top Video Motion Banner */}
          <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-black border border-[var(--line)] flex items-center justify-between px-5 shadow-lg group">
            <img
              src="/assets/studios/studio-cinema.jpg"
              alt="Genjutsu background"
              className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="relative z-10 max-w-[240px]">
              <span className="font-heading text-[20px] font-extrabold text-[#D8FF64] tracking-tight block drop-shadow-md">
                LIKYAI GENJUTSU
              </span>
              <span className="text-[11px] text-white/90 block mt-0.5 leading-snug">
                Extract motion from any video and retarget to your assets
              </span>
            </div>

            <button
              type="button"
              onClick={() => setHowItWorksOpen(true)}
              className="relative z-10 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <span>How it works?</span>
            </button>
          </div>

          {/* Mode Tabs: Motion transfer vs Objects swap */}
          <div className="p-1 rounded-full bg-[var(--field)] border border-[var(--line)] grid grid-cols-2 text-[12px] font-medium">
            <button
              type="button"
              onClick={() => setTab("motion")}
              className={cn(
                "py-2 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2",
                tab === "motion"
                  ? "bg-[var(--ink)] text-[var(--bg)] font-semibold shadow-md"
                  : "text-[var(--ink-2)] hover:text-[var(--ink)]"
              )}
            >
              <CoolIcon name="monitor-play" size={14} duotone={false} />
              <span>Motion transfer</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("swap")}
              className={cn(
                "py-2 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2",
                tab === "swap"
                  ? "bg-[var(--ink)] text-[var(--bg)] font-semibold shadow-md"
                  : "text-[var(--ink-2)] hover:text-[var(--ink)]"
              )}
            >
              <CoolIcon name="layers" size={14} duotone={false} />
              <span>Objects swap</span>
            </button>
          </div>

          {/* Style Selector Pill */}
          <div
            onClick={() => setStyleModalOpen(true)}
            className="flex items-center justify-between p-3 rounded-2xl bg-[var(--field)] border border-[var(--line)] hover:border-[var(--line-strong)] hover:bg-[var(--hover)] cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center">
                <CoolIcon name="star" size={16} duotone secondaryColor="#D8FF64" className="text-neutral-900 dark:text-[#D8FF64]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-medium text-[var(--ink)]">Style</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#D8FF64]/20 text-neutral-900 dark:text-[#D8FF64] text-[9.5px] font-bold">NEW</span>
                </div>
                <span className="text-[11px] text-[var(--ink-3)]">{selectedStyle}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11.5px] text-[var(--ink-2)] hover:text-[var(--ink)]">
              <span>Apply</span>
              <CoolIcon name="chevron-down" size={12} duotone={false} className="-rotate-90 text-[var(--ink-3)]" />
            </div>
          </div>

          {/* Card 1: Add reference video to extract motion */}
          <div className="p-4 rounded-2xl bg-[var(--field)] border border-[var(--line)] space-y-3">
            <div className="flex flex-col items-center justify-center text-center py-2">
              <div className="w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center mb-2.5">
                <CoolIcon name="camera" size={22} duotone secondaryColor="#D8FF64" className="text-[var(--ink)]" />
              </div>
              <span className="text-[13px] font-medium text-[var(--ink)] block">
                Add reference video to extract motion
              </span>
              <span className="text-[11px] text-[var(--ink-3)] block mt-0.5">
                Video duration: 4–30 seconds
              </span>
            </div>

            {videoUrl ? (
              <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line-strong)] flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <CoolIcon name="monitor-play" size={16} duotone className="text-neutral-900 dark:text-[#D8FF64] shrink-0" />
                  <span className="text-[12px] text-[var(--ink)] truncate">{videoName || "Vidéo sélectionnée"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVideoUrl("");
                    setVideoName("");
                  }}
                  className="text-xs text-[var(--ink-3)] hover:text-[var(--ink)] ml-2 shrink-0 cursor-pointer"
                >
                  Retirer
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full py-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--line)] text-[var(--ink)] text-[12px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CoolIcon name="folder-upload" size={15} duotone={false} />
                  <span>Importer un fichier MP4/WebM</span>
                </button>

                <div className="pt-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)] block mb-2 text-center">
                    Ou sélectionner un preset
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setVideoUrl(p.url);
                          setVideoName(p.name);
                        }}
                        className="p-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--line)] text-left transition-colors cursor-pointer group"
                      >
                        <span className="text-[11px] font-medium text-[var(--ink)] group-hover:text-emerald-600 dark:group-hover:text-[#D8FF64] block truncate">
                          {p.name}
                        </span>
                        <span className="text-[9.5px] text-[var(--ink-3)] font-mono">{p.duration}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
            />
          </div>

          {/* Card 2: Add your characters, products or clothes */}
          <div className="p-4 rounded-2xl bg-[var(--field)] border border-[var(--line)] space-y-3">
            <div className="flex flex-col items-center justify-center text-center py-2">
              {/* 3 Circular Icons */}
              <div className="flex items-center -space-x-2 mb-2.5">
                <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center z-10 shadow-md">
                  <CoolIcon name="user-01" size={18} duotone className="text-[var(--ink-2)]" />
                </div>
                <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center z-20 shadow-md">
                  <CoolIcon name="shopping-bag-01" size={18} duotone className="text-neutral-900 dark:text-[#D8FF64]" />
                </div>
                <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center z-30 shadow-md">
                  <CoolIcon name="download-package" size={18} duotone className="text-[var(--ink-2)]" />
                </div>
              </div>

              <span className="text-[13px] font-medium text-[var(--ink)] block">
                Add your characters, products or clothes
              </span>
              <span className="text-[11px] text-[var(--ink-3)] block mt-0.5">
                Up to 30 images
              </span>
            </div>

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-1">
                {selectedImages.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--surface)]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setSelectedImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white/70 hover:text-white"
                    >
                      <CoolIcon name="close-sm" size={10} duotone={false} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="w-full py-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--line)] text-[var(--ink)] text-[12px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CoolIcon name="add-plus" size={15} duotone={false} />
              <span>Ajouter des images ({selectedImages.length}/30)</span>
            </button>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Toggle: Prompt */}
          <div className="p-3.5 rounded-2xl bg-[var(--field)] border border-[var(--line)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-[var(--ink)]">Prompt</span>
              <input
                type="checkbox"
                checked={promptEnabled}
                onChange={(e) => setPromptEnabled(e.target.checked)}
                className="accent-[#D8FF64] size-4 cursor-pointer"
              />
            </div>
            {promptEnabled && (
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Consignes précises de mouvement ou d'éclairage..."
                className="w-full p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[12px] text-[var(--ink)] resize-none outline-none focus:border-[#D8FF64]"
              />
            )}
          </div>

          {/* Row: Quality Selection */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--field)] border border-[var(--line)]">
            <div>
              <span className="text-[12.5px] font-medium text-[var(--ink)] block">Quality</span>
              <span className="text-[11px] text-[var(--ink-3)]">{quality}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {(["720p", "1080p", "4K"] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer",
                    quality === q
                      ? "bg-[#D8FF64] text-black font-semibold shadow-xs"
                      : "bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)]"
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Bar: Free gens toggle + Big Lime Generate button */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface)] space-y-2.5 shrink-0">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--ink-2)]">
              <CoolIcon name="star" size={13} duotone secondaryColor="#D8FF64" className="text-neutral-900 dark:text-[#D8FF64]" />
              <span>Free Gens: 1 left ⓘ</span>
            </div>
            <input
              type="checkbox"
              checked={freeGens}
              onChange={(e) => setFreeGens(e.target.checked)}
              className="accent-[#D8FF64] size-4 cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={handleLaunch}
            disabled={isSubmitting}
            className="w-full h-11 rounded-full bg-[#D8FF64] hover:bg-[#cbf54a] text-black font-bold text-[14px] flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <CoolIcon name="loading" size={16} className="animate-spin text-black" duotone={false} />
                <span>Extracting Motion & Rendering…</span>
              </>
            ) : (
              <>
                <span>Generate</span>
                <CoolIcon name="star" size={15} duotone={false} className="text-black" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Style Picker */}
      {styleModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-[24px] bg-[var(--surface)] border border-[var(--line)] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <h3 className="font-heading text-sm font-semibold text-[var(--ink)]">Select Motion Style</h3>
              <button
                type="button"
                onClick={() => setStyleModalOpen(false)}
                className="text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer"
              >
                <CoolIcon name="close-md" size={14} duotone={false} />
              </button>
            </div>
            <div className="space-y-2">
              {styles.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSelectedStyle(s.name);
                    setStyleModalOpen(false);
                  }}
                  className={cn(
                    "w-full p-3 rounded-xl border text-left transition-all cursor-pointer",
                    selectedStyle === s.name
                      ? "bg-[var(--hover)] border-neutral-900 dark:border-[#D8FF64] text-[var(--ink)] ring-1 ring-neutral-900 dark:ring-[#D8FF64]"
                      : "bg-[var(--field)] border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--hover)] hover:text-[var(--ink)]"
                  )}
                >
                  <span className="text-[12.5px] font-semibold block">{s.name}</span>
                  <span className="text-[11px] text-[var(--ink-3)] block mt-0.5">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How it works Dialog */}
      {howItWorksOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[24px] bg-[var(--surface)] border border-[var(--line)] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <h3 className="font-heading text-base font-semibold text-[var(--ink)]">
                How likyAI Genjutsu Works
              </h3>
              <button
                type="button"
                onClick={() => setHowItWorksOpen(false)}
                className="text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer"
              >
                <CoolIcon name="close-md" size={14} duotone={false} />
              </button>
            </div>
            <div className="space-y-3 text-[12.5px] text-[var(--ink-2)] leading-relaxed">
              <p>
                <strong className="text-[var(--ink)]">1. Motion Transfer :</strong> Importez n&apos;importe quelle vidéo réelle de 4 à 30 secondes. Notre réseau neuronal extrait la cinématique squelettique 3D, le rythme et les mouvements de caméra.
              </p>
              <p>
                <strong className="text-[var(--ink)]">2. Object & Character Swap :</strong> Ajoutez la photo de votre influenceur, de votre modèle ou vêtement. Genjutsu applique le mouvement exact tout en conservant l&apos;identité et les textures.
              </p>
              <p>
                <strong className="text-[var(--ink)]">3. Rendu Haute Définition :</strong> Les flux vidéo sont synthétisés pour un rendu cinématique photoréaliste à 60 FPS.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHowItWorksOpen(false)}
              className="w-full py-2.5 rounded-full bg-[#D8FF64] text-black font-semibold text-xs transition-colors cursor-pointer"
            >
              Compris, commencer
            </button>
          </div>
        </div>
      )}
    </>
  );
}

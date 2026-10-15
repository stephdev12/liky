"use client";

import React, { useState, useRef } from "react";
import { X, Video, Sparkles, Upload, Loader2, Check, Film, Layers, Shirt, Package, User } from "lucide-react";
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
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [quality, setQuality] = useState<"720p" | "1080p">("720p");
  const [promptEnabled, setPromptEnabled] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const presets = [
    { id: "p1", name: "Marche podium haute couture", duration: "8s", url: "https://example.com/walk.mp4" },
    { id: "p2", name: "Chorégraphie virale TikTok", duration: "12s", url: "https://example.com/dance.mp4" },
    { id: "p3", name: "Geste produit face caméra", duration: "6s", url: "https://example.com/product.mp4" },
  ];

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
    }, 500);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-[480px] max-h-[92vh] sm:max-h-screen bg-[#141413] text-[#F8F8F5] border-t sm:border-t-0 sm:border-l border-white/10 shadow-2xl z-50 flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#D8FF64]/10 text-[#D8FF64]">
              <Sparkles className="size-4" />
            </span>
            <h3 className="font-heading text-[17px] font-medium text-white">
              likyAI Genjutsu
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Onglets : Motion transfer vs Objects swap */}
        <div className="px-5 pt-3 pb-2 shrink-0">
          <div className="grid grid-cols-2 p-1 rounded-full bg-white/5 border border-white/10 text-[12px] font-medium">
            <button
              type="button"
              onClick={() => setTab("motion")}
              className={cn(
                "py-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5",
                tab === "motion"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              )}
            >
              <Film className="size-3.5" />
              <span>Motion transfer</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("swap")}
              className={cn(
                "py-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5",
                tab === "swap"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              )}
            >
              <Layers className="size-3.5" />
              <span>Objects swap</span>
            </button>
          </div>
        </div>

        {/* Corps des réglages */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 text-[13px]">
          {/* Bloc 1 : Vidéo de mouvement */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white/60 text-[11.5px] font-semibold uppercase tracking-wider">
              <Video className="size-4 text-[#D8FF64]" />
              <span>Vidéo source de mouvement (4–30s)</span>
            </div>

            {videoUrl ? (
              <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/10 p-2.5 flex items-center justify-between">
                <span className="text-[12px] text-white truncate max-w-[280px]">
                  Vidéo sélectionnée prête
                </span>
                <button
                  type="button"
                  onClick={() => setVideoUrl("")}
                  className="text-white/50 hover:text-white text-xs"
                >
                  Changer
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full py-4 rounded-xl border border-dashed border-white/20 hover:border-[#D8FF64]/60 bg-black/20 flex flex-col items-center justify-center gap-1 text-white/70 hover:text-white transition-all cursor-pointer"
                >
                  <Upload className="size-5 text-[#D8FF64]" />
                  <span className="text-[12px] font-medium">Importer votre vidéo de référence</span>
                  <span className="text-[10.5px] text-white/40">MP4, WebM (4s à 30s)</span>
                </button>

                <div className="pt-1">
                  <span className="text-[11px] text-white/40 block mb-1.5">Ou choisir un mouvement pré-enregistré :</span>
                  <div className="space-y-1">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setVideoUrl(p.url)}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-left text-[12px] text-white/80 transition-colors"
                      >
                        <span>{p.name}</span>
                        <span className="text-[10.5px] font-mono text-white/40">{p.duration}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bloc 2 : Personnage, Vêtement ou Produit */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-[11.5px] font-semibold uppercase tracking-wider">
                Sujet cible (Jusqu'à 30 images)
              </span>
              <div className="flex items-center gap-2 text-white/40">
                <User className="size-3.5" />
                <Shirt className="size-3.5" />
                <Package className="size-3.5" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="w-full py-4 rounded-xl border border-dashed border-white/20 hover:border-[#D8FF64]/60 bg-black/20 flex flex-col items-center justify-center gap-1 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <Upload className="size-5 text-white/70" />
              <span className="text-[12px] font-medium">
                {selectedImages.length > 0
                  ? `${selectedImages.length} image(s) sélectionnée(s)`
                  : "Ajouter vos personnages, vêtements ou produits"}
              </span>
              <span className="text-[10.5px] text-white/40">Face, 3/4, profil pour cohérence optimale</span>
            </button>
          </div>

          {/* Prompt switch */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-white">Consigne textuelle d'ajustement</span>
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
                placeholder="ex: mouvement fluide, vent dans les cheveux, éclairage cinématique doré..."
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-[12.5px] text-white resize-none outline-none focus:border-[#D8FF64]"
              />
            )}
          </div>

          {/* Qualité */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[12px] font-medium text-white">Résolution de rendu</span>
            <div className="flex gap-1.5">
              {(["720p", "1080p"] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[11.5px] font-mono transition-all cursor-pointer",
                    quality === q
                      ? "bg-white text-black font-semibold"
                      : "bg-white/5 text-white/60 hover:text-white"
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer sticky */}
        <div className="p-4 border-t border-white/10 bg-[#141413] shrink-0">
          <button
            type="button"
            onClick={handleLaunch}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-full bg-[#D8FF64] hover:bg-[#cbf54a] text-black font-semibold text-[13px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin text-black" />
                <span>Envoi à Genjutsu...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4 text-black" />
                <span>Lancer le transfert de mouvement · 22 cr</span>
              </>
            )}
          </button>
        </div>

        {/* Inputs cachés */}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setVideoUrl(URL.createObjectURL(e.target.files[0]));
            }
          }}
        />
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const urls = Array.from(e.target.files).map((f) => URL.createObjectURL(f));
              setSelectedImages((prev) => [...prev, ...urls]);
            }
          }}
        />
      </div>
    </>
  );
}

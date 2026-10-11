"use client";

import React, { useState, useRef, useEffect } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { cn } from "@/lib/utils";

export interface GenerationResultData {
  id: string;
  tool: "image" | "video" | "music" | "voice";
  modelName: string;
  prompt: string;
  mediaUrl: string;
  creditsCost: number;
  duration?: number;
  elapsedTime?: number;
  format?: string;
  params?: Record<string, string>;
  createdAt: number;
}

interface ResultBubbleProps {
  result: GenerationResultData | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: (result: GenerationResultData) => void;
  onEdit: (result: GenerationResultData) => void;
}

/**
 * Bulle d'affichage du résultat de génération
 * Affiche le rendu (image, vidéo, audio) avec les 3 actions clés :
 * - Réessayer (Coolicon redo duotone)
 * - Télécharger (Coolicon download duotone)
 * - Modifier (Coolicon edit-pencil-01 duotone) qui ouvre la bulle de prompt
 */
export function ResultBubble({
  result,
  isOpen,
  onClose,
  onRetry,
  onEdit,
}: ResultBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setIsPlaying(false);
    setAudioProgress(0);
  }, [result?.id]);

  if (!isOpen || !result) return null;

  const isAudio = result.tool === "music" || result.tool === "voice";
  const isVideo = result.tool === "video";
  const isImage = result.tool === "image";

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(result.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = result.mediaUrl;
    a.download = `likyai-${result.tool}-${Date.now()}.${
      isAudio ? "mp3" : isVideo ? "mp4" : "png"
    }`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setAudioProgress((cur / dur) * 100);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "relative w-full max-w-[560px] max-h-[90vh] overflow-hidden rounded-[22px]",
          "bg-[var(--surf)] border border-[var(--line)] shadow-overlay",
          "flex flex-col text-[var(--ink)] select-none",
          "animate-in zoom-in-95 duration-200"
        )}
      >
        {/* ── EN-TÊTE DE LA BULLE DE RÉSULTAT ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--line)] bg-[var(--mn)]/50">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-[var(--mn)] border border-[var(--line)] text-[var(--ink)]">
              <CoolIcon
                name={
                  result.tool === "image"
                    ? "image-01"
                    : result.tool === "video"
                    ? "camera"
                    : result.tool === "music"
                    ? "headphones"
                    : "user-voice"
                }
                duotone
                size={18}
                secondaryColor="var(--lime)"
                secondaryOpacity={0.4}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[13.5px] font-semibold capitalize">
                  {result.tool === "voice" ? "Voix off" : result.tool}
                </span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[var(--mn)] text-[var(--mute)] font-medium border border-[var(--line)]">
                  {result.modelName}
                </span>
              </div>
              <span className="text-[11px] text-[var(--mute)]">
                {result.elapsedTime ? `Généré en ${result.elapsedTime}s` : "Création terminée"} · {result.creditsCost} crédits
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--mn)] text-[var(--mute)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            title="Fermer la vue résultat"
          >
            <CoolIcon name="close-md" size={16} duotone={false} />
          </button>
        </div>

        {/* ── ZONE DE PRÉVISUALISATION DU RENDU ── */}
        <div className="relative flex items-center justify-center bg-[var(--bg)] overflow-hidden min-h-[240px] max-h-[380px]">
          {/* Rendu Image */}
          {isImage && (
            <div className="relative w-full h-full flex items-center justify-center p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.mediaUrl}
                alt={result.prompt}
                className="max-h-[350px] w-auto max-w-full rounded-[14px] object-contain shadow-card border border-[var(--line)]"
              />
            </div>
          )}

          {/* Rendu Vidéo */}
          {isVideo && (
            <div className="relative w-full h-full flex items-center justify-center p-3">
              <video
                ref={videoRef}
                src={result.mediaUrl}
                controls
                playsInline
                className="max-h-[340px] w-auto max-w-full rounded-[14px] shadow-card border border-[var(--line)] bg-black"
              />
            </div>
          )}

          {/* Rendu Audio (Musique & Voix Off) */}
          {isAudio && (
            <div className="w-full p-6 flex flex-col items-center justify-center gap-4">
              <audio
                ref={audioRef}
                src={result.mediaUrl}
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Onde sonore animée interactive */}
              <div className="flex items-center justify-center gap-1.5 h-16 w-full px-6">
                {Array.from({ length: 28 }).map((_, i) => {
                  const h = 20 + Math.sin(i * 0.45) * 40 + (i % 3) * 15;
                  const active = (i / 28) * 100 <= audioProgress;
                  return (
                    <span
                      key={i}
                      className={cn(
                        "w-1 rounded-full transition-all duration-150",
                        active ? "bg-[var(--lime)]" : "bg-[var(--line-strong)]"
                      )}
                      style={{
                        height: `${Math.max(12, Math.min(60, h))}px`,
                        transform: isPlaying ? `scaleY(${0.7 + Math.random() * 0.6})` : "none",
                      }}
                    />
                  );
                })}
              </div>

              {/* Contrôle Lecture / Pause */}
              <button
                type="button"
                onClick={toggleAudio}
                className="flex items-center gap-2 h-10 px-5 rounded-full bg-[var(--mn)] border border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--hover)] font-medium text-[13px] transition-all cursor-pointer"
              >
                <CoolIcon
                  name={isPlaying ? "pause" : "play"}
                  duotone
                  size={16}
                  secondaryColor="var(--lime)"
                  secondaryOpacity={0.4}
                />
                <span>{isPlaying ? "Mettre en pause" : "Écouter l'audio"}</span>
              </button>
            </div>
          )}
        </div>

        {/* ── AFFICHAGE DU PROMPT UTILISÉ ── */}
        <div className="px-5 py-3 border-t border-[var(--line)] bg-[var(--surf)]">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] leading-relaxed text-[var(--ink)] line-clamp-3 select-text font-normal">
              &ldquo;{result.prompt}&rdquo;
            </p>
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-[8px] bg-[var(--mn)] text-[var(--mute)] hover:text-[var(--ink)] border border-[var(--line)] text-[11px] font-medium transition-colors cursor-pointer"
              title="Copier le prompt"
            >
              <CoolIcon name="copy" size={13} duotone={false} />
              <span>{copied ? "Copié !" : "Copier"}</span>
            </button>
          </div>
        </div>

        {/* ── BARRE DES 3 ACTIONS MAJEURES (RÉESSAYER · TÉLÉCHARGER · MODIFIER) ── */}
        <div className="flex items-center justify-between gap-2.5 px-5 py-3.5 border-t border-[var(--line)] bg-[var(--mn)]/70">
          <div className="flex items-center gap-2">
            {/* 1. Bouton RÉESSAYER */}
            <button
              type="button"
              onClick={() => onRetry(result)}
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[12px]",
                "bg-[var(--surf)] text-[var(--ink)] border border-[var(--line)]",
                "hover:border-[var(--line-strong)] hover:bg-[var(--hover)]",
                "text-[12.5px] font-medium cursor-pointer transition-all active:scale-[0.98]"
              )}
              title="Relancer la génération avec le même prompt et les mêmes réglages"
            >
              <CoolIcon
                name="redo"
                duotone
                size={15}
                secondaryColor="var(--lime)"
                secondaryOpacity={0.4}
              />
              <span>Réessayer</span>
            </button>

            {/* 2. Bouton TÉLÉCHARGER */}
            <button
              type="button"
              onClick={handleDownload}
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[12px]",
                "bg-[var(--surf)] text-[var(--ink)] border border-[var(--line)]",
                "hover:border-[var(--line-strong)] hover:bg-[var(--hover)]",
                "text-[12.5px] font-medium cursor-pointer transition-all active:scale-[0.98]"
              )}
              title="Télécharger la création sur votre appareil"
            >
              <CoolIcon
                name="download"
                duotone
                size={15}
                secondaryColor="currentColor"
                secondaryOpacity={0.25}
              />
              <span>Télécharger</span>
            </button>
          </div>

          {/* 3. Bouton MODIFIER (Ouvre la bulle de prompt) */}
          <button
            type="button"
            onClick={() => onEdit(result)}
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-4 rounded-[12px]",
              "font-semibold text-[13px] cursor-pointer transition-all active:scale-[0.98]",
              "bg-[#D8FF64] text-[#171717] hover:opacity-90 shadow-sm"
            )}
            title="Ouvrir dans la bulle de prompt pour affiner les options ou le texte"
          >
            <CoolIcon
              name="edit-pencil-01"
              duotone
              size={15}
              secondaryColor="#171717"
              secondaryOpacity={0.25}
              className="text-[#171717]"
            />
            <span>Modifier</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultBubble;

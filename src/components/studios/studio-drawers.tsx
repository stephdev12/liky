"use client";

import React, { useState } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { Input } from "@/components/ui/input";
import { Loader2, Globe, Sparkles, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
 * 1. DRAWER MARQUE / BRAND KIT (AD BUILDER)
 * ───────────────────────────────────────────────────────── */
export interface AdBrandData {
  url?: string;
  colors: string[];
  fonts: string[];
  tone: string[];
  logoUrl?: string;
}

interface AdBrandDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  brandData: AdBrandData;
  setBrandData: React.Dispatch<React.SetStateAction<AdBrandData>>;
}

export function AdBrandDrawer({ isOpen, onClose, brandData, setBrandData }: AdBrandDrawerProps) {
  const [url, setUrl] = useState(brandData.url || "");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setScanning(true);
    setError(null);
    try {
      const res = await fetch("/api/studios/scan-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'analyse");

      setBrandData({
        url: data.brandKit.url,
        colors: data.brandKit.colors.palette,
        fonts: [data.brandKit.fonts.heading, data.brandKit.fonts.body],
        tone: data.brandKit.tone.adjectives,
        logoUrl: data.brandKit.logoUrl || undefined,
      });
    } catch (err: any) {
      setError(err.message || "Impossible de scanner le site.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[var(--surf)] border-l border-[var(--line)] shadow-2xl z-50 p-5 overflow-y-auto animate-in slide-in-from-right flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[var(--mn)] text-[var(--ink)]">
                <CoolIcon name="layers" size={16} duotone />
              </span>
              <h3 className="font-heading text-[18px] text-[var(--ink)]">Marque & Brand Kit</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--mn)]"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Formulaire scan */}
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[var(--mute)]">Scanner votre site web</label>
            <form onSubmit={handleScan} className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://votre-marque.com"
                className="h-9 text-[13px] bg-[var(--bg)]"
              />
              <button
                type="submit"
                disabled={scanning || !url.trim()}
                className="h-9 px-3.5 rounded-xl bg-[var(--lime)] text-[#171717] font-semibold text-[12px] shrink-0 disabled:opacity-50"
              >
                {scanning ? <Loader2 className="size-3.5 animate-spin" /> : "Scanner"}
              </button>
            </form>
            {error && <p className="text-[11px] text-red-500">{error}</p>}
          </div>

          {/* Palette */}
          <div>
            <label className="text-[12px] font-medium text-[var(--mute)] block mb-1.5">
              Couleurs de marque
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {brandData.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--mn)] border border-[var(--line)]">
                  <span className="size-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: c }} />
                  <span className="font-mono text-[11px] text-[var(--ink)]">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Typographies */}
          <div>
            <label className="text-[12px] font-medium text-[var(--mute)] block mb-1.5">
              Polices de caractères
            </label>
            <div className="flex gap-2">
              {brandData.fonts.map((f, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-[var(--mn)] text-[12px] text-[var(--ink)] font-medium">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Ton */}
          <div>
            <label className="text-[12px] font-medium text-[var(--mute)] block mb-1.5">
              Ton de communication
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {brandData.tone.map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-[var(--mn)] text-[11.5px] text-[var(--ink)]">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-medium text-[13px] hover:opacity-90"
        >
          Appliquer au studio
        </button>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
 * 2. DRAWER PRODUIT (UGC STUDIO)
 * ───────────────────────────────────────────────────────── */
export interface UgcProductData {
  name: string;
  url?: string;
  benefits?: string;
}

interface UgcProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productData: UgcProductData;
  setProductData: React.Dispatch<React.SetStateAction<UgcProductData>>;
}

export function UgcProductDrawer({ isOpen, onClose, productData, setProductData }: UgcProductDrawerProps) {
  const [url, setUrl] = useState(productData.url || "");
  const [scanning, setScanning] = useState(false);

  if (!isOpen) return null;

  const handleScanProduct = async () => {
    if (!url.trim()) return;
    setScanning(true);
    try {
      const res = await fetch("/api/studios/scan-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok && data.brandKit) {
        setProductData({
          name: data.brandKit.title,
          url,
          benefits: data.brandKit.description,
        });
      }
    } catch {
      // Ignorer
    } finally {
      setScanning(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[var(--surf)] border-l border-[var(--line)] shadow-2xl z-50 p-5 overflow-y-auto animate-in slide-in-from-right flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <h3 className="font-heading text-[18px] text-[var(--ink)]">Fiche Produit UGC</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-lg text-[var(--mute)] hover:text-[var(--ink)]">
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[var(--mute)]">Lien de la fiche produit</label>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://shop.com/produit"
                className="h-9 text-[13px] bg-[var(--bg)]"
              />
              <button
                type="button"
                onClick={handleScanProduct}
                disabled={scanning || !url.trim()}
                className="h-9 px-3 rounded-xl bg-[var(--mn)] text-[var(--ink)] font-medium text-[12px] shrink-0"
              >
                {scanning ? <Loader2 className="size-3.5 animate-spin" /> : "Extraire"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-[var(--mute)] block mb-1">Nom du produit</label>
            <Input
              value={productData.name}
              onChange={(e) => setProductData((p) => ({ ...p, name: e.target.value }))}
              placeholder="ex: Crème Botanique Éclat"
              className="h-9 text-[13px] bg-[var(--bg)]"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-[var(--mute)] block mb-1">Bénéfices majeurs</label>
            <textarea
              value={productData.benefits || ""}
              onChange={(e) => setProductData((p) => ({ ...p, benefits: e.target.value }))}
              placeholder="ex: Hydratation 24h, formule naturelle bio..."
              rows={3}
              className="w-full rounded-xl bg-[var(--bg)] border border-[var(--line)] p-2.5 text-[13px] text-[var(--ink)] resize-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-medium text-[13px] hover:opacity-90"
        >
          Valider le produit
        </button>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
 * 3. DRAWER SCÉNARIO / HISTOIRE (ANIMATION STUDIO)
 * ───────────────────────────────────────────────────────── */
export interface AnimationStoryData {
  scene1: string;
  scene2: string;
  scene3: string;
}

interface AnimationStoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  storyData: AnimationStoryData;
  setStoryData: React.Dispatch<React.SetStateAction<AnimationStoryData>>;
}

export function AnimationStoryDrawer({ isOpen, onClose, storyData, setStoryData }: AnimationStoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[var(--surf)] border-l border-[var(--line)] shadow-2xl z-50 p-5 overflow-y-auto animate-in slide-in-from-right flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <h3 className="font-heading text-[18px] text-[var(--ink)]">Découpage en scènes</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-lg text-[var(--mute)] hover:text-[var(--ink)]">
              <X className="size-4" />
            </button>
          </div>

          <div>
            <label className="text-[12px] font-medium text-[var(--mute)] block mb-1">
              Scène 1 • Accroche (Introduction)
            </label>
            <textarea
              value={storyData.scene1}
              onChange={(e) => setStoryData((s) => ({ ...s, scene1: e.target.value }))}
              rows={2}
              className="w-full rounded-xl bg-[var(--bg)] border border-[var(--line)] p-2.5 text-[13px] text-[var(--ink)] resize-none"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-[var(--mute)] block mb-1">
              Scène 2 • Péripétie (Action)
            </label>
            <textarea
              value={storyData.scene2}
              onChange={(e) => setStoryData((s) => ({ ...s, scene2: e.target.value }))}
              rows={2}
              className="w-full rounded-xl bg-[var(--bg)] border border-[var(--line)] p-2.5 text-[13px] text-[var(--ink)] resize-none"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-[var(--mute)] block mb-1">
              Scène 3 • Chute (Twist / Fin)
            </label>
            <textarea
              value={storyData.scene3}
              onChange={(e) => setStoryData((s) => ({ ...s, scene3: e.target.value }))}
              rows={2}
              className="w-full rounded-xl bg-[var(--bg)] border border-[var(--line)] p-2.5 text-[13px] text-[var(--ink)] resize-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-medium text-[13px] hover:opacity-90"
        >
          Enregistrer le scénario
        </button>
      </div>
    </>
  );
}

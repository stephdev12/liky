"use client";

import React, { useState } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrapedProductData {
  title: string;
  description: string;
  price: string;
  currency: string;
  keyBenefits: string[];
  imageUrl?: string;
}

interface ProductScraperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProduct: (product: ScrapedProductData, format: string) => void;
}

const AD_FORMATS = [
  { id: "ugc", name: "Avis UGC Parlé", desc: "Créateur face caméra qui recommande le produit" },
  { id: "unboxing", name: "Unboxing Immersif", desc: "Déballage et focus textures du produit" },
  { id: "commercial", name: "Spot Produit Dynamique", desc: "Accroche, bénéfices et appel à l'action" },
  { id: "tryon", name: "Démonstration / Try-On", desc: "Mise en situation d'utilisation directe" },
];

export function ProductScraperModal({
  isOpen,
  onClose,
  onApplyProduct,
}: ProductScraperModalProps) {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [extractedProduct, setExtractedProduct] = useState<ScrapedProductData | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("ugc");

  if (!isOpen) return null;

  const handleExtract = () => {
    if (!url.trim()) return;

    setLoading(true);
    // Simulation / Analyse intelligente de l'URL
    setTimeout(() => {
      // Déduit un produit élégant à partir de l'URL
      const urlClean = url.toLowerCase();
      let mockName = "Sérum Botanique Hydratant";
      let mockDesc = "Formule concentrée enrichie en acide hyaluronique et vitamine C pour un teint lumineux.";
      let mockPrice = "34.00";
      let mockCurrency = "€";
      let mockBenefits = ["Hydratation 24h prouvée", "Texture fluide sans effet gras", "Convient à toutes les peaux"];

      if (urlClean.includes("montre") || urlClean.includes("watch")) {
        mockName = "Chronographe Automatique Horizon";
        mockDesc = "Boîtier acier brossé, mouvement suisse et verre saphir inrayable.";
        mockPrice = "249.00";
        mockCurrency = "$";
        mockBenefits = ["Étanche 100m", "Verre saphir inrayable", "Garantie 5 ans"];
      } else if (urlClean.includes("shoes") || urlClean.includes("sneaker")) {
        mockName = "Sneakers Minimalist Apex";
        mockDesc = "Cuir premium italien, semelle amortissante ultra-légère.";
        mockPrice = "119.00";
        mockCurrency = "€";
        mockBenefits = ["Confort toute la journée", "Cuir tannage végétal", "Fabriqué en Europe"];
      }

      setExtractedProduct({
        title: mockName,
        description: mockDesc,
        price: mockPrice,
        currency: mockCurrency,
        keyBenefits: mockBenefits,
        imageUrl: "/assets/showcase/char-1.png",
      });
      setLoading(false);
    }, 1200);
  };

  const handleConfirm = () => {
    if (extractedProduct) {
      onApplyProduct(extractedProduct, selectedFormat);
      onClose();
    }
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
              <CoolIcon name="link-break" size={17} duotone={false} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Click-to-Ad : URL vers Vidéo
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Analysez votre page produit pour générer instantanément un spot publicitaire
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
          {/* Saisie de l'URL */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              1. Collez l&apos;URL de la page produit
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://votre-boutique.com/produits/article-vedette"
                className="font-mono text-xs flex-1"
              />
              <Button
                size="sm"
                disabled={!url.trim() || loading}
                onClick={handleExtract}
                className="text-xs font-semibold shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    Analyse…
                  </>
                ) : (
                  "Analyser"
                )}
              </Button>
            </div>
          </div>

          {/* Résultat d'extraction */}
          {extractedProduct && (
            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--field)] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-foreground">
                    {extractedProduct.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {extractedProduct.description}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-foreground shrink-0 ml-3">
                  {extractedProduct.price} {extractedProduct.currency}
                </span>
              </div>

              <div className="border-t border-[var(--line)] pt-2.5">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Arguments clés extraits :
                </span>
                <ul className="mt-1 space-y-1">
                  {extractedProduct.keyBenefits.map((b, i) => (
                    <li key={i} className="text-xs text-foreground/90 flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-emerald-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Choix du format publicitaire */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              2. Choisissez le format vidéo publicitaire
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AD_FORMATS.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all cursor-pointer",
                    selectedFormat === fmt.id
                      ? "border-foreground bg-[var(--field)] ring-1 ring-foreground/40 shadow-xs"
                      : "border-[var(--line)] bg-[var(--surf)] hover:border-[var(--line-strong)]"
                  )}
                >
                  <div className="text-xs font-semibold text-foreground">{fmt.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{fmt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[var(--line)] px-6 py-4 bg-[var(--surface)] flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Annuler
          </Button>
          <Button
            size="sm"
            disabled={!extractedProduct}
            onClick={handleConfirm}
            className="text-xs font-semibold"
          >
            Appliquer au Studio & Générer
          </Button>
        </div>
      </div>
    </div>
  );
}

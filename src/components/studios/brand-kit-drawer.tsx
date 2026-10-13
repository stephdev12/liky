"use client";

import React, { useState } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandKit, BrandProduct } from "@/lib/studios/types";

interface BrandKitDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  brandKit?: BrandKit;
  onSave?: (kit: BrandKit) => void;
  onSelectProduct?: (product: { title: string; price?: string; currency?: string }) => void;
}

const DEFAULT_BRAND_KIT: BrandKit = {
  id: "default-kit",
  userId: "local-user",
  name: "Mon Brand Kit",
  palette: ["#0F172A", "#3B82F6", "#FFFFFF"],
  typography: {
    heading: "Sentient",
    body: "Geist",
  },
  tone: "Dynamique & Moderne",
  tagline: "Créations IA haute performance",
  websiteUrl: "https://mon-produit.com",
  contactWhatsApp: "+33 6 00 00 00 00",
  products: [
    {
      name: "Sérum Éclat Naturel",
      price: "29",
      currency: "€",
      description: "Sérum visage hydratant aux actifs naturels",
    },
  ],
  isDefault: true,
  createdAt: new Date().toISOString(),
};

export function BrandKitDrawer({
  isOpen,
  onClose,
  brandKit = DEFAULT_BRAND_KIT,
  onSave,
  onSelectProduct,
}: BrandKitDrawerProps) {
  const [kit, setKit] = useState<BrandKit>(brandKit);
  const [newColor, setNewColor] = useState<string>("#6366F1");
  const [newProduct, setNewProduct] = useState<BrandProduct>({
    name: "",
    price: "",
    currency: "€",
  });
  const [showAddProduct, setShowAddProduct] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAddColor = () => {
    if (newColor && !kit.palette.includes(newColor)) {
      setKit({ ...kit, palette: [...kit.palette, newColor] });
    }
  };

  const handleRemoveColor = (col: string) => {
    setKit({ ...kit, palette: kit.palette.filter((c) => c !== col) });
  };

  const handleAddProduct = () => {
    if (newProduct.name.trim()) {
      setKit({
        ...kit,
        products: [...kit.products, { ...newProduct }],
      });
      setNewProduct({ name: "", price: "", currency: "€" });
      setShowAddProduct(false);
    }
  };

  const handleRemoveProduct = (index: number) => {
    setKit({
      ...kit,
      products: kit.products.filter((_, idx) => idx !== index),
    });
  };

  const handleSave = () => {
    if (onSave) onSave(kit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-md h-full bg-[var(--surface)] text-[var(--ink)] border-l border-[var(--line)] shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4 bg-[var(--surface)]">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[var(--field)] border border-[var(--line)] flex items-center justify-center text-foreground">
              <CoolIcon name="folder-check" size={17} duotone={false} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Brand Kit
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Identité visuelle injectée automatiquement dans vos Studios
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Nom de la Marque */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nom de marque
            </label>
            <Input
              value={kit.name}
              onChange={(e) => setKit({ ...kit, name: e.target.value })}
              placeholder="Ex: Maison Lumina, SaaS Flow..."
              className="font-medium text-sm"
            />
          </div>

          {/* Palette de Couleurs */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Couleurs officielles (Codes HEX)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {kit.palette.map((col) => (
                <div
                  key={col}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--field)] text-xs font-mono"
                >
                  <span
                    className="size-3.5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: col }}
                  />
                  <span>{col}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(col)}
                    className="text-muted-foreground hover:text-red-500 cursor-pointer ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="size-8 rounded-lg border border-[var(--line)] bg-transparent cursor-pointer p-0.5"
              />
              <Input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="#000000"
                className="font-mono text-xs h-8"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddColor}
                className="text-xs h-8"
              >
                Ajouter
              </Button>
            </div>
          </div>

          {/* Ton de Voix */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ton éditorial & Voix
            </label>
            <Input
              value={kit.tone}
              onChange={(e) => setKit({ ...kit, tone: e.target.value })}
              placeholder="Ex: Élégant & Minimaliste, Énergique & Viral..."
              className="text-xs"
            />
          </div>

          {/* Site Web & Coordonnées */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Site Web
              </label>
              <Input
                value={kit.websiteUrl || ""}
                onChange={(e) => setKit({ ...kit, websiteUrl: e.target.value })}
                placeholder="https://..."
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                WhatsApp / Contact
              </label>
              <Input
                value={kit.contactWhatsApp || ""}
                onChange={(e) => setKit({ ...kit, contactWhatsApp: e.target.value })}
                placeholder="+33 6... / +225 07..."
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* Catalogue Produits */}
          <div className="space-y-3 border-t border-[var(--line)] pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Produits enregistrés ({kit.products.length})
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="text-xs h-7"
              >
                + Ajouter produit
              </Button>
            </div>

            {showAddProduct && (
              <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--field)] space-y-2.5 animate-in fade-in duration-200">
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Nom du produit"
                  className="text-xs h-8"
                />
                <div className="flex items-center gap-2">
                  <Input
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="Prix (ex: 49)"
                    className="text-xs font-mono h-8 flex-1"
                  />
                  <select
                    value={newProduct.currency}
                    onChange={(e) => setNewProduct({ ...newProduct, currency: e.target.value })}
                    className="h-8 px-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-mono"
                  >
                    <option value="$">$ USD</option>
                    <option value="€">€ EUR</option>
                    <option value="FCFA">FCFA</option>
                    <option value="£">£ GBP</option>
                  </select>
                  <Button size="sm" onClick={handleAddProduct} className="text-xs h-8">
                    Enregistrer
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {kit.products.map((prod, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surf)] flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-foreground font-medium">{prod.name}</strong>
                    {prod.price && (
                      <span className="text-muted-foreground font-mono ml-2">
                        {prod.price} {prod.currency}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {onSelectProduct && (
                      <button
                        type="button"
                        onClick={() =>
                          onSelectProduct({
                            title: prod.name,
                            price: prod.price,
                            currency: prod.currency,
                          })
                        }
                        className="px-2 py-0.5 rounded-md bg-[var(--field)] text-foreground border border-[var(--line)] hover:border-foreground transition-colors cursor-pointer text-xs font-medium"
                      >
                        Sélectionner
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(idx)}
                      className="text-muted-foreground hover:text-red-500 cursor-pointer text-xs"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[var(--line)] px-6 py-4 bg-[var(--surface)] flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Fermer
          </Button>
          <Button size="sm" onClick={handleSave} className="text-xs font-semibold">
            Enregistrer le Brand Kit
          </Button>
        </div>
      </div>
    </div>
  );
}

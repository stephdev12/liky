"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogoIcon } from "@/components/logo";
import { CoolIcon } from "@/components/icons/coolicon";
import {
  X,
  Compass,
  Sparkles,
  User,
  Film,
  ShoppingBag,
  Tv,
  Layers,
  FolderOpen,
  Plus,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  credits: number;
  onOpenTopup: () => void;
  onOpenInfluencerBuilder: () => void;
  onOpenGenjutsu: () => void;
  onOpenAssets: () => void;
}

export function SidebarDrawer({
  isOpen,
  onClose,
  userEmail,
  credits,
  onOpenTopup,
  onOpenInfluencerBuilder,
  onOpenGenjutsu,
  onOpenAssets,
}: SidebarDrawerProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sidebar Sheet */}
      <div className="fixed inset-y-0 left-0 w-[300px] sm:w-[320px] bg-[#121211] text-[#F8F8F5] border-r border-white/10 shadow-2xl z-50 flex flex-col justify-between p-4 overflow-y-auto animate-in slide-in-from-left duration-200">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => navigateTo("/studio")}
            >
              <LogoIcon />
              <span className="font-heading text-[18px] font-semibold text-white tracking-tight">
                liky<span className="text-[#D8FF64]">AI</span>
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Bouton d'action principale + Créer */}
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/studio");
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#D8FF64] text-black font-semibold text-[13px] shadow-sm hover:bg-[#cbf54a] transition-all cursor-pointer"
          >
            <Plus className="size-4 stroke-[3]" />
            <span>Nouveau projet</span>
          </button>

          {/* Liens de navigation */}
          <nav className="space-y-1 text-[13px]">
            <button
              type="button"
              onClick={() => navigateTo("/studios")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              <Compass className="size-4 text-white/50" />
              <span>Hub des Studios</span>
            </button>

            {/* MCP Connecté */}
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <Cpu className="size-4 text-white/50" />
                <span>MCP (Claude & GPT)</span>
              </div>
              <button
                type="button"
                onClick={() => navigateTo("/mcp/authorize")}
                className="px-2 py-0.5 rounded-full bg-[#D8FF64] text-black text-[10.5px] font-semibold hover:opacity-90 cursor-pointer"
              >
                Connect
              </button>
            </div>

            {/* Outils Higgsfield Exclusifs */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGenjutsu();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              <Sparkles className="size-4 text-[#D8FF64]" />
              <span>Genjutsu Motion & Swap</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInfluencerBuilder();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              <User className="size-4 text-[#D8FF64]" />
              <span>AI Influencer Builder</span>
            </button>

            {/* Studios Spécialisés */}
            <button
              type="button"
              onClick={() => navigateTo("/studios/cinema")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              <Film className="size-4 text-white/50" />
              <span>Cinéma Studio</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo("/studios/ad-builder")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              <Layers className="size-4 text-white/50" />
              <span>Ad Builder Studio</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo("/studios/ugc")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              <ShoppingBag className="size-4 text-white/50" />
              <span>UGC Studio</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo("/studios/animation")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              <Tv className="size-4 text-white/50" />
              <span>Animation Studio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAssets();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              <FolderOpen className="size-4 text-white/50" />
              <span>Mes Assets</span>
            </button>
          </nav>

          {/* Section Récent */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30 px-3">
              Historique récent
            </span>
            <p className="text-[12px] text-white/40 px-3 py-1.5 italic">
              Vos créations apparaîtront ici
            </p>
          </div>
        </div>

        {/* Profil utilisateur en bas */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-[#D8FF64] flex items-center justify-center font-bold text-black text-xs shrink-0">
                {(userEmail || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-[12px] font-medium text-white truncate block">
                  {userEmail?.split("@")[0] || "Créateur"}
                </span>
                <span className="font-mono text-[11px] text-[#D8FF64]">
                  {credits} crédits
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTopup();
              }}
              className="px-2.5 py-1 rounded-full bg-[#D8FF64] text-black text-[11px] font-semibold hover:bg-[#cbf54a] transition-colors cursor-pointer shrink-0"
            >
              Recharger
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

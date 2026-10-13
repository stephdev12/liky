/**
 * LikyAI Billing & Pricing Engine
 * 
 * Modèle de tarification transparent basé sur la consommation réelle de l'infrastructure GPU KIE.ai
 * avec marge commerciale configurable et conversion en packs de crédits FCFA.
 */

export const BILLING_CONFIG = {
  // Taux de change officiel USD -> FCFA
  USD_TO_FCFA: 620,

  // Valeur faciale d'un crédit KIE officiel (1 credit KIE = 0.005 USD / 1 USD = 200 credits KIE)
  KIE_CREDIT_USD: 0.005,

  // Marge commerciale appliquée par défaut sur les coûts KIE (50% de marge brute)
  DEFAULT_PROFIT_MARGIN_PERCENT: 50,
};

/**
 * Récupère le pourcentage de marge configuré (via process.env ou valeur par défaut)
 */
export function getProfitMarginPercent(): number {
  const envMargin = process.env.LIKY_PROFIT_MARGIN_PERCENT;
  if (envMargin) {
    const parsed = parseFloat(envMargin);
    if (!isNaN(parsed) && parsed >= 0) return parsed;
  }
  return BILLING_CONFIG.DEFAULT_PROFIT_MARGIN_PERCENT;
}

/**
 * Définition des Packs de recharges Mobile Money en FCFA
 */
export interface CreditPack {
  id: string;
  name: string;
  priceFcfa: number;
  credits: number;
  bonusPercent: number;
  badge?: string;
  info: string;
  features: string[];
  highlighted?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "pack_decouverte",
    name: "Découverte",
    priceFcfa: 1000,
    credits: 60,
    bonusPercent: 0,
    info: "Pour tester et créer vos premières maquettes professionnelles",
    features: [
      "Jusqu'à 15 images 2K Nano Banana",
      "Jusqu'à 4 vidéos courtes HD Seedance",
      "Génération musicale & voix off incluses",
      "Accès direct au Studio LikyAI",
      "Sans abonnement ni expiration",
    ],
  },
  {
    id: "pack_createur",
    name: "Créateur",
    priceFcfa: 2500,
    credits: 175,
    bonusPercent: 16,
    badge: "Le plus populaire",
    highlighted: true,
    info: "Recommandé pour les créateurs de contenu réguliers et community managers",
    features: [
      "Jusqu'à 45 images haute résolution 4K",
      "Vidéos UGC & publicitaires Seedance",
      "Morceaux complets avec Suno v4",
      "Voix off réalistes multilingues",
      "Accès complet au connecteur MCP",
    ],
  },
  {
    id: "pack_pro",
    name: "Studio Pro",
    priceFcfa: 5000,
    credits: 400,
    bonusPercent: 33,
    badge: "+33% de bonus",
    info: "Pour les agences et créateurs exigeants générant au quotidien",
    features: [
      "Générations Kling 3.0 Turbo & Wan 2.7",
      "Images Ultra-HD multi-formats (16:9, 9:16, 1:1)",
      "File prioritaire sur le cluster GPU",
      "Accès API & agents MCP illimité",
      "Support prioritaire WhatsApp & Email",
    ],
  },
  {
    id: "pack_master",
    name: "Studio Master",
    priceFcfa: 10000,
    credits: 900,
    bonusPercent: 50,
    badge: "+50% de bonus",
    info: "Volume maximal pour les productions intensives et studios audiovisuels",
    features: [
      "Tarif préférentiel de ~11 FCFA par crédit",
      "Rendus vidéo cinématiques haute cadence",
      "Accès anticipé aux nouveaux modèles IA",
      "Multi-comptes et intégrations personnalisées",
      "Assistance dédiée pour prompts complexes",
    ],
  },
];

/**
 * Calcule le coût en crédits LikyAI pour une génération d'image
 */
export function calculateImageCost(params: {
  model?: string;
  quality?: string;
  count?: number;
}): { cost: number; modelName: string; resolvedModel: string; baseKieCredits: number } {
  const rawModel = (params.model || "nano").toLowerCase();
  const qual = (params.quality || "1K").toUpperCase();
  const count = Math.max(1, Math.min(4, params.count || 1));

  let base = 6;
  let modelName = "Nano Banana 2";
  let resolvedModel = "nano";
  let baseKieCredits = 3; // Nano 1K coûte 3 crédits KIE

  if (rawModel.includes("soul") || rawModel.includes("turbo") || rawModel.includes("z-image")) {
    base = 2;
    modelName = "Z-Image Turbo";
    resolvedModel = "soul";
    baseKieCredits = 1;
    if (qual.includes("2K")) {
      base = 3;
      baseKieCredits = 1.5;
    }
  } else if (rawModel.includes("seed") || rawModel.includes("seedream")) {
    base = 5;
    modelName = "Seedream 5";
    resolvedModel = "seed";
    baseKieCredits = 2.5;
    if (qual.includes("4K")) {
      base = 9;
      baseKieCredits = 4.5;
    }
  } else {
    // Nano Banana 2
    base = 6;
    modelName = "Nano Banana 2";
    resolvedModel = "nano";
    baseKieCredits = 3;
    if (qual.includes("2K")) {
      base = 8;
      baseKieCredits = 4.5;
    } else if (qual.includes("4K")) {
      base = 15;
      baseKieCredits = 7.5;
    }
  }

  const cost = Math.round(base * count);
  return { cost, modelName, resolvedModel, baseKieCredits: baseKieCredits * count };
}

/**
 * Calcule le coût en crédits LikyAI pour une génération vidéo
 */
export function calculateVideoCost(params: {
  model?: string;
  durationSeconds?: number;
  count?: number;
}): { cost: number; modelName: string; resolvedModel: string; duration: number; baseKieCredits: number } {
  const rawModel = (params.model || "seedance").toLowerCase();
  const duration = Math.max(4, Math.min(30, params.durationSeconds || 5));
  const count = Math.max(1, Math.min(4, params.count || 1));

  let ratePerSec = 4;
  let modelName = "Seedance 2.0 Mini";
  let resolvedModel = "seedance";
  let kieRatePerSec = 2; // 2 KIE cr/s

  if (rawModel.includes("kling")) {
    ratePerSec = 14;
    modelName = "Kling 3.0 Turbo";
    resolvedModel = "kling";
    kieRatePerSec = 7;
  } else if (rawModel.includes("wan")) {
    ratePerSec = 10;
    modelName = "Wan 2.7";
    resolvedModel = "wan";
    kieRatePerSec = 5;
  }

  const cost = Math.round(ratePerSec * duration * count);
  const baseKieCredits = Math.round(kieRatePerSec * duration * count);
  return { cost, modelName, resolvedModel, duration, baseKieCredits };
}

/**
 * Calcule le coût en crédits LikyAI pour une génération de musique (Suno)
 */
export function calculateMusicCost(params: {
  durationSeconds?: number;
}): { cost: number; duration: number; baseKieCredits: number } {
  const duration = Math.max(15, Math.min(120, params.durationSeconds || 30));
  // 10 crédits Liky par tranche de 30 secondes (coût KIE = 5 crédits par génération de piste)
  const cost = 10 * Math.ceil(duration / 30);
  const baseKieCredits = 5 * Math.ceil(duration / 30);
  return { cost, duration, baseKieCredits };
}

/**
 * Calcule le coût en crédits LikyAI pour une synthèse vocale (ElevenLabs)
 */
export function calculateVoiceCost(text: string): { cost: number; length: number; baseKieCredits: number } {
  const length = (text || "").length;
  // 2 crédits Liky par bloc de 100 caractères (coût KIE ~ 1 crédit)
  const cost = Math.max(2, 2 * Math.ceil(length / 100));
  const baseKieCredits = Math.max(1, Math.ceil(length / 100));
  return { cost, length, baseKieCredits };
}

/**
 * Calcule dynamiquement le coût pour n'importe quel outil et paramètre
 */
export function calculateToolCost(
  tool: "image" | "video" | "music" | "voice",
  params: Record<string, any>
): { cost: number; modelName: string; baseKieCredits: number } {
  if (tool === "image") {
    const res = calculateImageCost({
      model: params.model,
      quality: params.qual || params.quality,
      count: parseInt(params.count || "1") || 1,
    });
    return { cost: res.cost, modelName: res.modelName, baseKieCredits: res.baseKieCredits };
  }

  if (tool === "video") {
    const rawDur = String(params["Durée"] || params.duration || "5");
    const dur = parseInt(rawDur.replace(/\D/g, "")) || 5;
    const count = parseInt(params.count || "1") || 1;
    const res = calculateVideoCost({
      model: params.vmodel || params.model,
      durationSeconds: dur,
      count,
    });
    return { cost: res.cost, modelName: res.modelName, baseKieCredits: res.baseKieCredits };
  }

  if (tool === "music") {
    const rawDur = String(params["MDurée"] || params.duration || "30");
    const dur = parseInt(rawDur.replace(/\D/g, "")) || 30;
    const res = calculateMusicCost({ durationSeconds: dur });
    return { cost: res.cost, modelName: "Suno V6", baseKieCredits: res.baseKieCredits };
  }

  if (tool === "voice") {
    const text = params.prompt || "";
    const res = calculateVoiceCost(text);
    return { cost: res.cost, modelName: "ElevenLabs Turbo", baseKieCredits: res.baseKieCredits };
  }

  return { cost: 5, modelName: "Standard", baseKieCredits: 2.5 };
}

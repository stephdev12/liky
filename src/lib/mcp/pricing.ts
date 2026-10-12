/**
 * Calculateur de coût en crédits fidèle à la configuration du Studio LikyAI.
 * Les crédits sont débités uniquement lors des générations et varient selon
 * les réglages choisis par l'agent (modèle, qualité, durée, format, nombre).
 */

export function calculateImageCost(params: {
  model?: string;
  quality?: string;
  count?: number;
}): { cost: number; modelName: string; resolvedModel: string } {
  const rawModel = (params.model || "nano").toLowerCase();
  let base = 6;
  let modelName = "Nano Banana 2";
  let resolvedModel = "nano";
  const qual = (params.quality || "1K").toUpperCase();
  let multiplier = 1;

  if (rawModel.includes("soul") || rawModel.includes("turbo") || rawModel.includes("z-image")) {
    base = 2;
    modelName = "Z-Image Turbo";
    resolvedModel = "soul";
    if (qual.includes("2K")) multiplier = 1.5;
  } else if (rawModel.includes("seed") || rawModel.includes("seedream")) {
    base = 5;
    modelName = "Seedream 5";
    resolvedModel = "seed";
    if (qual.includes("4K")) multiplier = 1.8;
  } else {
    base = 6;
    modelName = "Nano Banana 2";
    resolvedModel = "nano";
    if (qual.includes("2K")) multiplier = 1.5;
    else if (qual.includes("4K")) multiplier = 2.5;
  }

  const count = Math.max(1, Math.min(4, params.count || 1));
  const cost = Math.round(base * multiplier * count);
  return { cost, modelName, resolvedModel };
}

export function calculateVideoCost(params: {
  model?: string;
  durationSeconds?: number;
}): { cost: number; modelName: string; resolvedModel: string; duration: number } {
  const rawModel = (params.model || "seedance").toLowerCase();
  let baseRate = 4;
  let modelName = "Seedance 2.0 Mini";
  let resolvedModel = "seedance";

  if (rawModel.includes("kling")) {
    baseRate = 18;
    modelName = "Kling 3.0 Turbo";
    resolvedModel = "kling";
  } else if (rawModel.includes("wan")) {
    baseRate = 12;
    modelName = "Wan 2.7";
    resolvedModel = "wan";
  }

  const duration = Math.max(5, Math.min(30, params.durationSeconds || 5));
  const cost = baseRate * duration;
  return { cost, modelName, resolvedModel, duration };
}

export function calculateMusicCost(params: {
  durationSeconds?: number;
}): { cost: number; duration: number } {
  const duration = Math.max(15, Math.min(120, params.durationSeconds || 30));
  const cost = 10 * Math.ceil(duration / 15);
  return { cost, duration };
}

export function calculateVoiceCost(text: string): { cost: number; length: number } {
  const length = (text || "").length;
  const cost = Math.max(2, 2 * Math.ceil(length / 100));
  return { cost, length };
}

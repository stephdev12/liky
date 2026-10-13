/**
 * Calculateur de coût en crédits fidèle à la configuration du Studio LikyAI.
 * Référence le moteur central de tarification @/lib/billing/pricing-calculator
 */

export {
  calculateImageCost,
  calculateVideoCost,
  calculateMusicCost,
  calculateVoiceCost,
  calculateToolCost,
  BILLING_CONFIG,
  CREDIT_PACKS,
} from "@/lib/billing/pricing-calculator";

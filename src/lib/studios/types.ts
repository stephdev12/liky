import { CoolIconKey } from "@/components/icons/coolicon";

export type StudioSlug =
  | "ugc"
  | "characters"
  | "posters"
  | "saas"
  | "assets"
  | "motion";

export type QualityTier = "draft" | "final";

export interface StudioConfig {
  id: StudioSlug;
  name: string;
  shortDesc: string;
  tagline: string;
  icon: CoolIconKey;
  startingCredits: number;
  badge?: string;
  formats: { label: string; ratio: string }[];
  defaultPlaceholder: string;
  supportedModels: {
    draft: { id: string; name: string; credits: number };
    final: { id: string; name: string; credits: number };
  };
  features: string[];
}

export interface CharacterTraits {
  gender?: string;
  ageGroup?: string;
  ethnicity?: string;
  skinTexture?: string;
  hairStyle?: string;
  dressStyle?: string;
  niche?: string;
  personality?: string;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  description?: string;
  traits: CharacterTraits;
  referenceImages: string[];
  defaultVoice?: string;
  defaultLanguage?: string;
  isPublic?: boolean;
  createdAt: string;
}

export interface BrandProduct {
  name: string;
  price?: string;
  currency?: string; // '$', '€', 'FCFA', '£', etc.
  imageUrl?: string;
  description?: string;
}

export interface BrandKit {
  id: string;
  userId: string;
  name: string;
  logoUrl?: string;
  palette: string[]; // ['#000000', '#ffffff', ...]
  typography: {
    heading: string;
    body: string;
  };
  tone: string;
  tagline?: string;
  websiteUrl?: string;
  contactWhatsApp?: string;
  products: BrandProduct[];
  isDefault?: boolean;
  createdAt: string;
}

export interface StudioTemplate {
  id: string;
  studioSlug: StudioSlug;
  title: string;
  description: string;
  category: string;
  badge?: string;
  thumbnailUrl?: string;
  format: string; // '9:16', '16:9', '1:1', etc.
  costEstimateCredits: number;
  promptTemplate: string;
}

export interface PipelineStep {
  id: string;
  label: string;
  type: "scrape" | "llm" | "image" | "video" | "audio" | "compose" | "qa";
  status: "waiting" | "running" | "success" | "fail";
  credits: number;
  output?: string;
  error?: string;
}

export interface PipelineRun {
  id: string;
  userId: string;
  studioSlug: StudioSlug;
  templateId?: string;
  status: "pending" | "running" | "success" | "failed" | "refunded";
  creditsReserved: number;
  creditsConsumed: number;
  steps: PipelineStep[];
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  createdAt: string;
}

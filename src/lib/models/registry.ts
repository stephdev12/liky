export type ToolKind = "image" | "video" | "music" | "voice";

export type ModelDef = {
  id: string;
  kind: ToolKind | "chat" | "tool";
  provider: "kie";
  kieModel: string;
  endpoint: "jobs/createTask" | "veo" | "suno" | "runway" | "chat";
  label: string;
  tagline: string;
  tier: "eco" | "standard" | "premium";
  pricing: {
    unit: "image" | "video" | "second" | "char" | "track";
    likyCredits: number;
    description: string;
  };
  capabilities?: {
    i2v?: boolean;
    refs?: boolean;
    audio?: boolean;
    maxDuration?: number;
    ratios?: string[];
  };
  enabled: boolean;
};

export const MODEL_REGISTRY: ModelDef[] = [
  // --- IMAGES ---
  {
    id: "img.nano-banana-2-1",
    kind: "image",
    provider: "kie",
    kieModel: "nano-banana-2-1",
    endpoint: "jobs/createTask",
    label: "Nano Banana 2.1",
    tagline: "Polyvalent, rapide et ultra-fidèle",
    tier: "standard",
    pricing: {
      unit: "image",
      likyCredits: 5,
      description: "5 crédits / image",
    },
    capabilities: {
      ratios: ["1:1", "16:9", "9:16", "4:5"],
      refs: true,
    },
    enabled: true,
  },
  {
    id: "img.seedream-5-flash",
    kind: "image",
    provider: "kie",
    kieModel: "seedream-5-flash",
    endpoint: "jobs/createTask",
    label: "Seedream 5.0 Flash",
    tagline: "Économique pour itérations rapides",
    tier: "eco",
    pricing: {
      unit: "image",
      likyCredits: 2,
      description: "2 crédits / image",
    },
    capabilities: {
      ratios: ["1:1", "16:9", "9:16"],
    },
    enabled: true,
  },
  {
    id: "img.gpt-image-2-5",
    kind: "image",
    provider: "kie",
    kieModel: "gpt-image-2-5-flare-text-to-image",
    endpoint: "jobs/createTask",
    label: "GPT Image 2.5 Flare",
    tagline: "Idéal pour affiches et texte net",
    tier: "premium",
    pricing: {
      unit: "image",
      likyCredits: 8,
      description: "8 crédits / image",
    },
    capabilities: {
      ratios: ["1:1", "16:9", "9:16", "4:5"],
    },
    enabled: true,
  },

  // --- VIDÉOS ---
  {
    id: "vid.seedance-2-5",
    kind: "video",
    provider: "kie",
    kieModel: "seedance-2-5",
    endpoint: "jobs/createTask",
    label: "Seedance 2.5",
    tagline: "Marketing & pub, excellent rapport qualité-prix",
    tier: "standard",
    pricing: {
      unit: "video",
      likyCredits: 16,
      description: "16 crédits / vidéo",
    },
    capabilities: {
      i2v: true,
      maxDuration: 10,
      ratios: ["9:16", "16:9", "1:1", "4:5"],
    },
    enabled: true,
  },
  {
    id: "vid.kling-3-0",
    kind: "video",
    provider: "kie",
    kieModel: "kling-3-0",
    endpoint: "jobs/createTask",
    label: "Kling 3.0",
    tagline: "Mouvement fluide & avatar réaliste",
    tier: "premium",
    pricing: {
      unit: "video",
      likyCredits: 25,
      description: "25 crédits / vidéo",
    },
    capabilities: {
      i2v: true,
      audio: true,
      maxDuration: 10,
      ratios: ["9:16", "16:9"],
    },
    enabled: true,
  },
  {
    id: "vid.veo-3-1",
    kind: "video",
    provider: "kie",
    kieModel: "veo-3-1",
    endpoint: "veo",
    label: "Veo 3.1",
    tagline: "Qualité cinématographique avec son natif",
    tier: "premium",
    pricing: {
      unit: "video",
      likyCredits: 35,
      description: "35 crédits / vidéo",
    },
    capabilities: {
      audio: true,
      maxDuration: 8,
      ratios: ["16:9", "9:16"],
    },
    enabled: true,
  },

  // --- MUSIQUE ---
  {
    id: "mus.suno-v6",
    kind: "music",
    provider: "kie",
    kieModel: "ai-music-api/generate",
    endpoint: "suno",
    label: "Suno V6",
    tagline: "Génération musicale complète avec voix et mix",
    tier: "standard",
    pricing: {
      unit: "track",
      likyCredits: 10,
      description: "10 crédits / 2 variantes",
    },
    capabilities: {
      audio: true,
      maxDuration: 240,
    },
    enabled: true,
  },

  // --- VOIX OFF ---
  {
    id: "voi.elevenlabs-turbo",
    kind: "voice",
    provider: "kie",
    kieModel: "elevenlabs/text-to-speech-turbo-2-5",
    endpoint: "jobs/createTask",
    label: "ElevenLabs Turbo 2.5",
    tagline: "Voix ultra-naturelle et expressive",
    tier: "standard",
    pricing: {
      unit: "char",
      likyCredits: 2,
      description: "2 crédits / 500 caractères",
    },
    capabilities: {
      audio: true,
    },
    enabled: true,
  },
];

export function getModelsByTool(tool: ToolKind): ModelDef[] {
  return MODEL_REGISTRY.filter((m) => m.kind === tool && m.enabled);
}

export function getModelById(id: string): ModelDef | undefined {
  return MODEL_REGISTRY.find((m) => m.id === id);
}

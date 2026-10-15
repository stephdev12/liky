export type ToolKind = "image" | "video" | "music" | "voice";

export type ModelProvider = "kie" | "higgsfield" | "hybrid";

export type ModelDef = {
  id: string;
  kind: ToolKind | "chat" | "tool";
  provider: ModelProvider;
  kieModel?: string;
  endpointId?: string;
  endpoint: "jobs/createTask" | "veo" | "suno" | "runway" | "chat" | "higgsfield";
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
    motionTransfer?: boolean;
    characterConsistency?: boolean;
    maxDuration?: number;
    ratios?: string[];
  };
  fallbacks?: {
    provider: "kie" | "higgsfield";
    modelId: string;
  }[];
  enabled: boolean;
};

export const MODEL_REGISTRY: ModelDef[] = [
  // ── IMAGES (KIE & HIGGSFIELD) ──
  {
    id: "img.soul-2",
    kind: "image",
    provider: "higgsfield",
    endpointId: "higgsfield-ai/soul/v2/standard",
    endpoint: "higgsfield",
    label: "Soul 2.0 (Higgsfield)",
    tagline: "Photographie humaine & mode photoréaliste de pointe",
    tier: "standard",
    pricing: {
      unit: "image",
      likyCredits: 4,
      description: "4 crédits / image",
    },
    capabilities: {
      ratios: ["1:1", "16:9", "9:16", "4:5"],
      characterConsistency: true,
      refs: true,
    },
    enabled: true,
  },
  {
    id: "img.ai-influencer",
    kind: "image",
    provider: "higgsfield",
    endpointId: "higgsfield-ai/ai-influencer/v1.0",
    endpoint: "higgsfield",
    label: "AI Influencer Studio",
    tagline: "Planche de personnage multi-poses & identité stable",
    tier: "standard",
    pricing: {
      unit: "image",
      likyCredits: 8,
      description: "8 crédits / planche de personnage",
    },
    capabilities: {
      ratios: ["9:16", "1:1", "16:9"],
      characterConsistency: true,
      refs: true,
    },
    enabled: true,
  },
  {
    id: "img.marketing-studio",
    kind: "image",
    provider: "higgsfield",
    endpointId: "higgsfield-ai/marketing-studio-image/v1.0",
    endpoint: "higgsfield",
    label: "Marketing Studio Image",
    tagline: "Visuels publicitaires commerciaux 4K ultra-nets",
    tier: "standard",
    pricing: {
      unit: "image",
      likyCredits: 6,
      description: "6 crédits / visuel",
    },
    capabilities: {
      ratios: ["1080x1350", "9:16", "1:1", "16:9"],
      refs: true,
    },
    enabled: true,
  },
  {
    id: "img.nano-banana-2-1",
    kind: "image",
    provider: "kie",
    kieModel: "nano-banana-2-1",
    endpoint: "jobs/createTask",
    label: "Nano Banana 2.1 (KIE)",
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
    label: "Seedream 5.0 Flash (KIE)",
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
    label: "GPT Image 2.5 Flare (KIE)",
    tagline: "Idéal pour affiches et typographie nette",
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

  // ── VIDÉOS (DOUBLE FOURNISSEUR AVEC PRIORITÉ KIE & FAILOVER) ──
  {
    id: "vid.seedance-2-5",
    kind: "video",
    provider: "hybrid",
    kieModel: "seedance-2-5",
    endpointId: "bytedance/seedance-2.5/reference-to-video",
    endpoint: "jobs/createTask",
    label: "Seedance 2.5",
    tagline: "Marketing & pub avec audio natif (Priorité KIE avec repli Higgsfield)",
    tier: "standard",
    pricing: {
      unit: "video",
      likyCredits: 16,
      description: "16 crédits / vidéo",
    },
    capabilities: {
      i2v: true,
      audio: true,
      refs: true,
      maxDuration: 10,
      ratios: ["9:16", "16:9", "1:1", "4:5"],
    },
    fallbacks: [
      { provider: "higgsfield", modelId: "bytedance/seedance-2.5/reference-to-video" },
    ],
    enabled: true,
  },
  {
    id: "vid.genjutsu-motion",
    kind: "video",
    provider: "higgsfield",
    endpointId: "higgsfiled/genjutsu/motion-transfer/v1.0",
    endpoint: "higgsfield",
    label: "Genjutsu Motion Transfer",
    tagline: "Rejoue le mouvement d'une vidéo sur n'importe quel personnage",
    tier: "premium",
    pricing: {
      unit: "video",
      likyCredits: 22,
      description: "22 crédits / transfert",
    },
    capabilities: {
      motionTransfer: true,
      characterConsistency: true,
      refs: true,
      maxDuration: 15,
      ratios: ["9:16", "16:9"],
    },
    enabled: true,
  },
  {
    id: "vid.genjutsu-restyle",
    kind: "video",
    provider: "higgsfield",
    endpointId: "higgsfield/genjutsu/restyle/v1.0",
    endpoint: "higgsfield",
    label: "Genjutsu Restyle",
    tagline: "Harmonise le style artistique d'une scène vidéo complète",
    tier: "premium",
    pricing: {
      unit: "video",
      likyCredits: 20,
      description: "20 crédits / scène",
    },
    capabilities: {
      refs: true,
      maxDuration: 15,
      ratios: ["9:16", "16:9"],
    },
    enabled: true,
  },
  {
    id: "vid.cinema-studio-4",
    kind: "video",
    provider: "higgsfield",
    endpointId: "higgsfield-ai/cinema-studio-4/v1.0",
    endpoint: "higgsfield",
    label: "Cinema Studio 4.0 (Higgsfield)",
    tagline: "Rendu pellicule 35mm & anamorphique de niveau hollywoodien",
    tier: "premium",
    pricing: {
      unit: "video",
      likyCredits: 26,
      description: "26 crédits / plan cinéma",
    },
    capabilities: {
      refs: true,
      audio: true,
      maxDuration: 10,
      ratios: ["16:9", "2.39:1", "9:16"],
    },
    enabled: true,
  },
  {
    id: "vid.kling-3-0",
    kind: "video",
    provider: "hybrid",
    kieModel: "kling-3-0",
    endpointId: "kuaishou/kling-3.0/text-to-video",
    endpoint: "jobs/createTask",
    label: "Kling 3.0 Pro",
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
    fallbacks: [
      { provider: "higgsfield", modelId: "kuaishou/kling-3.0/text-to-video" },
    ],
    enabled: true,
  },
  {
    id: "vid.veo-3-1",
    kind: "video",
    provider: "kie",
    kieModel: "veo-3-1",
    endpoint: "veo",
    label: "Google Veo 3.1 (KIE)",
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

  // ── MUSIQUE (KIE EXCLUSIF) ──
  {
    id: "mus.suno-v6",
    kind: "music",
    provider: "kie",
    kieModel: "ai-music-api/generate",
    endpoint: "suno",
    label: "Suno V6 (KIE)",
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

  // ── VOIX OFF (KIE EXCLUSIF) ──
  {
    id: "voi.elevenlabs-turbo",
    kind: "voice",
    provider: "kie",
    kieModel: "elevenlabs/text-to-speech-turbo-2-5",
    endpoint: "jobs/createTask",
    label: "ElevenLabs Turbo 2.5 (KIE)",
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

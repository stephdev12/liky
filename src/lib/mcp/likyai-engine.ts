import {
  createKieTask,
  pollKieTask,
  getKieApiKey,
  resolveKieModel,
  buildKieInputPayload,
} from "@/lib/kie/client";
import { MODEL_REGISTRY, ToolKind } from "@/lib/models/registry";

export interface GenerateImageOptions {
  prompt: string;
  model?: string;
  aspect_ratio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  quality?: "standard" | "2k" | "4k";
  waitForResult?: boolean;
  maxWaitSeconds?: number;
}

export interface GenerateVideoOptions {
  prompt: string;
  model?: string;
  aspect_ratio?: "16:9" | "9:16" | "1:1";
  duration?: number;
  image_url?: string;
  waitForResult?: boolean;
  maxWaitSeconds?: number;
}

export interface GenerateMusicOptions {
  prompt: string;
  genre?: string;
  instrumental?: boolean;
  title?: string;
  waitForResult?: boolean;
  maxWaitSeconds?: number;
}

export interface GenerateVoiceOptions {
  prompt: string;
  voice?: string;
  language?: string;
  waitForResult?: boolean;
  maxWaitSeconds?: number;
}

export interface TaskStatusResult {
  taskId: string;
  state: "waiting" | "queuing" | "generating" | "success" | "fail" | "timeout";
  progress?: number;
  resultUrls?: string[];
  creditsConsumed?: number;
  message?: string;
  error?: string;
}

/**
 * Tâches simulées partagées
 */
interface SimulatedTask {
  taskId: string;
  tool: string;
  prompt: string;
  createdAt: number;
  creditsCost: number;
  resultUrl: string;
  metadata?: Record<string, unknown>;
}

declare global {
  // eslint-disable-next-line no-var
  var __simulatedTasks: Map<string, SimulatedTask> | undefined;
}

function getSimTasksMap(): Map<string, SimulatedTask> {
  if (!globalThis.__simulatedTasks) {
    globalThis.__simulatedTasks = new Map();
  }
  return globalThis.__simulatedTasks;
}

/**
 * Interroge le statut d'une tâche (Live KIE ou Simulation)
 */
export async function checkLikyTask(taskId: string): Promise<TaskStatusResult> {
  if (taskId.startsWith("sim-") || taskId.startsWith("demo-")) {
    const sim = getSimTasksMap().get(taskId);
    const createdAt = sim?.createdAt || Date.now() - 3500;
    const elapsed = (Date.now() - createdAt) / 1000;

    if (elapsed < 1.0) {
      return {
        taskId,
        state: "waiting",
        progress: 25,
        message: "Analyse du prompt et allocation GPU...",
      };
    }

    if (elapsed < 2.5) {
      return {
        taskId,
        state: "generating",
        progress: 65,
        message: "Génération des latents et synthèse du rendu...",
      };
    }

    const defaultUrl =
      sim?.tool === "music"
        ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        : sim?.tool === "voice"
        ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
        : `/assets/organic/organic-${Math.floor(Math.random() * 4) + 1}.webp`;

    return {
      taskId,
      state: "success",
      progress: 100,
      creditsConsumed: sim?.creditsCost || 5,
      resultUrls: [sim?.resultUrl || defaultUrl],
      message: "Tâche terminée avec succès",
    };
  }

  // Polling KIE en direct
  const record = await pollKieTask(taskId);
  if ("error" in record) {
    return {
      taskId,
      state: "fail",
      error: record.error,
    };
  }

  const resultUrls: string[] = [];
  if (record.response?.resultUrls && record.response.resultUrls.length > 0) {
    resultUrls.push(...record.response.resultUrls);
  } else if (record.response?.data) {
    for (const item of record.response.data) {
      if (item.image_url) resultUrls.push(item.image_url);
      if (item.audio_url) resultUrls.push(item.audio_url);
    }
  }

  return {
    taskId: record.taskId,
    state: record.state,
    progress: record.state === "success" ? 100 : record.state === "generating" ? 60 : 20,
    resultUrls,
    creditsConsumed: record.creditsConsumed,
    error: record.failMsg || undefined,
  };
}

/**
 * Attend activement qu'une tâche se termine ou expire
 */
export async function waitForTaskCompletion(
  taskId: string,
  maxWaitSeconds: number = 30,
  intervalSeconds: number = 2
): Promise<TaskStatusResult> {
  const startTime = Date.now();
  const maxWaitMs = maxWaitSeconds * 1000;
  const intervalMs = intervalSeconds * 1000;

  while (Date.now() - startTime < maxWaitMs) {
    const status = await checkLikyTask(taskId);
    if (status.state === "success" || status.state === "fail") {
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  const lastStatus = await checkLikyTask(taskId);
  if (lastStatus.state === "success") return lastStatus;

  return {
    taskId,
    state: "timeout",
    message: `Délai d'attente dépassé (${maxWaitSeconds}s). La tâche continue en arrière-plan. Vérifiez plus tard avec likyai_get_task_status.`,
  };
}

/**
 * Génère une image
 */
export async function generateImage(options: GenerateImageOptions): Promise<{
  taskId: string;
  status: TaskStatusResult;
  model: string;
  mode: "live" | "demo";
}> {
  const modelId = options.model || "nano-banana-2-1";
  const apiKey = getKieApiKey();

  if (!apiKey) {
    const simTaskId = `sim-${Date.now()}`;
    const randomIdx = Math.floor(Math.random() * 4) + 1;
    const mediaUrl = `/assets/organic/organic-${randomIdx}.webp`;

    getSimTasksMap().set(simTaskId, {
      taskId: simTaskId,
      tool: "image",
      prompt: options.prompt,
      createdAt: Date.now(),
      creditsCost: 5,
      resultUrl: mediaUrl,
      metadata: { aspect_ratio: options.aspect_ratio, quality: options.quality },
    });

    let status: TaskStatusResult = {
      taskId: simTaskId,
      state: "waiting",
      progress: 25,
      message: "Génération en cours...",
    };

    if (options.waitForResult !== false) {
      status = await waitForTaskCompletion(simTaskId, options.maxWaitSeconds || 15);
    }

    return { taskId: simTaskId, status, model: modelId, mode: "demo" };
  }

  const officialModel = resolveKieModel("image", modelId);
  const input = buildKieInputPayload("image", officialModel, options.prompt, {
    Ratio: options.aspect_ratio || "1:1",
    qual: options.quality || "basic",
  });

  const res = await createKieTask(officialModel, input);
  if ("error" in res) {
    throw new Error(`Échec de création de la tâche: ${res.error}`);
  }

  let status: TaskStatusResult = {
    taskId: res.taskId,
    state: "waiting",
    progress: 10,
    message: "Tâche envoyée au cluster GPU LikyAI.",
  };

  if (options.waitForResult !== false) {
    status = await waitForTaskCompletion(res.taskId, options.maxWaitSeconds || 35);
  }

  return { taskId: res.taskId, status, model: officialModel, mode: "live" };
}

/**
 * Génère une vidéo
 */
export async function generateVideo(options: GenerateVideoOptions): Promise<{
  taskId: string;
  status: TaskStatusResult;
  model: string;
  mode: "live" | "demo";
}> {
  const modelId = options.model || "seedance-2";
  const apiKey = getKieApiKey();

  if (!apiKey) {
    const simTaskId = `sim-${Date.now()}`;
    const mediaUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

    getSimTasksMap().set(simTaskId, {
      taskId: simTaskId,
      tool: "video",
      prompt: options.prompt,
      createdAt: Date.now(),
      creditsCost: 15,
      resultUrl: mediaUrl,
      metadata: {
        aspect_ratio: options.aspect_ratio,
        duration: options.duration,
      },
    });

    let status: TaskStatusResult = {
      taskId: simTaskId,
      state: "waiting",
      progress: 20,
      message: "Rendu vidéo en cours...",
    };

    if (options.waitForResult) {
      status = await waitForTaskCompletion(simTaskId, options.maxWaitSeconds || 20);
    }

    return { taskId: simTaskId, status, model: modelId, mode: "demo" };
  }

  const officialModel = resolveKieModel("video", modelId);
  const input = buildKieInputPayload("video", officialModel, options.prompt, {
    Ratio: options.aspect_ratio || "16:9",
    Durée: options.duration || 5,
    ...(options.image_url ? { image_url: options.image_url } : {}),
  });

  const res = await createKieTask(officialModel, input);
  if ("error" in res) {
    throw new Error(`Échec de création de la tâche vidéo: ${res.error}`);
  }

  let status: TaskStatusResult = {
    taskId: res.taskId,
    state: "waiting",
    progress: 10,
    message: "Rendu vidéo initié sur LikyAI.",
  };

  if (options.waitForResult) {
    status = await waitForTaskCompletion(res.taskId, options.maxWaitSeconds || 60);
  }

  return { taskId: res.taskId, status, model: officialModel, mode: "live" };
}

/**
 * Génère de la musique
 */
export async function generateMusic(options: GenerateMusicOptions): Promise<{
  taskId: string;
  status: TaskStatusResult;
  model: string;
  mode: "live" | "demo";
}> {
  const apiKey = getKieApiKey();
  const fullPrompt = options.genre ? `[Genre: ${options.genre}] ${options.prompt}` : options.prompt;

  if (!apiKey) {
    const simTaskId = `sim-${Date.now()}`;
    const mediaUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

    getSimTasksMap().set(simTaskId, {
      taskId: simTaskId,
      tool: "music",
      prompt: fullPrompt,
      createdAt: Date.now(),
      creditsCost: 10,
      resultUrl: mediaUrl,
      metadata: { genre: options.genre, title: options.title },
    });

    let status: TaskStatusResult = {
      taskId: simTaskId,
      state: "waiting",
      progress: 20,
    };

    if (options.waitForResult) {
      status = await waitForTaskCompletion(simTaskId, options.maxWaitSeconds || 20);
    }

    return { taskId: simTaskId, status, model: "suno-v4", mode: "demo" };
  }

  const officialModel = resolveKieModel("music", "suno-v4");
  const input = buildKieInputPayload("music", officialModel, fullPrompt, {
    instrumental: options.instrumental,
    title: options.title,
  });

  const res = await createKieTask(officialModel, input);
  if ("error" in res) {
    throw new Error(`Échec de création musicale: ${res.error}`);
  }

  let status: TaskStatusResult = {
    taskId: res.taskId,
    state: "waiting",
    progress: 10,
  };

  if (options.waitForResult) {
    status = await waitForTaskCompletion(res.taskId, options.maxWaitSeconds || 60);
  }

  return { taskId: res.taskId, status, model: officialModel, mode: "live" };
}

/**
 * Génère de la voix off / audio parlé
 */
export async function generateVoice(options: GenerateVoiceOptions): Promise<{
  taskId: string;
  status: TaskStatusResult;
  model: string;
  mode: "live" | "demo";
}> {
  const apiKey = getKieApiKey();

  if (!apiKey) {
    const simTaskId = `sim-${Date.now()}`;
    const mediaUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";

    getSimTasksMap().set(simTaskId, {
      taskId: simTaskId,
      tool: "voice",
      prompt: options.prompt,
      createdAt: Date.now(),
      creditsCost: 5,
      resultUrl: mediaUrl,
    });

    let status: TaskStatusResult = {
      taskId: simTaskId,
      state: "waiting",
      progress: 25,
    };

    if (options.waitForResult !== false) {
      status = await waitForTaskCompletion(simTaskId, options.maxWaitSeconds || 15);
    }

    return { taskId: simTaskId, status, model: "elevenlabs-v2", mode: "demo" };
  }

  const officialModel = resolveKieModel("voice", "elevenlabs");
  const input = buildKieInputPayload("voice", officialModel, options.prompt, {
    voice: options.voice,
    language: options.language,
  });

  const res = await createKieTask(officialModel, input);
  if ("error" in res) {
    throw new Error(`Échec de synthèse vocale: ${res.error}`);
  }

  let status: TaskStatusResult = {
    taskId: res.taskId,
    state: "waiting",
    progress: 10,
  };

  if (options.waitForResult !== false) {
    status = await waitForTaskCompletion(res.taskId, options.maxWaitSeconds || 25);
  }

  return { taskId: res.taskId, status, model: officialModel, mode: "live" };
}

/**
 * Liste les modèles enregistrés
 */
export function listLikyModels(category?: string) {
  if (!category || category === "all") {
    return MODEL_REGISTRY.map((m) => ({
      id: m.id,
      name: m.label,
      kind: m.kind,
      tagline: m.tagline,
      tier: m.tier,
      costCredits: m.pricing.likyCredits,
      pricingDescription: m.pricing.description,
      capabilities: m.capabilities,
    }));
  }

  return MODEL_REGISTRY.filter((m) => m.kind === (category as ToolKind)).map((m) => ({
    id: m.id,
    name: m.label,
    kind: m.kind,
    tagline: m.tagline,
    tier: m.tier,
    costCredits: m.pricing.likyCredits,
    pricingDescription: m.pricing.description,
    capabilities: m.capabilities,
  }));
}

/**
 * Récupère le solde utilisateur
 */
export function getLikyBalance() {
  return {
    credits: 120,
    plan: "Créateur",
    currency: "FCFA",
    mcpAccess: "unlimited",
    status: "active",
  };
}

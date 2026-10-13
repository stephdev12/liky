import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createKieTask, getKieApiKey, resolveKieModel, buildKieInputPayload } from "@/lib/kie/client";
import { calculateToolCost } from "@/lib/billing/pricing-calculator";
import { saveSimulatedTask } from "../tasks/[taskId]/route";

const GenerateSchema = z.object({
  tool: z.enum(["image", "video", "music", "voice"]),
  modelId: z.string(),
  prompt: z.string().min(1),
  params: z.record(z.string(), z.any()).optional(),
  creditsCost: z.number().int().positive().default(5),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GenerateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { tool, modelId, prompt, params, creditsCost } = parsed.data;
    const computedCost = calculateToolCost(tool, params || {}).cost;
    const finalCreditsCost = creditsCost && creditsCost > 0 ? creditsCost : computedCost;
    const apiKey = getKieApiKey();

    if (!apiKey) {
      // Mode simulation réaliste (local/démo) UNIQUEMENT quand la clé API KIE n'est pas renseignée
      console.warn("[KIE] KIE_API_KEY non configurée - basculement en mode démo");
      const simTaskId = `sim-${Date.now()}`;
      const randomIdx = Math.floor(Math.random() * 4) + 1;
      const mediaUrl =
        tool === "music"
          ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          : tool === "voice"
          ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
          : `/assets/organic/organic-${randomIdx}.webp`;

      saveSimulatedTask({
        taskId: simTaskId,
        tool,
        prompt,
        createdAt: Date.now(),
        creditsCost: finalCreditsCost,
        resultUrl: mediaUrl,
        metadata: params,
      });

      return NextResponse.json({
        success: true,
        mode: "demo",
        taskId: simTaskId,
        status: "waiting",
        tool,
        modelId,
        creditsCost: finalCreditsCost,
      });
    }

    // Résolution du vrai slug de modèle KIE officiel
    const officialKieModel = resolveKieModel(tool, modelId);

    // Formatage des entrées selon la spécification OpenAPI du modèle KIE
    const inputPayload = buildKieInputPayload(tool, officialKieModel, prompt, params);

    console.log(`[KIE] Création de tâche en direct pour ${officialKieModel}:`, JSON.stringify(inputPayload));

    // Appel officiel à l'API KIE
    const result = await createKieTask(officialKieModel, inputPayload);

    if ("error" in result) {
      console.error(`[KIE] Échec création de tâche (${officialKieModel}):`, result.error);
      return NextResponse.json(
        { error: result.error, code: result.code, officialKieModel },
        { status: result.code === 402 ? 402 : 502 }
      );
    }

    console.log(`[KIE] Tâche en direct créée avec succès (taskId: ${result.taskId})`);

    return NextResponse.json({
      success: true,
      mode: "live",
      taskId: result.taskId,
      status: "waiting",
      tool,
      modelId: officialKieModel,
      creditsCost: finalCreditsCost,
    });
  } catch (error) {
    console.error("API /api/generate error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur lors de la génération" },
      { status: 500 }
    );
  }
}

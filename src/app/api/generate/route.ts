import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { providerRouter } from "@/lib/providers/router";
import { calculateToolCost } from "@/lib/billing/pricing-calculator";

const GenerateSchema = z.object({
  tool: z.enum(["image", "video", "music", "voice"]).default("video"),
  model: z.string().optional(),
  modelId: z.string().optional(),
  prompt: z.string().min(1),
  aspectRatio: z.string().optional(),
  duration: z.number().optional(),
  resolution: z.string().optional(),
  referenceImageUrls: z.array(z.string()).optional(),
  referenceVideoUrl: z.string().optional(),
  params: z.record(z.string(), z.any()).optional(),
  creditsCost: z.number().int().positive().optional(),
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

    const {
      tool,
      model,
      modelId,
      prompt,
      aspectRatio,
      duration,
      resolution,
      referenceImageUrls,
      referenceVideoUrl,
      params,
      creditsCost,
    } = parsed.data;

    const targetModel = modelId || model || (tool === "video" ? "seedance-2-5" : "nano-banana-2-1");

    // Calcul du coût théorique en crédits
    const computedCost = calculateToolCost(tool, params || {}).cost;
    const finalCreditsCost = creditsCost && creditsCost > 0 ? creditsCost : computedCost;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://likyai.com";
    const webhookSecret = process.env.HF_WEBHOOK_SECRET || "likyai-hf-secret";
    const higgsfieldWebhookUrl = `${appUrl}/api/webhooks/higgsfield?t=${webhookSecret}`;

    // Soumission via le routeur unifié (Priorité sur KIE, failover automatique, ou Higgsfield exclusif)
    const result = await providerRouter.submitWithFailover(targetModel, prompt, {
      aspectRatio,
      duration,
      resolution,
      referenceImageUrls,
      referenceVideoUrl,
      params: {
        tool,
        ...params,
      },
      webhookUrl: higgsfieldWebhookUrl,
    });

    // Enregistrement de la tâche dans Supabase
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const { createAdminClient } = await import("@/lib/supabase/admin");
      
      let userId: string | null = null;
      try {
        const userClient = await createClient();
        const { data: { user } } = await userClient.auth.getUser();
        if (user) userId = user.id;
      } catch {}

      const adminClient = createAdminClient();
      await adminClient.from("generations").insert({
        task_id: result.requestId,
        user_id: userId,
        tool,
        model_name: targetModel,
        prompt,
        status: "generating",
        credits_cost: finalCreditsCost,
        parameters: {
          aspectRatio,
          duration,
          resolution,
          provider: result.provider,
          ...params,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn("[Generate] Impossible d'insérer dans Supabase generations:", dbErr);
    }

    return NextResponse.json({
      success: true,
      mode: result.mode,
      provider: result.provider,
      taskId: result.requestId,
      status: "waiting",
      tool,
      modelId: targetModel,
      creditsCost: finalCreditsCost,
      fallbackOf: result.fallbackOf,
    });
  } catch (error: any) {
    console.error("API /api/generate error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la génération avec le fournisseur" },
      { status: 500 }
    );
  }
}

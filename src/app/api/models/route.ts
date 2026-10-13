import { NextRequest, NextResponse, connection } from "next/server";
import { getModelsByTool, ToolKind, MODEL_REGISTRY } from "@/lib/models/registry";
import { fetchKieModels, getKieApiKey } from "@/lib/kie/client";

export async function GET(req: NextRequest) {
  await connection();
  try {
    const { searchParams } = req.nextUrl;
    const tool = searchParams.get("tool") as ToolKind | null;

    // Modèles statiques par défaut
    const baseModels = tool ? getModelsByTool(tool) : MODEL_REGISTRY;

    const apiKey = getKieApiKey();
    if (!apiKey) {
      // Retourne le registre configuré si pas de clé API KIE
      return NextResponse.json({
        success: true,
        source: "local-registry",
        models: baseModels.map((m) => ({
          id: m.kieModel,
          internalId: m.id,
          name: m.label,
          tagline: m.tagline,
          baseCost: m.pricing.likyCredits,
          pricingDesc: m.pricing.description,
          tier: m.tier,
          kind: m.kind,
          capabilities: m.capabilities,
        })),
      });
    }

    // Récupération dynamique depuis KIE.ai
    let taskTypeFilter: string | undefined;
    if (tool === "image") taskTypeFilter = "Text to Image,Image to Image";
    else if (tool === "video") taskTypeFilter = "Text to Video,Image to Video";
    else if (tool === "music") taskTypeFilter = "Text to Audio";
    else if (tool === "voice") taskTypeFilter = "Text to Speech";

    const kieCatalog = await fetchKieModels(
      taskTypeFilter ? { taskType: taskTypeFilter } : undefined
    );

    // Fusion intelligente : on enrichit avec le catalogue KIE
    const enriched = baseModels.map((m) => {
      const match = kieCatalog.find(
        (km) => km.model === m.kieModel || km.slug === m.kieModel
      );
      return {
        id: m.kieModel,
        internalId: m.id,
        name: m.label,
        tagline: match?.description || m.tagline,
        baseCost: m.pricing.likyCredits,
        pricingDesc: match?.pricingDesc || m.pricing.description,
        tier: m.tier,
        kind: m.kind,
        capabilities: m.capabilities,
        provider: match?.provider || "KIE",
      };
    });

    return NextResponse.json({
      success: true,
      source: "kie-live",
      models: enriched,
    });
  } catch (err) {
    console.error("API /api/models error:", err);
    return NextResponse.json(
      { error: "Impossible de charger les modèles" },
      { status: 500 }
    );
  }
}

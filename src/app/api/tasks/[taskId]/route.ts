import { NextRequest, NextResponse } from "next/server";
import { providerRouter } from "@/lib/providers/router";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;

    if (!taskId) {
      return NextResponse.json({ error: "taskId requis" }, { status: 400 });
    }

    if (taskId.startsWith("sim-") || taskId.startsWith("demo-")) {
      return NextResponse.json(
        { error: "Tâche de simulation obsolète. Toutes les créations sont désormais réelles." },
        { status: 400 }
      );
    }

    // Récupération de l'état réel auprès du routeur unifié
    const { provider, result } = await providerRouter.getStatus(taskId);

    if (result.state === "fail") {
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const adminClient = createAdminClient();
        await adminClient
          .from("generations")
          .update({
            status: "failed",
            fail_reason: result.error || "Échec de génération",
            updated_at: new Date().toISOString(),
          })
          .eq("task_id", taskId);
      } catch {}

      return NextResponse.json(
        {
          taskId,
          provider,
          state: "fail",
          failMsg: result.error || "Échec de génération du prestataire",
          failCode: result.failCode,
        },
        { status: 502 }
      );
    }

    if (result.state === "nsfw") {
      return NextResponse.json(
        {
          taskId,
          provider,
          state: "fail",
          failMsg: "Contenu rejeté par la modération (NSFW). Les crédits sont automatiquement remboursés.",
          failCode: "MODERATION_NSFW",
        },
        { status: 422 }
      );
    }

    // Format standardisé unifié pour le client
    const resultUrls = (result.outputs || []).map((o) => o.url);

    if (result.state === "success" && resultUrls.length > 0) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const adminClient = createAdminClient();

        const { data: genRecord } = await adminClient
          .from("generations")
          .select("id, user_id, credits_cost")
          .eq("task_id", taskId)
          .maybeSingle();

        await adminClient
          .from("generations")
          .update({
            status: "success",
            media_url: resultUrls[0],
            updated_at: new Date().toISOString(),
          })
          .eq("task_id", taskId);

        if (genRecord?.user_id && genRecord?.credits_cost) {
          const { data: profile } = await adminClient
            .from("profiles")
            .select("credits")
            .eq("id", genRecord.user_id)
            .maybeSingle();

          if (profile && typeof profile.credits === "number") {
            const newBalance = Math.max(0, profile.credits - genRecord.credits_cost);
            await adminClient
              .from("profiles")
              .update({ credits: newBalance })
              .eq("id", genRecord.user_id);
          }
        }
      } catch (dbErr) {
        console.warn("[Tasks] Erreur mise à jour Supabase generation:", dbErr);
      }
    }

    return NextResponse.json({
      taskId,
      provider,
      state: result.state,
      successFlag: result.state === "success" ? 1 : 0,
      creditsConsumed: result.creditsConsumed,
      resultUrl: resultUrls[0],
      response: {
        resultUrls,
      },
    });
  } catch (err: any) {
    console.error("API /api/tasks/[taskId] error:", err);
    return NextResponse.json(
      { error: err.message || "Erreur lors de la vérification de la tâche" },
      { status: 500 }
    );
  }
}

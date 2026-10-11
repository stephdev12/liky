import { NextRequest, NextResponse } from "next/server";
import { pollKieTask } from "@/lib/kie/client";

// Simulation in-memory pour le mode démo/local
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

if (!globalThis.__simulatedTasks) {
  globalThis.__simulatedTasks = new Map();
}

export function saveSimulatedTask(task: SimulatedTask) {
  globalThis.__simulatedTasks?.set(task.taskId, task);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;

    if (!taskId) {
      return NextResponse.json({ error: "taskId requis" }, { status: 400 });
    }

    // Gestion du mode simulation / démo
    if (taskId.startsWith("sim-") || taskId.startsWith("demo-")) {
      const sim = globalThis.__simulatedTasks?.get(taskId);
      const createdAt = sim?.createdAt || Date.now() - 3500;
      const elapsed = (Date.now() - createdAt) / 1000;

      if (elapsed < 1.0) {
        return NextResponse.json({
          taskId,
          state: "waiting",
          progress: 25,
          elapsed: Math.round(elapsed),
          message: "Analyse du prompt et allocation GPU…",
        });
      }

      if (elapsed < 2.5) {
        return NextResponse.json({
          taskId,
          state: "generating",
          progress: 65,
          elapsed: Math.round(elapsed),
          message: "Génération des latents et synthèse…",
        });
      }

      // Tâche terminée
      const defaultUrl =
        sim?.tool === "music"
          ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          : sim?.tool === "voice"
          ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
          : `/assets/organic/organic-${Math.floor(Math.random() * 4) + 1}.webp`;

      return NextResponse.json({
        taskId,
        state: "success",
        progress: 100,
        elapsed: Math.round(elapsed),
        creditsConsumed: sim?.creditsCost || 5,
        response: {
          resultUrls: [sim?.resultUrl || defaultUrl],
        },
      });
    }

    // Appel KIE réel
    const record = await pollKieTask(taskId);

    if ("error" in record) {
      return NextResponse.json(
        { error: record.error, code: record.code },
        { status: record.code === 401 ? 401 : 502 }
      );
    }

    // Réponse KIE officielle
    return NextResponse.json({
      taskId: record.taskId,
      model: record.model,
      state: record.state,
      successFlag: record.successFlag,
      costTime: record.costTime,
      creditsConsumed: record.creditsConsumed,
      failMsg: record.failMsg,
      response: record.response,
    });
  } catch (err) {
    console.error("API /api/tasks/[taskId] error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la vérification de la tâche" },
      { status: 500 }
    );
  }
}

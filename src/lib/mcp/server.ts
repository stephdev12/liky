import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  generateImage,
  generateVideo,
  generateMusic,
  generateVoice,
  checkLikyTask,
  waitForTaskCompletion,
  listLikyModels,
  getLikyBalance,
} from "./likyai-engine";

/**
 * Crée et configure une instance de serveur MCP officiel LikyAI
 */
export function createLikyMcpServer() {
  const server = new McpServer({
    name: "likyai",
    version: "1.0.0",
  });

  // ==========================================
  // OUTIL 1 : Génération d'image
  // ==========================================
  server.registerTool(
    "likyai_generate_image",
    {
      title: "Générer une image IA",
      description:
        "Génère une image cinématique ou artistique ultra-réaliste (Nano Banana 2.1, Z-Image Turbo, Seedream) via le studio LikyAI. Par défaut, attend la fin de la génération et renvoie directement l'URL de l'image.",
      inputSchema: {
        prompt: z
          .string()
          .describe("Description visuelle détaillée de l'image à générer (style, cadrage, lumière)"),
        model: z
          .string()
          .optional()
          .describe(
            "Modèle à utiliser : 'nano-banana-2-1' (recommandé), 'z-image-turbo' ou 'seedream-5-flash'"
          ),
        aspect_ratio: z
          .enum(["1:1", "16:9", "9:16", "4:3", "3:4"])
          .optional()
          .describe("Format d'image (par défaut '1:1')"),
        quality: z
          .enum(["standard", "2k", "4k"])
          .optional()
          .describe("Niveau de qualité/résolution souhaité"),
        wait_for_result: z
          .boolean()
          .optional()
          .describe(
            "Si true (défaut), attend jusqu'à 30s et renvoie l'URL finale. Si false, renvoie le taskId immédiatement."
          ),
      },
    },
    async (args) => {
      try {
        const res = await generateImage({
          prompt: args.prompt,
          model: args.model,
          aspect_ratio: args.aspect_ratio,
          quality: args.quality,
          waitForResult: args.wait_for_result !== false,
          maxWaitSeconds: 30,
        });

        const urls = res.status.resultUrls || [];
        let summary = `[LikyAI] Image générée avec succès (Modèle: ${res.model}, Mode: ${res.mode})\n`;
        summary += `TaskId: ${res.taskId}\n`;
        summary += `État: ${res.status.state}\n`;

        if (urls.length > 0) {
          summary += `\nLien de l'image: ${urls[0]}\n`;
        } else {
          summary += `\nL'image est en cours de rendu. Utilisez likyai_get_task_status avec le taskId "${res.taskId}" pour récupérer l'URL.`;
        }

        return {
          content: [
            {
              type: "text",
              text: summary,
            },
          ],
        };
      } catch (err: unknown) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `[LikyAI Erreur] Impossible de générer l'image: ${
                err instanceof Error ? err.message : String(err)
              }`,
            },
          ],
        };
      }
    }
  );

  // ==========================================
  // OUTIL 2 : Génération de vidéo
  // ==========================================
  server.registerTool(
    "likyai_generate_video",
    {
      title: "Créer une vidéo cinématique",
      description:
        "Génère une séquence vidéo cinématique avec Seedance 2.0, Kling 3.0 Turbo ou Wan 2.7. Supporte le text-to-video et l'image-to-video.",
      inputSchema: {
        prompt: z
          .string()
          .describe("Description du mouvement, de l'action de la caméra et du sujet"),
        model: z
          .string()
          .optional()
          .describe("Modèle vidéo : 'seedance-2' (défaut), 'kling-3-turbo' ou 'wan-2-7'"),
        aspect_ratio: z
          .enum(["16:9", "9:16", "1:1"])
          .optional()
          .describe("Format vidéo (par défaut '16:9')"),
        duration: z
          .number()
          .int()
          .min(3)
          .max(15)
          .optional()
          .describe("Durée en secondes (ex: 5 ou 10s)"),
        image_url: z
          .string()
          .optional()
          .describe("URL d'une image source pour animer en image-to-video"),
        wait_for_result: z
          .boolean()
          .optional()
          .describe(
            "Si true, attend la fin du rendu (peut prendre 40-60s). Si false (recommandé pour la vidéo), renvoie le taskId immédiatement."
          ),
      },
    },
    async (args) => {
      try {
        const res = await generateVideo({
          prompt: args.prompt,
          model: args.model,
          aspect_ratio: args.aspect_ratio,
          duration: args.duration,
          image_url: args.image_url,
          waitForResult: args.wait_for_result === true,
          maxWaitSeconds: 60,
        });

        const urls = res.status.resultUrls || [];
        let summary = `[LikyAI] Tâche vidéo créée (Modèle: ${res.model}, Mode: ${res.mode})\n`;
        summary += `TaskId: ${res.taskId}\n`;
        summary += `État: ${res.status.state}\n`;

        if (urls.length > 0) {
          summary += `\nLien de la vidéo: ${urls[0]}\n`;
        } else {
          summary += `\nRendu vidéo lancé. Suivez l'avancement avec: likyai_get_task_status(taskId: "${res.taskId}")`;
        }

        return {
          content: [
            {
              type: "text",
              text: summary,
            },
          ],
        };
      } catch (err: unknown) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `[LikyAI Erreur] Échec génération vidéo: ${
                err instanceof Error ? err.message : String(err)
              }`,
            },
          ],
        };
      }
    }
  );

  // ==========================================
  // OUTIL 3 : Génération de musique
  // ==========================================
  server.registerTool(
    "likyai_generate_music",
    {
      title: "Composer une musique",
      description:
        "Compose une piste musicale haute qualité avec Suno v4 à partir d'un prompt d'ambiance ou de paroles.",
      inputSchema: {
        prompt: z
          .string()
          .describe("Description de la mélodie, style musical ou paroles"),
        genre: z
          .string()
          .optional()
          .describe("Style / genre (ex: 'Afrobeats', 'Synthwave 80s', 'Lo-Fi Chill')"),
        instrumental: z
          .boolean()
          .optional()
          .describe("Piste instrumentale sans voix (défaut: false)"),
        title: z.string().optional().describe("Titre du morceau"),
        wait_for_result: z
          .boolean()
          .optional()
          .describe("Si true, attend le fichier audio final."),
      },
    },
    async (args) => {
      try {
        const res = await generateMusic({
          prompt: args.prompt,
          genre: args.genre,
          instrumental: args.instrumental,
          title: args.title,
          waitForResult: args.wait_for_result === true,
          maxWaitSeconds: 45,
        });

        const urls = res.status.resultUrls || [];
        let summary = `[LikyAI] Composition musicale initiée (Modèle: ${res.model})\n`;
        summary += `TaskId: ${res.taskId}\n`;
        summary += `État: ${res.status.state}\n`;

        if (urls.length > 0) {
          summary += `\nLien du morceau audio: ${urls[0]}\n`;
        } else {
          summary += `\nUtilisez likyai_get_task_status(taskId: "${res.taskId}") pour écouter le résultat.`;
        }

        return {
          content: [{ type: "text", text: summary }],
        };
      } catch (err: unknown) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `[LikyAI Erreur] Échec composition musicale: ${
                err instanceof Error ? err.message : String(err)
              }`,
            },
          ],
        };
      }
    }
  );

  // ==========================================
  // OUTIL 4 : Voix off & Synthèse vocale
  // ==========================================
  server.registerTool(
    "likyai_generate_voice",
    {
      title: "Générer une voix off",
      description:
        "Synthétise un texte en voix off réaliste, naturelle et expressive.",
      inputSchema: {
        prompt: z.string().describe("Texte exact à prononcer"),
        voice: z
          .string()
          .optional()
          .describe("Nom ou style de voix (ex: 'Rachel', 'Adam', 'Antoni')"),
        language: z
          .string()
          .optional()
          .describe("Code de langue (ex: 'fr', 'en')"),
        wait_for_result: z
          .boolean()
          .optional()
          .describe("Attendre le fichier audio final (défaut: true)"),
      },
    },
    async (args) => {
      try {
        const res = await generateVoice({
          prompt: args.prompt,
          voice: args.voice,
          language: args.language,
          waitForResult: args.wait_for_result !== false,
          maxWaitSeconds: 25,
        });

        const urls = res.status.resultUrls || [];
        let summary = `[LikyAI] Voix off générée (Modèle: ${res.model})\n`;
        summary += `TaskId: ${res.taskId}\n`;
        summary += `État: ${res.status.state}\n`;

        if (urls.length > 0) {
          summary += `\nLien audio MP3: ${urls[0]}\n`;
        } else {
          summary += `\nConsultez le statut avec: likyai_get_task_status(taskId: "${res.taskId}")`;
        }

        return {
          content: [{ type: "text", text: summary }],
        };
      } catch (err: unknown) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `[LikyAI Erreur] Échec synthèse vocale: ${
                err instanceof Error ? err.message : String(err)
              }`,
            },
          ],
        };
      }
    }
  );

  // ==========================================
  // OUTIL 5 : Statut d'une tâche & Récupération
  // ==========================================
  server.registerTool(
    "likyai_get_task_status",
    {
      title: "Consulter le statut d'une tâche",
      description:
        "Vérifie l'état d'avancement d'une tâche LikyAI (waiting, generating, success, fail) et renvoie les URLs des médias générés.",
      inputSchema: {
        taskId: z.string().describe("L'ID unique de la tâche retourné par une génération"),
        wait_if_generating: z
          .boolean()
          .optional()
          .describe("Si true et que la tâche est encore en cours, attend jusqu'à 20s."),
      },
    },
    async (args) => {
      try {
        let status = await checkLikyTask(args.taskId);

        if (args.wait_if_generating && (status.state === "waiting" || status.state === "generating")) {
          status = await waitForTaskCompletion(args.taskId, 20);
        }

        const urls = status.resultUrls || [];
        let summary = `[LikyAI Statut] Tâche ${args.taskId}\n`;
        summary += `État: ${status.state} (${status.progress || 0}%)\n`;
        if (status.creditsConsumed) {
          summary += `Crédits consommés: ${status.creditsConsumed}\n`;
        }
        if (status.message) {
          summary += `Détail: ${status.message}\n`;
        }
        if (urls.length > 0) {
          summary += `\nLiens des fichiers générés:\n${urls.map((u, i) => `  ${i + 1}. ${u}`).join("\n")}\n`;
        }
        if (status.error) {
          summary += `\nErreur signalée: ${status.error}\n`;
        }

        return {
          content: [{ type: "text", text: summary }],
        };
      } catch (err: unknown) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `[LikyAI Erreur] Impossible de lire le statut: ${
                err instanceof Error ? err.message : String(err)
              }`,
            },
          ],
        };
      }
    }
  );

  // ==========================================
  // OUTIL 6 : Catalogue des modèles
  // ==========================================
  server.registerTool(
    "likyai_list_models",
    {
      title: "Lister les modèles IA disponibles",
      description:
        "Affiche la liste complète des modèles d'images, vidéos, musiques et voix disponibles sur LikyAI, avec leurs coûts en crédits et leurs spécifications.",
      inputSchema: {
        category: z
          .enum(["image", "video", "music", "voice", "all"])
          .optional()
          .describe("Catégorie de modèles à filtrer (par défaut 'all')"),
      },
    },
    async (args) => {
      const models = listLikyModels(args.category);
      const text =
        `[LikyAI Modèles Disponibles]\n` +
        models
          .map(
            (m) =>
              `• ${m.name} (${m.id}) [${m.kind.toUpperCase()}]\n` +
              `  - Description: ${m.tagline}\n` +
              `  - Tarif: ${m.pricingDescription} (${m.costCredits} crédits)\n` +
              `  - Tier: ${m.tier}`
          )
          .join("\n\n");

      return {
        content: [{ type: "text", text }],
      };
    }
  );

  // ==========================================
  // OUTIL 7 : Solde et compte
  // ==========================================
  server.registerTool(
    "likyai_get_balance",
    {
      title: "Consulter le solde de crédits",
      description: "Affiche le nombre de crédits restants et le statut du compte LikyAI.",
      inputSchema: {},
    },
    async () => {
      const b = getLikyBalance();
      const text =
        `[LikyAI Compte]\n` +
        `• Solde: ${b.credits} crédits disponibles\n` +
        `• Forfait: ${b.plan}\n` +
        `• Accès MCP: ${b.mcpAccess}\n` +
        `• Statut: ${b.status}\n` +
        `Pour recharger: achetez un pack (60, 200, 500 crédits) directement via Mobile Money sur liky.ai/#pricing.`;

      return {
        content: [{ type: "text", text }],
      };
    }
  );

  // ==========================================
  // RESSOURCES & PROMPTS MCP
  // ==========================================
  server.registerResource(
    "models-catalog",
    "likyai://models",
    {
      title: "Catalogue des modèles LikyAI",
      description: "Schéma JSON complet des modèles et tarifs disponibles",
      mimeType: "application/json",
    },
    async () => {
      return {
        contents: [
          {
            uri: "likyai://models",
            mimeType: "application/json",
            text: JSON.stringify(listLikyModels("all"), null, 2),
          },
        ],
      };
    }
  );

  server.registerPrompt(
    "creative-campaign",
    {
      title: "Campagne créative multi-assets",
      description: "Génère un pack créatif complet (image d'accroche 16:9, courte vidéo et musique d'ambiance)",
    },
    async () => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                "Tu es l'assistant de direction artistique LikyAI. En utilisant les outils likyai_generate_image, likyai_generate_video et likyai_generate_music, conçois une direction créative complète pour le thème demandé par l'utilisateur.",
            },
          },
        ],
      };
    }
  );

  return server;
}

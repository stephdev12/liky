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
import {
  McpUserSession,
  deductUserCredits,
  recordMcpGeneration,
} from "./auth";
import {
  calculateImageCost,
  calculateVideoCost,
  calculateMusicCost,
  calculateVoiceCost,
} from "./pricing";

/**
 * Crée et configure une instance de serveur MCP officiel LikyAI.
 * Les appels d'inspection (list_models, get_balance, get_task_status) sont 100% GRATUITS (0 crédit).
 * Les crédits sont débités uniquement lors des générations effectives et calculés dynamiquement
 * selon les choix de l'agent (modèle, qualité, durée, format, nombre).
 */
export function createLikyMcpServer(options?: { user?: McpUserSession | null }) {
  const user = options?.user;
  const server = new McpServer({
    name: "likyai",
    version: "1.0.0",
  });

  // ==========================================
  // OUTIL 1 : Génération d'image (Crédits dynamiques)
  // ==========================================
  server.registerTool(
    "likyai_generate_image",
    {
      title: "Générer une image IA",
      description:
        "Génère une image cinématique ou artistique. Les crédits consommés dépendent du modèle choisi (Nano Banana 2: base 6, Z-Image Turbo: base 2, Seedream 5: base 5) et du niveau de qualité (1K: x1, 2K: x1.5, 4K: x2.5).",
      inputSchema: {
        prompt: z
          .string()
          .describe("Description visuelle détaillée de l'image (style, sujet, lumière, cadrage)"),
        model: z
          .enum(["nano-banana-2-1", "nano", "z-image-turbo", "soul", "seedream-5-flash", "seed"])
          .optional()
          .describe("Modèle au choix : 'nano-banana-2-1' (haute fidélité), 'z-image-turbo' (ultra-rapide, économique), 'seedream-5-flash' (stylisé)"),
        quality: z
          .enum(["1k", "1K", "standard", "2k", "2K", "4k", "4K"])
          .optional()
          .describe("Niveau de qualité : '1K' (standard), '2K' (HD), '4K' (Ultra HD)"),
        aspect_ratio: z
          .enum(["1:1", "16:9", "9:16", "4:3", "3:4", "4:5"])
          .optional()
          .describe("Format d'image (par défaut '1:1')"),
        count: z
          .number()
          .int()
          .min(1)
          .max(4)
          .optional()
          .describe("Nombre d'images à générer (1 à 4, par défaut 1)"),
        wait_for_result: z
          .boolean()
          .optional()
          .describe("Si true (défaut), attend le rendu et renvoie directement l'URL."),
      },
    },
    async (args) => {
      try {
        if (!user) {
          throw new Error("Authentification requise : Veuillez connecter votre compte LikyAI via OAuth pour utiliser vos crédits.");
        }

        const pricing = calculateImageCost({
          model: args.model,
          quality: args.quality,
          count: args.count,
        });

        // Débit exact selon la configuration choisie
        await deductUserCredits(user.userId, pricing.cost);

        const res = await generateImage({
          prompt: args.prompt,
          model: args.model,
          aspect_ratio: args.aspect_ratio as any,
          quality: args.quality?.toLowerCase() as any,
          waitForResult: args.wait_for_result !== false,
          maxWaitSeconds: 30,
        });

        const urls = res.status.resultUrls || [];
        await recordMcpGeneration({
          userId: user.userId,
          tool: "image",
          modelName: pricing.modelName,
          prompt: args.prompt,
          creditsCost: pricing.cost,
          mediaUrl: urls[0],
          taskId: res.taskId,
          status: res.status.state === "success" ? "success" : "generating",
        });

        let summary = `[LikyAI] Image générée avec succès\n`;
        summary += `• Modèle: ${pricing.modelName}\n`;
        summary += `• Qualité: ${args.quality || "1K"} | Format: ${args.aspect_ratio || "1:1"}\n`;
        summary += `• Crédits débités: ${pricing.cost} crédits (Compte: ${user.email})\n`;
        summary += `• TaskId: ${res.taskId}\n`;
        summary += `• État: ${res.status.state}\n`;

        if (urls.length > 0) {
          summary += `\nLien de l'image: ${urls[0]}\n`;
        } else {
          summary += `\nImage en cours de rendu. Utilisez likyai_get_task_status avec "${res.taskId}" pour récupérer le lien.`;
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
              text: `[LikyAI Erreur] ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        };
      }
    }
  );

  // ==========================================
  // OUTIL 2 : Génération de vidéo (Crédits dynamiques)
  // ==========================================
  server.registerTool(
    "likyai_generate_video",
    {
      title: "Générer une vidéo IA",
      description:
        "Génère une séquence vidéo cinématique. Les crédits débités dépendent du modèle (Seedance 2.0: 4 cr/s, Kling 3.0 Turbo: 18 cr/s, Wan 2.7: 12 cr/s) et de la durée en secondes.",
      inputSchema: {
        prompt: z
          .string()
          .describe("Description précise de la scène, de l'action, du mouvement de caméra et du style"),
        model: z
          .enum(["seedance", "seedance-2-0", "kling", "kling-3-0", "wan", "wan-2-7"])
          .optional()
          .describe("Modèle : 'seedance-2-0' (4 cr/s, polyvalent), 'kling-3-0' (18 cr/s, cinématique ultra-réaliste), 'wan-2-7' (12 cr/s)"),
        duration: z
          .number()
          .int()
          .min(5)
          .max(30)
          .optional()
          .describe("Durée de la vidéo en secondes (ex: 5, 10, 15 - par défaut 5)"),
        aspect_ratio: z
          .enum(["16:9", "9:16", "1:1", "4:5"])
          .optional()
          .describe("Format vidéo (ex: '16:9' paysage, '9:16' TikTok/Reels)"),
        image_url: z
          .string()
          .url()
          .optional()
          .describe("Optionnel : URL d'une image de départ à animer"),
        wait_for_result: z
          .boolean()
          .optional()
          .describe("Si true, attend la fin du rendu vidéo avant de répondre."),
      },
    },
    async (args) => {
      try {
        if (!user) {
          throw new Error("Authentification requise : Veuillez connecter votre compte LikyAI via OAuth pour utiliser vos crédits.");
        }

        const pricing = calculateVideoCost({
          model: args.model,
          durationSeconds: args.duration,
        });

        await deductUserCredits(user.userId, pricing.cost);

        const res = await generateVideo({
          prompt: args.prompt,
          model: args.model,
          aspect_ratio: args.aspect_ratio as any,
          duration: pricing.duration,
          image_url: args.image_url,
          waitForResult: args.wait_for_result === true,
          maxWaitSeconds: 60,
        });

        const urls = res.status.resultUrls || [];
        await recordMcpGeneration({
          userId: user.userId,
          tool: "video",
          modelName: pricing.modelName,
          prompt: args.prompt,
          creditsCost: pricing.cost,
          mediaUrl: urls[0],
          taskId: res.taskId,
          status: res.status.state === "success" ? "success" : "generating",
        });

        let summary = `[LikyAI] Rendu vidéo initié avec succès\n`;
        summary += `• Modèle: ${pricing.modelName} | Durée: ${pricing.duration}s\n`;
        summary += `• Crédits débités: ${pricing.cost} crédits (Compte: ${user.email})\n`;
        summary += `• TaskId: ${res.taskId}\n`;
        summary += `• État: ${res.status.state}\n`;

        if (urls.length > 0) {
          summary += `\nLien vidéo MP4: ${urls[0]}\n`;
        } else {
          summary += `\nRendu en arrière-plan. Utilisez likyai_get_task_status avec "${res.taskId}" pour récupérer le lien MP4.`;
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
              text: `[LikyAI Erreur] ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        };
      }
    }
  );

  // ==========================================
  // OUTIL 3 : Génération de musique (Crédits dynamiques)
  // ==========================================
  server.registerTool(
    "likyai_generate_music",
    {
      title: "Composer une musique",
      description:
        "Compose une piste musicale haute qualité avec Suno v4. Coût : 10 crédits par tranche de 15 secondes.",
      inputSchema: {
        prompt: z
          .string()
          .describe("Description du morceau (style, ambiance, instruments ou paroles)"),
        genre: z
          .string()
          .optional()
          .describe("Genre musical (ex: 'Afrobeats', 'Synthwave', 'Acoustic Piano')"),
        duration: z
          .number()
          .int()
          .min(15)
          .max(120)
          .optional()
          .describe("Durée approximative en secondes (ex: 15, 30, 60 - défaut: 30)"),
        instrumental: z
          .boolean()
          .optional()
          .describe("Morceau purement instrumental (défaut: false)"),
        title: z.string().optional().describe("Titre du morceau"),
        wait_for_result: z
          .boolean()
          .optional()
          .describe("Si true, attend le fichier audio final."),
      },
    },
    async (args) => {
      try {
        if (!user) {
          throw new Error("Authentification requise : Veuillez connecter votre compte LikyAI via OAuth pour utiliser vos crédits.");
        }

        const pricing = calculateMusicCost({
          durationSeconds: args.duration,
        });

        await deductUserCredits(user.userId, pricing.cost);

        const res = await generateMusic({
          prompt: args.prompt,
          genre: args.genre,
          instrumental: args.instrumental,
          title: args.title,
          waitForResult: args.wait_for_result === true,
          maxWaitSeconds: 45,
        });

        const urls = res.status.resultUrls || [];
        await recordMcpGeneration({
          userId: user.userId,
          tool: "music",
          modelName: res.model,
          prompt: args.prompt,
          creditsCost: pricing.cost,
          mediaUrl: urls[0],
          taskId: res.taskId,
          status: res.status.state === "success" ? "success" : "generating",
        });

        let summary = `[LikyAI] Musique générée (Suno v4)\n`;
        summary += `• Durée: ${pricing.duration}s | Crédits débités: ${pricing.cost} crédits\n`;
        summary += `• TaskId: ${res.taskId}\n`;
        summary += `• État: ${res.status.state}\n`;

        if (urls.length > 0) {
          summary += `\nLien audio MP3: ${urls[0]}\n`;
        } else {
          summary += `\nComposition en cours. Utilisez likyai_get_task_status avec "${res.taskId}".`;
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
              text: `[LikyAI Erreur] ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        };
      }
    }
  );

  // ==========================================
  // OUTIL 4 : Synthèse vocale & Voix off (Crédits dynamiques)
  // ==========================================
  server.registerTool(
    "likyai_generate_voice",
    {
      title: "Générer une voix off",
      description:
        "Synthétise un texte en voix off réaliste et naturelle. Coût : 2 crédits par tranche de 100 caractères (min. 2 crédits).",
      inputSchema: {
        prompt: z.string().describe("Texte exact à prononcer par la voix off"),
        voice: z
          .string()
          .optional()
          .describe("Voix ou profil vocal au choix (ex: 'Rachel', 'Adam', 'Antoni')"),
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
        if (!user) {
          throw new Error("Authentification requise : Veuillez connecter votre compte LikyAI via OAuth pour utiliser vos crédits.");
        }

        const pricing = calculateVoiceCost(args.prompt);
        await deductUserCredits(user.userId, pricing.cost);

        const res = await generateVoice({
          prompt: args.prompt,
          voice: args.voice,
          language: args.language,
          waitForResult: args.wait_for_result !== false,
          maxWaitSeconds: 25,
        });

        const urls = res.status.resultUrls || [];
        await recordMcpGeneration({
          userId: user.userId,
          tool: "voice",
          modelName: res.model,
          prompt: args.prompt,
          creditsCost: pricing.cost,
          mediaUrl: urls[0],
          taskId: res.taskId,
          status: res.status.state === "success" ? "success" : "generating",
        });

        let summary = `[LikyAI] Voix off générée avec succès\n`;
        summary += `• Longueur: ${pricing.length} caractères | Crédits débités: ${pricing.cost} crédits\n`;
        summary += `• TaskId: ${res.taskId}\n`;
        summary += `• État: ${res.status.state}\n`;

        if (urls.length > 0) {
          summary += `\nLien audio MP3: ${urls[0]}\n`;
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
              text: `[LikyAI Erreur] ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        };
      }
    }
  );

  // ==========================================
  // OUTIL 5 : Statut d'une tâche (GRATUIT - 0 crédit)
  // ==========================================
  server.registerTool(
    "likyai_get_task_status",
    {
      title: "Consulter le statut d'une tâche (Gratuit)",
      description:
        "Vérifie l'état d'avancement d'un rendu et récupère les liens de téléchargement. Cet outil ne consomme aucun crédit (0 crédit).",
      inputSchema: {
        taskId: z.string().describe("L'identifiant de la tâche retourné lors d'une génération"),
        wait_if_generating: z
          .boolean()
          .optional()
          .describe("Si true et que la tâche est en cours, attend jusqu'à 20s."),
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
        summary += `• État: ${status.state} (${status.progress || 0}%)\n`;
        if (urls.length > 0) {
          summary += `\nFichiers générés:\n${urls.map((u, i) => `  ${i + 1}. ${u}`).join("\n")}\n`;
        }
        if (status.error) {
          summary += `\nErreur: ${status.error}\n`;
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
              text: `[LikyAI Erreur] ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        };
      }
    }
  );

  // ==========================================
  // OUTIL 6 : Catalogue des modèles (GRATUIT - 0 crédit)
  // ==========================================
  server.registerTool(
    "likyai_list_models",
    {
      title: "Lister les modèles IA et tarifs (Gratuit)",
      description:
        "Affiche la liste complète des modèles avec leur tarification exacte en crédits pour vous aider à choisir selon les besoins de l'utilisateur. Cet outil ne consomme aucun crédit (0 crédit).",
      inputSchema: {
        category: z
          .enum(["image", "video", "music", "voice", "all"])
          .optional()
          .describe("Filtrer par type (image, video, music, voice, all)"),
      },
    },
    async (args) => {
      const models = listLikyModels(args.category);
      const text =
        `[LikyAI Modèles Disponibles (Appel gratuit - 0 crédit)]\n\n` +
        models
          .map(
            (m) =>
              `• ${m.name} (id: ${m.id}) [${m.kind.toUpperCase()}]\n` +
              `  - Tarification: ${m.pricingDescription}\n` +
              `  - Usage recommandé: ${m.tagline}`
          )
          .join("\n\n");

      return {
        content: [{ type: "text", text }],
      };
    }
  );

  // ==========================================
  // OUTIL 7 : Solde de crédits (GRATUIT - 0 crédit)
  // ==========================================
  server.registerTool(
    "likyai_get_balance",
    {
      title: "Consulter le solde de crédits (Gratuit)",
      description: "Affiche le nombre de crédits restants sur votre compte LikyAI. Cet outil ne consomme aucun crédit (0 crédit).",
      inputSchema: {},
    },
    async () => {
      if (user) {
        return {
          content: [
            {
              type: "text",
              text:
                `[LikyAI Compte]\n` +
                `• Email: ${user.email}\n` +
                `• Crédits disponibles: ${user.credits}\n` +
                `• Statut: Actif\n` +
                `Pour recharger vos crédits: rendez-vous sur le studio LikyAI.`,
            },
          ],
        };
      }

      const b = getLikyBalance();
      return {
        content: [
          {
            type: "text",
            text:
              `[LikyAI Compte]\n` +
              `• Crédits: ${b.credits}\n` +
              `• Statut: ${b.status}\n` +
              `Connectez votre compte LikyAI via OAuth pour utiliser vos crédits personnels.`,
          },
        ],
      };
    }
  );

  return server;
}

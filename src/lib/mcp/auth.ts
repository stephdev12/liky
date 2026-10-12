import { createAdminClient } from "@/lib/supabase/admin";

export interface McpUserSession {
  userId: string;
  email: string;
  credits: number;
}

interface OAuthCodeEntry {
  code: string;
  userId: string;
  email: string;
  clientId: string;
  redirectUri: string;
  expiresAt: number;
}

interface McpTokenEntry {
  token: string;
  userId: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __mcpOAuthCodes: Map<string, OAuthCodeEntry> | undefined;
  // eslint-disable-next-line no-var
  var __mcpTokens: Map<string, McpTokenEntry> | undefined;
}

function getCodesMap(): Map<string, OAuthCodeEntry> {
  if (!globalThis.__mcpOAuthCodes) {
    globalThis.__mcpOAuthCodes = new Map();
  }
  return globalThis.__mcpOAuthCodes;
}

function getTokensMap(): Map<string, McpTokenEntry> {
  if (!globalThis.__mcpTokens) {
    globalThis.__mcpTokens = new Map();
  }
  return globalThis.__mcpTokens;
}

/**
 * Génère un code d'autorisation OAuth pour le client (ChatGPT / Claude)
 */
export function generateOAuthCode(params: {
  userId: string;
  email: string;
  clientId: string;
  redirectUri: string;
}): string {
  const code = `liky_code_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  getCodesMap().set(code, {
    code,
    userId: params.userId,
    email: params.email,
    clientId: params.clientId,
    redirectUri: params.redirectUri,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
  return code;
}

/**
 * Échange un code d'autorisation contre un token d'accès OAuth
 */
export function exchangeOAuthCode(code: string): {
  accessToken: string;
  userId: string;
  email: string;
  expiresIn: number;
} | null {
  const entry = getCodesMap().get(code);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    getCodesMap().delete(code);
    return null;
  }

  // Code valide, on le supprime (usage unique)
  getCodesMap().delete(code);

  const accessToken = `liky_mcp_tok_${Date.now()}_${Math.random().toString(36).slice(2, 16)}`;
  const expiresIn = 30 * 24 * 60 * 60; // 30 jours (en secondes)

  getTokensMap().set(accessToken, {
    token: accessToken,
    userId: entry.userId,
    email: entry.email,
    createdAt: Date.now(),
    expiresAt: Date.now() + expiresIn * 1000,
  });

  return {
    accessToken,
    userId: entry.userId,
    email: entry.email,
    expiresIn,
  };
}

/**
 * Enregistre ou récupère une clé API personnelle permanente pour un utilisateur
 */
export function getOrCreatePersonalApiKey(userId: string, email: string): string {
  // Recherche s'il existe déjà un token pour cet utilisateur
  for (const [token, entry] of getTokensMap().entries()) {
    if (entry.userId === userId && token.startsWith("liky_sec_")) {
      return token;
    }
  }

  const apiKey = `liky_sec_${userId.slice(0, 8)}_${Math.random().toString(36).slice(2, 12)}`;
  getTokensMap().set(apiKey, {
    token: apiKey,
    userId,
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 an
  });

  return apiKey;
}

/**
 * Résout l'utilisateur LikyAI à partir du Bearer Token ou de la clé API
 */
export async function resolveMcpUser(authHeaderOrKey?: string | null): Promise<McpUserSession | null> {
  if (!authHeaderOrKey) return null;

  const rawToken = authHeaderOrKey.replace(/^Bearer\s+/i, "").trim();
  if (!rawToken) return null;

  // 1. Recherche dans le magasin de tokens MCP en mémoire
  const entry = getTokensMap().get(rawToken);
  if (entry) {
    if (Date.now() > entry.expiresAt) {
      getTokensMap().delete(rawToken);
      return null;
    }

    // Récupération du solde réel depuis la table profiles Supabase
    try {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("credits")
        .eq("id", entry.userId)
        .maybeSingle();

      const credits = profile && typeof profile.credits === "number" ? profile.credits : 0;
      return {
        userId: entry.userId,
        email: entry.email,
        credits,
      };
    } catch {
      return {
        userId: entry.userId,
        email: entry.email,
        credits: 100,
      };
    }
  }

  // 2. Si c'est un token JWT Supabase direct
  try {
    const admin = createAdminClient();
    const {
      data: { user },
      error,
    } = await admin.auth.getUser(rawToken);

    if (user && !error) {
      const { data: profile } = await admin
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .maybeSingle();

      return {
        userId: user.id,
        email: user.email || "user@liky.ai",
        credits: profile && typeof profile.credits === "number" ? profile.credits : 0,
      };
    }
  } catch {
    // Non JWT
  }

  return null;
}

/**
 * Déduit les crédits d'un utilisateur avant une génération
 */
export async function deductUserCredits(userId: string, cost: number): Promise<number> {
  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) {
    throw new Error("Impossible de trouver le compte utilisateur LikyAI.");
  }

  const currentCredits = typeof profile.credits === "number" ? profile.credits : 0;
  if (currentCredits < cost) {
    throw new Error(
      `Solde insuffisant : Vous avez ${currentCredits} crédits, mais cette opération en requiert ${cost}. Veuillez recharger sur https://liky.ai/#pricing.`
    );
  }

  const newCredits = currentCredits - cost;
  await admin.from("profiles").update({ credits: newCredits }).eq("id", userId);

  return newCredits;
}

/**
 * Enregistre une génération effectuée via MCP dans la table generations de l'utilisateur
 */
export async function recordMcpGeneration(params: {
  userId: string;
  tool: string;
  modelName: string;
  prompt: string;
  creditsCost: number;
  mediaUrl?: string;
  taskId?: string;
  status: "waiting" | "generating" | "success" | "fail";
}) {
  try {
    const admin = createAdminClient();
    await admin.from("generations").insert({
      user_id: params.userId,
      tool: params.tool,
      model_name: params.modelName,
      prompt: params.prompt,
      credits_cost: params.creditsCost,
      media_url: params.mediaUrl,
      task_id: params.taskId,
      status: params.status,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[MCP] Erreur enregistrement génération:", err);
  }
}

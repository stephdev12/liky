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

export interface RegisteredOAuthClient {
  clientId: string;
  clientSecret: string;
  clientName: string;
  redirectUris: string[];
  grantTypes: string[];
  responseTypes: string[];
  tokenEndpointAuthMethod: string;
  createdAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __mcpOAuthCodes: Map<string, OAuthCodeEntry> | undefined;
  // eslint-disable-next-line no-var
  var __mcpTokens: Map<string, McpTokenEntry> | undefined;
  // eslint-disable-next-line no-var
  var __mcpClients: Map<string, RegisteredOAuthClient> | undefined;
}

function getClientsMap(): Map<string, RegisteredOAuthClient> {
  if (!globalThis.__mcpClients) {
    globalThis.__mcpClients = new Map();

    // Client statique officiel par défaut (recommandé pour config manuelle ChatGPT & Claude)
    globalThis.__mcpClients.set("likyai_client", {
      clientId: "likyai_client",
      clientSecret: "likyai_secret",
      clientName: "LikyAI Connector (Default)",
      redirectUris: [
        "https://chatgpt.com/aip/g/oauth/callback",
        "https://chatgpt.com/api/mcp/oauth/callback",
        "https://claude.ai/api/mcp/oauth/callback",
      ],
      grantTypes: ["authorization_code", "refresh_token"],
      responseTypes: ["code"],
      tokenEndpointAuthMethod: "none",
      createdAt: Date.now(),
    });
  }
  return globalThis.__mcpClients;
}

/**
 * Enregistrement dynamique d'un client OAuth (RFC 7591 DCR)
 */
export function registerOAuthClient(params: {
  clientName?: string;
  redirectUris?: string[];
  grantTypes?: string[];
  responseTypes?: string[];
  tokenEndpointAuthMethod?: string;
}): RegisteredOAuthClient {
  const map = getClientsMap();
  const clientId = `liky_cli_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const clientSecret = `liky_sec_${Math.random().toString(36).slice(2, 16)}`;

  const client: RegisteredOAuthClient = {
    clientId,
    clientSecret,
    clientName: params.clientName || "MCP Client",
    redirectUris: params.redirectUris || [
      "https://chatgpt.com/api/mcp/oauth/callback",
      "https://claude.ai/api/mcp/oauth/callback",
    ],
    grantTypes: params.grantTypes || ["authorization_code", "refresh_token"],
    responseTypes: params.responseTypes || ["code"],
    tokenEndpointAuthMethod: params.tokenEndpointAuthMethod || "none",
    createdAt: Date.now(),
  };

  map.set(clientId, client);
  return client;
}

export function getOAuthClient(clientId?: string | null): RegisteredOAuthClient | null {
  if (!clientId) return null;
  const client = getClientsMap().get(clientId);
  if (client) return client;

  // Accepte également les identifiants génériques courants pour une compatibilité sans faille
  if (clientId === "likyai_client" || clientId === "chatgpt" || clientId === "claude") {
    return {
      clientId,
      clientSecret: "likyai_secret",
      clientName: "LikyAI Client",
      redirectUris: [],
      grantTypes: ["authorization_code", "refresh_token"],
      responseTypes: ["code"],
      tokenEndpointAuthMethod: "none",
      createdAt: Date.now(),
    };
  }
  return null;
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

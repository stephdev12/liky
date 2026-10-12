import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export interface McpUserSession {
  userId: string;
  email: string;
  credits: number;
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

const MCP_SIGN_SECRET =
  process.env.MCP_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "likyai_mcp_stateless_secret_2026_x89f";

function signPayload(payload: object): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, "utf-8").toString("base64url");
  const hmac = crypto.createHmac("sha256", MCP_SIGN_SECRET).update(b64).digest("base64url");
  return `${b64}.${hmac}`;
}

function verifyPayload<T>(signedToken: string): T | null {
  const parts = signedToken.split(".");
  if (parts.length !== 2) return null;
  const [b64, hmac] = parts;
  if (!b64 || !hmac) return null;
  const expectedHmac = crypto.createHmac("sha256", MCP_SIGN_SECRET).update(b64).digest("base64url");
  if (hmac !== expectedHmac) return null;
  try {
    const json = Buffer.from(b64, "base64url").toString("utf-8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __mcpClients: Map<string, RegisteredOAuthClient> | undefined;
}

function getClientsMap(): Map<string, RegisteredOAuthClient> {
  if (!globalThis.__mcpClients) {
    globalThis.__mcpClients = new Map();

    globalThis.__mcpClients.set("likyai_client", {
      clientId: "likyai_client",
      clientSecret: "likyai_secret",
      clientName: "LikyAI Connector",
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

/**
 * Génère un code d'autorisation OAuth signé et sans état (survit aux instances Vercel)
 */
export function generateOAuthCode(params: {
  userId: string;
  email: string;
  clientId: string;
  redirectUri: string;
}): string {
  const payload = {
    t: "c", // code
    u: params.userId,
    e: params.email,
    c: params.clientId,
    r: params.redirectUri,
    exp: Date.now() + 15 * 60 * 1000, // 15 minutes
  };
  return `liky_code_${signPayload(payload)}`;
}

/**
 * Échange un code d'autorisation OAuth contre un access token signé
 */
export function exchangeOAuthCode(code: string): {
  accessToken: string;
  userId: string;
  email: string;
  expiresIn: number;
} | null {
  if (!code.startsWith("liky_code_")) return null;
  const raw = code.replace(/^liky_code_/, "");
  const payload = verifyPayload<{
    t: string;
    u: string;
    e: string;
    exp: number;
  }>(raw);

  if (!payload || payload.t !== "c" || Date.now() > payload.exp) {
    return null;
  }

  const expiresIn = 90 * 24 * 60 * 60; // 90 jours
  const tokenPayload = {
    t: "tok",
    u: payload.u,
    e: payload.e,
    exp: Date.now() + expiresIn * 1000,
  };
  const accessToken = `liky_mcp_tok_${signPayload(tokenPayload)}`;

  return {
    accessToken,
    userId: payload.u,
    email: payload.e,
    expiresIn,
  };
}

/**
 * Génère une clé permanente pour un utilisateur
 */
export function getOrCreatePersonalApiKey(userId: string, email: string): string {
  const tokenPayload = {
    t: "tok",
    u: userId,
    e: email,
    exp: Date.now() + 365 * 24 * 60 * 60 * 1000,
  };
  return `liky_mcp_tok_${signPayload(tokenPayload)}`;
}

/**
 * Résout l'utilisateur LikyAI et consulte son solde réel
 */
export async function resolveMcpUser(authHeaderOrKey?: string | null): Promise<McpUserSession | null> {
  if (!authHeaderOrKey) return null;

  const rawToken = authHeaderOrKey.replace(/^Bearer\s+/i, "").trim();
  if (!rawToken) return null;

  // 1. Décodage du token MCP signé
  if (rawToken.startsWith("liky_mcp_tok_")) {
    const raw = rawToken.replace(/^liky_mcp_tok_/, "");
    const payload = verifyPayload<{
      t: string;
      u: string;
      e: string;
      exp: number;
    }>(raw);

    if (payload && payload.t === "tok" && Date.now() <= payload.exp) {
      try {
        const admin = createAdminClient();
        const { data: profile } = await admin
          .from("profiles")
          .select("credits")
          .eq("id", payload.u)
          .maybeSingle();

        const credits = profile && typeof profile.credits === "number" ? profile.credits : 0;
        return {
          userId: payload.u,
          email: payload.e,
          credits,
        };
      } catch {
        return {
          userId: payload.u,
          email: payload.e,
          credits: 100,
        };
      }
    }
  }

  // 2. Token statique démo ou développement
  if (
    rawToken === "likyai_secret" ||
    rawToken === "liky_sec_user_8849204" ||
    rawToken.startsWith("liky_sec_")
  ) {
    return {
      userId: "demo-creator",
      email: "creator@liky.ai",
      credits: 200,
    };
  }

  // 3. Supabase direct JWT si fourni
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
  if (userId === "demo-creator" || userId === "demo-user") {
    return 100;
  }

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) {
    throw new Error("Impossible de trouver le compte utilisateur LikyAI.");
  }

  const current = typeof profile.credits === "number" ? profile.credits : 0;
  if (current < cost) {
    throw new Error(
      `Solde insuffisant : cette génération requiert ${cost} crédits, mais votre solde actuel est de ${current} crédits. Rendez-vous sur https://liky.ai pour recharger.`
    );
  }

  const nextCredits = current - cost;
  await admin.from("profiles").update({ credits: nextCredits }).eq("id", userId);
  return nextCredits;
}

/**
 * Enregistre une génération effectuée via MCP dans la table generations
 */
export async function recordMcpGeneration(params: {
  userId: string;
  tool: "image" | "video" | "music" | "voice";
  modelName: string;
  prompt: string;
  creditsCost: number;
  mediaUrl?: string;
  taskId?: string;
  status?: "pending" | "generating" | "success" | "fail";
}) {
  try {
    if (params.userId === "demo-creator" || params.userId === "demo-user") {
      return;
    }

    const admin = createAdminClient();
    await admin.from("generations").insert({
      user_id: params.userId,
      tool: params.tool,
      model_id: params.modelName,
      prompt: params.prompt,
      credits_used: params.creditsCost,
      status: params.status || "success",
      result_url: params.mediaUrl || null,
      task_id: params.taskId || null,
    });
  } catch (err) {
    console.warn("[MCP] Erreur enregistrement génération:", err);
  }
}

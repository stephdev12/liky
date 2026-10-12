import { NextRequest, NextResponse } from "next/server";
import { createLikyMcpServer } from "@/lib/mcp/server";
import { resolveMcpUser } from "@/lib/mcp/auth";
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

/**
 * Transport en mémoire pour exécuter des requêtes JSON-RPC MCP sans état
 * dans un environnement serverless (Next.js App Router).
 */
class StatelessMcpTransport implements Transport {
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: <T extends JSONRPCMessage>(message: T) => void;

  private responses: JSONRPCMessage[] = [];
  private waiter?: (msg: JSONRPCMessage) => void;

  async start(): Promise<void> {}

  async close(): Promise<void> {
    this.onclose?.();
  }

  async send(message: JSONRPCMessage): Promise<void> {
    if (this.waiter) {
      const resolve = this.waiter;
      this.waiter = undefined;
      resolve(message);
    } else {
      this.responses.push(message);
    }
  }

  async handleClientMessage(msg: JSONRPCMessage, timeoutMs = 45000): Promise<JSONRPCMessage> {
    if (!this.onmessage) {
      throw new Error("Transport non connecté au serveur MCP");
    }

    const waitPromise = new Promise<JSONRPCMessage>((resolve, reject) => {
      if (this.responses.length > 0) {
        resolve(this.responses.shift()!);
        return;
      }

      const timer = setTimeout(() => {
        reject(new Error("Délai d'attente dépassé pour la réponse MCP"));
      }, timeoutMs);

      this.waiter = (responseMsg) => {
        clearTimeout(timer);
        resolve(responseMsg);
      };
    });

    this.onmessage(msg);
    return waitPromise;
  }
}

import {
  getBaseUrl,
  getCorsHeaders,
  handleCorsPreflight,
  getOAuthAuthorizationServerMetadata,
  getOAuthProtectedResourceMetadata,
} from "@/lib/mcp/oauth-metadata";

/**
 * OPTIONS /api/mcp
 * Support CORS preflight pour ChatGPT et Claude Web
 */
export async function OPTIONS() {
  return handleCorsPreflight();
}

/**
 * GET /api/mcp
 * Endpoint d'information, de santé et de découverte du serveur MCP LikyAI (avec OAuth)
 */
export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  const mcpEndpoint = `${baseUrl}/api/mcp`;
  const cors = getCorsHeaders(req);

  return NextResponse.json(
    {
      status: "online",
      name: "likyai-mcp",
      version: "1.0.0",
      protocolVersion: "2024-11-05",
      description: "Serveur MCP universel pour LikyAI (Images, Vidéos, Musiques, Voix off).",
      transport: "Streamable HTTP & JSON-RPC 2.0",
      endpoint: mcpEndpoint,
      resource: mcpEndpoint,
      authorization_servers: [baseUrl],
      oauth: getOAuthAuthorizationServerMetadata(baseUrl),
      protected_resource: getOAuthProtectedResourceMetadata(baseUrl),
      capabilities: {
        tools: [
          "likyai_generate_image",
          "likyai_generate_video",
          "likyai_generate_music",
          "likyai_generate_voice",
          "likyai_get_task_status",
          "likyai_list_models",
          "likyai_get_balance",
        ],
        resources: ["likyai://models"],
        prompts: ["creative-campaign"],
      },
      clientConfigExample: {
        chatgpt: {
          connection: mcpEndpoint,
          authentication: "OAuth",
          client_id: "likyai_client",
          client_secret: "likyai_secret",
          authorization_url: `${baseUrl}/mcp/authorize`,
          token_url: `${baseUrl}/api/mcp/oauth/token`,
        },
        claude_web: {
          connection: mcpEndpoint,
          client_id: "likyai_client",
        },
      },
    },
    {
      headers: {
        ...cors,
        Link: `<${baseUrl}/.well-known/oauth-protected-resource>; rel="oauth-protected-resource"`,
      },
    }
  );
}

/**
 * POST /api/mcp
 * Endpoint d'exécution JSON-RPC 2.0 officiel conforme à la spécification MCP
 */
export async function POST(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  const cors = getCorsHeaders(req);

  try {
    const authHeader = req.headers.get("authorization");
    const apiKey = authHeader?.replace(/^Bearer\s+/i, "") || req.nextUrl.searchParams.get("key");

    // Si aucune authentification n'est fournie, renvoyer le challenge 401 standard (RFC 9728)
    // C'est ce signal 401 strict qui déclenche le flow OAuth dans Claude Web & ChatGPT !
    if (!authHeader && !apiKey) {
      return NextResponse.json(
        {
          error: "unauthorized",
          error_description: "Authentification requise via OAuth 2.0. Connectez votre compte LikyAI pour utiliser le MCP avec vos crédits.",
          resource_metadata: `${baseUrl}/.well-known/oauth-protected-resource`,
          authorization_url: `${baseUrl}/mcp/authorize`,
        },
        {
          status: 401,
          headers: {
            ...cors,
            "WWW-Authenticate": `Bearer realm="LikyAI", resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`,
            Link: `<${baseUrl}/.well-known/oauth-protected-resource>; rel="oauth-protected-resource"`,
          },
        }
      );
    }

    // Résolution de l'utilisateur et de son solde de crédits
    const user = await resolveMcpUser(authHeader || apiKey);

    if (!user) {
      return NextResponse.json(
        {
          error: "invalid_token",
          error_description: "Le token d'accès est expiré ou invalide. Veuillez reconnecter votre compte.",
          resource_metadata: `${baseUrl}/.well-known/oauth-protected-resource`,
        },
        {
          status: 401,
          headers: {
            ...cors,
            "WWW-Authenticate": `Bearer error="invalid_token", error_description="The access token is expired or invalid", resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`,
          },
        }
      );
    }

    // Instanciation du serveur MCP LikyAI avec le contexte utilisateur
    const mcpServer = createLikyMcpServer({ user });
    const transport = new StatelessMcpTransport();

    await mcpServer.connect(transport);

    const body = (await req.json()) as JSONRPCMessage;

    // Traitement du message JSON-RPC
    const response = await transport.handleClientMessage(body);

    return NextResponse.json(response, {
      headers: cors,
    });
  } catch (error: unknown) {
    console.error("[MCP Error]:", error);

    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Erreur interne MCP",
        },
      },
      {
        status: 500,
        headers: cors,
      }
    );
  }
}

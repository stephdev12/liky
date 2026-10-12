import { NextRequest, NextResponse } from "next/server";
import { createLikyMcpServer } from "@/lib/mcp/server";
import { resolveMcpUser } from "@/lib/mcp/auth";
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import {
  getBaseUrl,
  getCorsHeaders,
  handleCorsPreflight,
  getOAuthAuthorizationServerMetadata,
  getOAuthProtectedResourceMetadata,
} from "@/lib/mcp/oauth-metadata";

/**
 * Transport en mémoire conforme à la spécification MCP Streamable HTTP.
 * Gère correctement les requêtes (attente de réponse) et les notifications
 * (retourne null pour générer un HTTP 202 Accepted sans bloquer).
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

  async handleClientMessage(msg: JSONRPCMessage, timeoutMs = 25000): Promise<JSONRPCMessage | null> {
    if (!this.onmessage) {
      throw new Error("Transport non connecté au serveur MCP");
    }

    // Les notifications JSON-RPC n'ont pas d'id et n'attendent aucune réponse.
    const isNotification = !("id" in msg) || msg.id === undefined || msg.id === null;
    if (isNotification) {
      this.onmessage(msg);
      return null;
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

/**
 * OPTIONS /api/mcp
 * Support CORS preflight complet pour ChatGPT, Claude Web et Cursor
 */
export async function OPTIONS() {
  return handleCorsPreflight();
}

/**
 * GET /api/mcp
 * Gère à la fois le flux SSE (Server-Sent Events) pour les clients MCP temps réel
 * et la découverte de métadonnées JSON / OAuth RFC 9728.
 */
export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  const cors = getCorsHeaders(req);
  const acceptHeader = req.headers.get("accept") || "";

  // Si le client demande un flux SSE (Claude Desktop, Claude Code ou Cursor SSE)
  if (acceptHeader.includes("text/event-stream")) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Envoi de l'événement endpoint requis par la spécification MCP SSE
        const endpointData = `event: endpoint\ndata: ${baseUrl}/api/mcp\n\n`;
        controller.enqueue(encoder.encode(endpointData));

        // Envoi d'un commentaire keep-alive initial
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      },
    });

    return new Response(stream, {
      headers: {
        ...cors,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  // Découverte JSON par défaut
  const mcpEndpoint = `${baseUrl}/api/mcp`;
  return NextResponse.json(
    {
      status: "online",
      name: "likyai-mcp",
      version: "1.0.0",
      protocolVersion: "2024-11-05",
      description: "Serveur MCP universel pour LikyAI (Images, Vidéos, Musiques, Voix off).",
      transport: "Streamable HTTP & SSE & JSON-RPC 2.0",
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
 * Endpoint d'exécution JSON-RPC 2.0 officiel conforme à la spécification MCP Streamable HTTP.
 */
export async function POST(req: NextRequest) {
  const cors = getCorsHeaders(req);

  try {
    const authHeader = req.headers.get("authorization");
    const apiKey = authHeader?.replace(/^Bearer\s+/i, "") || req.nextUrl.searchParams.get("key");

    // Résolution de la session utilisateur si un token valide est fourni
    const user = await resolveMcpUser(authHeader || apiKey);

    // Lecture du payload JSON-RPC
    const body = (await req.json().catch(() => null)) as JSONRPCMessage | JSONRPCMessage[] | null;

    if (!body) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "JSON invalide" },
        },
        { status: 400, headers: cors }
      );
    }

    // Instanciation du serveur MCP LikyAI avec le contexte utilisateur (ou invité pour découverte)
    const mcpServer = createLikyMcpServer({ user });
    const transport = new StatelessMcpTransport();
    await mcpServer.connect(transport);

    // 1. Cas d'un lot de messages (Batch JSON-RPC)
    if (Array.isArray(body)) {
      const responses: JSONRPCMessage[] = [];
      for (const item of body) {
        const res = await transport.handleClientMessage(item);
        if (res) responses.push(res);
      }
      return NextResponse.json(responses, { headers: cors });
    }

    // 2. Notification JSON-RPC (pas d'id, ex: notifications/initialized)
    // La spécification MCP exige impérativement un code HTTP 202 Accepted sans corps.
    const isNotification = !("id" in body) || body.id === undefined || body.id === null;
    if (isNotification) {
      await transport.handleClientMessage(body);
      return new NextResponse(null, {
        status: 202,
        headers: cors,
      });
    }

    // 3. Requête JSON-RPC avec id (initialize, tools/list, tools/call, ping, etc.)
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

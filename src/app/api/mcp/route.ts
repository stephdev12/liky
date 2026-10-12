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

/**
 * GET /api/mcp
 * Endpoint d'information, de santé et de découverte du serveur MCP LikyAI (avec OAuth)
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get("host") || "liky.ai";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const mcpEndpoint = `${baseUrl}/api/mcp`;

  return NextResponse.json({
    status: "online",
    name: "likyai-mcp",
    version: "1.0.0",
    protocolVersion: "2024-11-05",
    description: "Serveur MCP universel pour LikyAI (Images, Vidéos, Musiques, Voix off).",
    transport: "Streamable HTTP & JSON-RPC 2.0",
    endpoint: mcpEndpoint,
    oauth: {
      authorization_endpoint: `${baseUrl}/mcp/authorize`,
      token_endpoint: `${baseUrl}/api/mcp/oauth/token`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"],
      scope_supported: ["mcp:tools"],
    },
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
        authorization_url: `${baseUrl}/mcp/authorize`,
        token_url: `${baseUrl}/api/mcp/oauth/token`,
      },
      claude_web: {
        connection: mcpEndpoint,
      },
      claude_desktop: {
        mcpServers: {
          likyai: {
            url: mcpEndpoint,
            headers: {
              Authorization: "Bearer <VOTRE_CLE_API_LIKYAI>",
            },
          },
        },
      },
      cursor: {
        type: "command",
        command: "npx",
        args: ["-y", "likyai-mcp"],
      },
    },
  });
}

/**
 * POST /api/mcp
 * Endpoint d'exécution JSON-RPC 2.0 officiel conforme à la spécification MCP
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const apiKey = authHeader?.replace(/^Bearer\s+/i, "") || req.nextUrl.searchParams.get("key");

    // Résolution de l'utilisateur et de son solde de crédits
    const user = await resolveMcpUser(authHeader || apiKey);

    // Instanciation du serveur MCP LikyAI avec le contexte utilisateur
    const mcpServer = createLikyMcpServer({ user });
    const transport = new StatelessMcpTransport();

    await mcpServer.connect(transport);

    const body = (await req.json()) as JSONRPCMessage;

    // Traitement du message JSON-RPC
    const response = await transport.handleClientMessage(body);

    return NextResponse.json(response);
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
      { status: 500 }
    );
  }
}

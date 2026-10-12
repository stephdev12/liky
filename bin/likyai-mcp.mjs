#!/usr/bin/env node

/**
 * LikyAI MCP Server - Stdio CLI Runner
 * Permet de connecter Claude Desktop, Claude Code, Cursor et Windsurf directement à LikyAI en mode stdio.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const ENDPOINT = process.env.LIKYAI_ENDPOINT || "http://localhost:3000/api/mcp";
const API_KEY = process.env.LIKYAI_API_KEY || process.env.KIE_API_KEY || "";

async function sendMcpRequest(method, params = {}) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (API_KEY) {
    headers["Authorization"] = `Bearer ${API_KEY}`;
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!res.ok) {
    throw new Error(`Erreur HTTP LikyAI: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || "Erreur MCP");
  }

  return data.result;
}

const server = new Server(
  {
    name: "likyai",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// 1. Liste des outils
server.setRequestHandler(ListToolsRequestSchema, async () => {
  try {
    const result = await sendMcpRequest("tools/list");
    return result;
  } catch (err) {
    console.error("[likyai-mcp] Erreur tools/list:", err.message);
    return { tools: [] };
  }
});

// 2. Appel d'un outil
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const result = await sendMcpRequest("tools/call", {
      name: request.params.name,
      arguments: request.params.arguments,
    });
    return result;
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `[LikyAI Erreur] ${err.message}`,
        },
      ],
    };
  }
});

// 3. Ressources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const result = await sendMcpRequest("resources/list");
    return result;
  } catch {
    return { resources: [] };
  }
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  return await sendMcpRequest("resources/read", {
    uri: request.params.uri,
  });
});

// 4. Prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  try {
    const result = await sendMcpRequest("prompts/list");
    return result;
  } catch {
    return { prompts: [] };
  }
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  return await sendMcpRequest("prompts/get", {
    name: request.params.name,
  });
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[likyai-mcp] Connecté et prêt via stdio (Endpoint:", ENDPOINT, ")");
}

main().catch((err) => {
  console.error("[likyai-mcp Fatal]:", err);
  process.exit(1);
});

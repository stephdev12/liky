import { NextRequest, NextResponse } from "next/server";
import { registerOAuthClient } from "@/lib/mcp/auth";
import { getCorsHeaders, handleCorsPreflight } from "@/lib/mcp/oauth-metadata";

export async function OPTIONS() {
  return handleCorsPreflight();
}

/**
 * POST /api/mcp/oauth/register
 * Enregistrement dynamique de client OAuth 2.0 (RFC 7591 / Claude Web / ChatGPT).
 */
export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json().catch(() => ({}));
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        body[key] = value;
      });
    }

    const clientName = (body.client_name as string) || "Claude / ChatGPT MCP Connector";
    let redirectUris: string[] = [];
    if (Array.isArray(body.redirect_uris)) {
      redirectUris = body.redirect_uris.map(String);
    } else if (typeof body.redirect_uris === "string") {
      redirectUris = [body.redirect_uris];
    } else {
      redirectUris = [
        "https://claude.ai/api/mcp/oauth/callback",
        "https://chatgpt.com/api/mcp/oauth/callback",
      ];
    }

    const grantTypes = Array.isArray(body.grant_types)
      ? body.grant_types.map(String)
      : ["authorization_code", "refresh_token"];

    const responseTypes = Array.isArray(body.response_types)
      ? body.response_types.map(String)
      : ["code"];

    const tokenEndpointAuthMethod =
      (body.token_endpoint_auth_method as string) || "none";

    const client = registerOAuthClient({
      clientName,
      redirectUris,
      grantTypes,
      responseTypes,
      tokenEndpointAuthMethod,
    });

    return NextResponse.json(
      {
        client_id: client.clientId,
        client_secret: client.clientSecret,
        client_name: client.clientName,
        redirect_uris: client.redirectUris,
        grant_types: client.grantTypes,
        response_types: client.responseTypes,
        token_endpoint_auth_method: client.tokenEndpointAuthMethod,
        client_id_issued_at: Math.floor(client.createdAt / 1000),
      },
      {
        status: 201,
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[OAuth Dynamic Client Registration Error]:", error);
    return NextResponse.json(
      {
        error: "invalid_client_metadata",
        error_description: "Impossible d'enregistrer le client OAuth.",
      },
      {
        status: 400,
        headers: getCorsHeaders(req),
      }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      description: "Endpoint RFC 7591 Dynamic Client Registration pour LikyAI MCP",
      default_client_id: "likyai_client",
      default_client_secret: "likyai_secret",
    },
    {
      headers: getCorsHeaders(req),
    }
  );
}

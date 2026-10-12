import { NextRequest, NextResponse } from "next/server";
import { exchangeOAuthCode } from "@/lib/mcp/auth";
import { getCorsHeaders, handleCorsPreflight } from "@/lib/mcp/oauth-metadata";

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function POST(req: NextRequest) {
  try {
    let code: string | null = null;
    let grantType: string | null = null;
    let clientId: string | null = null;
    let clientSecret: string | null = null;
    let refreshToken: string | null = null;

    // 1. Parsing Basic Auth header if present
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("basic ")) {
      try {
        const credentials = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
        const [id, secret] = credentials.split(":");
        clientId = id;
        clientSecret = secret;
      } catch {
        // Ignorer si parsing échoue
      }
    }

    // 2. Parsing Body (form-urlencoded ou JSON)
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      code = (formData.get("code") as string) || null;
      grantType = (formData.get("grant_type") as string) || null;
      refreshToken = (formData.get("refresh_token") as string) || null;
      if (!clientId) clientId = (formData.get("client_id") as string) || null;
      if (!clientSecret) clientSecret = (formData.get("client_secret") as string) || null;
    } else {
      const json = await req.json().catch(() => ({}));
      code = json.code || null;
      grantType = json.grant_type || null;
      refreshToken = json.refresh_token || null;
      if (!clientId) clientId = json.client_id || null;
      if (!clientSecret) clientSecret = json.client_secret || null;
    }

    // 3. Gestion du Refresh Token (pour sessions persistantes Claude & ChatGPT)
    if (grantType === "refresh_token" || (!code && refreshToken)) {
      const newAccessToken = `liky_mcp_tok_${Date.now()}_${Math.random().toString(36).slice(2, 16)}`;
      const newRefreshToken = `liky_mcp_ref_${Date.now()}_${Math.random().toString(36).slice(2, 16)}`;

      return NextResponse.json(
        {
          access_token: newAccessToken,
          token_type: "Bearer",
          expires_in: 30 * 24 * 60 * 60,
          refresh_token: newRefreshToken,
          scope: "mcp:tools",
        },
        {
          headers: {
            ...getCorsHeaders(req),
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            Pragma: "no-cache",
          },
        }
      );
    }

    // 4. Gestion de l'Authorization Code
    if (!code) {
      return NextResponse.json(
        {
          error: "invalid_request",
          error_description: "Le paramètre code est requis",
        },
        {
          status: 400,
          headers: getCorsHeaders(req),
        }
      );
    }

    const session = exchangeOAuthCode(code);
    if (!session) {
      return NextResponse.json(
        {
          error: "invalid_grant",
          error_description: "Code d'autorisation expiré ou invalide",
        },
        {
          status: 400,
          headers: getCorsHeaders(req),
        }
      );
    }

    const generatedRefreshToken = `liky_mcp_ref_${Date.now()}_${Math.random().toString(36).slice(2, 16)}`;

    return NextResponse.json(
      {
        access_token: session.accessToken,
        token_type: "Bearer",
        expires_in: session.expiresIn,
        refresh_token: generatedRefreshToken,
        scope: "mcp:tools",
        user_id: session.userId,
        email: session.email,
      },
      {
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[OAuth Token Error]:", error);
    return NextResponse.json(
      {
        error: "server_error",
        error_description: "Erreur lors de l'échange du token OAuth",
      },
      {
        status: 500,
        headers: getCorsHeaders(req),
      }
    );
  }
}

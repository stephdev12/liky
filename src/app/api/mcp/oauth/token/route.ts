import { NextRequest, NextResponse } from "next/server";
import { exchangeOAuthCode } from "@/lib/mcp/auth";

export async function POST(req: NextRequest) {
  try {
    let code: string | null = null;
    let grantType: string | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      code = formData.get("code") as string | null;
      grantType = formData.get("grant_type") as string | null;
    } else {
      const json = await req.json();
      code = json.code;
      grantType = json.grant_type;
    }

    if (!code) {
      return NextResponse.json(
        { error: "invalid_request", error_description: "Le paramètre code est requis" },
        { status: 400 }
      );
    }

    const session = exchangeOAuthCode(code);
    if (!session) {
      return NextResponse.json(
        { error: "invalid_grant", error_description: "Code d'autorisation expiré ou invalide" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      access_token: session.accessToken,
      token_type: "Bearer",
      expires_in: session.expiresIn,
      scope: "mcp:tools",
      user_id: session.userId,
      email: session.email,
    });
  } catch (error: unknown) {
    console.error("[OAuth Token Error]:", error);
    return NextResponse.json(
      { error: "server_error", error_description: "Erreur lors de l'échange du token" },
      { status: 500 }
    );
  }
}

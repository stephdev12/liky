import { NextRequest, NextResponse } from "next/server";
import { generateOAuthCode } from "@/lib/mcp/auth";
import { getCorsHeaders, handleCorsPreflight } from "@/lib/mcp/oauth-metadata";

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function POST(req: NextRequest) {
  try {
    const { userId, email, clientId, redirectUri, state } = await req.json();

    if (!userId || !redirectUri) {
      return NextResponse.json(
        { error: "Paramètres manquants (userId et redirectUri requis)" },
        { status: 400 }
      );
    }

    const code = generateOAuthCode({
      userId,
      email: email || "user@liky.ai",
      clientId: clientId || "chatgpt",
      redirectUri,
    });

    const targetUrl = new URL(redirectUri);
    targetUrl.searchParams.set("code", code);
    if (state) {
      targetUrl.searchParams.set("state", state);
    }

    return NextResponse.json({
      success: true,
      code,
      redirectUrl: targetUrl.toString(),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Erreur lors de la génération du code d'autorisation" },
      { status: 500 }
    );
  }
}

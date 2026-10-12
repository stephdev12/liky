import { NextRequest, NextResponse } from "next/server";
import {
  getBaseUrl,
  getCorsHeaders,
  handleCorsPreflight,
  getOAuthAuthorizationServerMetadata,
} from "@/lib/mcp/oauth-metadata";

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  const metadata = getOAuthAuthorizationServerMetadata(baseUrl);

  return NextResponse.json(metadata, {
    headers: {
      ...getCorsHeaders(req),
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

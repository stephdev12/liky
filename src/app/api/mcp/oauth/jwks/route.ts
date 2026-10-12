import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders, handleCorsPreflight } from "@/lib/mcp/oauth-metadata";

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      keys: [],
    },
    {
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": "application/json",
      },
    }
  );
}

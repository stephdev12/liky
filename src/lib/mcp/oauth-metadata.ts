import { NextRequest, NextResponse } from "next/server";

/**
 * Résout l'URL de base publique (schéma + domaine) dynamiquement à partir de la requête.
 * Fonctionne sur Vercel, en local et avec n'importe quel domaine personnalisé.
 */
export function getBaseUrl(req: NextRequest): string {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost || req.headers.get("host") || "liky.ai";
  const protocol = forwardedProto || (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

/**
 * En-têtes CORS obligatoires pour les clients MCP distants (ChatGPT, Claude Web, Cursor).
 */
export function getCorsHeaders(req?: NextRequest): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, Accept, MCP-Protocol-Version, X-Requested-With",
    "Access-Control-Expose-Headers": "WWW-Authenticate, Link",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Réponse standard pour requêtes OPTIONS (CORS preflight).
 */
export function handleCorsPreflight() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

/**
 * Métadonnées du serveur d'autorisation OAuth 2.0 (RFC 8414 & OpenID Connect Discovery).
 * Utilisé par ChatGPT et Claude Web pour configurer automatiquement l'OAuth.
 */
export function getOAuthAuthorizationServerMetadata(baseUrl: string) {
  return {
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/mcp/authorize`,
    token_endpoint: `${baseUrl}/api/mcp/oauth/token`,
    registration_endpoint: `${baseUrl}/api/mcp/oauth/register`,
    jwks_uri: `${baseUrl}/api/mcp/oauth/jwks`,
    scopes_supported: ["mcp:tools", "offline_access"],
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: [
      "none",
      "client_secret_post",
      "client_secret_basic",
    ],
    code_challenge_methods_supported: ["S256", "plain"],
    service_documentation: `${baseUrl}/api/mcp`,
  };
}

/**
 * Métadonnées de la ressource protégée OAuth 2.0 (RFC 9728).
 * Permet aux clients MCP (Claude Web, etc.) de découvrir l'autorité d'authentification.
 */
export function getOAuthProtectedResourceMetadata(baseUrl: string) {
  return {
    resource: `${baseUrl}/api/mcp`,
    authorization_servers: [baseUrl],
    scopes_supported: ["mcp:tools", "offline_access"],
    bearer_methods_supported: ["header"],
  };
}

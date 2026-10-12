"use client";

import React, { useState } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { cn } from "@/lib/utils";

interface McpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "chatgpt" | "claude_web" | "cursor" | "claude_desktop" | "claude_code" | "tools";

export function McpModal({ isOpen, onClose }: McpModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("chatgpt");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== "undefined" ? window.location.origin : "https://liky.ai";
  const mcpEndpoint = `${currentHost}/api/mcp`;
  const oauthAuthorizeUrl = `${currentHost}/mcp/authorize`;
  const oauthTokenUrl = `${currentHost}/api/mcp/oauth/token`;
  const defaultApiKey = "liky_sec_user_8849204";

  const claudeDesktopConfig = JSON.stringify(
    {
      mcpServers: {
        likyai: {
          url: mcpEndpoint,
          headers: {
            Authorization: `Bearer ${defaultApiKey}`,
          },
        },
      },
    },
    null,
    2
  );

  const cursorConfig = JSON.stringify(
    {
      mcpServers: {
        likyai: {
          url: mcpEndpoint,
        },
      },
    },
    null,
    2
  );

  const claudeCodeCommand = `claude mcp add likyai -- url ${mcpEndpoint}`;

  const copyToClipboard = (text: string, isKey = false) => {
    navigator.clipboard.writeText(text);
    if (isKey) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 bg-[var(--field)]">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              <CoolIcon name="terminal" size={18} duotone secondaryColor="currentColor" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
                Protocole MCP Universel
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                  OAuth & Débit Personnel
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Connectez ChatGPT, Claude, Cursor ou Hermes en utilisant vos crédits personnels
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-[var(--hover)] hover:text-foreground transition-colors"
          >
            <CoolIcon name="close-md" size={18} duotone={false} />
          </button>
        </div>

        {/* Endpoint Bar */}
        <div className="border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-muted-foreground shrink-0">Connection URL :</span>
            <code className="px-2 py-1 rounded bg-[var(--field)] border border-[var(--line)] font-mono text-[11px] truncate select-all text-foreground">
              {mcpEndpoint}
            </code>
          </div>
          <button
            onClick={() => copyToClipboard(mcpEndpoint, true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--field)] hover:bg-[var(--hover)] border border-[var(--line)] text-xs font-medium shrink-0 transition-colors"
          >
            <CoolIcon
              name={copiedKey ? "check" : "copy"}
              size={13}
              duotone={false}
              className={copiedKey ? "text-emerald-600 dark:text-emerald-400" : ""}
            />
            <span>{copiedKey ? "Copié !" : "Copier URL"}</span>
          </button>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-[var(--line)] px-5 gap-2 bg-[var(--field)] overflow-x-auto">
          {[
            { id: "chatgpt", label: "ChatGPT (OAuth)" },
            { id: "claude_web", label: "Claude Web" },
            { id: "cursor", label: "Cursor" },
            { id: "claude_desktop", label: "Claude Desktop" },
            { id: "claude_code", label: "Claude Code CLI" },
            { id: "tools", label: "7 Outils" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "py-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-emerald-600 text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1 : CHATGPT (OAUTH) */}
          {activeTab === "chatgpt" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed space-y-1">
                <span className="font-semibold block text-emerald-900 dark:text-emerald-200">
                  Connexion sécurisée avec votre compte LikyAI
                </span>
                <p>
                  Lorsque vous connectez ce MCP dans ChatGPT, une fenêtre d&apos;autorisation LikyAI s&apos;ouvrira pour vous connecter. ChatGPT utilisera <strong>exclusivement vos crédits personnels</strong> à chaque génération.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  1. Configuration principale (ChatGPT Custom Action / Tool) :
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                    <span className="text-muted-foreground block text-[11px]">Name :</span>
                    <span className="font-semibold text-foreground">LikyAI</span>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                    <span className="text-muted-foreground block text-[11px]">Authentication :</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">OAuth</span>
                  </div>

                  <div className="sm:col-span-2 p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                    <span className="text-muted-foreground block text-[11px]">Connection (URL) :</span>
                    <span className="font-mono text-foreground select-all break-all">{mcpEndpoint}</span>
                  </div>
                </div>

                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono pt-1">
                  2. Si ChatGPT demande les paramètres manuels (Manual OAuth Settings) :
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                    <span className="text-muted-foreground block text-[11px]">Client ID :</span>
                    <span className="font-mono font-semibold text-foreground select-all">likyai_client</span>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                    <span className="text-muted-foreground block text-[11px]">Client Secret :</span>
                    <span className="font-mono font-semibold text-foreground select-all">likyai_secret</span>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                    <span className="text-muted-foreground block text-[11px]">Client Authentication :</span>
                    <span className="text-foreground font-medium">Send in request body (ou Basic)</span>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                    <span className="text-muted-foreground block text-[11px]">Scope :</span>
                    <span className="font-mono text-foreground select-all">mcp:tools</span>
                  </div>

                  <div className="sm:col-span-2 p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                    <span className="text-muted-foreground block text-[11px]">Authorization URL (OAuth) :</span>
                    <span className="font-mono text-foreground select-all break-all">{oauthAuthorizeUrl}</span>
                  </div>

                  <div className="sm:col-span-2 p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                    <span className="text-muted-foreground block text-[11px]">Token URL (OAuth) :</span>
                    <span className="font-mono text-foreground select-all break-all">{oauthTokenUrl}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 : CLAUDE WEB */}
          {activeTab === "claude_web" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Dans Claude Web (claude.ai), ouvrez <strong>Settings &gt; Connectors &gt; Add custom connector</strong>.
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                  <span className="text-muted-foreground block text-[11px]">Name :</span>
                  <span className="font-semibold text-foreground">LikyAI</span>
                </div>

                <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                  <span className="text-muted-foreground block text-[11px]">Connector HTTPS URL :</span>
                  <span className="font-mono text-foreground select-all break-all">{mcpEndpoint}</span>
                </div>

                <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                  <span className="text-muted-foreground block text-[11px]">OAuth Client ID (si demandé) :</span>
                  <span className="font-mono font-semibold text-foreground select-all">likyai_client</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Le serveur supporte l&apos;enregistrement automatique (RFC 7591) ainsi que le Client ID statique <code>likyai_client</code>. Vous serez redirigé vers LikyAI pour vous identifier et autoriser le connecteur à utiliser vos crédits personnels.
              </p>
            </div>
          )}

          {/* TAB 3 : CURSOR */}
          {activeTab === "cursor" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Dans Cursor, ouvrez <strong>Settings &gt; Features &gt; MCP</strong>, cliquez sur{" "}
                <strong>Add New MCP Server</strong> :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                  <span className="text-muted-foreground block text-[11px]">Type :</span>
                  <span className="font-semibold text-foreground">SSE / Remote HTTP</span>
                </div>
                <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                  <span className="text-muted-foreground block text-[11px]">Name :</span>
                  <span className="font-semibold text-foreground">likyai</span>
                </div>
                <div className="sm:col-span-2 p-3 rounded-xl border border-[var(--line)] bg-[var(--field)]">
                  <span className="text-muted-foreground block text-[11px]">URL :</span>
                  <span className="font-mono text-foreground select-all break-all">{mcpEndpoint}</span>
                </div>
              </div>
              <div className="relative pt-2">
                <pre className="p-3 rounded-xl bg-black/90 text-emerald-400 font-mono text-xs overflow-x-auto border border-white/10">
                  {cursorConfig}
                </pre>
                <button
                  onClick={() => copyToClipboard(cursorConfig)}
                  className="absolute top-4.5 right-2.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] flex items-center gap-1 transition-colors"
                >
                  <CoolIcon name={copiedConfig ? "check" : "copy"} size={12} duotone={false} />
                  <span>{copiedConfig ? "Copié !" : "Copier"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4 : CLAUDE DESKTOP */}
          {activeTab === "claude_desktop" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Collez cette configuration dans votre fichier{" "}
                <code className="text-foreground font-mono bg-[var(--field)] px-1 rounded">
                  claude_desktop_config.json
                </code>{" "}
                (accessible depuis Claude Desktop &gt; Paramètres &gt; Developer) :
              </p>
              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-black/90 text-emerald-400 font-mono text-xs overflow-x-auto border border-white/10 leading-relaxed">
                  {claudeDesktopConfig}
                </pre>
                <button
                  onClick={() => copyToClipboard(claudeDesktopConfig)}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] flex items-center gap-1 transition-colors"
                >
                  <CoolIcon name={copiedConfig ? "check" : "copy"} size={12} duotone={false} />
                  <span>{copiedConfig ? "Copié !" : "Copier"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5 : CLAUDE CODE CLI */}
          {activeTab === "claude_code" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Exécutez cette commande dans votre terminal pour intégrer LikyAI directement à Claude Code CLI :
              </p>
              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-black/90 text-emerald-400 font-mono text-xs overflow-x-auto border border-white/10">
                  {claudeCodeCommand}
                </pre>
                <button
                  onClick={() => copyToClipboard(claudeCodeCommand)}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] flex items-center gap-1 transition-colors"
                >
                  <CoolIcon name={copiedConfig ? "check" : "copy"} size={12} duotone={false} />
                  <span>{copiedConfig ? "Copié !" : "Copier"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6 : LISTE DES OUTILS */}
          {activeTab === "tools" && (
            <div className="space-y-2.5">
              {[
                {
                  name: "likyai_generate_image",
                  desc: "Génère des images 2K/4K ultra-détaillées avec Nano Banana, Z-Image ou Seedream.",
                  params: "prompt, model?, aspect_ratio?, quality?, wait_for_result?",
                  cost: "5 crédits",
                },
                {
                  name: "likyai_generate_video",
                  desc: "Crée des vidéos cinématiques Seedance 2.0, Kling 3.0 Turbo ou Wan 2.7.",
                  params: "prompt, model?, aspect_ratio?, duration?, image_url?",
                  cost: "15 crédits",
                },
                {
                  name: "likyai_generate_music",
                  desc: "Compose des musiques complètes et bandes-son avec Suno v4.",
                  params: "prompt, genre?, instrumental?, title?",
                  cost: "10 crédits",
                },
                {
                  name: "likyai_generate_voice",
                  desc: "Synthétise des voix off naturelles et expressives en plusieurs langues.",
                  params: "prompt, voice?, language?",
                  cost: "5 crédits",
                },
                {
                  name: "likyai_get_task_status",
                  desc: "Consulte l'avancement d'un rendu et récupère les liens de téléchargement.",
                  params: "taskId, wait_if_generating?",
                  cost: "Gratuit",
                },
                {
                  name: "likyai_list_models",
                  desc: "Explore le catalogue dynamique des modèles IA et leurs coûts en crédits.",
                  params: "category? ('image', 'video', 'music', 'voice')",
                  cost: "Gratuit",
                },
                {
                  name: "likyai_get_balance",
                  desc: "Consulte le solde de crédits et l'état de votre compte personnel.",
                  params: "-",
                  cost: "Gratuit",
                },
              ].map((tool) => (
                <div
                  key={tool.name}
                  className="p-3 rounded-xl border border-[var(--line)] bg-[var(--field)] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                      {tool.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--line)]">
                      {tool.cost}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11.5px]">{tool.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--line)] bg-[var(--field)] px-5 py-3 flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            Recharge Mobile Money (MTN, Orange, Wave) disponible sans abonnement sur liky.ai
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

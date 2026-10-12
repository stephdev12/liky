"use client";

import React, { useState } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { cn } from "@/lib/utils";

interface McpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "claude_desktop" | "cursor" | "claude_code" | "http" | "tools";

export function McpModal({ isOpen, onClose }: McpModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("claude_desktop");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testOutput, setTestOutput] = useState<string>("");

  if (!isOpen) return null;

  const currentHost = typeof window !== "undefined" ? window.location.origin : "https://liky.ai";
  const mcpEndpoint = `${currentHost}/api/mcp`;
  const defaultApiKey = "liky_live_mcp_sec_8849204";

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

  const runTestPing = async () => {
    setTestStatus("loading");
    setTestOutput("");
    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/list",
        }),
      });
      const data = await res.json();
      setTestStatus("success");
      setTestOutput(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setTestStatus("error");
      setTestOutput(err instanceof Error ? err.message : "Erreur de connexion");
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
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-[var(--lime)]/10 border border-emerald-500/20 dark:border-[var(--lime)]/20 text-emerald-700 dark:text-[var(--lime)]">
              <CoolIcon name="terminal" size={18} duotone secondaryColor="currentColor" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
                Protocole MCP Universel
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-[var(--lime)] border border-emerald-500/20 font-normal">
                  v1.0 Online
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Connectez vos agents IA à LikyAI (Claude Code, Cursor, ChatGPT, Hermes)
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

        {/* Clé API / Endpoint Box */}
        <div className="border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-muted-foreground shrink-0">Endpoint URL :</span>
            <code className="px-2 py-1 rounded bg-[var(--field)] border border-[var(--line)] font-mono text-[11px] truncate select-all">
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
              className={copiedKey ? "text-emerald-500" : ""}
            />
            <span>{copiedKey ? "Copié !" : "Copier URL"}</span>
          </button>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-[var(--line)] px-5 gap-2 bg-[var(--field)] overflow-x-auto">
          {[
            { id: "claude_desktop", label: "Claude Desktop" },
            { id: "cursor", label: "Cursor" },
            { id: "claude_code", label: "Claude Code CLI" },
            { id: "http", label: "HTTP JSON-RPC" },
            { id: "tools", label: "7 Outils Disponibles" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "py-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-[var(--lime)] text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
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

          {activeTab === "cursor" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Dans Cursor, ouvrez <strong>Settings &gt; Features &gt; MCP</strong>, cliquez sur{" "}
                <strong>Add New MCP Server</strong> et renseignez :
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

          {activeTab === "http" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Notre serveur MCP implémente le transport JSON-RPC 2.0 officiel via HTTP POST. N&apos;importe quel script, agent ou webhook peut l&apos;interroger :
              </p>
              <pre className="p-3.5 rounded-xl bg-black/90 text-slate-300 font-mono text-xs overflow-x-auto border border-white/10 leading-relaxed">
{`curl -X POST "${mcpEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "likyai_generate_image",
      "arguments": {
        "prompt": "Cyberpunk sunset in Abidjan, 4K cinématique",
        "aspect_ratio": "16:9"
      }
    }
  }'`}
              </pre>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="space-y-2.5">
              {[
                {
                  name: "likyai_generate_image",
                  desc: "Génère des images 2K/4K ultra-détaillées avec Nano Banana, Z-Image ou Seedream.",
                  params: "prompt, model?, aspect_ratio?, quality?, wait_for_result?",
                },
                {
                  name: "likyai_generate_video",
                  desc: "Crée des vidéos cinématiques Seedance 2.0, Kling 3.0 Turbo ou Wan 2.7.",
                  params: "prompt, model?, aspect_ratio?, duration?, image_url?",
                },
                {
                  name: "likyai_generate_music",
                  desc: "Compose des musiques complètes et bandes-son avec Suno v4.",
                  params: "prompt, genre?, instrumental?, title?",
                },
                {
                  name: "likyai_generate_voice",
                  desc: "Synthétise des voix off naturelles et expressives en plusieurs langues.",
                  params: "prompt, voice?, language?",
                },
                {
                  name: "likyai_get_task_status",
                  desc: "Consulte l'avancement d'un rendu et récupère les liens de téléchargement.",
                  params: "taskId, wait_if_generating?",
                },
                {
                  name: "likyai_list_models",
                  desc: "Explore le catalogue dynamique des modèles IA et leurs coûts en crédits.",
                  params: "category? ('image', 'video', 'music', 'voice')",
                },
                {
                  name: "likyai_get_balance",
                  desc: "Consulte le solde de crédits et l'état du forfait Mobile Money.",
                  params: "-",
                },
              ].map((tool) => (
                <div
                  key={tool.name}
                  className="p-3 rounded-xl border border-[var(--line)] bg-[var(--field)] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-emerald-700 dark:text-[var(--lime)]">
                      {tool.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{tool.params}</span>
                  </div>
                  <p className="text-muted-foreground text-[11.5px]">{tool.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer avec Testeur MCP Live */}
        <div className="border-t border-[var(--line)] bg-[var(--field)] px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={runTestPing}
              disabled={testStatus === "loading"}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--line)] text-xs font-medium transition-colors"
            >
              <CoolIcon
                name={testStatus === "loading" ? "redo" : "play"}
                size={13}
                duotone={false}
                className={testStatus === "loading" ? "animate-spin" : ""}
              />
              <span>Tester le serveur en direct</span>
            </button>
            {testStatus === "success" && (
              <span className="text-[11px] font-mono text-emerald-600 dark:text-[var(--lime)] flex items-center gap-1">
                <CoolIcon name="check" size={12} duotone={false} /> Réponse JSON-RPC 2.0 reçue
              </span>
            )}
            {testStatus === "error" && (
              <span className="text-[11px] font-mono text-red-500">
                Échec du test
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#D8FF64] text-[#171717] font-semibold text-xs hover:bg-[#cbf54a] transition-all"
          >
            Fermer
          </button>
        </div>

        {testOutput && (
          <div className="border-t border-[var(--line)] p-4 bg-black/95 max-h-40 overflow-y-auto">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
              Sortie JSON-RPC brute :
            </span>
            <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap">
              {testOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

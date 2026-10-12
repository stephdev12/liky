"use client";

import React, { useState } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface McpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "chatgpt" | "claude" | "cursor" | "cli" | "tools";

function CopyField({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--field)] px-3 py-2 transition-colors focus-within:border-[var(--line-strong)]">
        <span
          className={cn(
            "flex-1 select-all truncate text-foreground text-xs",
            mono && "font-mono text-[11.5px]"
          )}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copier ${label}`}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-[var(--hover)] hover:text-foreground transition-colors cursor-pointer"
        >
          <CoolIcon
            name={copied ? "check" : "copy"}
            size={13}
            duotone={false}
            className={copied ? "text-foreground" : ""}
          />
        </button>
      </div>
    </div>
  );
}

export function McpModal({ isOpen, onClose }: McpModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("chatgpt");
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const currentHost =
    typeof window !== "undefined" ? window.location.origin : "https://liky.ai";
  const mcpEndpoint = `${currentHost}/api/mcp`;
  const oauthAuthorizeUrl = `${currentHost}/mcp/authorize`;
  const oauthTokenUrl = `${currentHost}/api/mcp/oauth/token`;

  const cursorJson = JSON.stringify(
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

  const cliCommand = `claude mcp add likyai -- url ${mcpEndpoint}`;

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "chatgpt", label: "ChatGPT" },
    { id: "claude", label: "Claude" },
    { id: "cursor", label: "Cursor" },
    { id: "cli", label: "Claude Code CLI" },
    { id: "tools", label: "Outils" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4 bg-[var(--surface)]">
          <div>
            <h2 className="font-heading text-xl font-medium text-foreground tracking-tight">
              Connecteur MCP
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Connectez votre agent IA et utilisez vos crédits personnels
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-[var(--hover)] hover:text-foreground transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <CoolIcon name="close-md" size={18} duotone={false} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--line)] px-6 gap-1 bg-[var(--field)] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "py-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer",
                activeTab === tab.id
                  ? "border-foreground text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB: CHATGPT */}
          {activeTab === "chatgpt" && (
            <div className="space-y-3">
              <CopyField label="Nom" value="LikyAI" mono={false} />
              <CopyField label="URL de connexion" value={mcpEndpoint} />
              <CopyField label="Authentification" value="OAuth" mono={false} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <CopyField label="Client ID" value="likyai_client" />
                <CopyField label="Client Secret" value="likyai_secret" />
              </div>
              <CopyField label="Authorization URL" value={oauthAuthorizeUrl} />
              <CopyField label="Token URL" value={oauthTokenUrl} />
              <CopyField label="Scope" value="mcp:tools" />
            </div>
          )}

          {/* TAB: CLAUDE */}
          {activeTab === "claude" && (
            <div className="space-y-3">
              <CopyField label="Nom" value="LikyAI" mono={false} />
              <CopyField label="URL du connecteur" value={mcpEndpoint} />
              <CopyField label="OAuth Client ID" value="likyai_client" />
            </div>
          )}

          {/* TAB: CURSOR */}
          {activeTab === "cursor" && (
            <div className="space-y-3">
              <CopyField label="Type" value="SSE / Remote HTTP" mono={false} />
              <CopyField label="Nom" value="likyai" mono={false} />
              <CopyField label="URL" value={mcpEndpoint} />
              <div className="pt-2 space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Configuration JSON
                </span>
                <div className="relative">
                  <pre className="rounded-xl border border-[var(--line)] bg-[var(--field)] p-3.5 text-[11.5px] font-mono text-foreground overflow-x-auto">
                    {cursorJson}
                  </pre>
                  <button
                    type="button"
                    onClick={() => copySnippet(cursorJson)}
                    className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-[var(--hover)] transition-colors cursor-pointer"
                  >
                    <CoolIcon
                      name={copiedCode ? "check" : "copy"}
                      size={12}
                      duotone={false}
                    />
                    <span>{copiedCode ? "Copié" : "Copier"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLAUDE CODE CLI */}
          {activeTab === "cli" && (
            <div className="space-y-3">
              <span className="text-xs text-muted-foreground block">
                Commande d&apos;installation dans votre terminal :
              </span>
              <div className="relative">
                <pre className="rounded-xl border border-[var(--line)] bg-[var(--field)] p-3.5 text-[11.5px] font-mono text-foreground overflow-x-auto">
                  {cliCommand}
                </pre>
                <button
                  type="button"
                  onClick={() => copySnippet(cliCommand)}
                  className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-[var(--hover)] transition-colors cursor-pointer"
                >
                  <CoolIcon
                    name={copiedCode ? "check" : "copy"}
                    size={12}
                    duotone={false}
                  />
                  <span>{copiedCode ? "Copié" : "Copier"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: TOOLS */}
          {activeTab === "tools" && (
            <div className="space-y-2">
              {[
                {
                  name: "likyai_generate_image",
                  desc: "Génération d'images (Nano Banana, Z-Image, Seedream)",
                  type: "Débit dynamique selon modèle et résolution",
                },
                {
                  name: "likyai_generate_video",
                  desc: "Génération de vidéos cinématiques (Seedance, Kling, Wan)",
                  type: "Débit dynamique selon modèle et durée",
                },
                {
                  name: "likyai_generate_music",
                  desc: "Composition musicale complète avec Suno",
                  type: "Débit dynamique selon durée",
                },
                {
                  name: "likyai_generate_voice",
                  desc: "Synthèse vocale et voix off multi-langues",
                  type: "Débit dynamique selon longueur du texte",
                },
                {
                  name: "likyai_get_task_status",
                  desc: "Suivi de l'avancement et récupération du rendu",
                  type: "Gratuit (0 crédit)",
                },
                {
                  name: "likyai_list_models",
                  desc: "Catalogue des modèles disponibles et leurs tarifs",
                  type: "Gratuit (0 crédit)",
                },
                {
                  name: "likyai_get_balance",
                  desc: "Consultation du solde de crédits de votre compte",
                  type: "Gratuit (0 crédit)",
                },
              ].map((tool) => (
                <div
                  key={tool.name}
                  className="rounded-xl border border-[var(--line)] bg-[var(--field)] p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-medium text-foreground">
                      {tool.name}
                    </span>
                    <span className="font-mono text-[10.5px] text-muted-foreground">
                      {tool.type}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11.5px]">
                    {tool.desc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--line)] bg-[var(--surface)] px-6 py-3.5 flex items-center justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-medium"
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

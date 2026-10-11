"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createShader, playSweep, accentChain, ACCENTS } from "glimm";
import { MODEL_REGISTRY, ModelDef, ToolKind } from "@/lib/models/registry";

/* Balayage monochrome officiel likyAI : Vert / Lime (#D8FF64) */
const LIME_SWEEP = accentChain([
  ACCENTS.green,
  ACCENTS.yellow,
  ACCENTS.green,
]);

function Icon({
  children,
  size = 15,
  strokeWidth = 1.8,
}: {
  children: React.ReactNode;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const GLYPHS: Record<string, React.ReactNode> = {
  clip: (
    <path d="m21.4 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  ),
  layers: (
    <g>
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </g>
  ),
  sparkle: (
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
  ),
  video: (
    <g>
      <rect width="18" height="14" x="2" y="5" rx="2" />
      <path d="m17 9 4-3v12l-4-3" />
    </g>
  ),
  music: (
    <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
  ),
};

type Source = {
  key: string;
  name: string;
  desc: string;
  glyph: string;
  attach?: boolean;
};

const LIKYAI_SOURCES: Source[] = [
  { key: "attach", name: "Ajouter photo ou vidéo", desc: "Depuis ton appareil", glyph: "clip", attach: true },
  { key: "biblio", name: "Bibliothèque likyAI", desc: "Tes créations & assets enregistrés", glyph: "layers" },
  { key: "enhance", name: "Améliorer le prompt", desc: "Optimisation automatique par IA", glyph: "sparkle" },
];

const LIKYAI_COMMANDS = [
  { key: "ugc", name: "/ugc", desc: "Vidéo UGC avec script et avatar parlant" },
  { key: "marketing", name: "/marketing", desc: "Publicité produit optimisée réseaux sociaux" },
  { key: "animation", name: "/animation", desc: "Animer une image fixe en vidéo HD" },
  { key: "saas", name: "/saas", desc: "Présentation vidéo de produit SaaS" },
  { key: "libre", name: "/libre", desc: "Création libre sans modèle imposé" },
  { key: "upscale", name: "/upscale", desc: "Augmenter la résolution et la netteté" },
];

function parseToken(draft: string): { kind: "at" | "slash"; query: string; start: number } | null {
  const match = /(^|\s)([@/])([\w-]*)$/.exec(draft);
  if (!match) return null;
  return {
    kind: match[2] === "@" ? "at" : "slash",
    query: match[3].toLowerCase(),
    start: match.index + match[1].length,
  };
}

export default function PromptBar({
  variant = "Rounded",
  tall = false,
  activeTool = "image",
  placeholder,
  onSend,
  onSelectCommand,
}: {
  variant?: "Rounded" | "Pill";
  tall?: boolean;
  activeTool?: ToolKind;
  placeholder?: string;
  onSend?: (prompt: string, model: ModelDef, attachments: string[]) => void;
  onSelectCommand?: (commandKey: string) => void;
}) {
  const pill = variant === "Pill";
  const [draft, setDraft] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  
  // Modèles disponibles pour l'outil sélectionné
  const availableModels = MODEL_REGISTRY.filter((m) => m.kind === activeTool && m.enabled);
  const [model, setModel] = useState<ModelDef>(availableModels[0] || MODEL_REGISTRY[0]);

  // Synchronisation avec le changement d'outil actif
  useEffect(() => {
    const defaultForTool = MODEL_REGISTRY.find((m) => m.kind === activeTool && m.enabled);
    if (defaultForTool) setModel(defaultForTool);
  }, [activeTool]);

  const [attachments, setAttachments] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [listening, setListening] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const wide = expanded || tall;
  const [rowBox, setRowBox] = useState<{ top: number; height: number } | null>(null);
  const [engaged, setEngaged] = useState(false);
  const [modelBox, setModelBox] = useState<{ top: number; height: number } | null>(null);
  const [modelHovered, setModelHovered] = useState<number | null>(null);
  const [modelMenuLeft, setModelMenuLeft] = useState(0);
  const [modelMenuBottom, setModelMenuBottom] = useState(0);

  const composerAnchorRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const modelRef = useRef<HTMLButtonElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const modelRowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const glimmRef = useRef<HTMLCanvasElement>(null);
  const shaderRef = useRef<ReturnType<typeof createShader> | null>(null);
  const sweepingRef = useRef(false);

  const token = dismissed ? null : parseToken(draft);
  const menu: "at" | "slash" | null = plusOpen ? "at" : token?.kind ?? null;
  const query = plusOpen ? "" : token?.query ?? "";

  const rows =
    menu === "at"
      ? LIKYAI_SOURCES.filter((s) => s.name.toLowerCase().includes(query))
      : menu === "slash"
        ? LIKYAI_COMMANDS.filter((c) => c.name.slice(1).startsWith(query))
        : [];

  useEffect(() => {
    setActive(0);
    setEngaged(false);
  }, [menu, query]);

  useLayoutEffect(() => {
    const target = rowRefs.current[active];
    if (target) setRowBox({ top: target.offsetTop, height: target.offsetHeight });
  }, [menu, query, active, rows.length]);

  const modelIndex = availableModels.findIndex((m) => m.id === model.id);
  useLayoutEffect(() => {
    if (!modelOpen) return;
    const target = modelRowRefs.current[modelHovered ?? modelIndex];
    if (target) setModelBox({ top: target.offsetTop, height: target.offsetHeight });
  }, [modelOpen, modelHovered, modelIndex]);

  useLayoutEffect(() => {
    if (!modelOpen || !composerAnchorRef.current || !modelRef.current) return;
    const anchorRect = composerAnchorRef.current.getBoundingClientRect();
    const triggerRect = modelRef.current.getBoundingClientRect();
    setModelMenuLeft(Math.max(0, Math.min(triggerRect.left - anchorRect.left, anchorRect.width - 240)));
    setModelMenuBottom(anchorRect.bottom - triggerRect.top + 8);
  }, [modelOpen, wide, model.label]);

  useEffect(() => {
    if (!modelOpen) setModelHovered(null);
  }, [modelOpen]);

  const makeShader = () => {
    const canvas = glimmRef.current;
    if (!canvas) return null;
    try {
      return createShader({
        canvas,
        palette: LIME_SWEEP,
        direction: "ltr",
        bandTight: 10,
        swellAmount: 0.85,
      });
    } catch {
      return null;
    }
  };

  useEffect(() => {
    shaderRef.current = makeShader();
    return () => {
      shaderRef.current?.destroy();
      shaderRef.current = null;
    };
  }, []);

  const celebrate = () => {
    if (sweepingRef.current) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    shaderRef.current?.destroy();
    const shader = makeShader();
    shaderRef.current = shader;
    if (!shader) return;
    sweepingRef.current = true;
    const sweep = playSweep(shader, {
      palette: LIME_SWEEP,
      direction: "ltr",
      sweepMs: 500,
      outroMs: 80,
      peakAlpha: 1.2,
      bandTight: 10,
      brightness: 1.3,
      swellAmount: 1,
      waveSpeed: 1.8,
      easing: "easeOutExpo",
    });
    sweep.done.finally(() => {
      sweepingRef.current = false;
    });
  };

  const selectModel = (next: ModelDef) => {
    setModel(next);
    setModelOpen(false);
    celebrate();
  };

  // Ajustement de hauteur du textarea
  useLayoutEffect(() => {
    const input = inputRef.current;
    const controls = controlsRef.current;
    const measure = measureRef.current;
    const modelButton = modelRef.current;
    if (!input || !controls || !measure || !modelButton) return;

    const fixedControlsWidth = 28 * 3 + modelButton.offsetWidth;
    const inlineGaps = 4 * 4;
    const inlineInputWidth = controls.clientWidth - fixedControlsWidth - inlineGaps;
    const needsFullWidth = draft.includes("\n") || measure.offsetWidth + 8 > inlineInputWidth;
    if (needsFullWidth !== expanded) {
      setExpanded(needsFullWidth);
    }

    const minHeight = 28;
    const maxHeight = 120;
    input.style.height = "0px";
    const contentHeight = input.scrollHeight;
    input.style.height = `${Math.min(Math.max(contentHeight, minHeight), maxHeight)}px`;
    input.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden";
  }, [draft, expanded]);

  useEffect(() => {
    if (!modelOpen && !plusOpen) return;
    const close = (event: PointerEvent) => {
      if (!(event.target as Element).closest("[data-promptbar]")) {
        setModelOpen(false);
        setPlusOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [modelOpen, plusOpen]);

  const pick = (row: { key: string; name: string }) => {
    const source = LIKYAI_SOURCES.find((s) => s.key === row.key);
    if (source?.attach) {
      setAttachments((current) => [...current, `reference-${current.length + 1}.png`]);
      if (token) setDraft(draft.slice(0, token.start));
    } else if (menu === "at") {
      setDraft(`${token ? draft.slice(0, token.start) : draft}@${row.name} `);
    } else {
      if (token) setDraft(draft.slice(0, token.start));
      onSelectCommand?.(row.key);
    }
    setPlusOpen(false);
    setDismissed(false);
    inputRef.current?.focus();
  };

  const canSend = draft.trim().length > 0 || attachments.length > 0;
  const send = () => {
    if (!canSend) return;
    onSend?.(draft.trim(), model, attachments);
    setDraft("");
    setAttachments([]);
    setPlusOpen(false);
    setModelOpen(false);
  };

  return (
    <div data-promptbar className="w-full">
      <div ref={composerAnchorRef} className="relative">
        {/* Menu contextuel @ et / */}
        {menu && (
          <div
            onMouseLeave={() => setEngaged(false)}
            className="absolute inset-x-0 bottom-full z-20 mb-2 rounded-[14px] bg-[var(--surface)] p-1.5 shadow-raised border border-[var(--line)]"
            style={{ animation: "pop-in 180ms cubic-bezier(0.23,1,0.32,1) both", transformOrigin: "bottom center" }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-1.5 rounded-[8px] bg-[var(--hover)]"
              style={{
                top: rowBox?.top ?? 0,
                height: rowBox?.height ?? 0,
                opacity: rowBox && engaged && rows.length > 0 ? 1 : 0,
                transition: "top 200ms cubic-bezier(0.23,1,0.32,1), height 200ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
              }}
            />
            {rows.map((row, i) => {
              const source = menu === "at" ? LIKYAI_SOURCES.find((s) => s.key === row.key) : undefined;
              return (
                <button
                  key={row.key}
                  type="button"
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => {
                    setActive(i);
                    setEngaged(true);
                  }}
                  onClick={() => pick(row)}
                  className="relative z-10 flex h-9.5 w-full items-center gap-2.5 rounded-[8px] px-2.5 text-left"
                >
                  {source && (
                    <span className="flex size-5 shrink-0 items-center justify-center text-[var(--ink-2)]">
                      <Icon size={15}>{GLYPHS[source.glyph] ?? GLYPHS.clip}</Icon>
                    </span>
                  )}
                  <span className="shrink-0 text-[13px] font-medium text-[var(--ink)]">
                    {row.name}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--ink-3)]">
                    {row.desc}
                  </span>
                </button>
              );
            })}
            {rows.length === 0 && (
              <div className="flex h-9 items-center px-2.5 text-[12px] text-[var(--ink-3)]">
                Aucun résultat pour « {query} »
              </div>
            )}
            <div className="mt-1 border-t border-[var(--line)] px-2.5 pt-1.5 pb-0.5 text-[11px] text-[var(--ink-3)]">
              {menu === "at" ? "Chercher dans les sources et fichiers" : "Choisir un type de création"}
            </div>
          </div>
        )}

        {/* Sélecteur de modèle avec coût en crédits */}
        {modelOpen && (
          <div
            onMouseLeave={() => setModelHovered(null)}
            className="absolute z-20 w-64 rounded-[14px] bg-[var(--surface)] p-1.5 shadow-raised border border-[var(--line)]"
            style={{
              left: modelMenuLeft,
              bottom: modelMenuBottom,
              animation: "pop-in 180ms cubic-bezier(0.23,1,0.32,1) both",
              transformOrigin: "bottom left",
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-1.5 rounded-[8px] bg-[var(--hover)]"
              style={{
                top: modelBox?.top ?? 0,
                height: modelBox?.height ?? 0,
                opacity: modelBox && modelHovered !== null ? 1 : 0,
                transition: "top 200ms cubic-bezier(0.23,1,0.32,1), height 200ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
              }}
            />
            {availableModels.map((m, i) => (
              <button
                key={m.id}
                type="button"
                ref={(el) => {
                  modelRowRefs.current[i] = el;
                }}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setModelHovered(i)}
                onClick={() => {
                  selectModel(m);
                  inputRef.current?.focus();
                }}
                className="relative z-10 flex h-9 w-full items-center gap-2 rounded-[8px] px-2.5 text-left"
              >
                <div className="min-w-0 flex-1 truncate">
                  <div className="text-[12.5px] font-medium text-[var(--ink)] leading-none">{m.label}</div>
                  <div className="text-[10.5px] text-[var(--ink-3)] mt-0.5">{m.pricing.description}</div>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-[var(--ink-2)] bg-[var(--hover)] px-1.5 py-0.5 rounded-full">
                  {m.pricing.likyCredits} cr
                </span>
                <span className={`shrink-0 text-[var(--ink)] ${m.id === model.id ? "" : "invisible"}`}>
                  <Icon size={12} strokeWidth={2.5}><path d="M20 6L9 17l-5-5" /></Icon>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Boîte de composition principale */}
        <div
          className={`relative isolate flex flex-col overflow-hidden border border-[var(--line)] bg-[var(--surface)] shadow-card transition-all duration-150 focus-within:border-[var(--line-strong)] ${
            tall ? "gap-2.5 p-3.5" : "gap-1.5 p-1.5"
          } ${pill ? "rounded-[24px]" : tall ? "rounded-[22px]" : "rounded-[16px]"}`}
        >
          {/* Canvas Shader Glimm (balayage lime) */}
          <canvas
            ref={glimmRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
            style={{ borderRadius: "inherit" }}
          />

          <span
            ref={measureRef}
            aria-hidden="true"
            className="pointer-events-none absolute invisible whitespace-pre text-[13.5px] leading-[18px]"
          >
            {draft}
          </span>

          {/* Fichiers attachés */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5 px-1">
              {attachments.map((file, i) => (
                <span
                  key={`${file}-${i}`}
                  className="flex h-7 items-center gap-1.5 bg-[var(--field)] py-1 pr-1.5 pl-2 text-[12px] text-[var(--ink-2)] rounded-[8px] border border-[var(--line)]"
                >
                  <Icon size={12}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></Icon>
                  <span className="max-w-40 truncate font-medium">{file}</span>
                  <button
                    type="button"
                    aria-label={`Supprimer ${file}`}
                    onClick={() => setAttachments((c) => c.filter((_, j) => j !== i))}
                    className="flex size-5 items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)]"
                  >
                    <Icon size={10} strokeWidth={2.5}><path d="M18 6L6 18M6 6l12 12" /></Icon>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Contrôles & champ texte */}
          <div
            ref={controlsRef}
            className={`grid items-end gap-x-1 gap-y-1.5 ${
              wide
                ? "grid-cols-[28px_auto_minmax(0,1fr)_28px_28px]"
                : "grid-cols-[28px_minmax(0,1fr)_auto_28px_28px]"
            }`}
          >
            {/* Bouton + */}
            <button
              type="button"
              aria-label="Ajouter des références ou commandes"
              onClick={() => {
                setModelOpen(false);
                setPlusOpen((c) => !c);
                inputRef.current?.focus();
              }}
              className={`flex size-7.5 shrink-0 items-center justify-center rounded-[9px] text-[var(--ink-3)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--ink)] ${
                plusOpen ? "bg-[var(--hover)] text-[var(--ink)]" : ""
              } ${wide ? "col-start-1 row-start-2" : "col-start-1 row-start-1"}`}
            >
              <Icon size={16} strokeWidth={2}><path d="M12 5v14M5 12h14" /></Icon>
            </button>

            {/* Champ prompt */}
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setDismissed(false);
                setPlusOpen(false);
              }}
              onKeyDown={(e) => {
                if (menu && rows.length > 0) {
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    setEngaged(true);
                    setActive((c) => (c + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length);
                    return;
                  }
                  if ((e.key === "Enter" && !e.shiftKey) || e.key === "Tab") {
                    e.preventDefault();
                    pick(rows[active]);
                    return;
                  }
                }
                if (e.key === "Escape") {
                  setDismissed(true);
                  setPlusOpen(false);
                  setModelOpen(false);
                  return;
                }
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={listening ? "Écoute en cours..." : placeholder ?? "Décris ton idée (tape @ pour réf, / pour type)..."}
              className={`${tall ? "min-h-[64px] px-2 py-1.5 text-[14px]" : "min-h-7 px-1.5 py-[5px] text-[13.5px]"} min-w-0 w-full resize-none bg-transparent text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)] ${
                wide ? "col-span-full col-start-1 row-start-1" : "col-start-2 row-start-1"
              }`}
            />

            {/* Bouton choix de modèle avec badge de crédits */}
            <button
              ref={modelRef}
              type="button"
              aria-label="Choisir le modèle"
              onClick={() => {
                setPlusOpen(false);
                setModelOpen((c) => !c);
              }}
              className={`flex h-7.5 shrink-0 items-center gap-1.5 px-2 rounded-[9px] text-[12px] font-medium text-[var(--ink-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--ink)] ${
                wide ? "col-start-2 row-start-2 justify-self-start" : "col-start-3 row-start-1"
              }`}
            >
              <span>{model.label}</span>
              <span className="text-[11px] font-semibold text-[var(--ink)] bg-[var(--accent)] px-1.5 py-0.2 rounded-full">
                {model.pricing.likyCredits} cr
              </span>
              <span className="text-[var(--ink-3)]">
                <Icon size={10} strokeWidth={2.4}><path d="M6 9l6 6 6-6" /></Icon>
              </span>
            </button>

            {/* Dictée vocale */}
            <button
              type="button"
              aria-label="Dictée vocale"
              onClick={() => setListening((c) => !c)}
              className={`flex size-7.5 shrink-0 items-center justify-center rounded-[9px] transition-colors ${
                listening ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "text-[var(--ink-3)] hover:bg-[var(--hover)] hover:text-[var(--ink)]"
              } ${wide ? "col-start-4 row-start-2" : "col-start-4 row-start-1"}`}
            >
              <Icon size={15} strokeWidth={2}>
                <g>
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
                </g>
              </Icon>
            </button>

            {/* Bouton Générer (accent Lime) */}
            <button
              type="button"
              aria-label="Lancer la création"
              disabled={!canSend}
              onClick={send}
              className={`flex size-7.5 shrink-0 items-center justify-center rounded-[9px] transition-all duration-200 enabled:active:scale-95 ${
                canSend
                  ? "bg-[var(--accent)] text-[var(--ink)] shadow-sm hover:brightness-105 cursor-pointer"
                  : "bg-[var(--line-strong)] text-[var(--ink-3)] cursor-not-allowed opacity-50"
              } ${wide ? "col-start-5 row-start-2" : "col-start-5 row-start-1"}`}
            >
              <Icon size={15} strokeWidth={2.4}><path d="M12 19V5M5 12l7-7 7 7" /></Icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/* ─────────────────────────────────────────────────────────
 * THINKING STATE — Trace d'étapes et pipeline d'agent likyAI
 *
 * Variantes :
 *   Steps     — liste d'étapes avec spinner → check
 *   UGC       — pipeline complet script → voix → avatar → montage
 *   Reasoning — réflexion et amélioration du prompt
 * ───────────────────────────────────────────────────────── */

const STAGES = [800, 1000, 2000, 2500, 1600];

function useSequence(steps: number[]) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (stage >= steps.length - 1) return;
    const t = setTimeout(() => setStage((s) => s + 1), steps[stage]);
    return () => clearTimeout(t);
  }, [stage, steps]);
  return stage;
}

export type ThinkingRow = {
  primary: string;
  secondary?: string;
  mono?: boolean;
};

const DEFAULT_VARIANTS: Record<
  string,
  { active: string; done: string; rows: ThinkingRow[] }
> = {
  Steps: {
    active: "Préparation de la création",
    done: "Paramètres vérifiés",
    rows: [
      { primary: "Analyse du prompt et modération" },
      { primary: "Réservation des crédits" },
      { primary: "Envoi de la tâche au modèle KIE" },
      { primary: "Rapatriement vers le stockage sécurisé" },
    ],
  },
  UGC: {
    active: "Génération du pipeline UGC",
    done: "Vidéo UGC finalisée",
    rows: [
      { primary: "Écriture du script d'accroche", secondary: "Claude / GPT" },
      { primary: "Synthèse vocale réaliste", secondary: "ElevenLabs Turbo" },
      { primary: "Animation visage & synchronisation labiale", secondary: "Kling AI Avatar" },
      { primary: "Optimisation et rendu final HD" },
    ],
  },
  Reasoning: {
    active: "Amélioration du prompt",
    done: "Prompt enrichi",
    rows: [
      { primary: "Ajout des détails d'éclairage cinématographique et cadrage." },
      { primary: "Optimisation des mots-clés de texture de peau et réalisme." },
    ],
  },
};

export default function ThinkingState({
  variant = "Steps",
  onSettled,
  rows,
  active,
  done,
  icon,
}: {
  variant?: string;
  onSettled?: () => void;
  rows?: ThinkingRow[];
  active?: string;
  done?: string;
  icon?: ReactNode;
}) {
  const stage = useSequence(STAGES);
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  const base = DEFAULT_VARIANTS[variant] ?? DEFAULT_VARIANTS.Steps;
  const v = {
    ...base,
    rows: rows ?? base.rows,
    active: active ?? base.active,
    done: done ?? base.done,
  };
  const autoExpanded = stage >= 1 && stage < 4;
  const expanded = manualExpanded ?? autoExpanded;
  const working = stage < 3;
  const visible = stage < 2 ? 0 : stage === 2 ? Math.min(2, v.rows.length) : v.rows.length;
  const traceRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  useLayoutEffect(() => {
    if (traceRef.current) setLineHeight(traceRef.current.offsetHeight);
  }, [visible, expanded, variant, stage]);

  const settledRef = useRef(false);
  useEffect(() => {
    if (working || settledRef.current) return;
    settledRef.current = true;
    onSettled?.();
  }, [working, onSettled]);

  return (
    <div
      key={variant}
      className="flex w-full max-w-96 flex-col"
      style={{
        minHeight: working || expanded ? 160 : undefined,
        transition: "min-height 400ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setManualExpanded((current) => !(current ?? autoExpanded))}
        className="-mx-1.5 flex w-fit items-center gap-2 rounded-control px-2 py-1.5 transition-colors duration-100 hover:bg-hover-2"
      >
        {icon ? (
          <span className="flex shrink-0 transition-colors duration-200" style={{ color: working ? "var(--ink)" : "var(--ink-3)" }}>
            {icon}
          </span>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill={working ? "var(--ink)" : "var(--ink-3)"}>
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
          </svg>
        )}
        <span role="status" className="contents">
          {working ? (
            <span
              className="bg-clip-text text-[13px] font-medium whitespace-nowrap text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--ink-3) 30%, var(--ink) 50%, var(--ink-3) 70%)",
                backgroundSize: "200% 100%",
                animation: "shimmer-text 1.4s linear infinite",
              }}
            >
              {v.active}
            </span>
          ) : (
            <span
              className="text-[13px] font-medium whitespace-nowrap text-ink-2"
              style={{ animation: "fade-in 350ms ease-out both" }}
            >
              {v.done}
            </span>
          )}
        </span>
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          className="transition-transform duration-300"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Trace dépliable */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-400"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          opacity: expanded ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="relative mt-1 ml-[5px] pl-4">
            <span
              aria-hidden
              className="absolute left-[3px] w-px bg-line"
              style={{ top: -6, height: lineHeight ? lineHeight - 2 : 0, transition: "height 500ms cubic-bezier(0.23,1,0.32,1)" }}
            />
            <div ref={traceRef} className="flex flex-col gap-1 py-1">
              {v.rows.slice(0, visible).map((row, i) => (
                <div
                  key={row.primary}
                  className="flex min-h-7 w-full items-center gap-2 rounded-[6px] px-1.5 py-0.5 text-left"
                  style={{ animation: `fade-up 320ms cubic-bezier(0.23,1,0.32,1) ${i * 100}ms both` }}
                >
                  {i < visible - 1 || !working ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-green">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <span className="size-3 shrink-0 rounded-full border-[1.5px] border-line-strong border-t-ink-2" style={{ animation: "spin 700ms linear infinite" }} />
                  )}
                  <span className="min-w-0 truncate text-[12.5px] font-medium text-ink">
                    {row.primary}
                  </span>
                  {row.secondary && (
                    <span className="shrink-0 text-[11px] text-ink-3">
                      {row.secondary}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

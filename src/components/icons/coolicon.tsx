"use client";

import React from "react";
import { COOLICONS, type CoolIconKey } from "./coolicons-data";

export type { CoolIconKey };

export interface CoolIconProps extends React.SVGProps<SVGSVGElement> {
  name: CoolIconKey;
  size?: number | string;
  className?: string;
  strokeWidth?: number;
  /**
   * Mode Duotone : active le rendu bicolore avec un calque de remplissage teinté
   * et le tracé vectoriel net au premier plan.
   * Activé par défaut (true) pour un style duotone riche.
   */
  duotone?: boolean;
  /**
   * Couleur du second ton (calque de remplissage interne).
   * Par défaut "currentColor", ou une couleur de thème (ex. "var(--lime)").
   */
  secondaryColor?: string;
  /**
   * Opacité du second ton (par défaut 0.22 pour currentColor, 0.35 pour lime).
   */
  secondaryOpacity?: number;
}

// Cache mémoire pour éviter de recalculer les regex de fill à chaque render
const fillMarkupCache = new Map<string, string>();

function getFillMarkup(body: string): string {
  let cached = fillMarkupCache.get(body);
  if (!cached) {
    cached = body
      .replace(/stroke="[^"]*"/gi, 'stroke="none"')
      .replace(/stroke-width="[^"]*"/gi, '')
      .replace(/stroke-linecap="[^"]*"/gi, '')
      .replace(/stroke-linejoin="[^"]*"/gi, '')
      .replace(/fill="[^"]*"/gi, '');
    fillMarkupCache.set(body, cached);
  }
  return cached;
}

/**
 * Composant vectoriel CoolIcon (Pack Figma Coolicons - 442 icônes)
 * Version Duotone native pour le Studio likyAI.
 */
export function CoolIcon({
  name,
  size = 20,
  strokeWidth = 2,
  className = "",
  duotone = true,
  secondaryColor = "currentColor",
  secondaryOpacity,
  style,
  ...props
}: CoolIconProps) {
  const icon = COOLICONS[name];
  if (!icon) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[CoolIcon] Icon "${name}" not found in Coolicons pack.`);
    }
    return null;
  }

  const defaultOpacity =
    secondaryColor && (secondaryColor.includes("lime") || secondaryColor.includes("#D8FF64"))
      ? 0.35
      : 0.22;
  const fillOpacity = secondaryOpacity ?? defaultOpacity;

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
      className={className}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    >
      {duotone && (
        <g
          className="coolicon-duotone-fill"
          fill={secondaryColor}
          fillOpacity={fillOpacity}
          stroke="none"
          dangerouslySetInnerHTML={{ __html: getFillMarkup(icon.body) }}
        />
      )}
      <g
        className="coolicon-stroke"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: icon.body }}
      />
    </svg>
  );
}

export default CoolIcon;

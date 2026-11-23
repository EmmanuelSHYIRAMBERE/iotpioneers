import type { ProductIllustrationKey } from "@/content/types";
import { cn } from "@/lib/cn";

export interface ProductIllustrationProps {
  kind: ProductIllustrationKey;
  className?: string;
}

/**
 * Neutral line drawing standing in for a product photo until the client grants permission to
 * reuse shop photography. Decorative: the product name is always shown as text.
 */
export function ProductIllustration({ kind, className }: ProductIllustrationProps) {
  const common = "stroke-navy-950";
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
      strokeWidth="1.5"
    >
      {kind === "board" || kind === "camera" ? (
        <g className={common}>
          <rect x="30" y="44" width="100" height="72" rx="6" />
          <rect x="62" y="64" width="36" height="32" rx="3" className="stroke-bright-gold" />
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={`t${String(i)}`} cx={38 + i * 9.4} cy="52" r="2" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={`b${String(i)}`} cx={38 + i * 9.4} cy="108" r="2" />
          ))}
          <rect x="20" y="70" width="12" height="20" rx="2" />
          {kind === "camera" ? (
            <>
              <circle cx="80" cy="80" r="10" className="stroke-cyan-700" />
              <circle cx="80" cy="80" r="4" className="fill-cyan-700 stroke-cyan-700" />
            </>
          ) : (
            <path d="M104 72 h14 M104 80 h14 M104 88 h10" />
          )}
        </g>
      ) : null}
      {kind === "sensor" ? (
        <g className={common}>
          <rect x="40" y="62" width="80" height="58" rx="5" />
          <path d="M58 62 a22 22 0 0 1 44 0" className="stroke-bright-gold" />
          <path d="M66 62 a14 14 0 0 1 28 0" />
          <path d="M60 120 v14 M80 120 v14 M100 120 v14" />
          <circle cx="58" cy="100" r="5" />
          <circle cx="102" cy="100" r="5" />
        </g>
      ) : null}
      {kind === "display" ? (
        <g className={common}>
          <rect x="22" y="48" width="116" height="64" rx="5" />
          <rect x="34" y="60" width="92" height="40" rx="2" className="stroke-bright-gold" />
          <path d="M42 74 h40 M42 86 h60" className="stroke-cyan-700" />
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx={40 + i * 11} cy="42" r="2" />
          ))}
        </g>
      ) : null}
      {kind === "segment" ? (
        <g className={common}>
          <rect x="48" y="34" width="64" height="92" rx="4" />
          <path
            d="M66 50 h28 M64 54 v22 M96 54 v22 M66 80 h28 M64 84 v22 M96 84 v22 M66 110 h28"
            className="stroke-bright-gold"
            strokeLinecap="round"
          />
          <circle cx="104" cy="112" r="2.5" className="fill-bright-gold stroke-bright-gold" />
        </g>
      ) : null}
      {kind === "module" ? (
        <g className={common}>
          <rect x="34" y="52" width="92" height="56" rx="4" />
          <rect x="48" y="66" width="28" height="28" rx="2" className="stroke-bright-gold" />
          <path d="M126 70 h14 M126 80 h14 M126 90 h14" />
          <circle cx="100" cy="80" r="8" className="stroke-cyan-700" />
          <path d="M20 80 h14" />
        </g>
      ) : null}
      {kind === "component" ? (
        <g className={common}>
          <path d="M20 80 h36" />
          <rect x="56" y="68" width="48" height="24" rx="10" className="stroke-bright-gold" />
          <path d="M68 68 v24 M80 68 v24 M92 68 v24" className="stroke-cyan-700" />
          <path d="M104 80 h36" />
        </g>
      ) : null}
    </svg>
  );
}

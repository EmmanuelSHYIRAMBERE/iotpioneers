import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";
import { ICON_STROKE } from "@/lib/tokens";

export interface IconTileProps {
  icon: ComponentType<LucideProps>;
  /** "gold": brand items (brightGold to deepGold, navy icon). "data": IoTDataHub items (cyan400 to navy900, white icon). */
  tone: "gold" | "data";
  className?: string;
}

/**
 * Card system icon tile (reference-ui-patterns): 48px, radius 12px, a gradient within the palette
 * only. Decorative; the card's text carries the meaning.
 */
export function IconTile({ icon: Icon, tone, className }: IconTileProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-card",
        tone === "gold"
          ? "bg-linear-to-br from-bright-gold to-deep-gold text-navy-950"
          : "bg-linear-to-br from-cyan-400 to-navy-900 text-white",
        className,
      )}
    >
      <Icon size={24} strokeWidth={ICON_STROKE} />
    </span>
  );
}

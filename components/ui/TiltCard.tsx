"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useCardTilt } from "@/hooks/useCardTilt";
import { cn } from "@/lib/cn";

export interface TiltCardProps {
  children: ReactNode;
  /** "dark": navy900 surface with the dark border token. "light": white with slate200. */
  tone: "dark" | "light";
  className?: string;
}

/**
 * Card system surface (reference-ui-patterns): radius 12px, 1px border, the gold top bar on hover
 * and focus within (`.card-topbar`), a 4px lift and a tilt of at most 6 degrees on fine pointers
 * (useCardTilt; off on touch and with reduced motion). Fills its grid cell so cards in a row
 * share one height. A client wrapper, so server components can pass icons and text as children.
 */
export function TiltCard({ children, tone, className }: TiltCardProps) {
  const tilt = useCardTilt();
  return (
    <motion.div
      style={tilt.style}
      onPointerMove={tilt.onPointerMove}
      onPointerEnter={tilt.onPointerEnter}
      onPointerLeave={tilt.onPointerLeave}
      className={cn(
        "card-topbar flex h-full flex-col overflow-hidden rounded-card border p-6",
        tone === "dark" ? "border-line-dark bg-navy-900" : "border-slate-200 bg-white shadow-rest",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

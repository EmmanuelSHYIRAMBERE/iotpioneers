"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { revealUp, staggerDelay, stagger as staggerTokens, viewportAmount } from "@/lib/motion";

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Position in a staggered group; uses the card stagger (capped at six steps). */
  index?: number;
  stagger?: keyof typeof staggerTokens;
  as?: "div" | "li" | "section" | "article";
  amount?: number;
}

/**
 * The global entrance: once, at 20% visibility, opacity 0 to 1 and a 16px rise over 700ms
 * (12px and 500ms on mobile). Never exits. Without JavaScript the layout's noscript style
 * keeps it visible.
 */
export function Reveal({
  children,
  className,
  index = 0,
  stagger = "cards",
  as = "div",
  amount = viewportAmount.reveal,
}: RevealProps) {
  const desktop = useMediaQuery(mediaQueries.md, true);
  const variants = revealUp(!desktop, staggerDelay(index, staggerTokens[stagger]));
  const Component = motion[as];
  return (
    <Component
      data-reveal=""
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={variants}
    >
      {children}
    </Component>
  );
}

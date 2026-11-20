"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import {
  enterLeft,
  enterRight,
  reducedFade,
  revealUp,
  s,
  staggerDelay,
  stagger as staggerTokens,
  viewportAmount,
} from "@/lib/motion";

export type RevealFrom = "up" | "left" | "right";

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Position in a staggered group (capped at six steps). */
  index?: number;
  /** Named stagger token. Ignored when `stepMs` is given. */
  stagger?: keyof typeof staggerTokens;
  /** Stagger step in ms, from `runStagger` in lib/motion. */
  stepMs?: number;
  /** Extra delay before this element, in ms. */
  delayMs?: number;
  /**
   * Direction (scroll-motion-choreography): content arrives from the side its column sits on.
   * "left" and "right" travel 24px (12px on mobile); "up" is the standard 16px rise.
   */
  from?: RevealFrom;
  as?: "div" | "li" | "section" | "article" | "p" | "span";
  amount?: number;
}

/**
 * The global entrance: once, at 20% visibility, never exits. "up" rises 16px over 700ms (12px
 * and 500ms on mobile); "left" and "right" slide 24px. Reduced motion uses a 200ms opacity fade
 * with no movement. Without JavaScript the layout's noscript style keeps it visible.
 */
export function Reveal({
  children,
  className,
  index = 0,
  stagger = "cards",
  stepMs,
  delayMs = 0,
  from = "up",
  as = "div",
  amount = viewportAmount.reveal,
}: RevealProps) {
  const desktop = useMediaQuery(mediaQueries.md, true);
  const reduced = useReducedMotionPreference();
  const delay = staggerDelay(index, stepMs ?? staggerTokens[stagger]) + s(delayMs);
  const variants = reduced
    ? reducedFade
    : from === "left"
      ? enterLeft(!desktop, delay)
      : from === "right"
        ? enterRight(!desktop, delay)
        : revealUp(!desktop, delay);
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

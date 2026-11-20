"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { cn } from "@/lib/cn";

export interface ParallaxProps {
  children: ReactNode;
  /** Total travel in px (from `runDistance`), split evenly either side of rest. */
  distance: number;
  /** Classes for the clipping frame. */
  className?: string;
}

/**
 * Scroll parallax for a decorative layer inside a clipping frame. The layer is oversized by the
 * travel distance so no edge ever shows. md and up only; off with reduced motion.
 */
export function Parallax({ children, distance, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const desktop = useMediaQuery(mediaQueries.md, true);
  const reduced = useReducedMotionPreference();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance / 2, distance / 2]);
  const active = desktop && !reduced;
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        className="absolute inset-x-0"
        style={{
          top: -distance / 2,
          bottom: -distance / 2,
          ...(active ? { y } : {}),
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

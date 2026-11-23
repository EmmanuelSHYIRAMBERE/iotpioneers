"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import {
  drawStroke,
  enterUp,
  runStagger,
  runTiming,
  s,
  staggerDelay,
  viewportAmount,
} from "@/lib/motion";

/** Delay of row `index` in seconds (90ms stagger). */
function rowDelay(index: number): number {
  return staggerDelay(index, runStagger.pathRows);
}

/** A table row that rises in with a 90ms stagger, once. Reduced motion renders it in place. */
export function PathRow({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: ReactNode;
}) {
  const desktop = useMediaQuery(mediaQueries.md, true);
  const reduced = useReducedMotionPreference();
  return (
    <motion.tr
      className={className}
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: viewportAmount.reveal }}
      variants={enterUp(!desktop, rowDelay(index))}
    >
      {children}
    </motion.tr>
  );
}

/**
 * Gold check mark whose stroke draws 150ms after its row arrives (inherits the row's "visible"
 * variant). Same geometry as the Lucide Check icon. Decorative: the cell's hidden "Yes" carries
 * the meaning.
 */
export function DrawnCheck({ rowIndex }: { rowIndex: number }) {
  const reduced = useReducedMotionPreference();
  return (
    <svg
      aria-hidden="true"
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto text-bright-gold"
    >
      <motion.path
        d="M20 6 9 17l-5-5"
        initial={reduced ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: viewportAmount.reveal }}
        variants={drawStroke(rowDelay(rowIndex) + s(runTiming.checkDrawDelay))}
      />
    </svg>
  );
}

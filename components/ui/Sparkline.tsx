"use client";

import { motion } from "motion/react";
import { ease, s, timing } from "@/lib/motion";

export interface SparklineProps {
  values: readonly number[];
  stroke: string;
  /** Draws the line in when true (stroke dash offset via pathLength). */
  drawn: boolean;
  width?: number;
  height?: number;
}

/** Seven point trend line. Decorative: the card states the value and status in text. */
export function Sparkline({ values, stroke, drawn, width = 72, height = 24 }: SparklineProps) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const d = values
    .map((value, index) => {
      const x = index * step;
      const y = height - 2 - ((value - min) / span) * (height - 4);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${String(width)} ${String(height)}`}
      aria-hidden="true"
    >
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: drawn ? 1 : 0 }}
        transition={{ duration: s(timing.chartDraw / 2), ease: ease.outExpo }}
      />
    </svg>
  );
}

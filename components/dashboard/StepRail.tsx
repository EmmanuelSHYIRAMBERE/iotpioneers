"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

export interface StepRailProps {
  steps: number;
  /** Index of the current step, -1 before the story starts. */
  current: number;
  /** 0..1 fill of the rail. */
  progress: number;
  className?: string;
}

/** Vertical progress rail with four nodes that fills with cyan as the pinned story advances. */
export function StepRail({ steps, current, progress, className }: StepRailProps) {
  return (
    <div aria-hidden="true" className={cn("relative w-6", className)}>
      <div className="absolute top-3 bottom-3 left-1/2 w-px -translate-x-1/2 bg-line-dark">
        <div
          className="absolute inset-0 origin-top bg-cyan-400"
          style={{ transform: `scaleY(${Math.min(1, Math.max(0, progress)).toFixed(3)})` }}
        />
      </div>
      <div className="relative flex h-full flex-col justify-between">
        {Array.from({ length: steps }, (_, index) => {
          const lit = index <= current;
          return (
            <motion.span
              key={index}
              className={cn(
                "flex size-6 items-center justify-center rounded-full border bg-navy-950 transition-colors duration-300",
                lit ? "border-cyan-400" : "border-line-dark-strong",
              )}
              initial={false}
              animate={{ scale: index === current ? 1 : 0.8 }}
              transition={spring.snappy}
            >
              <span
                className={cn("size-2 rounded-full", lit ? "bg-cyan-400" : "bg-slate-400/50")}
              />
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

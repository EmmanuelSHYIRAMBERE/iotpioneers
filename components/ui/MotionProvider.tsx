"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";

export interface MotionProviderProps {
  children: ReactNode;
}

/**
 * With reduced motion (system or footer toggle), Motion for React skips transform and layout
 * animations and keeps only opacity, which gives the "plain fade at most" behaviour.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  const reduced = useReducedMotionPreference();
  return <MotionConfig reducedMotion={reduced ? "always" : "never"}>{children}</MotionConfig>;
}

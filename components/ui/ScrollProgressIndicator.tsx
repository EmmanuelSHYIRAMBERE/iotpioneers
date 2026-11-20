"use client";

import { motion, useScroll } from "motion/react";

/** 2px cyan bar driven by page scroll progress. Transform (scaleX) only. */
export function ScrollProgressIndicator() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-bright-gold"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

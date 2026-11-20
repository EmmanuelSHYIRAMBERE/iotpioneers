"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { runDistance, tiltRise, viewportAmount } from "@/lib/motion";

export interface TiltRiseProps {
  children: ReactNode;
  className?: string;
}

/**
 * Rises 32px with its perspective tilt easing from 8 degrees to flat (dashboard entrance). The
 * perspective lives on this wrapper only while the entrance runs: a perspective or transform on an
 * ancestor would become the containing block for the GSAP pin's position: fixed, so both are gone
 * once the child is flat. Reduced motion renders it in place.
 */
export function TiltRise({ children, className }: TiltRiseProps) {
  const desktop = useMediaQuery(mediaQueries.md, true);
  const reduced = useReducedMotionPreference();
  const [settled, setSettled] = useState(false);
  const flat = reduced || settled;
  return (
    <div className={className} style={flat ? {} : { perspective: runDistance.tiltRisePerspective }}>
      <motion.div
        initial={reduced ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: viewportAmount.cards }}
        variants={tiltRise(!desktop)}
        onAnimationComplete={() => {
          setSettled(true);
        }}
        // Motion leaves an identity transform (computed as matrix(1, 0, 0, 1, 0, 0)), which would
        // still be a containing block for the pin; once settled, write `none` instead.
        transformTemplate={(_latest, generated) => (flat ? "none" : generated)}
        style={{ transformOrigin: "50% 100%" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

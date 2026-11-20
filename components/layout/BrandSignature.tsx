"use client";

import { motion } from "motion/react";
import { distance, ease, s, timing } from "@/lib/motion";

export interface BrandSignatureProps {
  text: string;
}

/** Full width decorative wordmark at 4% opacity. Rises 24px once in view. Hidden from assistive technology. */
export function BrandSignature({ text }: BrandSignatureProps) {
  return (
    <motion.p
      aria-hidden="true"
      data-reveal=""
      className="pointer-events-none overflow-hidden text-center font-display text-[11.5vw] leading-none font-bold tracking-[-0.04em] whitespace-nowrap text-cloud-50 select-none 2xl:text-[176px]"
      initial={{ opacity: 0, y: distance.large }}
      whileInView={{ opacity: 0.04, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: s(timing.signatureRise), ease: ease.outExpo }}
    >
      {text}
    </motion.p>
  );
}

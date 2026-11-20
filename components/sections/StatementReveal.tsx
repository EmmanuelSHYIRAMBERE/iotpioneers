"use client";

import { motion } from "motion/react";
import { ease, s, stagger, staggerChildren, timing, viewportAmount } from "@/lib/motion";

export interface StatementRevealProps {
  lines: readonly string[];
  className?: string;
}

/** Large statement revealed line by line: each masked line rises from 100% below (800ms, 90ms stagger). */
export function StatementReveal({ lines, className }: StatementRevealProps) {
  return (
    <motion.h2
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: viewportAmount.headline }}
      variants={staggerChildren(stagger.lines)}
    >
      {lines.map((line, index) => (
        <span key={line} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            data-reveal=""
            className="block"
            variants={{
              hidden: { y: "100%" },
              visible: {
                y: "0%",
                transition: { duration: s(timing.statementLine), ease: ease.outExpo },
              },
            }}
          >
            {line}
            {index < lines.length - 1 ? " " : null}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}

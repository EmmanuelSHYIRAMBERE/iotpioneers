"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { maskedWord, staggerChildren, stagger, viewportAmount } from "@/lib/motion";
import { cn } from "@/lib/cn";

export interface WordRevealProps {
  text: string;
  /** A word or phrase at the end of the title rendered with emphasis colour. */
  emphasis?: string;
  emphasisClassName?: string;
}

/**
 * Masked headline reveal: each word moves up from 105% below inside an overflow hidden
 * wrapper (70ms stagger). On mobile, the whole title moves as one line (lines stagger).
 * Transforms only, so the text is never hidden with opacity.
 */
export function WordReveal({ text, emphasis, emphasisClassName }: WordRevealProps) {
  const desktop = useMediaQuery(mediaQueries.md, true);
  const words = text.split(" ");
  const emphasisWords = emphasis ? emphasis.split(" ") : [];
  const all = [
    ...words.map((word) => ({ word, emphasised: false })),
    ...emphasisWords.map((word) => ({ word, emphasised: true })),
  ];

  if (!desktop) {
    return (
      <motion.span
        className="inline-block overflow-hidden pb-[0.08em] align-bottom"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: viewportAmount.headline }}
        variants={staggerChildren(stagger.lines)}
      >
        <motion.span data-reveal="" className="inline-block" variants={maskedWord}>
          {all.map(({ word, emphasised }, index) => (
            <Fragment key={`${word}-${String(index)}`}>
              <span className={cn(emphasised && emphasisClassName)}>{word}</span>
              {index < all.length - 1 ? " " : null}
            </Fragment>
          ))}
        </motion.span>
      </motion.span>
    );
  }

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: viewportAmount.headline }}
      variants={staggerChildren(stagger.words)}
    >
      {all.map(({ word, emphasised }, index) => (
        <Fragment key={`${word}-${String(index)}`}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              data-reveal=""
              className={cn("inline-block", emphasised && emphasisClassName)}
              variants={maskedWord}
            >
              {word}
            </motion.span>
          </span>
          {index < all.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.span>
  );
}

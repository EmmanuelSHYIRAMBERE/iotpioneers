"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import type { EditorialImage } from "@/content/types";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { ease, s, timing, viewportAmount } from "@/lib/motion";

export interface IntroImagesProps {
  large: EditorialImage;
  small: EditorialImage;
  annotation: string;
  annotationVerified: boolean;
}

function Picture({
  image,
  variant,
  sizes,
}: {
  image: EditorialImage;
  variant: "bench" | "board";
  sizes: string;
}) {
  if (image.src) {
    return (
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        placeholder="empty"
        className="h-full w-full object-cover"
      />
    );
  }
  // No photograph file yet: a labelled technical drawing.
  return <MediaPlaceholder label={image.placeholderLabel} variant={variant} />;
}

/**
 * Layered composition: a framed browser window panel holding a 4:5 photo, and a 3:2 photo
 * overlapping its lower left corner. Clip path reveals; parallax at md and up (off with reduced motion).
 */
export function IntroImages({ large, small, annotation, annotationVerified }: IntroImagesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const desktop = useMediaQuery(mediaQueries.md, true);
  const reduced = useReducedMotionPreference();
  const parallax = desktop && !reduced;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const largeY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const smallY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const revealDuration = s(desktop ? timing.clipReveal : timing.clipRevealMobile);

  return (
    <div ref={ref} className="relative pb-12 md:pb-16">
      {/* The unclipped wrapper is what the viewport observer watches: an element hidden by its own
          clip-path has no visible area, so observing it directly never triggers the reveal. */}
      <motion.div
        style={parallax ? { y: largeY } : {}}
        className="relative ml-auto w-[82%] md:w-[70%] lg:w-[84%]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: viewportAmount.reveal }}
      >
        <VerifyMarker verified={large.verified}>
          {/* Framed "browser window" panel (reference-ui-patterns): a navy900 frame with a top bar
              of three dots and a 2px gold accent line, holding the large photo. */}
          <motion.div
            data-reveal=""
            className="relative overflow-hidden rounded-frame bg-navy-900 shadow-hover"
            variants={{
              hidden: { clipPath: "inset(100% 0% 0% 0%)" },
              visible: {
                clipPath: "inset(0% 0% 0% 0%)",
                transition: { duration: revealDuration, ease: ease.outExpo },
              },
            }}
          >
            <div aria-hidden="true" className="flex h-9 items-center gap-2 px-4">
              <span className="size-2 rounded-full bg-slate-400/50" />
              <span className="size-2 rounded-full bg-slate-400/50" />
              <span className="size-2 rounded-full bg-slate-400/50" />
            </div>
            <div aria-hidden="true" className="h-0.5 bg-pioneer-gold" />
            <div className="relative aspect-[4/5] overflow-hidden">
              <motion.div
                className="h-full w-full"
                variants={{
                  hidden: { scale: desktop ? 1.12 : 1 },
                  visible: {
                    scale: 1,
                    transition: { duration: revealDuration, ease: ease.outExpo },
                  },
                }}
              >
                <Picture
                  image={large}
                  variant="bench"
                  sizes="(min-width: 1024px) 40vw, (min-width: 768px) 70vw, 82vw"
                />
              </motion.div>
            </div>
          </motion.div>
        </VerifyMarker>
      </motion.div>

      <motion.div
        style={parallax ? { y: smallY } : {}}
        className="absolute bottom-0 left-0 w-[58%] translate-y-8 md:w-[46%] md:translate-y-12 lg:w-[52%]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: viewportAmount.reveal }}
      >
        <VerifyMarker verified={small.verified}>
          <motion.div
            data-reveal=""
            className="aspect-[3/2] overflow-hidden rounded-card border-4 border-cloud-50"
            variants={{
              hidden: { clipPath: "inset(0% 100% 0% 0%)" },
              visible: {
                clipPath: "inset(0% 0% 0% 0%)",
                transition: {
                  duration: revealDuration,
                  ease: ease.outExpo,
                  delay: s(timing.secondImageDelay),
                },
              },
            }}
          >
            <Picture image={small} variant="board" sizes="(min-width: 1024px) 25vw, 58vw" />
          </motion.div>
        </VerifyMarker>
        <VerifyMarker verified={annotationVerified} className="mt-3">
          <p className="font-mono text-small text-slate-600">{annotation}</p>
        </VerifyMarker>
      </motion.div>
    </div>
  );
}

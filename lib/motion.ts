/**
 * Single source of truth for motion. Components import from here and never hardcode
 * durations, easings, staggers or distances (CLAUDE.md section 8).
 */
import type { Transition, Variants } from "motion/react";

/** Durations in milliseconds. */
export const duration = {
  instant: 120,
  fast: 200,
  base: 300,
  moderate: 480,
  reveal: 700,
  cinematic: 1200,
} as const;

/** Section specific durations taken from the specification, in milliseconds. */
export const timing = {
  navShrink: 240,
  menuOpen: 420,
  menuClose: 280,
  menuLinkIn: 360,
  menuStagger: 50,
  iconMorph: 240,
  heroEyebrowAt: 150,
  heroHeadlineAt: 250,
  heroHeadlineLineGap: 120,
  heroLeadAt: 800,
  heroCtaAt: 1000,
  heroCtaDuration: 500,
  heroLeadDuration: 600,
  heroScrollAt: 1500,
  heroScrollFade: 400,
  heroGlowFade: 1600,
  scrollCue: 1800,
  glowBreath: 8000,
  dotPulse: 2000,
  marqueeEase: 400,
  statementLine: 800,
  clipReveal: 1000,
  clipRevealMobile: 700,
  secondImageDelay: 200,
  solutionBar: 300,
  solutionPanel: 360,
  illustrationOut: 200,
  illustrationDraw: 900,
  hoverPreviewDelay: 80,
  dataTick: 2000,
  dataTween: 600,
  deviceConnect: 400,
  deviceConnectGap: 250,
  chartDraw: 1200,
  bob: 6000,
  shopOut: 180,
  shopIn: 360,
  shopStagger: 50,
  cardStagger: 600,
  nodeActivate: 400,
  centrePulse: 2400,
  copied: 1600,
  signatureRise: 1000,
  imageScale: 500,
  reducedFade: 200,
} as const;

export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  standard: [0.4, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
  inOutSine: [0.37, 0, 0.63, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

export type EaseName = keyof typeof ease;

/** CSS cubic-bezier strings for CSS transitions and keyframes. */
export function cssEase(name: EaseName): string {
  return `cubic-bezier(${ease[name].join(", ")})`;
}

export const spring = {
  snappy: { type: "spring", stiffness: 400, damping: 32 },
  soft: { type: "spring", stiffness: 150, damping: 18 },
} as const satisfies Record<string, Transition>;

/** Staggers in milliseconds. */
export const stagger = {
  words: 70,
  lines: 90,
  listItems: 60,
  cards: 80,
} as const;

/** Distances in pixels. */
export const distance = {
  small: 8,
  default: 16,
  large: 24,
  parallaxMax: 80,
  mobileRise: 12,
} as const;

/** Maximum number of items that get their own stagger step; the rest appear with the last. */
export const MAX_STAGGERED_ITEMS = 6;

/** Convert milliseconds to the seconds Motion for React expects. */
export function s(ms: number): number {
  return ms / 1000;
}

/** Stagger delay for item i, capped so long lists do not drag on. */
export function staggerDelay(index: number, stepMs: number): number {
  return s(Math.min(index, MAX_STAGGERED_ITEMS - 1) * stepMs);
}

/** Standard reveal: opacity and rise, triggered once. */
export function revealUp(isMobile = false, delaySeconds = 0): Variants {
  return {
    hidden: { opacity: 0, y: isMobile ? distance.mobileRise : distance.default },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: s(isMobile ? 500 : duration.reveal),
        ease: ease.outExpo,
        delay: delaySeconds,
      },
    },
  };
}

/** Masked word or line: moves up from below inside an overflow hidden wrapper. */
export const maskedWord: Variants = {
  hidden: { y: "105%" },
  visible: { y: "0%", transition: { duration: s(duration.reveal), ease: ease.outExpo } },
};

/** Parent variant that staggers its children. */
export function staggerChildren(stepMs: number, delayMs = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: s(stepMs), delayChildren: s(delayMs) } },
  };
}

/** Plain opacity fade used as the reduced motion substitute. */
export const reducedFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: s(timing.reducedFade) } },
};

/** Viewport amounts used to trigger reveals. */
export const viewportAmount = {
  reveal: 0.2,
  headline: 0.25,
  cards: 0.15,
} as const;

/** localStorage key for the footer "Reduce motion" toggle. */
export const REDUCE_MOTION_STORAGE_KEY = "iotp-reduce-motion";

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

/* -------------------------------------------------------------------------------------------
 * Completion run additions (scroll-motion-choreography and connected-globe-hero skills).
 * Components consume these; they never hardcode the numbers below.
 * ----------------------------------------------------------------------------------------- */

/** Extra timings for the completion run, in milliseconds. */
export const runTiming = {
  /** Directional entrance (enterLeft, enterRight). */
  enter: 700,
  /** Mobile cap for every entrance duration. */
  enterMobileMax: 500,
  clipFromRight: 1000,
  tiltRise: 900,
  drawStroke: 600,
  /** Delay before a check icon draws after its row arrives. */
  checkDrawDelay: 150,
  /** Solutions illustration crossfade and the gold pulse interval along its lines. */
  illustrationCrossfade: 300,
  illustrationPulse: 2400,
  /** Headline glow fade-in (CTA). */
  glowFadeIn: 1200,
  /** Button press scale and primary button ripple. */
  press: 120,
  ripple: 500,
  /** Anchor arrival: target heading underline grows and fades. */
  anchorHighlight: 1200,
  /** Copy to clipboard check pop. */
  copyPop: 200,
  /** Card top bar grow. */
  cardBar: 300,
  /** Navbar entrance: logo fade, links start, and the gap between links. */
  navLogoFade: 400,
  navLinksAt: 100,
  navLinkStagger: 40,
  /** Mobile menu links enter from the right. */
  menuLinkFromRight: 360,
} as const;

/** Extra staggers, in milliseconds. */
export const runStagger = {
  aboutParagraphs: 90,
  solutionRows: 60,
  valueStrip: 80,
  pathRows: 90,
  shopPills: 40,
  shopCards: 80,
  footerColumns: 60,
} as const;

/** Extra distances and angles. */
export const runDistance = {
  /** Directional entrance offset (halved on mobile). */
  enter: 24,
  /** tiltRise rise and starting rotateX (degrees), with its perspective in px. */
  tiltRiseY: 32,
  tiltRiseDeg: 8,
  tiltRisePerspective: 1200,
  /** clipFromRight starting image scale. */
  clipScale: 1.08,
  /** Card hover lift (px) and maximum pointer tilt (degrees). */
  cardLift: 4,
  cardTiltMax: 6,
  /** Perspective (px) applied while a card tilts. */
  cardPerspective: 900,
  /** Button press scale. */
  pressScale: 0.97,
  /** Ripple grows to this multiple of the button width, at this opacity. */
  rippleScale: 2.5,
  rippleOpacity: 0.2,
  /** Parallax distances (px). */
  parallaxSmall: 30,
  parallaxMedium: 40,
  parallaxLarge: 80,
  /** Navbar link drop. */
  navLinkDrop: 8,
  /** Copy to clipboard check pop starting scale. */
  copyPopFrom: 0.6,
  /** Footer brand signature rise. */
  signatureRise: 24,
} as const;

/** Connected globe (connected-globe-hero skill). */
export const globe = {
  /** One full turn, west to east. */
  turnMs: 40_000,
  /** Kigali ring grows from 6px to 28px and fades over this period. */
  kigaliPulseMs: 2400,
  kigaliNodePx: 6,
  kigaliRingMaxPx: 28,
  kigaliLat: -1.95,
  kigaliLon: 30.06,
  /** Packet travel period range per arc. */
  packetMinMs: 3000,
  packetMaxMs: 6000,
  arcsDesktop: 8,
  arcsMobile: 4,
  /** Orbits at this multiple of the globe radius. */
  orbitRadiusMin: 1.15,
  orbitRadiusMax: 1.35,
  /** Pointer tilt toward the cursor and its smoothing factor. */
  pointerTiltMaxDeg: 10,
  pointerSmoothing: 0.08,
  /** Touch drag inertia decay. */
  dragDecayMs: 1200,
  /** Static frame tilt for reduced motion and no JavaScript. */
  staticTiltDeg: 20,
  /** Frame rate caps. */
  fpsDesktop: 60,
  fpsLow: 30,
  /** Average draw cost (ms) above which the globe drops to fpsLow for the session. */
  drawBudgetMs: 6,
  /** Device pixel ratio cap. */
  maxDpr: 2,
  /** Rendered diameter (px). */
  sizeDesktop: 560,
  sizeTablet: 360,
  sizeMobile: 300,
  /** Orbit periods, inner to outer (the outer orbit matches one globe turn). */
  orbitPeriodsMs: [24_000, 32_000, 40_000],
} as const;

/** Hero cursor spotlight (reference-ui-patterns skill). */
export const spotlight = {
  sizePx: 480,
  opacity: 0.06,
  smoothing: 0.1,
} as const;

/** Marquee rows: pixels per second, and the hover slowdown factor. */
export const marqueeSpeed = {
  topPxPerSecond: 40,
  bottomPxPerSecond: 32,
  hoverFactor: 0.25,
} as const;

/** Entrance duration in seconds, capped on mobile. */
function enterDuration(ms: number, isMobile: boolean): number {
  return s(isMobile ? Math.min(ms, runTiming.enterMobileMax) : ms);
}

/** Opacity and x from the left (column on the left). Distances halve on mobile. */
export function enterLeft(isMobile = false, delaySeconds = 0): Variants {
  const x = isMobile ? runDistance.enter / 2 : runDistance.enter;
  return {
    hidden: { opacity: 0, x: -x },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: enterDuration(runTiming.enter, isMobile),
        ease: ease.outExpo,
        delay: delaySeconds,
      },
    },
  };
}

/** Opacity and x from the right (column on the right). Distances halve on mobile. */
export function enterRight(isMobile = false, delaySeconds = 0): Variants {
  const x = isMobile ? runDistance.enter / 2 : runDistance.enter;
  return {
    hidden: { opacity: 0, x },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: enterDuration(runTiming.enter, isMobile),
        ease: ease.outExpo,
        delay: delaySeconds,
      },
    },
  };
}

/** Full width elements rise from below (alias of the standard reveal). */
export const enterUp = revealUp;

/** Clip path from the right edge; pair with `clipScaleInner` on the image inside. */
export function clipFromRight(isMobile = false, delaySeconds = 0): Variants {
  return {
    hidden: { clipPath: "inset(0% 0% 0% 100%)" },
    visible: {
      clipPath: "inset(0% 0% 0% 0%)",
      transition: {
        duration: enterDuration(runTiming.clipFromRight, isMobile),
        ease: ease.outExpo,
        delay: delaySeconds,
      },
    },
  };
}

/** Image inside a clip reveal scales from 1.08 to 1. */
export function clipScaleInner(isMobile = false, delaySeconds = 0): Variants {
  return {
    hidden: { scale: isMobile ? 1 : runDistance.clipScale },
    visible: {
      scale: 1,
      transition: {
        duration: enterDuration(runTiming.clipFromRight, isMobile),
        ease: ease.outExpo,
        delay: delaySeconds,
      },
    },
  };
}

/** Rise with a perspective tilt easing to flat (dashboard). Set `transformPerspective` on the element. */
export function tiltRise(isMobile = false, delaySeconds = 0): Variants {
  return {
    hidden: {
      opacity: 0,
      y: isMobile ? runDistance.tiltRiseY / 2 : runDistance.tiltRiseY,
      rotateX: isMobile ? 0 : runDistance.tiltRiseDeg,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: enterDuration(runTiming.tiltRise, isMobile),
        ease: ease.outExpo,
        delay: delaySeconds,
      },
    },
  };
}

/** SVG stroke drawing (Motion pathLength). */
export function drawStroke(delaySeconds = 0): Variants {
  return {
    hidden: { pathLength: 0 },
    visible: {
      pathLength: 1,
      transition: { duration: s(runTiming.drawStroke), ease: ease.outExpo, delay: delaySeconds },
    },
  };
}

/** Parent variant that staggers up to MAX_STAGGERED_ITEMS children (alias with a clearer name). */
export function staggerList(stepMs: number, delayMs = 0): Variants {
  return staggerChildren(stepMs, delayMs);
}

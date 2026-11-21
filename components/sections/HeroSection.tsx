"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, type Variants } from "motion/react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { AnimatedBackground } from "@/components/visuals/AnimatedBackground";
import { ParticleNetwork } from "@/components/visuals/ParticleNetwork";
import { StaticGlobe } from "@/components/visuals/StaticNetwork";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { cn } from "@/lib/cn";
import { ICON_STROKE } from "@/lib/tokens";
import { distance, duration, ease, globe, s, spotlight, stagger, timing } from "@/lib/motion";

/** The globe and its point data load after the hero text; the static frame holds the space. */
const ConnectedGlobe = dynamic(() => import("@/components/visuals/ConnectedGlobe"), {
  ssr: false,
  loading: () => <StaticGlobe />,
});

export interface HeroContent {
  eyebrow: string;
  lineOneLead: string;
  emphasis: string;
  lineTwo: string;
  lead: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  chips: readonly { id: string; label: string; href: string }[];
  scrollLabel: string;
  verified: boolean;
}

export interface HeroSectionProps {
  content: HeroContent;
}

function riseIn(atMs: number, durationMs: number, rise: number): Variants {
  return {
    hidden: { opacity: 0, y: rise },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: s(atMs), duration: s(durationMs), ease: ease.outExpo },
    },
  };
}

/** Masked words for one headline line, starting at `startMs`. */
function HeadlineLine({
  words,
  startMs,
  gradientFrom,
  revealed,
}: {
  words: readonly string[];
  startMs: number;
  /**
   * Once the words have risen, the masks stop clipping: an `overflow: hidden` mask would cut the
   * headline glow into a lighter rectangle behind each word.
   */
  revealed: boolean;
  /** Index from which words get the gradient. */
  gradientFrom?: number;
}) {
  return (
    <span className="block">
      {words.map((word, index) => (
        <span
          key={`${word}-${String(index)}`}
          className={cn(
            "inline-block pb-[0.06em] align-bottom",
            revealed ? "overflow-visible" : "overflow-hidden",
          )}
        >
          <motion.span
            data-reveal=""
            className={cn(
              "inline-block",
              // The gradient word never carries the headline glow (reference-ui-patterns).
              gradientFrom !== undefined &&
                index >= gradientFrom &&
                "text-gradient-gold [text-shadow:none]",
            )}
            variants={{
              hidden: { y: "105%" },
              visible: {
                y: "0%",
                transition: {
                  delay: s(startMs + index * stagger.words),
                  duration: s(duration.reveal),
                  ease: ease.outExpo,
                },
              },
            }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? <span>&nbsp;</span> : null}
        </span>
      ))}
    </span>
  );
}

/**
 * Gold cursor spotlight (reference-ui-patterns): a 480px radial glow at 6% that follows the
 * pointer inside the hero, smoothed. Fine pointers only, off with reduced motion. Position is
 * written to CSS variables in requestAnimationFrame, never React state.
 */
function useHeroSpotlight(
  sectionRef: RefObject<HTMLElement | null>,
  spotRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    const section = sectionRef.current;
    const spot = spotRef.current;
    if (!enabled || !section || !spot) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let started = false;
    const tick = (): void => {
      x += (tx - x) * spotlight.smoothing;
      y += (ty - y) * spotlight.smoothing;
      spot.style.setProperty("--sx", `${x.toFixed(1)}px`);
      spot.style.setProperty("--sy", `${y.toFixed(1)}px`);
      frame = Math.hypot(tx - x, ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (event: PointerEvent): void => {
      if (event.pointerType !== "mouse") return;
      const rect = section.getBoundingClientRect();
      tx = event.clientX - rect.left;
      ty = event.clientY - rect.top;
      if (!started) {
        x = tx;
        y = ty;
        started = true;
      }
      spot.style.opacity = "1";
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onLeave = (): void => {
      spot.style.opacity = "0";
    };
    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      spot.style.opacity = "0";
    };
  }, [sectionRef, spotRef, enabled]);
}

const SPOTLIGHT_STYLE: CSSProperties = {
  backgroundImage: `radial-gradient(${String(spotlight.sizePx / 2)}px circle at var(--sx, 50%) var(--sy, 50%), color-mix(in srgb, var(--color-bright-gold) ${String(spotlight.opacity * 100)}%, transparent), transparent)`,
  transitionDuration: `${String(duration.moderate)}ms`,
};

/** Globe box sizes come from the motion tokens (connected-globe-hero skill). */
const GLOBE_BOX_STYLE = {
  "--globe-max": `${String(globe.sizeDesktop)}px`,
  "--globe-mobile": `${String(globe.sizeMobile)}px`,
  "--globe-tablet": `${String(globe.sizeTablet)}px`,
} as CSSProperties;

/**
 * Hero: "Engineering Intelligence. Connecting the Future." beside the connected globe.
 * The h1 is never hidden with opacity (it is the LCP element); only its words translate.
 * The globe sits in the right half at lg and above, and above the text below lg, never under it.
 */
export function HeroSection({ content }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPreference();
  const finePointer = useMediaQuery(mediaQueries.finePointer);
  const tablet = useMediaQuery(mediaQueries.md);

  useHeroSpotlight(sectionRef, spotRef, finePointer && !reduced);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -distance.parallaxMax]);
  const textOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.2]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  const lineOne = [content.lineOneLead, content.emphasis];
  const lineTwo = content.lineTwo.split(" ");
  // Line two starts 120ms after line one's first word finishes.
  const lineTwoStart = timing.heroHeadlineAt + duration.reveal + timing.heroHeadlineLineGap;
  // When the last word has risen, release the masks so the glow is never clipped into boxes.
  const revealEndMs = lineTwoStart + (lineTwo.length - 1) * stagger.words + duration.reveal;
  const [masksDone, setMasksDone] = useState(false);
  const [globePaused, setGlobePaused] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => {
      setMasksDone(true);
    }, revealEndMs);
    return () => {
      window.clearTimeout(id);
    };
  }, [revealEndMs]);
  const revealed = reduced || masksDone;

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-labelledby="hero-title"
      className="surface-dark hero-offset relative isolate flex items-center overflow-hidden bg-navy-950 pb-16 max-md:pt-[var(--spacing-nav)] md:pb-28"
    >
      {/* Background layers: a faint node network (the globe is the only strong focal point). */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={reduced ? {} : { opacity: canvasOpacity }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: s(timing.heroGlowFade), ease: ease.outExpo }}
        >
          <AnimatedBackground variant="heroGlow" />
        </motion.div>
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: s(duration.cinematic), ease: ease.outExpo }}
        >
          <ParticleNetwork mode="ambient" faint calmRef={textRef} seed={11} />
        </motion.div>
        <div className="bg-hero-veil absolute inset-0" />
        <div
          ref={spotRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity"
          style={SPOTLIGHT_STYLE}
        />
      </motion.div>

      <div className="container-page grid-page relative w-full items-center gap-y-6 md:gap-y-10">
        {/* Globe: above the text below lg (smaller, no orbits on phones), right half at lg. */}
        <div
          className="col-span-4 mx-auto w-[min(var(--globe-mobile),76vw)] md:col-span-8 md:w-[min(var(--globe-tablet),48vw)] lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:mr-[-2rem] lg:w-full lg:max-w-[var(--globe-max)] lg:justify-self-end xl:mr-[-4rem]"
          style={GLOBE_BOX_STYLE}
        >
          <div className="relative aspect-square w-full">
            <ConnectedGlobe compact={!tablet} paused={globePaused} />
          </div>
          {/* Pause control for the continuously turning globe (WCAG 2.2.2). The globe itself is
              decorative and hidden from assistive technology; this button is not. */}
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setGlobePaused((value) => !value);
              }}
              aria-pressed={globePaused}
              aria-label={globePaused ? "Resume globe animation" : "Pause globe animation"}
              className="flex size-8 items-center justify-center rounded-full border border-line-dark-strong text-slate-400 transition-colors duration-200 hover:border-bright-gold hover:text-cloud-50"
            >
              {globePaused ? (
                <Play aria-hidden="true" size={14} strokeWidth={ICON_STROKE} />
              ) : (
                <Pause aria-hidden="true" size={14} strokeWidth={ICON_STROKE} />
              )}
            </button>
          </div>
        </div>

        <motion.div
          className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-1 lg:row-start-1"
          style={reduced ? {} : { y: textY, opacity: textOpacity }}
        >
          <motion.div ref={textRef} initial="hidden" animate="visible">
            <VerifyMarker verified={content.verified} tagPosition="top-left">
              <motion.p
                data-reveal=""
                className="eyebrow"
                variants={riseIn(timing.heroEyebrowAt, 500, distance.mobileRise)}
              >
                {content.eyebrow}
              </motion.p>
              <h1
                id="hero-title"
                className="text-glow-gold mt-4 font-display text-display-xl text-cloud-50 lg:mt-5 lg:text-display-l"
              >
                <HeadlineLine
                  words={lineOne}
                  startMs={timing.heroHeadlineAt}
                  gradientFrom={1}
                  revealed={revealed}
                />
                <HeadlineLine words={lineTwo} startMs={lineTwoStart} revealed={revealed} />
              </h1>
              <motion.p
                data-reveal=""
                className="mt-5 max-w-lead text-lead text-slate-400 lg:mt-6"
                variants={riseIn(timing.heroLeadAt, timing.heroLeadDuration, distance.default)}
              >
                {content.lead}
              </motion.p>
            </VerifyMarker>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:mt-8">
              <motion.div
                data-reveal=""
                variants={riseIn(timing.heroCtaAt, timing.heroCtaDuration, distance.mobileRise)}
              >
                <AnimatedButton
                  href={content.primaryCta.href}
                  size="lg"
                  icon={ArrowRight}
                  className="w-full sm:w-auto"
                >
                  {content.primaryCta.label}
                </AnimatedButton>
              </motion.div>
              <motion.div
                data-reveal=""
                variants={riseIn(
                  timing.heroCtaAt + stagger.cards,
                  timing.heroCtaDuration,
                  distance.mobileRise,
                )}
              >
                <AnimatedButton
                  href={content.secondaryCta.href}
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {content.secondaryCta.label}
                </AnimatedButton>
              </motion.div>
            </div>

            <motion.ul
              data-reveal=""
              aria-label="Our products"
              className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0"
              variants={riseIn(
                timing.heroCtaAt + stagger.cards * 2,
                timing.heroCtaDuration,
                distance.mobileRise,
              )}
            >
              {content.chips.map((chip, index) => (
                <li key={chip.id} className="shrink-0">
                  <a
                    href={chip.href}
                    className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line-dark bg-navy-950/40 px-4 font-mono text-small text-cloud-50 transition-colors duration-200 hover:border-line-dark-strong hover:bg-navy-900"
                  >
                    <span aria-hidden="true" className="relative flex size-1.5">
                      <span
                        className="motion-loop absolute inset-0 animate-pulse-dot rounded-full bg-cyan-400"
                        style={{ animationDelay: `${String(index * 600)}ms` }}
                      />
                      <span className="relative size-1.5 rounded-full bg-cyan-400" />
                    </span>
                    {chip.label}
                  </a>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue (audit issue 10): bottom centre of the hero, inside the bottom padding and
          outside the text column. Decorative. */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
        style={reduced ? {} : { opacity: cueOpacity }}
      >
        <motion.div
          data-reveal=""
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: s(timing.heroScrollAt), duration: s(timing.heroScrollFade) }}
        >
          <span className="label-mono text-pioneer-gold">{content.scrollLabel}</span>
          <span className="relative block h-12 w-px bg-line-dark-strong">
            <span className="motion-loop absolute top-0 -left-[2.5px] size-1.5 animate-scroll-cue rounded-full bg-cyan-400" />
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}

"use client";

import { useCallback, useRef } from "react";
import { motion, useScroll, useTransform, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { AnimatedBackground } from "@/components/visuals/AnimatedBackground";
import { ParticleNetwork } from "@/components/visuals/ParticleNetwork";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { cn } from "@/lib/cn";
import { distance, duration, ease, s, stagger, timing } from "@/lib/motion";

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

const TEXT_PARALLAX = 4;

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
}: {
  words: readonly string[];
  startMs: number;
  /** Index from which words get the gradient. */
  gradientFrom?: number;
}) {
  return (
    <span className="block">
      {words.map((word, index) => (
        <span
          key={`${word}-${String(index)}`}
          className="inline-block overflow-hidden pb-[0.06em] align-bottom"
        >
          <motion.span
            data-reveal=""
            className={cn(
              "inline-block",
              gradientFrom !== undefined && index >= gradientFrom && "text-gradient-gold",
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
 * Hero: "Engineering Intelligence. Connecting the Future." over the ambient node network.
 * The h1 is never hidden with opacity (it is the LCP element); only its words translate.
 */
export function HeroSection({ content }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPreference();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -distance.parallaxMax]);
  const textOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.2]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  const onParallax = useCallback((x: number, y: number) => {
    const node = parallaxRef.current;
    if (node)
      node.style.transform = `translate3d(${(-x * TEXT_PARALLAX).toFixed(2)}px, ${(-y * TEXT_PARALLAX).toFixed(2)}px, 0)`;
  }, []);

  const lineOne = [content.lineOneLead, content.emphasis];
  const lineTwo = content.lineTwo.split(" ");
  // Line two starts 120ms after line one's first word finishes.
  const lineTwoStart = timing.heroHeadlineAt + duration.reveal + timing.heroHeadlineLineGap;

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-labelledby="hero-title"
      className="surface-dark hero-offset relative isolate flex min-h-svh items-end overflow-hidden bg-navy-950 pb-20 md:items-center md:pb-24"
    >
      {/* Background layers: scroll exit (outer) and entrance fade (inner) on separate elements. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={reduced ? {} : { scale: canvasScale, opacity: canvasOpacity }}
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
          <ParticleNetwork
            mode="ambient"
            interactive
            calmRef={textRef}
            onParallax={onParallax}
            seed={11}
          />
        </motion.div>
        <div className="bg-hero-veil absolute inset-0" />
      </motion.div>

      <div className="container-page grid-page relative w-full">
        <motion.div
          className="col-span-4 md:col-span-7 lg:col-span-8"
          style={reduced ? {} : { y: textY, opacity: textOpacity }}
        >
          <div ref={parallaxRef}>
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
                  className="mt-4 font-display text-display-xl text-cloud-50 lg:mt-5"
                >
                  <HeadlineLine words={lineOne} startMs={timing.heroHeadlineAt} gradientFrom={1} />
                  <HeadlineLine words={lineTwo} startMs={lineTwoStart} />
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
          </div>
        </motion.div>
      </div>

      {/* Scroll cue: decorative. */}
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
          <span className="eyebrow before:hidden">{content.scrollLabel}</span>
          <span className="relative block h-12 w-px bg-line-dark-strong">
            <span className="motion-loop absolute top-0 -left-[2.5px] size-1.5 animate-scroll-cue rounded-full bg-cyan-400" />
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}

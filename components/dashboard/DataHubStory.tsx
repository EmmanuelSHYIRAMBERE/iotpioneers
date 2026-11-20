"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { cn } from "@/lib/cn";
import { timing } from "@/lib/motion";
import { DEMO_SEED } from "@/lib/demoData";
import {
  IoTDashboardPreview,
  STORY_STEPS,
  type DashboardLabels,
  type StoryStep,
} from "./IoTDashboardPreview";
import { StepRail } from "./StepRail";

export interface StoryStepContent {
  id: StoryStep;
  index: string;
  title: string;
  text: string;
  verified: boolean;
}

export interface DataHubStoryProps {
  steps: readonly StoryStepContent[];
  labels: DashboardLabels;
}

type StoryMode = "pinned" | "sequence" | "swipe" | "static";

/** Auto sequence interval on tablets: each step triggers once, in order. */
const SEQUENCE_STEP_MS = timing.chartDraw + timing.dataTick;

/**
 * The IoTDataHub scroll story.
 * - lg and up: GSAP ScrollTrigger pins the demo for 300% of the viewport height (scrub 0.6).
 * - md: no pinning; the steps trigger once each, in order, when the demo enters view.
 * - mobile: a swipeable row of step cards drives the emphasis.
 * - reduced motion: no pinning; the dashboard appears in its final state.
 */
export function DataHubStory({ steps, labels }: DataHubStoryProps) {
  // Steps beside the dashboard only from xl: at 1024px a 4 + 8 column split leaves the dashboard
  // about 600px wide, which clipped it (audit issue 18). Below xl the steps sit above it.
  const wide = useMediaQuery(mediaQueries.xl);
  const tablet = useMediaQuery(mediaQueries.md);
  const reduced = useReducedMotionPreference();
  const mode: StoryMode = !tablet ? "swipe" : reduced ? "static" : wide ? "pinned" : "sequence";
  const sideBySide = wide;

  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0 });
  const [current, setCurrent] = useState(-1);
  const [reached, setReached] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);

  // Pinned story with GSAP, loaded only here.
  useEffect(() => {
    if (mode !== "pinned") return;
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin) return;
    let cancelled = false;
    let cleanup = (): void => undefined;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, triggerModule]) => {
        if (cancelled) return;
        const { ScrollTrigger } = triggerModule;
        gsapModule.gsap.registerPlugin(ScrollTrigger);
        const trigger = ScrollTrigger.create({
          trigger: pin,
          // Pin when the content is centred in the viewport, so no full-height wrapper (and no empty
          // band above or below it) is needed (audit issue 6).
          start: "center center",
          end: () => `+=${String(window.innerHeight * 3)}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            setProgress(p);
            const index =
              p <= 0
                ? -1
                : Math.min(
                    STORY_STEPS.length - 1,
                    Math.floor(p * STORY_STEPS.length * 0.999 + 0.001),
                  );
            const done = p >= 0.985;
            setFinished(done);
            setCurrent(done ? -1 : Math.max(0, index));
            setReached((value) => Math.max(value, Math.max(0, index)));
          },
        });
        cleanup = () => {
          trigger.kill();
        };
      },
    );
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [mode]);

  // Tablet: once in view, each step triggers once in order, then the dashboard is fully lit.
  useEffect(() => {
    if (mode !== "sequence" || !inView || finished) return;
    const id = window.setInterval(() => {
      setCurrent((value) => {
        const next = value + 1;
        if (next >= STORY_STEPS.length) {
          window.clearInterval(id);
          setFinished(true);
          return -1;
        }
        setReached((r) => Math.max(r, next));
        return next;
      });
    }, SEQUENCE_STEP_MS);
    const first = window.setTimeout(() => {
      setCurrent((value) => (value < 0 ? 0 : value));
      setReached((r) => Math.max(r, 0));
    }, 0);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [mode, inView, finished]);

  // Static (reduced motion): everything in its final state, derived rather than stored.
  const isStatic = mode === "static";
  const staticSwipe = mode === "swipe" && reduced;
  const shownCurrent = isStatic || staticSwipe ? -1 : current;
  const shownReached = isStatic || staticSwipe ? STORY_STEPS.length - 1 : reached;
  const shownFinished = isStatic || finished;
  const activeStep: StoryStep | null =
    shownCurrent >= 0 ? (STORY_STEPS[shownCurrent] ?? null) : null;

  if (mode === "swipe") {
    // Reduced motion on phones keeps the phone composition, in its final state.
    return (
      <div ref={rootRef}>
        <SwipeSteps
          steps={steps}
          current={shownCurrent}
          onSelect={(index) => {
            setCurrent(index);
            setReached((value) => Math.max(value, index));
          }}
        />
        <div className="mt-6">
          <IoTDashboardPreview
            labels={labels}
            seed={DEMO_SEED}
            layout="mobile"
            activeStep={activeStep}
            reachedStep={shownReached}
            inView={inView}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef}>
      <div ref={pinRef}>
        <div className="grid-page w-full items-center gap-y-10">
          {!sideBySide ? (
            <ol className="col-span-full grid grid-cols-2 gap-4 lg:grid-cols-4">
              {steps.map((step, index) => (
                <StepText
                  key={step.id}
                  step={step}
                  active={index === shownCurrent}
                  dim={shownCurrent >= 0 && index !== shownCurrent}
                  compact
                />
              ))}
            </ol>
          ) : (
            <div className="col-span-4 flex gap-6">
              {mode === "pinned" ? (
                <StepRail
                  steps={steps.length}
                  current={shownFinished ? steps.length - 1 : shownCurrent}
                  progress={progress}
                  className="shrink-0"
                />
              ) : null}
              <ol className="flex flex-col gap-6">
                {steps.map((step, index) => {
                  // While pinned only the current step shows its text, so the column fits the viewport.
                  const expandedIndex = shownFinished
                    ? steps.length - 1
                    : Math.max(0, shownCurrent);
                  return (
                    <StepText
                      key={step.id}
                      step={step}
                      active={index === shownCurrent}
                      dim={mode === "pinned" && shownCurrent >= 0 && index !== shownCurrent}
                      collapsed={mode === "pinned" && index !== expandedIndex}
                    />
                  );
                })}
              </ol>
            </div>
          )}
          <div className={cn("col-span-full", sideBySide && "col-span-8")}>
            <IoTDashboardPreview
              labels={labels}
              seed={DEMO_SEED}
              layout="desktop"
              activeStep={activeStep}
              reachedStep={shownReached}
              inView={inView}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepText({
  step,
  active,
  dim,
  compact = false,
  collapsed = false,
}: {
  step: StoryStepContent;
  active: boolean;
  dim: boolean;
  compact?: boolean;
  collapsed?: boolean;
}) {
  return (
    <li
      aria-current={active ? "step" : undefined}
      // Inactive steps dim their card (border and background), never their text: titles and body
      // stay at slate-400 or lighter on navy, 7.3:1 or better (audit follow-up, WCAG 1.4.3).
      className={cn(
        "transition-colors duration-300 ease-standard",
        compact && "rounded-card border p-4",
        compact &&
          (active
            ? "border-cyan-400/40 bg-navy-900"
            : dim
              ? "border-line-dark-soft bg-transparent"
              : "border-line-dark"),
      )}
    >
      <VerifyMarker verified={step.verified}>
        <p className={cn("font-mono text-small", active ? "text-cyan-400" : "text-slate-400")}>
          {step.index}
        </p>
        <h3 className={cn("mt-2 font-display text-h4", dim ? "text-slate-400" : "text-cloud-50")}>
          {step.title}
        </h3>
        <p
          className={cn(
            "mt-2 text-slate-400",
            compact ? "text-small" : "text-body",
            collapsed && "sr-only",
          )}
        >
          {step.text}
        </p>
      </VerifyMarker>
    </li>
  );
}

function SwipeSteps({
  steps,
  current,
  onSelect,
}: {
  steps: readonly StoryStepContent[];
  current: number;
  onSelect: (index: number) => void;
}) {
  const trackRef = useRef<HTMLOListElement>(null);
  const selected = Math.max(0, current);

  // Swiping changes the emphasis: the card nearest the start edge becomes current.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const first = track.firstElementChild;
        if (!(first instanceof HTMLElement)) return;
        const width = first.offsetWidth + 12;
        const index = Math.round(track.scrollLeft / width);
        onSelect(Math.min(steps.length - 1, Math.max(0, index)));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, [onSelect, steps.length]);

  return (
    <div>
      <ol
        ref={trackRef}
        aria-label="How IoTDataHub works"
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 sm:-mx-6 sm:px-6"
      >
        {steps.map((step, index) => (
          <li key={step.id} className="w-[82%] shrink-0 snap-start">
            <button
              type="button"
              aria-current={index === selected ? "step" : undefined}
              onClick={(event) => {
                onSelect(index);
                event.currentTarget
                  .closest("li")
                  ?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
              }}
              className={cn(
                "h-full w-full rounded-card border p-4 text-left transition-colors duration-200",
                index === selected ? "border-cyan-400/40 bg-navy-900" : "border-line-dark",
              )}
            >
              <VerifyMarker verified={step.verified} as="span" className="block">
                <span className="block font-mono text-small text-cyan-400">
                  {step.index} / {String(steps.length).padStart(2, "0")}
                </span>
                <span className="mt-2 block font-display text-h4 text-cloud-50">{step.title}</span>
                <span className="mt-2 block text-small text-slate-400">{step.text}</span>
              </VerifyMarker>
            </button>
          </li>
        ))}
      </ol>
      <div aria-hidden="true" className="mt-4 flex justify-center gap-2">
        {steps.map((step, index) => (
          <span
            key={step.id}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === selected ? "w-5 bg-cyan-400" : "w-1.5 bg-slate-400/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}

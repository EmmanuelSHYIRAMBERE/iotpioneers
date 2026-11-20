"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { useInView } from "@/hooks/useInView";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { cn } from "@/lib/cn";
import { timing } from "@/lib/motion";
import { ICON_STROKE } from "@/lib/tokens";

export interface TechnologyMarqueeProps {
  label: string;
  items: readonly string[];
  verified: boolean;
  /** Pixels per second: desktop and mobile. */
  speed?: { desktop: number; mobile: number };
  direction?: "left" | "right";
}

const HOVER_RATE = 0.25;

function NodeGlyph() {
  return (
    <span
      aria-hidden="true"
      className="flex size-2.5 shrink-0 items-center justify-center rounded-full border border-navy-950"
    >
      <span className="size-1 rounded-full bg-navy-950" />
    </span>
  );
}

function ItemList({
  items,
  label,
  hidden,
  onHover,
}: {
  items: readonly string[];
  label: string;
  hidden?: boolean;
  onHover?: (on: boolean) => void;
}) {
  return (
    <ul
      aria-label={hidden ? undefined : label}
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {items.map((item) => (
        <li
          key={item}
          className="group flex items-center"
          onMouseEnter={() => onHover?.(true)}
          onMouseLeave={() => onHover?.(false)}
        >
          <span className="px-6 font-display text-marquee font-semibold whitespace-nowrap text-navy-950 decoration-navy-950 decoration-2 underline-offset-8 transition-colors duration-200 group-hover:underline md:px-10">
            {item}
          </span>
          <NodeGlyph />
        </li>
      ))}
    </ul>
  );
}

/**
 * Signal strip of the company's areas of work. Right to left at a constant pixel speed, slows to
 * 25% on hover (eased over 400ms), pauses on focus, off screen, when the tab is hidden and with
 * the visible toggle. Reduced motion shows a static wrapped list. Screen readers read it once.
 */
export function TechnologyMarquee({
  label,
  items,
  verified,
  speed = { desktop: 40, mobile: 28 },
  direction = "left",
}: TechnologyMarqueeProps) {
  const bandRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const rateFrame = useRef(0);
  const [userPaused, setUserPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const reduced = useReducedMotionPreference();
  const inView = useInView(bandRef);
  const pageVisible = usePageVisibility();
  const desktop = useMediaQuery(mediaQueries.md, true);
  const pxPerSecond = desktop ? speed.desktop : speed.mobile;

  // Build the animation from the measured width so the speed is constant in pixels.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduced) return;
    const build = (): void => {
      const half = track.scrollWidth / 2;
      if (half <= 0) return;
      const previous = animationRef.current;
      const progress =
        previous && previous.effect
          ? (Number(previous.currentTime ?? 0) / Number(previous.effect.getTiming().duration)) % 1
          : 0;
      previous?.cancel();
      const frames =
        direction === "left"
          ? [{ transform: "translate3d(0, 0, 0)" }, { transform: "translate3d(-50%, 0, 0)" }]
          : [{ transform: "translate3d(-50%, 0, 0)" }, { transform: "translate3d(0, 0, 0)" }];
      const durationMs = (half / pxPerSecond) * 1000;
      const animation = track.animate(frames, {
        duration: durationMs,
        iterations: Infinity,
        easing: "linear",
      });
      animation.currentTime = progress * durationMs;
      animationRef.current = animation;
    };
    build();
    const observer = new ResizeObserver(build);
    observer.observe(track);
    return () => {
      observer.disconnect();
      animationRef.current?.cancel();
      animationRef.current = null;
    };
  }, [reduced, pxPerSecond, direction]);

  const running = !reduced && !userPaused && !focusPaused && inView && pageVisible;
  useEffect(() => {
    const animation = animationRef.current;
    if (!animation) return;
    if (running) animation.play();
    else animation.pause();
  }, [running, reduced, pxPerSecond]);

  // Ease the playback rate rather than stopping abruptly.
  const easeRate = (target: number): void => {
    const animation = animationRef.current;
    if (!animation) return;
    cancelAnimationFrame(rateFrame.current);
    const from = animation.playbackRate;
    const start = performance.now();
    const step = (now: number): void => {
      const t = Math.min(1, (now - start) / timing.marqueeEase);
      animation.playbackRate = from + (target - from) * t;
      if (t < 1) rateFrame.current = requestAnimationFrame(step);
    };
    rateFrame.current = requestAnimationFrame(step);
  };

  useEffect(
    () => () => {
      cancelAnimationFrame(rateFrame.current);
    },
    [],
  );

  const onHover = (on: boolean): void => {
    easeRate(on ? HOVER_RATE : 1);
  };

  return (
    <div
      ref={bandRef}
      onFocus={() => {
        setFocusPaused(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusPaused(false);
      }}
      className="relative overflow-hidden bg-bright-gold text-navy-950 [--focus-ring:var(--color-navy-950)]"
    >
      <VerifyMarker verified={verified} className="relative">
        {reduced ? (
          <div className="container-page py-6">
            <ul
              aria-label={label}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pr-12"
            >
              {items.map((item) => (
                <li key={item} className="flex items-center gap-6">
                  <span className="font-display text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-semibold text-navy-950">
                    {item}
                  </span>
                  <NodeGlyph />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex h-16 items-center md:h-24">
            <div ref={trackRef} className="flex w-max will-change-transform">
              <ItemList items={items} label={label} onHover={onHover} />
              <ItemList items={items} label={label} hidden onHover={onHover} />
            </div>
          </div>
        )}
      </VerifyMarker>
      {!reduced ? (
        <button
          type="button"
          onClick={() => {
            setUserPaused((value) => !value);
          }}
          aria-pressed={userPaused}
          aria-label={userPaused ? "Play animation" : "Pause animation"}
          className={cn(
            "absolute top-1/2 right-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-navy-950 [--focus-ring:var(--color-navy-950)] md:right-4",
          )}
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-navy-950/40">
            {userPaused ? (
              <Play aria-hidden="true" size={12} strokeWidth={ICON_STROKE} />
            ) : (
              <Pause aria-hidden="true" size={12} strokeWidth={ICON_STROKE} />
            )}
          </span>
        </button>
      ) : null}
    </div>
  );
}

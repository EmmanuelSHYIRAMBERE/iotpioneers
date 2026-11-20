"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { useInView } from "@/hooks/useInView";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { cn } from "@/lib/cn";
import { marqueeSpeed, timing } from "@/lib/motion";
import { ICON_STROKE } from "@/lib/tokens";

export interface TechnologyMarqueeProps {
  label: string;
  items: readonly string[];
  verified: boolean;
}

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
 * One marquee row: a constant pixel speed Web Animation built from the measured width.
 * Hover eases this row's playback rate to 25% over 400ms.
 */
function MarqueeRow({
  items,
  label,
  direction,
  pxPerSecond,
  running,
  exposed,
}: {
  items: readonly string[];
  label: string;
  direction: "left" | "right";
  pxPerSecond: number;
  running: boolean;
  /** Only the first row is exposed to assistive technology. */
  exposed: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const runningRef = useRef(running);
  const rateFrame = useRef(0);

  useEffect(() => {
    runningRef.current = running;
    const animation = animationRef.current;
    if (!animation) return;
    if (running) animation.play();
    else animation.pause();
  }, [running]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
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
      if (!runningRef.current) animation.pause();
      animationRef.current = animation;
    };
    build();
    const observer = new ResizeObserver(build);
    observer.observe(track);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rateFrame.current);
      animationRef.current?.cancel();
      animationRef.current = null;
    };
  }, [pxPerSecond, direction]);

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
  const onHover = (on: boolean): void => {
    easeRate(on ? marqueeSpeed.hoverFactor : 1);
  };

  return (
    <div className="flex h-12 items-center md:h-16" aria-hidden={exposed ? undefined : true}>
      <div ref={trackRef} className="flex w-max will-change-transform" data-marquee-row={direction}>
        <ItemList items={items} label={label} hidden={!exposed} onHover={onHover} />
        <ItemList items={items} label={label} hidden onHover={onHover} />
      </div>
    </div>
  );
}

/**
 * Signal strip of the company's areas of work, in two rows on the brightGold band: the top row
 * moves right to left at 40px/s and the bottom row left to right at 32px/s (half speed on
 * phones). Each row slows to 25% on hover; both pause on focus, off screen, in a hidden tab and
 * with the visible toggle. Reduced motion shows both rows as static wrapped lines. Screen readers
 * read the list once: the second row repeats the items in reverse order and is hidden from them.
 */
export function TechnologyMarquee({ label, items, verified }: TechnologyMarqueeProps) {
  const bandRef = useRef<HTMLDivElement>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const reduced = useReducedMotionPreference();
  const inView = useInView(bandRef);
  const pageVisible = usePageVisibility();
  const desktop = useMediaQuery(mediaQueries.md, true);
  const scale = desktop ? 1 : 0.5;
  const reversed = [...items].reverse();
  const running = !reduced && !userPaused && !focusPaused && inView && pageVisible;

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
          <div className="container-page flex flex-col gap-3 py-6">
            {[items, reversed].map((row, index) => (
              <ul
                key={index === 0 ? "top" : "bottom"}
                aria-label={index === 0 ? label : undefined}
                aria-hidden={index === 0 ? undefined : true}
                className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pr-12"
              >
                {row.map((item) => (
                  <li key={item} className="flex items-center gap-6">
                    <span className="font-display text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-semibold text-navy-950">
                      {item}
                    </span>
                    <NodeGlyph />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        ) : (
          <div className="flex flex-col py-2 md:py-3">
            <MarqueeRow
              items={items}
              label={label}
              direction="left"
              pxPerSecond={marqueeSpeed.topPxPerSecond * scale}
              running={running}
              exposed
            />
            <MarqueeRow
              items={reversed}
              label={label}
              direction="right"
              pxPerSecond={marqueeSpeed.bottomPxPerSecond * scale}
              running={running}
              exposed={false}
            />
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
          <span className="flex size-7 items-center justify-center rounded-full bg-bright-gold ring-1 ring-navy-950">
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

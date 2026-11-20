"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useInView } from "@/hooks/useInView";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { cn } from "@/lib/cn";
import { duration, timing } from "@/lib/motion";
import {
  densityFor,
  ParticleNetworkEngine,
  type NetworkLayout,
  type NetworkMode,
} from "./particleNetworkEngine";
import { StaticNetwork } from "./StaticNetwork";

export interface ParticleNetworkProps {
  mode: NetworkMode;
  /** Pointer attraction, cursor links and parallax (fine pointers), ripple on tap. */
  interactive?: boolean;
  paused?: boolean;
  seed?: number;
  /** Element whose area keeps nodes at 0.3 opacity or less (text readability). */
  calmRef?: RefObject<HTMLElement | null>;
  /** Receives the smoothed pointer offset (-1..1) each frame, for text parallax. */
  onParallax?: (x: number, y: number) => void;
  /** Faint background layer: about 25 nodes, no pulses, half opacity (hero behind the globe). */
  faint?: boolean;
  /** Converge mode: the network flows into the centre of this element (audit issue 30). */
  focusRef?: RefObject<HTMLElement | null>;
  className?: string;
}

const CANVAS_PARALLAX = 10;

function layoutFor(width: number, mode: NetworkMode): NetworkLayout {
  if (mode === "converge") return "full";
  if (width < 768) return "top";
  if (width < 1024) return "full";
  return "right";
}

/**
 * Canvas node network ("Signal to Insight" motif). Decorative and hidden from assistive
 * technology. Shows a static SVG until the canvas is ready, and renders one still frame
 * under reduced motion.
 */
export function ParticleNetwork({
  mode,
  interactive = false,
  paused = false,
  seed = 7,
  calmRef,
  onParallax,
  faint = false,
  focusRef,
  className,
}: ParticleNetworkProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleNetworkEngine | null>(null);
  const staticRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef(onParallax);
  const [bucket, setBucket] = useState<string | null>(null);

  const inView = useInView(wrapperRef, { amount: 0 });
  const pageVisible = usePageVisibility();
  const reduced = useReducedMotionPreference();
  const finePointer = useMediaQuery(mediaQueries.finePointer);

  useEffect(() => {
    parallaxRef.current = onParallax;
  }, [onParallax]);

  // Track the density bucket so the engine is rebuilt only when it changes.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const measure = (): void => {
      const width = wrapper.clientWidth;
      const { count, linkDistance } = densityFor(width, mode, faint);
      setBucket(`${String(count)}-${String(linkDistance)}-${layoutFor(width, mode)}`);
      const engine = engineRef.current;
      if (engine) {
        engine.resize(wrapper.clientWidth, wrapper.clientHeight, window.devicePixelRatio || 1);
        updateCalm();
        updateFocus();
      }
    };
    const updateFocus = (): void => {
      const engine = engineRef.current;
      const focus = focusRef?.current;
      if (!engine || !focus) return;
      const a = wrapper.getBoundingClientRect();
      const b = focus.getBoundingClientRect();
      engine.setFocusPoint({ x: b.left - a.left + b.width / 2, y: b.top - a.top + b.height / 2 });
    };
    const updateCalm = (): void => {
      const engine = engineRef.current;
      const calm = calmRef?.current;
      if (!engine || !calm) return;
      const a = wrapper.getBoundingClientRect();
      const b = calm.getBoundingClientRect();
      engine.setCalmRect({
        x: b.left - a.left,
        y: b.top - a.top,
        width: b.width,
        height: b.height,
      });
    };
    // ResizeObserver reports the initial size too, so no synchronous measure is needed.
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => {
      observer.disconnect();
    };
  }, [mode, calmRef, faint, focusRef]);

  // Build the engine for the current bucket.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas || bucket === null) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = wrapper.clientWidth;
    const { count, linkDistance } = densityFor(width, mode, faint);
    const lowPower = typeof navigator !== "undefined" && (navigator.hardwareConcurrency || 8) <= 4;
    const engine = new ParticleNetworkEngine(ctx, {
      mode,
      count,
      linkDistance,
      layout: layoutFor(width, mode),
      interactive,
      seed,
      lowPower,
      faint,
    });
    engine.resize(width, wrapper.clientHeight, window.devicePixelRatio || 1);
    const calm = calmRef?.current;
    if (calm) {
      const a = wrapper.getBoundingClientRect();
      const b = calm.getBoundingClientRect();
      engine.setCalmRect({
        x: b.left - a.left,
        y: b.top - a.top,
        width: b.width,
        height: b.height,
      });
    }
    const focus = focusRef?.current;
    if (focus) {
      const a = wrapper.getBoundingClientRect();
      const b = focus.getBoundingClientRect();
      engine.setFocusPoint({ x: b.left - a.left + b.width / 2, y: b.top - a.top + b.height / 2 });
    }
    engine.onFrame = (x, y) => {
      canvas.style.transform = `translate3d(${(-x * CANVAS_PARALLAX).toFixed(2)}px, ${(-y * CANVAS_PARALLAX).toFixed(2)}px, 0)`;
      parallaxRef.current?.(x, y);
    };
    engineRef.current = engine;
    // Reveal the canvas and retire the static SVG directly: a DOM sync, not React state.
    canvas.style.opacity = "1";
    if (staticRef.current) staticRef.current.style.opacity = "0";
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [bucket, mode, interactive, seed, calmRef, faint, focusRef]);

  // Run only while in view, the tab is visible, not paused, and motion is allowed.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (reduced) {
      engine.renderStatic();
      return;
    }
    if (inView && pageVisible && !paused) engine.start();
    else engine.stop();
  }, [reduced, inView, pageVisible, paused, bucket]);

  // Pointer (fine) and tap ripple (touch).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!interactive || !canvas || reduced) return;
    const local = (event: PointerEvent): { x: number; y: number; inside: boolean } => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
    };
    const onMove = (event: PointerEvent): void => {
      if (!finePointer || event.pointerType !== "mouse") return;
      const { x, y, inside } = local(event);
      engineRef.current?.setPointer(x, y, inside);
    };
    const onDown = (event: PointerEvent): void => {
      if (event.pointerType === "mouse") return;
      const { x, y, inside } = local(event);
      if (inside) engineRef.current?.ripple(x, y);
    };
    const onLeave = (): void => {
      engineRef.current?.setPointer(0, 0, false);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [interactive, finePointer, reduced]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      <div ref={staticRef} className="absolute inset-0 transition-opacity">
        <StaticNetwork seed={seed} variant={mode} faint={faint} />
      </div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity ease-out"
        style={{
          transitionDuration: `${String(reduced ? timing.reducedFade : duration.cinematic)}ms`,
        }}
      />
    </div>
  );
}

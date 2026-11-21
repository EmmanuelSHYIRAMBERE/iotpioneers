"use client";

import { useEffect, useRef, type ComponentType } from "react";
import { Cpu, Thermometer, Wifi, type LucideProps } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useManualReducedMotion } from "@/hooks/useReducedMotionPreference";
import { cn } from "@/lib/cn";
import { duration, globe, timing } from "@/lib/motion";
import { ICON_STROKE } from "@/lib/tokens";
import { StaticGlobe } from "./StaticNetwork";
import {
  decodeGlobePoints,
  GlobeRenderer,
  spinFacing,
  type GlobeFrame,
  type Orientation,
} from "./globeEngine";

export interface ConnectedGlobeProps {
  /** Mobile composition: no orbits, 4 arcs, 30 frames per second. */
  compact: boolean;
  /** Paused by the visitor (the hero's pause button, WCAG 2.2.2): holds the current frame. */
  paused?: boolean;
  className?: string;
}

const ORBIT_ICONS: readonly ComponentType<LucideProps>[] = [Cpu, Wifi, Thermometer];
const DEG = Math.PI / 180;
/** Pixels of horizontal movement before a touch counts as a drag (vertical scroll stays free). */
const DRAG_SLOP = 8;
/** Horizontal must dominate vertical by this factor to start a drag. */
const DRAG_DOMINANCE = 1.5;

type GlobeState = "loading" | "running" | "paused" | "static";

/**
 * Motion modes (improvement run 2):
 * - "full": 40s turn, orbits, packets, edge connections, pointer tilt and touch drag.
 * - "gentle" (system reduced motion): 120s turn with arcs drawn; no orbits, packets or edges.
 * - "frozen" (footer "Reduce motion" switch): the static frame. This is the pause control.
 */
type GlobeMode = "full" | "gentle" | "frozen";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

interface DrawOptions {
  animated: boolean;
  orbits: boolean;
  edges: boolean;
}

function markState(wrapper: HTMLElement | null, value: GlobeState): void {
  wrapper?.setAttribute("data-globe-state", value);
}

/**
 * The hero's connected globe (connected-globe-hero skill): Canvas 2D dotted Earth with Kigali as
 * the origin of every arc. Decorative and hidden from assistive technology. It turns continuously
 * and only pauses off screen or in a hidden tab, resuming from the same angle. See `GlobeMode` for
 * the reduced motion behaviour. `data-globe-state` reports "loading", "running", "paused" or
 * "static"; `data-globe-angle` (radians) and `data-globe-edges` support tests.
 */
export default function ConnectedGlobe({
  compact,
  paused = false,
  className,
}: ConnectedGlobeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rendererRef = useRef<GlobeRenderer | null>(null);
  const drawRef = useRef<((options: DrawOptions) => void) | null>(null);
  const stateRef = useRef({
    elapsed: 0,
    /** Accumulated rotation (radians): pausing or switching modes never jumps. */
    angle: 0,
    dragSpin: 0,
    velocity: 0,
    tiltOffset: 0,
    yawOffset: 0,
    targetTilt: 0,
    targetYaw: 0,
  });

  const inView = useInView(wrapperRef, { amount: 0 });
  const modeRef = useRef<GlobeMode>("full");
  const pageVisible = usePageVisibility();
  const manual = useManualReducedMotion();
  const systemReduced = useMediaQuery(REDUCED_QUERY);
  const mode: GlobeMode = manual ? "frozen" : systemReduced ? "gentle" : "full";
  const reduced = mode !== "full";
  const finePointer = useMediaQuery(mediaQueries.finePointer);

  // Load the point data lazily and build the renderer.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;
    let observer: ResizeObserver | null = null;

    void import("@/lib/globePoints").then(({ GLOBE_ROWS, GLOBE_STEP_DEG }) => {
      if (cancelled) return;
      const renderer = new GlobeRenderer(ctx, decodeGlobePoints(GLOBE_ROWS, GLOBE_STEP_DEG), {
        arcs: compact ? globe.arcsMobile : globe.arcsDesktop,
        orbits: !compact,
      });
      rendererRef.current = renderer;

      const draw = ({ animated, orbits, edges }: DrawOptions): void => {
        const s = stateRef.current;
        const orientation: Orientation = {
          spin: spinFacing(globe.kigaliLon) + s.angle + s.dragSpin,
          tilt: globe.staticTiltDeg * DEG + s.tiltOffset,
          yaw: s.yawOffset,
        };
        const frame: GlobeFrame = { timeMs: s.elapsed, orientation, animated, orbits, edges };
        renderer.draw(frame);
        wrapper.dataset.globeAngle = s.angle.toFixed(4);
        wrapper.dataset.globeEdges = String(renderer.edgeCount);
        const bodies = renderer.orbitBodies(frame);
        bodies.forEach((body, index) => {
          const icon = iconRefs.current[index];
          if (!icon) return;
          if (!orbits) {
            icon.style.opacity = "0";
            return;
          }
          const scale = body.behind ? 0.85 : 1;
          icon.style.transform = `translate3d(${body.x.toFixed(1)}px, ${body.y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${String(scale)})`;
          icon.style.opacity = body.behind ? "0.6" : "1";
          icon.style.zIndex = body.behind ? "0" : "2";
        });
      };
      drawRef.current = draw;

      observer = new ResizeObserver(() => {
        renderer.resize(wrapper.clientWidth, window.devicePixelRatio || 1);
        draw({ animated: false, orbits: modeRef.current === "full", edges: false });
      });
      observer.observe(wrapper);
      // Reveal the canvas and retire the static frame directly: a DOM sync, not React state.
      canvas.style.opacity = "1";
      if (staticRef.current) staticRef.current.style.opacity = "0";
      wrapper.setAttribute("data-globe-ready", "true");
      if (wrapper.getAttribute("data-globe-state") === "loading") markState(wrapper, "paused");
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      rendererRef.current = null;
      drawRef.current = null;
    };
  }, [compact]);

  // Run while in view and the tab is visible. Only the footer switch ("frozen") stops it.
  useEffect(() => {
    modeRef.current = mode;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let frameId = 0;
    let readyPoll = 0;

    if (mode === "frozen") {
      // Static frame: Kigali facing, tilted, arcs drawn, no packets, orbit icons still.
      const paint = (): void => {
        const draw = drawRef.current;
        if (!draw) {
          readyPoll = requestAnimationFrame(paint);
          return;
        }
        const s = stateRef.current;
        s.elapsed = 0;
        s.angle = 0;
        s.dragSpin = 0;
        s.tiltOffset = 0;
        s.yawOffset = 0;
        draw({ animated: false, orbits: true, edges: false });
        markState(wrapper, "static");
      };
      paint();
      return () => {
        cancelAnimationFrame(readyPoll);
      };
    }

    if (!inView || !pageVisible || paused) {
      markState(wrapper, drawRef.current ? "paused" : "loading");
      return;
    }

    const full = mode === "full";
    const lowPower =
      compact || (typeof navigator !== "undefined" && (navigator.hardwareConcurrency || 8) <= 4);
    // Adaptive frame rate: start at 60fps (30 on phones and 4 or fewer cores) and drop to 30 for
    // the rest of the session if the average draw cost over 60 frames exceeds the budget. It only
    // lowers the frame rate; the loop itself never stops while the globe is visible.
    let minInterval = 1000 / (lowPower ? globe.fpsLow : globe.fpsDesktop);
    let last = performance.now();
    let stats = { frames: 0, total: 0, max: 0 };

    const loop = (now: number): void => {
      frameId = requestAnimationFrame(loop);
      const draw = drawRef.current;
      if (!draw) {
        last = now;
        return;
      }
      const delta = now - last;
      if (delta < minInterval - 1) return;
      last = now;
      const dt = Math.min(delta, 50);
      const s = stateRef.current;
      s.elapsed += dt;
      s.angle += (dt / (full ? globe.turnMs : globe.turnReducedMs)) * Math.PI * 2;
      // Touch inertia decays over about dragDecayMs.
      if (Math.abs(s.velocity) > 1e-5) {
        s.dragSpin += s.velocity * dt;
        s.velocity *= Math.exp(-dt / (globe.dragDecayMs / 3));
      }
      s.tiltOffset += (s.targetTilt - s.tiltOffset) * globe.pointerSmoothing;
      s.yawOffset += (s.targetYaw - s.yawOffset) * globe.pointerSmoothing;
      const t0 = performance.now();
      draw({ animated: full, orbits: full, edges: full });
      const cost = performance.now() - t0;
      stats.frames += 1;
      stats.total += cost;
      stats.max = Math.max(stats.max, cost);
      if (stats.frames >= 60) {
        const average = stats.total / stats.frames;
        if (average > globe.drawBudgetMs) {
          minInterval = 1000 / globe.fpsLow;
          wrapper.dataset.globeFps = String(globe.fpsLow);
        }
        wrapper.dataset.frameAvgMs = average.toFixed(2);
        wrapper.dataset.frameMaxMs = stats.max.toFixed(2);
        stats = { frames: 0, total: 0, max: 0 };
      }
    };
    markState(wrapper, "running");
    frameId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [mode, inView, pageVisible, paused, compact]);

  // Pointer tilt toward the cursor (fine pointers) and horizontal touch drag with inertia.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || reduced) return;
    const s = stateRef.current;

    const onMove = (event: PointerEvent): void => {
      if (event.pointerType !== "mouse") return;
      const rect = wrapper.getBoundingClientRect();
      const nx = Math.max(
        -1,
        Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2)),
      );
      const ny = Math.max(
        -1,
        Math.min(1, (event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2)),
      );
      s.targetYaw = nx * globe.pointerTiltMaxDeg * DEG;
      s.targetTilt = ny * globe.pointerTiltMaxDeg * DEG;
    };
    if (finePointer) window.addEventListener("pointermove", onMove, { passive: true });

    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastT = 0;
    let tracking = false;
    let dragging = false;
    const onDown = (event: PointerEvent): void => {
      if (event.pointerType === "mouse") return;
      tracking = true;
      dragging = false;
      startX = event.clientX;
      startY = event.clientY;
      lastX = event.clientX;
      lastT = event.timeStamp;
      s.velocity = 0;
    };
    const onTouchMove = (event: PointerEvent): void => {
      if (!tracking) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!dragging) {
        if (Math.abs(dx) < DRAG_SLOP || Math.abs(dx) < Math.abs(dy) * DRAG_DOMINANCE) return;
        dragging = true;
      }
      const step = event.clientX - lastX;
      const dt = Math.max(1, event.timeStamp - lastT);
      const perPixel = Math.PI / Math.max(1, wrapper.clientWidth);
      s.dragSpin += step * perPixel;
      s.velocity = (step * perPixel) / dt;
      lastX = event.clientX;
      lastT = event.timeStamp;
    };
    const onUp = (): void => {
      tracking = false;
      dragging = false;
    };
    wrapper.addEventListener("pointerdown", onDown, { passive: true });
    wrapper.addEventListener("pointermove", onTouchMove, { passive: true });
    wrapper.addEventListener("pointerup", onUp, { passive: true });
    wrapper.addEventListener("pointercancel", onUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      wrapper.removeEventListener("pointerdown", onDown);
      wrapper.removeEventListener("pointermove", onTouchMove);
      wrapper.removeEventListener("pointerup", onUp);
      wrapper.removeEventListener("pointercancel", onUp);
      s.targetTilt = 0;
      s.targetYaw = 0;
    };
  }, [reduced, finePointer]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      data-globe-state="loading"
      className={cn("relative aspect-square w-full touch-pan-y select-none", className)}
    >
      <div
        ref={staticRef}
        className="absolute inset-0 transition-opacity ease-out"
        style={{
          transitionDuration: `${String(reduced ? timing.reducedFade : duration.cinematic)}ms`,
        }}
      >
        <StaticGlobe compact={compact} />
      </div>
      {!compact
        ? ORBIT_ICONS.map((Icon, index) => (
            <span
              key={index}
              ref={(node) => {
                iconRefs.current[index] = node;
              }}
              className="pointer-events-none absolute top-0 left-0 flex size-9 items-center justify-center rounded-full border border-line-dark-strong bg-navy-900 text-pioneer-gold opacity-0"
            >
              <Icon size={18} strokeWidth={ICON_STROKE} />
            </span>
          ))
        : null}
      <canvas
        ref={canvasRef}
        className="relative z-[1] h-full w-full opacity-0 transition-opacity ease-out"
        style={{
          transitionDuration: `${String(reduced ? timing.reducedFade : duration.cinematic)}ms`,
        }}
      />
    </div>
  );
}

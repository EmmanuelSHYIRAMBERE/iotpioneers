"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate } from "motion/react";
import { useMediaQuery, mediaQueries } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { spring } from "@/lib/motion";

const MAX_SHIFT = 6;
const RADIUS = 80;
const LERP = 0.15;

export interface MagneticInnerProps {
  children: ReactNode;
}

/**
 * Moves the button's inner content up to 6px towards the pointer. The button itself (the
 * hit area) never moves. Fine pointers only; off with reduced motion.
 */
export function MagneticInner({ children }: MagneticInnerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useMediaQuery(mediaQueries.finePointer);
  const reduced = useReducedMotionPreference();
  const enabled = fine && !reduced;

  useEffect(() => {
    const inner = ref.current;
    const host = inner?.parentElement;
    if (!enabled || !inner || !host) return;

    let frame = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let active = false;

    const tick = (): void => {
      currentX += (targetX - currentX) * LERP;
      currentY += (targetY - currentY) * LERP;
      inner.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      if (active) frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent): void => {
      const rect = host.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const reach = Math.max(rect.width, rect.height) / 2 + RADIUS;
      const distanceToCentre = Math.hypot(dx, dy);
      if (distanceToCentre < reach) {
        const strength = 1 - distanceToCentre / reach;
        targetX = (dx / reach) * MAX_SHIFT * (0.5 + strength);
        targetY = (dy / reach) * MAX_SHIFT * (0.5 + strength);
        targetX = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, targetX));
        targetY = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, targetY));
        if (!active) {
          active = true;
          frame = requestAnimationFrame(tick);
        }
      } else if (active) {
        active = false;
        cancelAnimationFrame(frame);
        const fromX = currentX;
        const fromY = currentY;
        currentX = 0;
        currentY = 0;
        targetX = 0;
        targetY = 0;
        void animate(inner, { x: [fromX, 0], y: [fromY, 0] }, spring.soft);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      inner.style.transform = "";
    };
  }, [enabled]);

  return (
    <span ref={ref} className="inline-flex items-center gap-2 will-change-auto">
      {children}
    </span>
  );
}

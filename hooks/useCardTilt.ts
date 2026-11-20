"use client";

import type { PointerEvent } from "react";
import { useMotionValue, useSpring, type MotionValue } from "motion/react";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { runDistance, spring } from "@/lib/motion";

export interface CardTilt {
  /** Spread onto a motion element: `style={tilt.style}`. Empty when tilt is off. */
  style:
    | {
        rotateX: MotionValue<number>;
        rotateY: MotionValue<number>;
        y: MotionValue<number>;
        transformPerspective: number;
      }
    | Record<string, never>;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  enabled: boolean;
}

/**
 * Card system hover (reference-ui-patterns): a 4px lift and a tilt of at most 6 degrees that
 * follows the pointer, returning with the soft spring. Fine pointers only, off with reduced
 * motion, never on touch.
 */
export function useCardTilt(): CardTilt {
  const fine = useMediaQuery(mediaQueries.finePointer);
  const reduced = useReducedMotionPreference();
  const enabled = fine && !reduced;
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawLift = useMotionValue(0);
  const rotateX = useSpring(rawX, spring.soft);
  const rotateY = useSpring(rawY, spring.soft);
  const y = useSpring(rawLift, spring.soft);

  const onPointerMove = (event: PointerEvent<HTMLElement>): void => {
    if (!enabled || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rawY.set(px * 2 * runDistance.cardTiltMax);
    rawX.set(-py * 2 * runDistance.cardTiltMax);
  };
  const onPointerEnter = (): void => {
    if (enabled) rawLift.set(-runDistance.cardLift);
  };
  const onPointerLeave = (): void => {
    rawX.set(0);
    rawY.set(0);
    rawLift.set(0);
  };

  return {
    style: enabled
      ? { rotateX, rotateY, y, transformPerspective: runDistance.cardPerspective }
      : {},
    onPointerMove,
    onPointerEnter,
    onPointerLeave,
    enabled,
  };
}

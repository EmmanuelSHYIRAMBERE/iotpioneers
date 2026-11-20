"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion/react";
import { ease, s, timing } from "@/lib/motion";

export interface TweenNumberProps {
  value: number;
  decimals: number;
  /** Skip the tween (reduced motion). */
  instant?: boolean;
}

/** Tweens a displayed number over 600ms by writing text directly, avoiding a render per frame. */
export function TweenNumber({ value, decimals, instant = false }: TweenNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const from = previous.current;
    previous.current = value;
    if (instant || from === value) {
      node.textContent = value.toFixed(decimals);
      return;
    }
    const controls = animate(from, value, {
      duration: s(timing.dataTween),
      ease: ease.standard,
      onUpdate: (latest) => {
        node.textContent = latest.toFixed(decimals);
      },
    });
    return () => {
      controls.stop();
    };
  }, [value, decimals, instant]);

  return (
    <span ref={ref} className="tabular">
      {value.toFixed(decimals)}
    </span>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { cssEase, runDistance, runTiming } from "@/lib/motion";

/**
 * Soft ripple from the press point on primary buttons (scroll-motion-choreography, feedback
 * motion): a circle growing to 2.5 times the button width at 20% opacity over 500ms. Attaches to
 * its parent element. Fine pointers only, off with reduced motion, never on touch.
 */
export function PressRipple() {
  const layerRef = useRef<HTMLSpanElement>(null);
  const fine = useMediaQuery(mediaQueries.finePointer);
  const reduced = useReducedMotionPreference();
  const enabled = fine && !reduced;

  useEffect(() => {
    const layer = layerRef.current;
    const host = layer?.parentElement;
    if (!enabled || !layer || !host) return;
    const onDown = (event: PointerEvent): void => {
      if (event.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      const size = rect.width * runDistance.rippleScale;
      const dot = document.createElement("span");
      dot.style.position = "absolute";
      dot.style.left = `${String(event.clientX - rect.left - size / 2)}px`;
      dot.style.top = `${String(event.clientY - rect.top - size / 2)}px`;
      dot.style.width = `${String(size)}px`;
      dot.style.height = `${String(size)}px`;
      dot.style.borderRadius = "9999px";
      dot.style.background = "currentColor";
      dot.style.pointerEvents = "none";
      layer.appendChild(dot);
      const animation = dot.animate(
        [
          { transform: "scale(0)", opacity: runDistance.rippleOpacity },
          { transform: "scale(1)", opacity: 0 },
        ],
        { duration: runTiming.ripple, easing: cssEase("outExpo"), fill: "forwards" },
      );
      animation.onfinish = () => {
        dot.remove();
      };
    };
    host.addEventListener("pointerdown", onDown);
    return () => {
      host.removeEventListener("pointerdown", onDown);
      layer.replaceChildren();
    };
  }, [enabled]);

  return (
    <span
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    />
  );
}

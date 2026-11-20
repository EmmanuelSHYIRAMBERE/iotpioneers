"use client";

import { useEffect } from "react";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { runTiming } from "@/lib/motion";

/** How long to wait for smooth scrolling to settle when `scrollend` is unsupported. */
const SCROLL_SETTLE_FALLBACK_MS = 900;

/**
 * Anchor arrival feedback (scroll-motion-choreography): after an in-page link is followed, the
 * target section's heading gets a gold underline that grows and fades over 1200ms. Off with
 * reduced motion. Renders nothing.
 */
export function AnchorHighlight() {
  const reduced = useReducedMotionPreference();

  useEffect(() => {
    if (reduced) return;
    let timer = 0;
    const highlight = (hash: string): void => {
      if (hash.length < 2) return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      const heading = target.matches("h1, h2, h3") ? target : target.querySelector("h2, h1");
      if (!(heading instanceof HTMLElement)) return;
      heading.removeAttribute("data-anchor-highlight");
      // Restart the CSS animation.
      void heading.offsetWidth;
      heading.setAttribute("data-anchor-highlight", "");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        heading.removeAttribute("data-anchor-highlight");
      }, runTiming.anchorHighlight);
    };
    const onClick = (event: MouseEvent): void => {
      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const hash = link.getAttribute("href") ?? "";
      let done = false;
      const run = (): void => {
        if (done) return;
        done = true;
        highlight(hash);
      };
      window.addEventListener("scrollend", run, { once: true });
      window.setTimeout(run, SCROLL_SETTLE_FALLBACK_MS);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      window.clearTimeout(timer);
    };
  }, [reduced]);

  return null;
}

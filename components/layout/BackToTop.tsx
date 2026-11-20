"use client";

import { ArrowUp } from "lucide-react";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { ICON_STROKE } from "@/lib/tokens";

/** Scrolls to the top and moves focus to the skip link target (main content). */
export function BackToTop() {
  const reduced = useReducedMotionPreference();
  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        document.getElementById("main-content")?.focus({ preventScroll: true });
      }}
      className="group inline-flex min-h-11 items-center gap-2 text-small text-slate-400 transition-colors duration-200 hover:text-cloud-50"
    >
      Back to top
      <span className="flex size-8 items-center justify-center rounded-full border border-line-dark transition-colors duration-200 group-hover:border-line-dark-strong">
        <ArrowUp
          aria-hidden="true"
          size={16}
          strokeWidth={ICON_STROKE}
          className="transition-transform duration-200 group-hover:-translate-y-0.5"
        />
      </span>
    </button>
  );
}

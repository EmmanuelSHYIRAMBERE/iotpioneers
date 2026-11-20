"use client";

import { setManualReducedMotion, useManualReducedMotion } from "@/hooks/useReducedMotionPreference";
import { cn } from "@/lib/cn";

/** Footer switch. Stored in localStorage (inside try and catch) and applied site wide. */
export function ReduceMotionToggle() {
  const on = useManualReducedMotion();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => {
        setManualReducedMotion(!on);
      }}
      className="group inline-flex min-h-11 items-center gap-3 text-small text-slate-400 transition-colors duration-200 hover:text-cloud-50"
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative h-5 w-9 rounded-full border transition-colors duration-200",
          on ? "border-bright-gold bg-bright-gold/20" : "border-line-dark-strong bg-navy-900",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 left-0.5 size-3.5 -translate-y-1/2 rounded-full transition-transform duration-200",
            on ? "translate-x-4 bg-bright-gold" : "bg-slate-400",
          )}
        />
      </span>
      Reduce motion
    </button>
  );
}

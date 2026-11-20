"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { ICON_STROKE } from "@/lib/tokens";

export interface DemoBadgeProps {
  label: string;
  tooltip: string;
  className?: string;
}

/**
 * "Simulated demo data" badge. The tooltip opens on hover, focus and tap, closes on Escape,
 * and its text is always available to screen readers through aria-describedby.
 */
export function DemoBadge({ label, tooltip, className }: DemoBadgeProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent): void => {
      if (ref.current && event.target instanceof Node && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      onMouseEnter={() => {
        setOpen(true);
      }}
      onMouseLeave={() => {
        setOpen(false);
      }}
    >
      <button
        type="button"
        aria-describedby={tooltipId}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
        }}
        onFocus={() => {
          setOpen(true);
        }}
        onBlur={() => {
          setOpen(false);
        }}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-400/50 bg-navy-950/90 px-3 font-mono text-small text-amber-400 backdrop-blur-none"
      >
        <Info aria-hidden="true" size={16} strokeWidth={ICON_STROKE} />
        {label}
      </button>
      <div
        id={tooltipId}
        role="tooltip"
        className={cn(
          "absolute top-full right-0 z-30 mt-2 w-64 rounded-card border border-line-dark bg-navy-900 p-3 text-small text-cloud-50 shadow-highlight transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {tooltip}
      </div>
    </div>
  );
}

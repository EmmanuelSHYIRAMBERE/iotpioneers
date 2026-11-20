"use client";

import { useState } from "react";
import { Eye, EyeOff, FlaskConical, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ICON_STROKE } from "@/lib/tokens";

export interface PreviewBannerProps {
  unverifiedCount: number;
}

/**
 * Development and preview builds only. A compact pill that collapses to a single 44px button so
 * it never covers content for long. The layout also sets `scroll-padding-bottom` while preview
 * mode is on, so the browser scrolls focused elements clear of the pill (WCAG 2.2, 2.4.11).
 */
export function PreviewBanner({ unverifiedCount }: PreviewBannerProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [markersHidden, setMarkersHidden] = useState(false);

  const toggleMarkers = (): void => {
    const next = !markersHidden;
    setMarkersHidden(next);
    document.documentElement.dataset.hideVerify = String(next);
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => {
          setCollapsed(false);
        }}
        aria-label={`Preview build: ${String(unverifiedCount)} content items await client confirmation. Show details`}
        className="fixed right-3 bottom-3 z-[60] flex size-11 items-center justify-center rounded-full border border-preview bg-navy-950 text-preview shadow-hover print:hidden"
      >
        <FlaskConical aria-hidden="true" size={18} strokeWidth={ICON_STROKE} />
      </button>
    );
  }

  return (
    <aside
      aria-label="Preview build notice"
      className="fixed right-3 bottom-3 z-[60] flex max-w-[calc(100vw-24px)] items-center gap-1 rounded-full border border-preview bg-navy-950/95 py-0.5 pr-0.5 pl-3 text-small text-cloud-50 shadow-hover print:hidden"
    >
      <FlaskConical
        aria-hidden="true"
        size={16}
        strokeWidth={ICON_STROKE}
        className="shrink-0 text-preview"
      />
      <span className="px-1 whitespace-nowrap">
        <strong className="font-semibold">Preview</strong>
        <span className="text-slate-400"> · {unverifiedCount} to confirm</span>
      </span>
      <button
        type="button"
        onClick={toggleMarkers}
        aria-pressed={markersHidden}
        aria-label={markersHidden ? "Show unverified markers" : "Hide unverified markers"}
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-navy-800 hover:text-cloud-50",
        )}
      >
        {markersHidden ? (
          <Eye aria-hidden="true" size={16} strokeWidth={ICON_STROKE} />
        ) : (
          <EyeOff aria-hidden="true" size={16} strokeWidth={ICON_STROKE} />
        )}
      </button>
      <button
        type="button"
        onClick={() => {
          setCollapsed(true);
        }}
        aria-label="Collapse preview notice"
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-navy-800 hover:text-cloud-50"
      >
        <X aria-hidden="true" size={16} strokeWidth={ICON_STROKE} />
      </button>
    </aside>
  );
}

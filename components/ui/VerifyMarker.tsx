import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { isPreviewMode } from "@/lib/verification";

export interface VerifyMarkerProps {
  verified: boolean;
  children: ReactNode;
  as?: "div" | "span" | "li";
  className?: string;
  /** Where the small "Unverified" tag sits. */
  tagPosition?: "top-right" | "top-left";
}

/**
 * Development and preview only: wraps unverified content in a magenta (preview tooling) dotted outline with a
 * small "Unverified" tag. Production builds cannot contain unverified content (the content
 * gate fails), so in production this renders its element with no marker.
 */
export function VerifyMarker({
  verified,
  children,
  as: Tag = "div",
  className,
  tagPosition = "top-right",
}: VerifyMarkerProps) {
  const show = !verified && isPreviewMode();
  return (
    <Tag className={cn(show && "verify-marker", className)} data-unverified={show || undefined}>
      {children}
      {show ? (
        <span
          className={cn(
            "verify-tag pointer-events-none absolute -top-3 z-10 rounded-tag bg-preview px-1.5 py-0.5 font-mono text-[11px] leading-none font-medium tracking-wide text-white uppercase",
            tagPosition === "top-right" ? "right-0" : "left-0",
          )}
          aria-hidden="true"
        >
          Unverified
        </span>
      ) : null}
    </Tag>
  );
}

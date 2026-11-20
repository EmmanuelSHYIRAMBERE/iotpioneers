import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface VerifyMarkerProps {
  verified: boolean;
  children: ReactNode;
  as?: "div" | "span" | "li";
  className?: string;
  /** Where the small "Unverified" tag sits. */
  tagPosition?: "top-right" | "top-left";
}

/**
 * Opt-in review tooling: when NEXT_PUBLIC_SHOW_VERIFY_MARKERS is "true", unverified content gets a
 * magenta dotted outline and a small "Unverified" tag. By default (every build, including preview
 * and development) it renders only its element: no outline, no tag, nothing extra in the
 * accessibility tree. The content gate and CONTENT_VERIFICATION.md remain the register.
 */
const SHOW_MARKERS = process.env.NEXT_PUBLIC_SHOW_VERIFY_MARKERS === "true";

export function VerifyMarker({
  verified,
  children,
  as: Tag = "div",
  className,
  tagPosition = "top-right",
}: VerifyMarkerProps) {
  const show = SHOW_MARKERS && !verified;
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

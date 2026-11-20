import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ErrorStateProps {
  title?: string;
  message: string;
  /** Retry button, when retrying can help. */
  retry?: ReactNode;
  /** A link that always works, such as the product site. */
  fallback?: ReactNode;
  tone?: "onLight" | "onDark";
  className?: string;
}

/** A disconnected node: the error version of the motif. */
function DisconnectedNode() {
  return (
    <svg viewBox="0 0 96 32" fill="none" aria-hidden="true" className="h-8 w-24">
      <circle cx="8" cy="16" r="4" fill="currentColor" />
      <path d="M12 16 H38" stroke="currentColor" strokeWidth="1.5" />
      <path d="M44 10 L52 22 M52 10 L44 22" stroke="currentColor" strokeWidth="1.5" />
      <path d="M58 16 H84" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="88" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Announces itself (alert role) and always offers a way forward. */
export function ErrorState({
  title,
  message,
  retry,
  fallback,
  tone = "onLight",
  className,
}: ErrorStateProps) {
  const dark = tone === "onDark";
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-4 rounded-card border p-8",
        dark
          ? "border-line-dark bg-navy-900 text-slate-400"
          : "border-slate-200 bg-white text-slate-600",
        className,
      )}
    >
      <span className="text-red-400">
        <DisconnectedNode />
      </span>
      {title ? (
        <p className={cn("font-display text-h4", dark ? "text-cloud-50" : "text-navy-950")}>
          {title}
        </p>
      ) : null}
      <p className="text-body">{message}</p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {retry}
        {fallback}
      </div>
    </div>
  );
}

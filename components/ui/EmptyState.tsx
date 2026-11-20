import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  title?: string;
  message: string;
  action?: ReactNode;
  tone?: "onLight" | "onDark";
  illustration?: ReactNode;
  className?: string;
}

/** An empty circuit board outline: the node motif with nothing connected. */
export function EmptyBoardIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" aria-hidden="true" className={cn("h-20 w-30", className)}>
      <rect x="8" y="8" width="104" height="64" rx="6" stroke="currentColor" strokeWidth="1.5" />
      <rect
        x="44"
        y="26"
        width="32"
        height="28"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      {[20, 32, 88, 100].map((x) => (
        <circle key={x} cx={x} cy="20" r="3" stroke="currentColor" strokeWidth="1.5" />
      ))}
      {[20, 32, 88, 100].map((x) => (
        <circle
          key={`b${String(x)}`}
          cx={x}
          cy="60"
          r="3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

/** Calm guidance when there is nothing to show, with a next step. Not an alert. */
export function EmptyState({
  title,
  message,
  action,
  tone = "onLight",
  illustration,
  className,
}: EmptyStateProps) {
  const dark = tone === "onDark";
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-4 rounded-card border border-dashed p-8",
        dark ? "border-line-dark text-slate-400" : "border-slate-300 bg-white text-slate-600",
        className,
      )}
    >
      <span className={dark ? "text-slate-400" : "text-slate-600"}>
        {illustration ?? <EmptyBoardIllustration />}
      </span>
      {title ? (
        <p className={cn("font-display text-h4", dark ? "text-cloud-50" : "text-navy-950")}>
          {title}
        </p>
      ) : null}
      <p className="text-body">{message}</p>
      {action}
    </div>
  );
}

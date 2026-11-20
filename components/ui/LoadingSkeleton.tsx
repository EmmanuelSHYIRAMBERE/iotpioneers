import { cn } from "@/lib/cn";

export interface LoadingSkeletonProps {
  variant: "productCard" | "chartPanel" | "textBlock";
  tone?: "onLight" | "onDark";
  className?: string;
  label?: string;
}

function Shimmer({ dark }: { dark: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "motion-loop pointer-events-none absolute inset-0 animate-shimmer",
        dark
          ? "bg-[linear-gradient(90deg,transparent,rgb(248_250_252/0.05),transparent)]"
          : "bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.7),transparent)]",
      )}
    />
  );
}

/** Layout matched placeholders. Marked busy for assistive technology; shimmer stops with reduced motion. */
export function LoadingSkeleton({
  variant,
  tone = "onLight",
  className,
  label = "Loading",
}: LoadingSkeletonProps) {
  const dark = tone === "onDark";
  const block = dark ? "bg-navy-900" : "bg-slate-100";

  if (variant === "productCard") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={label}
        className={cn("w-full overflow-hidden rounded-card bg-white p-4 shadow-rest", className)}
      >
        <div className={cn("relative aspect-square overflow-hidden rounded-card", block)}>
          <Shimmer dark={dark} />
        </div>
        <div className={cn("mt-4 h-3 w-1/3 rounded-tag", block)} />
        <div className={cn("mt-3 h-5 w-4/5 rounded-tag", block)} />
        <div className={cn("mt-2 h-5 w-3/5 rounded-tag", block)} />
      </div>
    );
  }

  if (variant === "chartPanel") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={label}
        className={cn("relative h-full w-full overflow-hidden rounded-card", block, className)}
      >
        <Shimmer dark={dark} />
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div role="status" aria-busy="true" aria-label={label} className={cn("space-y-3", className)}>
      {["w-full", "w-11/12", "w-4/5"].map((width) => (
        <div key={width} className={cn("relative h-4 overflow-hidden rounded-tag", block, width)}>
          <Shimmer dark={dark} />
        </div>
      ))}
    </div>
  );
}

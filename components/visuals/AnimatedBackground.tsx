import { cn } from "@/lib/cn";

export type BackgroundVariant =
  "heroGlow" | "dataHubGlow" | "ctaGradient" | "dotGrid" | "imigongoTexture";

export interface AnimatedBackgroundProps {
  variant: BackgroundVariant;
  className?: string;
}

/** Decorative surfaces: glows, the dot grid and the optional texture. Always hidden from assistive technology. */
export function AnimatedBackground({ variant, className }: AnimatedBackgroundProps) {
  switch (variant) {
    case "heroGlow":
      return (
        <div
          aria-hidden="true"
          className={cn(
            "bg-glow-hero motion-loop pointer-events-none absolute -top-[20%] -right-[15%] aspect-square w-[60vw] min-w-[420px] animate-breathe",
            className,
          )}
        />
      );
    case "dataHubGlow":
      return (
        <div
          aria-hidden="true"
          className={cn(
            "bg-glow-datahub pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[min(1200px,120vw)] -translate-x-1/2 -translate-y-1/2",
            className,
          )}
        />
      );
    case "ctaGradient":
      return (
        <div
          aria-hidden="true"
          className={cn("bg-cta-gradient pointer-events-none absolute inset-0", className)}
        />
      );
    case "dotGrid":
      return (
        <div
          aria-hidden="true"
          className={cn("bg-dot-grid pointer-events-none absolute inset-0", className)}
        />
      );
    case "imigongoTexture":
      return (
        <div
          aria-hidden="true"
          className={cn(
            "bg-imigongo pointer-events-none absolute inset-0 opacity-[0.04]",
            className,
          )}
        />
      );
  }
}

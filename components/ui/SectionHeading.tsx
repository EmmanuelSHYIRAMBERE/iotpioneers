import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { WordReveal } from "./WordReveal";

export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  /** Emphasised trailing words, coloured #60A5FA on dark or #2563EB on light. */
  emphasis?: string;
  lead?: ReactNode;
  level?: 2 | 3;
  tone?: "onDark" | "onLight";
  align?: "left" | "center";
  id?: string;
  className?: string;
  titleClassName?: string;
}

/** Eyebrow, word revealed title and optional lead, following the vertical rhythm 16 / 24. */
export function SectionHeading({
  eyebrow,
  title,
  emphasis,
  lead,
  level = 2,
  tone = "onLight",
  align = "left",
  id,
  className,
  titleClassName,
}: SectionHeadingProps) {
  const Heading = level === 2 ? "h2" : "h3";
  const dark = tone === "onDark";
  return (
    <div className={cn(align === "center" && "mx-auto text-center", className)}>
      <p className="eyebrow">{eyebrow}</p>
      <Heading
        id={id}
        className={cn(
          "mt-4 font-display text-display-l",
          dark ? "text-cloud-50" : "text-navy-950",
          titleClassName,
        )}
      >
        <WordReveal
          text={title}
          {...(emphasis ? { emphasis } : {})}
          emphasisClassName={dark ? "text-bright-gold" : "text-deep-gold"}
        />
      </Heading>
      {lead ? (
        <div
          className={cn(
            "mt-6 max-w-prose text-lead",
            align === "center" && "mx-auto",
            dark ? "text-slate-400" : "text-slate-600",
          )}
        >
          {lead}
        </div>
      ) : null}
    </div>
  );
}

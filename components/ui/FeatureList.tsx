import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconTile } from "./IconTile";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";
import { VerifyMarker } from "./VerifyMarker";

export interface FeatureItem {
  id: string;
  title: string;
  text: string;
  icon: ComponentType<LucideProps>;
  verified: boolean;
}

export interface FeatureListProps {
  items: readonly FeatureItem[];
  tone?: "onDark" | "onLight";
  columns?: 2 | 3 | 4;
  /** Icon tile fill. Defaults to "data" on dark (IoTDataHub) and "gold" on light. */
  iconTone?: "gold" | "data";
  className?: string;
}

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
} as const;

/**
 * Numbered feature row in the card system (design audit issue 23): each item is a card with a
 * mono index, an icon tile, a title and one line of text. Cards in a row share one height.
 */
export function FeatureList({
  items,
  tone = "onDark",
  columns = 4,
  iconTone,
  className,
}: FeatureListProps) {
  const dark = tone === "onDark";
  const tileTone = iconTone ?? (dark ? "data" : "gold");
  return (
    <ol className={cn("grid grid-cols-1 gap-4 xl:gap-6", columnClasses[columns], className)}>
      {items.map((item, index) => (
        <Reveal as="li" key={item.id} index={index} className="h-full">
          <TiltCard tone={dark ? "dark" : "light"}>
            <VerifyMarker verified={item.verified} className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <IconTile icon={item.icon} tone={tileTone} />
                <span
                  aria-hidden="true"
                  className={cn("font-mono text-small", dark ? "text-slate-400" : "text-slate-600")}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3
                className={cn(
                  "mt-6 font-display text-h4",
                  dark ? "text-cloud-50" : "text-navy-950",
                )}
              >
                {item.title}
              </h3>
              <p className={cn("mt-2 text-body", dark ? "text-slate-400" : "text-slate-600")}>
                {item.text}
              </p>
            </VerifyMarker>
          </TiltCard>
        </Reveal>
      ))}
    </ol>
  );
}

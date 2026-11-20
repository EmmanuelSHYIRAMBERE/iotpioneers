import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";
import { ICON_STROKE } from "@/lib/tokens";
import { Reveal } from "./Reveal";
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
  className?: string;
}

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/** Icon, title and text items without card backgrounds. */
export function FeatureList({ items, tone = "onDark", columns = 4, className }: FeatureListProps) {
  const dark = tone === "onDark";
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-12 xl:gap-x-8",
        columnClasses[columns],
        className,
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Reveal as="li" key={item.id} index={index}>
            <VerifyMarker verified={item.verified}>
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-button border",
                  dark
                    ? "border-pioneer-gold/30 text-pioneer-gold"
                    : "border-deep-gold/30 text-deep-gold",
                )}
              >
                <Icon aria-hidden="true" size={20} strokeWidth={ICON_STROKE} />
              </span>
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
          </Reveal>
        );
      })}
    </ul>
  );
}

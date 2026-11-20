"use client";

import { useRef, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { enterUp, runStagger, spring, staggerDelay, viewportAmount } from "@/lib/motion";

export interface CategoryTab {
  id: string;
  label: string;
}

export interface CategoryTabsProps {
  tabs: readonly CategoryTab[];
  value: string;
  onChange: (id: string) => void;
  panelId: string;
  idPrefix: string;
}

/**
 * Pill filters with the WAI-ARIA tabs pattern (automatic activation, roving tabindex). Arrow keys
 * move between pills, Home and End jump. From md the pills wrap onto more lines, so no category
 * is ever cut off (audit issue 25); on phones they scroll sideways with edge fades. Selected:
 * brightGold with navy text (9.01:1). Default: white, slate200 border, slate600 text (7.58:1).
 */
export function CategoryTabs({ tabs, value, onChange, panelId, idPrefix }: CategoryTabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotionPreference();
  const index = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === value),
  );

  const select = (next: number): void => {
    const count = tabs.length;
    const wrapped = (next + count) % count;
    const tab = tabs[wrapped];
    if (!tab) return;
    onChange(tab.id);
    const node = refs.current[wrapped];
    node?.focus();
    node?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === "ArrowRight") select(index + 1);
    else if (event.key === "ArrowLeft") select(index - 1);
    else if (event.key === "Home") select(0);
    else if (event.key === "End") select(tabs.length - 1);
    else return;
    event.preventDefault();
  };

  return (
    <div
      role="tablist"
      aria-label="Product categories"
      className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto [mask-image:linear-gradient(to_right,transparent,#000_20px,#000_calc(100%-20px),transparent)] px-5 py-1 sm:-mx-6 sm:px-6 md:mx-0 md:flex-wrap md:overflow-visible md:[mask-image:none] md:px-0"
    >
      {tabs.map((tab, i) => {
        const selected = tab.id === value;
        return (
          // Pills rise in with a 40ms stagger, once.
          <motion.button
            key={tab.id}
            initial={reduced ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: viewportAmount.reveal }}
            variants={enterUp(false, staggerDelay(i, runStagger.shopPills))}
            ref={(node) => {
              refs.current[i] = node;
            }}
            id={`${idPrefix}-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              onChange(tab.id);
            }}
            onKeyDown={onKeyDown}
            className={cn(
              "relative isolate inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 font-display text-[0.9375rem] font-medium whitespace-nowrap transition-colors duration-200",
              selected
                ? "border-bright-gold text-navy-950"
                : "border-slate-200 bg-white text-slate-600 hover:border-deep-gold hover:text-navy-950",
            )}
          >
            {selected ? (
              <motion.span
                aria-hidden="true"
                layoutId={`${idPrefix}-pill`}
                className="absolute inset-0 -z-10 rounded-full bg-bright-gold"
                transition={spring.snappy}
              />
            ) : null}
            {tab.label}
          </motion.button>
        );
      })}
    </div>
  );
}

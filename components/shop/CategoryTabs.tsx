"use client";

import { useRef, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

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
 * Horizontal tab list (WAI-ARIA tabs, automatic activation). Arrow keys move between tabs,
 * Home and End jump. The deepGold underline slides between tabs. Scrolls sideways with fade masks
 * on small screens.
 */
export function CategoryTabs({ tabs, value, onChange, panelId, idPrefix }: CategoryTabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
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
    <div className="relative">
      <div
        role="tablist"
        aria-label="Product categories"
        className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto border-b border-slate-200 [mask-image:linear-gradient(to_right,transparent,#000_20px,#000_calc(100%-20px),transparent)] px-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:[mask-image:none] lg:px-0"
      >
        {tabs.map((tab, i) => {
          const selected = tab.id === value;
          return (
            <button
              key={tab.id}
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
                "relative min-h-12 shrink-0 px-3 font-display text-[0.9375rem] font-medium whitespace-nowrap transition-colors duration-200",
                selected ? "text-navy-950" : "text-slate-600 hover:text-navy-950",
              )}
            >
              {tab.label}
              {selected ? (
                <motion.span
                  layoutId={`${idPrefix}-underline`}
                  className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-deep-gold"
                  transition={spring.snappy}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

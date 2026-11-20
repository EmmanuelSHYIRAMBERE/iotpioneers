"use client";

import { useRef, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Distinguishes shared layout animations when several controls are on screen. */
  layoutId: string;
  className?: string;
}

/**
 * Radio group with roving focus (WAI-ARIA radio group pattern): arrow keys move and select,
 * Home and End jump. The active pill slides with a shared layout animation.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  layoutId,
  className,
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const currentIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  const move = (index: number): void => {
    const count = options.length;
    const next = (index + count) % count;
    const option = options[next];
    if (!option) return;
    onChange(option.value);
    refs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") move(currentIndex + 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") move(currentIndex - 1);
    else if (event.key === "Home") move(0);
    else if (event.key === "End") move(options.length - 1);
    else return;
    event.preventDefault();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex rounded-button border border-line-dark bg-navy-950/60 p-0.5",
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              onChange(option.value);
            }}
            onKeyDown={onKeyDown}
            className={cn(
              "relative min-h-9 rounded-[6px] px-2.5 font-mono text-small transition-colors duration-200 sm:px-3",
              selected ? "text-cloud-50" : "text-slate-400 hover:text-cloud-50",
            )}
          >
            {selected ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-[6px] bg-navy-800"
                transition={spring.snappy}
              />
            ) : null}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

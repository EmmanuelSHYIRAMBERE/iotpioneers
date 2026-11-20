"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import type { Solution } from "@/content/types";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { SolutionIllustration } from "@/components/visuals/SolutionIllustrations";
import { useInView } from "@/hooks/useInView";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { cn } from "@/lib/cn";
import { distance, ease, s, timing } from "@/lib/motion";
import { ICON_STROKE } from "@/lib/tokens";

export interface SolutionsIndexClientProps {
  solutions: readonly Solution[];
}

/**
 * Capability index. Rows follow the WAI-ARIA accordion pattern (buttons with aria-expanded and
 * labelled regions) with Arrow Up/Down, Home and End moving between rows. One row is open at a
 * time; the first starts open. At lg a sticky panel shows the open row's illustration, and
 * hovering a row previews its illustration after 80ms without opening it.
 */
export function SolutionsIndexClient({ solutions }: SolutionsIndexClientProps) {
  const [openId, setOpenId] = useState<string>(solutions[0]?.id ?? "");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const desktop = useMediaQuery(mediaQueries.lg);
  const reduced = useReducedMotionPreference();
  const panelInView = useInView(panelRef);

  useEffect(
    () => () => {
      window.clearTimeout(hoverTimer.current);
    },
    [],
  );

  const shownId = previewId ?? openId;
  const shown = solutions.find((item) => item.id === shownId) ?? solutions[0];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const count = solutions.length;
    let next = -1;
    if (event.key === "ArrowDown") next = (index + 1) % count;
    else if (event.key === "ArrowUp") next = (index - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    if (next < 0) return;
    event.preventDefault();
    buttons.current[next]?.focus();
  };

  return (
    <div className="grid-page gap-y-12">
      <ul className="col-span-full border-t border-slate-200 lg:col-span-6">
        {solutions.map((solution, index) => {
          const open = solution.id === openId;
          const headerId = `solution-${solution.id}-header`;
          const panelId = `solution-${solution.id}-panel`;
          return (
            <li
              key={solution.id}
              className="relative border-b border-slate-200"
              onMouseEnter={() => {
                if (!desktop) return;
                window.clearTimeout(hoverTimer.current);
                hoverTimer.current = window.setTimeout(() => {
                  setPreviewId(solution.id);
                }, timing.hoverPreviewDelay);
              }}
              onMouseLeave={() => {
                window.clearTimeout(hoverTimer.current);
                setPreviewId(null);
              }}
            >
              {/* Active bar grows from the left edge. */}
              <motion.span
                aria-hidden="true"
                className="absolute top-0 bottom-0 left-0 w-0.5 origin-top bg-deep-gold"
                initial={false}
                animate={{ scaleY: open ? 1 : 0 }}
                transition={{ duration: s(timing.solutionBar), ease: ease.outExpo }}
              />
              <VerifyMarker verified={solution.verified}>
                <h3>
                  <button
                    ref={(node) => {
                      buttons.current[index] = node;
                    }}
                    id={headerId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => {
                      setOpenId(open ? "" : solution.id);
                    }}
                    onKeyDown={(event) => {
                      onKeyDown(event, index);
                    }}
                    className="group flex min-h-11 w-full items-center gap-5 py-6 pr-1 pl-5 text-left md:gap-6 md:py-7"
                  >
                    <span className="font-mono text-small text-slate-600">{solution.index}</span>
                    <span
                      className={cn(
                        "flex-1 font-display text-row-title transition-colors duration-200",
                        open ? "text-deep-gold" : "text-navy-950 group-hover:text-deep-gold",
                      )}
                    >
                      {solution.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                        open ? "border-deep-gold text-deep-gold" : "border-slate-300 text-navy-950",
                      )}
                    >
                      {open ? (
                        <Minus size={16} strokeWidth={ICON_STROKE} />
                      ) : (
                        <Plus size={16} strokeWidth={ICON_STROKE} />
                      )}
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={headerId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: reduced ? 0 : s(timing.solutionPanel),
                        ease: ease.outExpo,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pr-1 pb-8 pl-5 md:pl-[4.25rem]">
                        {!desktop ? (
                          <div className="mb-6 aspect-video overflow-hidden rounded-card border border-slate-200 bg-cloud-50 p-4">
                            <SolutionIllustration
                              kind={solution.illustration}
                              animated={!reduced}
                              pulsing
                            />
                          </div>
                        ) : null}
                        <p className="max-w-prose text-body text-slate-600">{solution.summary}</p>
                        <ul aria-label="Example deliverables" className="mt-5 flex flex-wrap gap-2">
                          {solution.deliverables.map((item) => (
                            <li
                              key={item}
                              className="rounded-tag bg-slate-100 px-2.5 py-1 font-mono text-small text-navy-950"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                        <a
                          href="#contact"
                          className="group/link mt-6 inline-flex min-h-11 items-center gap-2 font-medium text-deep-gold"
                        >
                          {solution.ctaLabel}
                          <ArrowRight
                            aria-hidden="true"
                            size={16}
                            strokeWidth={ICON_STROKE}
                            className="transition-transform duration-200 group-hover/link:translate-x-1"
                          />
                        </a>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </VerifyMarker>
            </li>
          );
        })}
      </ul>

      {desktop && shown ? (
        <div className="hidden lg:col-span-5 lg:col-start-8 lg:block">
          <div
            ref={panelRef}
            className="bg-dot-grid sticky top-[120px] aspect-[4/3] overflow-hidden rounded-card border border-slate-200 bg-cloud-50 p-8"
          >
            <p className="absolute top-5 left-6 font-mono text-small text-slate-600">
              FIG. {shown.index} · {shown.title.toUpperCase()}
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={shown.id}
                className="h-full w-full pt-6"
                initial={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  y: distance.small,
                  transition: { duration: s(timing.illustrationOut), ease: ease.in },
                }}
              >
                <SolutionIllustration
                  kind={shown.illustration}
                  animated={!reduced}
                  pulsing={panelInView}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : null}
    </div>
  );
}

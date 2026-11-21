"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { solutionImages } from "@/content/images";
import type { Solution } from "@/content/types";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { SolutionIllustration } from "@/components/visuals/SolutionIllustrations";
import { useInView } from "@/hooks/useInView";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { cn } from "@/lib/cn";
import {
  ease,
  enterLeft,
  runStagger,
  runTiming,
  s,
  staggerDelay,
  viewportAmount,
} from "@/lib/motion";
import { ICON_STROKE } from "@/lib/tokens";

export interface SolutionsIndexClientProps {
  solutions: readonly Solution[];
}

/** Two digit position, for the panel's "02 / 05" progress. */
function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * The capability panel (improvement run 2, task 7): a navy900 frame with the capability photo at
 * full colour under a navy gradient (60% at the top, 90% at the bottom, so every text pair passes
 * AA; measurements in docs/05), a header row (FIG, name, progress), the line drawing in brightGold
 * and cyan with travelling packets, and the deliverables as gold outline tags. Decorative here:
 * the list beside it carries the same content for assistive technology.
 */
function CapabilityPanel({
  solution,
  position,
  total,
  animated,
  pulsing,
  className,
}: {
  solution: Solution;
  position: number;
  total: number;
  animated: boolean;
  pulsing: boolean;
  className?: string;
}) {
  const photo = solutionImages[solution.id];
  return (
    <div
      aria-hidden="true"
      data-capability-panel={solution.id}
      className={cn(
        "relative isolate flex flex-col overflow-hidden rounded-frame bg-navy-900 text-cloud-50 shadow-hover",
        className,
      )}
    >
      {photo?.src ? (
        <Image
          src={photo.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="-z-20 object-cover"
        />
      ) : null}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-navy-950/60 via-navy-950/70 to-navy-950/90" />

      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <p className="label-mono min-w-0 truncate text-cloud-50">
          FIG. {solution.index} · {solution.title}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="label-mono text-cloud-50">
            {pad(position)} / {pad(total)}
          </span>
          <span className="flex gap-1">
            {Array.from({ length: total }, (_, index) => (
              <span
                key={index}
                className={cn(
                  "size-1.5 rounded-full",
                  index + 1 === position ? "bg-bright-gold" : "bg-cloud-50/30",
                )}
              />
            ))}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-4">
        <SolutionIllustration
          kind={solution.illustration}
          tone="dark"
          animated={animated}
          pulsing={pulsing}
          className="max-h-full"
        />
      </div>

      <ul className="flex flex-wrap gap-2 px-5 pb-5">
        {solution.deliverables.map((item) => (
          <li
            key={item}
            className="rounded-tag border border-bright-gold/60 px-2 py-0.5 font-mono text-small text-bright-gold"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DiscussLink({ solution }: { solution: Solution }) {
  return (
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
  );
}

function Deliverables({ items }: { items: readonly string[] }) {
  return (
    <ul aria-label="Example deliverables" className="mt-5 flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-tag bg-slate-100 px-2.5 py-1 font-mono text-small text-navy-950"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * "What we engineer" as a scroll story (improvement run 2, task 7).
 * - lg and up: the five capabilities scroll past on the left; the one crossing the middle of the
 *   viewport (IntersectionObserver on a centre line) expands and gets the gold bar, and the sticky
 *   panel on the right follows it. CSS position sticky only: no scroll hijacking. The panel releases
 *   when the last item has scrolled up. Clicking or pressing Enter on an item scrolls it to the
 *   middle and makes it active; arrow keys move between items.
 * - Below lg: five stacked cards, each with its panel above its text.
 * - Reduced motion: no packets or stroke drawing; the active item still follows the scroll.
 */
export function SolutionsIndexClient({ solutions }: SolutionsIndexClientProps) {
  const reduced = useReducedMotionPreference();
  const [activeId, setActiveId] = useState(solutions[0]?.id ?? "");
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelInView = useInView(panelRef);
  const start = reduced ? false : "hidden";

  // The item crossing a thin band (2% of the viewport) at its centre is the active one; a
  // zero-height band is never reported as intersecting in WebKit. Below lg the
  // story list is display: none, so its items never intersect and nothing changes.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.solutionId;
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-49% 0px -49% 0px", threshold: 0 },
    );
    items.current.forEach((item) => {
      if (item) observer.observe(item);
    });
    return () => {
      observer.disconnect();
    };
  }, [solutions.length]);

  const activate = (index: number): void => {
    const solution = solutions[index];
    const item = items.current[index];
    if (!solution || !item) return;
    setActiveId(solution.id);
    item.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  };

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

  const activeIndex = Math.max(
    0,
    solutions.findIndex((item) => item.id === activeId),
  );
  const active = solutions[activeIndex];

  // Both layouts are in the server HTML and switch with CSS at lg, so hydration never changes the
  // page height (a JavaScript switch moved everything below by about 4000px after load).
  const cards = (
    <ol className="flex flex-col gap-10 lg:hidden">
      {solutions.map((solution, index) => (
        <motion.li
          key={solution.id}
          initial={start}
          whileInView="visible"
          viewport={{ once: true, amount: viewportAmount.cards }}
          variants={enterLeft(true)}
        >
          <VerifyMarker verified={solution.verified}>
            <CapabilityPanel
              solution={solution}
              position={index + 1}
              total={solutions.length}
              animated={!reduced}
              pulsing
              className="aspect-[4/3]"
            />
            <h3 className="mt-5 flex items-baseline gap-4">
              <span className="font-mono text-small text-slate-600">{solution.index}</span>
              <span className="font-display text-row-title text-navy-950">{solution.title}</span>
            </h3>
            <p className="mt-3 max-w-prose text-body text-slate-600">{solution.summary}</p>
            <Deliverables items={solution.deliverables} />
            <DiscussLink solution={solution} />
          </VerifyMarker>
        </motion.li>
      ))}
    </ol>
  );

  return (
    <>
      {cards}
      <div className="grid-page hidden lg:grid">
        <ol className="col-span-6 border-t border-slate-200">
          {solutions.map((solution, index) => {
            const open = solution.id === active?.id;
            const headerId = `solution-${solution.id}-header`;
            const panelId = `solution-${solution.id}-panel`;
            return (
              <li
                key={solution.id}
                ref={(node) => {
                  items.current[index] = node;
                }}
                data-solution-id={solution.id}
                data-active={open || undefined}
                // Every item has the same layout active or not, so activation never shifts the list.
                className="relative flex flex-col justify-center border-b border-slate-200 py-6"
              >
                <motion.div
                  className="relative"
                  initial={start}
                  whileInView="visible"
                  viewport={{ once: true, amount: viewportAmount.reveal }}
                  variants={enterLeft(false, staggerDelay(index, runStagger.solutionRows))}
                >
                  {/* Gold left bar on the active item. */}
                  <motion.span
                    aria-hidden="true"
                    className="absolute top-0 bottom-0 left-0 w-0.5 origin-top bg-deep-gold"
                    initial={false}
                    animate={{ scaleY: open ? 1 : 0 }}
                    transition={{
                      duration: s(runTiming.illustrationCrossfade),
                      ease: ease.outExpo,
                    }}
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
                          activate(index);
                        }}
                        onKeyDown={(event) => {
                          onKeyDown(event, index);
                        }}
                        className="group flex min-h-11 w-full items-center gap-6 py-4 pr-1 pl-5 text-left"
                      >
                        <span className="font-mono text-small text-slate-600">
                          {solution.index}
                        </span>
                        <span
                          className={cn(
                            "flex-1 font-display text-row-title transition-colors duration-200",
                            open ? "text-deep-gold" : "text-navy-950 group-hover:text-deep-gold",
                          )}
                        >
                          {solution.title}
                        </span>
                      </button>
                    </h3>
                    {/* Always rendered so every item keeps the same height whether it is active or
                      not: if expanding changed the layout, the centre line could flip between two
                      items in a loop. Inactive content is hidden and inert. */}
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={headerId}
                      aria-hidden={!open}
                      inert={!open}
                      initial={false}
                      animate={{ opacity: open ? 1 : 0 }}
                      transition={{
                        duration: reduced ? 0 : s(runTiming.illustrationCrossfade),
                        ease: ease.standard,
                      }}
                      className={cn("pr-1 pb-6 pl-[4.25rem]", !open && "pointer-events-none")}
                    >
                      <p className="max-w-prose text-body text-slate-600">{solution.summary}</p>
                      <Deliverables items={solution.deliverables} />
                      <DiscussLink solution={solution} />
                    </motion.div>
                  </VerifyMarker>
                </motion.div>
              </li>
            );
          })}
        </ol>

        {/* Sticky panel: stays centred while the list scrolls past and changes with the active item. */}
        <div className="col-span-5 col-start-8">
          <div
            ref={panelRef}
            data-solutions-panel=""
            className="sticky top-[calc(50svh-min(34svh,270px))] h-[min(68svh,540px)]"
          >
            {active ? (
              <AnimatePresence initial={false}>
                <motion.div
                  key={active.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: reduced ? 0 : s(runTiming.illustrationCrossfade),
                    ease: ease.standard,
                  }}
                >
                  <CapabilityPanel
                    solution={active}
                    position={activeIndex + 1}
                    total={solutions.length}
                    animated={!reduced}
                    pulsing={panelInView}
                    className="h-full"
                  />
                </motion.div>
              </AnimatePresence>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

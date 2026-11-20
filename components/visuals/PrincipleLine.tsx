"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { cn } from "@/lib/cn";
import { distance, ease, s, spring, timing } from "@/lib/motion";

export interface PrincipleItem {
  id: string;
  index: string;
  title: string;
  text: string;
  verified: boolean;
}

export interface PrincipleLineProps {
  items: readonly PrincipleItem[];
}

/**
 * A 1px line through four nodes. The line is scrubbed with scroll by GSAP ScrollTrigger
 * (loaded lazily); each node lights up with Motion when the line reaches it. Horizontal at
 * lg, vertical on the left below lg. Reduced motion shows everything at once.
 */
export function PrincipleLine({ items }: PrincipleLineProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const horizontal = useMediaQuery(mediaQueries.lg);
  const reduced = useReducedMotionPreference();
  const [reached, setReached] = useState(-1);
  // True once hydrated: before that (and without JavaScript) the line is drawn in full.
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const scripted = hydrated && !reduced;
  const count = items.length;

  useEffect(() => {
    const root = rootRef.current;
    const line = lineRef.current;
    if (!root || !line) return;
    if (reduced) {
      line.style.transform = "";
      return;
    }

    let cancelled = false;
    let cleanup = (): void => undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, triggerModule]) => {
        if (cancelled) return;
        const gsap = gsapModule.gsap;
        const { ScrollTrigger } = triggerModule;
        gsap.registerPlugin(ScrollTrigger);
        const axis = horizontal ? "scaleX" : "scaleY";
        const tween = gsap.fromTo(
          line,
          { [axis]: 0 },
          {
            [axis]: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: horizontal ? "top 70%" : "top 75%",
              end: horizontal ? "bottom 55%" : "bottom 60%",
              scrub: 0.6,
              onUpdate: (self) => {
                // Nodes sit at 0, 1/3, 2/3 and 1 of the line on desktop (evenly spaced),
                // and at the top of each stacked item on mobile.
                const progress = self.progress;
                let index = -1;
                for (let i = 0; i < count; i += 1) {
                  const at = count > 1 ? i / (count - 1) : 0;
                  if (progress >= at - 0.02) index = i;
                }
                setReached(index);
              },
            },
          },
        );
        cleanup = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      },
    );

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [horizontal, reduced, count]);

  return (
    <div ref={rootRef} className="relative">
      {/* Track and scrubbed fill. */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute bg-line-dark",
          horizontal
            ? "top-[11px] right-[12.5%] left-[12.5%] h-px"
            : "top-3 bottom-3 left-[11px] w-px",
        )}
      >
        <div
          ref={lineRef}
          className={cn(
            "absolute inset-0 bg-cyan-400",
            horizontal ? "origin-left" : "origin-top",
            // Before the script loads (or without JavaScript) the line is shown full.
            scripted && !reduced && (horizontal ? "scale-x-0" : "scale-y-0"),
          )}
        />
      </div>

      <ol
        className={cn(
          "relative grid gap-12",
          horizontal ? "grid-cols-4 gap-6 xl:gap-8" : "grid-cols-1",
        )}
      >
        {items.map((item, index) => {
          const lit = !scripted || reduced || index <= reached;
          return (
            <li
              key={item.id}
              className={cn(
                "relative",
                horizontal ? "flex flex-col items-center text-center" : "pl-12",
              )}
            >
              <motion.span
                aria-hidden="true"
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border bg-navy-950 transition-colors duration-300",
                  horizontal ? "relative" : "absolute top-0 left-0",
                  lit ? "border-cyan-400" : "border-line-dark-strong",
                )}
                initial={false}
                animate={{ scale: lit ? 1 : 0.6 }}
                transition={spring.snappy}
              >
                <span
                  className={cn("size-2 rounded-full", lit ? "bg-cyan-400" : "bg-slate-400/50")}
                />
              </motion.span>
              <motion.div
                initial={false}
                animate={{ opacity: lit ? 1 : 0, y: lit ? 0 : distance.mobileRise }}
                transition={{ duration: s(timing.nodeActivate), ease: ease.outExpo }}
                className={horizontal ? "mt-8" : ""}
              >
                <VerifyMarker verified={item.verified}>
                  <p className="font-mono text-small text-slate-400">{item.index}</p>
                  <h3 className="mt-2 font-display text-h4 text-cloud-50">{item.title}</h3>
                  <p
                    className={cn(
                      "mt-2 text-body text-slate-400",
                      horizontal && "mx-auto max-w-[28ch]",
                    )}
                  >
                    {item.text}
                  </p>
                </VerifyMarker>
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

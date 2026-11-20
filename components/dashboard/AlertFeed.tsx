"use client";

import { motion } from "motion/react";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { distance, ease, s, timing } from "@/lib/motion";
import { ICON_STROKE } from "@/lib/tokens";

export interface DemoAlert {
  id: string;
  message: string;
  device: string;
  ago: string;
}

export interface AlertFeedProps {
  alerts: readonly DemoAlert[];
  /**
   * Story step 4 ("act"). Alerts are always listed so the panel is never empty; when this turns
   * true they slide in again once to draw the eye (audit follow-up 4).
   */
  emphasis?: boolean;
  className?: string;
}

/** Warning feed in Signal Amber. Not a live region: demo values are never announced on each tick. */
export function AlertFeed({ alerts, emphasis = false, className }: AlertFeedProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="font-mono text-small text-slate-400">Alerts</p>
      <ul className="flex flex-col gap-2">
        {alerts.map((alert) => (
          <motion.li
            key={`${alert.id}-${emphasis ? "act" : "rest"}`}
            initial={emphasis ? { opacity: 0, x: distance.large } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: s(timing.dataTween), ease: ease.outExpo }}
            className="flex gap-2 rounded-button border border-amber-400/30 bg-amber-400/5 p-2.5 text-small"
          >
            <TriangleAlert
              aria-hidden="true"
              size={16}
              strokeWidth={ICON_STROKE}
              className="mt-0.5 shrink-0 text-amber-400"
            />
            <span className="min-w-0 break-words">
              <span className="block text-amber-400">
                <span className="sr-only">Warning: </span>
                {alert.message}
              </span>
              <span className="block text-slate-400">
                {alert.device}, {alert.ago}
              </span>
            </span>
          </motion.li>
        ))}
        {alerts.length === 0 ? <li className="text-small text-slate-400">No alerts</li> : null}
      </ul>
    </div>
  );
}

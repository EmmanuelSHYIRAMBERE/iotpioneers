"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { DemoDevice, DeviceStatus } from "@/content/types";
import { assertNever } from "@/lib/assertNever";
import { cn } from "@/lib/cn";
import { formatAgo } from "@/lib/demoData";
import { ease, s, timing } from "@/lib/motion";
import { ICON_STROKE } from "@/lib/tokens";

export interface DeviceListProps {
  devices: readonly DemoDevice[];
  now: number;
  className?: string;
}

function StatusPill({ status }: { status: DeviceStatus }) {
  switch (status) {
    case "online":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-400/30 px-2 py-0.5 font-mono text-small text-green-400">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-green-400" />
          Online
        </span>
      );
    case "connecting":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 px-2 py-0.5 font-mono text-small text-amber-400">
          <span
            aria-hidden="true"
            className="motion-loop size-2.5 animate-spin-ring rounded-full border-[1.5px] border-amber-400 border-t-transparent"
          />
          Connecting
        </span>
      );
    case "offline":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/30 px-2 py-0.5 font-mono text-small text-red-400">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-red-400" />
          Offline
        </span>
      );
    default:
      return assertNever(status);
  }
}

/** Fictional devices with protocol tag, last seen and status. Rows expand a details drawer. */
export function DeviceList({ devices, now, className }: DeviceListProps) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className={cn("flex flex-col divide-y divide-line-dark", className)}>
      {devices.map((device) => {
        const expanded = open === device.id;
        const drawerId = `${device.id}-details`;
        return (
          <li key={device.id}>
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={drawerId}
              onClick={() => {
                setOpen(expanded ? null : device.id);
              }}
              className="flex min-h-11 w-full items-center gap-3 rounded-button px-2 py-1.5 text-left transition-colors duration-200 hover:bg-navy-800"
            >
              {/* Names wrap instead of truncating; the protocol moves under the name (audit issue 19). */}
              <span className="min-w-0 flex-1">
                <span className="block text-small leading-snug break-words text-cloud-50">
                  {device.name}
                </span>
                <span className="block font-mono text-small text-slate-400">
                  {device.protocol} ·{" "}
                  {device.status === "connecting" ? "waiting" : formatAgo(device.lastSeen, now)}
                </span>
              </span>
              <StatusPill status={device.status} />
              <ChevronDown
                aria-hidden="true"
                size={16}
                strokeWidth={ICON_STROKE}
                className={cn(
                  "shrink-0 text-slate-400 transition-transform duration-200",
                  expanded && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  id={drawerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: s(timing.solutionPanel), ease: ease.outExpo }}
                  className="overflow-hidden"
                >
                  <dl className="mx-2 mb-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-button bg-navy-950/60 p-3 font-mono text-small">
                    <dt className="text-slate-400">Protocol</dt>
                    <dd className="text-cloud-50">{device.protocol}</dd>
                    <dt className="text-slate-400">Last message</dt>
                    <dd className="text-cloud-50">{device.lastMessage}</dd>
                    <dt className="text-slate-400">Channel ID</dt>
                    <dd className="text-cloud-50">{device.channelId}</dd>
                  </dl>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

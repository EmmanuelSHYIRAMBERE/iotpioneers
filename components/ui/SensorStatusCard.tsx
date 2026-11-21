"use client";

import { cn } from "@/lib/cn";
import { colors } from "@/lib/tokens";
import { Sparkline } from "./Sparkline";
import { TweenNumber } from "./TweenNumber";

export type SensorCardStatus = "online" | "warning" | "offline";

export interface SensorStatusCardProps {
  label: string;
  value: number;
  decimals: number;
  unit: string;
  /** Rendered after the value, for example "/ 7". */
  suffix?: string;
  trend: readonly number[];
  status: SensorCardStatus;
  sparklineDrawn: boolean;
  instant?: boolean;
  highlighted?: boolean;
  className?: string;
}

const statusText: Record<SensorCardStatus, string> = {
  online: "Normal",
  warning: "Warning",
  offline: "Offline",
};

const statusDot: Record<SensorCardStatus, string> = {
  online: "bg-green-400",
  warning: "bg-amber-400",
  offline: "bg-red-400",
};

/** One dashboard metric. Status is written as text, never shown by colour alone. */
export function SensorStatusCard({
  label,
  value,
  decimals,
  unit,
  suffix,
  trend,
  status,
  sparklineDrawn,
  instant = false,
  highlighted = false,
  className,
}: SensorStatusCardProps) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col justify-between gap-2 rounded-card border bg-navy-900 p-3 shadow-highlight transition-colors duration-300 sm:p-4",
        status === "warning" && highlighted ? "border-amber-400" : "border-line-dark",
        className,
      )}
    >
      {/* Three rows (label, value, status) so nothing competes for width and nothing is
          truncated (audit issue 19). */}
      <span className="text-small leading-tight text-slate-400">{label}</span>
      <p className="font-mono text-reading leading-none font-medium text-cloud-50">
        <TweenNumber value={value} decimals={decimals} instant={instant} />
        <span className="ml-1 text-small text-slate-400">
          {unit}
          {suffix ? ` ${suffix}` : ""}
        </span>
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-mono text-small text-slate-400">
          <span
            className={cn("size-1.5 shrink-0 rounded-full", statusDot[status])}
            aria-hidden="true"
          />
          {statusText[status]}
        </span>
        <span className="hidden sm:block">
          <Sparkline
            values={trend}
            stroke={colors.cyan400}
            drawn={sparklineDrawn}
            width={56}
            height={20}
          />
        </span>
      </div>
    </div>
  );
}

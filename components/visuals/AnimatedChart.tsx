"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { animate, motion } from "motion/react";
import type { SensorReading } from "@/content/types";
import { cn } from "@/lib/cn";
import { formatClock } from "@/lib/demoData";
import { ease, s, timing } from "@/lib/motion";

export interface ChartSeries {
  id: string;
  label: string;
  color: string;
  decimals: number;
  readings: readonly SensorReading[];
  visible: boolean;
}

export interface AnimatedChartProps {
  series: readonly ChartSeries[];
  /** Accessible plain language summary of what the chart shows. */
  summary: string;
  /**
   * The story's "visualise" step. The data lines are always shown (an empty chart read as broken);
   * when this turns true a trace runs along each line once and fades (audit follow-up 4).
   */
  drawn: boolean;
  /** Skip draw and shift animations (reduced motion). */
  instant?: boolean;
  /** Changes when the range changes, so a new range redraws instead of shifting. */
  rangeKey: string;
  className?: string;
}

const VIEW_W = 1000;
const VIEW_H = 300;
const PAD_Y = 24;

function scaleY(readings: readonly SensorReading[]): (value: number) => number {
  const values = readings.map((reading) => reading.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min || 1) * 0.25;
  const lo = min - pad;
  const hi = max + pad;
  return (value) => PAD_Y + (1 - (value - lo) / (hi - lo)) * (VIEW_H - PAD_Y * 2);
}

function pathFor(readings: readonly SensorReading[]): string {
  if (readings.length < 2) return "";
  const y = scaleY(readings);
  const step = VIEW_W / (readings.length - 1);
  return readings
    .map(
      (reading, index) =>
        `${index === 0 ? "M" : "L"}${(index * step).toFixed(2)} ${y(reading.value).toFixed(2)}`,
    )
    .join(" ");
}

/** Hand built SVG line chart with crosshair, tooltip and keyboard scrubbing. No chart library. */
export function AnimatedChart({
  series,
  summary,
  drawn,
  instant = false,
  rangeKey,
  className,
}: AnimatedChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const shiftRef = useRef<SVGGElement>(null);
  const summaryId = useId();
  const [active, setActive] = useState<number | null>(null);
  const reference = series[0]?.readings ?? [];
  const pointCount = reference.length;
  const lastTimestamp = reference[pointCount - 1]?.timestamp ?? 0;
  const previous = useRef({ lastTimestamp, rangeKey });

  const paths = useMemo(
    () => series.map((item) => ({ ...item, d: pathFor(item.readings) })),
    [series],
  );

  // A new live point: the line moves left by one step over 600ms.
  useEffect(() => {
    const prev = previous.current;
    previous.current = { lastTimestamp, rangeKey };
    const group = shiftRef.current;
    if (!group || instant || prev.rangeKey !== rangeKey || prev.lastTimestamp === lastTimestamp)
      return;
    const step = VIEW_W / Math.max(1, pointCount - 1);
    const controls = animate(
      group,
      { x: [step, 0] },
      { duration: s(timing.dataTween), ease: ease.standard },
    );
    return () => {
      controls.stop();
    };
  }, [lastTimestamp, rangeKey, pointCount, instant]);

  const indexFromPointer = (event: PointerEvent<HTMLDivElement>): number => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    return Math.round(ratio * (pointCount - 1));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const current = active ?? pointCount - 1;
    let next = current;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = Math.max(0, current - 1);
    else if (event.key === "ArrowRight" || event.key === "ArrowUp")
      next = Math.min(pointCount - 1, current + 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = pointCount - 1;
    else if (event.key === "Escape") {
      setActive(null);
      return;
    } else return;
    event.preventDefault();
    setActive(next);
  };

  const visibleSeries = series.filter((item) => item.visible);
  const activeReading = active !== null ? reference[active] : undefined;
  const valueText =
    active !== null && activeReading
      ? `${formatClock(activeReading.timestamp)}, ${visibleSeries
          .map((item) => {
            const reading = item.readings[active];
            return reading
              ? `${item.label} ${reading.value.toFixed(item.decimals)} ${reading.unit}`
              : "";
          })
          .join(", ")}`
      : "Use arrow keys to read values";

  const leftPercent = active !== null && pointCount > 1 ? (active / (pointCount - 1)) * 100 : 0;

  return (
    <figure className={cn("relative flex h-full min-h-0 flex-col", className)}>
      <figcaption id={summaryId} className="sr-only">
        {summary}
      </figcaption>
      <div className="relative min-h-0 flex-1">
        <div
          ref={plotRef}
          role="slider"
          tabIndex={0}
          aria-label="Chart readings"
          aria-describedby={summaryId}
          aria-valuemin={0}
          aria-valuemax={Math.max(0, pointCount - 1)}
          aria-valuenow={active ?? pointCount - 1}
          aria-valuetext={valueText}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (active === null) setActive(pointCount - 1);
          }}
          onBlur={() => {
            setActive(null);
          }}
          onPointerMove={(event) => {
            if (event.pointerType === "mouse") setActive(indexFromPointer(event));
          }}
          onPointerDown={(event) => {
            setActive(indexFromPointer(event));
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") setActive(null);
          }}
          className="absolute inset-0 cursor-crosshair touch-pan-y rounded-button"
        >
          <svg
            viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full overflow-hidden"
          >
            {[0.25, 0.5, 0.75].map((fraction) => (
              <line
                key={fraction}
                x1="0"
                x2={VIEW_W}
                y1={VIEW_H * fraction}
                y2={VIEW_H * fraction}
                className="stroke-slate-400/10"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <g ref={shiftRef}>
              {paths.map((item) => (
                <motion.g
                  key={item.id}
                  initial={false}
                  animate={{ opacity: item.visible ? 1 : 0 }}
                  transition={{ duration: s(timing.solutionBar), ease: ease.standard }}
                >
                  <motion.path
                    key={rangeKey}
                    d={item.d}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={instant ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: instant ? 0 : s(timing.chartDraw), ease: ease.outExpo }}
                  />
                  {drawn && !instant ? (
                    <motion.path
                      key={`trace-${rangeKey}`}
                      d={item.d}
                      fill="none"
                      stroke={item.color}
                      strokeWidth="5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      initial={{ pathLength: 0, opacity: 0.45 }}
                      animate={{ pathLength: 1, opacity: [0.45, 0.45, 0] }}
                      transition={{
                        pathLength: { duration: s(timing.chartDraw), ease: ease.outExpo },
                        opacity: {
                          duration: s(timing.chartDraw + timing.dataTween),
                          times: [0, 0.7, 1],
                        },
                      }}
                    />
                  ) : null}
                </motion.g>
              ))}
            </g>
            {active !== null ? (
              <line
                x1={(leftPercent / 100) * VIEW_W}
                x2={(leftPercent / 100) * VIEW_W}
                y1="0"
                y2={VIEW_H}
                className="stroke-slate-400/40"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>

          {active !== null && activeReading
            ? visibleSeries.map((item) => {
                const reading = item.readings[active];
                if (!reading) return null;
                const top = (scaleY(item.readings)(reading.value) / VIEW_H) * 100;
                return (
                  <span
                    key={item.id}
                    aria-hidden="true"
                    className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-navy-900"
                    style={{
                      left: `${String(leftPercent)}%`,
                      top: `${String(top)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                );
              })
            : null}

          {active !== null && activeReading ? (
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute top-2 z-10 rounded-button border border-line-dark bg-navy-950/95 px-3 py-2 font-mono text-small whitespace-nowrap text-cloud-50",
                leftPercent > 60 ? "-translate-x-[calc(100%+12px)]" : "translate-x-3",
              )}
              style={{ left: `${String(leftPercent)}%` }}
            >
              <p className="text-slate-400">{formatClock(activeReading.timestamp)}</p>
              {visibleSeries.map((item) => {
                const reading = item.readings[active];
                return reading ? (
                  <p key={item.id} className="tabular flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.label} {reading.value.toFixed(item.decimals)} {reading.unit}
                  </p>
                ) : null;
              })}
            </div>
          ) : null}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="mt-2 flex justify-between font-mono text-small text-slate-400"
      >
        <span>{reference[0] ? formatClock(reference[0].timestamp) : ""}</span>
        <span>
          {reference[Math.floor(pointCount / 2)]
            ? formatClock(reference[Math.floor(pointCount / 2)]?.timestamp ?? 0)
            : ""}
        </span>
        <span>{reference[pointCount - 1] ? formatClock(lastTimestamp) : ""}</span>
      </div>
    </figure>
  );
}

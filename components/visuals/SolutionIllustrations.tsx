"use client";

import { motion } from "motion/react";
import type { IllustrationKey } from "@/content/types";
import { cn } from "@/lib/cn";
import { ease, runTiming, s, timing } from "@/lib/motion";

type Accent = "ink" | "gold" | "cyan";

interface Stroke {
  d: string;
  accent?: Accent;
  dashed?: boolean;
}

interface Node {
  x: number;
  y: number;
  r?: number;
  accent?: Accent;
  filled?: boolean;
}

interface Label {
  x: number;
  y: number;
  text: string;
}

interface Drawing {
  title: string;
  /**
   * Tight crop around the drawing, so it fills about 80% of the panel instead of floating in a
   * 480 by 360 canvas (audit issue 16).
   */
  viewBox: string;
  strokes: readonly Stroke[];
  nodes: readonly Node[];
  labels?: readonly Label[];
}

const accentClass: Record<Accent, string> = {
  ink: "stroke-navy-950",
  gold: "stroke-bright-gold",
  cyan: "stroke-cyan-700",
};
const fillClass: Record<Accent, string> = {
  ink: "fill-navy-950",
  gold: "fill-bright-gold",
  cyan: "fill-cyan-700",
};
/** Dark panel tone (improvement run 2): brightGold and cyan lines over the navy photo overlay. */
const darkAccentClass: Record<Accent, string> = {
  ink: "stroke-bright-gold",
  gold: "stroke-bright-gold",
  cyan: "stroke-cyan-400",
};
const darkFillClass: Record<Accent, string> = {
  ink: "fill-bright-gold",
  gold: "fill-bright-gold",
  cyan: "fill-cyan-400",
};

const DRAWINGS: Record<IllustrationKey, Drawing> = {
  iot: {
    viewBox: "36 34 440 284",
    title: "Three sensor nodes linked to a gateway, which sends data onward to the cloud.",
    strokes: [
      { d: "M56 60 h56 v40 h-56 Z" },
      { d: "M56 160 h56 v40 h-56 Z" },
      { d: "M56 260 h56 v40 h-56 Z" },
      { d: "M112 80 C190 80 210 180 268 180", accent: "gold" },
      { d: "M112 180 H268", accent: "gold" },
      { d: "M112 280 C190 280 210 180 268 180", accent: "gold" },
      { d: "M268 150 h72 v60 h-72 Z" },
      { d: "M284 168 h40 M284 184 h28" },
      { d: "M340 180 H404", accent: "cyan", dashed: true },
      { d: "M404 196 a22 22 0 0 1 4 -43 a28 28 0 0 1 52 8 a18 18 0 0 1 -4 35 Z", accent: "cyan" },
    ],
    nodes: [
      { x: 84, y: 80, r: 5, accent: "gold", filled: true },
      { x: 84, y: 180, r: 5, accent: "gold", filled: true },
      { x: 84, y: 280, r: 5, accent: "gold", filled: true },
      { x: 268, y: 180, r: 4, accent: "ink", filled: true },
    ],
    labels: [
      { x: 56, y: 48, text: "SENSOR" },
      { x: 268, y: 138, text: "GATEWAY" },
      { x: 404, y: 140, text: "CLOUD" },
    ],
  },
  software: {
    viewBox: "76 58 360 256",
    title: "Layered interface panels with code brackets, representing web and mobile software.",
    strokes: [
      { d: "M120 70 h260 v170 h-260 Z" },
      { d: "M120 96 H380" },
      { d: "M90 110 h260 v170 h-260 Z", accent: "gold" },
      { d: "M90 136 H350", accent: "gold" },
      { d: "M150 180 l-24 24 l24 24", accent: "cyan" },
      { d: "M290 180 l24 24 l-24 24", accent: "cyan" },
      { d: "M236 172 l-32 64", accent: "cyan" },
      { d: "M380 150 h40 v120 h-70" },
      { d: "M396 290 h8" },
    ],
    nodes: [
      { x: 104, y: 123, r: 3, accent: "gold", filled: true },
      { x: 116, y: 123, r: 3, accent: "gold" },
      { x: 128, y: 123, r: 3, accent: "gold" },
    ],
    labels: [{ x: 90, y: 300, text: "WEB · MOBILE · API" }],
  },
  cloud: {
    viewBox: "44 78 412 206",
    title: "Data nodes flowing into a database, which outputs a small chart.",
    strokes: [
      { d: "M60 90 C120 90 140 170 200 170", accent: "gold" },
      { d: "M60 170 H200", accent: "gold" },
      { d: "M60 250 C120 250 140 170 200 170", accent: "gold" },
      { d: "M200 126 a50 16 0 1 0 100 0 a50 16 0 1 0 -100 0" },
      { d: "M200 126 v96 a50 16 0 0 0 100 0 v-96" },
      { d: "M200 174 a50 16 0 0 0 100 0" },
      { d: "M300 174 H340", accent: "cyan", dashed: true },
      { d: "M340 110 h100 v130 h-100 Z" },
      { d: "M356 220 L380 190 L400 200 L424 150", accent: "cyan" },
    ],
    nodes: [
      { x: 60, y: 90, r: 5, accent: "gold", filled: true },
      { x: 60, y: 170, r: 5, accent: "gold", filled: true },
      { x: 60, y: 250, r: 5, accent: "gold", filled: true },
      { x: 424, y: 150, r: 4, accent: "cyan", filled: true },
    ],
    labels: [
      { x: 200, y: 268, text: "STORE" },
      { x: 340, y: 98, text: "INSIGHT" },
    ],
  },
  automation: {
    viewBox: "26 118 440 134",
    title: "A sensor triggers an actuator through an IF and THEN rule.",
    strokes: [
      { d: "M40 150 h60 v60 h-60 Z" },
      { d: "M100 180 H150", accent: "gold" },
      { d: "M150 150 h80 v60 h-80 Z", accent: "gold" },
      { d: "M230 180 H270", accent: "gold" },
      { d: "M270 150 h80 v60 h-80 Z", accent: "cyan" },
      { d: "M350 180 H390", accent: "cyan" },
      { d: "M418 180 m-28 0 a28 28 0 1 0 56 0 a28 28 0 1 0 -56 0" },
      { d: "M418 160 v40 M398 180 h40", accent: "cyan" },
    ],
    nodes: [
      { x: 70, y: 180, r: 6, accent: "gold", filled: true },
      { x: 418, y: 180, r: 4, accent: "cyan", filled: true },
    ],
    labels: [
      { x: 40, y: 138, text: "SENSOR" },
      { x: 172, y: 186, text: "IF" },
      { x: 284, y: 186, text: "THEN" },
      { x: 392, y: 236, text: "ACTUATOR" },
    ],
  },
  integration: {
    viewBox: "40 50 404 264",
    title: "Separate systems joined by connector lines into one hub.",
    strokes: [
      { d: "M50 60 h90 v56 h-90 Z" },
      { d: "M340 60 h90 v56 h-90 Z" },
      { d: "M50 244 h90 v56 h-90 Z" },
      { d: "M340 244 h90 v56 h-90 Z" },
      { d: "M140 88 C200 88 200 180 240 180", accent: "gold" },
      { d: "M340 88 C280 88 280 180 240 180", accent: "gold" },
      { d: "M140 272 C200 272 200 180 240 180", accent: "gold" },
      { d: "M340 272 C280 272 280 180 240 180", accent: "gold" },
      { d: "M240 180 m-30 0 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0", accent: "cyan" },
    ],
    nodes: [{ x: 240, y: 180, r: 7, accent: "cyan", filled: true }],
    labels: [
      { x: 58, y: 92, text: "ERP" },
      { x: 348, y: 92, text: "DEVICES" },
      { x: 58, y: 276, text: "LEGACY" },
      { x: 348, y: 276, text: "APPS" },
    ],
  },
};

export interface SolutionIllustrationProps {
  kind: IllustrationKey;
  /** Draw strokes and run pulses. False under reduced motion: everything appears at once. */
  animated: boolean;
  /** Pulses run only while the panel is visible. */
  pulsing: boolean;
  /** "light": ink drawing on a light panel. "dark": 2px brightGold and cyan lines on navy. */
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Line illustration on the node motif: 1.5px ink strokes with deepGold and cyan accents. While
 * the panel is visible, a deepGold pulse travels along each open gold line (the data path) every
 * 2.4 seconds (audit issue 16). No pulses under reduced motion or off screen.
 */
export function SolutionIllustration({
  kind,
  animated,
  pulsing,
  tone = "light",
  className,
}: SolutionIllustrationProps) {
  const drawing = DRAWINGS[kind];
  const dark = tone === "dark";
  const stroke = dark ? darkAccentClass : accentClass;
  const fill = dark ? darkFillClass : fillClass;
  const width = dark ? "2" : "1.5";
  return (
    <svg
      viewBox={drawing.viewBox}
      fill="none"
      role="img"
      aria-label={drawing.title}
      className={cn("h-full w-full", className)}
    >
      {drawing.strokes.map((line, index) => (
        <motion.path
          key={`${kind}-s${String(index)}`}
          d={line.d}
          className={stroke[line.accent ?? "ink"]}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={line.dashed ? "4 5" : undefined}
          initial={animated && !line.dashed ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{
            duration: s(timing.illustrationDraw),
            ease: ease.outExpo,
            delay: index * 0.04,
          }}
        />
      ))}
      {drawing.nodes.map((node, index) => (
        <motion.circle
          key={`${kind}-n${String(index)}`}
          cx={node.x}
          cy={node.y}
          r={node.r ?? 4}
          strokeWidth={width}
          className={cn(
            stroke[node.accent ?? "ink"],
            node.filled ? fill[node.accent ?? "ink"] : dark ? "fill-navy-900" : "fill-white",
          )}
          initial={animated ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{
            duration: s(timing.solutionPanel),
            delay: s(timing.illustrationDraw) * 0.6,
          }}
        />
      ))}
      {drawing.labels?.map((label) => (
        <text
          key={label.text}
          x={label.x}
          y={label.y}
          className={cn(
            "font-mono text-[13px] tracking-[0.12em]",
            dark ? "fill-cloud-50" : "fill-slate-600",
          )}
        >
          {label.text}
        </text>
      ))}
      {animated && pulsing
        ? drawing.strokes
            .filter((line) => line.accent === "gold" && !/z\s*$/i.test(line.d))
            .map((line, index) => {
              const begin = `${String(s(timing.illustrationDraw) + index * 0.35)}s`;
              const dur = `${String(s(runTiming.illustrationPulse))}s`;
              return (
                <circle
                  key={`${kind}-p${String(index)}`}
                  r="3.5"
                  className={dark ? "fill-bright-gold" : "fill-bright-gold"}
                  opacity="0"
                >
                  <animateMotion path={line.d} begin={begin} dur={dur} repeatCount="indefinite" />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.15;0.8;1"
                    begin={begin}
                    dur={dur}
                    repeatCount="indefinite"
                  />
                </circle>
              );
            })
        : null}
    </svg>
  );
}

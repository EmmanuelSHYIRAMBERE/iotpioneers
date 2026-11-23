"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Pause, Play, PlugZap, Thermometer } from "lucide-react";
import type { DemoDevice } from "@/content/types";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SensorStatusCard } from "@/components/ui/SensorStatusCard";
import { AnimatedChart, type ChartSeries } from "@/components/visuals/AnimatedChart";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { cn } from "@/lib/cn";
import {
  countOnline,
  formatValue,
  HUMIDITY_THRESHOLD,
  sparklineValues,
  summariseSeries,
  type DemoRange,
} from "@/lib/demoData";
import { distance, timing } from "@/lib/motion";
import { colors, ICON_STROKE } from "@/lib/tokens";
import { AlertFeed } from "./AlertFeed";
import { DashboardSidebar } from "./DashboardSidebar";
import { DeviceList } from "./DeviceList";
import { useDemoData } from "./useDemoData";

export type StoryStep = "connect" | "collect" | "monitor" | "act";
export const STORY_STEPS: readonly StoryStep[] = ["connect", "collect", "monitor", "act"];

type SensorView = "temperature" | "humidity" | "both";
type FocusRegion = "devices" | "cards" | "chart" | "alerts";

const FOCUS_FOR_STEP: Record<StoryStep, FocusRegion> = {
  connect: "devices",
  collect: "cards",
  monitor: "chart",
  act: "alerts",
};

export interface DashboardLabels {
  sidebar: readonly string[];
  address: string;
  /** One line under the frame: the single simulated data disclaimer. */
  caption: string;
}

export interface IoTDashboardPreviewProps {
  labels: DashboardLabels;
  seed: number;
  layout: "desktop" | "mobile";
  /** The step being emphasised; null when the whole dashboard is lit. */
  activeStep: StoryStep | null;
  /** Highest step reached so far (-1 before the story). Effects of reached steps persist. */
  reachedStep: number;
  /** True while the section is on screen; live updates stop otherwise. */
  inView: boolean;
}

function Region({
  region,
  focus,
  children,
  className,
}: {
  region: FocusRegion;
  focus: FocusRegion | null;
  children: ReactNode;
  className?: string;
}) {
  // The story step's region gains a cyan border; other regions are never dimmed with opacity,
  // which would take their slate-400 text below 4.5:1 (WCAG 1.4.3, design audit follow-up 3).
  const focused = focus === region;
  return (
    <div
      className={cn(
        "rounded-card border transition-colors duration-300 ease-standard",
        focused ? "border-cyan-400/60" : "border-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Stylised IoTDataHub dashboard with simulated, seeded data. Not the real product UI and
 * not connected to any account; the badge and caption say so.
 */
export function IoTDashboardPreview({
  labels,
  seed,
  layout,
  activeStep,
  reachedStep,
  inView,
}: IoTDashboardPreviewProps) {
  const reduced = useReducedMotionPreference();
  const roomy = useMediaQuery("(min-width: 1536px)");
  // Live data runs from the moment the dashboard is visible, also under reduced motion (values
  // update; charts change without drawing animations). The visitor can pause it (WCAG 2.2.2).
  const [paused, setUserPaused] = useState(false);
  const live = inView && !paused;
  const { series, devices, now, messages, range, setRange } = useDemoData(seed, live);
  const [view, setView] = useState<SensorView>(layout === "mobile" ? "temperature" : "both");

  // Story step 1: devices switch from connecting to online one by one, 250ms apart.
  const [connected, setConnected] = useState(0);
  const connectTarget = devices.filter((device) => device.status === "online").length;
  const storyConnected = reachedStep >= 0;
  useEffect(() => {
    if (!storyConnected || reduced) return;
    const id = window.setInterval(() => {
      setConnected((value) => {
        if (value >= connectTarget) window.clearInterval(id);
        return Math.min(connectTarget, value + 1);
      });
    }, timing.deviceConnectGap);
    return () => {
      window.clearInterval(id);
    };
  }, [storyConnected, connectTarget, reduced]);

  const shownConnected = storyConnected ? (reduced ? connectTarget : connected) : 0;
  const onlineOrder = devices
    .filter((device) => device.status === "online")
    .map((device) => device.id);
  const shownDevices: DemoDevice[] = devices.map((device) => {
    if (device.status !== "online") return device;
    return onlineOrder.indexOf(device.id) < shownConnected
      ? device
      : { ...device, status: "connecting" };
  });
  const listDevices = layout === "mobile" ? shownDevices.slice(0, 4) : shownDevices;

  const focus: FocusRegion | null = activeStep ? FOCUS_FOR_STEP[activeStep] : null;
  const collecting = reachedStep >= 1;
  const chartDrawn = reachedStep >= 2;
  const alertsOn = reachedStep >= 3;

  const temperature = series.temperature;
  const humidity = series.humidity;
  const lastTemp = temperature[temperature.length - 1]?.value ?? 0;
  const lastHum = humidity[humidity.length - 1]?.value ?? 0;
  const humidityWarning = lastHum > HUMIDITY_THRESHOLD;
  const onlineNow = countOnline(shownDevices);

  const chartSeries: ChartSeries[] = [
    {
      id: "temperature",
      label: "Temperature",
      color: colors.cyan400,
      decimals: 1,
      readings: temperature,
      unit: "°C",
      visible: view === "temperature" || view === "both",
    },
    {
      id: "humidity",
      label: "Humidity",
      color: colors.blue400,
      decimals: 0,
      readings: humidity,
      unit: "%",
      dashed: true,
      visible: view === "humidity" || view === "both",
    },
  ];
  const summary = [
    view !== "humidity" ? summariseSeries(temperature, "Temperature", range) : "",
    view !== "temperature" ? summariseSeries(humidity, "Humidity", range) : "",
  ]
    .filter(Boolean)
    .join(" ");

  const alerts = [
    {
      id: "humidity",
      message: `Humidity above ${String(HUMIDITY_THRESHOLD)} % threshold`,
      device: "Greenhouse Sensor A",
      ago: "2 min ago",
    },
    {
      id: "offline",
      message: "Device stopped reporting",
      device: "Weather Station",
      ago: "1 h ago",
    },
  ];

  const sensorOptions =
    layout === "mobile"
      ? ([
          { value: "temperature", label: "Temp" },
          { value: "humidity", label: "Humidity" },
        ] as const)
      : ([
          { value: "temperature", label: "Temperature" },
          { value: "humidity", label: "Humidity" },
          { value: "both", label: "Both" },
        ] as const);
  const rangeOptions = [
    { value: "1H", label: "1H" },
    { value: "6H", label: "6H" },
    { value: "24H", label: "24H" },
  ] as const;

  // One compact 32px icon button in the dashboard's top bar (WCAG 2.2.2 pause control).
  const liveControl = (
    <button
      type="button"
      onClick={() => {
        setUserPaused(!paused);
      }}
      aria-label={paused ? "Resume live data" : "Pause live data"}
      className="flex size-8 shrink-0 items-center justify-center rounded-button text-slate-400 transition-colors duration-200 hover:bg-navy-800 hover:text-cloud-50"
    >
      {paused ? (
        <Play aria-hidden="true" size={14} strokeWidth={ICON_STROKE} />
      ) : (
        <Pause aria-hidden="true" size={14} strokeWidth={ICON_STROKE} />
      )}
    </button>
  );

  const cards = (
    <Region region="cards" focus={focus} className="grid grid-cols-2 gap-2">
      <SensorStatusCard
        label="Temperature"
        value={lastTemp}
        decimals={1}
        unit="°C"
        trend={sparklineValues(temperature)}
        status="online"
        sparklineDrawn
        instant={reduced}
      />
      <SensorStatusCard
        label="Humidity"
        value={lastHum}
        decimals={0}
        unit="%"
        trend={sparklineValues(humidity)}
        status={humidityWarning ? "warning" : "online"}
        highlighted={activeStep === "act"}
        sparklineDrawn
        instant={reduced}
      />
      <SensorStatusCard
        label="Devices online"
        value={onlineNow}
        decimals={0}
        unit=""
        suffix={`/ ${String(devices.length)}`}
        trend={[1, 2, 3, 4, 5, 6, onlineNow]}
        status={onlineNow < devices.length ? "warning" : "online"}
        sparklineDrawn
        instant={reduced}
      />
      <SensorStatusCard
        label="Messages / min"
        value={collecting ? messages : 0}
        decimals={0}
        unit=""
        trend={
          collecting
            ? [
                messages - 8,
                messages - 3,
                messages - 6,
                messages - 1,
                messages - 4,
                messages + 2,
                messages,
              ]
            : [0, 0]
        }
        status="online"
        sparklineDrawn
        instant={reduced}
      />
    </Region>
  );

  const chart = (
    <Region
      region="chart"
      focus={focus}
      className="flex min-h-0 min-w-0 flex-col rounded-card bg-navy-900 p-3 shadow-highlight lg:p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <SegmentedControl
          label="Sensor"
          options={sensorOptions}
          value={view === "both" && layout === "mobile" ? "temperature" : view}
          onChange={setView}
          layoutId={`sensor-${layout}`}
        />
        <SegmentedControl<DemoRange>
          label="Time range"
          options={rangeOptions}
          value={range}
          onChange={setRange}
          layoutId={`range-${layout}`}
        />
      </div>
      <AnimatedChart
        series={chartSeries}
        summary={summary}
        drawn={chartDrawn}
        instant={reduced}
        rangeKey={range}
        className={layout === "mobile" ? "h-48" : "h-45"}
      />
    </Region>
  );

  const devicesPanel = (
    <Region
      region="devices"
      focus={focus}
      className="flex min-h-0 min-w-0 flex-col rounded-card bg-navy-900 p-2 shadow-highlight lg:p-3"
    >
      <p className="mb-1 px-2 font-mono text-small text-slate-400">Devices</p>
      {/* Three rows visible with internal scroll on desktop (compact density); taller on phones. */}
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto",
          layout === "mobile" ? "max-h-72" : "max-h-33",
        )}
      >
        <DeviceList devices={listDevices} now={now} />
      </div>
    </Region>
  );

  const alertsPanel = (
    <Region
      region="alerts"
      focus={focus}
      className="min-w-0 rounded-card bg-navy-900 p-3 shadow-highlight"
    >
      {/* One alert in the compact layouts so the device list keeps its height; the wider
          frame (2xl) has room for both. */}
      <AlertFeed
        alerts={layout === "mobile" || !roomy ? alerts.slice(0, 1) : alerts}
        emphasis={alertsOn}
      />
    </Region>
  );

  if (layout === "mobile") {
    return (
      <div
        role="group"
        aria-label="IoTDataHub dashboard with simulated data"
        className="relative rounded-frame border border-line-dark bg-navy-950 p-3 shadow-highlight"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-mono text-small text-slate-400">{labels.address}</p>
          {liveControl}
        </div>
        <div className="flex flex-col gap-3">
          {cards}
          {chart}
          {devicesPanel}
          {alertsPanel}
        </div>
      </div>
    );
  }

  return (
    <DesktopFrame
      labels={labels}
      activeStep={activeStep}
      reduced={reduced}
      lastTemp={lastTemp}
      liveControl={liveControl}
    >
      {/* Compact density (improvement run 2): icon sidebar, then status cards (2 by 2) and a
          180px chart beside the devices (three rows, internal scroll) and alerts. minmax(0, ...)
          lets every column shrink below its content width (audit issue 18). */}
      <div className="dashboard-compact grid min-h-0 grid-cols-[48px_minmax(0,1fr)]">
        <DashboardSidebar items={labels.sidebar} />
        <div className="grid min-w-0 grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-start gap-2 p-2.5">
          <div className="flex min-w-0 flex-col gap-2">
            {cards}
            {chart}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            {devicesPanel}
            {alertsPanel}
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

interface DesktopFrameProps {
  labels: DashboardLabels;
  activeStep: StoryStep | null;
  reduced: boolean;
  lastTemp: number;
  liveControl: ReactNode;
  children: ReactNode;
}

/** Browser frame, the persistent badge, floating panels and data packets. */
function DesktopFrame({
  labels,
  activeStep,
  reduced,
  lastTemp,
  liveControl,
  children,
}: DesktopFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Parallax drifts away from the frame's content (up for the top card, down for the bottom one).
  const nearY = useTransform(scrollYProgress, [0, 1], [0, distance.large]);
  const farY = useTransform(scrollYProgress, [0, 1], [0, -distance.large]);

  return (
    // Extra space above and below at xl holds the floating panels outside the frame's content.
    <div ref={ref} className="relative xl:pt-12 xl:pb-16">
      <div className="relative">
        <div
          role="group"
          aria-label="IoTDataHub dashboard with simulated data"
          className="relative w-full overflow-hidden rounded-frame border border-line-dark bg-navy-950 shadow-highlight"
        >
          <div className="flex h-10 items-center gap-3 border-b border-line-dark bg-navy-900 pr-1 pl-4">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="size-2 rounded-full bg-slate-400/40" />
              <span className="size-2 rounded-full bg-slate-400/40" />
              <span className="size-2 rounded-full bg-slate-400/40" />
            </span>
            <span className="mx-auto rounded-tag bg-navy-950/70 px-6 py-0.5 font-mono text-small text-slate-400">
              {labels.address}
            </span>
            {liveControl}
          </div>
          <div>{children}</div>
        </div>

        {/* Floating panels: decorative depth layers, hidden from assistive technology. They sit over
          the browser chrome (top) and below the frame's bottom edge, never over dashboard content
          or the step column (audit issue 20). */}
        <motion.div
          aria-hidden="true"
          style={reduced ? {} : { y: farY }}
          className="absolute bottom-[calc(100%-28px)] left-6 z-10 hidden xl:block"
        >
          <div
            className={cn(
              "motion-loop flex w-max max-w-80 items-center gap-3 rounded-card border border-line-dark bg-navy-900 p-3 shadow-highlight",
              !reduced && "animate-bob",
            )}
          >
            <span className="flex size-9 items-center justify-center rounded-button border border-cyan-400/30 text-cyan-400">
              <PlugZap size={18} strokeWidth={ICON_STROKE} />
            </span>
            <span className="min-w-0">
              <span className="block text-small text-cloud-50">Greenhouse Sensor A</span>
              <span className="flex items-center gap-1.5 font-mono text-small text-green-400">
                <span className="size-1.5 rounded-full bg-green-400" /> Connected · HTTP
              </span>
            </span>
          </div>
        </motion.div>
        <motion.div
          aria-hidden="true"
          style={reduced ? {} : { y: nearY }}
          className="absolute top-[calc(100%+12px)] right-6 z-10 hidden xl:block"
        >
          <div
            className={cn(
              "motion-loop w-48 rounded-card border border-line-dark bg-navy-900 p-3 shadow-highlight [animation-delay:-3s]",
              !reduced && "animate-bob",
            )}
          >
            <span className="flex items-center gap-2 text-small text-slate-400">
              <Thermometer size={16} strokeWidth={ICON_STROKE} className="text-cyan-400" /> Live
              reading
            </span>
            <span className="tabular mt-1 block font-mono text-reading text-cloud-50">
              {formatValue(lastTemp, "temperature")} °C
            </span>
          </div>
        </motion.div>

        {/* Story step 2: packets travel from the device card into the frame. */}
        {activeStep === "collect" && !reduced ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 160 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full overflow-visible xl:block"
          >
            <path
              id="packet-path"
              d="M10 -4 C 30 -4, 40 10, 52 12"
              fill="none"
              stroke={colors.cyan400}
              strokeOpacity="0.35"
              strokeWidth="0.3"
              strokeDasharray="1 1.2"
            />
            {[0, 0.4, 0.8].map((delay) => (
              <circle key={delay} r="0.7" fill={colors.cyan400}>
                <animateMotion dur="1.2s" begin={`${String(delay)}s`} repeatCount="indefinite">
                  <mpath href="#packet-path" />
                </animateMotion>
              </circle>
            ))}
          </svg>
        ) : null}
      </div>
    </div>
  );
}

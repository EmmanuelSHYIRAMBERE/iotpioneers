/**
 * Simulated data for the IoTDataHub demo. Everything is generated in the browser from a
 * seed, so it is deterministic and never mistaken for a live account. Device names are
 * fictional and always start with "Demo".
 */
import type { DemoDevice, DeviceStatus, SensorReading, SensorUnit } from "@/content/types";
import { createSeededRandom, randomBetween, type RandomFn } from "./seededRandom";

export type DemoRange = "1H" | "6H" | "24H";
export type SensorKey = "temperature" | "humidity";

export const DEMO_SEED = 20261120;

/** A fixed reference time keeps the first render identical everywhere. */
export const DEMO_BASE_TIME = Date.UTC(2026, 0, 15, 10, 0, 0);

export const RANGE_CONFIG: Record<DemoRange, { points: number; stepMs: number }> = {
  "1H": { points: 30, stepMs: 2 * 60_000 },
  "6H": { points: 36, stepMs: 10 * 60_000 },
  "24H": { points: 48, stepMs: 30 * 60_000 },
};

interface SensorModel {
  unit: SensorUnit;
  min: number;
  max: number;
  start: number;
  /** Largest change allowed between two consecutive readings. */
  maxStep: number;
  decimals: number;
}

export const SENSOR_MODELS: Record<SensorKey, SensorModel> = {
  temperature: { unit: "°C", min: 21, max: 28.5, start: 24.6, maxStep: 0.3, decimals: 1 },
  humidity: { unit: "%", min: 50, max: 66, start: 58, maxStep: 1.2, decimals: 0 },
};

/** Humidity above this level raises the demo alert (the demo greenhouse runs a little humid). */
export const HUMIDITY_THRESHOLD = 55;

export interface DemoSeries {
  temperature: SensorReading[];
  humidity: SensorReading[];
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Next value: a small random step, clamped to the sensor's range and its maximum drift. */
export function nextValue(previous: number, model: SensorModel, random: RandomFn): number {
  const step = randomBetween(random, -model.maxStep, model.maxStep);
  // A gentle pull towards the centre keeps long runs from sticking to a bound.
  const centre = (model.min + model.max) / 2;
  const pull = (centre - previous) * 0.02;
  const delta = Math.max(-model.maxStep, Math.min(model.maxStep, step + pull));
  const next = Math.max(model.min, Math.min(model.max, previous + delta));
  return round(next, model.decimals + 1);
}

function generateOne(
  key: SensorKey,
  random: RandomFn,
  range: DemoRange,
  endTime: number,
): SensorReading[] {
  const model = SENSOR_MODELS[key];
  const { points, stepMs } = RANGE_CONFIG[range];
  const readings: SensorReading[] = [];
  let value = model.start;
  for (let i = 0; i < points; i += 1) {
    value = nextValue(value, model, random);
    readings.push({ timestamp: endTime - (points - 1 - i) * stepMs, value, unit: model.unit });
  }
  return readings;
}

/** Deterministic series for a seed and range: the same inputs always give the same output. */
export function generateSeries(seed: number, range: DemoRange, endTime: number): DemoSeries {
  const rangeOffset = range === "1H" ? 0 : range === "6H" ? 101 : 202;
  const random = createSeededRandom(seed + rangeOffset);
  return {
    temperature: generateOne("temperature", random, range, endTime),
    humidity: generateOne("humidity", random, range, endTime),
  };
}

/** Append one live reading per sensor and drop the oldest, keeping the window size. */
export function advanceSeries(series: DemoSeries, random: RandomFn, timestamp: number): DemoSeries {
  const advance = (key: SensorKey): SensorReading[] => {
    const list = series[key];
    const last = list[list.length - 1];
    const model = SENSOR_MODELS[key];
    const value = nextValue(last ? last.value : model.start, model, random);
    return [...list.slice(1), { timestamp, value, unit: model.unit }];
  };
  return { temperature: advance("temperature"), humidity: advance("humidity") };
}

/** The last n values, for card sparklines. */
export function sparklineValues(readings: readonly SensorReading[], count = 7): number[] {
  return readings.slice(-count).map((reading) => reading.value);
}

const DEVICE_NAMES = [
  "Greenhouse Sensor A",
  "Greenhouse Sensor B",
  "Cold Room Monitor",
  "Water Tank Level",
  "Energy Meter 01",
  "Weather Station",
  "Field Gateway",
] as const;

/**
 * Demo devices. All use HTTP and MQTT are the only protocol stated on the live product
 * site.
 */
export function createDemoDevices(seed: number, now: number): DemoDevice[] {
  const random = createSeededRandom(seed + 7);
  return DEVICE_NAMES.map((name, index) => {
    const offline = index === DEVICE_NAMES.length - 2;
    const status: DeviceStatus = offline ? "offline" : "online";
    const secondsAgo = offline ? 3600 + Math.floor(random() * 1800) : Math.floor(random() * 50) + 2;
    return {
      id: `demo-device-${String(index + 1)}`,
      name,
      protocol: index % 2 === 0 ? "HTTP" : "MQTT",
      status,
      lastSeen: now - secondsAgo * 1000,
      channelId: `DEMO-CH-${String(1040 + index * 7)}`,
      lastMessage: index % 2 === 0 ? "temperature, humidity" : "level, battery",
    };
  });
}

export function countOnline(devices: readonly DemoDevice[]): number {
  return devices.filter((device) => device.status === "online").length;
}

/** Messages per minute: a deterministic base plus a small live wobble. */
export function messagesPerMinute(onlineCount: number, random: RandomFn): number {
  return onlineCount * 12 + Math.floor(random() * 9);
}

export function formatValue(value: number, key: SensorKey): string {
  return value.toFixed(SENSOR_MODELS[key].decimals);
}

export function formatClock(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatAgo(timestamp: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 60) return `${String(seconds)}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${String(minutes)} min ago`;
  return `${String(Math.round(minutes / 60))} h ago`;
}

/** Plain language chart summary for assistive technology. */
export function summariseSeries(
  readings: readonly SensorReading[],
  label: string,
  range: DemoRange,
): string {
  if (readings.length === 0) return `${label}: no data.`;
  const values = readings.map((reading) => reading.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  const unit = readings[0]?.unit ?? "";
  const spread = max - min;
  const trend = spread < (unit === "°C" ? 1.5 : 6) ? "is stable" : "varies";
  const rangeText =
    range === "1H" ? "the last hour" : range === "6H" ? "the last 6 hours" : "the last 24 hours";
  return `${label} ${trend} around ${avg.toFixed(unit === "°C" ? 1 : 0)} ${unit} over ${rangeText}, between ${min.toFixed(1)} and ${max.toFixed(1)} ${unit}. Simulated data.`;
}

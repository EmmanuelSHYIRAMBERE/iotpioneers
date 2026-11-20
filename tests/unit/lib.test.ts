import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assertNever } from "@/lib/assertNever";
import { cn } from "@/lib/cn";
import {
  advanceSeries,
  countOnline,
  createDemoDevices,
  DEMO_BASE_TIME,
  generateSeries,
  RANGE_CONFIG,
  SENSOR_MODELS,
  summariseSeries,
} from "@/lib/demoData";
import {
  cssEase,
  duration,
  ease,
  spring,
  stagger,
  staggerDelay,
  MAX_STAGGERED_ITEMS,
} from "@/lib/motion";
import { createSeededRandom } from "@/lib/seededRandom";
import { colors } from "@/lib/tokens";

describe("cn", () => {
  it("merges conflicting Tailwind classes, later wins", () => {
    expect(cn("px-2 text-small", false, "px-4")).toBe("text-small px-4");
  });
});

describe("assertNever", () => {
  it("throws when reached", () => {
    expect(() => assertNever("x" as never)).toThrow(/Unexpected value/);
  });
});

describe("seededRandom", () => {
  it("is deterministic for a seed and stays in [0, 1)", () => {
    const a = createSeededRandom(42);
    const b = createSeededRandom(42);
    const values = Array.from({ length: 200 }, () => a());
    expect(values).toEqual(Array.from({ length: 200 }, () => b()));
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
  });

  it("differs between seeds", () => {
    expect(createSeededRandom(1)()).not.toBe(createSeededRandom(2)());
  });
});

describe("demoData", () => {
  it("generates the same series for the same seed and range", () => {
    expect(generateSeries(7, "1H", DEMO_BASE_TIME)).toEqual(
      generateSeries(7, "1H", DEMO_BASE_TIME),
    );
    expect(generateSeries(7, "1H", DEMO_BASE_TIME).temperature).toHaveLength(
      RANGE_CONFIG["1H"].points,
    );
  });

  it("keeps values in bounds and temperature drift within 0.3 °C per tick", () => {
    let series = generateSeries(9, "24H", DEMO_BASE_TIME);
    const random = createSeededRandom(3);
    for (let i = 0; i < 300; i += 1)
      series = advanceSeries(series, random, DEMO_BASE_TIME + i * 2000);
    const temps = series.temperature.map((r) => r.value);
    const { min, max, maxStep } = SENSOR_MODELS.temperature;
    expect(Math.min(...temps)).toBeGreaterThanOrEqual(min);
    expect(Math.max(...temps)).toBeLessThanOrEqual(max);
    for (let i = 1; i < temps.length; i += 1) {
      expect(Math.abs((temps[i] ?? 0) - (temps[i - 1] ?? 0))).toBeLessThanOrEqual(maxStep + 1e-9);
    }
  });

  it("uses fictional device names and only confirmed protocols", () => {
    const devices = createDemoDevices(1, DEMO_BASE_TIME);
    expect(devices.length).toBeGreaterThanOrEqual(5);
    expect(devices.length).toBeLessThanOrEqual(7);
    expect(devices.every((d) => d.name.startsWith("Demo "))).toBe(true);
    expect(devices.every((d) => d.protocol === "HTTP")).toBe(true);
    expect(countOnline(devices)).toBe(devices.length - 1);
  });

  it("writes a plain language summary that says the data is simulated", () => {
    const series = generateSeries(7, "1H", DEMO_BASE_TIME);
    expect(summariseSeries(series.temperature, "Temperature", "1H")).toMatch(
      /^Temperature (is stable|varies) around .* over the last hour.*Simulated data\.$/,
    );
  });
});

describe("motion tokens", () => {
  it("match the specification", () => {
    expect(duration).toEqual({
      instant: 120,
      fast: 200,
      base: 300,
      moderate: 480,
      reveal: 700,
      cinematic: 1200,
    });
    expect(ease.outExpo).toEqual([0.16, 1, 0.3, 1]);
    expect(cssEase("standard")).toBe("cubic-bezier(0.4, 0, 0.2, 1)");
    expect(spring.snappy).toMatchObject({ stiffness: 400, damping: 32 });
    expect(spring.soft).toMatchObject({ stiffness: 150, damping: 18 });
    expect(stagger).toEqual({ words: 70, lines: 90, listItems: 60, cards: 80 });
  });

  it("caps staggers at six steps", () => {
    expect(staggerDelay(20, 80)).toBeCloseTo(((MAX_STAGGERED_ITEMS - 1) * 80) / 1000);
  });
});

describe("token parity", () => {
  it("lib/tokens.ts mirrors every colour in app/globals.css", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
    for (const [name, value] of Object.entries(colors)) {
      // camelCase to kebab-case: pioneerGold -> pioneer-gold, navy950 -> navy-950.
      const cssName = name
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .toLowerCase()
        .replace(/(\d+)$/, "-$1");
      const match = new RegExp(`--color-${cssName}:\\s*(#[0-9A-Fa-f]{6})`).exec(css);
      expect(match?.[1]?.toUpperCase(), `--color-${cssName}`).toBe(value.toUpperCase());
    }
  });
});

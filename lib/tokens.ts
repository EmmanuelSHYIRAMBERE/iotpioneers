/**
 * Runtime mirror of the colour tokens declared in app/globals.css (@theme).
 * Canvas and SVG code cannot read Tailwind classes, so it imports these values.
 * tests/unit/tokens.test.ts fails if this mirror drifts from globals.css.
 */
export const colors = {
  navy1000: "#070C18",
  navy950: "#0A1020",
  navy900: "#142642",
  navy800: "#1B3156",
  pioneerGold: "#AB910F",
  brightGold: "#D4AF37",
  deepGold: "#7A6406",
  blue400: "#60A5FA",
  cyan700: "#0E7490",
  cyan500: "#06B6D4",
  cyan400: "#22D3EE",
  cloud50: "#F8FAFC",
  white: "#FFFFFF",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate300: "#CBD5E1",
  slate400: "#94A3B8",
  slate600: "#475569",
  amber400: "#F5A524",
  green400: "#34D399",
  red400: "#F87171",
  preview: "#C026D3",
} as const;

export type ColorToken = keyof typeof colors;

/** RGB triplets for canvas code that composes rgba() strings once, outside the frame loop. */
export function hexToRgb(hex: string): readonly [number, number, number] {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255] as const;
}

/** Lucide icons are always drawn at a 1.5px stroke (specification section 5). */
export const ICON_STROKE = 1.5;

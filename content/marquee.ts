import type { Verifiable } from "./types";

export const marquee = {
  label: "Areas of expertise",
  items: [
    "IoT Engineering",
    "Software Development",
    "Cloud Technology",
    "Smart Solutions",
    "Data Analytics",
    "Electronics",
    "Innovation",
  ],
  verified: false,
  source: "Specification section 9.03; confirm against verified services",
} as const satisfies Verifiable & Record<string, unknown>;

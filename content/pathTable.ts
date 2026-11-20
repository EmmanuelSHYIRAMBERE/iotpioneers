import type { PathNeed, PathOffering, Verifiable } from "./types";
import { PRODUCT_URLS } from "./navigation";

const SOURCE =
  "Provisional copy for the completion run (reference-ui-patterns: 'Which do you need?'); client to confirm wording and which offering serves each need";

/** "Which do you need?" section between Shop and Why. Describes IoT Pioneers' own offerings only. */
export const pathHeading = {
  eyebrow: "CHOOSE YOUR PATH",
  title: "Which do you need?",
  lead: "Three ways to work with IoT Pioneers. Find the one that fits what you are building.",
  /** Table caption, read by screen readers before the table. */
  caption: "Which IoT Pioneers offering fits each need",
  needsHeader: "What you need",
  ctaRowLabel: "Get started",
  verified: false,
  source: SOURCE,
} as const satisfies Verifiable & Record<string, unknown>;

/** Table rows. */
export const pathNeeds: readonly PathNeed[] = [
  { id: "custom", label: "Build a custom connected system" },
  { id: "data", label: "Collect and visualise device data" },
  { id: "parts", label: "Buy boards, sensors and components" },
];

/** Table columns, in display order. */
export const pathOfferings: readonly PathOffering[] = [
  {
    id: "engineering",
    name: "Engineering services",
    serves: ["custom", "data"],
    ctaLabel: "Start a project",
    ctaAccessibleName: "Start a project with IoT Pioneers engineering services",
    href: "#contact",
    external: false,
    verified: false,
    source: SOURCE,
    todo: "confirm that engineering projects cover data collection and dashboards",
  },
  {
    id: "iotdatahub",
    name: "IoTDataHub",
    serves: ["data"],
    ctaLabel: "Visit IoTDataHub",
    ctaAccessibleName: "Visit IoTDataHub",
    href: PRODUCT_URLS.iotdatahub,
    external: true,
    verified: false,
    source: SOURCE,
  },
  {
    id: "shop",
    name: "IoT Pioneers Shop",
    serves: ["parts"],
    ctaLabel: "Visit the Shop",
    ctaAccessibleName: "Visit the Shop: IoT Pioneers Shop",
    href: PRODUCT_URLS.shop,
    external: true,
    verified: false,
    source: SOURCE,
  },
];

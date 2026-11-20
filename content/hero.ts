import type { ValueStripItem, Verifiable } from "./types";

export const hero = {
  eyebrow: "IoT ENGINEERING · SOFTWARE · CONNECTED SOLUTIONS",
  /** Line one is rendered as `lineOneLead` followed by the gradient `emphasis` word. */
  lineOneLead: "Engineering",
  emphasis: "Intelligence.",
  lineTwo: "Connecting the Future.",
  lead: "IoT Pioneers designs and builds connected systems, from sensors and devices to the software and data platforms that make them useful. Based in Kigali, built for anywhere.",
  primaryCta: { label: "Start a Project", href: "#contact" },
  secondaryCta: { label: "See Our Products", href: "#iotdatahub" },
  chips: [
    { id: "iotdatahub", label: "IoTDataHub", href: "#iotdatahub" },
    { id: "shop", label: "IoT Pioneers Shop", href: "#shop" },
  ],
  scrollLabel: "Scroll",
  verified: false,
  source:
    "Provisional copy from specification section 9.02; eyebrow service list and supporting text need client approval",
} as const satisfies Verifiable & Record<string, unknown>;

const STRIP_SOURCE =
  "Draft copy for the value strip (completion run, reference-ui-patterns); client to confirm wording";

/**
 * Three-item value strip under the hero. Neutral draft copy: no numbers, clients or claims.
 * Each link names its destination; the accessible name starts with the visible label.
 */
/** Visually hidden heading for the value strip (screen reader navigation). */
export const valueStripTitle = "What IoT Pioneers offers";

export const valueStrip: readonly ValueStripItem[] = [
  {
    id: "engineering",
    title: "Engineering",
    text: "Sensors, devices and software designed and built as one connected system.",
    icon: "engineering",
    href: "#solutions",
    linkLabel: "Explore engineering services",
    linkAccessibleName: "Explore engineering services",
    verified: false,
    source: STRIP_SOURCE,
  },
  {
    id: "iotdatahub",
    title: "IoTDataHub",
    text: "Collect readings from your devices and follow them on live dashboards.",
    icon: "datahub",
    href: "#iotdatahub",
    linkLabel: "See IoTDataHub",
    linkAccessibleName: "See IoTDataHub",
    verified: false,
    source: STRIP_SOURCE,
  },
  {
    id: "shop",
    title: "IoT Pioneers Shop",
    text: "Boards, sensors and components for your next build.",
    icon: "shop",
    href: "#shop",
    linkLabel: "Browse the IoT Pioneers Shop",
    linkAccessibleName: "Browse the IoT Pioneers Shop section",
    verified: false,
    source: STRIP_SOURCE,
  },
];

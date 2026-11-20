import type { Verifiable } from "./types";

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

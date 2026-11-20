import type { Solution, Verifiable } from "./types";

const SOURCE =
  "Proposed capability from specification section 9.05; client to confirm title, summary and deliverables";

export const solutionsHeading = {
  eyebrow: "SOLUTIONS",
  title: "What we engineer",
  lead: "Five connected capabilities. Pick one to see how it fits together.",
  verified: false,
  source: "Provisional copy",
} as const satisfies Verifiable & Record<string, unknown>;

export const solutions: readonly Solution[] = [
  {
    id: "iot",
    index: "01",
    title: "Internet of Things",
    summary:
      "Sensors, devices and gateways designed to work in real conditions, then connected so their data reaches the people who need it.",
    deliverables: ["Sensor nodes", "Gateways", "Device firmware", "Field installation"],
    illustration: "iot",
    ctaLabel: "Discuss an Internet of Things project",
    verified: false,
    source: SOURCE,
  },
  {
    id: "software",
    index: "02",
    title: "Software Development",
    summary:
      "Web and mobile software that turns device data and business processes into tools people can use every day.",
    deliverables: ["Web applications", "Mobile apps", "APIs", "Admin dashboards"],
    illustration: "software",
    ctaLabel: "Discuss a software development project",
    verified: false,
    source: SOURCE,
  },
  {
    id: "cloud",
    index: "03",
    title: "Cloud and Data Solutions",
    summary:
      "Collect, store and process data reliably, then present it as charts and reports that support clear decisions.",
    deliverables: ["Data pipelines", "Cloud hosting", "Reporting", "Data storage"],
    illustration: "cloud",
    ctaLabel: "Discuss a cloud and data project",
    verified: false,
    source: SOURCE,
  },
  {
    id: "automation",
    index: "04",
    title: "Smart Automation",
    summary:
      "Rules that link sensors to actions, so systems respond on their own when conditions change.",
    deliverables: ["Rule engines", "Actuator control", "Alerts", "Scheduling"],
    illustration: "automation",
    ctaLabel: "Discuss a smart automation project",
    verified: false,
    source: SOURCE,
  },
  {
    id: "integration",
    index: "05",
    title: "Technology Integration",
    summary:
      "Connect new devices and software with the systems you already run, so information moves without manual work.",
    deliverables: ["System integration", "Protocol bridges", "Legacy upgrades", "Consulting"],
    illustration: "integration",
    ctaLabel: "Discuss a technology integration project",
    verified: false,
    source: SOURCE,
  },
];

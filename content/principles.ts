import type { Principle, Verifiable } from "./types";

const SOURCE = "Provisional copy from specification section 9.08; client to confirm";

export const whyHeading = {
  eyebrow: "WHY IoT PIONEERS",
  title: "Why work with IoT Pioneers",
  /** One sentence under the centred title (design audit issue 29). Neutral: no claims or numbers. */
  intro:
    "Four principles shape how we approach every project, from the first sensor to the finished software.",
  verified: false,
  source: SOURCE,
} as const satisfies Verifiable & Record<string, unknown>;

export const principles: readonly Principle[] = [
  {
    id: "engineering",
    index: "01",
    title: "Engineering first",
    text: "We design from the hardware up, so systems work in real conditions.",
    verified: false,
    source: SOURCE,
  },
  {
    id: "endtoend",
    index: "02",
    title: "End to end capability",
    text: "Devices, connectivity, platforms and software from one team.",
    verified: false,
    source: SOURCE,
  },
  {
    id: "practical",
    index: "03",
    title: "Practical innovation",
    text: "Technology chosen to solve the problem, not to impress.",
    verified: false,
    source: SOURCE,
  },
  {
    id: "local",
    index: "04",
    title: "Built locally, made for anywhere",
    text: "Solutions designed in Kigali to international standards.",
    verified: false,
    source: SOURCE,
  },
];

import type { EditorialImage, Verifiable, VerifiableText } from "./types";

export const about = {
  eyebrow: "ABOUT IoT PIONEERS",
  statement: {
    /** Each entry is one visual line for the line by line reveal on large screens. */
    lines: ["We build the systems", "that let things talk,", "and the software", "that listens."],
    verified: false,
    source: "Provisional copy from specification section 9.04",
  } satisfies Verifiable & { lines: readonly string[] },
  // Neutral draft copy: no years, numbers, clients or capability claims (audit issue 12).
  lead: {
    text: "IoT Pioneers is a technology company based in Kigali, Rwanda.",
    verified: false,
    source: "Neutral draft copy; company overview not supplied",
    todo: "Company overview, lead paragraph: two sentences on who IoT Pioneers is and what it builds",
  } satisfies VerifiableText,
  body: {
    text: "We would be glad to hear about your project and talk through what you need.",
    verified: false,
    source: "Neutral draft copy; company overview not supplied",
    todo: "Company overview, short paragraph: who the company serves and how it works with clients",
  } satisfies VerifiableText,
  focusAreas: {
    items: ["Hardware & Sensors", "Embedded Systems", "Software Platforms", "Data & Cloud"],
    verified: false,
    source: "Specification section 9.04; confirm each focus area",
  } satisfies Verifiable & { items: readonly string[] },
  annotation: {
    text: "Kigali, Rwanda",
    verified: false,
    source: "Location from specification",
    todo: "Add the founding year here only if the client confirms it (audit issue 15)",
  } satisfies VerifiableText,
  images: {
    large: {
      src: null,
      alt: "Placeholder for a company photograph",
      todo: "Client photograph of the team or lab bench, with alt text describing it",
      width: 1200,
      height: 1500,
      placeholderLabel: "Photograph pending · team at the lab bench",
      verified: false,
      source: "No client photography supplied yet",
    },
    small: {
      src: null,
      alt: "Placeholder for a close-up photograph of a development board",
      todo: "Macro photograph of a development board, with alt text describing it",
      width: 900,
      height: 600,
      placeholderLabel: "Photograph pending · board macro",
      verified: false,
      source: "No client photography supplied yet",
    },
  } satisfies Record<"large" | "small", EditorialImage>,
  /**
   * Mission and vision render only when verified. They stay null until the client
   * supplies approved wording; no placeholder text is ever shown for them.
   */
  mission: null as VerifiableText | null,
  vision: null as VerifiableText | null,
} as const;

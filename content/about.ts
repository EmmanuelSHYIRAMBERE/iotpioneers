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
    text: "IoT Pioneers has a mission to accelerate technology adoption by providing an affordable IoT cloud platform enabling students, researchers, and innovators to build real-world solutions and develop practical digital skills.",
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
    text: "Build, Apply",
    verified: false,
    source: "Location from specification",
    todo: "Add the founding year here only if the client confirms it (audit issue 15)",
  } satisfies VerifiableText,
  // Unsplash stand-ins (imagery-stand-ins skill, audit issue 13). Never presented as the team:
  // the large photo shows hands at work with no face. Credits: CONTENT_VERIFICATION.md.
  images: {
    large: {
      src: "/images/about/workbench.jpg",
      alt: "Hands soldering a small circuit board held in a helping-hands clamp on a workbench",
      todo: "Replace with a client photograph of the lab bench (stand-in: Unsplash, ThisisEngineering RAEng)",
      width: 960,
      height: 1200,
      placeholderLabel: "Photograph pending · team at the lab bench",
      verified: false,
      source: "Stand in, pending client photo (Unsplash, downloaded 2026.11.20)",
    },
    small: {
      src: "/images/about/boardMacro.jpg",
      alt: "Close-up of an ESP32 development board with its USB port and chips",
      todo: "Replace with a client macro photograph of a development board (stand-in: Unsplash, Harrison Broadbent)",
      width: 1050,
      height: 700,
      placeholderLabel: "Photograph pending · board macro",
      verified: false,
      source: "Stand in, pending client photo (Unsplash, downloaded 2026.11.20)",
    },
  } satisfies Record<"large" | "small", EditorialImage>,
  /**
   * Mission and vision render only when verified. They stay null until the client
   * supplies approved wording; no placeholder text is ever shown for them.
   */
  mission: null as VerifiableText | null,
  vision: null as VerifiableText | null,
} as const;

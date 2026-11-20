import type { VerifiableText, Verifiable } from "./types";

const PROVISIONAL = "Provisional copy from specification (PROMPT.md); awaiting client approval";

export const site = {
  /** Running text name. Legal styling below. */
  name: {
    text: "IoT Pioneers",
    verified: false,
    source: "Specification section 1; confirm official name styling",
  } satisfies VerifiableText,
  legalName: {
    text: "IoT PIONEERS Ltd",
    verified: false,
    source:
      "Specification section 1; also shown as 'IOT PIONEERS Ltd' on iotdatahub.rw footer (fetched 2026.11.20)",
  } satisfies VerifiableText,
  /** Production domain. A [VERIFY] value makes metadata fall back to localhost (preview only). */
  siteUrl: {
    text: "[VERIFY: production domain, for example https://www.example.rw]",
    verified: false,
    source: "Not supplied",
  } satisfies VerifiableText,
  shortDescription: {
    text: "An engineering company in Kigali building connected systems end to end: devices, data platforms and software.",
    verified: false,
    source: PROVISIONAL,
  } satisfies VerifiableText,
  metaTitle: {
    text: "IoT Pioneers | IoT Engineering and Software Solutions in Kigali",
    verified: false,
    source: "seo-and-metadata skill default; pending client approval",
  } satisfies VerifiableText,
  metaDescription: {
    text: "IoT Pioneers designs and builds connected systems in Kigali, Rwanda: sensors and devices, data platforms like IoTDataHub, and the components builders need.",
    verified: false,
    source: PROVISIONAL,
  } satisfies VerifiableText,
  /**
   * The client's logo (full lockup: mark, name and "TECH REVOLUTION" tagline), downloaded from the
   * hosted file and trimmed of transparent padding only (not cropped or redrawn). Unverified: the
   * client must confirm it is the current master artwork and supply an icon-only SVG for the
   * navbar and favicon, where the tagline is too small to read.
   */
  logo: {
    src: "/images/brand/iotpioneers-logo.png",
    width: 448,
    height: 200,
    verified: false,
    source:
      "https://res.cloudinary.com/ub24ixc5/image/upload/f_auto,q_auto/iotpioneers_logo_hosted (downloaded 2026.11.20 as PNG, transparent padding trimmed)",
    todo: "client to confirm the logo and supply an icon-only SVG (navbar, favicon) and a vector lockup",
  } satisfies Verifiable & { src: string; width: number; height: number },
  /**
   * Feature flags. The Imigongo inspired texture stays off until the client approves it
   * (CONTENT_VERIFICATION.md item 28).
   */
  flags: {
    imigongoTexture: false,
    verified: false,
    source: "Off by default; approval pending",
  } satisfies Verifiable & { imigongoTexture: boolean },
} as const;

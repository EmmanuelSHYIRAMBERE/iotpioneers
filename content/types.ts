/**
 * Content types. Every factual object extends Verifiable. Only the maintainer sets
 * `verified: true`, after client confirmation recorded in CONTENT_VERIFICATION.md.
 * Strings are kept whole (never concatenated) so French and Kinyarwanda versions can
 * be added later by swapping these files.
 */

export interface Verifiable {
  verified: boolean;
  /** Where the fact came from, for example "Client email 2026.12.01" or "Provisional copy from specification". */
  source: string;
  /**
   * What the client still has to supply or confirm. Never rendered: draft copy on screen stays
   * neutral, and the content gate lists this note instead (audit issue 12).
   */
  todo?: string;
}

/** A single piece of copy that needs confirmation. */
export interface VerifiableText extends Verifiable {
  text: string;
}

export interface NavItem {
  label: string;
  href: string;
  external: boolean;
}

export type SectionId =
  "top" | "about" | "solutions" | "iotdatahub" | "shop" | "paths" | "why" | "contact";

export interface ProductEntry extends Verifiable {
  id: "iotdatahub" | "shop";
  name: string;
  description: string;
  sectionHref: `#${SectionId}`;
  externalHref: string;
  ctaLabel: string;
}

export interface CtaLink {
  label: string;
  href: string;
}

export type IllustrationKey = "iot" | "software" | "cloud" | "automation" | "integration";

export interface Solution extends Verifiable {
  id: string;
  index: string;
  title: string;
  summary: string;
  deliverables: readonly string[];
  illustration: IllustrationKey;
  ctaLabel: string;
}

/** A photograph slot. `src` stays null until the client supplies an image with usage rights. */
export interface EditorialImage extends Verifiable {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /** Shown on the designed placeholder while `src` is null. */
  placeholderLabel: string;
}

export interface ShopCategory extends Verifiable {
  id: string;
  label: string;
  href: string;
}

export type ProductIllustrationKey =
  "board" | "camera" | "sensor" | "display" | "segment" | "module" | "component";

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductHighlight extends Verifiable {
  id: string;
  /** Full shop title, used in the link's accessible name (audit issue 28). */
  name: string;
  /** Short display name shown on the card (audit issue 28). Falls back to `name`. */
  displayName?: string;
  categoryId: string;
  /** Null until the client grants permission to reuse shop photography. */
  image: ProductImage | null;
  illustration: ProductIllustrationKey;
  href: string;
}

export interface ShopAudience extends Verifiable {
  id: string;
  title: string;
  text: string;
  icon: "graduation" | "wrench" | "building";
}

export interface ContactDetails extends Verifiable {
  email: string;
  /** International format for tel links, for example +250700000000. */
  phone: string;
  phoneDisplay: string;
  address: string;
  locality: string;
  countryCode: string;
  hours: string;
}

export type SocialPlatform = "linkedin" | "instagram" | "youtube" | "facebook" | "x" | "github";

export interface SocialLink extends Verifiable {
  platform: SocialPlatform;
  label: string;
  href: string;
}

export interface Principle extends Verifiable {
  id: string;
  index: string;
  title: string;
  text: string;
}

export interface DataHubStep extends Verifiable {
  id: "connect" | "collect" | "monitor" | "act";
  index: string;
  title: string;
  text: string;
}

export interface Feature extends Verifiable {
  id: string;
  title: string;
  text: string;
  icon: "plug" | "activity" | "chart" | "layers" | "bell";
}

export type SensorUnit = "°C" | "%";

export interface SensorReading {
  timestamp: number;
  value: number;
  unit: SensorUnit;
}

export type DeviceProtocol = "HTTP" | "MQTT";
export type DeviceStatus = "online" | "connecting" | "offline";

export interface DemoDevice {
  id: string;
  name: string;
  protocol: DeviceProtocol;
  status: DeviceStatus;
  lastSeen: number;
  channelId: string;
  lastMessage: string;
}

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "empty" }
  | { status: "error"; message: string };

/* -------------------------------------------------------------------------------------------
 * Completion run types.
 * ----------------------------------------------------------------------------------------- */

/**
 * A stand-in photograph (imagery-stand-ins skill). `src` is null until the file exists in
 * public/images/; components then keep their line drawing. Always `verified: false`.
 */
export interface StockImage extends Verifiable {
  src: string | null;
  /** Describes what is shown. Empty string for decorative background photos. */
  alt: string;
  width: number;
  height: number;
  /** Unsplash photographer and photo page, for the credits register. */
  photographer: string | null;
  sourceUrl: string | null;
  /** Shop category images: render the visible "Illustrative image" label. */
  illustrative: boolean;
}

export interface PathNeed {
  id: string;
  label: string;
}

/** A column of the "Which do you need?" table: one of IoT Pioneers' own offerings. */
export interface PathOffering extends Verifiable {
  id: "engineering" | "iotdatahub" | "shop";
  name: string;
  /** Need ids this offering serves. */
  serves: readonly string[];
  ctaLabel: string;
  ctaAccessibleName: string;
  href: string;
  external: boolean;
}

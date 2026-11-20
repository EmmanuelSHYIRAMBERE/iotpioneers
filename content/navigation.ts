import type { NavItem, ProductEntry } from "./types";

/** Fixed product URLs from the client brief (CLAUDE.md section 1). */
export const PRODUCT_URLS = {
  iotdatahub: "https://www.iotdatahub.rw/",
  shop: "https://iotpioneersshop.com/",
} as const;

export const navItems: readonly NavItem[] = [
  { label: "About", href: "#about", external: false },
  { label: "Solutions", href: "#solutions", external: false },
  { label: "Products", href: "#iotdatahub", external: false },
  /** "Which do you need?" (section id "paths"), between Shop and Why in the page order. */
  { label: "Choose", href: "#paths", external: false },
  { label: "Contact", href: "#contact", external: false },
];

export const products: readonly ProductEntry[] = [
  {
    id: "iotdatahub",
    name: "IoTDataHub",
    description: "Connect devices and see their data live.",
    sectionHref: "#iotdatahub",
    externalHref: PRODUCT_URLS.iotdatahub,
    ctaLabel: "Explore IoTDataHub",
    verified: false,
    source: "Product URL from client brief; one line description is provisional copy",
  },
  {
    id: "shop",
    name: "IoT Pioneers Shop",
    description: "Boards, sensors and components for builders.",
    sectionHref: "#shop",
    externalHref: PRODUCT_URLS.shop,
    ctaLabel: "Explore the Shop",
    verified: false,
    source: "Product URL from client brief; one line description is provisional copy",
  },
];

export const primaryCta = { label: "Start a Project", href: "#contact" } as const;

export const footerCompanyLinks: readonly NavItem[] = [
  { label: "About", href: "#about", external: false },
  { label: "Solutions", href: "#solutions", external: false },
  { label: "Which do you need?", href: "#paths", external: false },
  { label: "Why IoT Pioneers", href: "#why", external: false },
  { label: "Contact", href: "#contact", external: false },
];

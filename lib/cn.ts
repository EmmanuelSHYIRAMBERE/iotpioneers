import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Custom theme values from app/globals.css (@theme). tailwind-merge only knows Tailwind's default
 * scale, so without this it reads e.g. `text-display-l` as a text colour and deletes it when a
 * colour class such as `text-cloud-50` follows (audit issue 3). Keep these lists in step with the
 * @theme block; tests/unit/cn.test.ts checks every one.
 */
export const customTheme = {
  text: [
    "display-xl",
    "display-l",
    "h3",
    "row-title",
    "h4",
    "lead",
    "body",
    "body-lg",
    "small",
    "legal",
    "eyebrow",
    "data",
    "marquee",
    "menu",
  ],
  radius: ["tag", "button", "card", "frame"],
  shadow: ["rest", "hover", "highlight"],
  ease: ["out-expo", "standard", "in", "in-out-sine"],
  animate: ["pulse-dot", "scroll-cue", "shimmer", "breathe", "spin-ring", "bob", "centre-pulse"],
  container: ["page", "wide", "cta", "lead", "prose"],
} as const;

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [...customTheme.text],
      radius: [...customTheme.radius],
      shadow: [...customTheme.shadow],
      ease: [...customTheme.ease],
      animate: [...customTheme.animate],
      container: [...customTheme.container],
    },
  },
});

/** Compose class names, letting later Tailwind utilities override earlier conflicting ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

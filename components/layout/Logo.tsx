import Image from "next/image";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";

export interface LogoProps {
  /** Accessible name. Pass an empty string when the surrounding link already names it. */
  alt: string;
  /** "nav": 56px tall, the largest that fits the 64px scrolled navbar. "footer": 80px tall. */
  size: "nav" | "footer";
  className?: string;
}

const HEIGHT = { nav: 56, footer: 80 } as const;

/**
 * The client's logo lockup (content/site.ts `logo`), on dark surfaces only. The PNG is trimmed of
 * transparent padding so the mark fills the given height. It stays unverified until the client
 * confirms it; an icon-only SVG is still needed for the navbar and favicon (design audit issue 2).
 */
export function Logo({ alt, size, className }: LogoProps) {
  const { logo } = site;
  const height = HEIGHT[size];
  const width = Math.round((logo.width / logo.height) * height);
  return (
    <Image
      src={logo.src}
      alt={alt}
      width={width}
      height={height}
      sizes={`${String(width)}px`}
      loading={size === "nav" ? "eager" : "lazy"}
      fetchPriority={size === "nav" ? "high" : "auto"}
      className={cn("block max-w-none shrink-0", className)}
    />
  );
}

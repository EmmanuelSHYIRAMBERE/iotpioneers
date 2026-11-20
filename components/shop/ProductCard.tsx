import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { ProductIllustrationKey, ProductImage } from "@/content/types";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { cn } from "@/lib/cn";
import { ICON_STROKE } from "@/lib/tokens";
import { ProductIllustration } from "./ProductIllustration";

export interface ProductCardProps {
  name: string;
  category: string;
  image: ProductImage | null;
  illustration: ProductIllustrationKey;
  href: string;
  verified: boolean;
  /** For "n of total" announcements in the carousel. */
  position: number;
  total: number;
  className?: string;
}

/**
 * One link wraps the whole card (no nested buttons). No prices, stock or ratings.
 * Hover and focus share the same lifted state; reduced motion keeps only the border.
 */
export function ProductCard({
  name,
  category,
  image,
  illustration,
  href,
  verified,
  position,
  total,
  className,
}: ProductCardProps) {
  return (
    <VerifyMarker verified={verified} className={cn("h-full", className)}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        className={cn(
          "group/card relative flex h-full flex-col rounded-card bg-white p-3 shadow-rest transition-[transform] duration-300 ease-out-expo",
          "hover:-translate-y-1 focus-visible:-translate-y-1 reduce:translate-y-0! reduce:hover:translate-y-0 reduce:focus-visible:translate-y-0",
        )}
      >
        {/* Shadow and border live on pseudo layers so only opacity animates. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-card opacity-0 shadow-hover transition-opacity duration-300 group-hover/card:opacity-100 group-focus-visible/card:opacity-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-card border border-deep-gold opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 group-focus-visible/card:opacity-100"
        />
        <span className="relative block aspect-square overflow-hidden rounded-[8px] bg-slate-100">
          <span className="absolute inset-[12%] block transition-transform duration-500 ease-out-expo group-hover/card:scale-105 group-focus-visible/card:scale-105 reduce:transform-none!">
            {image ? (
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 768px) 280px, 72vw"
                className="h-full w-full object-contain"
                draggable={false}
              />
            ) : (
              <ProductIllustration kind={illustration} />
            )}
          </span>
        </span>
        <span className="relative mt-4 block px-1 font-mono text-[0.875rem] font-medium tracking-[0.1em] text-deep-gold uppercase">
          {category}
        </span>
        <span className="relative mt-1 line-clamp-2 block px-1 font-display text-h4 text-navy-950">
          {name}
        </span>
        <span className="relative mt-auto flex items-center gap-1 px-1 pt-4 text-small font-medium text-deep-gold">
          View in shop
          <span className="sr-only">
            {" "}
            (opens in a new tab), product {position} of {total}
          </span>
          <ArrowUpRight
            aria-hidden="true"
            size={16}
            strokeWidth={ICON_STROKE}
            className="transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
          />
        </span>
      </a>
    </VerifyMarker>
  );
}

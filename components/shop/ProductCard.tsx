"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { ProductIllustrationKey, ProductImage, StockImage } from "@/content/types";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { useCardTilt } from "@/hooks/useCardTilt";
import { cn } from "@/lib/cn";
import { ICON_STROKE } from "@/lib/tokens";
import { ProductIllustration } from "./ProductIllustration";

export interface ProductCardProps {
  /** Full shop title, used in the link's accessible name (audit issue 28). */
  name: string;
  /** Short name shown on the card. */
  displayName: string;
  category: string;
  /** The product's own shop photo, once reuse is permitted. */
  image: ProductImage | null;
  /** Stand-in category photo, shown with an "Illustrative image" label (audit issue 26). */
  categoryImage: StockImage | null;
  illustration: ProductIllustrationKey;
  href: string;
  verified: boolean;
  /** For "n of total" announcements in the carousel. */
  position: number;
  total: number;
  /** Visible label for the in-card link line. */
  illustrativeLabel: string;
  className?: string;
}

/**
 * One link wraps the whole card (no nested buttons). No prices, stock or ratings. Card system:
 * gold top bar on hover and focus, 4px lift and a pointer tilt of at most 6 degrees on fine
 * pointers. The link's accessible name reads "View <full product name> in the IoT Pioneers Shop"
 * while the visible line stays "View in shop" (audit issue 27).
 */
export function ProductCard({
  name,
  displayName,
  category,
  image,
  categoryImage,
  illustration,
  href,
  verified,
  position,
  total,
  illustrativeLabel,
  className,
}: ProductCardProps) {
  const tilt = useCardTilt();
  const stock = !image && categoryImage?.src ? categoryImage : null;

  return (
    <VerifyMarker verified={verified} className={cn("h-full", className)}>
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        style={tilt.style}
        onPointerMove={tilt.onPointerMove}
        onPointerEnter={tilt.onPointerEnter}
        onPointerLeave={tilt.onPointerLeave}
        className={cn(
          "group/card card-topbar relative flex h-full flex-col overflow-hidden rounded-card border border-slate-200 bg-white p-3 shadow-rest",
          "transition-[translate] duration-300 ease-out-expo focus-visible:-translate-y-1 reduce:focus-visible:translate-y-0",
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
        <span className="relative block aspect-square overflow-hidden rounded-button bg-slate-100">
          {stock?.src ? (
            <span className="absolute inset-0 block transition-transform duration-500 ease-out-expo group-hover/card:scale-105 group-focus-visible/card:scale-105 reduce:transform-none!">
              <Image
                src={stock.src}
                alt={stock.alt}
                width={stock.width}
                height={stock.height}
                sizes="(min-width: 640px) 256px, 66vw"
                className="h-full w-full object-cover"
                draggable={false}
              />
            </span>
          ) : (
            <span className="absolute inset-[12%] block transition-transform duration-500 ease-out-expo group-hover/card:scale-105 group-focus-visible/card:scale-105 reduce:transform-none!">
              {image ? (
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(min-width: 640px) 200px, 50vw"
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              ) : (
                <ProductIllustration kind={illustration} />
              )}
            </span>
          )}
          {stock ? (
            // Visible label; the image alt already says "Illustrative image", so this is hidden
            // from assistive technology to avoid reading it twice.
            <span
              aria-hidden="true"
              className="absolute bottom-2 left-2 rounded-tag bg-white px-1.5 py-0.5 font-mono text-small text-slate-600"
            >
              {illustrativeLabel}
            </span>
          ) : null}
        </span>
        <span className="relative mt-4 block px-1 font-mono text-small font-medium tracking-[0.1em] text-deep-gold uppercase">
          {category}
        </span>{" "}
        <span className="relative mt-1 line-clamp-2 block min-h-[2.6em] px-1 font-display text-h4 text-navy-950">
          {displayName}
        </span>{" "}
        <span className="relative mt-auto flex items-center gap-1 px-1 pt-4 text-small font-medium text-deep-gold">
          <span>
            {/* Spaces sit outside the hidden spans: accessible name computation trims text at
                element edges, which would run the words together. */}
            View <span className="sr-only">{name}</span> in{" "}
            <span className="sr-only">the IoT Pioneers</span>&nbsp;shop{" "}
            <span className="sr-only">
              (opens in a new tab), product {position} of {total}
            </span>
          </span>
          <ArrowUpRight
            aria-hidden="true"
            size={16}
            strokeWidth={ICON_STROKE}
            className="shrink-0 transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
          />
        </span>
      </motion.a>
    </VerifyMarker>
  );
}

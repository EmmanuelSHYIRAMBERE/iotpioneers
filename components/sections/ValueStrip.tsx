"use client";

import type { ComponentType } from "react";
import { motion } from "motion/react";
import { Activity, ArrowRight, Cpu, Package, type LucideProps } from "lucide-react";
import { valueStrip, valueStripTitle } from "@/content/hero";
import type { ValueStripIcon, ValueStripItem } from "@/content/types";
import { IconTile } from "@/components/ui/IconTile";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { useCardTilt } from "@/hooks/useCardTilt";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { enterUp, reducedFade, runStagger, staggerList, viewportAmount } from "@/lib/motion";
import { ICON_STROKE } from "@/lib/tokens";

const ICONS: Record<ValueStripIcon, ComponentType<LucideProps>> = {
  engineering: Cpu,
  datahub: Activity,
  shop: Package,
};

function ValueCard({
  item,
  isMobile,
  reduced,
}: {
  item: ValueStripItem;
  isMobile: boolean;
  reduced: boolean;
}) {
  const tilt = useCardTilt();
  const named = item.linkAccessibleName !== item.linkLabel;
  return (
    <motion.li variants={reduced ? reducedFade : enterUp(isMobile)} className="flex">
      <motion.div
        style={tilt.style}
        onPointerMove={tilt.onPointerMove}
        onPointerEnter={tilt.onPointerEnter}
        onPointerLeave={tilt.onPointerLeave}
        className="card-topbar group relative flex w-full flex-col overflow-hidden rounded-card p-6 transition-colors duration-300 hover:bg-navy-900 lg:p-8"
      >
        <VerifyMarker verified={item.verified} className="flex h-full flex-col">
          <IconTile icon={ICONS[item.icon]} tone={item.icon === "datahub" ? "data" : "gold"} />
          <h3 className="mt-5 font-display text-h4 text-cloud-50">{item.title}</h3>
          <p className="mt-2 text-body text-slate-400">{item.text}</p>
          <a
            href={item.href}
            {...(named ? { "aria-label": item.linkAccessibleName } : {})}
            className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 font-medium text-bright-gold underline-offset-4 after:absolute after:inset-0 after:content-[''] hover:underline"
          >
            {item.linkLabel}
            <ArrowRight
              aria-hidden="true"
              size={16}
              strokeWidth={ICON_STROKE}
              className="shrink-0"
            />
          </a>
        </VerifyMarker>
      </motion.div>
    </motion.li>
  );
}

/**
 * Three-item value strip directly under the hero (reference-ui-patterns): Engineering,
 * IoTDataHub and IoT Pioneers Shop, each with an icon tile, a title, one line and an in page link
 * naming its destination. One row of three with hairline dividers from md; stacked on phones.
 */
export function ValueStrip() {
  const tablet = useMediaQuery(mediaQueries.md, true);
  const reduced = useReducedMotionPreference();
  return (
    <section
      aria-labelledby="value-strip-title"
      className="surface-dark bg-navy-950 pb-14 text-cloud-50 md:pb-16"
    >
      <div className="container-page">
        <h2 id="value-strip-title" className="sr-only">
          {valueStripTitle}
        </h2>
        <motion.ul
          className="grid grid-cols-1 divide-y divide-line-dark rounded-frame border border-line-dark md:grid-cols-3 md:divide-x md:divide-y-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: viewportAmount.reveal }}
          variants={staggerList(runStagger.valueStrip)}
        >
          {valueStrip.map((item) => (
            <ValueCard key={item.id} item={item} isMobile={!tablet} reduced={reduced} />
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

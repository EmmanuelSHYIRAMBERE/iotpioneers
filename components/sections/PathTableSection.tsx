import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { pathHeading, pathNeeds, pathOfferings } from "@/content/pathTable";
import type { PathOffering } from "@/content/types";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { ICON_STROKE } from "@/lib/tokens";

const linkClass =
  "group inline-flex min-h-11 items-center gap-1.5 font-medium text-deep-gold underline-offset-4 hover:underline";

/** CTA for one offering. The visible label is short; the accessible name names the destination. */
function OfferingLink({ offering }: { offering: PathOffering }) {
  const Icon = offering.external ? ArrowUpRight : ArrowRight;
  return (
    <a
      href={offering.href}
      {...(offering.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={`${offering.ctaAccessibleName}${offering.external ? " (opens in a new tab)" : ""}`}
      className={linkClass}
    >
      {offering.ctaLabel}
      <Icon
        aria-hidden="true"
        size={16}
        strokeWidth={ICON_STROKE}
        className="transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </a>
  );
}

function YesMark() {
  return (
    <>
      <Check aria-hidden="true" size={22} strokeWidth={2} className="mx-auto text-deep-gold" />
      <span className="sr-only">Yes</span>
    </>
  );
}

/**
 * "Which do you need?" (reference-ui-patterns). A real table on md and up; three stacked cards,
 * one per offering, below md. Only one of the two is rendered visibly (and so exposed to
 * assistive technology) at any width. IoT Pioneers' own offerings only: no competitors, no
 * crosses, no ratings.
 */
export function PathTableSection() {
  return (
    <section
      id="paths"
      aria-labelledby="paths-title"
      className="surface-light section-pad section-pad-joined border-t border-slate-200 bg-cloud-50 text-navy-950"
    >
      <div className="container-page">
        <VerifyMarker verified={pathHeading.verified} className="max-w-3xl">
          <SectionHeading
            id="paths-title"
            eyebrow={pathHeading.eyebrow}
            title={pathHeading.title}
            lead={pathHeading.lead}
            tone="onLight"
          />
        </VerifyMarker>

        {/* md and up: semantic table. */}
        <Reveal className="mt-12 hidden md:block">
          <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-rest">
            <table className="w-full table-fixed border-collapse text-left">
              <caption className="sr-only">{pathHeading.caption}</caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <th
                    scope="col"
                    className="w-[34%] px-6 py-5 font-mono text-small font-medium tracking-[0.1em] text-slate-600 uppercase"
                  >
                    {pathHeading.needsHeader}
                  </th>
                  {pathOfferings.map((offering) => (
                    <th
                      key={offering.id}
                      scope="col"
                      className="px-4 py-5 text-center font-display text-h4 text-navy-950"
                    >
                      <VerifyMarker verified={offering.verified} as="span" className="inline-block">
                        {offering.name}
                      </VerifyMarker>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pathNeeds.map((need) => (
                  <tr key={need.id} className="border-b border-slate-200">
                    <th scope="row" className="px-6 py-5 text-body font-medium text-navy-950">
                      {need.label}
                    </th>
                    {pathOfferings.map((offering) => (
                      <td key={offering.id} className="px-4 py-5 text-center">
                        {offering.serves.includes(need.id) ? (
                          <YesMark />
                        ) : (
                          <span className="sr-only">No</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th
                    scope="row"
                    className="px-6 py-4 font-mono text-small font-medium tracking-[0.1em] text-slate-600 uppercase"
                  >
                    {pathHeading.ctaRowLabel}
                  </th>
                  {pathOfferings.map((offering) => (
                    <td key={offering.id} className="px-4 py-4 text-center">
                      <OfferingLink offering={offering} />
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </Reveal>

        {/* Below md: one card per offering, listing the needs it serves. */}
        <ul className="mt-10 grid grid-cols-1 gap-4 md:hidden" aria-label={pathHeading.caption}>
          {pathOfferings.map((offering, index) => (
            <Reveal as="li" key={offering.id} index={index} className="h-full">
              <TiltCard tone="light">
                <VerifyMarker verified={offering.verified} className="flex h-full flex-col">
                  <h3 className="font-display text-h4 text-navy-950">{offering.name}</h3>
                  <ul className="mt-4 flex flex-col gap-2">
                    {pathNeeds
                      .filter((need) => offering.serves.includes(need.id))
                      .map((need) => (
                        <li
                          key={need.id}
                          className="flex items-start gap-2 text-body text-slate-600"
                        >
                          <Check
                            aria-hidden="true"
                            size={20}
                            strokeWidth={2}
                            className="mt-0.5 shrink-0 text-deep-gold"
                          />
                          {need.label}
                        </li>
                      ))}
                  </ul>
                  <div className="mt-auto pt-4">
                    <OfferingLink offering={offering} />
                  </div>
                </VerifyMarker>
              </TiltCard>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { principles, whyHeading } from "@/content/principles";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { PrincipleLine } from "@/components/visuals/PrincipleLine";

/** Section 08: "Why you rather than someone else?" Four principles on one connected line. No statistics. */
export function WhySection() {
  return (
    <section
      id="why"
      aria-labelledby="why-title"
      className="surface-dark section-pad bg-navy-950 text-cloud-50"
    >
      <div className="container-page grid-page gap-y-16">
        <div className="col-span-full lg:col-span-4">
          <VerifyMarker verified={whyHeading.verified}>
            <SectionHeading
              id="why-title"
              eyebrow={whyHeading.eyebrow}
              title={whyHeading.title}
              tone="onDark"
            />
          </VerifyMarker>
        </div>
        <div className="col-span-full lg:col-span-8 lg:col-start-5 lg:pt-4">
          <PrincipleLine
            items={principles.map((principle) => ({
              id: principle.id,
              index: principle.index,
              title: principle.title,
              text: principle.text,
              verified: principle.verified,
            }))}
          />
        </div>
      </div>
    </section>
  );
}

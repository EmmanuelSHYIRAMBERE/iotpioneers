import { whyHeading } from "@/content/principles";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VerifyMarker } from "@/components/ui/VerifyMarker";

export function WhySection() {
  return (
    <section
      id="why"
      aria-labelledby="why-title"
      className="surface-light section-pad border-t border-slate-200 bg-white text-navy-950"
    >
      <div className="container-page">
        <Reveal>
          <VerifyMarker verified={whyHeading.verified} className="mx-auto max-w-3xl">
            <SectionHeading
              id="why-title"
              eyebrow={whyHeading.eyebrow}
              title={whyHeading.title}
              lead={whyHeading.intro}
              tone="onLight"
              align="center"
            />
          </VerifyMarker>
        </Reveal>
      </div>
    </section>
  );
}

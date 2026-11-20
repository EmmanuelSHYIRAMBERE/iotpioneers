import Image from "next/image";
import { whyBandImage } from "@/content/images";
import { principles, whyHeading } from "@/content/principles";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { PrincipleLine } from "@/components/visuals/PrincipleLine";

/**
 * Section 08: "Why you rather than someone else?" A centred header with a one sentence intro
 * (design audit issue 29), an optional Kigali photo band, then four principle cards on one
 * connected line. No statistics.
 */
export function WhySection() {
  return (
    <section
      id="why"
      aria-labelledby="why-title"
      className="surface-dark section-pad bg-navy-950 text-cloud-50"
    >
      <div className="container-page">
        <VerifyMarker verified={whyHeading.verified} className="mx-auto max-w-3xl">
          <SectionHeading
            id="why-title"
            eyebrow={whyHeading.eyebrow}
            title={whyHeading.title}
            lead={whyHeading.intro}
            tone="onDark"
            align="center"
          />
        </VerifyMarker>
      </div>

      {whyBandImage.src ? (
        // Decorative band (alt ""): a navy overlay at 70% keeps it calm; no text sits on it.
        <div className="container-wide mt-12 md:mt-16">
          <div
            data-why-band=""
            className="relative aspect-[21/9] w-full overflow-hidden rounded-frame lg:aspect-[3/1]"
          >
            <Image
              src={whyBandImage.src}
              alt=""
              fill
              sizes="(min-width: 1440px) 1440px, 100vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-navy-950/70" />
          </div>
        </div>
      ) : null}

      <div className="container-page mt-12 md:mt-16">
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
    </section>
  );
}

import Image from "next/image";
import { whyBandImage } from "@/content/images";
import { principles, whyHeading } from "@/content/principles";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { PrincipleLine } from "@/components/visuals/PrincipleLine";
import { runDistance } from "@/lib/motion";

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
        <Reveal>
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
        </Reveal>
      </div>

      {whyBandImage.src ? (
        // Decorative band (alt ""): a navy overlay at 70% keeps it calm; no text sits on it.
        <div className="container-wide mt-12 md:mt-16">
          {/* The band drifts 40px with scroll (md and up). */}
          <Parallax
            distance={runDistance.parallaxMedium}
            className="aspect-[21/9] w-full rounded-frame lg:aspect-[3/1]"
          >
            <div data-why-band="" className="relative h-full w-full">
              <Image
                src={whyBandImage.src}
                alt=""
                fill
                sizes="(min-width: 1440px) 1440px, 100vw"
                className="object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-navy-950/70" />
            </div>
          </Parallax>
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

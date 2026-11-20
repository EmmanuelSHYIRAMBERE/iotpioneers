import { about } from "@/content/about";
import { Reveal } from "@/components/ui/Reveal";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { IntroImages } from "./IntroImages";
import { StatementReveal } from "./StatementReveal";

/** Section 04: "Can I trust you?" Editorial split on the light surface. */
export function CompanyIntro() {
  const showMissionVision = about.mission?.verified === true && about.vision?.verified === true;

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="surface-light section-pad bg-cloud-50 text-navy-950"
    >
      <div className="container-page grid-page gap-y-16">
        <div className="col-span-full md:col-span-8 lg:order-2 lg:col-span-6 lg:col-start-7">
          <IntroImages
            large={about.images.large}
            small={about.images.small}
            annotation={about.annotation.text}
            annotationVerified={about.annotation.verified}
          />
        </div>

        <div className="col-span-full md:col-span-7 lg:order-1 lg:col-span-5 lg:col-start-1 lg:row-start-1">
          <p className="eyebrow">{about.eyebrow}</p>
          <VerifyMarker verified={about.statement.verified} className="mt-4">
            <div id="about-title">
              <StatementReveal
                lines={about.statement.lines}
                className="font-display text-[2rem] leading-[1.08] font-semibold tracking-[-0.025em] text-navy-950 md:text-display-l"
              />
            </div>
          </VerifyMarker>
          <VerifyMarker verified={about.lead.verified} className="mt-8">
            <p className="max-w-prose text-lead text-slate-600">{about.lead.text}</p>
          </VerifyMarker>
          <VerifyMarker verified={about.body.verified} className="mt-6">
            <p className="max-w-prose text-body text-slate-600">{about.body.text}</p>
          </VerifyMarker>
          <VerifyMarker verified={about.focusAreas.verified} className="mt-12">
            <ul className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-slate-200 pt-8 sm:grid-cols-2">
              {about.focusAreas.items.map((item, index) => (
                <Reveal
                  as="li"
                  key={item}
                  index={index}
                  stagger="listItems"
                  className="flex items-center gap-3"
                >
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-deep-gold" />
                  <span className="font-display text-[1.125rem] font-medium text-navy-950">
                    {item}
                  </span>
                </Reveal>
              ))}
            </ul>
          </VerifyMarker>
        </div>

        {showMissionVision && about.mission && about.vision ? (
          <div className="col-span-full grid gap-12 md:grid-cols-2 lg:mt-16">
            {[
              { label: "MISSION", text: about.mission.text },
              { label: "VISION", text: about.vision.text },
            ].map((block) => (
              <Reveal key={block.label}>
                <p className="font-mono text-small tracking-[0.14em] text-slate-600">
                  {block.label}
                </p>
                <div className="mt-3 h-px bg-slate-200" />
                <p className="mt-6 font-display text-h3 text-navy-950">{block.text}</p>
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

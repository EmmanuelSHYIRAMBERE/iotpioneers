import { dataHub } from "@/content/dataHub";
import { DataHubStoryLoader } from "@/components/dashboard/DataHubStoryLoader";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltRise } from "@/components/ui/TiltRise";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { AnimatedBackground } from "@/components/visuals/AnimatedBackground";

/** Section 06: "Show me proof." IoTDataHub presented as a product launch with a simulated demo. */
export function DataHubShowcase() {
  return (
    <section
      id="iotdatahub"
      aria-labelledby="iotdatahub-title"
      className="surface-light section-pad relative isolate [overflow-x:clip] border-t border-slate-200 bg-white text-navy-950"
    >
      <AnimatedBackground variant="dotGrid" className="-z-10" />
      <AnimatedBackground variant="dataHubGlow" className="-z-10" />

      <div className="container-page">
        {/* One left column: title, ownership line under it, lead, protocol tag and CTAs together
            (audit issue 17). */}
        <Reveal from="left" className="max-w-3xl">
          <SectionHeading
            id="iotdatahub-title"
            eyebrow={dataHub.eyebrow}
            title={dataHub.title}
            tone="onLight"
            lead={
              <>
                <VerifyMarker verified={dataHub.ownership.verified}>
                  <p className="text-small text-slate-600">{dataHub.ownership.text}</p>
                </VerifyMarker>
                <VerifyMarker verified={dataHub.lead.verified} className="mt-4">
                  <p className="text-slate-600">{dataHub.lead.text}</p>
                </VerifyMarker>
              </>
            }
          />
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <AnimatedButton href={dataHub.cta.href} external size="lg">
              {dataHub.cta.label}
            </AnimatedButton>
            <VerifyMarker verified={dataHub.protocols.verified}>
              <ul aria-label="Supported protocols" className="flex flex-wrap gap-2">
                {dataHub.protocols.items.map((protocol) => (
                  <li
                    key={protocol}
                    className="rounded-tag border border-slate-200 px-2.5 py-1 font-mono text-small text-navy-950"
                  >
                    {protocol}
                  </li>
                ))}
              </ul>
            </VerifyMarker>
          </div>
        </Reveal>
      </div>

      <div className="container-wide mt-12 md:mt-16">
        <TiltRise>
          <DataHubStoryLoader
            steps={dataHub.steps}
            labels={{
              sidebar: dataHub.sidebarTerms.items,
              address: new URL(dataHub.cta.href).hostname.replace(/^www\./, ""),
              caption: dataHub.demoCaption,
            }}
            productHref={dataHub.cta.href}
            productLabel={dataHub.cta.label}
          />
        </TiltRise>
      </div>

      <div className="container-page mt-16 md:mt-20">
        <AnimatedButton href={dataHub.cta.href} external size="lg">
          {dataHub.cta.label}
        </AnimatedButton>
      </div>
    </section>
  );
}

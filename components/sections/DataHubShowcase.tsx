import { Activity, Bell, ChartLine, Layers, Plug, type LucideIcon } from "lucide-react";
import { dataHub } from "@/content/dataHub";
import type { Feature } from "@/content/types";
import { DataHubStoryLoader } from "@/components/dashboard/DataHubStoryLoader";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { FeatureList } from "@/components/ui/FeatureList";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltRise } from "@/components/ui/TiltRise";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { AnimatedBackground } from "@/components/visuals/AnimatedBackground";

const FEATURE_ICONS: Record<Feature["icon"], LucideIcon> = {
  plug: Plug,
  activity: Activity,
  chart: ChartLine,
  layers: Layers,
  bell: Bell,
};

/** Section 06: "Show me proof." IoTDataHub presented as a product launch with a simulated demo. */
export function DataHubShowcase() {
  return (
    <section
      id="iotdatahub"
      aria-labelledby="iotdatahub-title"
      className="surface-dark section-pad relative isolate [overflow-x:clip] bg-navy-950 text-cloud-50"
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
            tone="onDark"
            lead={
              <>
                <VerifyMarker verified={dataHub.ownership.verified}>
                  <p className="text-small text-slate-400">{dataHub.ownership.text}</p>
                </VerifyMarker>
                <VerifyMarker verified={dataHub.lead.verified} className="mt-4">
                  <p>{dataHub.lead.text}</p>
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
                    className="rounded-tag border border-line-dark-strong px-2.5 py-1 font-mono text-small text-cloud-50"
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
        <FeatureList
          tone="onDark"
          columns={4}
          items={dataHub.features.map((feature) => ({
            id: feature.id,
            title: feature.title,
            text: feature.text,
            icon: FEATURE_ICONS[feature.icon],
            verified: feature.verified,
          }))}
        />
        {/* The simulated-data disclaimer appears once: the caption under the dashboard frame;
            audit issue 22). */}
        <div className="mt-16">
          <AnimatedButton href={dataHub.cta.href} external size="lg">
            {dataHub.cta.label}
          </AnimatedButton>
        </div>
      </div>
    </section>
  );
}

import { solutions, solutionsHeading } from "@/content/solutions";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { SolutionsIndexClient } from "./SolutionsIndexClient";

/** Section 05: "What can you do for me?" The capability index, like an engineering manual. */
export function SolutionsIndex() {
  return (
    <section
      id="solutions"
      aria-labelledby="solutions-title"
      className="surface-light section-pad section-pad-joined border-t border-slate-200 bg-white text-navy-950"
    >
      <div className="container-page">
        <VerifyMarker verified={solutionsHeading.verified} className="max-w-3xl">
          <SectionHeading
            id="solutions-title"
            eyebrow={solutionsHeading.eyebrow}
            title={solutionsHeading.title}
            lead={solutionsHeading.lead}
            tone="onLight"
          />
        </VerifyMarker>
        <div className="mt-12 md:mt-16">
          <SolutionsIndexClient solutions={solutions} />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { useInView } from "@/hooks/useInView";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { DEMO_SEED } from "@/lib/demoData";
import {
  IoTDashboardPreview,
  STORY_STEPS,
  type DashboardLabels,
  type StoryStep,
} from "./IoTDashboardPreview";

export interface StoryStepContent {
  id: StoryStep;
  index: string;
  title: string;
  text: string;
  verified: boolean;
}

export interface DataHubStoryProps {
  steps: readonly StoryStepContent[];
  labels: DashboardLabels;
}

export function DataHubStory({ labels }: DataHubStoryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tablet = useMediaQuery(mediaQueries.md);
  const reduced = useReducedMotionPreference();
  const inView = useInView(rootRef, { amount: 0 });

  const reachedStep = STORY_STEPS.length - 1;
  const activeStep: StoryStep | null = reduced ? null : (STORY_STEPS[0] ?? null);

  return (
    <div ref={rootRef}>
      <IoTDashboardPreview
        labels={labels}
        seed={DEMO_SEED}
        layout={tablet ? "desktop" : "mobile"}
        activeStep={activeStep}
        reachedStep={reachedStep}
        inView={inView}
      />
      <p className="mt-3 text-small text-slate-600">{labels.caption}</p>
    </div>
  );
}

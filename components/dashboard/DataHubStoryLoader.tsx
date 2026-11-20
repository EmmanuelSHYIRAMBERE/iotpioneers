"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { RotateCcw } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useInView } from "@/hooks/useInView";
import type { DataHubStoryProps } from "./DataHubStory";

export interface DataHubStoryLoaderProps extends DataHubStoryProps {
  productHref: string;
  productLabel: string;
}

type LoadState =
  | { status: "idle" }
  | { status: "ready"; Story: ComponentType<DataHubStoryProps> }
  | { status: "error" };

/**
 * Loads the dashboard demo (and, through it, GSAP) only when the section comes within one
 * viewport. Reserves the final height so nothing shifts, and offers a working retry if the
 * chunk fails to load.
 */
export function DataHubStoryLoader({
  productHref,
  productLabel,
  ...props
}: DataHubStoryLoaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { rootMargin: "100% 0px", once: true });
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<LoadState>({ status: "idle" });

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    import("./DataHubStory")
      .then((module) => {
        if (!cancelled) setState({ status: "ready", Story: module.DataHubStory });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [near, attempt]);

  const skeleton = (
    <div className="grid-page">
      <div className="col-span-full lg:col-span-4">
        <LoadingSkeleton variant="textBlock" tone="onDark" label="Loading the IoTDataHub demo" />
      </div>
      <div className="col-span-full aspect-[9/14] md:aspect-[16/10] lg:col-span-8">
        <LoadingSkeleton variant="chartPanel" tone="onDark" label="Loading the IoTDataHub demo" />
      </div>
    </div>
  );

  let body = skeleton;
  if (state.status === "ready") {
    const { Story } = state;
    body = <Story {...props} />;
  } else if (state.status === "error") {
    body = (
      <ErrorState
        tone="onDark"
        title="The demo couldn't load."
        message="Check your connection and try again, or explore the live product."
        retry={
          <AnimatedButton
            variant="secondary"
            tone="dark"
            icon={RotateCcw}
            iconPosition="left"
            onClick={() => {
              setState({ status: "idle" });
              setAttempt((value) => value + 1);
            }}
          >
            Try again
          </AnimatedButton>
        }
        fallback={
          <AnimatedButton variant="link" tone="dark" href={productHref} external>
            {productLabel}
          </AnimatedButton>
        }
      />
    );
  }

  return (
    <div ref={ref} id="iotdatahub-demo" data-anchor="">
      {body}
    </div>
  );
}

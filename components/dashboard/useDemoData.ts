"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DemoDevice } from "@/content/types";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import {
  advanceSeries,
  countOnline,
  createDemoDevices,
  DEMO_BASE_TIME,
  generateSeries,
  messagesPerMinute,
  type DemoRange,
  type DemoSeries,
} from "@/lib/demoData";
import { timing } from "@/lib/motion";
import { createSeededRandom } from "@/lib/seededRandom";

export interface DemoDataState {
  series: DemoSeries;
  devices: DemoDevice[];
  now: number;
  messages: number;
  range: DemoRange;
  setRange: (range: DemoRange) => void;
}

/**
 * Seeded demo data with live ticks every 2 seconds. The interval exists only while `running`
 * is true and the tab is visible; the caller also stops it when the section is off screen.
 */
export function useDemoData(seed: number, running: boolean): DemoDataState {
  const [range, setRange] = useState<DemoRange>("1H");
  const [now, setNow] = useState(DEMO_BASE_TIME);
  const [series, setSeries] = useState<DemoSeries>(() =>
    generateSeries(seed, "1H", DEMO_BASE_TIME),
  );
  const devices = useMemo(() => createDemoDevices(seed, DEMO_BASE_TIME), [seed]);
  const random = useRef(createSeededRandom(seed + 99));
  const [messages, setMessages] = useState(() =>
    messagesPerMinute(countOnline(devices), createSeededRandom(seed)),
  );
  const pageVisible = usePageVisibility();
  const nowRef = useRef(now);

  useEffect(() => {
    nowRef.current = now;
  }, [now]);

  const changeRange = (next: DemoRange): void => {
    setRange(next);
    // Regenerate from the seed so each range is deterministic, ending at the current demo time.
    setSeries(generateSeries(seed, next, nowRef.current));
  };

  useEffect(() => {
    if (!running || !pageVisible) return;
    const id = window.setInterval(() => {
      const next = nowRef.current + timing.dataTick;
      nowRef.current = next;
      setNow(next);
      setSeries((current) => advanceSeries(current, random.current, next));
      setMessages(messagesPerMinute(countOnline(devices), random.current));
    }, timing.dataTick);
    return () => {
      window.clearInterval(id);
    };
  }, [running, pageVisible, devices]);

  // Online devices report regularly, so their "last seen" follows the demo clock.
  const liveDevices = useMemo(
    () =>
      devices.map((device, index) =>
        device.status === "online"
          ? { ...device, lastSeen: now - (((index * 3) % 9) + 1) * 1000 }
          : device,
      ),
    [devices, now],
  );

  return { series, devices: liveDevices, now, messages, range, setRange: changeRange };
}

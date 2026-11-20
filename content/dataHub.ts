import type { DataHubStep, Feature, Verifiable, VerifiableText } from "./types";

const LIVE_SITE =
  "Paraphrased from https://www.iotdatahub.rw/ (fetched 2026.11.20); client to confirm wording";

export const dataHub = {
  eyebrow: "PRODUCT · IoTDataHub",
  title: "Your devices, your data, one live view.",
  lead: {
    text: "IoTDataHub connects your devices to the cloud, stores what they send in channels, and turns it into dashboards and alerts you can act on.",
    verified: false,
    source: LIVE_SITE,
  } satisfies VerifiableText,
  /**
   * Only protocols stated on the live product site. MQTT is not mentioned there
   * (fetched 2026.11.20), so it is not listed until the client confirms it.
   */
  protocols: {
    items: ["HTTP"],
    verified: false,
    source: "iotdatahub.rw mentions 'any HTTP-capable hardware'; MQTT not stated, so omitted",
  } satisfies Verifiable & { items: readonly string[] },
  ownership: {
    text: "A product of IoT Pioneers.",
    verified: false,
    source:
      "iotdatahub.rw footer names IOT PIONEERS Ltd; client to confirm how ownership is stated",
  } satisfies VerifiableText,
  cta: { label: "Explore IoTDataHub", href: "https://www.iotdatahub.rw/" },
  /** Names its destination (the demo below), not a bare "How it works" (audit issue 27). */
  howItWorksLabel: "See how IoTDataHub works",
  /** Navigation terms used inside the stylised demo. "Devices" and "channels" appear on the live site. */
  sidebarTerms: {
    items: ["Overview", "Devices", "Channels", "Dashboards", "Alerts"],
    verified: false,
    source:
      "Neutral terms from specification; 'devices', 'channels', 'dashboards' and 'alerts' appear on iotdatahub.rw",
  } satisfies Verifiable & { items: readonly string[] },
  demoCaption:
    "Stylised representation of IoTDataHub. Dashboard shown with simulated data for illustration.",
  demoBadge: {
    label: "Simulated demo data",
    tooltip:
      "This is an illustration with generated data. It is not connected to a live IoTDataHub account.",
  },
  steps: [
    {
      id: "connect",
      index: "01",
      title: "Connect devices",
      text: "Register a device and start sending readings over HTTP. Arduino, ESP32, Raspberry Pi and other HTTP capable hardware can connect.",
      verified: false,
      source: LIVE_SITE,
    },
    {
      id: "collect",
      index: "02",
      title: "Collect data in real time",
      text: "Each device pushes sensor readings and events to its channels as they happen, so the latest values are always in one place.",
      verified: false,
      source: LIVE_SITE,
    },
    {
      id: "monitor",
      index: "03",
      title: "Monitor and visualise",
      text: "Build dashboards with charts and gauges, then look back over any time range to see how readings change.",
      verified: false,
      source: LIVE_SITE,
    },
    {
      id: "act",
      index: "04",
      title: "Act on insights",
      text: "Set thresholds and get notified when a reading moves out of range, so problems are handled before they grow.",
      verified: false,
      source: LIVE_SITE,
    },
  ] satisfies readonly DataHubStep[],
  features: [
    {
      id: "connectivity",
      title: "Device Connectivity",
      text: "Connect boards and gateways over HTTP and manage them from one place.",
      icon: "plug",
      verified: false,
      source: LIVE_SITE,
    },
    {
      id: "realtime",
      title: "Real Time Data",
      text: "Readings arrive as they are sent and are stored for later analysis.",
      icon: "activity",
      verified: false,
      source: LIVE_SITE,
    },
    {
      id: "dashboards",
      title: "Dashboards & Visualisation",
      text: "Charts and gauges that show what your sensors are measuring.",
      icon: "chart",
      verified: false,
      source: LIVE_SITE,
    },
    {
      id: "management",
      title: "Device and Channel Management",
      text: "Organise devices and the channels they write to as your project grows.",
      icon: "layers",
      verified: false,
      source: LIVE_SITE,
    },
  ] satisfies readonly Feature[],
} as const;

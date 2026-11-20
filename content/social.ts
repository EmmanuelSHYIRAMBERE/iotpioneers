import type { SocialLink } from "./types";

const SOURCE =
  "Linked from iotdatahub.rw and iotpioneersshop.com footers (fetched 2026.11.20); client to confirm each";

export const socialLinks: readonly SocialLink[] = [
  {
    platform: "linkedin",
    label: "IoT Pioneers on LinkedIn",
    href: "https://www.linkedin.com/in/iot-pioneers-ltd-a56417383/",
    verified: false,
    source: SOURCE,
  },
  {
    platform: "instagram",
    label: "IoT Pioneers Shop on Instagram",
    href: "https://www.instagram.com/iot.pioneersshop/",
    verified: false,
    source: SOURCE,
  },
  {
    platform: "youtube",
    label: "IoT Pioneers on YouTube",
    href: "https://www.youtube.com/@IoTPioneersLtd",
    verified: false,
    source: SOURCE,
  },
];

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // A stray lockfile in the user's home folder must not be mistaken for the workspace root.
  turbopack: { root: process.cwd() },
  images: {
    formats: ["image/avif", "image/webp"],
    // Local SVG placeholders are served as plain files (see components/ui/MediaPlaceholder),
    // never through the optimiser, so SVG support stays off here.
    dangerouslyAllowSVG: false,
  },
  env: {
    // Exposed so client components know a preview build allows unverified content.
    NEXT_PUBLIC_ALLOW_UNVERIFIED_CONTENT: process.env.ALLOW_UNVERIFIED_CONTENT ?? "false",
    // Opt-in only: VerifyMarker outlines and tags show when this is "true" (default off).
    NEXT_PUBLIC_SHOW_VERIFY_MARKERS: process.env.NEXT_PUBLIC_SHOW_VERIFY_MARKERS ?? "false",
  },
};

export default nextConfig;

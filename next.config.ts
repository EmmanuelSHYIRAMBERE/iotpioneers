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
    // Exposed so client components can render VerifyMarker outlines and the PreviewBanner
    // in preview and development builds only.
    NEXT_PUBLIC_ALLOW_UNVERIFIED_CONTENT: process.env.ALLOW_UNVERIFIED_CONTENT ?? "false",
  },
};

export default nextConfig;

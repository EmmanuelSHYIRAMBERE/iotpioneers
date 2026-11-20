import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { isPlaceholder, isPreviewMode, resolveSiteUrl } from "@/lib/verification";

export const dynamic = "force-static";

/** Allow everything in production; disallow everything in preview builds or before the domain is confirmed. */
export default function robots(): MetadataRoute.Robots {
  const blocked = isPreviewMode() || isPlaceholder(site.siteUrl.text);
  const base = resolveSiteUrl(site.siteUrl.text);
  return blocked
    ? { rules: { userAgent: "*", disallow: "/" } }
    : { rules: { userAgent: "*", allow: "/" }, sitemap: new URL("/sitemap.xml", base).toString() };
}

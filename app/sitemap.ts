import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { resolveSiteUrl } from "@/lib/verification";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: resolveSiteUrl(site.siteUrl.text).toString(),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}

import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/** robots.txt — allow all crawlers, point them at the canonical sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}

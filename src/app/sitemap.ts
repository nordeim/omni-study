import type { MetadataRoute } from "next";

import { NAV_ITEMS } from "@/lib/router";
import { siteUrl } from "@/lib/site";

/**
 * sitemap.xml — the canonical origin (NEXT_PUBLIC_SITE_URL) + the login page
 * and every SPA view path the router owns (the same paths next.config.ts
 * rewrites onto /). Generated at build time; no dynamic per-user data (the
 * app's views all require authentication).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    ...NAV_ITEMS.map((route) => ({
      url: `${base}${route.path}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    { url: `${base}/login`, changeFrequency: "monthly", priority: 0.3 },
  ];
}

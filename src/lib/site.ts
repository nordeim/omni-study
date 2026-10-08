// ---------------------------------------------------------------------------
// Canonical site origin — the documented NEXT_PUBLIC_SITE_URL contract.
//
// README ("Site"), docs/DEPLOYMENT.md §2 and the PAD env table document
// NEXT_PUBLIC_SITE_URL as the canonical public origin used for metadata,
// sitemap.xml and robots.txt, with an http://localhost:3000 dev default.
// This module is the single resolution point (pure: no DOM access — pinned
// by tests/site.test.ts).
// ---------------------------------------------------------------------------

export const DEFAULT_SITE_URL = "http://localhost:3000";

/** Resolve the canonical site origin (trailing slashes + whitespace trimmed). */
export function siteUrl(override?: string): string {
  const raw = (override ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  const normalized = raw.replace(/\/+$/, "");
  return normalized || DEFAULT_SITE_URL;
}

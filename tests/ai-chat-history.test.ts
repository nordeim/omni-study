import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Session-91 remediation pin — the AI chat LLM context window (the audit's
 * MEDIUM finding #4).
 *
 * The defect: `src/app/api/ai/chat/route.ts` queried the chat history with
 * `orderBy: { createdAt: "asc" }, take: 20` — the OLDEST 20 rows. The
 * client sends only the newest user message, so that query is the ONLY
 * source of prior context; past 20 stored messages the assistant's prompt
 * NEVER included the recent turns (permanent silent amnesia).
 *
 * The route handler is server-only (Prisma client + the dynamic
 * z-ai-web-dev-sdk import) and cannot be imported into the vitest node
 * environment — the theme-cache precedent applies: the SOURCE is the sync
 * contract, and these pins fail if the query shape regresses. A real-LLM
 * e2e is deliberately NOT used (the AI rate budget is pinned by the S14
 * spec — 20/15min deliberately exhausted there).
 */

const ROUTE = readFileSync(
  join(import.meta.dirname, "..", "src", "app", "api", "ai", "chat", "route.ts"),
  "utf8",
);

describe("S91 · the AI chat LLM context query (source-invariant pin)", () => {
  it("queries the NEWEST 20 messages (desc), not the oldest (asc)", () => {
    // The fixed form: desc + take — the newest window.
    expect(ROUTE).toContain('orderBy: { createdAt: "desc" }');
    // The regression form must be gone: asc + take together selected the
    // OLDEST rows (the S91 defect). The asc order alone is fine elsewhere
    // (the /api/ai/messages GET uses asc for full-history display) — the
    // BUG was asc COMBINED with take on the LLM-context query.
    expect(ROUTE).not.to.match(/orderBy:\s*\{\s*createdAt:\s*"asc"\s*\},\s*\n\s*take:/);
  });

  it("reverses the desc-ordered rows for chronological prompt injection", () => {
    // desc rows arrive newest-first; the prompt needs oldest-first — the
    // route must reverse before spreading into the completion messages.
    expect(ROUTE).toMatch(/\.reverse\(\)/);
  });

  it("keeps the context window bounded at 20 messages", () => {
    expect(ROUTE).toMatch(/take:\s*20/);
  });
});

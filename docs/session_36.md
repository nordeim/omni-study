# Session 36 — the S21 iteration: the full-data export (data portability)

Git pull brought the repo to `36ef125` (the S20 push + the
session-35 transcript). The review docs read (session_34,
remediation-plan-session20, the repo worklog, session_35); the S20
seams verified present (the `rum-diagnostics` seam with
`buildSparklinePoints`/`toRumCsv`, the GET `trends` extension, the
`/api/rum/export` route, the panel sparklines, the s20 spec, the S20
capture script), `DATABASE_URL="file:../db/custom.db"` with `db/` at
the repo root, `.env.example` matching the codebase, the vitest +
playwright configs current. Baseline gates matched the documented
state: lint ✓ tsc ✓ 192 unit ✓.

The standing checks FIRST (the brief's priority item): the
**mobile-drawer check GREEN** on both apps — backdrop
`oklab(0 0 0/0.2)`+blur(4px), the 288px white panel, 20 links, no
footer, the Escape-close superset — and additionally live-verified
with agent-browser at 390×844 (the drawer opens as a dialog, the
Flashcards link navigates, the view renders, the drawer closes).
**The mobile navigation menu is working as expected.** The reference
re-sweep: **UNCHANGED since S19/S20** — the account still zero-data
(0/0 stats), all five Settings tabs matching every prior measurement
(school "Lincoln High", Daily Study Goal: 4 hours, Account created
9/28/2026, the master toggle, the per-tab headers, the zero-empty
states), 20 nav views in the same order, the branding split stable.
The clone-side Settings sweep: parity ✓.

The S20 code audit (the recent changes): the pure seam, the GET
trends extension, the export route, the panel, the spec — reviewed
line-by-line — **CLEAN**. The CSRF posture re-reviewed (SameSite=Lax +
non-GET mutations + httpOnly + secure-in-prod — the documented
adequate posture, no gap). Docker re-verified unavailable in the
sandbox (`docker: command not found`) — the first real
`docker compose --profile init up` stays the owner's documented step
(DEPLOYMENT.md §8). The scandihaven reference repo reviewed (the same
gate/health/idempotent-seed convention family — already implemented
here).

Governing decision: with both backlogs empty (the reference unchanged,
the S20 code clean) and the S18→S20 observability arc closed, the
brief's superset goal + open-questions clause governed. The README's
core promise — "your database, your AI keys, your deployment … a
codebase you fully own" — had a missing exit: no way to get the
user's own data OUT of the app except raw SQLite-file access. The
session shipped **the full-data export (data portability)** — a pure
functional superset (the reference has nothing like it) following the
established ADR-017 owner-surface pattern (URL-direct, server-gated,
zero nav linkage, documented).

Plan saved: `docs/remediation-plan-session21.md` — validated before
execution (`next.config.ts` rewrites only map the 20 PascalCase paths
so `/export` serves cleanly as a real route folder; the sitemap
enumerates NAV_ITEMS + `/login` only so `/export` cannot leak in; the
secret guard designed belt-and-braces — the route's explicit select
never reads passwordHash AND the seam strips it).

TDD: **RED** — 9 unit failures (the absent seam module) + 4 e2e
failures (the absent export route, the absent page; the
zero-nav-linkage guards passed on arrival by design — they pin the
absence). **GREEN** — the pure seam (`src/lib/data-export.ts`: the
20-collection manifest, the row normalizer [userId dropped, Date →
ISO], the versioned envelope, the secret guard) → the download route
(`GET /api/export/data`: the 20 parallel chronological userId-scoped
reads, the S13/S14 download-header contract) → the server-gated
`/export` page (the count snapshot as props) → the client panel (the
/rum pattern — themed, responsive, no new CSS). **No implementation
iterations needed** — the first implementation passed the tests.

**FULL REGRESSION GREEN: 267 e2e ✓** (cold `db/e2e.db`, 4.3 min — the
262 prior pins untouched) = **468 tests green** (201 unit + 267 e2e).

Evidence: 4 captures via the committed
`scripts/capture-s21-evidence.mjs` (the `/export` page desktop light +
DARK + mobile 390×844 — 20 count cards + the Download JSON action in
every mode, no mobile overflow — + the downloaded JSON envelope head;
the round-trip verified in-script: the attachment disposition,
nosniff, private/no-store, no passwordHash). VLM-verified: all three
PASS. The mobile-navigation spec re-ran green inside the full suite —
the shell is untouched (the zero-nav-linkage guard pins it).

Docs aligned: README (badge 468, the data-portability row, the
`/api/export/data` row, counts 201/267, the plan row, the captures
line), AGENTS (the export contract + the capture command + counts),
CLAUDE (the portability contract + the S21 seam + counts), PAD
(ADR-019 with the alternatives-rejected table; the test-distribution
table to 468; the stale pre-push-checklist counts corrected), SKILL
(the 468 badge), DEPLOYMENT §8.2 (the "take your data with you"
walkthrough), `.env.example` audited — unchanged (no new env vars:
the export reads none).

**Session complete — the S21 data-portability export: 468 tests
green, ready to commit and push to main.**

**What governed this session:** the reference re-swept UNCHANGED since
S19/S20 and the S20 code audited clean — with the observability arc
closed, the brief's superset goal governed: the missing piece of the
app's own value proposition ("a codebase you fully own") is the exit —
data portability.

**Landed (TDD, 468 tests green — 201 unit + 267 e2e):**
- **The download**: `GET /api/export/data` — the user's complete
  content across 20 collections as a versioned JSON envelope
  (chronological, ids/FKs intact, the hashless profile, the S13/S14
  download-header contract)
- **The page**: the server-gated `/export` route — the count grid, the
  Download JSON action, the format documentation — themed through the
  production path, responsive to 390px, linked from nowhere

**Excluded by decision (ADR-019):** the password hash (double-guarded),
verification/reset tokens (secrets), RUM telemetry (the CSV covers it),
and no restore/import (the schema + SQLite file are the restore story).

**Next:** the first real `docker compose --profile init up` on a Docker
host remains the owner's one open verification step (DEPLOYMENT.md §8).
Visit `/export` on your deployed app to preview + download your data;
`GET /api/export/data` is the scriptable contract. The superset story
now covers observability (beacon → panel → export) AND portability
(full-data export) — the remaining candidate surfaces (an import /
restore tool, scheduled backups) are documented ADR-019 rejections
deliberate to keep.

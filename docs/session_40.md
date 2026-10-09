# Session 40 — the S23 iteration: the data import (restore)

Git pull brought the repo to `e744ce0` (the S22 push `ff8fbcc` + the
session-39 transcript). The review docs read (session_38,
remediation-plan-session22, the repo worklog, session_39); the S22 seams
verified present and audited line-by-line (the `env-check` seam, the
`instrumentation.ts` boot hook, the auth.ts single-source refactor, the
s22 spec, the capture script) — **CLEAN**.
`DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root,
`.env.example` matching the codebase, the vitest + playwright configs
current (the 64-hex webServer secret). Baseline gates matched the
documented state: lint ✓ tsc ✓ 215 unit ✓ — then build ✓ + a cold-db
full e2e regression 269 ✓ = the documented 484-green state re-confirmed
on arrival.

The standing checks FIRST (the brief's priority item): the
**mobile-drawer check GREEN** on both apps — backdrop
`oklab(0 0 0/0.2)`+blur(4px), the 288px white panel, 20 links, no
footer, the Escape-close superset — and additionally live-verified with
agent-browser at 390×844 (the drawer opens as a dialog with all 20
links, the Flashcards link navigates to `/Flashcards`, the view renders,
the drawer closes). **The mobile navigation menu is working as
expected.** The reference re-sweep (login → dashboard → the five-tab
Settings sweep): **UNCHANGED since S19–S22** — the zero-data account
0/0, school "Lincoln High", Daily Study Goal: 4 hours, Account created
9/28/2026, the Notifications master toggle, 20 nav views in the same
order, the branding split stable. The clone-side Settings sweep: parity
✓. The live agent-browser walkthrough verified the shell, the mobile
drawer, the dashboard, the `/export` count grid (51 rows / 20
collections), and the `/rum` panel. No Tailwind v4 bugs (all traps
remain pinned). Docker re-verified unavailable in the sandbox; the first
real `docker compose --profile init up` stays the owner's documented
step (DEPLOYMENT.md §8). The scandihaven reference repo re-reviewed —
unchanged since 10-04; no new patterns (the boot-validation convention
was adopted in S22).

Governing decision: with both backlogs empty (the reference unchanged,
the S22 code clean) and the full regression green on arrival, the
standing superset goal governed — **S21 shipped the export half of the
portability promise, but a backup you cannot restore is half a
promise**. The ADR-019 rejection ("conflict resolution + partial-failure
semantics are a project of their own") was revisited with the semantics
resolved by design: upsert-by-id (envelope-wins), ONE all-or-nothing
transaction, import-never-deletes, content-only (never identity), and
the envelope portable across accounts (the export's dropped `userId`
re-attached by the importing account). The mechanism was validated
EMPIRICALLY before adoption (a scratch probe, deleted after): **Prisma
enforces FKs on SQLite (dangling → P2003 mid-transaction — opaque)**, so
the seam MUST pre-validate; the userId-scoped `updateMany` matches
nothing on foreign rows; a cross-user id collision on create dies P2002;
an interactive transaction rolls back cleanly; ISO date strings pass to
DateTime fields; an explicit `updatedAt` is preserved; 500 rows upsert
in ~300 ms.

Plan saved: `docs/remediation-plan-session23.md` — validated against
the codebase before execution (no existing import route; the FK map
enumerated from the schema — all optional except `cards.deckId`;
`folders.parentId` self-referential → the seam sorts parents-first;
all models flat).

TDD: **RED** — the unit file failed to load (the absent seam module) +
all 5 e2e specs failed (the route answered 404; the panel lacked the
Restore card). **GREEN** — the pure seam (`src/lib/data-import.ts`:
`parseImportEnvelope` — the envelope identity shared with the export
seam, the shape rules, the import-side secret guard
[passwordHash/userId stripped], the FK pre-emption [dangling optional →
nulled, the SetNull semantics; the required `cards.deckId` → the
corrupt-envelope error], the folders parents-first topological sort
with cycle rejection, `IMPORT_FK_MAP` completeness-pinned,
`IMPORT_MAX_BYTES` 10 MiB) → the route (`POST /api/import/data`: auth →
the S14 rate limit 10/15-min → the text-then-cap body read [413] → the
seam → ONE interactive transaction with the userId-scoped
updateMany→create upsert, `cards` scoped through the deck relation, the
route-local P2002/P2003/P2012/P2013 mapping) → the panel extension (the
Restore card: the file picker with the client-side size pre-check, the
busy state, the `role="status"` report / `role="alert"` error; page.tsx
UNTOUCHED — the pinned S21 surfaces byte-identical; the footer's
"restoring is a non-feature" sentence rewritten). 30/30 unit pins green
first-try; one typecheck iteration (the Flashcard delegate cast); one
test-file cast-syntax iteration.

**FULL REGRESSION GREEN: 274 e2e ✓** (cold `db/e2e.db`, 4.6 min — the
269 prior pins untouched) = **519 tests green** (245 unit + 274 e2e).

Evidence: 5 captures via the committed
`scripts/capture-s23-evidence.mjs` — `s23-import-roundtrip-evidence.json`
(the first import's full per-collection summary [3 created], the
idempotent re-import [0 created / 3 updated], the validation-error
family [future version / dangling required FK / duplicate id → the
actionable 400s], the rollback guard [the 400 family changed nothing],
the probe cleanup) + four dev-server screenshots (the `/export` page
with the Restore card — desktop light + DARK [themed through the
production loadFromUser path] + mobile 390px, and the completed-import
result state — "Imported 3 rows — 3 created, 0 updated" with the
per-collection list). VLM-verified: all four PASS via
`scripts/vlm-verify-s23.mjs`.

Two honest capture iterations, recorded as **AP-70**: (a) a dev-server
ZOMBIE — the `fuser -k 3000/tcp` restart silently failed (the new
server died EADDRINUSE; the original kept serving with its exhausted
in-memory rate limiter), producing phantom 429s that looked like a route
bug until killed by PID; (b) the rollback-guard baseline was
contaminated by the capture's own earlier successful imports — it read
`unchanged: false` until the baseline moved to
after-the-successful-imports (isolate the variable under test by
construction).

Docs aligned: README (badge 519, the data-portability feature row's
import clause, the `/api/import/data` API row, counts 245/274, the
vitest seam list, the captures line — also completing the S22 session's
dangling "and the S22" truncation, the Project Status session-23 row),
AGENTS (the import contract in Architecture facts + 2 capture commands +
counts), CLAUDE (the portability contract's restore clause + the S23
seam + the S23 pins + counts), PAD (ADR-021 with the
alternatives-rejected table: no dry-run / no replace-wipe / no
skip-existing / no natural-key merge / no Zod row schemas / no multipart
/ no cross-account id remapping; the test-distribution table to
519 = 245 unit + 273 chromium + the 1 setup), SKILL (the 519 badge +
AP-70), DEPLOYMENT.md §8.2 (the restore walkthrough — the data-loss
recovery story: register fresh → sign in → import). `.env.example`
audited — unchanged (the import reads no env vars).

**Session complete — the S23 data import: 519 tests green, ready to
commit and push to main.**

**What governed this session:** both backlogs empty again (the reference
unchanged since S19–S22; the S22 code audited clean) — the standing
superset goal governed, and the first-listed remaining candidate (the
import/restore) closed the portability story into a full round-trip.

**Landed (TDD, 519 tests green — 245 unit + 274 e2e):**
- **The seam**: `src/lib/data-import.ts` — `parseImportEnvelope` (the
  validation + normalization), `IMPORT_FK_MAP` (completeness-pinned),
  `IMPORT_MAX_BYTES` (10 MiB)
- **The route**: `POST /api/import/data` — the upsert-by-id
  all-or-nothing transaction (userId-safe by construction), the 10 MiB
  cap, the 10/15-min rate limit, the actionable error mapping
- **The UI**: the `/export` page's Restore from a backup card (the
  pinned S21 surfaces byte-identical)
- **The pins**: 30 unit + 5 e2e

**Next:** the first real `docker compose --profile init up` on a Docker
host remains the owner's one open verification step (DEPLOYMENT.md §8).
The superset story now covers observability (S18→S20), portability
(S21 export + S23 import = the full round-trip), and fail-fast
production boot hygiene (S22); the remaining documented candidates
(scheduled backups, a pre-push secret-scan gate) stay deliberate ADR
rejections, revisitable on request.

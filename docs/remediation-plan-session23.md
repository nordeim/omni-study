# Remediation Plan — Session 23 (S23): the data import (restore)

**Audit surfaces (this session, session-40 workspace run at `e744ce0`):** the
standing checks all ran GREEN on arrival — the baseline gates (lint ✓ tsc ✓
215 unit ✓ against the S22 codebase), the mobile-drawer check on BOTH apps
(backdrop `oklab(0 0 0/0.2)`+blur(4px), 288px white panel, 20 links, no
footer, Escape-close superset — the brief's priority item; additionally
live-verified with agent-browser at 390×844: the drawer opens as a dialog
with all 20 links, the Flashcards link navigates to `/Flashcards`, the view
renders, the drawer closes — **the mobile navigation menu is working as
expected**), the reference re-sweep (login → dashboard → the five-tab
Settings sweep): **the reference is UNCHANGED since S19/S20/S21/S22** (the
zero-data account 0/0, school "Lincoln High", Daily Study Goal: 4 hours,
Account created 9/28/2026, the Notifications master toggle, 20 nav views in
the same order, the branding split stable), the clone-side Settings sweep
parity ✓, and the S22 code audit (the recent changes: the `env-check` seam,
the `instrumentation.ts` boot hook, the auth.ts single-source refactor, the
s22 boot-guard spec — reviewed line-by-line) — **CLEAN**. The live
agent-browser walkthrough verified the shell, the mobile drawer, the
dashboard, the `/export` count grid (51 rows / 20 collections), the `/rum`
panel, and the S21 download contract surface. The full regression re-ran
GREEN on arrival: build ✓ + a cold-db full e2e suite 269 ✓ = the documented
484-green state re-confirmed. Docker re-verified unavailable in the sandbox
(`docker: command not found`); the first real `docker compose --profile init
up` stays the owner's documented step (DEPLOYMENT.md §8). The scandihaven
reference repo re-reviewed — unchanged since 10-04 (the S22 session's
review); no new patterns to adopt (the boot-validation convention was
adopted in S22; the secret-scan/coverage candidates stay documented ADR
rejections).

## The governing decision (this session's work)

With the parity backlog empty (the reference unchanged), the audit backlog
empty (S22 clean), and the full regression green on arrival, the standing
superset goal governed. The session-38/39 narratives list the remaining
documented candidates — **the import/restore tool** (first-listed),
scheduled backups, a pre-push secret-scan gate. The import is the strongest
match for the brief's "production-ready superset" goal: **S21 shipped the
export half of the portability promise, but a backup you cannot restore is
half a promise** — the owner can take their data OUT (the JSON envelope)
but there is no way to bring it back IN except raw SQLite surgery. The
ADR-019 rejection ("conflict resolution + partial-failure semantics are a
project of their own") is revisited HERE with the semantics resolved by
design (below) — the tightest possible scope:

- **Upsert-by-id, envelope-wins.** A row whose id exists (and belongs to
  the importing user) is UPDATED to the envelope's field values; a new id
  is CREATED. No skip-existing mode, no merge-by-natural-key, no
  field-level merge UI (ADR-021 alternatives-rejected).
- **All-or-nothing.** One interactive transaction; ANY failure rolls the
  whole import back — the database is exactly as before, or exactly the
  envelope merged in. No partial states, no per-row error reports to
  reconcile. (Validated empirically: the scratch probe's forced failure
  rolled back cleanly.)
- **Import never deletes.** Rows absent from the envelope are untouched —
  an import can never LOSE data. A true mirror-restore (wipe + import)
  stays the owner's explicit two-step: `bun run db:reset` + import
  (documented in DEPLOYMENT.md §8.2).
- **Content only, never identity.** The envelope's `user` block is
  informational (provenance) — the import restores the 20 CONTENT
  collections and never touches the importing account's email, password,
  theme, or study profile.
- **The envelope is portable across accounts.** The export dropped
  `userId` (single-user implied); the import re-attaches the IMPORTING
  user's id to every row — restoring into a fresh account after data loss
  (the primary use case) works with zero id remapping.

### Mechanism facts (validated empirically this session, scratch probe — deleted after)

| Check | Result |
|---|---|
| Dangling FK on create (`subjectId: "no-such-subject"`) | **REJECTED P2003** — Prisma enforces FKs on SQLite: the seam MUST pre-validate/null dangling FKs or the import dies mid-transaction with an opaque error |
| Dangling FK on update | **REJECTED P2003** (same family) |
| `updateMany({ where: { id, userId }, data })` | count=1 on the owned row, **count=0 on a foreign row** — the upsert's update branch is userId-scoped by construction |
| Cross-user id collision on create (`create` with an id another user owns) | **REJECTED P2002** → the transaction rolls back → maps to a clear 400 |
| Interactive `$transaction` with a forced failure | **rolls back cleanly** (zero leaked rows) |
| ISO date strings for `DateTime` fields | accepted on create AND update (`createdAt`/`dueDate` round-trip exactly) |
| Explicit `updatedAt` passed on update | **the explicit value is USED** (not auto-overwritten) — a restore keeps the original timestamps |
| Relation-scoped `updateMany` (`where: { id, deck: { userId } }`) | owned=1, foreign=0 — the `cards`-through-`deck` pattern (Flashcard has no userId column) |
| 500-row upsert transaction | **300 ms** — performance is a non-issue at single-user scale |

---

## Non-gaps (documented, do not fix)

1. **The reference is unchanged** — no parity surface exists to chase. The
   import adds ZERO chrome to any parity-pinned surface (the `/export`
   page's pinned surfaces — the h1, the count grid, the Download JSON
   anchor, the metadata title — stay byte-identical; the import card is a
   purely additive section BELOW them).
2. **No dry-run preview** — the upsert-only semantics (nothing is deleted;
   existing rows update to the envelope's values) plus the all-or-nothing
   transaction make the operation reversible-by-re-export; a preview step
   doubles the route surface for marginal value (ADR-021
   alternatives-rejected). The POST's response IS the report (per-collection
   created/updated counts).
3. **No multipart upload** — the JSON body is the export's own format: the
   downloaded file round-trips unmodified (`Content-Type: application/json`).
   A multipart form adds a second parser for zero benefit.
4. **No Zod row schemas** — the envelope's 20 heterogeneous row shapes are
   validated by the pure seam (shape + FK integrity) and the DATABASE itself
   (types, required fields, uniques — inside the transaction). A Zod mirror
   of the Prisma schema would be a maintenance twin that drifts on every
   schema change (ADR-021 alternatives-rejected).
5. **No rate-limit e2e pin** — the route reuses the pinned `checkRateLimit`
   (the S14 seam); an e2e exhaustion pin would poison the import budget for
   the other S23 specs (the C1 pattern, documented).
6. **The Docker real-run** remains the owner's step (no daemon here).

---

## Families and fixes

### S23-A (HIGH) — the pure seam (`src/lib/data-import.ts`)

A new dependency-free pure module (the S21/S22 seam pattern), unit-pinned
end-to-end:

- `IMPORT_FK_MAP` — the per-collection foreign-key spec: for each of the 20
  collections, the FK fields with `{ target, required }` (e.g. tasks:
  `listId → taskLists` optional, `subjectId → subjects` optional; cards:
  `deckId → decks` REQUIRED; folders: `parentId → folders` optional,
  self-referential). The completeness is unit-pinned against
  `EXPORT_COLLECTIONS` (every collection has an entry, even if empty).
- `parseImportEnvelope(raw: unknown)` →
  `{ ok: true; rows: Record<ExportCollection, Record<string, unknown>[]>; totalRows: number }`
  | `{ ok: false; error: string }`:
  - Top level must be an object; `format` must equal `DATA_EXPORT_FORMAT`
    (imported from the export seam — one source); `version` must equal
    `DATA_EXPORT_VERSION` (a FUTURE version → a clear "exported by a newer
    version" error; an older one → accepted, v1 is the only version).
  - `data` must be an object; every KEY must be a known collection (an
    unknown key → error naming it); a MISSING key → empty `[]` (the
    export's own "never branch on key-presence" promise, honored).
  - Each collection must be an array; each row must be an object with a
    non-empty string `id`.
  - `passwordHash`/`userId` are STRIPPED from every row (the import-side
    secret guard — mirror of `NEVER_EXPORT_FIELDS`; the importer's own id
    is re-attached by the route, never by the file).
  - Duplicate ids WITHIN a collection → error (a corrupt envelope).
  - **FK validation against the envelope's own id sets** (the P2003
    pre-emption, empirically mandated): a dangling OPTIONAL FK → **nulled**
    in the normalized row (the schema's own `onDelete: SetNull` semantics —
    the same thing that would happen if the referenced row was deleted); a
    dangling REQUIRED FK (`cards.deckId`) → error naming the collection +
    row id. Self-referential `folders.parentId` chains are CYCLE-CHECKED (a
    hand-crafted A→B→A must not reach the tree renderer).
  - `counts` and `user` and `exportedAt` are IGNORED (informational /
    re-derived / the import happens now) — tolerated if absent or stale.
  - Date values stay ISO strings (validated: Prisma accepts them as-is).
- `IMPORT_MAX_BYTES` — the documented body cap (10 MiB — 5× the largest
  realistic single-user envelope: 2 MiB of file payloads + content), shared
  by the route and the panel's client-side pre-check.

### S23-B (HIGH) — the route (`POST /api/import/data`)

`src/app/api/import/data/route.ts` (the S21 route pattern — auth, one
operation, clear JSON errors):

- `requireUser()` (401 JSON for anonymous callers — the API-route
  convention), then `checkRateLimit(`import:${user.id}`, 10)` (the S14
  seam; 429 + Retry-After on exhaustion — the login/register default
  budget: an import is a rare, heavy write).
- `await req.text()` → length-checked against `IMPORT_MAX_BYTES` → 413
  with the actionable message ("…re-export in parts or trim file
  payloads"), THEN `JSON.parse` (invalid JSON → 400).
- `parseImportEnvelope` → `!ok` → 400 with the seam's error (naming the
  first offending collection/row — actionable, not opaque).
- **One interactive `$transaction`** (60 s timeout — the 500-row probe ran
  in 300 ms; the headroom is free):
  - Collections in `EXPORT_COLLECTIONS` order (parents before children —
    the manifest is already topologically sorted).
  - Per row: `updateMany({ where: { id, userId: user.id }, data })` —
    count=1 → UPDATED (userId-scoped by construction; a foreign row is
    untouchable, validated); count=0 → `create({ ...data, id, userId })` —
    a cross-user id collision dies P2002 → the transaction rolls back →
    400 "row id X already exists under another account".
    - `cards` (no userId column): the update branch scopes through the
      relation — `updateMany({ where: { id, deck: { userId } }, data })`
      (validated: owned=1, foreign=0).
  - Row data = the seam's normalized row verbatim (ISO strings accepted;
    the explicit `updatedAt` PRESERVES the original timestamp — validated).
    Prisma is the final content validator: a missing required field /
    unique violation rolls the whole transaction back with the offending
    model in the message.
- Success → 200 `{ imported: Record<ExportCollection, { created: number;
  updated: number }>, created: number, updated: number, total: number }`
  (the per-collection report IS the result surface — no dry-run needed).
- Prisma error mapping rides the existing `errorResponse` (P2002/P2025
  already mapped; P2003 → the seam pre-empted it).

### S23-C (MEDIUM) — the panel extension (`src/components/export/export-panel.tsx`)

The `/export` page stays the portability hub (page.tsx UNTOUCHED — the
server gate + count snapshot + pinned metadata stay byte-identical; only
the client panel grows):

- A new `section[aria-label="Restore from a backup"]` BELOW the format
  card: a `<input type="file" accept="application/json,.json">` styled as
  the standard bordered row, a client-side pre-check (the file's size
  against `IMPORT_MAX_BYTES` — a friendly early error before any upload),
  an Import button (disabled until a file is picked / while busy), the
  busy state, and the RESULT card: the per-collection created/updated
  summary (the route's response rendered as the count-grid's own visual
  language) or the validation error verbatim (the seam's actionable
  message — the file's problem, stated plainly).
- The POST rides `apiSend("POST", "/api/import/data", parsedEnvelope)` —
  the file is read as text, parsed client-side (invalid JSON → an early
  inline error, no request), and sent as the JSON body.
- The footer's "Restoring is a deliberate non-feature" sentence is
  REWRITTEN (it is now a feature — docs alignment inside the touched file).
- Standard utilities only, the sf-card pattern, dark-mode via the existing
  `.dark` contract — NO new CSS (zero Tailwind v4 surface risk). Responsive
  to 390px. ZERO nav linkage (the shell stays 20 links — the existing s21
  zero-nav-linkage guard re-proves it).

### S23-D (MEDIUM) — the e2e pins (`tests/e2e/s23-import.spec.ts`)

The S21 spec conventions (demo-user storageState; ≤ 10 import POSTs total
— the rate-limit budget, counted: round-trip 1 + re-import 1 +
dangling-optional 1 + validation family 4 + panel journey 1 = 8):

1. **The round-trip:** POST a hand-crafted valid envelope (a subject + a
   task referencing it + a task with a DANGLING subjectId) → 200 with the
   expected summary (created counts); the rows land (GET the collection,
   the row is there, the dangling-FK row imported with `subjectId: null`).
2. **The idempotent re-import:** the SAME envelope POSTed again → 200,
   created=0 updated=N, and the row COUNT unchanged (upsert semantics
   pinned — an import never duplicates).
3. **The validation 400 family:** wrong `format` / future `version` /
   dangling REQUIRED FK (a card with an unknown deckId) / duplicate ids →
   400 with the actionable message; the database unchanged (the
   all-or-nothing rollback pinned: a count before/after).
4. **The anon API gate:** 401 JSON for anonymous callers (the AP-67
   explicit empty storageState).
5. **The panel journey:** the `/export` page renders the import card; a
   real `setInputFiles` with a valid envelope → the result summary renders
   with the created/updated counts.
6. **The page pins stay green:** the existing s21 spec re-proves the
   count grid / Download JSON / metadata / anon redirect / zero-nav-linkage
   untouched (no new pin needed — the regression net).

### S23-E (MEDIUM) — docs alignment

README (the data-portability feature row gains the import; the
`/api/import/data` API row; counts; the Project Status session-23 row; the
captures line), AGENTS.md (the import contract in Architecture facts + the
capture command + counts), CLAUDE.md (the contract + the S23 seam + the
S23 pins + counts), PAD (ADR-021 — the data-import contract with the
alternatives-rejected table: no dry-run / no replace-wipe mode / no
skip-existing / no natural-key merge / no Zod row schemas / no multipart /
no cross-account id remapping; the test-distribution table to the new
count), SKILL.md (the counts badge + an AP entry if lessons land),
DEPLOYMENT.md §8.2 (the restore walkthrough — "lost your db? re-register,
import your last export"), `.env.example` audited (unchanged — the import
reads no env vars), this plan's execution log, the session narrative +
transcript, `worklog.md`.

---

## TDD order

1. **RED unit** — `tests/data-import.test.ts` (pure, explicit args):
   - The happy path: a valid envelope (every key present) → ok, rows
     normalized, totalRows correct.
   - Missing `data` key / missing collection keys → ok, empty rows (the
     never-branch-on-presence promise).
   - Unknown collection key → error naming it.
   - Non-array collection / non-object row / missing-empty-nonstring id →
     error naming the row.
   - Wrong `format` / future `version` → error.
   - `passwordHash`/`userId` stripped from rows (the import-side secret
     guard — feed a row WITH both).
   - Duplicate ids within one collection → error.
   - Dangling OPTIONAL FK → nulled (tasks.subjectId, notes.notebookId,
     folders.parentId); dangling REQUIRED FK (cards.deckId) → error naming
     the row.
   - Folder parentId CYCLE (A→B→A) → error.
   - `counts` mismatch ignored; `user` block ignored (absent tolerated).
   - ISO date strings pass through untouched (the passthrough pin).
   - `IMPORT_FK_MAP` covers exactly `EXPORT_COLLECTIONS` (the
     completeness pin — a new collection without an FK entry fails the
     test, the INITIAL_COLLECTIONS pattern).
   - `IMPORT_MAX_BYTES` is 10 MiB (the documented cap pin).
2. **RED e2e** — `tests/e2e/s23-import.spec.ts` (the 6 pins above; the
   route/panel absent → failures as designed; the anon gate + the existing
   page render pass on arrival — correct-by-design).
3. **GREEN** — the seam → the route → the panel extension. Rebuild.
4. Full gate: `lint → typecheck → test → build → test:e2e` (cold
   `db/e2e.db`).
5. **Verification re-runs:** the standing drawer check; the clone Settings
   sweep (the import adds zero runtime chrome — boot/page surfaces
   untouched; the 269 prior pins are the regression net).
6. Evidence captures via the committed `scripts/capture-s23-evidence.mjs`
   (the S21/S22 pattern): the API round-trip proof (the import summary +
   the idempotent re-import + the validation-error family as JSON) +
   dev-server screenshots of the remediated codebase (the `/export` page
   with the import card — desktop light + DARK + mobile 390px, and the
   result state after a real import) → `docs/screenshots/s23-*.png|json`.
7. Docs (S23-E) + the commit pattern + the SSH-wrapper push.

## Risks

- **A mid-transaction failure leaves partial state** — impossible by
  construction (one interactive transaction; the probe validated the
  rollback). The route maps every Prisma error to a clear 400/409.
- **Cross-user corruption** — impossible by construction (the updateMany
  `userId` scope [count=0 on foreign rows, validated] + the create P2002
  collision guard [validated] + the transaction rollback).
- **The rate-limit budget vs the spec count** — the spec file makes 8
  import POSTs against a 10/15-min budget (2 spare); no other spec file
  POSTs the route; the server restarts fresh per run. Counted and
  documented.
- **Large-envelope memory** — the 10 MiB text cap bounds the JSON.parse;
  at single-user scale the platform body limits are the outer bound (the
  same posture as the 2 MiB upload cap).
- **The folder cycle** — pre-empted at the seam (the cycle check) before
  the tree renderer ever sees it.
- **The `/export` page pins** — the page.tsx and the pinned surfaces (h1,
  count grid, Download JSON, metadata) stay byte-identical; the import card
  is purely additive BELOW them; the s21 spec re-runs in the full suite as
  the regression net.

---

## Execution log (session-40 workspace run)

- **RED observed (both layers, exactly as designed):** the unit file
  failed to load (the absent `@/lib/data-import` module — 0 tests ran);
  all 5 chromium e2e specs failed against the pre-change build (the
  route answered 404; the panel lacked the Restore card).
- **GREEN — one honest test-file iteration (a TS cast parse error), zero
  implementation iterations:**
  1. `src/lib/data-import.ts` — the pure seam (the envelope identity
     shared with the export seam, the shape rules, the import-side
     secret guard, the FK pre-emption with the SetNull semantics, the
     folders parents-first topological sort + cycle rejection,
     `IMPORT_FK_MAP`, `IMPORT_MAX_BYTES`). 30/30 unit pins green
     first-try.
  2. `src/app/api/import/data/route.ts` — the route (auth → the S14
     rate limit → the text-then-cap body read → the seam → ONE
     interactive transaction with the userId-scoped
     updateMany→create upsert, `cards` scoped through the deck; the
     route-local P2002/P2003/P2012/P2013 mapping). One typecheck
     iteration (the Flashcard delegate cast).
  3. `src/components/export/export-panel.tsx` — the Restore card (the
     file picker with the client-side size pre-check, the busy state,
     the `role="status"` report / `role="alert"` error, the rewritten
     footer). page.tsx untouched — the pinned S21 surfaces
     byte-identical.
  4. Live dev-server sanity probe (throwaway): the import 200 + the
     per-collection summary, the idempotent re-import, the 400 family,
     the 401 anon gate, the landed rows with the dangling FK nulled,
     the cards required-FK 400 — all GREEN; the probe rows deleted
     through the app's own API.
- **Full gate GREEN:** lint ✓ tsc ✓ **245 unit ✓** (215 + 30) build ✓
  **274 e2e ✓** (cold `db/e2e.db`, 4.6 min — the 269 prior pins
  untouched) = **519 tests green**.
- **Verification re-runs GREEN:** the standing drawer check (all six
  checks true, both apps); the clone Settings sweep parity ✓; the
  reference dashboard re-sweep UNCHANGED ✓.
- **Evidence captured** (`scripts/capture-s23-evidence.mjs`, committed):
  `s23-import-roundtrip-evidence.json` (the first import's full
  per-collection summary, the idempotent re-import [created 0/updated
  3], the validation-error family [future version / dangling required
  FK / duplicate id → the actionable 400s], the rollback guard
  [tasksAfterImports === tasksAfterValidationFamily — the 400 family
  changed nothing], the probe cleanup) + four dev-server screenshots
  (the `/export` page with the Restore card — desktop light + DARK
  [themed through the production loadFromUser path] + mobile 390px, and
  the completed-import result state — "Imported 3 rows — 3 created, 0
  updated" + the per-collection list). VLM-verified: all four PASS via
  `scripts/vlm-verify-s23.mjs`.
- **Two honest capture iterations (AP-70):** (a) a `readChrome` promise
  raced the context close (fixed with an immediate await); (b) the
  rollback-guard baseline was contaminated by the capture's own earlier
  successful imports — the guard compared before-import vs
  after-validation and read `unchanged: false` until the baseline moved
  to after-the-successful-imports. A dev-server ZOMBIE (the `fuser -k`
  restart silently failed — EADDRINUSE on the new server, the original
  serving on with its exhausted in-memory rate limiter) produced
  phantom 429s mid-capture; killed by PID and restarted cleanly. All
  recorded as AP-70.
- **Docs aligned:** README (badge 519, the data-portability feature
  row's import clause, the `/api/import/data` API row, counts 245/274,
  the vitest seam list, the captures line [also completing the S22
  session's dangling "and the S22" truncation], the Project Status
  session-23 row), AGENTS (the import contract in Architecture facts +
  2 capture commands + counts), CLAUDE (the portability contract's
  restore clause + the S23 seam + the S23 pins + counts), PAD (ADR-021
  with the alternatives-rejected table; the test-distribution table to
  519 = 245 unit + 273 chromium + the 1 setup), SKILL (the 519 badge +
  AP-70), DEPLOYMENT.md §8.2 (the restore walkthrough). `.env.example`
  audited — unchanged (no new env vars: the import reads none).

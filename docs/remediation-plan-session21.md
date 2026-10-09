# Remediation Plan — Session 21 (S21): the full-data export (data portability)

**Audit surfaces (this session, session-36 workspace run at `36ef125`):** the
standing checks all ran GREEN on arrival — the baseline gates (lint ✓ tsc ✓
192 unit ✓ against the S20 codebase), the mobile-drawer check on BOTH apps
(backdrop `oklab(0 0 0/0.2)`+blur(4px), 288px white panel, 20 links, no
footer, Escape-close superset — the briefing's priority item; additionally
live-verified with agent-browser at 390×844: drawer opens as a dialog, a
drawer link navigates, the view renders, the drawer closes), the reference
re-sweep: **the reference is UNCHANGED since S19/S20** (zero-data account
0/0, all five Settings tabs matching every prior measurement — school
"Lincoln High", Daily Study Goal: 4 hours, Account created 9/28/2026, the
Notifications master toggle, the Subjects/Holidays zero-empty states, 20
nav views in the same order, the branding split stable), the clone-side
Settings sweep parity ✓, and the S20 code audit (the recent changes: the
`rum-diagnostics` seam, the `/api/rum` trends extension, the
`/api/rum/export` route, the panel sparklines, the s20 spec) reviewed
line-by-line — **CLEAN**. Docker re-verified unavailable in the sandbox
(`docker: command not found`); the first real `docker compose --profile
init up` stays the owner's documented step (DEPLOYMENT.md §8). The
CSRF posture re-reviewed: `SameSite=Lax` + non-GET mutations + httpOnly +
secure-in-prod — the documented adequate posture for this app (no gap).

**The governing decision.** With the parity backlog empty (the reference
unchanged) and the audit backlog empty (S20 clean), the session-34
narrative's "Next" list offers only the owner's Docker step (impossible
here). Per the brief's superset goal and its open-questions clause
("proceed with your best recommendations"), this session ships the
documented missing piece of the app's core promise — **data portability**:
README's overview says "your database, your AI keys, your deployment … a
codebase you fully own", yet there is NO way to get the user's own data
OUT of the app except raw SQLite-file access. The full-data export is a
pure functional superset (the reference has nothing like it) that adds
ZERO chrome to any parity-pinned surface: it follows the established
ADR-017 owner-surface pattern (URL-direct route, server-gated, zero nav
linkage, README + DEPLOYMENT documentation).

---

## Evidence (measured this session)

| Check | Result |
|---|---|
| Baseline gates (36ef125) | lint ✓ tsc ✓ 192 unit ✓ (the documented S20 state) |
| Mobile drawer (390×844, both apps) | GREEN — backdrop oklab(0 0 0/0.2)+blur(4px), 288px panel, 20 links, no footer, Escape-close |
| Mobile drawer live navigation (agent-browser) | GREEN — opens as a dialog, Flashcards link navigates, drawer closes |
| Reference account state | UNCHANGED since S19/S20 (zero-data, 0/0, profile values intact) |
| Reference Settings five-tab sweep | matches S17/S18/S19/S20 measurements exactly |
| Reference nav inventory | 20 views, same order |
| Clone Settings sweep | parity ✓ (five tabs, goal/created/master-toggle) |
| S20 code audit (seam/GET/export route/panel/spec) | CLEAN |
| Docker daemon | unavailable (re-verified) — the real run stays the owner's step |
| CSRF posture (SameSite=Lax + non-GET mutations) | adequate — no gap |

## Non-gaps (documented, do not fix)

1. **The reference is unchanged** — no parity surface exists to chase;
   verification-only parity work (all GREEN).
2. **No nav link to the export surface** — the sidebar/drawer/Settings are
   parity-pinned surfaces (20 links, five tabs). The export lives at the
   URL `/export` (owner-direct, documented in README + DEPLOYMENT.md §8.2),
   mirroring the `/rum` precedent. An e2e guard pins the shell
   `/export`-link-free.
3. **The login route stays un-instrumented** (S18 contract) and the RUM
   telemetry stays OUT of the JSON export (re-collectable diagnostics; the
   `/api/rum/export` CSV is the full RUM dump) — both documented decisions.
4. **The Docker real-run** remains the owner's step (no daemon here).
5. **No restore/import** — importing a JSON export back into the database
   is a deliberately REJECTED alternative (ADR-019): conflict resolution
   (what happens to rows created after the export?), idempotency, and
   partial-failure semantics make it a project of its own; the export
   fulfils the portability promise, and `db:push` + the seed remain the
   documented restore-from-file story.

---

## Families and fixes

### S21-A (HIGH) — the pure seam (`src/lib/data-export.ts`)

A new pure module, unit-pinned end-to-end:

- `DATA_EXPORT_VERSION = 1` and `DATA_EXPORT_FORMAT =
  "studyflow-data-export"` — the envelope identity (a future format change
  bumps the version; consumers can branch on it).
- `EXPORT_COLLECTIONS` — the ordered manifest of the 20 content
  collections: `subjects, taskLists, tasks, assignments, exams, events,
  timetableClasses, notebooks, notes, decks, cards, practiceTests,
  studyGroups, grades, focusSessions, folders, files, chatMessages,
  calcHistory, holidays` (Prisma relation names on the User model, kebab
  → camel wire keys). The ORDER is the export's stable contract.
- `DataExportUser` — the profile wire shape: `id, email, name,
  avatarEmoji, themeMode, accentColor, emailVerified, schoolName,
  gradeLevel, studyGoalHours, notificationsEnabled, createdAt, updatedAt`
  (dates ISO). **`passwordHash` is NOT in the shape** — the route selects
  explicitly and the seam's output is unit-pinned to never contain it.
- `serializeExportRow(row: Record<string, unknown>): Record<string,
  unknown>` — the generic row normalizer: DROPS `userId` (single-user
  implied), converts `Date` values to ISO strings, passes everything else
  through untouched (ids + FK fields ride for cross-referencing).
- `buildDataExport(user, collections, exportedAt: Date)` → the envelope:
  `{ format, version, exportedAt: ISO, user, counts: Record<collection,
  number>, data: Record<collection, serialized rows[]> }` — every
  collection key present (empty → `[]` + count 0), order per the manifest,
  rows passed through `serializeExportRow`.

### S21-B (HIGH) — the download route (`GET /api/export/data`)

`src/app/api/export/data/route.ts` — new:

- `requireUser()` (the API contract: 401 JSON for anonymous callers — not
  a redirect; same as every API route).
- The User record fetched with an EXPLICIT select matching
  `DataExportUser` (passwordHash never read).
- The 20 collections read in PARALLEL (`Promise.all`), each
  `where: { userId }`, `orderBy: { createdAt: "asc" } }` (chronological —
  the natural reading order for a backup). `cards` (Flashcard) has no
  userId column — scoped `where: { deck: { userId } }`.
- FileItem rows ride WHOLE (the base64 `data` payloads included — the
  files ARE the user's data; bounded by the 2 MiB/upload cap at
  single-user scale; the S13 data-volume posture).
- Response: `NextResponse.json(buildDataExport(...))` with the S13/S14
  download-header contract: `Content-Disposition: attachment` via
  `buildContentDisposition("studyflow-data-YYYY-MM-DD.json")` (the RFC
  2183 fallback + RFC 5987 extended form), `X-Content-Type-Options:
  nosniff`, `Cache-Control: private, no-store`.
- No rate limit (a read endpoint, auth-gated, single-user scale — the
  same posture as the RUM GET/export routes).

### S21-C (MEDIUM) — the owner-facing page (`/export`)

- `src/app/export/page.tsx` — a SERVER component mirroring the `/rum`
  pattern: `getCurrentUser()` + `redirect("/login")` (anonymous visitors
  never render panel chrome), `metadata.title "Export Your Data"` (rides
  the layout's title template), `robots: noindex` (auth-gated tooling —
  never a sitemap entry; the sitemap enumerates NAV_ITEMS + `/login`
  only). The page ALSO queries the per-collection counts server-side and
  passes them as props (the counts are a snapshot "as of this visit"; no
  client fetch needed).
- `src/components/export/export-panel.tsx` — the client panel (the
  `/rum` panel pattern): parallel `/api/auth/me` (theme via
  `useThemeStore.loadFromUser` — the production path on top of the
  pre-paint boot script) rendering:
  - the header (a `download`-icon block + "Export Your Data" + the
    one-line description),
  - the per-collection COUNT GRID (sf-card chips: collection label +
    row count, zero included — the "what's inside" summary),
  - the **Download JSON** anchor (`href="/api/export/data"` — a real
    navigation link; the session cookie rides it; no JS), styled like
    the /rum Export CSV action,
  - the format documentation (version 1 · JSON · what's included — the
    20 content collections with ids/foreign keys · what's excluded — the
    password hash, verification/reset tokens, RUM telemetry with the
    CSV pointer),
  - a "Back to app" link.
- sf-canvas/sf-card + standard Tailwind utilities only — NO new CSS
  (zero Tailwind v4 surface risk), responsive to 390px, themed (dark +
  the 7 accents) through the production path.
- ZERO nav linkage — the sidebar/drawer stay exactly 20 links (an e2e
  guard pins the shell `/export`-link-free); the owner navigates
  directly (README + DEPLOYMENT.md §8.2 document it).

### S21-D (MEDIUM) — docs alignment

README (the feature row + the `/api/export/data` API row + the captures
line + counts), AGENTS.md (the export contract + the capture command +
counts), CLAUDE.md (the S21 seam in the pyramid + counts), PAD
(ADR-019 — the data-portability contract with the alternatives-rejected
table: no restore/import, no CSV/zipped multi-file format, no per-
collection endpoints, no email delivery, no rate limit), SKILL.md (AP-69
if new lessons land), DEPLOYMENT.md §8.2 (the post-deploy "download your
data" walkthrough), `.env.example` audit (no new env vars — the export
reads none), this plan's execution log, `worklog.md`, the session
narrative + transcript.

---

## TDD order

1. **RED unit** — `tests/data-export.test.ts`:
   - `serializeExportRow`: drops `userId`; converts `Date` → ISO;
     passes ids/strings/numbers/booleans/null through untouched.
   - `buildDataExport`: the envelope shape (format/version/exportedAt);
     every manifest collection key present (empty input → `[]` + count
     0); counts match row counts; the collection ORDER equals
     `EXPORT_COLLECTIONS`; the user rides the `user` field.
   - The secret guard: `JSON.stringify(buildDataExport(...))` NEVER
     contains `passwordHash` (feed a user row that carries one — the
     output must drop it).
2. **RED e2e** — `tests/e2e/s21-data-export.spec.ts` (demo-user
   storageState; NO new registrations):
   - **the download round-trip:** `request.get("/api/export/data")` →
     200, `content-type` `application/json`, `content-disposition`
     attachment + filename, `nosniff`, `private, no-store`; the body
     parses; `format === "studyflow-data-export"`, `version === 1`; the
     seeded task title "Read chapter 4 — vectors" rides `data.tasks`;
     `counts.tasks >= 5`.
   - **the anon API gate:** a truly-anonymous context (the AP-67 explicit
     empty storageState) → `request.get("/api/export/data")` → 401.
   - **the page renders:** `page.goto("/export")` → the heading, the
     count grid (`data.tasks` count chip visible), the Download JSON
     anchor `[href="/api/export/data"]`, the metadata title.
   - **the anon page redirect:** `/export` → lands on `/login`.
   - **the zero-nav-linkage guard:** no `/export` link anywhere in the
     shell (the `/rum` guard's pattern, scoped to `/export`).
3. **GREEN** — the pure seam → the download route → the server page →
   the client panel. (No shell mount — nothing else changes.)
4. Full gate: `lint → typecheck → test → build → test:e2e` (cold
   `db/e2e.db`).
5. **Verification re-runs:** the standing drawer check; the clone
   Settings sweep (the export changes must not touch the shell).
6. Evidence captures: `/export` desktop light + dark + mobile 390×842 via
   the committed `scripts/capture-s21-evidence.mjs` (the S20 capture
   pattern) → `docs/screenshots/s21-*.png`; capture the downloaded JSON
   head as evidence.
7. Docs (S21-D) + the 3-commit pattern + the SSH-wrapper push.

## Risks

- **The page queries Prisma server-side** — the route is already dynamic
  (cookies via getCurrentUser); the counts read adds ~20 cheap COUNT
  queries on a single-user SQLite file (the S13 data-volume posture:
  measured bounds, no speculative caching).
- **The export reads ALL rows unbounded** — single-user scale by design
  (the whole table is the backup); the S13 volume audit measured 300+
  rows with zero main-thread blocking, and the response is a one-shot
  download (not a rendered list). No pagination (the data-volume
  convention).
- **FileItem payloads make the JSON large** — bounded by the 2 MiB/upload
  cap; full fidelity is the point of a backup. Documented in the panel
  copy.
- **`/export` vs the rewrite table** — no conflict: `next.config.ts`
  rewrites only the 20 PascalCase view paths; `/export` (lowercase) is a
  real route folder like `/rum` and `/login`.
- **The sitemap** enumerates NAV_ITEMS + `/login` only — `/export`
  cannot leak in (verified in `src/app/sitemap.ts`); `robots: noindex`
  on the page mirrors `/rum`.
- **The shell is untouched** — the s16 CLS pins + the byte-parity guards
  re-run in the full suite; the zero-nav-linkage guard pins the 20-link
  inventory.

---

## Execution log (post-completion)

**TDD observed.** RED unit: `tests/data-export.test.ts` — 9 designed
failures (the absent seam module — the import itself failed while
`src/lib/data-export.ts` did not exist). RED e2e:
`tests/e2e/s21-data-export.spec.ts` — exactly 4 designed failures
against the pre-change standalone build (the absent
`/api/export/data` route: the round-trip + the anon 401; the absent
`/export` page: the render + the anon redirect), with 2 passing on
arrival by design (the zero-nav-linkage guard + the 20-link inventory —
the shell correctly has no `/export` link BEFORE the change; the guard
pins the absence).

**GREEN (families):** the pure seam `src/lib/data-export.ts`
(`EXPORT_COLLECTIONS` the 20-collection manifest,
`serializeExportRow` the userId-dropped/Date→ISO normalizer,
`buildDataExport` the versioned envelope, `EXPORT_COLLECTION_LABELS`
the page's display map, the NEVER_EXPORT_FIELDS secret guard) → the
download route `src/app/api/export/data/route.ts` (the hashless
explicit profile select + the 20 parallel chronological reads + the
S13/S14 download-header contract) → the server page
`src/app/export/page.tsx` (getCurrentUser + redirect + metadata +
noindex + the server-side count snapshot) → the client panel
`src/components/export/export-panel.tsx` (the /rum panel pattern —
theme through the production path, the count grid, the Download JSON
anchor, the format documentation, responsive to 390px, no new CSS).

**No implementation iterations needed** — the tests were the spec and
the first implementation passed them (the S20 AP-68 lessons [the
floating-point form, the batch-cap trap] did not apply — no
exact-coordinate pins, no RUM probe posts in this session's tests).

**Gates.** lint ✓ · tsc ✓ · **201 unit ✓** (192 + 9 new) · build ✓ ·
**267 e2e ✓** (cold `db/e2e.db`, 4.3 min — the 262 prior pins
untouched; the 1 setup + 266 chromium = 267) = **468 tests green**.

**Verification re-runs.** The standing drawer check GREEN (re-run
post-change — backdrop + 288px panel + 20 links + no footer +
Escape-close on BOTH apps; additionally live-verified with
agent-browser at 390×844: the drawer opens as a dialog, a drawer link
navigates, the view renders, the drawer closes); the clone Settings
sweep parity ✓ (five tabs, goal/created/master-toggle — re-run
post-change); the reference re-sweep UNCHANGED since S19/S20 (the
committed ref-dash-sweep-s29 + ref-settings-sweep probes — run on
arrival); the live agent-browser walkthrough of `/export` on the dev
server (the count grid renders, the Download JSON action present).

**Evidence.** 4 captures via the committed
`scripts/capture-s21-evidence.mjs`: the `/export` page desktop light +
DARK (themed through the production loadFromUser path) + mobile
390×844 — each showing the 20 count cards + the Download JSON action,
mobile with NO horizontal overflow — + the downloaded JSON envelope
head (`s21-data-export-head.json`; the round-trip verified in-script:
200, application/json, the attachment disposition
`studyflow-data-2026-10-09.json` with the RFC 5987 extended form,
nosniff, private/no-store, 20 collections, 51 total rows, no
passwordHash). VLM-verified via the committed
`scripts/vlm-verify-s21.mjs` (all three PASS: the count grid + download
action render in every mode, the dark capture properly themed, the
mobile capture stacked with no overflow).

**Docs aligned.** README (badge 468, the data-portability feature row,
the `/api/export/data` API row, counts 201/267, the session-21 plan
row, the S21 captures line), AGENTS (the export contract + the capture
command + counts), CLAUDE (the portability contract + the S21 seam in
the pyramid + counts), PAD (ADR-019 with the alternatives-rejected
table; the test-distribution table to 468 = 201 unit + 266 chromium +
the 1 setup; the stale pre-push-checklist counts corrected 87+→201+ /
60+→267+), SKILL (the 468 badge), DEPLOYMENT.md §8.2 (the post-deploy
"take your data with you" walkthrough). `.env.example` audited —
unchanged (no new env vars: the export reads none).

# Remediation Plan — Session 29 (S29): the documentation-drift repair — align every doc layer's current-state claims with the codebase

**Audit surfaces (this session, session-57 workspace run at `9fda56e`):** the
standing checks all ran GREEN on arrival — the baseline gates (lint ✓ tsc ✓
258 unit ✓; `bun run build` ✓; the cold-`db/e2e.db` full e2e regression
**291 ✓ (4.6 min)** = the documented **549-green** state re-confirmed on
arrival), the mobile-drawer check (backdrop `oklab(0 0 0/0.2)` + blur(4px),
288px white panel, 20 links, no footer, Escape-close superset) **plus a live
agent-browser walkthrough at 390×844** (the app bar with the
Open-navigation-menu button + brand + live clock; the drawer opens as a
dialog with all 20 links; the Settings link navigates by ref — the documented
covered-element quirk; the Profile tab renders the S26 Email address card
above the S24 Change password + S25 Danger zone cards; scrollWidth 390 — no
horizontal overflow — **the mobile navigation menu is working as expected**),
the reference re-sweep (login + dashboard + Settings + Profile tab + MyDay at
390×844): **the reference is UNCHANGED since S19–S28** (the zero-data account
0/0, greeting from the email prefix, "Saturday, October 10, 2026"; the same
20 nav views in the same order; the "StudyFlow / Your study companion"
branding split in-app — the login page/document title "AcademiaFlow (Copy)"
is the documented platform-rename artifact, already captured by the
S19-era `ref-dash-sweep-s29.mjs` probe; the same five Settings tabs with
School name/Grade level/Daily Study Goal/Account created; the MyDay amber
greeting empty state), and the S28 code audit (the recent change: the
repaired `scripts/connectivity-audit.mjs` family A4 — reviewed line-by-line
lines 179–230: the alert scoped to the `div.shadow-2xl` card, the
stays-on-card guard, the button-recovered guard, the loud genuine-failure
criterion, the measured `{url, alert, button}` riding the verdict) —
**CLEAN**. The test configs + `DATABASE_URL="file:../db/custom.db"`
(`.env` created from `.env.example`; `db/` at the repo root; the `db:*`
scripts inline-anchored) + `.env.example` (matches the codebase, git-tracked)
verified current. The `skills/` catalog reviewed for the review/audit
tooling (`tdd`, `agent-browser`, `code-review`, `tailwind-patterns`).

The production-readiness sweep (the S22/S24/S27/S28 pattern — both backlogs
empty, so the standing superset goal governed) re-ran the full
standing-audit suite, every one GREEN with **zero code findings**:
security ✓ (0 findings, 7 nonGaps — the documented limiter shape `20x400
then 2x429; cutoffAt=21`; one clean dev-server restart after this session's
own double-run artifact, the session-55 lesson re-applied), settings-
roundtrip ✓ (0 failures), connectivity ✓ (0 findings — **the S28 repair
validated live**: "Login offline announces the failure through the S15
inline alert (stays on the card, button recovered)"), upload-edge ✓ (0),
data-volume ✓ (0 findings), forced-colors ✓ (0 invisible / 0 unbounded),
print ✓ (0), focus-order ✓ (0), CWV ✓ (CLS 0.00 everywhere; the documented
S16 state — throttled-mobile dashboard LCP NI 2624/2720 ms; the reference's
own mobile login POOR 7888 ms and its dashboard POOR/CLS 0.261), dark-sweep
✓ (**the S27 repair validated live**: MODE dark, flashbulb=0 unreadable=0
across all 20 views; the interrupted first accent sweep left the demo user
dark/orange — restored through the settings API and verified via Prisma),
accent-dark-sweep ✓ (0 FAIL findings; the residual `lowcontrast` entries are
the **documented S11 verified non-gap family** — the Calendar adjacent-month
days at 2.36 dark; verified against the reference in session-11; do not
"fix" byte-parity-pinned reference-measured surfaces), and the 20-view copy
sweep **14/20 MATCH** with the 6 remaining diffs all DATA-STATE (the
documented S17-pinned non-gap family — the zero-data reference account vs
the populated demo account).

## The governing decision (this session's work)

The sweep found ZERO code defects — every audit green, both backlogs empty,
the reference unchanged. The genuine defect family this session found is
**documentation drift**: current-state claims in the doc layers that no
longer match the codebase — the same integrity class as S27/S28 (a
validated-once artifact silently rotting under later change), this time in
the prose layer the sessions trusted without re-reading. The tell, same as
AP-73: **three different stale counts for the same quantity across layers**
— the schema has **24 models**, but the docs say "22 models" (written at
S18, forgetting the two S15 token models) in CLAUDE/PAD/README and "21
models" (the pre-S15 list) in SKILL §7. Every additive schema change
(S15 tokens, S18 RumEvent) landed without re-deriving the doc layers'
counts; the "update the right layer" convention was followed for the NEW
prose but never audited against the OLD prose.

Verified drift findings (each re-checked against the code this session):

1. **Model counts (S29-A, HIGH).** `prisma/schema.prisma` has **24 models**
   (grep-verified: 21 original + `VerificationToken` + `PasswordResetToken`
   [S15/ADR-013] + `RumEvent` [S18/ADR-016]). Claims of "22 models":
   `CLAUDE.md:147`, `Project_Architecture_Document.md:376/466/752`,
   `README.md:105/268`; "21 models" + the pre-S15 model list:
   `omni-study_SKILL.md:326`. The PAD §4.1 ER diagram (mermaid) also omits
   the two token relations. **The "all 22 user relations carry
   `onDelete: Cascade`" claims (CLAUDE.md:59, PAD:249, README:189) are
   CORRECT and stay untouched** — 23 non-User models minus the deck-scoped
   `Flashcard` (no userId column) = 22 direct userId Cascade relations,
   grep-verified; do not "fix" the correct number.
2. **False current-state claims in PAD (S29-B, HIGH).** §6.3 "Registration
   seeds three starter subjects" — false since S17/ADR-015 (registrations
   create ZERO subjects, the reference's own behavior). §9.3 "Docker
   Configuration: None — the repo ships no Dockerfile" — false since
   S18/ADR-016 (the multi-stage `Dockerfile` + `docker-compose.yml` ship in
   the repo root; layout validated outside Docker via
   `scripts/docker-layout-sim-s27.sh`; the first real
   `docker compose --profile init up` on a Docker host remains the open
   item). §5.4 Motion "no reduced-motion special-casing yet (see §11)" —
   resolved in S12/ADR-010 (the global reduced-motion collapse block; §11
   already says RESOLVED). §3.2's tree lists `src/hooks/ ← (reserved)` — no
   `hooks/` directory exists. "Last Updated: 2026-10-09" → 2026-10-10.
3. **Stale claims in SKILL.md (S29-C, MEDIUM).** §7 "21 models" + list
   (S29-A). §8 "Known gap (documented, open): no `prefers-reduced-motion`
   handling for the shimmer/slide keyframes" — resolved S12/ADR-010. §11
   "Current green state: lint ✓ · tsc ✓ · 106 unit ✓ · build ✓ · 194 e2e ✓"
   — the counts are thirteen sessions stale (current: 258 unit + 291 e2e =
   549 green; the SKILL frontmatter already says 549 — the §11 line is the
   pre-S19 residue). §5's drawer backdrop "bg-black/20 **backdrop-blur-sm**"
   — the class in `mobile-chrome.tsx:94` is **`backdrop-blur-xs`** (the S4
   trap-9 fix; blur(4px), e2e-pinned); the login card's blur is
   `backdrop-blur-xs` too (`login-card.tsx:383`).
4. **The scaffold-era comment in `vitest.config.ts` (S29-D, MEDIUM).** The
   header comment lists "router, clarify questions, plan sanitizer, check-in
   mapping, db-path resolution" — "clarify questions / plan sanitizer /
   check-in mapping" are seams of the ORIGINAL pre-clone scaffold app that
   never existed in StudyFlow. The actual unit layer: 17 files / 258 tests
   (router, theme, theme-cache, date, calculator, auth, validation, db-path,
   site, api-timeout, api-offline, http/content-disposition [files.test.ts],
   rum-diagnostics, data-export, data-import, env-check,
   view-collections). Comment-only change — zero behavior, zero config
   surface.
5. **The session record (S29-E, MEDIUM).** README gains the session-29
   status row + the captures line note; SKILL.md gains **AP-74** (the
   doc-drift lesson); the worklog entry + the session_57 narrative +
   session_58 transcript; PAD "Last Updated" bumped. No new ADR — a
   docs-alignment pass is not an architecture decision; the remediation
   plan + the AP entry carry the record.

### Non-gaps (documented, do not fix)

1. **"All 22 user relations carry `onDelete: Cascade`"** — verified TRUE
   (22 userId Cascade relations; `Flashcard` is deck-scoped through
   `FlashcardDeck`). The number 22 is correct HERE even though it is wrong
   in the model-count claims — the fix must touch one and not the other.
2. **The README phase-table rows** — per-session history; only the
   "Codebase build (20 views, 22 models, 40+ endpoints)" row's model count
   is updated (it describes the codebase-build phase's deliverable as it
   stands; a reader today gets 24). The per-session rows (S2–S28) stay
   byte-identical.
3. **The reference's "AcademiaFlow (Copy)" login/title branding** — the
   documented platform-rename artifact (captured by the S19-era
   `ref-dash-sweep-s29.mjs` probe); the reference's IN-APP branding is
   still "StudyFlow / Your study companion" (drawer-verified this session).
   The clone deliberately keeps its StudyFlow branding — no parity surface
   exists to chase.
4. **The accent-dark-sweep residual `lowcontrast` entries** — the S11
   verified non-gap family; fixing them would break byte-parity on
   reference-measured surfaces.
5. **The 20-view copy-sweep data-state diffs (6/20)** — the documented
   S17-pinned non-gap family (the zero-data reference account vs the
   populated demo account).
6. **`01-login.png` + the per-session evidence pairs in
   `docs/screenshots/`** — untouched; only the standing 31 refresh per the
   brief.

---

## Families and fixes

### S29-A (HIGH) — the model-count alignment (CLAUDE.md, PAD, README, SKILL.md)

One truth everywhere: **24 models = 21 original + VerificationToken +
PasswordResetToken (S15) + RumEvent (S18)**; 22 of the 23 non-User models
carry direct userId Cascade relations (Flashcard is deck-scoped).

- `CLAUDE.md:147` — "20 views over 22 models" → "20 views over 24 models".
- `Project_Architecture_Document.md:466` (§4.1) — "Twenty-two models" →
  "Twenty-four models (22 with direct `userId` Cascade relations; Flashcard
  is scoped through its deck — the documented S7 nesting)". The §4.1 ER
  diagram gains the two token relations:
  `User ||--o{ VerificationToken : "one-shot (S15)"` and
  `User ||--o{ PasswordResetToken : "one-shot (S15)"`.
- `Project_Architecture_Document.md:376` (§3.2 tree) — "22 models" →
  "24 models".
- `Project_Architecture_Document.md:752` (§12 key files) — "22 models" →
  "24 models".
- `README.md:105` (file hierarchy) — "22 models" → "24 models".
- `README.md:268` (phase row) — "22 models" → "24 models".
- `omni-study_SKILL.md:326` (§7) — "21 models" + the stale list → "24
  models" + the full current list (adding RumEvent, VerificationToken,
  PasswordResetToken to the enumeration).

### S29-B (HIGH) — PAD's false current-state claims

- §6.3 (`Project_Architecture_Document.md:579`): "Registration seeds three
  starter subjects." → "Registration creates the account with ZERO starter
  subjects (S17/ADR-015 — the reference's own measured behavior; the seeded
  demo account carries the showcase)." (The sentence directly contradicts
  ADR-015 today.)
- §9.3 (`:677`): "None — the repo ships no Dockerfile…" → the S18 truth:
  the multi-stage `Dockerfile` (prod-deps → build → bun runtime; the
  `rm -rf /app/db` guard) + `docker-compose.yml` (SQLite on the /data
  volume via the absolute `file:/data/custom.db` URL; AUTH_SECRET required
  at boot; the `init` profile pushes schema + seeds; healthcheck on
  /api/health), the layout validated end-to-end OUTSIDE Docker
  (`scripts/docker-layout-sim-s27.sh`); the first real
  `docker compose --profile init up` on a Docker host remains the open
  verification step.
- §5.4 (`:554`): "no reduced-motion special-casing yet (see §11)" → the
  S12 truth: the global `@media (prefers-reduced-motion: reduce)` collapse
  block (ADR-010) — resolved; §11 already carries the RESOLVED row.
- §3.2 tree (`:374`): drop the `hooks/ ← (reserved)` line (no such
  directory exists in `src/`).
- Header (`:6`): "Last Updated: 2026-10-09" → "2026-10-10".

### S29-C (MEDIUM) — SKILL.md's stale claims

- §7: covered by S29-A.
- §8 (`:380`): replace the "Known gap (documented, open)" line with the
  resolved state — the S12 global reduced-motion collapse block
  (ADR-010; pinned by `tests/e2e/accessibility.spec.ts`).
- §11 (`:510`): "Current green state: lint ✓ · tsc ✓ · 106 unit ✓ ·
  build ✓ · 194 e2e ✓." → "…258 unit ✓ · build ✓ · 291 e2e ✓ (549 green)."
- §5 (`:280`): the drawer backdrop "bg-black/20 backdrop-blur-sm" →
  "bg-black/20 **backdrop-blur-xs**" (the S4 trap-9 fix — v4's
  `backdrop-blur-sm` is 8px; the reference measures 4px; e2e-pinned at
  `blur(4px)`).

### S29-D (MEDIUM) — the `vitest.config.ts` scaffold-era comment

Replace the header comment's seam list ("router, clarify questions, plan
sanitizer, check-in mapping, db-path resolution") with the actual
StudyFlow unit layer (17 files / 258 tests). Comment-only — the config
object itself is untouched (the `include`, `environment`, and alias are
current and correct; `src/**/*.test.ts` matches nothing today — all 17
files live under `tests/` — and the include stays as shipped: zero behavior
change, zero risk).

### S29-E (MEDIUM) — the session record

- README: the session-29 status row + the captures line note.
- SKILL.md: **AP-74** (MEDIUM — the doc-drift lesson: counts in prose rot
  under additive change; the tell: multiple layers carrying different
  stale values for the same quantity; the guard: on every additive schema
  change, grep EVERY doc layer for the quantities it repeats — model
  counts, test counts, capture counts — and prefer deriving from the
  executable truth over hand-maintained constants; docs are the repo's
  findings array — read them, don't trust the last session's summary).
- `worklog.md` (repo root): the S29 entry.
- `docs/session_57.md` (narrative) + `docs/session_58.md` (transcript) —
  the file-counter convention (files 1–56 exist; this workspace run is
  session 57).

## TDD order

Docs-only changes — no app code, no CSS, zero Tailwind v4 surface, zero
parity-pinned bytes, no test files touched. The TDD doctrine applies to
code; for prose the loop is **verify → fix → re-verify against the
executable truth** (every claim re-derived from the codebase: the schema
grep for counts, the source grep for classes, the config read for
comments), and the regression confirmation is the full gates re-run:

1. **RED (observed, captured):** every drift finding above, verified
   against the code this session (the grep evidence: 24 models /
   22 userId-Cascade relations / `backdrop-blur-xs` at
   mobile-chrome.tsx:94 + login-card.tsx:383 / no `src/hooks/` / the
   S17 zero-subjects behavior / the S18 Dockerfile / the S12
   reduced-motion block / 549 green).
2. **GREEN:** apply S29-A..E; re-grep every touched claim — each returns
   the codebase truth; no doc layer carries a stale count.
3. **Full gates re-run:** lint → typecheck → 258 unit → build → cold-db
   291 e2e — the regression confirmation that nothing but prose moved
   (the vitest.config.ts change is comment-only: the config hash of
   behavior is identical).
4. **Standing checks re-run:** the drawer check GREEN post-change; the
   standing 31 screenshots refreshed via `capture-studyflow.mjs`
   (24 light + 7 dark; theme restored light; the dev server restarted
   cleanly by PID first — the AP-70 lesson); the S29 evidence set captured
   under `docs/screenshots/`.

**Rejected alternatives:** doc-grep unit pins (brittle — prose rephrasing
would break tests that verify nothing about behavior; the docs are not an
executable surface); a schema-count unit pin (it would guard the SCHEMA,
but the drift was in the DOCS — the pin verifies the wrong artifact; the
schema is already guarded by `db push` + the e2e suite); rewriting the
README phase-table history rows (they are a log — only the current-state
"Codebase build" row's count is aligned); renumbering ADRs (no
architecture decision changed — a docs pass is not an ADR).

## Risks

- **The 22/24 split is the trap**: the SAME number 22 is CORRECT in the
  "user relations" claims and WRONG in the "models" claims. The fix must
  change exactly one family — the plan lists every line number to touch
  and every line number to leave (CLAUDE.md:59, PAD:249, README:189 stay).
- **No parity surface is touched** — the changes are prose + one comment;
  the 291 e2e pins and every byte-parity pin are untouched by construction
  (verified in the gates re-run).
- **The standing screenshot refresh must restart the dev server cleanly by
  PID first** (the AP-70 lesson) and restore the demo preference to light
  (verified via Prisma after the run).

## Execution log (session-57 workspace run)

- Baseline on arrival: the documented 549-green state re-confirmed (lint ✓
  tsc ✓ 258 unit ✓ build ✓ cold-`db/e2e.db` 291 e2e ✓ 4.6 min); the
  standing checks FIRST, all GREEN (the drawer probe + the live
  agent-browser 390×844 walkthrough — app bar, drawer dialog with 20 links,
  Settings navigation by ref, the S26/S24/S25 cards on the Profile tab, no
  overflow; the reference re-sweep UNCHANGED since S19–S28 incl. the
  20-view copy sweep at 14/20 MATCH with 6 data-state non-gaps; the S28
  connectivity-audit change audited line-by-line CLEAN).
- The production-readiness sweep (the S22/S24/S27/S28 pattern) re-ran the
  full standing-audit suite — every audit GREEN with ZERO code findings
  (security ✓ after one clean dev-server restart resolved this session's
  own double-run artifact — the session-55 lesson; settings-roundtrip ✓;
  connectivity ✓ with the S28 repair validated live; upload-edge ✓;
  data-volume ✓; forced-colors ✓; print ✓; focus-order ✓; CWV ✓ at the
  documented S16 state; dark-sweep ✓ with the S27 repair validated live —
  the interrupted first accent sweep left the demo user dark/orange,
  restored through the settings API and verified via Prisma;
  accent-dark-sweep ✓ with the residual lowcontrast entries = the
  documented S11 non-gap family). The governing finding: the genuine
  defect family was the PROSE layer — the doc-drift evidence gathered and
  grep-verified (24 models vs the documented 22/21; PAD's three false
  current-state claims; SKILL's stale §8/§11/§5 claims; the
  scaffold-era vitest.config.ts comment, which also carried a stale
  `scripts/smoke-test.sh` reference discovered during the fix).
- **TDD RED** (captured): the grep evidence above, each claim re-derived
  from the executable truth (schema grep: 24 models / 22 userId-Cascade
  relations; source grep: `backdrop-blur-xs` at mobile-chrome.tsx:94 +
  login-card.tsx:383; no `src/hooks/`; the S17 zero-subjects behavior; the
  S18 Dockerfile; the S12 reduced-motion block; 549 green).
- **The fixes applied** (S29-A..E): CLAUDE.md:147 (24 models + the
  22-relation/Flashcard note); PAD (Last Updated 2026-10-10; §4.1
  twenty-four models + the ER diagram's two S15 token relations; §3.2 tree
  24 models + the hooks line removed; §5.4 reduced-motion resolved S12;
  §6.3 zero-subjects registration; §9.3 the shipped Docker config; §12 24
  models); README (105/268 24 models; the session-29 status row; the
  captures line note); SKILL.md (§5 backdrop-blur-xs; §7 24 models + the
  full list; §8 reduced-motion resolved; §11 549 green; AP-74);
  vitest.config.ts (the StudyFlow seam-list comment; the smoke-test.sh
  claim dropped).
- **TDD GREEN** (captured): the re-grep across AGENTS/CLAUDE/PAD/SKILL/README
  returns zero stale model-count claims; the remaining backdrop-blur-sm
  mentions are the trap-9 explanations (correct context); the "all 22 user
  relations" claims verified present and untouched (CLAUDE.md:59, PAD:249
  [all 22], README:189).
- **Gates re-run**: lint ✓ tsc ✓ 258 unit ✓ build ✓ — the first e2e run
  hit the persistent-e2e-db artifact on
  tests/e2e/s23-import.spec.ts:61 (the fixed envelope ids: created→updated
  on a second run against the same db — NOT a code defect); resolved by
  the documented cold-db convention (`rm db/e2e.db`), the S27/S28
  operating rule → **291 e2e ✓ cold-db 4.7 min = 549 green**, the 291
  prior pins untouched by construction (no app code touched).
- **Standing checks re-run post-change**: the drawer check GREEN; the
  standing 31 screenshots refreshed via capture-studyflow.mjs (29
  byte-changed + 01-login/dark-Login byte-identical; theme restored
  light; the dev server restarted cleanly by PID first — the AP-70
  lesson); the per-session s2X evidence pairs untouched (verified in git
  status); the S29 evidence set captured
  (docs/screenshots/s29-doc-alignment-evidence.json).
- Docs aligned: this plan with execution log + the session_57 narrative +
  the worklog entry; the session_58 transcript follows the push (the
  S27/S28 commit pattern).

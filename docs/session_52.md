# Session 52 — the S27 session log

I'll continue the task from where the previous session left off. The
workspace had been reset, so the repo was freshly cloned to `301fd90`
(the S26 push `57a4bb9` + the two session-log updates `702cf7f`/`301fd90`).
Dependencies installed, `.env` created from `.env.example`
(`DATABASE_URL="file:../db/custom.db"` — the documented contract, the `db/`
folder at the repo root), the schema pushed + seeded, the dev server
started on :3000.

The review docs read in order: AGENTS.md, CLAUDE.md, README.md, the
Project_Architecture_Document, the SKILL; then session_50 (the S26 session
log), remediation-plan-session26, the repo worklog (the S26 entry),
session_51 (the S26 transcript). The S26 seams verified present + audited
line-by-line — CLEAN (the `changeEmailSchema` seam, the
`POST /api/auth/change-email` route, the panel's Email address card, the
store's `setEmail` action, the specs). The test configs +
`DATABASE_URL="file:../db/custom.db"` + `.env.example` (matches the
codebase, git-tracked) verified current — the brief's items already the
documented state.

Baseline gates matched the documented state: lint ✓ tsc ✓ 258 unit ✓
build ✓ — plus the cold-`db/e2e.db` full e2e regression 291 ✓ (4.4 min) =
the documented 549-green state re-confirmed on arrival.

The standing checks FIRST (the brief's priority item): the mobile-drawer
check GREEN on both apps — **plus a live agent-browser walkthrough at
390×844** (the app bar renders with the Open-navigation-menu button +
brand + live clock; the drawer opens as a dialog with all 20 links; the
Settings link navigates; the Profile tab renders the S26 Email address
card above the S24 Change password + S25 Danger zone cards; scrollWidth
390 — no horizontal overflow). **The mobile navigation menu is working as
expected.** The reference re-sweep (the dashboard probe + the five-tab
Settings probe + the 20-view copy sweep): **UNCHANGED since S19–S26**
(the zero-data account 0/0, school "Lincoln High", Daily Study Goal:
4 hours, Account created 9/28/2026, 20 nav views in the same order, the
branding split stable; the copy sweep 14/20 MATCH with the 6 remaining
diffs all DATA-STATE — the documented S17-pinned non-gap family). The
clone-side Settings sweep: parity ✓. The scandihaven repo re-reviewed —
unchanged since 10-04 (`d4789c3`), no new patterns. Docker re-verified
unavailable (the owner's documented step).

The governing decision: both backlogs empty + the standing superset goal
→ a production-readiness sweep (the S22/S24 pattern) governed. The sweep
re-ran the full standing-audit suite — security ✓, settings-roundtrip ✓,
connectivity ✓, upload-edge ✓, data-volume ✓ (0 findings, 750 probe rows
inserted + cleaned), forced-colors ✓ (1 hit = the Events view's
deliberately hidden `aria-hidden` `sr-only` date trigger — a non-gap),
print ✓, focus-order ✓ (the dev-mode NEXTJS-PORTAL artifacts only), CWV ✓
(CLS 0.00 everywhere; throttled-mobile dashboard LCP NI — the documented
S16 state; the reference's own mobile login POOR 7.4 s), and
accent-dark-sweep ✓ (its residual LOWCONTRAST hits are the documented S11
verified non-gap family: accent CTA faces, adjacent-month dimming,
subject class-card colors, muted type pills).

**The sweep found exactly ONE genuine defect — of the tooling-integrity
class (the AP-69/AP-70 family): `scripts/dark-sweep.mjs`, the standing
AGENTS.md-documented dark-mode audit tool, had silently stopped auditing
dark mode after the S11 theme-lifecycle change.** Run today it swept in
LIGHT mode: `MODE:` printed empty, and the detectors reported 97 false
"flashbulbs" (ordinary white cards) + 7 false "unreadable" flags — the
reference-measured muted surfaces (the amber `medium` priority pill at
1.85, the Calendar adjacent-month slate-300 days at 1.48) — findings that
would have invited parity-breaking "fixes". Root cause (two stacked
defects, both verified): the probe forced the mode by
`classList.add("dark")` + `localStorage.setItem("sf-theme-mode", …)` — a
key read by NOTHING in the codebase (the S11 boot script reads
`sf-theme`), so the forced class had no cache backing across the very
next full load — AND the auth-correction window (the demo user's stored
`themeMode` is `light`) re-applied the user's preference on every load,
removing the class before the first view was probed. **S27: the
dark-sweep repair + the self-verifying precondition.**

Plan saved to `docs/remediation-plan-session27.md` and validated against
the codebase: the PATCH pattern verified against accent-dark-sweep +
capture-studyflow (the API convention); the real cache key verified in
`src/lib/theme.ts` (`THEME_CACHE_KEY = "sf-theme"`); the demo user's
stored preference verified via Prisma (`light`); the stale key grepped —
read by nothing.

TDD — the probe-script form (execution-validated, the drawer-check
convention): **RED** observed and captured (MODE empty, flashbulb=97 +
unreadable=7 across 20 views measured in light mode; the per-view
false-positive table + the 7 false-unreadable entries characterized).
**GREEN — zero implementation iterations**: the mode-forcing block
replaced (PATCH the settings API → polled `waitForFunction(dark)` → the
self-verifying mode read), the loud-failure guards on all three
precondition paths, the `{ mode, views }` output envelope, the awaited
light-restore before close. The CHECKER probe and its thresholds
byte-identical; ZERO app code touched. Re-run: `MODE: dark` +
flashbulb=0 unreadable=0 across all 20 views in REAL dark mode — the
session-10 post-fix state, consistent with the S11 non-gap family
(2.15–3.07) sitting above the <2.2 bar. The demo user's preference
verified restored to light via Prisma. **The negative control**: a
scratch copy with a never-true wait injection (deleted after) → exit 1,
the `DARK-SWEEP PRECONDITION FAILED` stderr line, EMPTY stdout — the
guard's exit path validated.

Gates re-run: lint ✓ tsc ✓ 258 unit ✓ build ✓ **291 e2e ✓** (cold
db/e2e.db, 4.8 min) = 549 green, the 291 prior pins untouched by
construction. The mobile-navigation spec green in the full suite.

Verification re-runs: the drawer check GREEN post-change; the dev server
restarted cleanly by PID first (the AP-70 lesson) before the captures.

Evidence: the standing 31 screenshots refreshed via
`scripts/capture-studyflow.mjs` (24 light + 7 dark; theme restored to
light); the per-session evidence pairs (s2X-*.png) stayed byte-identical
(no restoration needed — the S26 lesson checked).
`docs/screenshots/s27-dark-sweep-evidence.json`: the before-state (the
per-view false-positive table + the false-unreadable entries) + the
after-state (mode dark, all 20 views clean) + the guard's
negative-control exit + the restore proof + the gates + the walkthrough
summary.

Docs alignment: AGENTS (the dark-sweep entry — the self-verifying
precondition + the API pattern + the never-force-the-class warning),
README (the session-27 status row + the captures line), PAD (ADR-025 with
the root-cause analysis + the alternatives-rejected table), SKILL (AP-72
— the tooling-rot lesson: every probe sets state through the real
application path, self-verifies its precondition, fails loudly with no
findings, and rides the applied state in its output), CLAUDE (the
audit-tools-self-verify principle). `.env.example` audited — matches the
codebase, git-tracked (included in the commit per the brief).

Then the commit phase: the feat commit to main — pushed via the SSH
wrapper (`docs/ssh_git_wrapper_v3.py`), remote verified, the operator key
shredded after.

## Session Complete ✅

**S27 — the dark-sweep audit-tool repair (the self-verifying
precondition) — pushed to `main`**, 549 tests green (258 unit + 291 e2e,
cold-DB full regression; no app code touched — the 291 prior pins
untouched by construction).

**What this session did:**

1. **All standing checks GREEN on arrival** — the mobile navigation menu
   verified working (the drawer probe + a live agent-browser walkthrough
   at 390×844), the reference re-swept **UNCHANGED since S19–S26**, the
   S26 code audited clean, the 549-test regression re-confirmed,
   `DATABASE_URL="file:../db/custom.db"` + the test configs +
   `.env.example` verified current.

2. **Governing decision**: with both backlogs empty, the
   production-readiness sweep re-ran the full standing-audit suite and
   found the ONE genuine defect — the dark-sweep audit tool had silently
   rotted after the S11 theme lifecycle (sweeping in LIGHT mode, emitting
   97 phantom flashbulbs + 7 phantom unreadable flags). Repaired with the
   probe-script TDD form: the API-driven mode forcing (the real
   lifecycle), the self-verifying precondition (fail loudly, emit no
   findings), the `{ mode, views }` self-describing output, the awaited
   state restore.

3. **The doctrine** (ADR-025/AP-72): a probe sets state only through the
   real application path, asserts its own precondition, and fails loudly
   — silent tooling rot under app change is now a documented, guarded
   failure mode.

**Suggested next steps**: the remaining open item stays the first real
`docker compose --profile init up` on the owner's Docker host. The
superset story now covers observability + portability + fail-fast boot
hygiene + the complete account arc + audit-tool integrity; scheduled
backups and a pre-push secret-scan gate remain documented ADR
rejections, revisitable on request.

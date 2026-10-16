# Session 152 — S57 narrative: the AP-90 pre-mount gate race — the two-spec e2e hardening

The S57 session (2026-10-16) — the standing arrival audit on the
S56-closed codebase, which produced the project's first observed e2e
flake in two sessions (298/299 on the baseline run), root-caused it to
the documented AP-90 race class, and closed it as a two-spec
test-code-only fix with the 1133 gate restored and the standing suite
re-run as the confirmation. Zero app-code findings; the reference
re-swept unchanged; the mobile navigation verified working with no
Tailwind v4 bug.

## The arrival — the fresh-clone rebuild (the workspace had been reset)

The workspace had been RESET — the S52/S53/S55 fresh-clone recipe: clone
at `ce97049` (the post-S56 doc-only commit — session_151, the S56
process log, verified by `git show --stat`: 1 file, +70), `bun install`
489 packages, `.env` from `.env.example` (DATABASE_URL
`file:../db/custom.db` + AUTH_SECRET ""), `db:push` + `db:seed` (the
demo user `demo@studyflow.app` + the sample data), and the documented
`bunx playwright install chromium` step — the v1243 headless shell this
time, matching the Playwright 1.63 pin (the S55 session had to install
it over a stale 1200 cache).

The five core docs re-read (AGENTS: the commands, the DATABASE_URL
contract, the 13 Tailwind v4 traps, the testing quirks, the S32 daemon
recipe; CLAUDE: the identity + the six-phase workflow + the test
pyramid; README: the session table through session-56 + the design
system; PAD: the 26 ADRs + the test distribution; SKILL: the 20
sections + the AP-index), then the S56 baseline docs (session_149/150/
151, the S56 plan with its execution log, the worklog tail). The
understanding validated against the codebase: the count anchors
1133/834/299, the last app-code change = the S52 four-file fix, the
last test-code change before this session = the S55 three-file e2e fix.
The repo `skills/` catalog consulted for the audit tooling (the
agent-browser, TDD, clone-app-pat-pro, and Tailwind v4 skills — the
trap documentation that guided the mobile walkthrough below).

## The baseline, run 1 — the flake appears (F1)

The gates ran in the documented order: lint ✓, tsc ✓, **834 unit ✓**
(20 files, 3.34 s), build ✓ — and then the cold-`db/e2e.db` e2e read
**298/299**:

```
1) [chromium] › tests/e2e/parity-session8.spec.ts:41:7 ›
   S8-A · Sidebar chrome › nav icons match the reference's lucide set
   Error: expect(received).toHaveLength(expected)
   Expected length: 20
   Received length: 0
```

911 ms, no timeout — the signature of a read that executed against an
absent DOM, not of a broken app surface. The S56 baseline had been
299/299 byte-for-byte, and no app code had changed since.

## The investigation — from flake to mechanism

**Step 1 — the isolation runs.** The single spec re-run in isolation:
PASS. A 10× cold single-spec loop (fresh server + fresh `db/e2e.db` per
iteration, mirroring the flake conditions): **10/10 PASS**. The race is
rare without the full run's accumulated memory pressure — the honest
characterization is 1 live failure in 3 full-context runs.

**Step 2 — the code read.** `src/app/page.tsx` holds the answer. The
auth effect resolves `/api/auth/me` and the initial-collections
pre-warm **in parallel**, then:

```ts
const { user } = await apiGet("/api/auth/me");
loadFromUser(user);            // → applyToDocument → --sf-primary set HERE
if (dataPromise) await dataPromise;   // the pre-warm still pending
setStatus("authed");           // the shell (<Splash/> → app) flips HERE
```

The theme observable (`--sf-primary` on `<html>`) is applied BEFORE the
pre-warm settles — by design, so a returning user never sees an
unthemed frame — while the shell mounts only after BOTH settle (the
S16-A no-CLS Splash→shell replacement). The spec's `hydrated()` gate
waits on exactly that theme observable, then immediately reads
`nav a svg` via `evaluateAll` (which does not auto-wait). Under the
full run's load, the pre-warm occasionally resolves late: the gate
passes on the Splash, the read returns 0 icons.

This is the **documented AP-90 lesson** — "a wait condition satisfiable
PRE-MOUNT is not a gate for POST-MOUNT reads" — previously applied to
the S43 sweep probes and their S41/S42 siblings, but never
back-ported to these two e2e specs. The scan of the whole e2e tree
found exactly two specs with the pattern (a non-auto-waiting shell-DOM
read directly after a pre-mount-satisfiable gate): the S8-A icons pin
(F1) and the S12-B first-Tab-stop pin in `accessibility.spec.ts` (F2 —
its `gotoMode` mode wait is satisfiable at first paint by the
pre-hydration boot script, so a pre-mount `Tab` lands on `<body>`).

**Step 3 — the deterministic reproduction (RED).** A throwaway
diagnostic spec (run, then deleted): `page.route` delaying ONLY the
five Dashboard pre-warm endpoints (`/api/tasks`, `/api/assignments`,
`/api/exams`, `/api/focus-sessions`, `/api/subjects`) by 600 ms while
`/api/auth/me` stays fast — exactly the race condition, widened:

- **F1 RED**: `shell present at gate-pass: false; icons read: 0` —
  the assertion failing byte-identically to the live full-run failure.
- **F2 RED**: the first Tab stop read `BODY "Loading StudyFlow…"` —
  the latent twin, proven before it ever flaked in CI-by-hand.

## The fixes (TDD — the smallest safe diff)

The documented AP-90 guard, folded into both specs with the mechanism
in the comments:

```ts
await page.waitForFunction(() => !!document.querySelector("aside nav"));
```

before the icons `evaluateAll` (parity-session8.spec.ts) and before
the `Tab` press (accessibility.spec.ts). Assertions unchanged; pin
counts unchanged; +14 lines across two files; **zero app code** — the
S55 precedent (harden the gate, touch nothing else) applied to the
AP-90 class.

**The GREEN proof**: the same diagnostic re-run with the fixed gate
shape under the IDENTICAL 600 ms delay — F1 reads **20/20 icons**, F2
reads **`A "Skip to main content"`**. The fix defeats the race, not
just the symptom. The diagnostic deleted.

**The gate re-run**: the full cold e2e — **299 passed (4.6 min)** —
plus the already-green lint/tsc/unit/build = **1133 green**, the count
anchors restored byte-for-byte.

## The standing checks — every axis GREEN

The dev daemon via the S32 recipe (health 200), the preflight GREEN
(hydrated + navigation-stable), the drawer-check GREEN (backdrop/
panel/links/footer + Escape-close).

The live agent-browser 390×844 walkthrough on the clone (the named
session): login → `scrollWidth` 390 → the sidebar hidden + the burger
visible → the drawer open: **20 links in the reference href order**, the
nav scrollable **1068 vs 755** → **trap 4 clean** (the nav UL
`flex flex-col gap-1`: display flex / gap 4px / column / zero margin
children) → **trap 9 clean** (the backdrop `blur(4px)`) → **trap 7
clean** (`bg-black/20` serializing `oklab(0 0 0 / 0.2)`) → the active
link **violet-600 `rgb(124, 58, 237)`** + the **violet→indigo 10%
gradient** + the trailing **violet-500 dot `rgb(139, 92, 246)`** →
Notes navigated through the drawer → **auto-close** → the drawer
re-opened → **Escape-close**. The mobile navigation menu is working as
expected; NO Tailwind v4 bug found.

The desktop states at 1280×800: expanded **aside 260 / main ml 260 /
main width 1020**; collapsed **80/80/1200** with the 20 icon-only links
**svgX 33**, the **empty footer** (0 children), the glyph
**`rotate: 180deg`** (v4's rotate property ≡ the reference's rotate-180
matrix), `sf-sidebar-collapsed` persisted; the shared collapsed drawer
at 390×844: the **288px panel**, icon-only **svgX 32**, nav scrollable
**988 vs 755**. The preference restored to expanded — the round-trip
verified through a reload.

## The reference re-sweep — UNCHANGED since S52

The operator account, 1280×800 then 390×844. The four standing
anchors: the title **"AcademiaFlow (Copy)"**; the greeting **"Good
morning, sepnetflix2023 👋"** (the hour-2 UTC bucket — correct per the
reference-probed map); the **20-view href order** `/Dashboard`…
`/Settings` byte-identical; the five Settings tabs
**Appearance/Profile/Subjects/Holidays/Notifications**. BOTH sidebar
states re-measured: expanded **260/260/1020**; collapsed **80/80/1200**
with the chevron-only header, the empty footer, the icon-only svgX 33,
the `matrix(-1, 0, 0, -1, 0, 0)` glyph, `sidebarOpen "false"`
persisted. The shared collapsed drawer: the **288px panel**, the
icon-only svgX 32, nav **912 vs 744**, the reference's own `blur(4px)`
backdrop serializing `rgba(0, 0, 0, 0.2)` (the v3-era form — the
clone's `oklab(0 0 0 / 0.2)` is the documented v4-equivalent, trap 7's
dual-serialization acceptance). The stored preference restored to
`"true"` before session close. **UNCHANGED since S52/S53/S54/S55/S56.**

## The Mode-C review + the dep work

The HEAD commit verified doc-only. The static scan clean: zero
TODO/FIXME/`: any`/`console.log`; the single `eval(` hit = the
documented prose comment in `src/lib/calculator.ts` line 4; the one
`dangerouslySetInnerHTML` = the documented THEME_BOOT_SCRIPT; the SDK
server-only in the 4 AI routes. The dep-audit GREEN (exit 0, the 2
documented non-production advisories, 0 runtime-reachable).

**The registry re-check** (the standing open item): braces — UNCHANGED
(3.0.3 = the latest published; the fix release does not exist).
deepmerge-ts — the stable fix path re-confirmed on **Prisma 7.10.1**
(`@prisma/config@7.10.1` → deepmerge-ts 8.0.2; the 7.x stable line
ends at 7.10.1), with one registry-drift note: the `latest` dist-tag
now points at the **Prisma 8 RC** (8.0.0-rc.23) — the 7.x stable
remains on `prev`. The S56 judgment call re-affirmed: the major ORM
upgrade stays the named next-step candidate for a DEDICATED session
(owner decision) — the advisory is non-production by construction
(CLI-surface only, 0 runtime-reachable), and the upgrade remains the
highest-risk change class for this repo (the ADR-002 three-anchor
DATABASE_URL contract, the generator story, the `.env` auto-load
paths — every surface pinned).

The scandihaven patterns reference: unchanged (`d4789c3`, 2026-10-04) —
its disciplines already embodied here; no architecture changes
warranted.

## The confirmation + the evidence

`bun scripts/standing-suite.mjs` launched detached on the daemon (the
S32 recipe, the interactive sessions closed first per the OOM lesson)
— the verdict recorded in the session-57 remediation plan's execution
log. The evidence: the 35-row envelope under `docs/screenshots/` + the
5 dev-server screenshots (the expanded + collapsed desktop states, the
icon-only drawer, the labeled drawer, the Notes view via the drawer)
+ the 2 reference captures.

The count anchors (1133/834/299) restored and untouched by the fix —
test-code only; the app code untouched.

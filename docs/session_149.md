# Session 149 — S56 narrative: the S55+1 stability confirmation + the registry-landscape shift

The S56 session (2026-10-15/16) — the standing arrival audit on the
S55-closed codebase (zero findings on every axis), plus the one genuine
development the audit surfaced: the **dep-registry landscape shifted** —
a stable Prisma line now carries the deepmerge-ts fix. Zero code changes
by design (the S53/S54 precedent); the judgment call documented and the
standing suite re-run as the confirmation.

## The arrival — the workspace-pull recipe (the environment survived)

The workspace pulled fast-forward (`3ddb6c7` → `f8f1204`, bringing in
`docs/session_148.md` — the S55 process log; verified **doc-only** by
`git show --stat`: 1 file, +106). The environment survived intact —
node_modules, `db/` at the repo root (custom.db + e2e.db), `.env` =
`.env.example` verbatim with `DATABASE_URL="file:../db/custom.db"`, the
`.next/standalone` build present, the tree clean — the S51/S54 arrival
precedent: no fresh-clone rebuild needed.

The five core docs re-read (AGENTS: the commands, the DATABASE_URL
contract, the 13 Tailwind v4 traps, the testing quirks, the S32 daemon
recipe; CLAUDE: the identity + the six-phase workflow + the test
pyramid; README: the session table through session-55 + the design
system; PAD: the 26 ADRs + the test distribution + the known-issues
table; SKILL: the 20 sections + the appendices), then the S55 baseline
docs (session_146/147/148, the S55 plan with its execution log, the
worklog tail). The understanding validated against the codebase: the
count anchors 1133/834/299, the last app-code change = the S52
four-file fix, the last test-code change = the S55 three-file e2e fix.

The scandihaven patterns reference re-verified (unchanged since
2026-10-04): the mobile-nav testing discipline (the 390×844
focus-trapped Radix drawer), the Tailwind v4 literal-token contract,
the scoped-assertion E2E doctrine — all already embodied here; no
architecture change warranted.

## The baseline gates — 1133 green re-confirmed

lint ✓ (exit 0) — tsc ✓ (exit 0) — **834 unit ✓** (20 files, 3.61 s) —
build ✓ (exit 0, the standalone output) — **cold-db 299 e2e ✓**
(`rm -f db/e2e.db` first, per the S46 cold-run doctrine; 4.6 min) =
**1133 green**, byte-for-byte the documented S55 state. The S55 F1
fix is runner-clock-independent by construction (the pins read the
grid's own `[data-today]` marker), and the run passed clean.

## The standing checks — all GREEN

The dev daemon per the S32 recipe (`( setsid bun run dev … & )`,
health 200 after ~14 s), then:

- **The preflight** GREEN (hydrated + navigation-stable).
- **The drawer-check** GREEN (backdrop/panel/links/footer +
  Escape-close).
- **The live agent-browser 390×844 walkthrough** on the clone —
  login (the demo card) → the mobile shell contract (scrollWidth 390,
  the sidebar `display: none`, the burger visible) → the drawer: the
  288px panel, **20 links in the reference order** (/Dashboard …
  /Settings), the nav scrollable **1068 vs 755** → the Tailwind v4
  trap surfaces: **trap 4** clean (the nav UL `flex flex-col gap-1`:
  display flex / gap 4px / column / zero margin children), **trap 9**
  clean (the backdrop computing `blur(4px)`), **trap 7** clean
  (`bg-black/20` serializing `oklab(0 0 0 / 0.2)` — the documented
  expected form) → the active link (Dashboard): the inner span
  violet-600 `rgb(124, 58, 237)` + the violet→indigo 10% gradient +
  the trailing violet-500 dot `rgb(139, 92, 246)` → navigation to
  Notes **through the drawer** → the auto-close verified → the drawer
  re-opened → **Escape-close** verified. **The mobile navigation menu
  is working as expected; NO Tailwind v4 bug found.**
- **The desktop sidebar states** at 1280×800: expanded aside 260 /
  main ml 260 / main width 1020 / 20 labeled links; collapsed (via
  the header chevron) aside 80 / main ml 80 / main width 1200 / 20
  icon-only links svgX 33 / the footer 0 children / the glyph
  `rotate: 180deg` (v4's rotate property ≡ the reference's
  rotate-180 matrix) / `sf-sidebar-collapsed "1"` persisted. The
  **shared mobile drawer state** (the S52 contract): at 390×844 the
  drawer renders the 288px panel with 20 **icon-only** links svgX 32,
  the nav scrollable 988 vs 755. The preference restored to expanded
  (one probe lesson re-learned: a stale element ref made an eval-click
  no-op — re-snapshot + click via the fresh ref; the documented
  post-click race, not an app bug, and the standing s52 e2e spec pins
  the toggle 8/8 green in the baseline run).

## The reference re-sweep — UNCHANGED

With the operator account (`sepnetflix2023@outlook.com`), 1280×800
then 390×844:

- The four standing anchors: the title **"AcademiaFlow (Copy)"**; the
  greeting **"Good evening, sepnetflix2023 👋"** (the hour-23 UTC
  bucket); the **20-view href order** byte-identical; the **five
  Settings tabs** (Appearance / Profile / Subjects / Holidays /
  Notifications).
- BOTH sidebar states re-measured: expanded 260/260/1020; collapsed
  80/80/1200 with the chevron-only header, the empty footer, the
  icon-only left-aligned links svgX 33, the `matrix(-1, 0, 0, -1, 0,
  0)` glyph, `sidebarOpen` persisted.
- The shared collapsed drawer at 390×844: the 288px panel, 20
  icon-only links svgX 32, the nav scrollable 912 vs 744, the
  reference's own `blur(4px)` backdrop.
- The stored preference restored to `"true"` before session close; 2
  reference captures saved (`s56-reference-desktop-expanded-1280.png`,
  `s56-reference-mobile-drawer-labeled-390.png`).

**The reference is UNCHANGED since S52/S53/S54/S55.**

## The Mode-C code review + the dep work — the registry shift

The static security scan clean: zero TODO/FIXME/`: any`/`console.log`;
the single `eval(` hit = the documented prose comment
(`src/lib/calculator.ts` line 4, "No eval(): …"); the one
`dangerouslySetInnerHTML` = the documented THEME_BOOT_SCRIPT
(`src/app/layout.tsx:44`); the `z-ai-web-dev-sdk` server-only in the
4 AI routes. The dep-audit GREEN (exit 0): the 2 standing advisories
both classified non-production (braces via eslint-config-next, dev
surface; deepmerge-ts via the prisma CLI — both outside the
standalone runtime trace), 0 runtime-reachable.

**The registry re-check — the session's one genuine development:**

- `braces` — UNCHANGED: latest published IS 3.0.3 (the lockfile's own
  version; the fix release does not exist). Unfixable upstream.
- `deepmerge-ts` — **CHANGED**: the lockfile carries the vulnerable
  7.1.5 via `prisma@6.19.3 › @prisma/config@6.19.3`. The 6.x line has
  **ended** at 6.19.3 (no newer 6.x exists; `@prisma/config@6.19.3`
  still pins 7.1.5), while the **stable Prisma 7.10.1** (dist-tag
  `prev`) now carries `@prisma/config@7.10.1 → deepmerge-ts@8.0.2`
  (the fixed version). The Prisma 8 line remains RC-only
  (8.0.0-rc.23).

**The judgment call**: the fix now exists on a stable line — but it
requires the **major ORM upgrade 6.19.3 → 7.10.1**, the highest-risk
change class for this repo (ADR-002's empirically-verified three-anchor
DATABASE_URL contract, the generator story, the `.env` auto-load
paths, the node-engine floor — every surface pinned by
`tests/db-path.test.ts`, the `db:*` scripts, the e2e `global-setup`,
the seed, the Docker `init` profile). The advisory itself is
non-production by construction (CLI-surface only, 0
runtime-reachable). Per the house doctrine (the smallest safe diff)
and the S53/S54 precedent (zero findings → zero code changes), the
upgrade is recorded as the **named next-step candidate for a
dedicated session** — an owner-decision item, not an in-session
drive-by. The full reasoning is in
`docs/remediation-plan-session56.md`.

The Docker `init` profile remains an owner-host action (no daemon in
this workspace, re-verified).

## The confirmation + the evidence

`bun scripts/standing-suite.mjs` launched detached on the daemon (the
S32 recipe) at ~23:55 UTC — **GREEN 35/35, zero total findings**
(~72 min wall; the S31 preflight, the 33 standing audits, the
theme-restore closing guard light/violet). The 35-row envelope saved as
`docs/screenshots/s56-standing-suite-evidence.json` with the session
context header. One timing note: the run crossed the UTC midnight —
the clone's own login read "Good evening" at hour-23 and "Good
morning" at hour-1 after the suite, BOTH correct per the
reference-probed bucket map (the S54 precedent).

The 5 dev-server screenshots captured after the suite (re-open +
re-login first — the suite's scripts close the named agent-browser
session, the S53/S54/S55 lesson): the expanded (aside 260 / ml 260) +
collapsed (aside 80 / ml 80) desktop states, the icon-only drawer (the
shared collapsed state — the 288px panel, icon-only svgX 32, verified
in-frame), the labeled drawer (the default, after the preference
restore + reload), the Notes view navigated through the drawer (the
auto-close verified in-frame) — the capture set byte-mirroring the S55
counterparts (217.1/240.0/47.8/67.4/101.1 KB vs
217.3/239.5/47.4/67.1/100.8 KB). Plus the 2 reference captures.

## The close

Zero code changes; the count anchors (1133/834/299) untouched. The
docs aligned: the session-56 remediation plan (the findings table +
the executed ToDo list + this execution log), session_149 (this
narrative) + session_150 (summary), the README session-56 row, the
worklog entry. The commit + push to `main` via the SSH wrapper (the
key verified + shredded after).

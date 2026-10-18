# Remediation Plan — Session 71 (S71): the S70+1 stability confirmation — the standing arrival audit (the reset-boundary rebuild; the fifth fresh-clone rebuild of the chain)

**The session's governing question (2026-10-18):** the S70 session closed
the S69+1 stability confirmation with the 1133 gates re-confirmed
byte-for-byte on the first persisted (non-reset) workspace since S65, the
standing suite GREEN 35/35 **on run 1** (the fourth consecutive
clean-envelope run 1), and the capture-delta the chain's smallest ever
(the collapsed pair + the reference mobile drawer both byte-identical, all
seven captures the clock-digit family only, zero structural movement).
Since the S70 close, TWO doc-only commits landed (`44a6436` — session_209,
the S70 transcript, +34; `15a683e` — session_210, the S70 process log,
+111; both verified by `git show --stat`: docs only, zero app code). This
session owed the standing arrival audit per the documented protocol (the
S70 "suggested next steps" ③) and read **ZERO findings on every axis**:
the baseline gates re-confirmed byte-for-byte on the fresh-clone rebuild,
the standing checks all GREEN, the reference re-swept **UNCHANGED since
S52–S70**, the Mode-C review clean, the dep-audit GREEN, and the registry
landscape stable. **Zero code changes by design** (the S53–S70 precedent:
the smallest safe diff is no diff on a verified-green production
codebase).

## The scope (validated against the codebase before execution)

1. **The arrival**: the workspace RESET at session open (the S70
   persisted-workspace streak broken after one session — the fifth
   reset-boundary rebuild of the chain: S66/S67/S68/S69 and now S71). The
   fresh clone at `15a683e` (the S70 close commit), the four-times-field-tested
   rebuild recipe executed without deviation: `.env` from `.env.example`
   (`DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET=""`), `bun install`
   489 packages (7.19 s), `db:push` + `db:seed` to the **303,104-byte pin
   byte-identical**, the playwright chromium v1243 cache reinstall
   (114.3 MiB). The five core docs re-read (AGENTS/CLAUDE/
   Project_Architecture_Document unchanged since `193132f` [S52], the
   SKILL doc unchanged since `c5378bc`, README advanced only by the
   session-70 row, the worklog advanced only by the S70 entries — the
   change-history verification), the session docs read (session_209 +
   remediation-plan-session70 + the worklog tail + session_210), the
   post-S70 commits verified doc-only.
2. **The baseline gates + the standing checks + the reference re-sweep +
   the Mode-C review**: the full documented sequence, unchanged from the
   S69/S70 executions.
3. **The confirmation**: `bun scripts/standing-suite.mjs` — all 35 rows,
   the suite as the window's ONLY consumer (the S66–S70 standing
   protocol: no manual audits before/during; the security stage verified
   from the raw stage output — a file read — never by re-running the
   audit).

## The findings

**ZERO findings — app code, test code, and docs alike.** Every axis of
the arrival audit read GREEN:

| Check | Verdict |
|-------|---------|
| Post-S70 commits | `44a6436` + `15a683e` (session_209 + session_210, +145 combined, docs only) verified **doc-only** by `git show --stat` — zero app-code changes since the S52 four-file fix `193132f` |
| Baseline gates (fresh clone) | lint ✓ tsc ✓ **834 unit ✓** (20 files, 3.58 s) build ✓ cold-db **299 e2e ✓** (4.5 min, zero flake) = **1133 green** — byte-for-byte the documented S70 state, the counts' seventh consecutive identical reading, back on a fresh-clone rebuild after the S70 persisted-workspace reading |
| Dev-server preflight | GREEN (hydrated + navigation-stable, health 200 via the S32 daemon recipe on the fresh install) |
| Drawer-check (S14) | GREEN (backdrop blur(4px) / panel 288 / 20 links / no footer / Escape-close superset) |
| Live 390×844 walkthrough (clone) | GREEN — login (demo@studyflow.app) → scrollWidth 390 → sidebar hidden (`display: none` on the aside) → burger visible (aria-label "Open navigation menu") → the drawer 20 links in the exact reference order → nav scrollable **1068 vs 755** (the NAV element itself the scroll container — `overflow-y: auto`; the UL inside it the flex column) → panel 288px, 48px labeled links |
| Tailwind v4 trap surfaces | CLEAN — trap 4 (the drawer nav UL: display flex / column / gap 4px / margin 0px), trap 9 (the backdrop BUTTON `backdrop-filter: blur(4px)`), trap 7 (`bg-black/20` serializing `oklab(0 0 0 / 0.2)`) — all three read clean in ONE probe |
| **The mobile navigation menu** | **working as expected — NO Tailwind v4 bug found** |
| Active-link triple-pin | EXACT (violet-600 label span `rgb(124, 58, 237)` + the violet→indigo 10% gradient on the `.sf-nav-active` label-wrapper span + the trailing violet-500 dot `rgb(139, 92, 246)` — computed **w 6px / h 6px / border-radius rounded-full** on `ml-auto h-1.5 w-1.5 shrink-0 rounded-full`; the probe note: the dot's `offsetWidth` reads 0 at probe time (a paint-state quirk) while the computed style reads the exact 6×6 — the CSS pins authoritative) |
| Desktop sidebar states (clone) | expanded aside 260 / main ml 260px / main width 1020, 20 leaf labels (by-name census); collapsed via the "Collapse sidebar" button: **80/80/1200**, nav icon svgX **33** + the header chevron **x=32** (both documented positions), the glyph `rotate: 180deg` (v4's rotate property; `transform` reads "none"), `sf-sidebar-collapsed` "1" persisted, **zero leaf label spans rendered** (the labels UNMOUNT); the mobile drawer SHARING the state (288px panel, 44px icon-only links, svgX 32, nav scrollable **988 vs 755**, 20 aria-named icon-only links); the preference restored ("0") + the reload round-trip verified |
| Reference re-sweep | **UNCHANGED since S52–S70** — the four anchors (title "AcademiaFlow (Copy)"; greeting "Good morning, sepnetflix2023 👋" [the hour-5 UTC MORNING bucket 0–11 — BOTH sites in the same bucket again, the THIRD consecutive same-bucket pair]; the 20-view order byte-identical; the five Settings tabs Appearance/Profile/Subjects/Holidays/Notifications) + BOTH sidebar states re-measured (expanded 260/260/1020, 20 labels, `sidebarOpen "true"`; collapsed 80/80/1200, svgX 33, the `matrix(-1, 0, 0, -1, 0, 0)` glyph, `sidebarOpen "false"`) + the shared collapsed drawer (288px panel, 44px links, svgX 32, nav 912 vs 744, the DIV backdrop `blur(4px)` + `rgba(0, 0, 0, 0.2)` — the panel's SIBLING div `lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50`, found by the reliable GLOBAL backdrop-filter probe; the global probe also surfacing the app-bar HEADER's `blur(20px)` sticky — a distinct element, not the drawer backdrop); the reference's drawer does NOT close on Escape (the clone's documented superset, verified live via the GEOMETRY probe — the panel + backdrop both remain); the stored preference restored to `"true"`; 2 reference captures saved (the desktop expanded gated on the CTA "Start My Day" verified in-frame at x1093/y46/155×36 + both h1s read; the mobile labeled drawer, 20 labels 48px verified in-frame) |
| Mode-C code review | ZERO app-code findings — the static scan clean (zero TODO/FIXME/`: any`/`console.log` in `src/`; the single `eval(` hit = the documented prose comment in `src/lib/calculator.ts` line 4; the one `dangerouslySetInnerHTML` = the documented THEME_BOOT_SCRIPT in `src/app/layout.tsx:44` — both re-verified) |
| Dep-audit | GREEN (exit 0) — 2 advisories documented as non-production (braces via eslint-config-next, dev surface; deepmerge-ts via the prisma CLI — both OUTSIDE the standalone runtime trace), 0 runtime-reachable |
| The registry re-check | **UNCHANGED** — braces: the latest published IS the lockfile's own 3.0.3 (the fix release does not exist — unfixable upstream). Prisma: the repo on `^6.11.1` (lockfile 6.19.3); the 7.x stable line still ends at 7.10.1, the `prisma` CLI's `latest` dist-tag still on the Prisma 8 RC (8.0.0-rc.23) — a **sixteenth** consecutive re-check; the `@prisma/client` package's own `latest` dist-tag reads the stable 7.10.1 (the runtime client ships stable while the CLI's latest sits on the 8 RC — the standing accurate reading); no landscape change warranting action; the major upgrade stays the dedicated-session candidate (owner decision) |
| `.env` / db / test contracts | `.env` rebuilt from `.env.example` (`DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET=""`); `db/` at the repo root (custom.db cold-re-seeded to the 303,104-byte pin; e2e.db scratch deleted-cold for the run); vitest.config.ts (834/20 files) + playwright.config.ts (299, standalone :3100 + `db/e2e.db` isolation via the shell-supplied `E2E_DATABASE_URL`) verified working |
| Scandihaven patterns reference | reviewed (HEAD `d4789c3`, verified by `git ls-remote`) — unchanged since the S52–S70 reviews; no architecture changes warranted |
| SSH infrastructure | REBUILT post-reset: the Appendix A shim at /home/z/my-project/bin/ssh (compile-checked, the venv-python shebang) + paramiko 5.1.0 in the venv (the registry advanced from the S69/S70 5.0.0 — the shim's API surface [Ed25519Key/RSAKey/SSHClient] unchanged, the dry-run the proof); the operator key materialized (0600, outside the repo) + fingerprint-verified by parsing the embedded **wire-format public blob** (SHA256 `3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` — the S59–S70 documented identity, an exact match; the S70 parse lesson re-applied: hash the full wire-format blob [the algorithm string + the 32-byte key], not the raw key material — the first parse hashed the raw 32 bytes and read a non-matching digest); the wrapper dry-run GREEN with the explicit `--remote git@github.com:nordeim/omni-study.git` (remote main @ `15a683e` == local HEAD — the freshness probe clean on the first invocation) |

### Non-gaps (documented, no action)

- The Docker `init` profile (`docker compose --profile init up`) remains
  an owner-host action — not executable in this workspace.
- The Prisma major upgrade — the named next-step candidate (owner
  decision; a dedicated session, not an in-session drive-by), the repo
  stable on 6.x (lockfile 6.19.3), the 7.x stable line ending at 7.10.1
  for a sixteenth consecutive re-check.
- The reference's Escape-close absence — the clone's documented superset,
  not a gap to close.

### Session-specific process notes (recorded without generalizing to doctrines)

- **The reset-boundary rebuild is now a five-times-field-tested routine**:
  clone at the close commit, `.env` from `.env.example`, `bun install`
  489, `db:push` + `db:seed` to the 303,104-byte pin, chromium v1243 —
  every step first-try this cycle, the pin landing byte-identical, the
  gates reading the seventh consecutive identical 1133.
- **The hour-5 same-bucket pair (the THIRD consecutive)**: both sites
  read the MORNING bucket (`greetingForHour` 0–11), and the environment
  re-seed ran the SAME calendar day as S70's (Oct 18) — so the
  fresh-seed date family read IDENTICAL again, and the same-bucket +
  same-day + no-clock-in-collapsed-layout conditions reproduced the
  collapsed byte-identity for the SECOND consecutive pair (217,382 =
  217,382 bytes). This cycle went further: the icon-only AND labeled
  drawer captures also read **0 diff px** (the app-bar clock-digit change
  03:0x→05:2x AM washing entirely below the >8/channel threshold through
  the 4px backdrop blur this cycle — S70 read 16 px each on the same
  band) — **THREE zero-diff pairs, the cleanest capture-delta reading
  alongside S70's two**.
- **The labeled-drawer capture's mount-state lesson (re-learned, already
  implied by the S70 "preference round-trip" protocol)**: writing
  `localStorage.sf-sidebar-collapsed` on the ALREADY-MOUNTED drawer does
  not re-render it — the drawer captures its labeled/icon-only form at
  mount. The correct form: set the preference, RELOAD, then open — the
  labeled form (48px, 20 labels) then renders. The first capture attempt
  read the icon-only form (44px, 0 labels) and was discarded; the
  reloaded re-take reads the exact pins.
- **The dev-tools badge lives in the shadow DOM**: the "Open Next.js
  Dev Tools" button renders inside the `nextjs-portal` element's shadow
  root — a plain `document.querySelectorAll('button')` cannot see it
  (agent-browser's accessibility snapshots DO pierce it). The compact
  32×32 gate is verified via `portal.shadowRoot.querySelectorAll`. Also:
  after a client-side login navigation the portal may not re-mount the
  badge immediately — the reload restores it (the expanded capture
  re-taken with the badge confirmed in-frame).
- **The fingerprint parse lesson (the S70 form, re-applied)**:
  `ssh-keygen -lf` hashes the wire-format PUBLIC blob (the "ssh-ed25519"
  algorithm string + the 32-byte key material) — hashing only the raw
  32 bytes reads a plausible but non-matching digest. The corrected
  parse reads the exact documented identity.

## The ToDo list

- [x] The arrival: the fresh clone at `15a683e` (the reset boundary —
      the fifth fresh-clone rebuild), the five core docs re-read (the
      change-history verification: AGENTS/CLAUDE/
      Project_Architecture_Document unchanged since `193132f`, the SKILL
      doc since `c5378bc`, README/worklog advanced only by the S70
      docs), the session docs read (session_209 + session_210 + the
      remediation plan + the worklog tail), the post-S70 commits
      verified doc-only
- [x] The environment rebuilt + re-pinned: bun install 489 / db:push +
      db:seed to the 303,104-byte pin / chromium v1243 (114.3 MiB)
- [x] The baseline gates: lint ✓ tsc ✓ 834 unit ✓ (20 files, 3.58 s)
      build ✓ cold-db **299 e2e ✓** (4.5 min) = **1133 green** on the
      fresh-clone rebuild — the seventh consecutive identical reading
- [x] The dev daemon (the S32 recipe, health 200) + the preflight GREEN
      + the drawer-check GREEN
- [x] The live agent-browser 390×844 walkthrough GREEN (the mobile
      navigation working; traps 4/9/7 verified live clean in one probe;
      the active-link triple-pin exact; both desktop sidebar states +
      the shared drawer state measured to the pin; the preference
      restored with the reload round-trip verified)
- [x] The reference re-sweep with the operator account — BOTH sidebar
      states + the shared drawer — **UNCHANGED**; the preference restored
- [x] The Mode-C review (the post-S70 commits verified doc-only; the
      static scan clean) + the dep-audit GREEN + the registry re-check
      (braces unchanged; the Prisma landscape unchanged; the CLI
      `latest` dist-tag still on the Prisma 8 RC — a sixteenth
      re-check)
- [x] The scandihaven patterns reference re-verified (unchanged,
      `d4789c3`)
- [x] The SSH infrastructure rebuilt post-reset (the Appendix A shim +
      the venv paramiko 5.1.0 + the operator key materialized +
      fingerprint-verified via the wire-format public blob + the wrapper
      dry-run GREEN — the freshness probe read clean at `15a683e`)
- [x] This plan written and validated against the codebase
- [x] The evidence captures (5 dev-server + 2 reference) + the
      capture-delta classification vs the S70 counterparts (the
      clock-digit family only, zero structural movement; THREE zero-diff
      pairs — the collapsed byte-identical for the second consecutive
      pair + both drawers 0 px; the Python decoder cross-check
      reproduced exactly on all seven pairs)
- [x] The confirmation: `bun scripts/standing-suite.mjs` — the suite as
      the window's ONLY consumer (no manual audits before/during; the
      security stage verified from the raw stage output) — **result
      appended below**
- [x] The docs: session_211 (narrative) + session_212 (Chinese summary)
      + the README session-71 row + the worklog entry
- [x] The evidence commit + the push via the SSH wrapper (main only) —
      pushed and verified; the operator key shredded at session close

## The execution log

**05:15 UTC — the arrival.** The workspace found RESET (the S70
persisted-workspace streak broken after one session). The fresh clone at
`15a683e`; the post-S70 commits (`44a6436` session_209 +34,
`15a683e` session_210 +111) verified doc-only; the five core docs re-read
with the change-history verification; the session docs absorbed.

**05:16–05:17 — the environment rebuild.** The recipe first-try:
`.env` from `.env.example`, `bun install` 489 (7.19 s), `db:push` +
`db:seed` → **303,104 bytes = the pin byte-identical**, chromium v1243
(114.3 MiB).

**05:17–05:24 — the baseline gates.** lint ✓ tsc ✓ **834 unit ✓** (20
files, 3.58 s) build ✓ cold-db e2e **299/299 ✓** (4.5 min, zero flake —
`rm -f db/e2e.db` + `E2E_DATABASE_URL="file:../db/e2e.db"` per the
S45/S46 cold-run contract) = **1133 GREEN** — the counts' seventh
consecutive identical reading.

**05:24–05:25 — the daemon + the standing checks.** The S32 subshell
recipe launched the daemon (health 200); the preflight GREEN (hydrated +
navigation-stable); the drawer-check GREEN.

**05:25–05:31 — the walkthroughs.** The clone 390×844 walkthrough fully
GREEN (the census exact + traps 4/9/7 in ONE probe, the triple-pin exact,
Notes auto-close, Escape-close, both desktop states, the shared
icon-only drawer, the reload round-trip). The greeting read the hour-5
**morning** bucket ("Good morning, Demo Student 👋" — the same bucket as
the S69/S70 captures, the third consecutive same-bucket pair). The
reference re-sweep with the operator account: the four anchors + both
sidebar states + the shared drawer + the Escape-close absence —
**UNCHANGED**; the preference restored; the 2 reference captures saved
(228,188 / 71,789 bytes).

**05:27–05:33 — the Mode-C + the captures.** The static scan clean; the
dep-audit exit 0 (the 2 non-production advisories); the registry re-check
UNCHANGED (sixteenth); scandihaven unchanged (`d4789c3`). The 5
dev-server screenshots + the 2 reference captures saved; the
capture-delta classification vs the S70 counterparts: ALL SEVEN captures
the clock-digit family only, ZERO structural movement — THREE zero-diff
pairs (the collapsed **byte-identical** 217,382 = 217,382 + the
icon-only drawer 0 px + the labeled drawer 0 px) + the expanded 468 px
at the sidebar-footer clock chip (rows 678–695) + the Notes 109 px at
the app-bar clock band (rows 27–36) + the reference expanded 517 px at
the reference footer clock (rows 649–666) + the reference mobile drawer
85 px (rows 29–38) — the Python decoder cross-check reproducing the
sharp reading EXACTLY on all seven pairs.

**05:31 — the suite launch + the SSH rebuild in parallel.** The standing
suite launched detached at 05:31:04 UTC (the suite as the window's ONLY
consumer — all browser sessions closed, the daemon tree healthy, the
limiter budget fresh). The security stage verified from the raw output
(05:31:17, this run's): **ZERO findings, 7 nonGaps**. While the suite
runs: the SSH infrastructure rebuilt (the shim compile-checked, paramiko
5.1.0, the operator key materialized + the fingerprint verified via the
wire-format public blob — an exact match, the wrapper dry-run GREEN with
the remote @ `15a683e` == local HEAD), this plan + the narrative docs
written with the suite result PENDING (the S69/S70 anti-fabrication
discipline).

**THE STANDING SUITE RESULT (appended after completion):**

- **GREEN 35/35 on run 1** — ZERO total findings (all 35 rows
  `findings: 0`), ZERO incidents (`failed: []`; ~72 min: 05:31 → 06:44
  UTC), cwv-volume-stress ZERO findings in-suite (the budget families
  hold at the 300/200/250 profile; the INP proxy Dashboard→Tasks 1575ms
  under the full Lighthouse throttle) — the **FIFTH consecutive
  clean-envelope run 1**; the theme-restore closing guard light/violet
  (a mid-suite crash must not leave the demo user mutated). The 35-row
  envelope saved
  (`docs/screenshots/s71-standing-suite-evidence.json`).

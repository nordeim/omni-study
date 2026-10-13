# Session 121 — The S49 iteration narrative

## The scope

The S48 summary's own named next candidate: **the light × landscape × volume
cell (844×390) — the S49 mirror, completing the volume × theme × viewport
cross-axis's LAST band** (the S42→S43 / S44→S45 / S46→S47 / S48→S49 family
pattern). With this session the cross-axis is COMPLETE: all EIGHT halves
(dark/light × desktop/mobile/mid-band/landscape) carry a standing,
executable guarantee.

## The arrival audit (the 1024-green baseline)

The workspace was RESET this session — a fresh `git clone` to `4e7f30f`
(the S48 feat push `616bb2e` + the user's session_119/120 log updates — S48
complete: the dark × landscape × volume cell closed, 1024 green, the 32-row
suite, zero field corrections). The environment rebuilt from the contract:
`.env` created from `.env.example` (the dev posture `AUTH_SECRET=""`),
`bun install`, `bun run db:push` + `bun run db:seed` (the demo user + 13
subjects at `db/custom.db`).

ONE fresh-environment lesson re-learned on arrival, the documented one: the
first cold-db e2e attempt failed **267/291** with the Playwright
`Executable doesn't exist at chromium_headless_shell-1243/...` launcher
error — the browser cache does not survive a workspace reset. `bunx
playwright install chromium` (114 MiB) restored the full pass. The baseline
gates then re-confirmed the documented state exactly: lint ✓ tsc ✓ **733
unit ✓** (20 files) build ✓ cold-`db/e2e.db` **291 e2e ✓ (4.6 min)** =
**1024 green** — zero flakes, zero day-boundary failures (the cold-db
convention applied: `rm -f db/e2e.db` before the run, the S46 lesson).

## The standing checks

- **Preflight GREEN** — the dev server booted via the S32 recipe
  (`( setsid bun run dev … & )` + the `/api/health` probe), hydrated and
  navigation-stable.
- **The drawer check GREEN** — the standing S14 probe, both apps, backdrop /
  panel / links / footer / Escape-close.
- **The live agent-browser 390×844 walkthrough GREEN** — the mobile
  navigation menu is working as expected: 20 links in the documented order
  (Dashboard first, Settings last), the nav scrollable at 844 height (1068
  vs 755), the drawer closes on navigation to Notes, and the re-opened
  drawer's active link "Notes" carries the violet NAV_ACTIVE_GRADIENT_STOPS
  gradient `linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(99,
  102, 241, 0.1))` on the inner span.
- **The LANDSCAPE geometry anchor RE-MEASURED at 844×390 in LIGHT** — the
  critical S49 empirical anchor, taken BEFORE the pins were finalized: the
  drawer nav scrollHeight **1068** vs clientHeight **301** → scrollable
  TRUE (identical to the S35/S40/S48 measurements — links ~8–20 below the
  fold, the nav's scroll the only path to them), the vehicle contract holds
  (sidebarVisible=false + hamburgerVisible=true at 844), the heading
  clearance verified at the short viewport (the Dashboard greeting top 80 ≥
  the 64px bar; the Notes :visible h2 top 586 — the hidden desktop h1 is
  exactly why the probes filter `:visible`), and the LIGHT mode confirmed
  (no `html.dark` class — the light half's own precondition).
- **The reference re-swept UNCHANGED since S19–S48** — login title
  "AcademiaFlow (Copy)", the email-prefix greeting "Good evening,
  sepnetflix2023 👋", the 20 nav views in the same order, the five Settings
  tabs (Appearance | Profile | Subjects | Holidays | Notifications).
- **The copy sweep 14/20 MATCH** — the 6 data-state non-gaps, the documented
  family (via the :3200 standalone with a real ephemeral AUTH_SECRET — the
  s22 boot guard satisfied).

## The governing finding

**The light × landscape × volume cell is ZERO-coverage at every accent.**
The coverage map, grep-verified against the standing scripts:

- `data-volume-audit` (S13): 1280×800, LIGHT + VIOLET only — the desktop,
  once, default theme only (zero theme references).
- `landscape-sweep` (S35) + `accent-landscape-sweep` (S40): the landscape
  viewport family at 844×390 — SEED volume (zero STRESS/countMany markers)
  AND LIGHT only (S35 violet; S40's every PATCH carries `themeMode:
  "light"` — the volume axis is the blind spot).
- `accent-volume-sweep` (S42) + `accent-volume-light-sweep` (S43): 1280×800
  only. `accent-volume-dark-mobile-sweep` (S44) +
  `accent-volume-light-mobile-sweep` (S45): 390×844 only.
  `accent-volume-dark-midband-sweep` (S46) +
  `accent-volume-light-midband-sweep` (S47): 768×1024 only.
- `accent-volume-dark-landscape-sweep` (S48): 844×390 **DARK only** (its
  mode precondition requires dark; its own seam's rot-guard comment names
  this light family as "the documented S49 mirror").
- NO light sweep runs at 844×390 at all (every "844" grep hit in the light
  sweeps is a comment reference or the mobile HEIGHT of 390×844 —
  verified).

So the densest renderings (the 300-row Tasks list, the 250-event terminal
panel, the 200-note list) had never been rendered in LIGHT at the 844×390
landscape layout under ANY non-violet accent at volume; the S13 volume
budgets had never been measured at the landscape viewport in LIGHT under an
accent variation; and the DRAWER's active-link tint had never been read
through the real navigation lifecycle in LIGHT at LANDSCAPE at VOLUME.

## The fix (TDD)

**RED — 40 S49 pins** appended to `tests/suite-verdict.test.ts` after the
S48 block: the s49Envelope generator (7 accents × 7 views + the drawer
record per accent at 844×390 LIGHT under the volume profile — the LIGHT
record shape, NO flashbulbs keys), the GREEN shape with the swept counts,
the ALL-VIEWS + ALL-ACCENTS guards, the historical S13-shape / S42–S47
envelopes fed here → the viewport shape-errors (the landscape seam owns
844×390 — the TRANSPOSED pair is a different device class), the mode
discriminator pin (the S48 DARK-landscape envelope fed here → NON-green via
the mode rot — the dark shape is a SUPERSET of the light shape, its extra
flashbulbs keys ride along, the shape checks require keys and never reject
extras, so the mode guard is what discriminates), the S45 re-scope
cross-check (the light mobile envelope re-scoped to 844×390 → GREEN — the
seams discriminate on the VIEWPORT, not the shape), the missing-key
shape-errors, the wrong-viewport family, the mode-rot / volume-rot /
applied-mismatch / vehicle-contract / nav-scroll / tint-rot / interaction /
overflow / structural / budget / strict-record / drawer-error /
link-census / independent-counting / THREE-exemption-strictness / WARN /
B1-bound families, and the unknown-audit guard → **22 failed / 467 passed**
under the un-extended seam (the shape-error pins pass vacuously through the
unknown-audit path — documented; all 22 failures verified in the S49
block). **ZERO pin corrections this time — the RED phase read clean on the
first try** (the accumulated S43–S48 mirror doctrine).

**GREEN — the `classifyAccentVolumeLightLandscapeSweep` seam** in
`src/lib/suite-verdict.ts` (the AUDIT_NAMES entry + the dispatch arm + the
classifier): the viewport guard (844×390 BOTH axes), the mode rot guard
INVERTED (mode MUST be light — the dark half is the S48 audit's own: the
mode is the discriminator on this very cell), the volume-EXACT guard
(300/200/250), the ALL-ACCENTS + ALL-VIEWS guards, the LANDSCAPE vehicle
contract (the below-lg family) + the drawer-own nav-scroll contract at the
landscape geometry (the ~301px nav area at 390 height), the per-accent
applied self-verification, the drawer link census + the drawer-error class,
the interaction classes in LIGHT at LANDSCAPE at volume, the structural
below-lg family at volume, the S16 overflow class at the landscape width,
the S13 B2/B3 budgets with boundary-exact pins, the LIGHT detector family
(NO flashbulbs — the class exists only in dark; unreadable < 2.2 with the
THREE signature-strict light exemptions: the CTA-face + the calendar
adjacent-day + the yellow priority-pill; lowcontrast < 3.2 = WARN), and the
/api/tasks ≤ 500KB B1 bound → **489/489 in the file; the full unit layer
773 (733 + 40)**; lint ✓ tsc ✓.

**The probe** `scripts/accent-volume-light-landscape-sweep.mjs`: the S47
light volume lifecycle + drawer vehicle verbatim, re-anchored to the
landscape light half — `W=844; H=390`, the LIGHT checker (the S43/S45/S47
family — NO flashbulbs, the light canvas fallback `rgb(248, 250, 252)`) +
the drawer-scoped LIGHT checker, the light-mode precondition through the
REAL lifecycle with the greeting-heading hydration gate (the S43/S45/S47
lesson: `!html.dark` is TRUE at first paint, so the gate is the POST-MOUNT
observable), the per-accent gate with the shell-presence guard from birth
(the AP-90 lesson applied to the landscape vehicle), the drawer-own
nav-scroll contract re-measured per accent, the marker `STRESS-S49-`, and
the exit-code computation with the THREE light exemptions. Syntax ✓
(node --check).

**The runner's 31st audit stage** `{ accent-volume-light-landscape-sweep,
timeoutMs: 25 min }` directly after the S48 dark landscape sibling (the
volume family together: dark desktop, light desktop, dark mobile, light
mobile, dark mid-band, light mid-band, dark landscape, then light landscape
— the cross-axis COMPLETE) + the stage-count literals (`0/31`, `${i+1}/31`
×2, `31/31`) + the header comment — the suite now **33 rows**. The
in-flight arrival run holds the 30-stage version loaded at launch (the
documented pattern — the runner edits are invisible to a running instance).

**The docs aligned** (the AP-74 guard): AGENTS (the 773 line + the command
entry + the 31-audit suite entry), vitest.config.ts (773), CLAUDE (773 +
the S49 seam note), PAD §8.1 (the classifier + 449 → 489 + Total
1064/773), README (the badge + the counts + the session-49 status row),
SKILL (the counts). `.env.example` audited (matches, tracked). The evidence
capture script `scripts/capture-s49-evidence.mjs` written (the S48 pattern
mirrored onto the light landscape half; marker `STRESS-S49-CAP-`).

## An honest process note (the mid-run interruption)

The first arrival-suite launch was accidentally killed at stage 10/30: a
syntax-verification one-liner (`bun -e 'import(…)'`) on the just-edited
runner actually EXECUTED the module, spawning a second concurrent suite
instance against the shared dev server + DB — both instances were killed
to protect the shared surfaces (the documented conflict class). The DB was
verified clean after the kill (theme light/violet, zero stress markers —
the killed stages' cleanups had already run), the runner file was
temporarily reverted to the 30-audit version via `git diff | git checkout`
(a 58-line patch parked at /tmp), and the arrival suite was relaunched
clean on the documented 30-audit baseline. The parked S49 runner patch is
re-applied BEFORE the validation suite (the next step) — the protocol's
arrival/exploration/validation separation preserved exactly.

## The validation protocol (the remaining steps)

The arrival suite (32 rows, the in-flight 30-audit version) is running as
this narrative is written; its result, the exploration (the genuine run 1
against the dev server, AFTER the arrival suite releases the shared
surfaces), the validation suite (the S32 differential: the dev server
restarted by PID, the preflight GREEN, the fresh clean 33-row window with
the S49 stage re-applied), the final gates (lint, tsc, 773 unit, build,
cold-db 291 e2e = 1064 green), and the evidence (the s49 PNG + the 33-row
JSON + the standing 31 refreshed) are recorded in
`docs/remediation-plan-session49.md`'s execution log and summarized in
`docs/session_122.md`.

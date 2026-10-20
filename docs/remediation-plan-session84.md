# Remediation Plan — Session 84 (S84): the S83+1 stability confirmation — the standing arrival audit (the FIFTEENTH arrival; the THIRD continuation form — the workspace NOT reset at the session boundary)

**The session's governing question (2026-10-20):** the S83 session closed a
clean single-part fresh-clone arrival with every rebuild step and every gate
first-try, the standing suite GREEN 35/35 ON RUN 1 (the seventeenth
consecutive clean envelope, the ninth consecutive clean RUN 1 form), and the
capture-delta reading the chain's first FULLY-STABLE-EPOCH pair (the
clock-digit family only, the collapsed pair zero-delta). Since the S83 close,
ONE commit landed (`9d0e8b7` — `docs/session_273.md`, the owner's commit of
the S83 raw transcript [the full operational log] — doc-only). This session
owed the standing arrival audit per the documented protocol — and the
workspace SURVIVED the session boundary (the repo at `21a8457`+fetch, the
node_modules/.env/chromium v1243/the SSH venv + the shim all present; the
daemon stopped and the operator key shredded by the documented S83 close),
making this the FIFTEENTH arrival in the THIRD continuation form of the
chain (S80, S81, S84). The audit read **ZERO codebase findings on every
axis**. **Zero code changes by design** (the S53–S83 precedent: the smallest
safe diff is no diff on a verified-green production codebase — the 32nd
consecutive zero-code session; the codebase holds at the verified-green S52
state).

**The session's process shape:** a continuation-form arrival — the preserved
S83 environment needed only the documented minimal rebuild (the custom.db
cold re-seed to the pin, the fresh daemon, the operator key re-materialized
from the embedded key text). Every rebuild step and every gate landed
first-try. The session's process notes concentrate in three places: the SSH
verifier carried UNCHANGED from the S83-corrected form and read ALL GREEN on
its FIRST run (the "three sessions, three distinct pairs" streak settles —
the corrected form now stands, no new correction this cycle); the
capture-delta's SECOND fully-stable-epoch pair (clock-digit family only, the
collapsed pair zero-delta for the second consecutive time); and TWO
tooling-placement notes (the agent-browser screenshot daemon resolving
relative paths against ITS OWN cwd, not the calling shell's; the SSH
wrapper's `__file__`-anchored repo resolution requiring the canonical
`docs/` placement).

## The scope (validated against the codebase before execution)

1. **The arrival (the fifteenth arrival, the third continuation form)**: the
   workspace NOT reset — the repo intact at `21a8457` (clean), advanced to
   `9d0e8b7` by a fast-forward `git pull` (the single owner commit
   `docs/session_273.md` — doc-only). The pins verified: `src/` at
   `193132f` (the S52 pin), the SKILL doc at `c5378bc`, README advanced only
   by the session-83 row (the arch-docs pin reading `a780676` — the S83
   evidence commit itself), `.env.example` matching the live `.env` key set;
   vitest + playwright wired; the `skills/` folder excluded from all
   checking/testing/compilation per the standing contract. The survived
   environment audited: node_modules present, chromium v1243 present, the
   SSH venv at /home/z/ssh-venv (paramiko 5.1.0 importing clean) + the
   Appendix A shim at /home/z/my-project/bin/ssh (the shebang repointed at
   the venv python), the operator key correctly ABSENT (shredded by the S83
   close — re-materialized in §7).

2. **The minimal rebuild (continuation form, first-try)**: `rm -f
   db/custom.db db/e2e.db` (the post-suite custom.db at 3,563,520 bytes
   cold-reset), `db:push` + `db:seed` → **custom.db re-seeded to exactly the
   303,104-byte pin**; the daemon launched via the S32 subshell recipe
   FIRST-TRY (health 200 in ~14 s); the preflight GREEN (hydrated +
   navigation-stable); the drawer-check GREEN (backdrop/panel/links/no-footer
   + Escape-close superset). The seed epoch ~07:48 UTC Oct 20 — post-midnight,
   anchoring Oct 20 (the same-date seed-anchor pair with S82/S83).

3. **The baseline gates (first-try)**: lint ✓ tsc ✓ **834 unit ✓** (20
   files, 3.93 s) build ✓ — cold-db e2e **299/299** (4.7 min, zero flake,
   `rm -f db/e2e.db` first — the S46 cold-run doctrine) = **1133 GREEN** —
   the TWENTIETH consecutive identical count, the run sitting wholly inside
   07:4x–07:5x UTC Oct 20 (no midnight-rollover exposure; the session window
   itself wholly inside the MORNING bucket — no bucket transition before any
   capture).

4. **The clone walkthrough (agent-browser 390×844 → 1280×800)**: fully
   GREEN — the MORNING greeting "Good morning, Demo Student 👋" (the
   same-bucket MORNING pair with S81/S82/S83 — no bucket transition this
   cycle); the mobile shell exact (390 / aside display:none / burger 17,14
   36×36, aria "Open navigation menu"); the drawer census + traps 4/9/7
   clean in ONE IIFE-wrapped probe (backdrop blur(4px) + oklab(0 0 0 / 0.2)
   / panel 288×844 white / 20 links / navSH 1068 vs 755 / ul flex gap 4px
   padding 0 — **NO Tailwind v4 bug**); the active-link triple-pin exact on
   the drawer's own visible instance (the violet-600 label on the inner
   span rgb(124,58,237) + the violet→indigo 10% gradient `rgba(139,92,246,.1)
   → rgba(99,102,241,.1)` + the violet-500 dot rgb(139,92,246) at computed
   6×6 with the exponential radius serialization); Notes via the drawer
   (auto-close — the drawer fully UNMOUNTED on navigation; the H2 identity;
   no overflow); Escape-close (the superset — full unmount); both desktop
   states (expanded 260/1020 + 40 text-bearing spans + 0 aria + the burger
   at a 0×0 box — the zero-box hidden form; collapsed 80/1200 + navSvgX
   33.000 + the chevron rotate: 180deg [v4's rotate computed property — the
   button relabeled "Expand sidebar"] + labels UNMOUNT + 20 aria + pref
   "1"); the shared icon-only drawer (288×844/svgX 32.0/navSH 988 vs 755/0
   text-bearing/20 aria — measured at MOBILE with the collapsed pref, the
   S52 shared-state design); the preference reload round-trip in BOTH
   directions (pref "1" → reload → aside 80/1200 persists; expand → pref
   "0" → reload → aside 260/1020 restored — the documented final reading).

5. **The reference re-sweep (operator login at 1280×800 → 390×844)**:
   UNCHANGED since S52–S83 — the 33rd consecutive unchanged sweep; the four
   anchors exact (the title "AcademiaFlow (Copy)"; the settled MORNING
   greeting "Good morning, sepnetflix2023 👋" — the same-bucket morning pair
   with the clone; the 20-view order in the documented sequence; the five
   Settings tabs: Appearance/Profile/Subjects/Holidays/Notifications —
   navigated via the drawer's icon-only rail, auto-closed on navigation);
   both sidebar states (expanded 260/260/1020; collapsed 80/80/1200/svgX
   33.0/the matrix(-1,0,0,-1,0,0) chevron/labels UNMOUNT/ZERO aria —
   toggled via the S81 structural finder, the unlabeled header button at
   x=201/y=37, no logo-icon over-match this cycle); the shared collapsed
   drawer (panel 288×844 / svgX 32 / navSH 912 vs 744 / ZERO aria — the
   clone's a11y superset; the backdrop DIV blur(4px) + rgba(0,0,0,0.2) as
   the panel's SIBLING — re-verified through the panel's parent-sibling
   census); the Escape-close absence via the geometry probe (the drawer
   stays open — both fixed layers persist); the preference restored (the
   reference's own `sidebarOpen` form — true, 260/1020); the CTA gate exact
   ("Start My Day" x1093/y46/155×36).

6. **Mode-C**: the static scan clean (zero TODO/FIXME/console.log/`: any`
   in src/; the two documented exceptions re-verified — the eval( prose
   comment in calculator.ts:4 and the THEME_BOOT_SCRIPT
   dangerouslySetInnerHTML in layout.tsx:44); the dep-audit GREEN (exit 0;
   verdict "deps pinned by design (majors), client bundle lean, no action";
   clientStaticKb 1448; outdatedCount 0; the 2 non-production advisories —
   braces via eslint-config-next, deepmerge-ts via the prisma CLI; 0
   runtime-reachable); the registry re-check UNCHANGED (the twenty-ninth —
   braces 3.0.3 = latest, no fix release, unfixable upstream; the repo on
   Prisma ^6.11.1 [lockfile 6.19.3], the prisma CLI's latest dist-tag
   still on the Prisma 8 RC [8.0.0-rc.23], owner decision; the
   @prisma/client package's own latest reads the stable 7.10.1);
   scandihaven unchanged (`d4789c3`).

7. **The SSH infrastructure (the continuation form — the venv + shim
   survived; the key re-materialized)**: the operator key MATERIALIZED (399
   bytes, 0600, outside the repo at
   /home/z/.operator-keys/omni-study-deploy.key) + fingerprint-verified via
   the embedded WIRE-FORMAT public blob (SHA256
   3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU, the documented identity —
   an exact match, with the full structural parse: the 15-byte AUTH_MAGIC
   'openssh-key-v1\0', checkints 3917d528 matching, the three-strings
   priv-section form [algo][pub 32][priv64 64], the priv-section pub == the
   blob keymat, the 64-byte priv64's TAIL == the pub [the Ed25519 form:
   priv64 = seed 32 ‖ pub 32], the comment pete@pop-os, the [1,2] padding,
   the paramiko 5.1.0 asbytes() cross-check == the FULL 51-byte wire pub
   blob) — **ALL GREEN ON THE FIRST RUN: the S83-corrected verifier carried
   UNCHANGED, no new correction pair this cycle** (the S82→S83
   "three sessions, three distinct pairs" streak settles — the corrected
   form now standing). The wrapper dry-run GREEN with the REQUIRED
   --remote git@github.com:nordeim/omni-study.git flag [remote @ `9d0e8b7`
   == local HEAD, "Everything up-to-date"; the temp key shredded by the
   wrapper; the shim on PATH] — **run from the canonical `docs/
   ssh_git_wrapper_v3.py` placement** (byte-identical to the skills/ copy;
   the wrapper resolves the repo root as two levels up from its own
   `__file__`, so the skills/ placement resolves to the skill dir and dies
   with "does not look like a git repository" — a placement note recorded
   for every future session).

8. **The evidence captures**: the 5 dev-server screenshots (the desktop
   expanded; the desktop collapsed; the mobile icon-only drawer @ 0 labeled
   spans; the mobile labeled drawer @ 20 labeled links via the pref
   round-trip; Notes via the drawer auto-close) + the 2 reference captures
   (nav-scroll-top — the desktop expanded 1280 + the mobile labeled drawer
   390) — saved as `docs/screenshots/s84-*.png`. **ONE tooling note**: the
   agent-browser daemon saves RELATIVE screenshot paths against the
   DAEMON'S cwd, not the calling shell's — the first five shots landed in
   /home/z/my-project/ (the daemon's launch cwd) and were moved into
   docs/screenshots/ intact (dimensions re-verified: 1280×800 / 390×844);
   the reference pair was captured with ABSOLUTE paths (the corrected form
   — the standing practice from now on).

9. **The capture-delta vs the S83 counterparts** (the pure-stdlib Python
   PNG decoder — the classifier hand-adapted from the S83 form with
   HAND-WRITTEN PAIRS, zero tooling incidents, + the live elementFromPoint
   attribution): the **CLOCK-DIGIT family ONLY** — the chain's SECOND
   FULLY-STABLE-EPOCH capture pair: same bucket (both MORNING), same date
   (both Oct 20), same seed anchor (both seeds post-midnight Oct 20 — S83
   seeded ~05:57 UTC, S84 seeded ~07:48 UTC). 134 total differing rows
   across the 7 pairs, every band at a documented clock position and
   attributed LIVE: the clone footer clock rows 678–695 (x 47–104 —
   `P.sf-clock-time` reading "08:04 AM"), the clone mobile app-bar clocks
   through the drawer backdrops rows 17–46 (x 305–356 — a `text-sm
   font-medium` DIV reading "08:04 AM", seen through the translucent
   backdrop BEYOND the 288-px panel) in BOTH drawer forms, the Notes
   app-bar clock rows 27–36 (x 316–345 — "08:05 AM"), the reference footer
   clock rows 649–666 (x 47–104 — a `P` reading "08:05 AM"), the reference
   drawer app-bar rows 18–46 (x 306–356). **The clone-desktop-collapsed
   pair read ZERO differing pixels — the SECOND consecutive zero-delta
   collapsed pair** (the collapsed footer unmounts the clock+user row by
   design). The GREETING-BUCKET, DATE, and DAY-RELATIVE-WIDGET families
   ALL ABSENT — the predicted second fully-stable form (the S83
   close-out's own expectation). ZERO structural movement; recorded
   without action.

10. **The standing suite**: launched detached 08:03:28 UTC Oct 20 via the
    S32 setsid subshell recipe (ONE launch — the window's ONLY consumer;
    the limiter budget fresh, no AI-route consumption this session before
    the launch; /tmp/standing-suite/ wiped; the preflight + drawer-check
    GREEN immediately before). **GREEN 35/35 ON RUN 1** — see §The
    standing suite result below (the anti-fabrication discipline honored:
    the result appended only after the real envelope was extracted and
    verified against the stage table).

## The findings table

| # | Axis | Finding | Severity | Disposition |
|---|------|---------|----------|-------------|
| 1 | Capture-delta | The CLOCK-DIGIT family ONLY — the chain's SECOND fully-stable-epoch pair (same bucket MORNING + same date Oct 20 + same seed anchor Oct 20); 134 differing rows, every band at a documented clock position, every band attributed live; the collapsed pair ZERO-delta for the SECOND consecutive time; the greeting/date/day-relative families ALL absent (the S83 close-out's own prediction) | Process (live-state) | Recorded without action. The classification doctrine holds: a capture pair whose SEEDS anchor the same date reads clock-digits only — the second consecutive fully-stable form |
| 2 | SSH verifier (tooling) | The S83-corrected verifier carried UNCHANGED and read ALL GREEN on its FIRST run — no new correction pair this cycle (the S82→S83 "three sessions, three distinct pairs" streak settles; the corrected form now standing) | Process (tooling) | Recorded — the corrected verifier is now the standing form for every future materialization |
| 3 | Screenshot tooling | The agent-browser daemon resolves RELATIVE screenshot paths against the DAEMON'S cwd (its launch directory), not the calling shell's — the first five shots landed in /home/z/my-project/ and were moved intact; the reference pair used absolute paths | Process (tooling) | Recorded — ABSOLUTE paths for every screenshot henceforth (the standing practice) |
| 4 | SSH wrapper placement | The wrapper resolves the repo root as two levels up from its own `__file__` — the skills/ copy resolves to the skill dir and dies ("does not look like a git repository"); the canonical `docs/ssh_git_wrapper_v3.py` placement (byte-identical) runs GREEN | Process (tooling) | Recorded — the wrapper is ALWAYS invoked from `docs/ssh_git_wrapper_v3.py` |
| 5 | Baseline gates | 1133 GREEN — the twentieth consecutive identical count; first-try, no midnight-rollover exposure (the run wholly inside 07:4x–07:5x UTC Oct 20) | — | Confirmed standing |
| 6 | Mobile navigation | Working as expected; NO Tailwind v4 bug (traps 4/9/7 clean in one probe; the triple-pin exact on the visible instance; the drawer census exact to every pin) | — | Confirmed standing |
| 7 | Reference parity | UNCHANGED — the 33rd consecutive sweep; all four anchors exact; the same-bucket MORNING pair; the structural toggle finder clean (the unlabeled x=201 button, no logo-icon over-match) | — | Confirmed standing |
| 8 | Static scan / dep-audit / registry | Clean / GREEN (2 non-production) / UNCHANGED (the 29th; braces unfixable upstream; the Prisma major upgrade remains the owner's decision) | — | Owner decision standing |

## The executed ToDo list

- [x] `git pull` to `9d0e8b7` (the owner's `docs/session_273.md` — doc-only); pins verified (src/ `193132f`; SKILL `c5378bc`; README at the session-83 row; .env.example matching)
- [x] Survived environment audited (node_modules, .env, chromium v1243, the SSH venv + shim); custom.db cold re-seeded to the 303,104-byte pin first-try; db/e2e.db cold-reset
- [x] Baseline gates: lint ✓ tsc ✓ 834 unit ✓ (20 files, 3.93 s) build ✓ cold e2e 299/299 (4.7 min, zero flake) = 1133 GREEN — the 20th consecutive
- [x] Standing checks: daemon first-try (health 200); preflight GREEN; drawer-check GREEN
- [x] Clone walkthrough: fully GREEN — MORNING greeting; mobile shell; traps 4/9/7; the triple-pin; Notes via the drawer (auto-close); Escape-close; desktop expanded (the 0×0 burger form); desktop collapsed (navSvgX 33.000 + rotate 180deg); the shared icon-only drawer (the mobile form, the collapsed pref); the pref round-trip BOTH directions
- [x] Reference re-sweep: UNCHANGED — the 33rd (the four anchors; both sidebar states via the structural finder; the shared drawer + the backdrop-sibling census; the five Settings tabs; the Escape-close absence; the pref restored; the CTA gate exact)
- [x] Mode-C: static scan clean (the two documented exceptions re-verified); dep-audit GREEN (exit 0); registry UNCHANGED (the 29th); scandihaven `d4789c3`
- [x] SSH: the key re-materialized (399 bytes/0600/outside the repo); the S83-corrected verifier ALL GREEN first-try + fingerprint EXACT MATCH; the wrapper dry-run GREEN with `--remote` (from the canonical docs/ placement)
- [x] The 7 captures (5 clone + 2 reference, nav-scroll-top; the daemon-cwd placement note recorded)
- [x] Capture-delta classified: the CLOCK-DIGIT family only — the second fully-stable-epoch pair; the collapsed pair zero-delta (second consecutive); every band attributed live; zero structural movement
- [x] The standing suite launched detached 08:03:28 UTC (ONE launch, the window's ONLY consumer, fresh limiter budget) — **GREEN 35/35 ON RUN 1** (the result appended from the real envelope after the stage-table verification; the extractor carried unchanged — no correction this cycle)
- [ ] The evidence commit + the follow-up commit + the SSH wrapper push to main
- [ ] The operator key shredded; the daemon stopped; the worklogs closed

## The execution log

- **07:44–07:45 UTC — arrival**: the workspace found NOT reset (the repo at
  `21a8457`, clean, node_modules/.env/chromium v1243/the SSH venv + shim
  survived; the daemon stopped + the key shredded by the documented S83
  close). The remote probed: `9d0e8b7` ahead — the fast-forward pull brought
  `docs/session_273.md` (the owner's S83 raw transcript, doc-only). The pins
  verified in one pass (src/ `193132f`; SKILL `c5378bc`; the arch-docs pin
  at `a780676` = the S83 evidence commit; `.env` == `.env.example` keys).
- **07:47–07:49 UTC — the minimal rebuild**: `rm -f db/custom.db db/e2e.db`;
  `db:push` + `db:seed` → custom.db at **exactly the 303,104-byte pin**
  first-try (the seed epoch ~07:48 UTC, post-midnight — anchoring Oct 20);
  the daemon via `( setsid bun run dev </dev/null >/dev/null 2>&1 & )`
  first-try (health 200 in ~14 s); the preflight GREEN; the drawer-check
  GREEN.
- **07:48–07:53 UTC — the gates**: lint clean; tsc clean; 834 unit tests in
  3.93 s (20 files); the production build green; the cold e2e run (after
  the `rm -f db/e2e.db`) 299/299 in 4.7 min with zero flake — **1133 GREEN,
  the twentieth consecutive identical count**.
- **07:53–07:58 UTC — the clone walkthrough**: the full mobile pass in the
  documented order (login → greeting → shell → the drawer census + traps
  probe → the triple-pin → Notes via the drawer → Escape-close), then the
  desktop pass (expanded → collapsed via the exact-label "Collapse sidebar"
  click → the icon-only drawer at mobile with the collapsed pref → the
  preference round-trip both directions). Every pin exact; no findings.
- **07:58–08:01 UTC — the reference re-sweep**: the operator login at
  1280×800; the four anchors; both sidebar states (the structural x=201
  toggle); the shared collapsed drawer at 390×844 + the backdrop-sibling
  census; the Escape-close geometry probe; the five Settings tabs via the
  icon-only rail; the preference restored; the CTA gate — **UNCHANGED, the
  33rd consecutive sweep**.
- **08:01–08:02 UTC — Mode-C + the registry**: the static scan clean (the
  calculator.ts:4 eval( prose comment + the layout.tsx:44 THEME_BOOT_SCRIPT
  re-verified as the two documented exceptions); the dep-audit exit 0 (GREEN
  verdict, clientStaticKb 1448, outdatedCount 0); the registry re-check
  UNCHANGED (braces 3.0.3; the prisma CLI on the 8 RC; @prisma/client
  stable 7.10.1); scandihaven at `d4789c3`.
- **08:02–08:03 UTC — the SSH infrastructure**: the key re-materialized; the
  S83-corrected verifier run — **ALL GREEN on the first run** (the
  fingerprint EXACT MATCH; the full structural parse; the paramiko
  cross-check). The wrapper dry-run: the first attempt from the skills/
  copy died on the `__file__` anchoring (the placement note); the canonical
  `docs/` placement GREEN with the REQUIRED --remote flag (remote @
  `9d0e8b7` == local HEAD; "Everything up-to-date"; the temp key shredded).
- **07:56–08:01 UTC — the captures**: the 5 clone shots + the 2 reference
  shots saved; the daemon-cwd placement note discovered on the clone set
  (moved intact, dimensions re-verified) and pre-empted on the reference
  pair (absolute paths).
- **08:03:28 UTC — the suite launch**: /tmp/standing-suite wiped; the
  preflight + drawer-check re-verified GREEN immediately before; the ONE
  detached launch via the S32 setsid recipe; the run monitored live by
  this single operating session (bounded wait-rounds, no restart
  boundary).
- **08:04–08:06 UTC — the capture-delta (while the suite runs)**: the
  classifier hand-adapted from the S83 form (hand-written pairs); the
  read: the CLOCK-DIGIT family only, 134 rows, every band attributed live
  (the footer clocks, the app-bar clocks through the drawer backdrops, the
  Notes clock, the reference footer + drawer app-bar); the collapsed pair
  zero-delta — the second fully-stable-epoch pair, exactly as the S83
  close-out predicted.
- **08:03:28 → 09:08:57 UTC — the suite**: GREEN 35/35 ON RUN 1 (~65.5 min,
  ONE launch, zero incidents; the INP proxy 1493 ms within budget; the
  eighteenth consecutive clean envelope, the tenth consecutive clean
  RUN 1 form; monitored live end-to-end, no restart boundary); the
  envelope extracted, verified against the stage table (ALL checks
  passed first-try — the S83-corrected extractor carried unchanged), and
  saved with the launch-provenance note.
- **The docs alignment, the evidence commit, the follow-up commit, the
  SSH wrapper push, and the session close** — to follow.

## The standing suite result — GREEN 35/35 ON RUN 1

**The result (appended from the REAL completed run per the anti-fabrication
discipline):** the suite ran 08:03:28 → 09:08:57 UTC Oct 20 (~65.5 min — the
last raw stage JSON at 09:08:56 + the closing guard; the completion read at
09:13:57) under this single operating session's live monitoring — seven
bounded wait-rounds, zero restart boundaries, zero tool timeouts (the SIXTH
consecutive cleanest-envelope-provenance form, the S79–S84 sextet).

**GREEN 35/35 ON RUN 1 — ZERO total findings, ZERO incidents:**
- the security row ZERO findings + 7 nonGaps (the healthy limiter shape,
  the fresh-budget launch form)
- cwv-volume-stress ZERO findings in-suite — the INP proxy
  Dashboard→Tasks **1493 ms** under the full Lighthouse throttle (4x CPU
  + Slow-4G) — within the documented noise band, ≤ 3000 budget (the
  chain's readings
  1391→1487→1444→1638→1487→1391→1735→1525→1576→1739→1493 all inside
  budget)
- cwv GREEN with 3 ref POOR informational (the reference's own documented
  state — informational, not a clone finding)
- the theme-restore guard light/violet (a mid-suite crash must not leave
  the demo user mutated — it did not)
- the EIGHTEENTH consecutive clean-envelope reading and the TENTH
  consecutive clean RUN 1 form (S75–S84)

**The envelope saved and verified against the real stage table** before
saving — every check passed FIRST-TRY (the S83-corrected extractor carried
unchanged, no regex correction this cycle): the final verdict line
("STANDING SUITE: GREEN — 35/35 green"); the 35 table rows all GREEN/0
(the no-leading-pipe table-row form pre-applied correctly); the
envelope-vs-table row-for-row agreement (35 = 35); failed [] / not aborted /
"35/35 green"; the stage list matching the S83 envelope row-for-row (no
drift); the raw dir at exactly 34 files (the closing guard writes none by
design); the security row's 0+7 shape re-verified from its own raw JSON.
Saved with the launch-provenance note at
`docs/screenshots/s84-standing-suite-evidence.json`.

The count anchors (1133/834/299) untouched — zero code changes.

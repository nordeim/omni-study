# Session 77 (S77) — the S76+1 stability confirmation: the standing arrival audit (the tenth fresh-clone rebuild) — narrative

The S76 session closed the S75+1 stability confirmation with the 1133
gates re-confirmed byte-for-byte on the ninth fresh-clone rebuild, the
standing suite GREEN 35/35 ON RUN 1 (the second consecutive clean RUN 1
form), and the capture-delta reading the greeting-bucket + date +
clock-digit families (the evening→morning transition pair — the chain's
second bucket transition). Since the S76 close, SIX commits landed
(`7a429a8` — the S76 evidence [the plan + the 35-row envelope + the 7
captures + session_239/240 + the README row + the worklog entry];
`f0a5082` — session_241, the S76 process log; `b1ba640` — session_242,
the S76 Chinese final transcript; `5d2f3bc` — session_243, the S76 raw
process log; `1fd496b` — session_244, the S76 final summary; `ed452f0` —
session_245, the S76 raw process log + a skills/-folder update in the
excluded zone). This session owed the standing arrival audit per the
documented protocol (the S76 "open for you" ③) and read **ZERO findings
on every axis**, closing with **zero code changes by design** (the
S53–S76 precedent).

## The arrival — the reset boundary; the environment rebuilt

The workspace was found RESET at session open — the same one-session
cadence as S71→S72 through S75→S76 — the TENTH fresh-clone rebuild of
the chain (S66/S67/S68/S69/S71/S73/S74/S75/S76/S77). The rebuild recipe
(the S71–S76 form, now a ten-times-field-tested routine) executed
cleanly: `.env` from `.env.example` (`DATABASE_URL="file:../db/custom.db"`
+ `AUTH_SECRET=""`), `bun install` 489 (8.05 s), `db:push` + `db:seed`
→ **303,104 bytes — the pin byte-identical**. The Playwright chromium
v1243 reinstall ran in the FOREGROUND form (the S76 lesson applied from
the start) and completed normally first-try (114.3 MiB) — no reaping
this cycle. The five core docs re-read (AGENTS/CLAUDE/PAD unchanged
since `193132f` [S52], the SKILL doc since `c5378bc`, README advanced
only by the session-76 row, the worklog by the S76 entries, `src/` still
`193132f`); the session docs (session_244 + remediation-plan-session76 +
the worklog tail + session_245) absorbed; the six post-S76 commits
verified — doc-only for the app, with the `ed452f0` skills/-folder
update (the agent-browser SKILL refreshed upstream, the
full-page-screenshot + replicate-web-app + reference-run skills added,
skill-creator slimmed) confined to the EXCLUDED zone; the last app-code
change remains the S52 four-file fix.

## The baseline gates — 1133 GREEN, the thirteenth consecutive identical reading

lint ✓ tsc ✓ **834 unit ✓** (20 files, 3.67 s) build ✓ (exit 0 — the
ONE Turbopack warning the documented session-22 edge-runtime notice for
the AUTH_SECRET boot guard's intentional `process.exit(1)` in
`src/instrumentation.ts:31`), then the cold-db e2e (`rm -f db/e2e.db`):
**299/299 ✓** (4.5 min, zero flake) = **1133 GREEN** — byte-for-byte
the documented state, the counts' THIRTEENTH consecutive identical
reading. The count anchors (1133/834/299) untouched.

## The standing checks — the daemon-launch form is load-bearing

The FIRST daemon launch — an IMPROVISED form
(`setsid bash -c 'exec bun run dev …' &`, no subshell-exit) — served
health 200 in-call and was then REAPED at the first tool-call boundary
(connection refused, the process gone). The documented S32 subshell
recipe — `( setsid bun run dev </dev/null >/dev/null 2>&1 & )` —
relaunched verbatim and survived every subsequent tool call (health
200). The process note: the recipe's STRUCTURE is load-bearing, not
cosmetic — the subshell backgrounds the daemon AND exits while the tool
shell lives, re-parenting the daemon to PID 1 before the reaper sweeps
the process tree. The S76 note generalized the reaping to the INSTALLER
step; this cycle extends it to ANY non-subshell detached form. The
preflight GREEN (hydrated + navigation-stable — the single
compile-triggered navigation in the 8s window on first hit); the
drawer-check GREEN (backdrop blur(4px) / panel 288 / 20 links / no
footer / Escape-close superset).

## The live walkthrough — mobile navigation working; NO Tailwind v4 bug

The live agent-browser 390×844 walkthrough on the clone: the mobile
shell exact (scrollWidth 390, the aside `display: none`, the burger
visible with aria-label "Open navigation menu"); the greeting **"Good
morning, Demo Student 👋"** — the MORNING bucket, the SAME-BUCKET pair
with S76 (S76 ~01:15 UTC morning, S77 ~04:15 UTC morning — no bucket
transition this cycle). The drawer census exact (the root wrapper `fixed
inset-0 z-50 lg:hidden`; the backdrop BUTTON 390×844 + the panel DIV
288×844 as its two children; 20 links in the exact reference order at
48px; the NAV the scroll container **1068 vs 755** — the VERTICAL pair,
scrollW 288 = clientW 288 by design). **Traps 4/9/7 verified live clean
in ONE probe** (the IIFE-wrapped form — the S76 eval-context lesson
applied from the start): trap 4 the drawer nav UL display flex / column
/ rowGap 4px / margin 0px; trap 9 the backdrop BUTTON
`backdrop-filter: blur(4px)`; trap 7 `bg-black/20` serializing
`oklab(0 0 0 / 0.2)`. **The mobile navigation menu working as expected
— NO Tailwind v4 bug.** The active-link triple-pin exact on the drawer's
own VISIBLE instance (the violet-600 label `rgb(124, 58, 237)` + the
violet→indigo 10% gradient on the label-wrapper + the trailing
violet-500 dot background `rgb(139, 92, 246)` at computed 6×6
rounded-full). Notes via the drawer (auto-close unmounts the drawer; H2
identity; scrollWidth 390); Escape-close (the drawer unmounts — the
clone's superset); both desktop states (expanded 260/260/1020 with the
40 text-bearing spans — the two-span-per-link structure — and 0
aria-labeled; collapsed 80/80/1200 with nav svgX 33 + the chevron svg
x=32 rotating via v4's `rotate: 180deg` property + the labels UNMOUNT +
20 aria-labeled); the shared icon-only drawer (288/44/svgX 32/nav 988
vs 755/20 aria/0 text-bearing); the preference restored with the reload
round-trip verified.

## The reference re-sweep — UNCHANGED (the 26th consecutive sweep)

The four anchors all exact: the title "AcademiaFlow (Copy)"; the settled
greeting **"Good morning, sepnetflix2023 👋"** (the MORNING bucket — the
same-bucket morning pair; NO transient "there" fallback observed this
cycle, the settled state read clean on the first probe); the 20-view
order byte-identical; the five Settings tabs exact. BOTH sidebar states
re-measured (expanded 260/260/1020, 20 labels, `sidebarOpen "true"`;
collapsed 80/80/1200, svgX 33, the chevron `matrix(-1, 0, 0, -1, 0, 0)`
glyph at svg x=32, `sidebarOpen "false"`, zero text-bearing labels).
The shared collapsed drawer (288/44/nav svgX 32/nav 912 vs 744/ZERO
aria-named — the clone's a11y superset); the DIV blur(4px) +
`rgba(0, 0, 0, 0.2)` backdrop found via the GLOBAL backdrop-filter
probe (the panel's SIBLING div, plus the documented glass header
blur(20px)); the Escape-close absence confirmed via the geometry probe
(the panel + backdrop both remain — the clone's documented superset);
the preference restored "true".

**The reference nav-scroll-state observation:** the FIRST capture-delta
comparison read 11 changed bands (rows 126–598, x 17–242) — far outside
the expected families. Pixel-structure inspection (the changed-pixel
clusters + colors) plus the live DOM diagnosed it: the reference's
sidebar nav PERSISTS ITS SCROLL OFFSET across navigations — the S76
capture flow had left the nav at scroll-top (the active Dashboard wash
at rows 126–173) while S77's Settings→Dashboard flow left scrollTop 199
(the wash displaced, every label glyph subpixel-shifted, the scroll
shadow moved). Both reference captures were RE-TAKEN at nav-scroll-top
(the S76 condition), collapsing the delta to the documented families. A
capture-condition artifact, not a reference change — the anchors all
verified live UNCHANGED independent of the scroll state.

**The reference Flashcards-wash observation:** the settled comparison
shows ONE full-width band (rows 558–605, x 17–242) + a small mobile
strip (rows 551–570, x 32–51) on the **Flashcards nav link**: a subtle
`rgb(248, 250, 252)` wash on the link's inner wrapper, present in S77's
captures and verified LIVE via computed styles, that S76's captures did
not carry. The reference's Flashcards page itself unchanged ("No decks
yet" — the same empty state documented across the chain); the account
data unchanged; the violet ACTIVE wash sits on Dashboard in both
captures. The reference's own live-state link tint (data/time-driven on
its backend; the cause not externally determinable) — NOT a structural
change, NOT a parity gap. Recorded as a probe observation, no action.

## The capture-delta — the CLOCK-DIGIT family; the collapsed pair BYTE-IDENTICAL

The classification vs the S76 counterparts (the pure-stdlib Python PNG
decoder + the x-distribution cross-check; the classifier expecting the
CLOCK-DIGIT family ONLY for the same-bucket morning pair on the same
date — and reading exactly that):

- **clone-desktop-expanded**: the sidebar-footer clock rows 678–695
  (x 46–104) — the documented band; the footer date chip UNCHANGED
  (same date).
- **clone-desktop-collapsed**: **BYTE-IDENTICAL** (217,654 = 217,654
  bytes) — the zero-diff form back (the S75 form; the byte-identical
  streak returns at one).
- **clone-mobile-drawer-icononly / -labeled**: the app-bar clock
  through the drawer backdrops' blur rows 17–46 (x 305–356 — ALL in
  the backdrop region, zero in any panel).
- **clone-mobile-notes**: the Notes app-bar clock rows 27–36.
- **reference-desktop-expanded**: the footer clock rows 649–666 + the
  Flashcards wash band (the live-state observation above).
- **reference-mobile-drawer-labeled**: the app-bar clock rows 17–46 +
  the Flashcards strip.

ZERO structural movement; zero changed pixels in any drawer panel or
sidebar chrome; zero greeting-bucket or date changes (the same-bucket,
same-date pair — the classifier's expectation met exactly).

## Mode-C, the dep-audit, the registry — all clean/unchanged

The static scan clean (zero TODO/FIXME/`: any`/`console.log` in `src/`;
the two documented exceptions re-verified: the `eval(` prose comment in
`src/lib/calculator.ts:4` and the THEME_BOOT_SCRIPT
`dangerouslySetInnerHTML` in `src/app/layout.tsx:44`). The dep-audit
exit 0 (the 2 documented non-production advisories — braces via
eslint-config-next on the dev surface, deepmerge-ts via the prisma CLI
— both outside the standalone runtime trace). The registry re-check
UNCHANGED (a twenty-second consecutive re-check): braces 3.0.3 = the
latest published (the fix release does not exist — unfixable upstream);
the repo on Prisma `^6.11.1` (lockfile 6.19.3); the 7.x stable line
still ends at 7.10.1; the `prisma` CLI's `latest` dist-tag still on the
Prisma 8 RC (8.0.0-rc.23) while `@prisma/client`'s own `latest` reads
the stable 7.10.1. Scandihaven unchanged (`d4789c3`, verified by
`git ls-remote`).

## The SSH infrastructure — the seventh rebuild; two verifier corrections

The dedicated venv `/home/z/ssh-venv` (uv, Python 3.12) + paramiko 5.1.0
(same version as the S71–S76 builds); the Appendix A shim at
/home/z/my-project/bin/ssh (compile-checked, the venv-python shebang);
the operator key materialized (0600, outside the repo). The wire-format
fingerprint verification: **SHA256
`3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` — EXACT MATCH**, with all
the structural checks exact (checkints `3917d528` matching, the
priv-section pub == the blob keymat, the 64-byte tail == the pub, the
comment `pete@pop-os`, the [1, 2] padding), cross-checked against
paramiko's own `Ed25519Key` parse. The freshly-written verifier carried
TWO in-session corrections before reading green: ① the wire-format
AUTH_MAGIC is **15 bytes** (openssh's `sshkey.c` serializes
`sizeof("openssh-key-v1")` INCLUDING the trailing NUL — a 14-byte magic
misaligns every subsequent field); ② the ssh-keygen SHA256 fingerprint
hashes the **full 51-byte public blob** (the authname length-prefix +
the key material), not the bare 32-byte keymat. The wrapper dry-run
GREEN **first-try** with the REQUIRED
`--remote git@github.com:nordeim/omni-study.git` flag (remote main @
`ed452f0` == local HEAD — "Everything up-to-date").

## The standing suite — launched as the window's ONLY consumer

All browser sessions closed; the standing suite launched detached at
04:29 UTC via the S32 setsid subshell recipe — ONE launch, the limiter
budget fresh (no AI-route consumption this session).

**THE RESULT (appended 05:34 UTC): GREEN 35/35 ON RUN 1** — ZERO total
findings, ZERO incidents (the security row ZERO findings + 7 nonGaps;
cwv-volume-stress ZERO findings in-suite, the INP proxy Dashboard→Tasks
1638 ms under the full throttle; the theme-restore guard light/violet) —
the ELEVENTH consecutive clean-envelope reading and the THIRD
consecutive clean RUN 1 form. The 35-row envelope saved
(`docs/screenshots/s77-standing-suite-evidence.json`) and verified
against the real stage table (35 rows, all green, findings 0, failed [],
not aborted — the anti-fabrication check). One resilience data point:
the operating session hit a mid-run tool-shell timeout and RESTARTED
while the suite stood at ~stage 18/33 — the setsid-detached suite ran
through it unaffected to completion (the S32 detach survives session
restarts, not just tool-call boundaries). Full form: the remediation
plan's suite-result appendix.

# Session 327 — the S96 process log (the zod advisory session)

The operational record of S96 — the 27th arrival audit, 2026-10-24 06:47 UTC onwards.

## Phase 0 — the arrival (06:47 UTC)

- The workspace RESET (no local repo); the fresh clone from `https://github.com/nordeim/omni-study.git` at `6874f3c` (main, clean, in sync). The S95 close verified complete: the evidence commit `10b9378` (14 files: the zero-code confirmation plan + session_320/321/322 + the README row + the 7 captures + the suite-envelope JSON + the worklog entry) + `975d8bb` (session_323, the raw transcript) + `bdf9f7e` (session_324, the session log) + `6874f3c` (the prompt copy).
- The core docs re-anchored: AGENTS.md re-read in full (the commands, the DB contract, the architecture facts, the 13 Tailwind v4 traps, the testing quirks, the conventions); the four non-README docs verified unchanged since S91; the README session table verified through the session-95 row (90 rows).
- The S95 artifacts absorbed: session_323 (the raw transcript), remediation-plan-session95, the worklog S95 entry, session_324.
- The pins verified: src `e6e26815` (both S94 change sites with their why-comments; `navSHParity` at drawer-check:105), `.env.example` correct, `db/` at the root, the `db:*` scripts inline, vitest + playwright wired, `.env` absent (re-created byte-identical).
- neo-crm cloned + reviewed (the operator's new tech-stack reference): AGENTS.md structure, package.json (the stack family), the skills catalog (the 340-skill family). The scandihaven pin re-checked: UNCHANGED at `5430197`.
- **The session window computed FIRST: 06:47 UTC — hour 6, MORNING, same bucket + same date as S95 → the capture-delta prediction documented BEFORE any probe ran: CLOCK-FAMILY-ONLY.**

## Phase 1 — the environment, the gates, the audit (06:47–07:2x UTC)

- `bun install` (489 packages, 7.15 s); the chromium v1243 install-gate re-encounter (the FIFTH consecutive session; fixed via `bunx playwright install chromium`); the cold push+seed to the 303,104-byte pin EXACT.
- lint ✓ tsc ✓ 844 unit ✓ (22 files) build ✓; **the first cold e2e read 309/310** — S52-F (the drawer icon-only form) failed once. The reproduction protocol: the single-file cold re-run 9/9 (the failing test green in 2.0 s); the FULL cold re-run **310/310** (4.7 min; the output captured to `/home/z/my-project/scripts/s96-e2e-remediated.log`-style files this time — the run-1 detail had been lost to `tail` truncation). **The verdict: the first e2e flake since S90 — an environment-load flake in the S52-F width-poll family (the S55 flake-fix history), a watch item.**
- The selector false alarm, investigated to closure: the displayed spec line read `nav aref="/Notes"` (apparently an invalid selector) — but the OCTAL DUMP showed `nav a[href="/Notes"]` intact. **This session's display pipeline eats `[` and backtick characters in file-read output** (both the Bash and Read tool outputs). The probes that "proved" the selector invalid had literally contained the mangled string. Recorded: bracket-sensitive reads must be verified with `od`/`grep -c`.
- The static scan clean (0 console.log, 0 TODO/FIXME; the two documented exceptions verbatim); the five S91 fix sites verified.
- **THE FINDING**: the dep-audit re-run surfaced the zod advisory (GHSA-mrhx-c7xc-m3w5, <4.6.6, high) classified dev-surface — while the runtime copy (top-level zod 4.6.5, imported by validation.ts/http.ts/math-solve, bundled into the route chunks) is IN range. The root cause isolated in three parts (the parser's marker drop; the trace-only ground truth missing bundled server deps; bun's NAME-based marker — proven live post-bump).
- **The TDD cycle**: RED (5 failing pins: the marker-recording parser, the zod-shaped classification, the envelope verdict) → GREEN (20) → the refinement (the false-positive class found by re-running the real audit post-bump: the marker alone must not trigger — the INSTALLED VERSION is the authority) → GREEN (24 total; 9 new) → the end-to-end proofs (the vulnerable tree FAILs exit 1; `bun add zod@^4.6.7`; the patched tree GREEN exit 0, zod dev-surface, deepmerge-ts cli).
- The gates re-verified on the remediated tree: lint ✓ tsc ✓ **853 unit** ✓ build ✓ cold e2e **310/310** = **1165 GREEN** (the unit anchor advances 844 → 853).
- The registry re-check the 41st: braces 3.0.3, prisma rc.27, @prisma/client 7.10.1, next 16.4.3 — ZERO movements. `bun audit` exit 1 (2 advisories — the recorded set; the S95 "exit 0" note reconciled as a recording-form difference; the dep-audit script remains the authority).
- The daemon (the S32 recipe, health 200 at ~22 s) + the preflight GREEN + **the drawer-check GREEN on ALL SEVEN checks** (`navSHParity: true`).

## Phase 2 — the walkthroughs (07:2x–07:4x UTC)

- The clone walkthrough fully green (agent-browser 0.39.0, mobile-first): the greeting anchor (MORNING as predicted); the S91 mechanics (focus/scroll-lock/Tab-trap ×25/Escape-restore/navigation-close); the census exact at the gapless form (992/48/48); the triple-pin exact (no Tailwind v4 bug); both desktop states + the pref round-trip + the 20-view order.
- The reference re-sweep (the 45th) fully green: the greeting pair + the date sub-line; the settle protocol 4/4 at 992/48/gapless/scrollTop 0; the Escape-close absence (the pre/post-state form); the desktop census both states; the 20-view order; the CTA gate 1093/46/155×36; the five Settings tabs; the preference restored.

## Phase 3 — the captures + the capture-delta (07:4x–08:0x UTC)

- The capture script written (the S85 contract; the capture-sNN family form; persisted at `scripts/capture-s96-evidence.mjs`).
- **The first pass surfaced three artifacts, each attributed live and recovered**:
  1. The login toast (the y16-92 top-right band + the blurred drawer bands; `elementsFromPoint` → `sf-toast-in`; fixed: settle the toast before any shot).
  2. The mouse-rest hover (the 56-row slate-50 band x293-919 — the "Annotate Keats ode" row's hover state; the login click's resting coordinates; fixed: the neutral corner-move before every shot).
  3. The drawer focus-ring form (a pointer click opens the drawer without `:focus-visible` on Close; the S95 set carries the violet ring — the (226,60) violet-500 sample; fixed: the keyboard open).
- The final set: the badge census (1 portal / 39 children); the watch-item two-state 860/788 EXACT (the fifth consecutive session); the settled forms verified at shot time on both sites.
- The amber sweep: **CLEAN in the dot region on all five** (the dot idle). The full-image 2174 amber-family pixels: the app's own standing content (the greeting emoji (235,172,55) + dashboard accents), byte-identical across the s95/s96 epochs (the cross-epoch split proved it). The window lesson recorded: the contract's failing check is dot-region-scoped.
- **The capture-delta vs S95 — the CLOCK-FAMILY-ONLY prediction held on EVERY pair**: the desktop pairs 18 rows (the footer clock) + 3 rows (the S88 dither — the exact S95 form, the zero-delta chain holding); the drawer pairs 30 rows each (the blurred clock, zero link-region bands); notes 10 rows (the exact standing form); the reference pairs 18/30 rows (their exact standing forms). Both sites byte-stable since S95 except the time axes.

## Phase 4 — the plan + the launch (08:0x UTC)

- The remediation plan written with the suite section held PENDING (`docs/remediation-plan-session96.md`).
- The pre-suite prep: the browser closed; the ports verified (3000 up, 3100/3200 free); `/tmp/standing-suite` wiped; the preflight green immediately before.
- **The standing suite launched 07:33:34 UTC detached** (the S32 recipe) on the REMEDIATED codebase — stage 0 green, stages 1-33 running (~68 min expected).

## The SSH infrastructure (while the suite runs)

- The sandbox form (no ssh, no system paramiko); the paramiko venv 5.1.0; the operator key materialized OUTSIDE the repo (0600); **the fingerprint verified: `3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` — the S92/S93/S94/S95 record identical**; the Appendix A shim extracted with the venv shebang; the wrapper byte-check; **the dry-run GREEN on the FIRST attempt** (remote @ `6874f3c` == HEAD, "Everything up-to-date", the temp key shredded).

## Phase 5 — the suite result + the docs + the push

- **THE STANDING SUITE: GREEN 35/35 ON RUN 1** (07:33:34 → ~08:43 UTC ~70 min; ZERO total findings, ZERO incidents; the security row 0+7; the INP proxy at 476 ms — within budget, well below the S92–S95 band, the exclusive-run explanation; the theme-restore guard light/violet).
- The envelope extracted + verified — **ALL 17 CHECKS PASSED after TWO verifier-form corrections** (the raw files' leading log lines → the first-decodable-object scan; the INP locator's actual key `scenarios["clone-navswitch-inp-proxy-4xcpu"].ms`); the evidence saved at `docs/screenshots/s96-standing-suite-evidence.json` with the launch-provenance note.
- The PENDING sections patched with the real result (the plan + session_325/326/327 + the worklog entry).
- The README session-96 row inserted; the table integrity verified.
- The repo worklog entry appended.
- The evidence commit created; the push via the SSH wrapper (the outcome recorded in the worklog entry); session_328 (the raw transcript) written as the follow-up commit.

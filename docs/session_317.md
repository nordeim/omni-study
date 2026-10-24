# Session 317 — the S94 process log (the gapless-nav parity session)

The S94 process notes — what was done, in what order, with what evidence, and the process lessons for future sessions.

## The arrival protocol (the standing form, no deviations)

1. The workspace had been RESET (no repo, no worklog). Fresh clone from `https://github.com/nordeim/omni-study.git` at `3cd93cd` — the S93 close (the evidence commit `62131f3` + the session_314 follow-up). `git fetch` clean, no divergence, zero owner-side movement since S93.
2. The doc review in the mandated order: AGENTS.md (full, via the wrapped-copy method — the long-line format makes direct reads truncate), CLAUDE.md (full), README (head + the session table tail), PAD + SKILL (structure + the drawer/nav sections), then the four named session docs (session_313, remediation-plan-session93, worklog tail, session_314).
3. The pin validation BEFORE any tooling: src tree `9feb7cfc`, the five S91 fix sites, `.env.example` (DATABASE_URL + the empty AUTH_SECRET dev posture), the db:* inline-anchored scripts.

## The environment + the baseline (the S80 recipe)

4. `.env` byte-identical to `.env.example` (cmp-verified). `bun install` 489 packages. The chromium v1243 install-gate re-encounter (cache at v1200 — the documented sandbox-reset property; the third consecutive session).
5. Cold `db:push` + `db:seed` → the 303,104-byte pin EXACT (the Oct 24 new-date seed). The byte pin holds across seed dates (the seed's date-relative content is length-stable).
6. Gates: lint → tsc → 844 unit (22 files) → build → cold e2e 310/310 (4.6 min, `rm -f db/e2e.db` first) = 1156 GREEN, the third full confirmation cycle.

## The audit axes (zero new findings)

7. Static scan (0 console.log, 0 TODO/FIXME, the two documented exceptions verbatim); dep-audit GREEN (2 non-production, 0 runtime-reachable); registry 39th (braces 3.0.3 / prisma rc.27 / @prisma/client 7.10.1 / next 16.4.3 — ALL unchanged since S93, zero movements); scandihaven `5430197`.

## The parity work (the session's substance)

8. The decision framework was built BEFORE the reference sweep: the grep ripple analysis (zero numeric navSH assertions — every scroll contract behavioral), the arithmetic margin check per viewport (992 > 934/755/534/301), and the shared-source inventory (both uls use the identical `flex flex-col gap-1`; NavItemLink is the single link source at 48px/44px).
9. The reference re-sweep extended the census to the DESKTOP sidebar (the untracked axis) — the platform-wide discovery that completed the evidence. The Escape-close-absence check initially misread (a probe artifact — the panel-finder form); the controlled retest protocol (pre-state verification + 2-of-3 replication) established the anchor holds. **Process note: the absence check requires the pre/post state pair in the same probe.**
10. The TDD cycle: the drawer-check extension (RED 1068≠992) → the two-ul change → GREEN (992===992) → the four-geometry live verification → the documentary sync → the full gate re-run (1156 GREEN, count anchors unchanged).
11. **Process note (the doc-sync method)**: the 46-site string sync ran as a persisted count-verified script (`/home/z/my-project/scripts/s94-doc-sync.py`, dry-run → apply). The dry-run caught FOUR count mismatches in the initial pattern table (my expected counts vs the actual — substring and line-break forms differ across files); the apply pass then flagged one redundant entry (a pattern whose targets were already covered by an earlier substring pattern — the "geometry — the nav scrollHeight ~1068" vs "the nav scrollHeight ~1068" overlap). The straggler line-break forms were fixed directly. **The count-verified dry-run form is the mandatory method for wide comment surgery.**
12. **Process note (the en-dash transport)**: the Edit tool mangled en-dash-bearing old_str strings (three failed replacements on strings the file demonstrably contained); ASCII-anchored substrings and the Python script both worked. For unicode-bearing comment edits, prefer the script form.

## The captures + the delta

13. The S85 contract honored: the badge census BEFORE (1 portal / 39 children / no amber), the PIL amber sweep AFTER (0 in all five — the sweep script's verification loop was initially O(n·re-open) and timed out; the fixed single-pass form runs in seconds. **Process note: never re-open images inside per-pixel loops**).
14. The capture-delta: the strict any-pixel classifier (row bands, the 4-row gap grouping, the sigma-6 anti-dither tolerance) + the column attribution for the desktop pairs (x<260 sidebar vs x≥260 content). The three-family + deliberate-geometry prediction held on every pair.

## The SSH + the suite

15. The paramiko venv 5.1.0 + the Appendix A shim (extracted from the skill via awk — the fenced block bounds; the venv shebang) + the operator key (0600, 399 bytes, the fingerprint identical to the S92/S93 record) + the wrapper byte-check True + the dry-run GREEN first-attempt.
16. The suite launch per the S32 recipe (the preflight green immediately before, the browser closed, /tmp/standing-suite wiped, the ports verified, the detached setsid launch). **The Write-tool path restriction** (files only under /home/z) required relocating the SSH workspace from /tmp to /home/z/s94-ssh/ — documented for future sessions.

## The deliverables

- `docs/remediation-plan-session94.md` (the plan + the execution log + the doctrine additions; the suite section appended from the real run)
- `docs/session_315.md` (narrative) / `docs/session_316.md` (Chinese summary) / `docs/session_317.md` (this process log) / `docs/session_318.md` (raw transcript)
- The README session-94 row + the worklog entry
- The 7 evidence captures (`docs/screenshots/s94-*.png`)
- The code change: 2 src lines (the two uls) + 22 files of documentary sync + the drawer-check extension (the seventh standing check)

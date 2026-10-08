# Session 12 — Session-10 Dark-Mode Consistency Remediation (audit → plan → TDD execution → docs → push)

> The 12th working session on this repo, executing the session-10 remediation
> iteration. Session 9 was completed and pushed at `e7c940f` (plus the remote
> session-log commit `a749401` adding `session_11.md`). This session picked up
> the suggestion recorded there — a dark-mode consistency / keyboard a11y /
> responsive edge-case audit — found the biggest single root cause of the whole
> audit series hiding in the token layer, executed the fix TDD-style, and
> finished with docs alignment + the 3-commit push.

## What happened

**Onboarding & baseline.** `git pull` to `a749401`; all root docs
(AGENTS/CLAUDE/README/PAD/SKILL), `docs/session_10.md`,
`docs/remediation-plan-session9.md`, `worklog.md`, and `docs/session_11.md`
reviewed and validated against the codebase; `.env` contract, `db/`, and the
Vitest/Playwright configs verified in place. Baseline gates green: lint ✓ /
tsc ✓ / 106 unit ✓. `skills/` excluded from all checks/tests/compilation as
instructed.

**The standing priority first.** Mobile drawer re-verified GREEN at 390×844:
288px white `shadow-2xl` panel (dark: slate-950), 20 links, icon set
identical (`file-question` vs `file-question-mark` = the documented lucide
rename), no footer, backdrop `rgba(0,0,0,0.2)` + `blur(4px)` ≡ the clone's
`oklab` serialization. One functional delta measured: the clone's drawer
closes on **Escape**, the reference's does not — kept as a Radix-standard
superset behavior and now e2e-pinned.

**The governing discovery.** Toggling the reference's Settings → Appearance →
Dark (with Save Preferences) applies `html.dark` and a dark `body`
(`rgb(10,10,10)` neutral-950) — but the reference's own app markup never
re-themes: the canvas root keeps the light gradient, the sidebar stays
`rgba(255,255,255,0.8)` glass, every card stays white. The dark body is fully
covered by the light canvas; the visible UI is unchanged (the VLM read the
reference's "dark" dashboard as "properly themed light mode"; DOM probes
confirm zero dark variants in the rendered markup). **The reference's
Dark/System options are a Base44 platform no-op.** Following the established
platform-bug precedent (yellow gradient-button text, broken note title), the
clone's full dark mode is the documented superset — and this session's dark
audit standard became INTERNAL consistency.

**The root cause (S10-1).** A scripted dark-mode contrast sweep
(`scripts/dark-sweep.mjs` — walks every view, flags opaque light backgrounds
≥ 40px "flashbulbs" and text/effective-background contrast < 2.2) found 10
affected views. The through-line: **the shadcn base tokens were LITERAL values
inside `@theme inline`** — Tailwind v4 inlines those into the generated
utilities at build time, so `bg-card` compiled to
`background-color: hsl(0 0% 100%)` with NO var() indirection, and the `.dark
{ --color-card: … }` overrides could never reach the utilities. Measured
symptoms: WHITE dialogs with near-white titles (unreadable), invisible
outline buttons (white-on-white, contrast 1.04 — Tasks "Active" filter, MyDay
"More Options", Timetable "Grid Builder", Files "New Folder", MathSolver
"Upload Image"/"Clear", Calculator "History", Settings "Save Preferences"),
light dropdown/select menus, the calculator tabs list, PracticeTests badges.
The bug hid for nine sessions because custom CSS that references the vars
directly (`.sf-card`, `body`, the `*` border reset) re-themed correctly —
dark cards + dark canvas + dark text around light-mode orphan islands.
Empirical tell (now in the trap log): `getComputedStyle(html)
.getPropertyValue('--color-card')` resolves the `.dark` value while the
utility still renders light — the var exists, the utility just never reads it.

**Six view-level tint families (S10-2..S10-7).** Inline-style
gradients/tints authored for the S3–S9 light-mode parity work render
identically in dark mode (inline styles cannot carry `dark:` variants): the
dashboard overdue banner (red-50→orange-50), the MyDay amber progress card,
the timetable today-header + mobile day chips + the calendar TODAY-unselected
cell (accent tints), the sidebar clock chip (softest→adjacent gradient +
deep/strong text), the Settings selected theme cards, and the analytics SVG
charts (light fills/gridlines/axis labels on dark cards — plus the calendar
today-cell finding, masked in the sweep only because today is also the
selected day by default).

**Non-gap audits (verified, documented, no changes):** keyboard a11y — every
icon-only button carries `aria-label` (0 unlabeled across 46 probed on
login/dashboard/Tasks), visible accent focus rings (measured
`solid 3px rgb(196,181,253)` on Tasks in dark); responsive — no horizontal
overflow on any of the 20 views at 390/820/1280, two-pane views clean at
tablet; mobile drawer dark panel ✓; login card dark-aware ✓; Events terminal
panel by design ✓; analytics stat-card oklch tints intentional ✓.

**Plan + TDD execution.** Plan saved as
`docs/remediation-plan-session10.md` (evidence, the root-cause analysis, the
six families, ten verified non-gaps, codebase-alignment table, risks) and
validated file-by-file against `src/` before execution. RED first:
`tests/e2e/dark-mode.spec.ts` (10 pins; mode strategy = API PATCH +
`waitForFunction(html.dark)` + an `afterEach` awaited light restore — the S4
accent-restore lesson applied per-hook) observed **9 failed / 1 passed**
(the light regression guard, correctly green before and after). GREEN:
the globals.css token rework first — raw triplets in `:root`/`.dark`
consumed as `hsl(var(--x))` inside `@theme inline` (shadcn's own v4 shape;
the accent block already used it), shadows routed through `--sf-shadow-sm`
— **verified in the compiled CSS**: `.bg-card{background-color:hsl(var(--card))}`,
`.shadow-sm{--tw-shadow:var(--sf-shadow-sm);…}`. Then the six class families
(`.sf-overdue-banner`, `.sf-amber-card`, `.sf-today-tint`/`-cell`,
`.sf-clock-chip` + time/date text, `.sf-selected-tint` — the
`.sf-calc-display` precedent) and the SVG dark utilities
(`dark:fill-slate-800`/`dark:fill-slate-400`/`dark:stroke-slate-800`).

**Execution discoveries.** The drawer-pin locator must target the nav's
direct parent (`.filter({ has: nav }).first()` matches the canvas wrapper);
`dark:text-red-300` was unpinned (lab() serialization — red-300 `#fca5a5`
joined the pin block, the 12th trap-10 extension); the Playwright reporter
counts the setup project in the total ("194 e2e" = 193 chromium + 1 setup).

**Verification.** `scripts/dark-sweep.mjs` re-run: **ALL 20 VIEWS CLEAN** in
dark. Full gates: **lint ✓ · tsc ✓ · 106 unit ✓ · build ✓ · 194 e2e ✓
(2.8 min, clean db/e2e.db + auth state) = 300 tests green** — the 183 prior
chromium specs stayed green UNTOUCHED (the light-mode byte-parity guarantee,
the plan's core risk control). Screenshots: all 30 refreshed
(24 light + 6 NEW dark captures — the capture script gained a light-guard
and a dark phase that restores light at the end); VLM spot-checks passed on
the dark dashboard ("consistently dark, no leftovers") and the light
dashboard (regression PASS).

**Docs aligned:** README (badge 300, theme-system feature row, dark captures
line, plan entry + project-table row, counts 106/194, e2e notes), AGENTS.md
(the DARK-MODE contract architecture fact + trap 13 + the API-toggle testing
quirk + command counts + the dark-sweep tool), CLAUDE.md (the dark-mode token
contract under Tailwind + pyramid counts + the session-10 pin family), PAD
(ADR-008 + ADR-007 counts + test-distribution row + total row 300), SKILL.md
(counts 300 + AP-43..AP-46). `.env.example` audited against the code —
matches line-for-line (DATABASE_URL, NEXT_PUBLIC_SITE_URL, AUTH_SECRET; no
env-touching changes this session).

**Commit & push.** Three commits on `main` following the repo convention:
fix (globals.css + 7 views + the spec + the sweep script + capture script +
30 screenshots), docs (plan + aligned docs), session log (this file +
worklog). Pushed via `docs/ssh_git_wrapper_v3.py` with the provided ed25519
deploy key (dry-run first, remote verified at the new head, key destroyed
per the runbook).

## Where the project stands

The clone's dark mode is now a working, internally-consistent superset
pinned by 10 e2e specs (with a light-mode byte-parity guard), instead of an
accidental half-dark UI with white dialogs and invisible buttons. The audit
series has now covered: chrome (S3/S4), interactive chrome (S5), populated
rows (S6), lightly-probed views (S7), deep chrome/layout (S8), data-state
surfaces + chart axes + icons (S9), and dark-mode consistency + a11y +
responsive (S10). 300 tests green. The next natural audit surfaces: accent
themes beyond violet under dark mode (blue/emerald/amber/pink/red/teal dark
wash contrast), the System option's prefers-color-scheme edge cases, and
print/forced-colors accessibility modes.

# Session 14 — Session-11 Theme-System Remediation (audit → plan → TDD execution → docs → push)

> The 14th working session on this repo, executing the session-11 remediation
> iteration. Session 10 (dark-mode consistency) was completed and pushed at
> `695fe68` (+ the remote session-log commits `695fe68`/`3fc874d` adding
> `session_12.md`/`session_13.md`). This session picked up the suggestion
> recorded there — **accent themes beyond violet under dark mode** and the
> **System option's prefers-color-scheme edge cases** — found a second
> system-level root cause hiding in the theme-application lifecycle, executed
> the fix TDD-style, and finished with docs alignment + the 3-commit push.

## What happened

**Onboarding & baseline.** `git pull` to `3fc874d` (the remote added
`docs/session_13.md`, the raw narrative of the session-10 iteration); all
root docs (AGENTS/CLAUDE/README/PAD/SKILL), `docs/session_12.md`,
`docs/remediation-plan-session10.md`, `worklog.md`, and `docs/session_13.md`
reviewed and validated against the codebase; `.env` contract, `db/`,
`.env.example`, and the Vitest/Playwright configs verified in place.
Baseline gates green: lint ✓ / tsc ✓ / 106 unit ✓. `skills/` excluded from
all checks/tests/compilation as instructed; the repo skills catalog consulted
for the audit toolset (agent-browser, clone-app-pat-pro methodology, tdd).

**The standing priority first.** Mobile drawer re-verified GREEN at 390×844
on BOTH apps: 288px white `shadow-2xl` panel, 20 links, icon set identical
(`file-question` vs `file-question-mark` = the documented lucide rename), no
footer, backdrop `rgba(0,0,0,0.2)` + `blur(4px)` on the reference ≡ the
clone's `oklab(0 0 0 / 0.2)` serialization. The clone's Escape-to-close
superset re-verified live.

**The governing discovery — the theme-application lifecycle.** Code reading
of the theme store found that `applyToDocument` runs ONLY after
`/api/auth/me` resolves (page.tsx's auth gate) — and nothing else ever
touches the `<html>` class. Four measured consequences (all probed on the
dev server, evidence screenshots kept):

- **A1 · FOUC:** with `/api/auth/me` network-aborted, a dark-mode user's
  reload renders a fully LIGHT page (`html` class-less, white body) — the
  light flash happens on EVERY hard load for the duration of the auth
  round-trip, and permanently when the API stalls.
- **A2 · the login route never themes:** a fresh dark-OS visitor (emulated
  `prefers-color-scheme: dark`) gets a light `/login` — the page's authored
  `dark:*` variants were dead code on that route.
- **A3 · System mode is stale at runtime:** `matchMedia` is read ONCE at
  apply time with no `change` listener — switching the emulated OS theme to
  light mid-session left the app dark until a manual reload.
- **A4 · static theme-color metas:** the two `prefers-color-scheme`-media
  metas mean an explicit-dark user on a light OS keeps a white mobile
  browser chrome.

**The accent×dark sweep (family B).** A new audit tool,
`scripts/accent-dark-sweep.mjs`, walked all 20 desktop views AND a 6-view
mobile pass (mobile-only surfaces the S10 desktop sweep never rendered) plus
the open drawer, for EACH of the 7 accents — set through the real
application path (settings API → loadFromUser → applyToDocument) — with the
S10 FAIL bar (<2.2) plus a new WARN bar (<3.2) for accent text. Four
accent surfaces carried light-mode tones in dark, all passing 2.2 under the
default violet (which is exactly why S10 called them clean — violet-600 is
the palette's darkest 600):

- **B1:** the ACTIVE nav item — inline `rgb(var(--sf-primary-strong))` text
  + `--sf-primary` icon on the dark glass (3.13:1 under violet; sidebar AND
  drawer by construction).
- **B2:** `ViewAllLink` — `text-sf-primary-strong` with no dark pair
  (3.13:1, worst under the DEFAULT accent).
- **B3:** the timetable MOBILE today chip — `bg-sf-primary-soft` light
  flashbulb flagged on ALL 7 accents (a `md:hidden` surface the desktop-only
  S10 sweep structurally could not see).
- **B4:** the Settings avatar emoji swatch, selected — inline violet-100
  tint on the dark Appearance panel (the grid lives on the default tab but
  was never dark-probed).

**Verified non-gaps (documented, untouched):** timetable class cards (white
on 500-level SUBJECT colors — reference-identical in both modes); the
calendar mode-switch active tab + PracticeTests "Start Test" (white on
accent-500 — the reference's own CTA face, 2.15 under amber in BOTH modes);
calendar adjacent-month days (slate-600 on dark = 2.36 mirrors the light
2.2 — intended dimming, dark is actually brighter); the assignments type
pill (faithful dark pairs); dead `pill`/`underline` Tabs + `link` Button
variants (unused); the MathSolver spinner; the solid accent swatch faces;
and the reference's System option (the S10 platform no-op — the clone's
dynamic tracking is superset). The VLM flagged the dark login's disabled
Sign-in button as "gray" — DOM-verified false positive: the button is the
reference-measured solid slate design (`dark:bg-slate-100` inversion) at
the standard `disabled:opacity-50`.

**Plan + TDD execution.** Plan saved as
`docs/remediation-plan-session11.md` (evidence tables, the lifecycle root
cause, the B-family, eight non-gaps, codebase alignment, risks) and
validated file-by-file against `src/` before execution. RED first:
`tests/e2e/theme-system.spec.ts` (12 pins) observed **11 failed / 1 passed**
(the light guard) with exactly the designed failure modes (violet-600
measured where strongDark was expected, class-less html, stale system
mode); `tests/theme-cache.test.ts` (6 pins) landed with the new pure
helpers. GREEN: the `THEME_BOOT_SCRIPT` pre-paint injection (verified in
the COMPILED HTML — `login.html` carries the inline script), the cache
write in `applyToDocument` + `installSystemThemeTracking()` + the plain
`meta[name=theme-color]` sync (store.ts), the logout cache-clear, the
`.sf-nav-active{,-icon}` / `.sf-swatch-selected` classes, the ViewAll +
timetable-chip dark utility pairs, and the minimal `@media print` block.

**Execution discoveries.** The timetable mobile accordion container is a
`<section>`, not a `<div>` (locator fix during RED); the avatar emoji grid
lives on the APPEARANCE tab with `aria-label="Choose avatar <emoji>"`
buttons (not bare-emoji names, not on Profile); the swatch `transition-all`
re-hit the S8 mid-transition read lesson (waitForFunction the final value);
a leaked `page.route` abort of `/api/auth/me` bounces every later `goto` to
`/login` (unroute in `finally` — the same trap observed live with
agent-browser's persistent routes); agent-browser's `fill` silently lost a
race with Fast Refresh re-renders during login (switched to the API-cookie
pattern for probing).

**Verification.** The accent sweep re-run: **B-family findings 0/7 accents**
(desktop + mobile), with a signature diff proving 14 findings eliminated
and ZERO new ones introduced (the 22 remaining = the documented non-gaps).
Live probes re-ran the exact audit failures: dark renders pre-paint with the
auth API aborted; the fresh-context dark-OS login renders dark
(`rgb(15,23,42)` card); the runtime OS switch re-themes both directions; the
plain meta tracks the effective mode; the active nav reads violet-300 in
dark. Full gates: **lint ✓ · tsc ✓ · 112 unit ✓ (9 files) · build ✓ ·
205 e2e ✓ (3.0 min) = 317 tests green.** The final-gate run from a FRESH
(cold) `db/e2e.db` exposed a pre-existing latent flake in the calculator
theme spec — the teal swatch's fire-and-forget PATCH raced the persistence
re-navigation's `/api/auth/me`, and the failed test body skipped its
in-test violet restore, poisoning every later violet pin. Hardened per the
repo's own S4-lesson idiom (the SET now awaits the PATCH response like the
restore; the persistence read polls; a `test.afterEach` restores violet so
any future failure is contained) — the re-run from a cold db went 205 ✓.
Screenshots: all 31 refreshed via `node scripts/capture-studyflow.mjs`
(24 light + 6 dark + the NEW `dark-Login.png` fresh-visitor capture; the
script's dark phase gained the colorScheme-dark login context) + the 4
audit-evidence captures (`s11-audit-{fouc,login}-{before,after}.png`). VLM
spot-checks: dark dashboard PASS, light dashboard PASS, light login PASS;
the dark-Login "FAIL" was the DOM-verified disabled-button false positive.

**Docs aligned:** README (badge 317, theme-system feature row, plan entry +
project-table row, counts 112/205, e2e notes, captures line), AGENTS.md
(the THEME-APPLICATION lifecycle fact + the accent-dark-sweep tool + 3 new
testing quirks + counts), CLAUDE.md (the theme-application lifecycle under
Tailwind + pyramid + the session-11 pin family), PAD (ADR-009 + ADR-007
counts + test-distribution row + total 317), SKILL.md (counts 317 +
AP-47..AP-49). `.env.example` audited against the code — matches
line-for-line (no env-touching changes this session).

**Commit & push.** Three commits on `main` following the repo convention:
fix (theme.ts + store.ts + layout.tsx + nav-items + shared + timetable +
settings + globals.css + the 2 specs + the sweep script + the capture-script
dark-login phase + 31 screenshots), docs (plan + execution log + aligned
docs), session log (this file + worklog). Pushed via
`docs/ssh_git_wrapper_v3.py` with the provided ed25519 deploy key (dry-run
first, remote verified at the new head, key destroyed per the runbook).

## Where the project stands

The theme system is now a complete lifecycle instead of a post-auth
afterthought: dark applies pre-paint (cache + boot script), the login route
themes (system fallback), System mode tracks the OS live, the mobile
browser chrome follows the effective mode, and every accent-driven surface
follows the 300-level dark convention — all pinned by 12 new e2e specs + 6
unit pins, with light mode byte-identical (193 prior pins untouched). The
audit series has now covered: chrome (S3/S4), interactive chrome (S5),
populated rows (S6), lightly-probed views (S7), deep chrome/layout (S8),
data-state surfaces + chart axes + icons (S9), dark-mode consistency +
a11y + responsive (S10), and theme application + accent×dark + print
(S11). 317 tests green. The next natural audit surfaces: forced-colors
(Windows High Contrast) accessibility, the print output at real paper
margins (the current block is chrome-hiding only), and a keyboard-only
pass over the two-pane views' focus order.

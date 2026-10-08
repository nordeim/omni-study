# Session 11 Remediation Plan — Theme-System Application Lifecycle & Accent-Dark Re-Theming

> Audit: 2026-10-08, dual-app (live reference `omni-study1.base44.app` logged in as
> `sepnetflix2023@outlook.com` vs local clone dev server; desktop 1280×800 + mobile
> 390×844). Focus chosen from the session-10 suggestion recorded in
> `docs/session_12.md`: **accent themes beyond violet under dark mode**, the
> **System option's prefers-color-scheme edge cases**, and print accessibility —
> plus the standing mobile-drawer priority.
>
> New audit tooling: `scripts/accent-dark-sweep.mjs` — for EACH of the 7 accents
> (set via the settings API, the real application path), walks all 20 views at
> desktop AND a 6-view mobile pass (mobile-only surfaces the session-10 desktop
> sweep never rendered) plus the open drawer; flags flashbulbs (luminance > 0.80,
> ≥ 40×20), unreadable text (contrast < 2.2 — the S10 FAIL bar) and low-contrast
> text (2.2 ≤ contrast < 3.2 — WARN bar that surfaces the accent-600-on-dark
> family). Also `agent-browser set media dark/light` for the System-mode probes
> and a network-route abort of `/api/auth/me` for the FOUC probes.
>
> Mobile drawer (the standing priority) re-verified FIRST and **GREEN**: 288px
> white `shadow-2xl` panel, 20 links, icon set identical (`file-question` vs
> `file-question-mark` = the documented lucide rename), no footer, backdrop
> `rgba(0,0,0,0.2)` + `blur(4px)` ≡ the clone's `oklab(0 0 0 / 0.2)`
> serialization; the clone's Escape-to-close superset re-verified live.

## Family A — the theme-application lifecycle (the session's root cause)

**S11-1 · The theme class is applied ONLY by client store code that runs only
after `/api/auth/me` resolves — nothing themes the first paint, the login
route, or a runtime OS switch.**

`applyToDocument` (src/lib/store.ts) is the single application point, called
from `loadFromUser` (page.tsx, after the auth fetch) and the Settings actions.
The SSR HTML renders with no `dark` class and no accent vars; `<html>` keeps
that state until hydration + auth round-trip completes. Four measured
consequences:

| # | Probe (dev server, agent-browser) | Measured | Expected |
|---|---|---|---|
| A1 | User themeMode=dark, `/api/auth/me` network-aborted, load `/Dashboard` | `html` class **empty**, body `rgb(255,255,255)` — a dark-mode user stares at a fully light page for the whole auth round-trip (permanently if the API stalls). Screenshot: `docs/screenshots/s11-audit-fouc-before.png` | dark pre-paint |
| A2 | OS `prefers-color-scheme: dark` (emulated), fresh load `/login` | `html` class **empty** — the login page NEVER themes, for dark-OS visitors AND returning dark users; its authored `dark:*` variants (`dark:bg-slate-900/95` …) are dead code on that route. Screenshot: `docs/screenshots/s11-audit-login-before.png` | dark per system fallback |
| A3 | themeMode=system + media dark → `html.dark` ✓; then `set media light` WITHOUT reload | `matchMedia(...dark).matches` = **false**, but `html` still **dark**, body `rgb(9,9,11)` — System mode resolves the OS preference ONCE at apply time (`resolveMode`) and has **no `change` listener**; the app is stale until a manual reload | re-theme at runtime |
| A4 | `<meta name=theme-color>` after explicit Dark with light OS | both metas are static `prefers-color-scheme`-media variants (`#ffffff` / `#020617`) — an explicit-dark user on a light OS keeps a **white mobile browser chrome** | synced with effective mode |

**Fix (one root fix + two small guards):**

1. **Pre-paint boot script** — `THEME_BOOT_SCRIPT` (a self-contained inline
   string exported from `src/lib/theme.ts`, injected into `<head>` by the root
   layout so it runs before first paint): reads the `localStorage["sf-theme"]`
   cache (written by `applyToDocument` on every apply — `themeCachePayload`,
   pure + unit-pinned), resolves `mode` against `matchMedia`, and adds `dark`
   to `<html>`. No cache (fresh visitor / post-sign-out) → system fallback →
   the login page themes for dark-OS visitors. `<html suppressHydrationWarning>`
   is already in place, so the pre-hydration class toggle cannot mismatch-warn.
2. **`applyToDocument` writes the cache** (`{ mode, accent }` via
   `themeCachePayload`) on every apply — the cache is the boot script's input.
   `THEME_CACHE_KEY` / `themeCachePayload` / `parseThemeCache` join
   `src/lib/theme.ts` (pure, unit-tested — the cache FORMAT is pinned so a
   future format change fails tests and forces the script update).
3. **System listener** — `installSystemThemeTracking()` (module scope in
   store.ts, idempotent): `matchMedia("(prefers-color-scheme: dark)")
   .addEventListener("change", …)` re-runs `applyToDocument` when the stored
   mode is `system`. The reference's System option is the measured platform
   no-op (S10 governing discovery), so dynamic tracking is pure superset.
4. **Sign-out clears the cache** (`settings-view.tsx logout()` →
   `localStorage.removeItem(THEME_CACHE_KEY)`) so the login page falls back to
   the fresh-visitor system state instead of the previous user's theme.
5. **theme-color meta sync** — `applyToDocument` maintains a plain
   (non-media) `meta[name=theme-color]` appended AFTER Next's two media
   variants (last-match wins in Chromium) with the effective mode's color.

**Accent scope decision:** the boot script applies the cached MODE only; the
accent VARS still land post-auth (pre-auth surfaces use the violet `:root`
defaults — the reference's own login is platform-default-styled, so a
violet-accented login is reference-consistent; post-login the accent corrects
within the splash window). Documented as a conscious scope cut.

## Family B — accent surfaces that cannot re-theme in dark (the S10 inline/utility pattern, 4 remaining instances)

The accent × dark sweep + direct DOM probes found four surfaces still carrying
light-mode accent tones in dark mode — the exact S10-2..7 root shape (inline
styles / utilities without `dark:` pairs). Under the default VIOLET accent they
pass the S10 2.2 bar (which is why the session-10 sweep called them clean) —
but they violate the repo's own dark convention (`--sf-primary-strong-dark`,
the 300-level tone, ≈ 8:1) and the sweep's stricter 3.2 accent-text bar flags
them.

| # | Surface | Measured (dark) | Fix |
|---|---|---|---|
| B1 | **Active nav item** (`nav-items.tsx` — sidebar AND drawer by construction): inline `color: rgb(var(--sf-primary-strong))` + icon inline `rgb(var(--sf-primary))` | text `rgb(124,58,237)` violet-600, icon `rgb(139,92,246)` violet-500 on the dark glass | new `.sf-nav-active` / `.sf-nav-active-icon` globals classes: light values verbatim (the S8-A pins — gradient stops stay inline), `.dark` → `--sf-primary-strong-dark` |
| B2 | **`ViewAllLink`** (`shared.tsx`): `text-sf-primary-strong`, no dark pair | `rgb(124,58,237)` at contrast **3.13** on the dark card (violet-600 is the darkest 600 of the palette — worst under the DEFAULT accent; red/blue/pink land 3.3–3.6, still dimmer than the 300-level convention) | add `dark:text-sf-primary-strong-dark` |
| B3 | **Timetable mobile today chip** (`timetable-view.tsx` ~257): `bg-sf-primary-soft text-sf-primary-strong`, no dark pairs — a mobile-only surface (`md:hidden`) the S10 desktop sweep never rendered | violet-100 `rgb(243,232,255)` 40×40 **flashbulb** on the dark accordion, flagged on ALL 7 accents | add `dark:bg-sf-primary-soft-dark dark:text-sf-primary-strong-dark` (the badge.tsx default-variant pattern) |
| B4 | **Settings avatar emoji swatch, selected** (`settings-view.tsx`): inline `backgroundColor: rgb(var(--sf-primary-soft))` | violet-100 `rgb(243,232,255)` flashbulb + violet-500 ring on the dark Appearance panel (the S10-6 fix covered the theme-mode cards; the emoji grid lives on the default Appearance tab and was never dark-swept) | new `.sf-swatch-selected` class (light `--sf-primary-soft` verbatim — NOTE: `soft`, one step deeper than `.sf-selected-tint`'s `softest`; `.dark` = `--sf-primary-soft-dark / 0.3`), boxShadow ring stays inline |

## Family C — print (the minimal superset)

**S11-6 · No `@media print` styles exist** (verified: zero print rules in
globals.css). A study app's printable surfaces (dashboard, timetable,
assignments) currently print the fixed sidebar/app-bar and the dark canvas.
Minimal block: hide the chrome (`aside`, the mobile `header[role=banner]`,
`[role=dialog]`, the toaster), reset `main` offsets, white canvas + black text.
Pinned by one e2e print-emulation check. (Forced-colors / Windows High
Contrast: a proper pass is a larger surface — documented as the next audit
candidate, not attempted here.)

## Verified non-gaps (do NOT "fix")

1. **Timetable class cards — white text on 500-level SUBJECT colors**
   (contrast 2.49–2.8 under every accent): the subject colors are fixed
   swatches that do not re-theme in EITHER mode — identical contrast in light
   mode, reference-identical design (same call as the Events terminal panel).
   WCAG-debt noted, parity preserved.
2. **Calendar mode-switch active tab + PracticeTests "Start Test" — white on
   accent-500** (2.15 under amber): the accent CTA face (same in light mode;
   the reference's own amber swatch design — the yellow-gradient-button
   platform-bug family). Non-gap.
3. **Calendar adjacent-month day numbers — slate-600 on the dark card**
   (2.36, all accents): the intended dimming — the light equivalent
   (slate-300 on white) measures 2.2, so the dark pair is actually BRIGHTER
   than light. Design-consistent.
4. **Assignments type pill — slate-800 + slate-500 in dark** (3.07): faithful
   dark pairs of the muted light pill (slate-400 on slate-100 = 3.0).
5. **Tabs `pill`/`underline` variants + Button `link` variant**: dead code —
   no view consumes them (both Tabs usages take the default variant).
6. **MathSolver loader spinner** (`--sf-primary` icon): transient decorative.
7. **Settings accent swatch faces** (solid accent-500 chips): color samples
   by design.
8. **The reference's System option** — platform no-op (S10 governing
   discovery): the clone's working system resolution + (new) runtime tracking
   is the documented superset.

## Codebase alignment (validated file-by-file before execution)

| File | Touches |
|---|---|
| `src/lib/theme.ts` | `THEME_CACHE_KEY`, `themeCachePayload`, `parseThemeCache`, `THEME_BOOT_SCRIPT` (pure string; unit-tested) |
| `src/lib/store.ts` | `applyToDocument`: cache write + theme-color meta sync; `installSystemThemeTracking()` (module scope, idempotent) |
| `src/app/layout.tsx` | inject `THEME_BOOT_SCRIPT` into `<head>` (pre-paint) |
| `src/components/layout/nav-items.tsx` | B1: inline colors → `.sf-nav-active` / `.sf-nav-active-icon` classes (gradient stays inline) |
| `src/components/views/shared.tsx` | B2: ViewAllLink `dark:text-sf-primary-strong-dark` |
| `src/components/views/timetable-view.tsx` | B3: mobile today chip dark pairs |
| `src/components/views/settings-view.tsx` | B4: selected avatar swatch → `.sf-swatch-selected`; logout() clears the theme cache |
| `src/app/globals.css` | `.sf-nav-active{,-icon}` + `.sf-swatch-selected` (+ `.dark` overrides); the minimal `@media print` block |
| `tests/theme-cache.test.ts` | NEW — cache payload format + parse round-trip |
| `tests/e2e/theme-system.spec.ts` | NEW — the S11 pin family (below) |
| `scripts/accent-dark-sweep.mjs` | NEW — the audit tool (committed per the S9/S10 audit-tooling precedent) |

No seed, schema, or API changes. No `prisma/` or route changes.

## TDD execution order

1. **RED** — `tests/e2e/theme-system.spec.ts` first:
   - A1 pre-paint: PATCH dark → load (cache written) → `page.route` abort
     `/api/auth/me` → `page.reload()` → assert `html.dark` WITHOUT the auth
     round-trip.
   - A2 login dark: fresh context (`storageState` empty — the auth.spec
     precedent) + `colorScheme: "dark"` → `/login` renders `html.dark` + the
     card's `dark:bg-slate-900/95`.
   - A3 system listener: PATCH system + `emulateMedia dark` → load → dark;
     then `emulateMedia light` (NO reload) → `waitForFunction` NOT dark.
   - A4 meta: dark → plain `meta[name=theme-color]` = `#020617`; light →
     `#ffffff`.
   - cache: after a dark apply, `localStorage["sf-theme"]` contains
     `"mode":"dark"`.
   - B1–B4: active nav text/icon = `rgb(196,181,253)` in dark (STRONG_DARK)
     and unchanged `rgb(124,58,237)`/`rgb(139,92,246)` in light; ViewAllLink
     dark color; timetable mobile chip dark pair; avatar swatch dark wash
     (click an emoji first).
   - S11-6 print: `emulateMedia({ media: "print" })` → sidebar `display:none`,
     body background white.
   - light regression guard: the four B-family surfaces keep their exact
     light values.
   Expected RED: the A-family + B-family + print pins fail; the light guard
   passes.
2. **GREEN S11-1** — theme.ts helpers + store.ts (cache write, listener,
   meta sync) + layout.tsx boot script; rebuild; A-pins flip.
3. **GREEN S11-2..5 (B1–B4)** — the class/utility moves, one at a time.
4. **GREEN S11-6** — the print block.
5. **Re-sweep** — `node scripts/accent-dark-sweep.mjs`: the four B-family
   findings gone on all 7 accents; the documented non-gaps unchanged.
6. **Full gates** — `lint → typecheck → test → build → test:e2e` (the 194
   prior specs are the regression net; the new spec takes the suite to
   194+N).
7. **Mobile drawer re-probe** (standing priority holds).

## Risks & guards

- **The boot script changes WHEN dark applies (earlier)** — every existing
  dark-mode pin waits for `html.dark` (which now appears earlier) → stays
  green. The light-regression guards poll `waitForFunction(!dark)` → they
  tolerate the cache-dark → auth-light correction window. The e2e Playwright
  contexts start with EMPTY localStorage (storageState carries cookies only),
  so the boot script's media fallback (`colorScheme` defaults to light) never
  fights the specs' API-driven modes.
- **The cache can go stale** (user changes theme on another device, or the
  shared e2e user flips between specs): the auth round-trip corrects it within
  the load — a one-frame transition at worst. Multi-tab: last write wins.
  Documented.
- **The script is a hand-maintained string** (it cannot import the resolver):
  kept at 8 lines; the unit-pinned cache format is the sync contract between
  `themeCachePayload` and the script's parse.
- **The meta append-after trick** (last valid `theme-color` match wins in
  Chromium) is guarded to create the plain meta only once.
- **`page.route` inside a spec** is new to this repo — the abort route MUST be
  unrouted in a `finally` (a leaked route would bounce every later goto to
  /login — the exact failure mode observed with agent-browser during the
  audit).

---

## Execution log (post-execution addendum)

Executed TDD-style on 2026-10-08, exactly per the order above.

**RED.** `tests/e2e/theme-system.spec.ts` written first — 12 pins across 7
describes (A-family ×5, B-family ×4, print ×1, light guard ×1, cache ×1).
Observed RED on the pre-remediation build: **11 failed / 1 passed** (the
light regression guard — correctly green before AND after). Failure modes
exactly the designed ones: active nav `rgb(124,58,237)` where strongDark
was expected; class-less `<html>` on the dark-OS login and the aborted-auth
reload; the stale dark class after the runtime OS switch; no plain
theme-color meta; print kept the sidebar. `tests/theme-cache.test.ts` (6
pins) landed green with the new pure helpers by construction (format
contract).

**Locator fixes during RED** (all documented into AGENTS.md): the timetable
mobile accordion container is a `<section>`, not a div
(`div[class*="md:hidden"]` matched nothing — use
`[class*="md:hidden"]`); the avatar emoji grid lives on the APPEARANCE tab
and its buttons are labelled `"Choose avatar <emoji>"`; the swatch's
`transition-all` re-hit the S8 mid-transition lesson (an immediate read
caught `rgba(49,36,96,0.514)` — a blend frame; `waitForFunction` the final
value).

**GREEN S11-1.** `THEME_BOOT_SCRIPT` + `themeCachePayload`/`parseThemeCache`/
`THEME_CACHE_KEY` (theme.ts), the cache write + `installSystemThemeTracking()`
+ `ensureThemeColorMeta()` (store.ts), the `<head>` injection (layout.tsx),
the logout cache-clear (settings-view). **Compiled-output verification:** the
static `login.html` carries the inline script verbatim (the
`sf-theme`-reading IIFE). All A-pins flipped green.

**GREEN S11-2..S11-6.** `.sf-nav-active`/`.sf-nav-active-icon` classes
(nav-items.tsx — the gradient stays inline, the S8-A pins untouched),
`dark:text-sf-primary-strong-dark` (ViewAllLink), the timetable chip dark
pairs, `.sf-swatch-selected` (the avatar swatch — `soft`, one step deeper
than `.sf-selected-tint`'s `softest`), the `@media print` block.

**Verification.**
- The accent sweep re-run: **B-family findings 0 across all 7 accents**
  (desktop + mobile), with a before/after signature diff proving 14 findings
  eliminated and ZERO new ones introduced (the 22 remaining signatures are
  the documented non-gaps).
- Live dev-server probes re-ran the exact audit failures and pass: dark
  pre-paint with `/api/auth/me` aborted (the bounced /login is dark too),
  the fresh-context dark-OS login (`rgb(15,23,42)` card), the runtime OS
  switch re-theming both directions, the plain meta tracking the effective
  mode, the active nav at violet-300 in dark.
- VLM spot-checks: dark dashboard PASS, light dashboard PASS, light login
  PASS; the dark-Login "FAIL" (gray Sign-in button) was DOM-verified as the
  disabled-state false positive — the button is the reference-measured solid
  slate design (`dark:bg-slate-100` inversion at `disabled:opacity-50`).
- Full gates: **lint ✓ · tsc ✓ · 112 unit ✓ (9 files) · build ✓ ·
  205 e2e ✓ = 317 tests green**, the 193 prior chromium specs untouched
  (the light-mode byte-parity guarantee held).

**The cold-db flake (found during the final gate, fixed in-suite).** The
first final-gate run — the only one after a FRESH `db/e2e.db` deletion —
failed the calculator theme spec's persistence assertion (teal expected,
violet read) and cascaded: the failed test body never reached its in-test
violet restore, and every later violet-computed pin read teal. Root cause
(pre-existing, latent): the accent swatch's `savePreferences` PATCH is
fire-and-forget, and `goto("/Dashboard")`'s `/api/auth/me` can return the
OLD user while the PATCH lands after it (a cold SQLite makes the window
wider). Hardened per the repo's own S4-lesson idiom: the teal click now
awaits the PATCH response (`Promise.all` with `waitForResponse`, exactly
like the restore), the persistence read polls (`waitForFunction`) instead
of a one-shot evaluate, and a `test.afterEach` PATCHes violet back so ANY
future failure in that describe can never poison the suite again. Re-run
from a cold db: **205 e2e ✓** — the flake is closed.

**Captures.** All 31 refreshed via `node scripts/capture-studyflow.mjs`
(24 light + 6 dark + the NEW `dark-Login.png` — a fresh colorScheme-dark
context documenting the login theming; the script's count message fixed
30→31) + the 4 audit-evidence captures
(`s11-audit-{fouc,login}-{before,after}.png`).

**Deliverables:** theme.ts (cache helpers + boot script), store.ts (cache
write + system tracking + meta sync), layout.tsx (`<head>` injection),
nav-items/shared/timetable/settings view edits, globals.css
(`.sf-nav-active{,-icon}` + `.sf-swatch-selected` + the print block),
`tests/e2e/theme-system.spec.ts` (12 pins), `tests/theme-cache.test.ts`
(6 pins), the calculator-spec flake hardening, `scripts/accent-dark-sweep.mjs`
(audit tooling), the capture script's dark-Login phase, 31 screenshots + 4
evidence captures, aligned root docs (README/AGENTS/CLAUDE/PAD ADR-009/SKILL
AP-47..49), this execution log, the session_14.md narrative, and the
worklog entry.

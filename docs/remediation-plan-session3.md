# Remediation Plan — Session 3 Mobile-Chrome & Token Parity Audit

**Date:** 2026-10-07 (session 3)
**Scope:** Re-audit of the StudyFlow clone against the live reference
(`https://omni-study1.base44.app`, authed as `sepnetflix2023@outlook.com`)
with agent-browser computed-style probes on BOTH apps side-by-side at
desktop (1280×800) and mobile (390×844), including a fake-clock probe that
mapped the reference's greeting buckets across all 24 hours.

**Method:** Every gap below was verified against the reference DOM (computed
styles / bounding boxes) before being accepted; non-gaps are recorded at the
end. This plan follows `docs/remediation-plan.md` (session 2), whose R1–R8
fixes were all re-verified GREEN at session start.

---

## Audit baseline (all green at session start)

| Check | Result |
|---|---|
| `git pull` sync with `origin/main` | ✅ clean (merged remote `docs/session_2.md` @ 20de8f0) |
| `bun run lint` / `bun run typecheck` | ✅ exit 0 |
| `bun run test` (Vitest) | ✅ 83/83 |
| Dev server `/api/health` | ✅ `{"status":"ok","db":"up","app":"studyflow"}` |
| Canvas gradient (sRGB-exact 3 stops) | ✅ identical on both apps |
| Card radius/shadow/border/padding | ✅ 16px / v3 shadow-sm / #f1f5f9 / 24px |
| Button radius 6px / nav item 12px | ✅ identical |
| Stat chip gradients (all 4) | ✅ identical (violet/blue/orange/pink pairs) |
| Sidebar geometry (260px fixed glass, main ml 260px) | ✅ identical |
| Stat grid (cols-2 mobile / 4 desktop, gap 16px) | ✅ identical |
| Greeting style (30px/700 slate-800) | ✅ identical |
| Clock text colors (violet-700 time / violet-600 date) | ✅ identical |
| Avatar (36px gradient circle, initial "D") | ✅ identical |
| Desktop sidebar nav items (icon+label+dot, px-4 py-3 rounded-xl) | ✅ identical |
| Mobile drawer: 20 links, navigate + auto-close, Escape/backdrop | ✅ functional parity |

---

## Gaps found (fix list)

### S3-A — MEDIUM · Dashboard stat-card icons render 20px, reference 24px

**Evidence:** reference stat icons compute `w-6 h-6` (24px) inside the 48px
gradient chips; the clone renders `h-5 w-5` (20px). Chip size, gradients,
radius and white color all match — only the glyph is one step small.

**Fix:** `src/components/views/shared.tsx` `StatCard`: icon `h-5 w-5` →
`h-6 w-6`.

**Verification:** computed-style probe (24px); updated e2e pin.

### S3-B — LOW · Sidebar clock renders "3:43 AM", reference "03:43 AM"

**Evidence:** reference clock (sidebar + mobile app bar) renders a 2-digit
hour ("03:43 AM", "03:45 AM" measured twice); the clone's `formatTime12h`
emits "3:43 AM".

**Fix:** `src/lib/date.ts` `formatTime12h`: pad the 12-hour hour to two
digits (`03:43 AM`, `12:05 PM`).

**Verification:** unit test in `tests/date.test.ts`.

### S3-C — LOW · Clock chip second gradient stop drifts from indigo-50

**Evidence:** reference chip = `linear-gradient(to right bottom,
rgb(245,243,255), rgb(238,242,255))` — violet-50 → **indigo-50** exactly.
The clone's `color-mix(in srgb, strong 7%, white)` second stop computes
≈ rgb(246,241,254) — close but not exact (the hue rotation violet→indigo
cannot be reproduced by mixing toward white).

**Fix:** add a `softestAdjacent` token to `ACCENT_TOKENS` (violet →
indigo-50 `238 242 255`, the measured reference value; other accents get
their adjacent-hue 50-level analogs), expose it as
`--sf-primary-softest-adjacent`, and use it as the clock chip's second stop.
Also fixes the latent bug S3-J (below), which this audit exposed.

**Verification:** computed-style probe equals `rgb(238, 242, 255)` on the
default accent; unit test pins the token.

### S3-D — MEDIUM · Greeting bucket map wrong at night ("Good night" never exists in the reference)

**Evidence:** fake-clock probe (Date.prototype.getHours patched, SPA
navigation to force re-render) mapped the reference's greeting across all
hours: 0–11 → "Good morning", 12–16 → "Good afternoon", 17–23 → "Good
evening". **"Good night" never appears.** The clone returns "Good night"
for hours 0–4 — at 3 AM the clone greets "Good night" while the reference
greets "Good morning" (both measured live at the same minute).

**Fix:** `src/lib/router.ts` `greetingForHour`: drop the `hour < 5` night
branch (morning covers 0–11).

**Verification:** unit tests in `tests/router.test.ts` (boundaries 0/11/12/
16/17/23, and no "Good night" output for any hour).

### S3-E — HIGH · Mobile app bar: wrong position model, wrong content, 64px dead gap

**Evidence (measured on both apps at 390×844):**

| Aspect | Reference | Clone (before fix) |
|---|---|---|
| Position | `fixed top-0 left-0 right-0` + `glass` | `sticky` |
| main offset | `pt-16` (64px) — content at 80px | `pt-20` (80px) **on top of** the in-flow sticky header → content at **144px** |
| Background | `.glass` (white/80, blur 20px, 1px white/50 border) + `shadow-sm` | white/85, blur 24, slate border-b |
| Left content | hamburger (36px, rounded-md, 16px glyph) + **32px gradient brand chip + "StudyFlow"** | hamburger + 32px flat chip + **current view title** |
| Right content | **live clock** "03:45 AM" (text-sm/500 slate-600) | none |

The 64px dead gap below the app bar affects EVERY mobile view.

**Fix:** rework `MobileHeader` in `src/components/layout/mobile-chrome.tsx`
to the reference model (fixed + glass + brand + live clock via the fixed
`formatTime12h`); change `main` in `src/app/page.tsx` from `pt-20` to
`pt-16`.

**Verification:** probe — header computed `position: fixed`, first mobile
content top = 80px, brand text "StudyFlow", clock text matches
`/^\d{2}:\d{2} (AM|PM)$/`; updated e2e specs.

### S3-F — MEDIUM · Mobile drawer internals diverge from the reference

**Evidence (reference DOM dump vs clone):**

| Aspect | Reference | Clone (before fix) |
|---|---|---|
| Panel width | `w-72` = 288px | 290px (`w-[290px]`) |
| Backdrop | `bg-black/20 backdrop-blur-sm` | `bg-black/45`, no blur |
| Panel chrome | no border, `shadow-2xl` | `border-r slate-200`, `shadow-xl` |
| Brand header | `p-6`, **40px gradient chip**, h1 16px | `px-5 py-4`, 36px flat chip, 15px |
| Nav links | icon (20px) + label, `px-4 py-3 rounded-xl`, active = gradient tint + violet text + **trailing dot** (identical to desktop sidebar) | text-only, `px-3 py-3 rounded-lg`, active = flat soft bg |
| Footer | **none** | avatar + name + email + time |

**Fix:** rebuild `MobileDrawer` mirroring the reference: `w-72` panel,
20%/blur backdrop, `shadow-2xl`, `p-6` brand header with the 40px gradient
chip (accent-aware via `--sf-*`, consistent with the sidebar brand chip),
nav links reusing the sidebar's icon+label+dot item structure, and remove
the footer (the reference has none; user identity remains in the desktop
sidebar footer and Settings).

**Verification:** probes (288px panel, backdrop alpha 0.2 + blur, nav link
icon 20px + rounded-xl 12px, no footer); updated e2e specs.

### S3-G — MEDIUM · "Start My Day" button stretches full-width on mobile

**Evidence:** at 390px the reference's CTA measures 155×36 (content width,
`inline-flex`); the clone stretches to 358px — its parent is
`flex flex-col md:flex-row`, and an unconstrained flex child stretches in
the column cross-axis.

**Fix:** `src/components/views/dashboard-view.tsx`: add `self-start` to the
CTA (desktop `md:flex-row` layout unaffected).

**Verification:** probe — mobile CTA width < 200px; e2e pin.

### S3-H — LOW · `.glass` blur 16px vs reference 20px (+ missing white hairline)

**Evidence:** reference glass surfaces (sidebar + mobile app bar) compute
`backdrop-filter: blur(20px)` with a `1px solid rgba(255,255,255,0.5)`
border; the clone's `.glass` = blur(16px), no border.

**Fix:** `src/app/globals.css` `.glass`: blur 20px + the white hairline
border (dark variant keeps its own colors).

**Verification:** probe on sidebar + app bar.

### S3-I — LOW · Sidebar brand-chip icon stroke 1.75 vs reference 2

**Evidence:** reference sidebar chip icon = 20px, strokeWidth 2 (measured);
clone = 20px, strokeWidth 1.75. (Chrome icons are `strokeWidth={2}` per
AGENTS.md.)

**Fix:** `src/components/layout/sidebar.tsx`: chip icon `strokeWidth={2}`.

**Verification:** probe.

### S3-J — MEDIUM · Accent switching leaves `deep`/`softest` tokens violet (functional bug)

**Evidence:** live repro on the clone — switch Settings → Appearance to
Blue: `--sf-primary` updates to `59 130 246` (inline) but
`--sf-primary-deep` still computes `109 40 217` (violet-700) and
`--sf-primary-softest` is not set inline at all — `applyToDocument` in
`src/lib/store.ts` only writes six of the nine tokens, so the clock text /
chip colors stay violet under every non-violet accent.

**Fix:** `applyToDocument` writes the full token set (primary, foreground,
soft, soft-dark, strong, strong-dark, deep, softest, softest-adjacent).

**Verification:** probe after switching accents (deep follows the accent);
unit test on the emitted variable set.

---

## Audited NON-gaps (no action — do not re-chase)

| Suspect | Verdict |
|---|---|
| Sidebar `shadow-xl` serializes as `oklab(...)` on the clone vs `rgba(226,232,240,.5)` on the reference | Same color + geometry — the browser merely serializes the pinned v3 hex through an oklab color function. Rendered pixels identical. |
| Brand/CTA/avatar gradients end violet-600 (clone) vs indigo-600 (reference) | Session-2 audited decision: accent-aware superset (the reference's own accent picker is **broken** — see next row). |
| Reference accent picker has no effect on the running app | Verified live: selected Blue + Save Preferences + full reload → all theme colors remain violet (`--primary: 139 92 246`, clock/brand/nav still violet). The reference's picker persists the choice (the scaled swatch stays selected) but never re-themes. The clone's working accent system is the functional superset; default-accent (violet) values are the parity targets. |
| Mobile app-bar hamburger glyph | Renders 16px on the reference (despite a `w-6 h-6` class — Base44 global CSS constrains it); clone matches at 16px after S3-E. |
| Drawer h1 16px vs sidebar h1 18px | Both apps differ the same way internally (the reference's drawer brand is 16px, its sidebar 18px) — mirrored, not a gap. |
| Login page, dark mode, AI/math routes, DB contract, rewrites, auth, tests | Re-verified aligned; no changes. |

---

## Execution order (TDD)

1. **Red:** update the failing expectations first —
   `tests/date.test.ts` (2-digit hour), `tests/router.test.ts` (greeting
   map), `tests/theme.test.ts` (softestAdjacent + complete var set), and
   the e2e pins in `tests/e2e/mobile-navigation.spec.ts` (fixed glass app
   bar with brand + clock, 288px drawer, 80px content offset, icon nav
   links) + `tests/e2e/navigation.spec.ts` (stat icon 24px, CTA content
   width).
2. **S3-C/S3-J** theme.ts + store.ts + globals.css token plumbing.
3. **S3-B** date.ts clock format; **S3-D** router.ts greeting map.
4. **S3-E/S3-F** mobile-chrome.tsx rework (header + drawer) + page.tsx
   `pt-16`; **S3-H** `.glass`; **S3-I** sidebar chip stroke.
5. **S3-A** stat icon size; **S3-G** CTA `self-start`.
6. Full gate: `lint → typecheck → test → build → test:e2e`.
7. Dev-server probes re-verified against the reference measurements above.
8. Screenshot refresh (mobile chrome + dashboard), docs alignment
   (README/AGENTS/CLAUDE/PAD/SKILL + this plan's execution log), worklog.
9. Commit + push to `main` via `docs/ssh_git_wrapper_v3.py`.

---

## Execution log (post-plan addendum)

All ten fixes landed TDD-style: the unit expectations (date/router/theme)
were updated first and observed failing (5 RED), then the implementation,
then green (86 unit tests = 83 prior + 3 new). The e2e parity pins were
similarly written before the component rework and observed failing against
the then-current build.

**Fixes as landed:**

| ID | Change | Files |
|---|---|---|
| S3-A | Stat icon `h-6 w-6` (24px) | `src/components/views/shared.tsx` |
| S3-B | `formatTime12h` pads the hour to 2 digits | `src/lib/date.ts` |
| S3-C | New `softestAdjacent` token (violet → indigo-50 `238 242 255` EXACT); clock chip second stop uses it | `src/lib/theme.ts`, `src/app/globals.css`, `src/components/layout/sidebar.tsx` |
| S3-D | `greetingForHour`: morning 0–11, afternoon 12–16, evening 17–23 (no night bucket) | `src/lib/router.ts` |
| S3-E | Mobile app bar: `fixed` + `.glass` + `shadow-sm`, brand chip + "StudyFlow" + live `HeaderClock` (right); main `pt-20` models the reference's 64px bar + 16px breathing room → first heading at 80px on BOTH apps | `src/components/layout/mobile-chrome.tsx`, `src/app/page.tsx` |
| S3-F | Drawer rebuilt to the reference: `w-72` (288px) panel, `bg-black/20 backdrop-blur-sm` backdrop, `shadow-2xl` (no right border), `p-6` brand header with 40px gradient chip, nav items via the new shared `NavItemLink` (icon + label + trailing dot, px-4 py-3 rounded-xl, active gradient tint), footer removed | `src/components/layout/mobile-chrome.tsx`, `src/components/layout/nav-items.tsx` (new), `src/components/layout/sidebar.tsx` (refactored onto the shared item) |
| S3-G | CTA `self-start` (content-sized at mobile: 147×36 vs the reference's 155×36) | `src/components/views/dashboard-view.tsx` |
| S3-H | `.glass` = white/80 + blur(20px) + 1px white/50 hairline (dark variant kept) | `src/app/globals.css` |
| S3-I | Sidebar brand-chip icon `strokeWidth={2}` | `src/components/layout/sidebar.tsx` |
| S3-J | `applyToDocument` writes the COMPLETE token set via `accentCssVars` (deep/softest/softest-adjacent now follow the accent) | `src/lib/store.ts` |

**Discoveries during execution:**

1. **The pt-16/pt-20 arithmetic.** First attempt used `pt-16`, which
   REPLACES the `p-4` top padding (CSS shorthand ordering) and landed the
   heading at 64px, not the reference's 80px. The reference's main is
   `pt-16` + an inner `p-4` wrapper; the clone models the identical visual
   offset as a single `pt-20`. Measured parity (heading at y=80) is what
   the e2e pin asserts — internal padding distribution is free.
2. **oklab color serialization.** Tailwind v4's `bg-black/20` computes as
   `oklab(0 0 0 / 0.2)` in Chromium (same rendered 20% black as the
   reference's `rgba(0,0,0,0.2)`). The drawer-backdrop e2e pin accepts
   both serializations — same lesson as the sidebar-shadow non-gap.
3. **Drawer nav items now come from one source.** The new
   `nav-items.tsx` (`NAV_ICONS` + `NavItemLink`) is consumed by BOTH the
   desktop sidebar and the mobile drawer, so the two can no longer drift
   apart (the session-3 drawer gaps existed precisely because they had).

**Final gate (all green):** lint ✓ · typecheck ✓ · 86 unit ✓ · build ✓ ·
61 e2e ✓ (56 prior + 5 new parity pins; one oklab assertion fixed during
the run). Dev-server probes confirm every token matches the measured
reference values above; VLM review of the refreshed mobile captures
confirms the app bar, content spacing, drawer backdrop/panel/nav items,
and the absence of the drawer footer.

**Screenshots:** all 24 captures refreshed via the new
`scripts/capture-studyflow.mjs` (login + 20 desktop views + 3 mobile).

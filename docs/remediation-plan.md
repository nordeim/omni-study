# Remediation Plan — Visual & Functional Parity Audit (Session 2)

**Date:** 2026-10-07
**Scope:** Post-session-1 audit of the StudyFlow clone against the live reference
(`https://omni-study1.base44.app`, authed as `sepnetflix2023@outlook.com`) using
agent-browser computed-style probes on BOTH apps side-by-side, plus a VLM
screenshot review (dashboard: EXCELLENT, login: GOOD).

**Method:** Every gap below was verified against the reference DOM (computed
styles / bounding boxes), not guessed. Each fix carries its evidence and a
verification step. Non-gaps (audited, no action) are recorded at the end so
future sessions don't re-chase them.

---

## Audit baseline (all green at session start)

| Check | Result |
|---|---|
| `git pull` sync with `origin/main` | ✅ clean (merged session log `eab559e`) |
| `bun run lint` / `bun run typecheck` | ✅ exit 0 |
| `bun run test` (Vitest) | ✅ 83/83 |
| Dev server `/api/health` | ✅ `{"status":"ok","db":"up"}` |
| All 20 views, console error sweep | ✅ zero errors/warnings |
| Mobile drawer: 20 links, navigate + auto-close | ✅ matches reference exactly |
| Mobile app bar height | ✅ 64px on both apps |
| Sidebar geometry | ✅ 260px fixed, glass `rgba(255,255,255,0.8)`, `main` offset 260px |
| Card shadow / border | ✅ v3 `shadow-sm` pin, `#f1f5f9` border |
| Active nav item | ✅ gradient tint + violet-600 text (accent-aware superset) |
| Stat grid | ✅ `grid-cols-2 lg:grid-cols-4 gap-4` (16px gap both) |

---

## Gaps found (fix list)

### R1 — HIGH · Tailwind v4 radius tokens inflated one notch (the "shadow trap" wrongly applied to radii)

**Evidence (measured on both apps):**

| Element | Reference (v3 semantics) | Clone (before fix) |
|---|---|---|
| Card `rounded-2xl` | **16px** | **20px** ❌ |
| Button `rounded-md` | **6px** | **8px** ❌ |

**Root cause:** `src/app/globals.css` pins
`--radius-sm: 0.375rem; --radius-md: 0.5rem; --radius-lg: 0.75rem; --radius-xl: 1rem; --radius-2xl: 1.25rem`
— the whole scale shifted one notch up, pattern-matching the v4 **shadow**
one-notch shift onto radii. But Tailwind v4 did **not** shift the radius scale
above the small end (verified in `node_modules/tailwindcss/theme.css`):
`md 6px / lg 8px / xl 12px / 2xl 16px / 3xl 24px` — identical to v3. Only the
bottom changed (v3 `rounded-sm` 2px became v4 `rounded-xs`; v4 `rounded-sm` = 4px).

**Fix:** delete the md/lg/xl/2xl pins (v4 defaults are already v3-exact); pin
`--radius-sm: 0.125rem` (v3 semantics — the UI kit uses `rounded-sm` on
dropdown/dialog/select item corners). Comment the trap so it is never re-derived.

**Verification:** computed-style probe on dev (cards 16px, buttons 6px, nav
items 12px) + new e2e parity pins in `tests/e2e/navigation.spec.ts` (TDD:
assertions written first, observed failing, then fixed).

### R2 — MEDIUM · Dashboard stat-card icons don't match the reference

**Evidence (lucide icon names extracted from both DOMs):**

| Stat card | Reference | Clone (before fix) |
|---|---|---|
| Today's Progress | `target` | `target` ✅ |
| Pending Tasks | `square-check-big` | `list-checks` ❌ |
| Due Soon | `book-open` | `book-open` ✅ |
| Focus Time | `flame` | `sparkles` ❌ |

**Fix:** `dashboard-view.tsx` — Pending Tasks → `SquareCheckBig` (already
imported), Focus Time → `Flame` (new import). Sparkles stays on the
Start My Day button (reference matches there).

**Verification:** DOM probe lists the four lucide names; dashboard screenshot.

### R3 — MEDIUM · Sidebar footer avatar default state and geometry

**Evidence:** reference avatar = `w-9 h-9 rounded-full` (36px), gradient
`from-violet-400 to-indigo-500`, white **initial** when the user has no emoji
avatar (reference user renders "s"). Clone = `w-10 w-10` (40px), flat
`--sf-primary-soft` background, always an emoji (default "🎓" even when the
user record has none).

**Fix:**
- New shared `UserAvatar` component (gradient `rgb(var(--sf-primary)) → rgb(var(--sf-primary-strong))`, white initial from `userName || email` first character when `avatar` is empty, emoji when set).
- `store.ts`: default + hydrate fallback `avatar: ""` (not "🎓").
- `sidebar.tsx` + `mobile-chrome.tsx` drawer footer: use `UserAvatar` (36px).
- `settings-view.tsx` profile preview: keep the large tile, render initial fallback too.
- `prisma/seed.ts`: demo user `avatarEmoji: ""` → reviewers see the reference's default state (initial "D"); the emoji picker in Settings demonstrates the feature.

**Verification:** DOM probe on sidebar footer (36px, gradient, "D"); settings picker still sets emojis.

### R4 — LOW · Sidebar collapse button glyph

**Evidence:** reference uses lucide `chevron-left`; clone uses
`PanelLeftClose` / `PanelLeftOpen` (a panel glyph, visually different).

**Fix:** swap to `ChevronLeft` / `ChevronRight` in `sidebar.tsx`.

**Verification:** DOM probe on the collapse button SVG class.

### R5 — LOW · Canvas gradient third color-stop drift

**Evidence:** reference computed
`linear-gradient(to right bottom, rgb(248,250,252), rgb(255,255,255), rgba(245,243,255,0.3))`;
clone renders the third stop as `rgba(241,237,255,0.3)` because globals.css
approximates it as `hsl(252 100% 96.5% / 0.3)` (≈ rgb 241,237,255).

**Fix:** write the stop exactly as `rgb(245 243 255 / 0.3)`; update the
adjacent comment; strengthen the e2e canvas assertion to pin the exact stop.

**Verification:** computed-style probe on the clone canvas.

### R6 — LOW · Documentation accuracy

**Evidence:** `prisma/schema.prisma` defines **21** models; README/AGENTS/CLAUDE/PAD say "20".

**Fix:** correct the count in all four docs; link this remediation plan from
README (Troubleshooting/Project Status) and AGENTS.md; refresh the PAD known-issues
table with the R1 root cause (a sixth Tailwind-v4-class trap: "verify the
actual default scale before pinning").

---

## Execution order (TDD)

1. **Red:** add e2e parity pins for card radius 16px + button radius 6px + exact canvas stop (they must fail against the current build).
2. **R1** globals.css radius fix → dev-server probes green (cards 16px / buttons 6px / nav 12px).
3. **R2–R5** component fixes → probes green.
4. **R3 store/seed change** → unit tests updated if any assert the "🎓" default.
5. Full gate: `lint → typecheck → test → build → test:e2e` (e2e pins from step 1 now green).
6. Screenshots refresh (`docs/screenshots/`) + VLM re-review of the dashboard.
7. **R6** docs updates + `omni-study_SKILL.md` creation (per the two distill skills).
8. Commit (Conventional Commits) + push to `main` via `docs/ssh_git_wrapper_v3.py`.

---

## Audited NON-gaps (no action — do not re-chase)

| Suspect (source) | Verdict |
|---|---|
| Login "Sign in" button looks grey (VLM) | **False positive** — clone is `bg-slate-900` = ref `rgb(15,23,42)`; VLM read the *disabled* state (form empty → `disabled:opacity-50`). |
| Stat grid "tighter" (VLM) | Measured `gap-4` = 16px on both. Perception artifact of the empty reference data. |
| Section heights differ (VLM) | Reference account has no data (empty states); clone is seeded. Content, not design. |
| Brand gradients end violet-600, reference ends indigo-500/600 (brand chip, Start My Day, avatar) | Deliberate **accent-aware superset** design: the reference re-themes via its own accent system; the clone routes all gradients through `--sf-*` tokens. Default-accent delta is imperceptible (VLM: EXCELLENT). |
| Reference login branding "AcademiaFlow (Copy)" vs clone "StudyFlow" | Deliberate (session-1 decision): StudyFlow is the in-app brand of the reference itself. |
| Clone login has password-visibility toggle + demo hint | Deliberate affordances (superset); hint sits below the card. |
| Floating "N" button (VLM, login) | Next.js dev-tools indicator — dev mode only, absent in production build. |
| Mobile drawer a11y: reference hamburger has no accessible name | Clone is strictly better (labelled open/close buttons) — keep. |
| e2e/`db` files, DATABASE_URL contract, rewrites, auth, AI routes | Verified aligned with docs; no changes. |

---

## Execution log (post-plan addendum)

All R1–R6 fixes landed TDD-style (e2e parity pins written first and observed
failing, then the fixes, then green). Two additional items surfaced during
execution and were fixed in the same pass:

**R7 (added) — Sidebar clock chip one notch too saturated.**
Measured on the reference during fix verification: the clock chip is
`bg-gradient-to-br from-violet-50 to-indigo-50` (violet-50 → indigo-50) with
`text-violet-700` time / `text-violet-600` date — the clone had a flat
violet-100 chip with violet-600/500 text. Fixed accent-aware via two new
tokens in `src/lib/theme.ts` (`deep` 700-level, `softest` 50-level — all 7
accents, v3-pinned hexes) + a `color-mix(in srgb, … 7%, white)` second stop;
first stop and both text colors now match the reference EXACTLY (measured
`rgb(245,243,255)`, `rgb(109,40,217)`, `rgb(124,58,237)`).

**R8 (added) — e2e robustness: hydration race + stale e2e db.**
The full-suite run exposed (a) an order-dependent flake where the accent
specs clicked Settings buttons before React attached handlers, and (b) the
persisted `db/e2e.db` carrying the pre-remediation "🎓" demo user (the seed
short-circuits when the user exists). Fixed with a `hydrated(page)` gate
(`waitForFunction` on the theme store's inline `--sf-primary` var — set only
post-hydration) in `calculator.spec.ts`, and by deleting `db/e2e.db` so
`global-setup` reseeds fresh. Both quirks documented in AGENTS.md.

**Final gate (all green):** lint ✓ · typecheck ✓ · 83 unit ✓ · build ✓ ·
56 e2e ✓ (54 prior + 2 new parity pins). Dev-server probes confirm every
measured token now matches the reference; VLM re-review verdict: EXCELLENT.

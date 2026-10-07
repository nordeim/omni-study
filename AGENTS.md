# AGENTS.md

High-signal instructions for coding agents working in this repo. Everything here was learned the hard way — skip it and you will re-derive it.

## Commands

| Command | Purpose |
|---------|---------|
| `bun install` | Install deps (Bun ≥ 1.3) |
| `bun run dev` | Dev server on :3000 (Turbopack), logs tee'd to `dev.log` |
| `bun run lint` / `bun run typecheck` | ESLint / `tsc --noEmit` — both must be clean |
| `bun run test` | Vitest unit layer (99 tests; `*.test.ts` only — never picks up e2e specs) |
| `bun run build` | Production build → `.next/standalone` (**required before e2e**) |
| `bun run test:e2e` | Playwright vs the standalone build on :3100 with `db/e2e.db` (123 specs) |
| `node scripts/capture-studyflow.mjs` | Refresh all 24 `docs/screenshots/` captures from the dev server |
| `bun run db:push` / `db:seed` | Create schema + demo data at `db/custom.db` |
| `bunx vitest run tests/calculator.test.ts` | One unit file |
| `bunx playwright test tests/e2e/tasks.spec.ts --project=chromium` | One e2e file (needs a current build) |

**Gate order before pushing:** `lint → typecheck → test → build → test:e2e`. There is no hosted CI; the local gate is the only gate. Pushes go to `main` only, via `docs/ssh_git_wrapper_v3.py` (see `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).

## The DATABASE_URL contract (read before touching anything db-related)

`DATABASE_URL="file:../db/custom.db"` in `.env` — the db file lives at **`<repo>/db/custom.db`**. Three tools resolve that relative URL **differently**, all verified empirically:

1. **Runtime** (`next dev`/`build`/standalone): `src/lib/db-path.ts` re-anchors it against the repo that owns `prisma/schema.prisma` → correct.
2. **Prisma CLI with a shell-provided env var**: anchors at the schema file → correct. The `db:*` npm scripts set the var inline for exactly this reason — do NOT call raw `prisma db push` and rely on repo-root `.env` auto-loading.
3. **Prisma CLI with `.env`-loaded var**: anchors at the **CWD** → one directory too high. This is the historical foot-gun.

Also: **Next.js dev (Turbopack) pre-resolves** relative `file:` DATABASE_URLs against the project dir before any app code runs. `db-path.ts` detects the resulting wrong-but-absolute value (target missing + schema-anchored default exists) and corrects it. `tests/db-path.test.ts` pins all of this — if you change resolution rules, update those tests in the same commit.

The e2e suite isolates its own `db/e2e.db` via the same shell-env mechanism (see `tests/e2e/global-setup.ts`).

## Architecture facts you cannot guess from filenames

- **One page, twenty views.** The reference app is an SPA with PascalCase routes (`/Dashboard` … `/Settings`). `src/app/page.tsx` is the whole app: auth gate → shell → view switcher; `next.config.ts` rewrites the 20 paths onto `/`; `src/lib/router.ts` is the single view↔path map (unit-tested). Do not create real route folders for views.
- **Sidebar is `fixed` + `hidden lg:flex`** (`w-[260px]`, `.glass`); `main` offsets with `lg:ml-[260px] pt-20 lg:pt-8` — the mobile app bar is ALSO `fixed` + `.glass` (64px, brand + live clock), so `pt-20` models the reference's measured 64px bar + 16px breathing room (first heading at y=80 on BOTH apps). Below `lg` everything goes through the mobile drawer (`src/components/layout/mobile-chrome.tsx`).
- **Nav items have ONE source:** `src/components/layout/nav-items.tsx` (`NAV_ICONS` + `NavItemLink`) is consumed by BOTH the desktop sidebar and the mobile drawer — never re-implement the item markup. The reference drawer has NO footer.
- **View headers have ONE source:** `ViewHeader` in `src/components/views/shared.tsx` renders the reference model — `h1 text-2xl font-bold text-slate-800 flex items-center gap-2` with an optional 24px `text-sf-primary` icon (16 views; Tasks/MyDay/Calendar have none), `size="lg"` for the 30px MyDay/FocusTimer titles, and a 16px subtitle with the reference's exact per-view wording. All 20 views consume it — never hand-roll a page header.
- **Primary CTAs are GRADIENT buttons (session-5):** every primary action uses the Button `gradient` variant — `.sf-gradient` (sRGB-exact `linear-gradient(to right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))`, hover via `--sf-primary-gradient-to-strong`) + the v3 `shadow` (`.sf-gradient-shadow`); empty-state CTAs add the accent-tinted `.sf-gradient-shadow-lg`. Never render a solid `bg-sf-primary` CTA. (The reference's own gradient-button text renders YELLOW — a pixel-verified Base44 platform bug; the clone keeps white.)
- **Task rows are standalone CARD rows (session-6, measured with live reference data):** `TaskRowCard` in `views/shared.tsx` renders `group bg-white rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-md` wrapping `flex items-center gap-3 p-4`, with a 24px ROUND checkbox whose 2px border IS the priority color (slate-300/sky-400/amber-400/red-400), a slate-700 font-medium title, pill meta (due slate-100 future / red-100 due-today, repeat violet-100), and h-8 w-8 hover-revealed sun/star/ellipsis actions (active star = violet-500 + fill). Tasks + MyDay consume it; the Dashboard renders its own bare `p-4 gap-4` row with a 20px round checkbox. The Tasks left panel is a borderless `border-r border-slate-100` column with r12 px-4 py-3 16px buttons (violet-50/violet-700 active).
- **Assignment rows carry an interactive progress slider (session-6):** Radix slider (h-2 slate-200 track, sRGB-exact violet→indigo gradient fill, 20px white/violet-500 thumb, violet-600 % label); `onValueCommit` PATCHes `progress`. Rows also render the blue due-in pill, bordered priority pill (flag icon), and slate-100 type pill. Exams are a `lg:grid-cols-3` CARD grid with an `h-2` subject-color strip, amber urgency badge, icon detail rows, and a border-t type footer. Calendar day cells are `aspect-square` centered with 4-color dots (blue/amber/red/emerald) + solid-accent TODAY fill + a legend + border-l-4 day-detail rows.
- **Flashcards is a TWO-PANEL view (session-7, measured with live reference data):** `flex h-[calc(100vh-8rem)] gap-6` — a `w-80 border-r border-slate-100 pr-6` sidebar (the view h1 + a 36px gradient New Deck icon-button + inline-icon search + `space-y-2` deck rows: `p-4 rounded-xl bg-slate-50 border-2 border-transparent` with 40px colored icon blocks whose inline `backgroundColor` is the deck's `color` swatch, h3 names, `p.text-xs` card counts) and a detail pane (`h2 text-xl font-bold` + description + AI Generate outline + Add Card gradient + Study gradient when cards exist; `md:grid-cols-2 lg:grid-cols-3` card grid of `rounded-xl border p-4 hover:shadow-md` cards with difficulty pills and hover-revealed h-7 edit/delete; a 3D-flip study mode: `h-80 perspective-1000` + `preserve-3d`, sRGB-exact gradient front, white/`border-2 border-violet-200` back, Exit Study, `h-10 px-8` chevron nav). Deck colors + card difficulty live on the model (`color`, `difficulty`); the 6-swatch picker constant is `DECK_COLORS` in `flashcards-view.tsx` (violet/blue/emerald/amber/red/pink-500 — red before pink).
- **The Timetable week grid is a grid-cols-8 time table (session-7):** Time column + 7 day heads (`p-3 text-center border-l` + full day name `text-sm font-medium text-slate-600` + `text-lg font-bold` date); `h-[60px] border-b border-slate-50` hour cells labelled **"7 AM"** (trimmed hour, no minutes); `min-w-[900px]` inside `overflow-x-auto`; a `md:hidden` mobile accordion (40px rounded-xl date chips + "N classes" + rotating chevron). **Column→ISO mapping is `(col + 6) % 7`** — Sunday-first display columns vs ISO storage (0=Monday); the previous `(col+1)%7` form silently rendered every column two days ahead of its header. My Classes = `p-6` + header row (h2 `text-lg font-bold` + today's long date) + 3-col grid.
- **Analytics stat cards are icon-block cards (session-7):** `rounded-xl bg-white shadow-sm` (r12, border-0) + `p-6` + 48px `w-12 h-12 rounded-xl` tinted blocks — Tasks Completed (square-check-big, **violet-100**), Assignments (book-open, **blue-100**), Focus Time (clock, **green-100** — the measured tint; NOT emerald-100), Upcoming Exams (graduation-cap, **orange-100**) — with fraction values + rate subs; chart cards are "Task Activity (Last 7 Days)" / "Focus Time (Last 7 Days)" with trending-up icon headers and 7-day day-name axes; grade-trend + subject-distribution stay as superset charts.
- **Events view is a DARK terminal panel (session-5):** `bg-slate-900 rounded-2xl shadow-2xl`, intentionally dark in BOTH themes — do not add dark: overrides inside it. Day sections run 7 days from the selected day with year-less labels; the header carries the `CW <n>` calendar-week (`isoWeekNumber`). Recurring events (repeat) expand into occurrences inside the visible window.
- **The form-control palette is GRAY, not zinc/slate (session-5):** `--foreground` gray-950, `--input`/`--border` gray-200, `--muted-foreground` gray-400 (the reference's shadcn theme). View-level text stays slate. Dialogs are `max-w-md` + `rounded-lg` with `h-9` transparent inputs.
- **Heading hierarchy (reference-measured):** h1 view titles → h2 card titles (SectionCard) → h3 stat values (StatCard) + empty-state titles + micro-labels ("My Lists" = `text-sm font-semibold text-slate-500 uppercase tracking-wider`). Views orchestrate; `shared.tsx` owns the patterns.
- **Empty states follow ONE design:** `EmptyState`/`SimpleEmptyState` (shared.tsx) — 80px rounded-2xl gradient block (`--sf-primary-empty-from` → `-empty-to`, violet-100 → indigo-100 measured) + 40px accent icon + h3 20px/600 + 16px slate-500 hint.
- **State:** three Zustand stores — `useAppStore` (view/sidebar/drawer), `useThemeStore` (mode/accent/avatar, applied to `<html>` as RGB-triplet CSS vars via `accentCssVars` — the COMPLETE set, or non-violet accents leave stale violet tokens), `useDataStore` (per-entity client cache) + a `mutations` object that refreshes touched collections. No React Context, no react-query.
- **API pattern:** route files are 3-line shells over `makeCollectionRoutes`/`makeItemRoutes` + an entity delegate in `src/lib/server/entities.ts`. Every query is scoped `where: { userId }` — ownership by construction. Every payload passes its Zod schema in `src/lib/validation.ts` first.
- **Auth:** scrypt hashes + HMAC-signed stateless cookie sessions (`src/lib/auth.ts`), login rate-limited 10/IP/15 min (in-memory — single instance only). No auth framework.
- **AI:** `z-ai-web-dev-sdk` is imported **only** inside `src/app/api/{ai,math}/route.ts` files (server-side). Never import it from client code. Three AI surface routes: `/api/ai/chat` (assistant), `/api/ai/generate-cards` (deck flashcards — S7-A superset), `/api/ai/generate-questions` (practice-test questions — S7-B superset; the reference's AI generation works but its test creation is broken).
- **Calculator:** `src/lib/calculator.ts` implements a tokenizer + shunting-yard evaluator (incl. a `u-` unary operator). There is no `eval` anywhere.

## Tailwind v4 traps (all live in this repo — see docs/Tailwind-V4-Validation-Report.md + docs/remediation-plan*.md)

1. Theme vars under `@theme inline` must be **full `hsl()` colors** — bare triplets silently resolve to transparent.
2. The v3-era palette is **pinned** in `@theme` (v4's oklch defaults drift 1–3 units/channel).
3. `--shadow-sm` is **pinned** to v3's `0 1px 2px 0 rgb(0 0 0 / 0.05)` — v4 shifted the whole scale one notch.
4. **Never** put `mt-*`/`mb-*` children inside `space-y/x-*` containers — v4's `:where()` rewrite flips the specificity outcome. The codebase convention is `flex gap-*` only.
5. Gradients that need exact sRGB parity use inline-style `linear-gradient(...)` (v4 interpolates utility gradients in oklab). E.g. the `.sf-canvas` background and stat-card chips.
6. The **radius scale did NOT shift** in v4 (md…3xl are v3-identical; only `rounded-sm` changed meaning — v3's 2px value is now `rounded-xs`). `globals.css` pins `--radius-sm: 0.125rem` for the v3 semantics and NOTHING else — a previous one-notch-up pin block inflated every corner (~33%) and silently broke parity (cards 20px vs the reference's 16px). Pinned by the e2e "corner radii" spec.
7. **v4 opacity utilities serialize as oklab/oklch in computed styles** — `bg-black/20` computes as `oklab(0 0 0 / 0.2)` in Chromium, not `rgba(0,0,0,0.2)`; `bg-white/95` as `oklab(0.999994 … / 0.95)` and `bg-slate-50/50` as `lab(98.16 … / 0.5)`. Same rendered colors; e2e assertions must accept both serializations (drawer backdrop + login pins).
8. **`p-4 pt-16` is NOT `p-4 + 16px more top`** — the later `pt-*` utility REPLACES the shorthand's top padding. The mobile offset models the reference's measured y=80 as a single `pt-20`; assert OBSERVABLE positions (heading y-coordinate), not internal padding distribution.
9. **The BLUR scale shifted one notch in v4** (session-4 discovery): v4 inserted `blur-xs` (4px) at the bottom, so v3's `backdrop-blur-sm` (4px) is now v4's `backdrop-blur-xs`; v4's `backdrop-blur-sm` computes 8px. Same family as the radius trap. The drawer backdrop and the login card's blur use `backdrop-blur-xs` (e2e-pinned at blur(4px)).
10. **Colors written in modern syntax serialize as their LEGACY forms in computed styles** (session-5): `rgb(0 0 0 / 0.1)` in box-shadow reads back as `rgba(0, 0, 0, 0.1)`, and any UNPINNED palette class (v4's oklch defaults) reads back as `lab(...)` — `text-cyan-400` computed `lab(76.6 -40.9 -29.6)` before `cyan-400` got pinned to `#22d3ee`. Pin every palette color you assert on (trap 2/7 family) and write e2e expectations in the serialized form. The S6 pins extend the pin block to sky/amber/red/blue/emerald/yellow (the priority/urgency palette); S7 adds blue/green/orange/red-100s, yellow-100/700, pink-500 — including **green-100 `#dcfce7`, NOT emerald-100** (the reference's measured Focus Time tint).
11. **`rounded-full` serializes in EXPONENTIAL form** (session-6): `border-radius: 9999px` reads back as `3.35544e+07px` in Chromium computed styles — e2e pins on round controls accept both forms (see `isRound` in `tests/e2e/parity-session6.spec.ts`).
12. **Same-hue families are NOT interchangeable** (session-7): the reference's "green-looking" tints are exact v3 hexes — the Analytics Focus Time block is green-100 `#dcfce7` (measured rgb(220,252,231)), NOT emerald-100 `#d1fae5`, and its deck/group swatches are emerald-500/amber-500, NOT green-500/orange-500. Always convert measured `rgb()` to the hex before picking the utility class.

Hover-parity probing must run in Playwright, not a touch-emulating browser — v4 wraps `hover:` in `@media (hover: hover)` and produces false failures on touch emulation.

## Testing quirks

- E2E specs run against the **production standalone build** — rebuild after any component change or you will chase ghosts.
- The e2e database **persists across runs** — give created rows unique titles (see `stamp` in `tasks.spec.ts`) or strict-mode locators will trip on stale rows. Changing seed values requires deleting `db/e2e.db` (the seed short-circuits when the demo user exists).
- **Hydration gate before clicking:** SSR HTML renders buttons before React attaches handlers — a click right after `goto` can silently no-op (order-dependent flake). Gate on the theme store's inline `--sf-primary` var on `<html>` (see `hydrated()` in `calculator.spec.ts`).
- Tests share ONE signed-in storageState (the rate limiter!). `auth.spec.ts` opts out with an empty `storageState`. Keep total real logins ≪ 10 per run.
- The theme spec mutates the shared user record — it **restores the violet accent** at the end AND awaits the settings PATCH response before ending (ending right after the click can abort the in-flight request, persisting teal and poisoning every later violet pin — an order-dependent flake pinned in session 4).
- Radix tabs use `data-state="active"` (not `"selected"`); hidden TabsContent panes stay mounted — scope role lookups to `getByRole("tabpanel", { name })`.
- Playwright `getByRole({ name })` is case-insensitive AND substring-based — "New note" also matches "New notebook" (strict-mode violations). Use `exact: true` when names collide. `getByLabel` only resolves controls with a real label association — a label wrapping a control GROUP must be asserted via `getByText`.
- `next dev` OOMs in ~4 GB containers when several headless browsers run — close extra sessions before long e2e/dev sessions.
- Greeting buckets are reference-probed: morning 0–11, afternoon 12–16, evening 17–23 — **"Good night" never renders** (faked-clock probe of the live reference; pinned in `tests/router.test.ts`).
- `formatTime12h` renders a 2-digit hour ("03:43 AM") — the reference clock format (sidebar + mobile app bar).

## Conventions

- TypeScript strict; `unknown` over `any`; early returns; no unused imports (lint is a gate).
- Components: `"use client"` at top; views live in `src/components/views/*-view.tsx` and export `<Name>View`.
- Dates: `src/lib/date.ts` (local-time semantics, Monday-first weeks). Icons: lucide-react, `strokeWidth={2}` in chrome.
- Styling: shadcn-style primitives in `src/components/ui/*`; accent colors via `rgb(var(--sf-*))` inline styles or the `text-sf-primary-*`/`bg-sf-primary-*` utilities — never hardcode violet hexes in view code. Brand gradients end at the ADJACENT hue (`--sf-primary-gradient-to`, indigo-600 for violet) and the avatar uses the lighter `--sf-primary-avatar-from/to` pair (violet-400 → indigo-500, measured) — never route them through primary/strong. Primary CTAs use the Button `gradient` variant (`.sf-gradient` classes) — never solid violet. The green/orange accents are the EMERALD/AMBER families (session-5 — the reference's swatch faces).
- Errors: API handlers return `{ error }` JSON via `errorResponse()`; client shows `toast.error(err.message)`.
- Commits: Conventional Commits, atomic units. Never commit `.env`, `db/*.db`, `dev.log`, or SSH keys (all gitignored — keep it that way).

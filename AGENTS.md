# AGENTS.md

High-signal instructions for coding agents working in this repo. Everything here was learned the hard way — skip it and you will re-derive it.

## Commands

| Command | Purpose |
|---------|---------|
| `bun install` | Install deps (Bun ≥ 1.3) |
| `bun run dev` | Dev server on :3000 (Turbopack), logs tee'd to `dev.log` |
| `bun run lint` / `bun run typecheck` | ESLint / `tsc --noEmit` — both must be clean |
| `bun run test` | Vitest unit layer (87 tests; `*.test.ts` only — never picks up e2e specs) |
| `bun run build` | Production build → `.next/standalone` (**required before e2e**) |
| `bun run test:e2e` | Playwright vs the standalone build on :3100 with `db/e2e.db` (72 specs) |
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
- **Heading hierarchy (reference-measured):** h1 view titles → h2 card titles (SectionCard) → h3 stat values (StatCard) + empty-state titles + micro-labels ("My Lists" = `text-sm font-semibold text-slate-500 uppercase tracking-wider`). Views orchestrate; `shared.tsx` owns the patterns.
- **Empty states follow ONE design:** `EmptyState`/`SimpleEmptyState` (shared.tsx) — 80px rounded-2xl gradient block (`--sf-primary-empty-from` → `-empty-to`, violet-100 → indigo-100 measured) + 40px accent icon + h3 20px/600 + 16px slate-500 hint.
- **State:** three Zustand stores — `useAppStore` (view/sidebar/drawer), `useThemeStore` (mode/accent/avatar, applied to `<html>` as RGB-triplet CSS vars via `accentCssVars` — the COMPLETE set, or non-violet accents leave stale violet tokens), `useDataStore` (per-entity client cache) + a `mutations` object that refreshes touched collections. No React Context, no react-query.
- **API pattern:** route files are 3-line shells over `makeCollectionRoutes`/`makeItemRoutes` + an entity delegate in `src/lib/server/entities.ts`. Every query is scoped `where: { userId }` — ownership by construction. Every payload passes its Zod schema in `src/lib/validation.ts` first.
- **Auth:** scrypt hashes + HMAC-signed stateless cookie sessions (`src/lib/auth.ts`), login rate-limited 10/IP/15 min (in-memory — single instance only). No auth framework.
- **AI:** `z-ai-web-dev-sdk` is imported **only** inside `src/app/api/{ai,math}/route.ts` files (server-side). Never import it from client code.
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

Hover-parity probing must run in Playwright, not a touch-emulating browser — v4 wraps `hover:` in `@media (hover: hover)` and produces false failures on touch emulation.

## Testing quirks

- E2E specs run against the **production standalone build** — rebuild after any component change or you will chase ghosts.
- The e2e database **persists across runs** — give created rows unique titles (see `stamp` in `tasks.spec.ts`) or strict-mode locators will trip on stale rows. Changing seed values requires deleting `db/e2e.db` (the seed short-circuits when the demo user exists).
- **Hydration gate before clicking:** SSR HTML renders buttons before React attaches handlers — a click right after `goto` can silently no-op (order-dependent flake). Gate on the theme store's inline `--sf-primary` var on `<html>` (see `hydrated()` in `calculator.spec.ts`).
- Tests share ONE signed-in storageState (the rate limiter!). `auth.spec.ts` opts out with an empty `storageState`. Keep total real logins ≪ 10 per run.
- The theme spec mutates the shared user record — it **restores the violet accent** at the end AND awaits the settings PATCH response before ending (ending right after the click can abort the in-flight request, persisting teal and poisoning every later violet pin — an order-dependent flake pinned in session 4).
- Radix tabs use `data-state="active"` (not `"selected"`); hidden TabsContent panes stay mounted — scope role lookups to `getByRole("tabpanel", { name })`.
- `next dev` OOMs in ~4 GB containers when several headless browsers run — close extra sessions before long e2e/dev sessions.
- Greeting buckets are reference-probed: morning 0–11, afternoon 12–16, evening 17–23 — **"Good night" never renders** (faked-clock probe of the live reference; pinned in `tests/router.test.ts`).
- `formatTime12h` renders a 2-digit hour ("03:43 AM") — the reference clock format (sidebar + mobile app bar).

## Conventions

- TypeScript strict; `unknown` over `any`; early returns; no unused imports (lint is a gate).
- Components: `"use client"` at top; views live in `src/components/views/*-view.tsx` and export `<Name>View`.
- Dates: `src/lib/date.ts` (local-time semantics, Monday-first weeks). Icons: lucide-react, `strokeWidth={2}` in chrome.
- Styling: shadcn-style primitives in `src/components/ui/*`; accent colors via `rgb(var(--sf-*))` inline styles or the `text-sf-primary-*`/`bg-sf-primary-*` utilities — never hardcode violet hexes in view code. Brand gradients end at the ADJACENT hue (`--sf-primary-gradient-to`, indigo-600 for violet) and the avatar uses the lighter `--sf-primary-avatar-from/to` pair (violet-400 → indigo-500, measured) — never route them through primary/strong.
- Errors: API handlers return `{ error }` JSON via `errorResponse()`; client shows `toast.error(err.message)`.
- Commits: Conventional Commits, atomic units. Never commit `.env`, `db/*.db`, `dev.log`, or SSH keys (all gitignored — keep it that way).

# AGENTS.md

High-signal instructions for coding agents working in this repo. Everything here was learned the hard way — skip it and you will re-derive it.

## Commands

| Command | Purpose |
|---------|---------|
| `bun install` | Install deps (Bun ≥ 1.3) |
| `bun run dev` | Dev server on :3000 (Turbopack), logs tee'd to `dev.log` |
| `bun run lint` / `bun run typecheck` | ESLint / `tsc --noEmit` — both must be clean |
| `bun run test` | Vitest unit layer (`*.test.ts` only — never picks up e2e specs) |
| `bun run build` | Production build → `.next/standalone` (**required before e2e**) |
| `bun run test:e2e` | Playwright vs the standalone build on :3100 with `db/e2e.db` |
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
- **Sidebar is `fixed` + `hidden lg:flex`** (`w-[260px]`, `.glass`); `main` offsets with `lg:ml-[260px] pt-16 lg:pt-0`. Below `lg` everything goes through the mobile drawer (`src/components/layout/mobile-chrome.tsx`).
- **State:** three Zustand stores — `useAppStore` (view/sidebar/drawer), `useThemeStore` (mode/accent/avatar, applied to `<html>` as RGB-triplet CSS vars), `useDataStore` (per-entity client cache) + a `mutations` object that refreshes touched collections. No React Context, no react-query.
- **API pattern:** route files are 3-line shells over `makeCollectionRoutes`/`makeItemRoutes` + an entity delegate in `src/lib/server/entities.ts`. Every query is scoped `where: { userId }` — ownership by construction. Every payload passes its Zod schema in `src/lib/validation.ts` first.
- **Auth:** scrypt hashes + HMAC-signed stateless cookie sessions (`src/lib/auth.ts`), login rate-limited 10/IP/15 min (in-memory — single instance only). No auth framework.
- **AI:** `z-ai-web-dev-sdk` is imported **only** inside `src/app/api/{ai,math}/route.ts` files (server-side). Never import it from client code.
- **Calculator:** `src/lib/calculator.ts` implements a tokenizer + shunting-yard evaluator (incl. a `u-` unary operator). There is no `eval` anywhere.

## Tailwind v4 traps (all live in this repo — see docs/Tailwind-V4-Validation-Report.md + docs/remediation-plan.md)

1. Theme vars under `@theme inline` must be **full `hsl()` colors** — bare triplets silently resolve to transparent.
2. The v3-era palette is **pinned** in `@theme` (v4's oklch defaults drift 1–3 units/channel).
3. `--shadow-sm` is **pinned** to v3's `0 1px 2px 0 rgb(0 0 0 / 0.05)` — v4 shifted the whole scale one notch.
4. **Never** put `mt-*`/`mb-*` children inside `space-y/x-*` containers — v4's `:where()` rewrite flips the specificity outcome. The codebase convention is `flex gap-*` only.
5. Gradients that need exact sRGB parity use inline-style `linear-gradient(...)` (v4 interpolates utility gradients in oklab). E.g. the `.sf-canvas` background and stat-card chips.
6. The **radius scale did NOT shift** in v4 (md…3xl are v3-identical; only `rounded-sm` changed meaning — v3's 2px value is now `rounded-xs`). `globals.css` pins `--radius-sm: 0.125rem` for the v3 semantics and NOTHING else — a previous one-notch-up pin block inflated every corner (~33%) and silently broke parity (cards 20px vs the reference's 16px). Pinned by the e2e "corner radii" spec.

Hover-parity probing must run in Playwright, not a touch-emulating browser — v4 wraps `hover:` in `@media (hover: hover)` and produces false failures on touch emulation.

## Testing quirks

- E2E specs run against the **production standalone build** — rebuild after any component change or you will chase ghosts.
- The e2e database **persists across runs** — give created rows unique titles (see `stamp` in `tasks.spec.ts`) or strict-mode locators will trip on stale rows. Changing seed values requires deleting `db/e2e.db` (the seed short-circuits when the demo user exists).
- **Hydration gate before clicking:** SSR HTML renders buttons before React attaches handlers — a click right after `goto` can silently no-op (order-dependent flake). Gate on the theme store's inline `--sf-primary` var on `<html>` (see `hydrated()` in `calculator.spec.ts`).
- Tests share ONE signed-in storageState (the rate limiter!). `auth.spec.ts` opts out with an empty `storageState`. Keep total real logins ≪ 10 per run.
- The theme spec mutates the shared user record — it **restores the violet accent** at the end; don't break that cleanup or every later spec sees teal.
- Radix tabs use `data-state="active"` (not `"selected"`); hidden TabsContent panes stay mounted — scope role lookups to `getByRole("tabpanel", { name })`.
- `next dev` OOMs in ~4 GB containers when several headless browsers run — close extra sessions before long e2e/dev sessions.

## Conventions

- TypeScript strict; `unknown` over `any`; early returns; no unused imports (lint is a gate).
- Components: `"use client"` at top; views live in `src/components/views/*-view.tsx` and export `<Name>View`.
- Dates: `src/lib/date.ts` (local-time semantics, Monday-first weeks). Icons: lucide-react, `strokeWidth={2}` in chrome.
- Styling: shadcn-style primitives in `src/components/ui/*`; accent colors via `rgb(var(--sf-*))` inline styles or the `text-sf-primary-*`/`bg-sf-primary-*` utilities — never hardcode violet hexes in view code.
- Errors: API handlers return `{ error }` JSON via `errorResponse()`; client shows `toast.error(err.message)`.
- Commits: Conventional Commits, atomic units. Never commit `.env`, `db/*.db`, `dev.log`, or SSH keys (all gitignored — keep it that way).

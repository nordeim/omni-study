---
name: omni-study
description: >
  Comprehensive engineering skill distilled from the StudyFlow (Omni-Study)
  codebase — a production-grade Next.js 16 clone (functional superset, measured
  visual parity) of a hosted study-planner SPA. Covers the design-token pins
  that keep Tailwind v4 visually identical to the v3 reference, the
  three-anchor SQLite DATABASE_URL contract, the one-page SPA + rewrites
  routing model, the CRUD factory, auth, and the two-layer testing strategy.
  Use this to extend, debug, onboard, or replicate the architecture without
  re-deriving two sessions of hard-won knowledge.
version: 1.0.0
tags:
  - nextjs16
  - react19
  - tailwindv4
  - prisma
  - sqlite
  - visual-parity
  - spa
  - testing
---

# StudyFlow (Omni-Study) — Engineering SKILL

> **What this is:** the single-source-of-truth reference for working in
> `nordeim/omni-study`. Every fact below is verified against the codebase
> (147 tests green at last update: 86 Vitest unit + 61 Playwright e2e).
> Sections marked with ⚠️ encode non-obvious contracts — violating them has
> historically produced silent visual or data-path bugs.

---

## §1 Project Identity & Design Philosophy

**One sentence:** StudyFlow is a self-hosted study-companion web app — a
production-ready clone of `omni-study1.base44.app` that is a **functional
superset** (every view really works: CRUD persistence, AI features, themes)
while maintaining **measured visual parity** with the reference.

**Design thesis:** *parity is measured, not guessed.* Computed styles from the
live reference (a Tailwind v3 app) are ground truth; screenshots and VLM
reviews are secondary signals. Every visual fix lands with an e2e
computed-style pin where feasible.

**Non-negotiable rules:**
1. The 20 view paths are **rewrites onto one page** — never create per-view
   route folders (`/Dashboard` … `/Settings` all serve `src/app/page.tsx`).
2. The v3-pinned palette, `--shadow-sm`, and the radius contract in
   `globals.css` must not be removed or "modernized" — parity e2e specs fail
   if you do (and the reference drifts).
3. `z-ai-web-dev-sdk` is imported **only** inside API route files
   (`src/app/api/{ai,math}/**`) — never in client components.
4. Every API payload passes its Zod schema (`src/lib/validation.ts`); every
   Prisma query is scoped `where: { userId }`.
5. Layout uses `flex gap-*` exclusively — margin utilities inside
   `space-y/x-*` containers are banned (Tailwind v4 trap 4).
6. **Superset, not clone-of-quirks:** where the reference is broken or empty
   (unlabeled hamburger, empty states), the clone keeps the visual layout but
   ships the working/a11y-correct behavior.

**Anti-generic mandate:** no component-library defaults that drift from the
measured tokens (no `shadow-md` cards, no `rounded-3xl` surfaces, no oklch
palette drift). Accent colors always route through the `--sf-*` RGB-triplet
vars — never hardcode violet hexes in view code.

---

## §2 Tech Stack & Environment

| Layer | Technology | Version | Critical note |
|---|---|---|---|
| Framework | `next` | ^16.1.1 (16.4.0 installed) | App Router; `output: "standalone"`; Turbopack dev |
| UI runtime | `react` / `react-dom` | ^19.0.0 | Client view switching inside one page |
| Language | `typescript` | ^5 | `strict: true`; `tsc --noEmit` is a gate |
| Styling | `tailwindcss` + `@tailwindcss/postcss` | ^4 | **CSS-first** — no `tailwind.config.js`; tokens in `globals.css` `@theme` |
| Animation | `tw-animate-css` + `tailwindcss-animate` | ^1.3.5 / ^1.0.7 | Radix enter/exit transitions |
| Primitives | `@radix-ui/*` (16 pkgs) | current | shadcn-style wrappers in `src/components/ui/*` |
| Icons | `lucide-react` | ^0.525.0 | Nav icons `strokeWidth={2}`; view icons 1.75 |
| State | `zustand` | ^5.0.6 | 3 stores; URL is routing truth |
| Validation | `zod` | ^4.6.5 | v4 counts **code points** in `.max()` (UTF-16 trap) |
| ORM | `prisma` / `@prisma/client` | ^6.11.1 (6.19.3 installed) | SQLite provider; see ⚠️ §3 db contract |
| AI | `z-ai-web-dev-sdk` | ^0.0.18 | Server-only; `createVision` for photographed math |
| Unit tests | `vitest` | ^5.0.1 | Node env, `@` alias, `*.test.ts` only |
| E2E | `@playwright/test` | ^1.63.0 | Runs the **standalone build** on :3100 |
| Runtime | Bun | ≥ 1.3 | `bun run dev/build/test`; `bunx` for one-offs |

Dev-only conveniences that must never leak to prod assumptions:
`allowedDevOrigins: ["127.0.0.1", "localhost"]` (dev-chunk access) and the
Next dev-tools floating button (absent from the production build).

---

## §3 Bootstrapping & Configuration

```bash
git clone https://github.com/nordeim/omni-study.git
cd omni-study
bun install
bun run db:push && bun run db:seed   # creates <repo>/db/custom.db + demo data
cp .env.example .env                 # defaults already correct
bun run dev                          # http://localhost:3000
# demo@studyflow.app / Demo1234!
```

**⚠️ The DATABASE_URL contract (the most fragile invariant in the repo).**
`DATABASE_URL="file:../db/custom.db"` — the db lives at `<repo>/db/custom.db`.
Three tools resolve that relative URL differently (all verified empirically):

| Consumer | Anchor | Correct? |
|---|---|---|
| Runtime (`next dev/build/start`) via `src/lib/db-path.ts` | first anchor dir containing `prisma/schema.prisma` | ✅ |
| Prisma CLI with **shell-provided** env var (the `db:*` scripts) | the schema file | ✅ |
| Prisma CLI with `.env`-loaded var | **the CWD** (one dir too high) | ❌ foot-gun |

Never call raw `prisma db push` relying on repo-root `.env` auto-loading —
use `bun run db:push` / `db:seed` (they inline the env var). Additionally,
Next dev (Turbopack) **pre-resolves** relative `file:` URLs against the
project dir; `db-path.ts` detects the wrong-but-absolute result (target
missing + schema-anchored default exists) and corrects it. All pinned by
`tests/db-path.test.ts` (16 tests) — update them in the same commit if you
touch resolution.

**Config files that matter:**
- `next.config.ts` — `output: "standalone"`, `outputFileTracingRoot` pinned,
  `allowedDevOrigins`, and the **20 path rewrites** (`/Dashboard` … `/Settings`
  → `/`).
- `tsconfig.json` — strict, `@/*` → `src/*`.
- `eslint.config.mjs` — flat config, next core-web-vitals; lint is a gate.
- `vitest.config.ts` — node env, `@` alias, `include: tests/**/*.test.ts`
  (never picks up e2e specs).
- `playwright.config.ts` — 2 projects (auth setup + chromium), `workers: 1`,
  `fullyParallel: false`, webServer boots `.next/standalone` on :3100 with
  `DATABASE_URL=file:../db/e2e.db`, storageState shared.
- `postcss.config.mjs` — `@tailwindcss/postcss` only.

**Env vars:** `DATABASE_URL` (required, above), `AUTH_SECRET` (HMAC key for
session cookies; required in prod — dev fallback exists), `NEXT_PUBLIC_SITE_URL`
(metadata origin, optional).

---

## §4 The Design System (Code-First)

All tokens live in `src/app/globals.css`. **Verification rule:** every value
below was measured on the live reference via computed styles — a single wrong
value is a parity bug.

**Accent tokens (RGB triplets, the reference's own convention):** applied to
`:root` by `src/lib/theme.ts` (`useThemeStore.loadFromUser`), default Violet:

| Token | Violet value | Usage |
|---|---|---|
| `--sf-primary` | `139 92 246` (#8b5cf6) | Buttons, active nav, chips |
| `--sf-primary-strong` | `124 58 237` (#7c3aed) | "View All" links, active nav text, clock date |
| `--sf-primary-deep` | `109 40 217` (#6d28d9) | Clock time text (reference violet-700) |
| `--sf-primary-soft` | `243 232 255` | Icon chips, active tint layering |
| `--sf-primary-softest` | `245 243 255` | Clock chip gradient start (violet-50) |
| `--sf-primary-softest-adjacent` | `238 242 255` | Clock chip gradient END — the reference's exact indigo-50 (a hue rotation, not a white mix) |
| `--sf-primary-foreground` | `255 255 255` | Text on primary |
| `--sf-primary-*-dark` | (per accent) | Dark-mode counterparts |

Seven accents × 4 core stops each: violet / blue / green / orange / pink /
red / teal — full table in `src/lib/theme.ts` `ACCENT_TOKENS` (v3-pinned
hexes; adding an accent = one object literal + one `ACCENTS` entry).

**⚠️ The eight documented Tailwind v3→v4 traps (all live here):**
1. `@theme inline` vars must be **full `hsl()` colors** — bare triplets
   silently resolve to transparent.
2. The v3-era palette (slate 50–950, violet 100–900) is **pinned** in
   `@theme` — v4's oklch defaults drift 1–3 units/channel.
3. `--shadow-sm` is **pinned** to v3's `0 1px 2px 0 rgb(0 0 0 / 0.05)` —
   v4 shifted the whole shadow scale one notch.
4. Never mix `mt-*`/`mb-*` children inside `space-y/x-*` (v4's `:where()`
   rewrite). Codebase convention: `flex gap-*` only.
5. sRGB-exact gradients use inline-style `linear-gradient(...)` (v4
   interpolates utility gradients in oklab) — e.g. `.sf-canvas`, stat chips.
6. **The radius scale did NOT shift in v4** (md 6px / lg 8px / xl 12px /
   2xl 16px / 3xl 24px are v3-identical; only `rounded-sm` changed meaning —
   v3's 2px became v4's `rounded-xs`). `globals.css` pins ONLY
   `--radius-sm: 0.125rem` for v3 semantics. A one-notch-up pin block
   previously inflated every corner ~33% (cards 20px vs reference 16px,
   buttons 8px vs 6px) — fixed in session 2, pinned by the e2e
   "corner radii" spec.
7. **Opacity utilities serialize as oklab** in Chromium computed styles
   (`bg-black/20` → `oklab(0 0 0 / 0.2)`, NOT `rgba(0,0,0,0.2)` — same
   rendered color). E2E pins must accept both serializations.
8. **`pt-*` after `p-*` REPLACES the shorthand's top** — `p-4 pt-16` is
   64px of top padding, not 80. The mobile offset models the reference's
   measured y=80 as a single `pt-20`; always assert the OBSERVABLE
   position (heading y-coordinate), never the internal padding split.

**Typography:** system sans stack (ui-sans-serif → Apple Color Emoji …);
page greeting `text-3xl font-bold`; section titles `text-lg font-semibold`
+ `h-5 w-5` accent icon; stat values `text-[30px] font-bold`; nav labels
16px with `w-5` icons; body `text-sm`.

**Surface geometry (measured):** cards white, `1px solid #f1f5f9`
(slate-100), radius **16px** (`rounded-2xl` v3 semantics / `.sf-card`
`border-radius: 1rem`), v3 `shadow-sm`, `p-6`; buttons radius **6px**
(`rounded-md`); nav items `rounded-xl` → **12px**; login card ~16-20px.

**Canvas:** `.sf-canvas` =
`linear-gradient(to right bottom, hsl(210 40% 98%), hsl(0 0% 100%), rgb(245 243 255 / 0.3))`
— the third stop is violet-50 written in exact sRGB (an `hsl()` approximation
drifted it 4 units/channel). Dark variant swaps to a slate-950 family ramp.

**Custom classes:** `.glass` (sidebar `rgba(255,255,255,0.8)` + blur),
`.sf-card`, `.sf-focus` (accent focus ring), `.sf-scroll` (thin scrollbars),
`.sf-skeleton` + 2 keyframes (`sf-shimmer`, `sf-slide-in`).

---

## §5 Component Architecture & Patterns

**The one-page SPA model:** `src/app/page.tsx` is the entire app —
auth gate → app shell → view switcher. `next.config.ts` rewrites the 20
PascalCase paths onto `/`; the client store syncs `view` state with
`location.pathname`; `src/lib/router.ts` is the single view↔path map
(unit-tested). A dedicated `/login` route exists because the reference
redirects unauthenticated users there.

**Layers (trace any import):**
```
app/page.tsx (client shell)
  └─ components/layout/{sidebar,nav-items,mobile-chrome,user-avatar}.tsx  chrome
  └─ components/views/*-view.tsx (20) + shared.tsx               screens
       └─ components/ui/* (shadcn-style on Radix)                primitives
            └─ lib/{store,data,theme,router,date}.ts             client state
app/api/**/route.ts (server)
  └─ lib/server/{http,entities}.ts  → lib/{db,auth,validation}.ts server core
lib/{calculator,theme,router,date,auth,validation,db-path}.ts    pure seams (unit-tested)
```

**Client/Server decision tree:** everything interactive is `"use client"`
(top of file); server code appears only in route handlers + the two pages'
server shells. Server-only imports (`z-ai-web-dev-dev-sdk`, `node:crypto`,
`node:fs`) never appear in `components/` or client-reachable `lib/` modules.

**Chrome anatomy (measured):** sidebar `fixed left-0 w-[260px] hidden
lg:flex` + `.glass`; `main` offsets `lg:ml-[260px] p-4 pt-20 lg:p-8 lg:pt-8`;
below `lg` a FIXED `h-16` `.glass` app bar (hamburger + 32px gradient brand
chip + "StudyFlow" + live clock "03:43 AM" on the right — never the view
title) — `pt-20` models the reference's measured 64px bar + 16px breathing
room (first heading y=80 on BOTH apps). The slide-in drawer is a `w-72`
(288px) white panel over a `bg-black/20 backdrop-blur-sm` backdrop with
`shadow-2xl`, a `p-6` brand header (40px gradient chip), nav items from the
SHARED `nav-items.tsx` (`NavItemLink`: icon + label + trailing dot,
px-4 py-3 rounded-xl, active gradient tint), Esc/backdrop close, and NO
footer (reference-exact). Active nav item = gradient tint
`rgb(var(--sf-primary)/0.1) → rgb(var(--sf-primary-strong)/0.1)`
+ violet-600 text + trailing dot — ONE markup source for sidebar AND drawer.
Sidebar collapse toggles `w-[76px]` with a `ChevronLeft`/`ChevronRight`
glyph (reference-measured).

**The footer avatar (`UserAvatar`):** 36px gradient circle
(`primary → primary-strong`), white **initial** (first latin letter of
`userName || email`) when `avatar` is empty, emoji when set — the reference's
default state. One component, two sizes (`sm` 36px, `lg` 56px tile).

---

## §6 State Management Deep Dive (Zustand — the "hooks" of this app)

**`useAppStore`** (`src/lib/store.ts`) — SPA routing + chrome:
`view`, `navigate(view)` (pushes the PascalCase path via `history.pushState`),
`sidebarCollapsed`, `mobileMenuOpen`, `setMobileMenu`. Navigation inside the
SPA is `navigate(id)` — never bare `<Link>` clicks (sidebar links
`preventDefault` + navigate).

**`useThemeStore`** — mode/accent/avatar/userName/email, persisted to the
`User` record via `PATCH /api/settings/preferences`; `loadFromUser(user)`
hydrates once post-auth and calls `applyToDocument` which stamps the
`--sf-*` triplet vars **inline on `<html>`** (the e2e hydration gate keys
off this — see §10). `avatar: ""` = initial-letter default (R3 contract).

**`useDataStore`** (`src/lib/data.ts`) — per-entity client cache
(`subjects`, `tasks`, `exams`, …) with `loadAll()` on login and a typed
`mutations` object (`createTask`, `toggleTask`, `updateExam`, …) that
performs the API call **and refreshes the touched collections**. Views read
snapshots, never fetch ad-hoc. Adding an entity = Prisma model + delegate +
validation schema + `data.ts` slice + `mutations` entry.

**Store rules:** no React Context for app state; selectors
(`useAppStore((s) => s.view)`) not whole-store subscribes; stores are the
only mutation path (no direct `fetch` in views).

---

## §7 Data Layer: Prisma Models, CRUD Factory & Seed

**21 models** (`prisma/schema.prisma`): User, Subject, TaskList, Task,
Assignment, Exam, Event, TimetableClass, Notebook, Note, FlashcardDeck,
Flashcard, PracticeTest, StudyGroup, Grade, FocusSession, FileFolder,
FileItem, AiChatMessage, CalculatorHistoryEntry, Holiday. All entity rows
carry `userId` + timestamps; ownership is enforced in every query.

**The CRUD factory** (`src/lib/server/entities.ts`, 621 lines): one
`EntityDelegate` config per entity (model name, Zod create/update schemas,
default order, optional handler maps) consumed by
`makeCollectionRoutes`/`makeItemRoutes` (`src/lib/server/http.ts`). Route
files are 3-line shells:

```ts
// src/app/api/tasks/route.ts — the whole file
import { makeCollectionRoutes } from "@/lib/server/http";
import { tasksDelegate } from "@/lib/server/entities";
export const { GET, POST } = makeCollectionRoutes(tasksDelegate);
// src/app/api/tasks/[id]/route.ts — same, but makeItemRoutes → { PATCH, DELETE }
```

The factory provides: `requireUser()` auth → Zod parse → `where: { userId }`
→ Prisma call → `{ error }` JSON on failure (never stack traces). Special
routes outside the factory: `auth/*`, `files/*` (multipart ≤ 2 MiB base64),
`settings/preferences`, `calculator/history`, `ai/chat`, `ai/messages`,
`math/solve`, `health`.

**Seed** (`prisma/seed.ts`): idempotent (early-returns when the demo user
exists — ⚠️ changing seed VALUES requires deleting `db/e2e.db`, see §10);
demo user `demo@studyflow.app` / `Demo1234!` with subjects, tasks, exams,
notes, decks, grades; `avatarEmoji: ""` (reference default state).

**AI ingestion:** `/api/ai/chat` (6 study-mode system prompts) and
`/api/math/solve` (text via chat completions; images via
`createVision` with `model: "glm-4.5v"`) — both persist history
(`AiChatMessage`) and never expose the SDK to the client.

---

## §8 Accessibility Implementation

- **Focus:** `.sf-focus` applies `outline: 2px solid rgb(var(--sf-primary))`
  + 2px offset on `:focus-visible` — accent-aware, consistent.
- **Labels:** every icon-only button carries `aria-label` ("Open navigation
  menu", "Close menu", "Collapse sidebar", "Delete task", …). The reference's
  hamburger is unlabeled — the clone intentionally fixes this (superset
  rule §1.6).
- **Nav semantics:** `<nav aria-label="Primary">`, active link
  `aria-current="page"` (pinned by e2e).
- **Radix patterns:** tabs expose `role=tablist/tab/tabpanel` (assert
  `aria-selected`, NOT `data-state="selected"`); dialogs `role=dialog` with
  labelled triggers; selects/checkboxes/switches via the Radix wrappers.
- **Drawer:** Esc key + backdrop click close (spec'd in
  `tests/e2e/mobile-navigation.spec.ts`).
- **Emoji avatar picker:** `aria-pressed` per option + descriptive labels.
- **Known gap (documented, open):** no `prefers-reduced-motion` handling for
  the shimmer/slide keyframes.

---

## §9 Anti-Patterns & Common Bugs (historical, all fixed + pinned)

| # | Severity | Symptom | Root cause | Fix + pin |
|---|---|---|---|---|
| AP-1 | CRITICAL | db created one directory too high | `.env`-loaded `file:` URLs anchor at CWD in Prisma CLI | `db:*` scripts set env inline; `tests/db-path.test.ts` (16 tests) |
| AP-2 | CRITICAL | e2e hits the dev db / wrong client | hardcoded schema url embeds in the generated client | schema uses `env("DATABASE_URL")`; shell-env anchoring |
| AP-3 | HIGH | Every corner ~33% too large vs reference | one-notch-up radius pin block (v4 "shadow trap" wrongly applied to radii) | only `--radius-sm: 0.125rem` pinned; e2e "corner radii" spec (session-2 R1) |
| AP-4 | HIGH | Login button silently no-ops in e2e (order-dependent flake) | click lands pre-hydration (SSR buttons lack handlers) | `hydrated(page)` gate on inline `--sf-primary` var (session-2 R8) |
| AP-5 | MEDIUM | Canvas third stop 4 units/channel off | `hsl(252 100% 96.5%)` approximated violet-50 | exact `rgb(245 243 255 / 0.3)` + e2e pin |
| AP-6 | MEDIUM | Two `=` keys on the calculator | duplicate entry in `BASIC_KEYS` | removed; e2e keypad spec |
| AP-7 | MEDIUM | Wrong db in e2e after seed change | seed early-returns when demo user exists → stale `db/e2e.db` | delete `db/e2e.db` when seed VALUES change (AGENTS.md quirk) |
| AP-8 | MEDIUM | `space-y` gaps collapse next to `mt-*` children | v4 `:where()` zero-specificity rewrite (trap 4) | `flex gap-*` convention everywhere |
| AP-9 | LOW | Later e2e specs see teal accent | theme spec mutates the shared user record | violet restore at spec end (never break that cleanup) |
| AP-10 | LOW | Detached-element computed styles read `""` mid-e2e | locator resolved against the SSR splash, React removed it | wait for hydration before `evaluate` (canvas spec) |
| AP-11 | LOW | Dev server dies silently (~4 GB containers) | OOM killer targets `next-server` under browser load | close extra browser sessions before long runs |
| AP-12 | HIGH | Mobile content 64px too low (144px vs reference 80px) | app bar was STICKY (in flow) + main `pt-20` → offsets STACKED | fixed glass bar + `pt-20`; e2e "content starts at 80px" pin (session-3 S3-E) |
| AP-13 | MEDIUM | Clock text/chip stay violet after switching accents | `applyToDocument` wrote 6 of 9 tokens; deep/softest kept `:root` violet defaults | complete `accentCssVars` set; unit pin (session-3 S3-J) |
| AP-14 | MEDIUM | Sidebar/drawer nav items drift apart | drawer re-implemented item markup instead of sharing | ONE source: `nav-items.tsx` `NavItemLink` (session-3 S3-F) |
| AP-15 | LOW | e2e backdrop pin fails on identical color | `bg-black/20` computes as `oklab(0 0 0 / 0.2)` in Chromium | accept both serializations (trap 7) |
| AP-16 | LOW | Emoji length test off-by-UTF-16 | Zod v4 `.max()` counts code points | test updated with the semantics documented |

---

## §10 Debugging Guide (every entry encountered live)

**Build/e2e ghosts:** e2e runs the **standalone build** — after ANY component
change run `bun run build` before `bun run test:e2e`, or you debug stale
chunks. Symptom: a spec fails on UI you just changed but the dev server
shows the fix.

**Wrong db file (`{"db":"down"}` on `/api/health`, or data "missing"):**
check which file actually exists (`ls db/`), then re-read §3. First stop for
any db weirdness: `bunx vitest run tests/db-path.test.ts`.

**Hydration race (click does nothing):** SSR HTML renders buttons before
React attaches handlers. Gate: `page.waitForFunction(() =>
document.documentElement.style.getPropertyValue("--sf-primary") !== "")` —
the theme store sets that inline var only post-hydration.

**Computed styles read empty in e2e:** the element went detached
(splash removal race) — wait for a hydrated-shell landmark (e.g.
`getByRole("navigation", { name: "Primary" })`) first.

**Hover styles don't apply while probing:** v4 wraps `hover:` in
`@media (hover: hover)` — touch-emulating browsers false-fail. Probe hover
in Playwright (desktop project), never via touch emulation.

**Parity drift suspicion:** measure BOTH apps' computed styles (agent-browser
`eval` + `getComputedStyle`), not screenshots. VLM reviews produce false
positives (e.g. "grey Sign-in button" that was the disabled state) — always
confirm against the DOM before changing tokens.

**Live verification commands:**
```bash
curl -s localhost:3000/api/health           # {"status":"ok","db":"up"}
bunx playwright test tests/e2e/navigation.spec.ts --project=chromium
bunx vitest run tests/db-path.test.ts       # the db contract, isolated
tail -40 dev.log                            # request traces + prisma queries
```

---

## §11 Pre-Ship Checklist

**Gate order (the ONLY gate — no CI exists):**
```bash
bun run lint && bun run typecheck && bun run test && bun run build && bun run test:e2e
```
Current green state: lint ✓ · tsc ✓ · 86 unit ✓ · build ✓ · 61 e2e ✓.

**Pre-deployment:** set a real `AUTH_SECRET` (`openssl rand -hex 32`); use an
ABSOLUTE `DATABASE_URL` (see `docs/DEPLOYMENT.md` §4); never ship `.env`,
`db/*.db`, `dev.log`, or SSH material (all gitignored — keep it that way).

**Post-deployment smoke:** `/api/health` → ok; `/` redirects to `/login`;
demo login reaches a seeded dashboard; a PascalCase deep link (`/Tasks`)
renders with the sidebar active state.

**Visual verification:** computed-style pins green in e2e (shadow, gradient,
radii, avatar, stat icons, clock chip, mobile app bar + drawer); spot-check
the sidebar geometry (260px / glass / 260px offset); mobile: content starts
at y=80, drawer open → navigate → auto-close.

**Security:** no user enumeration on auth errors; rate limiter active;
uploads capped ≤ 2 MiB; `z-ai-web-dev-sdk` absent from client bundles.

**Git:** Conventional Commits, `main` only, push via
`docs/ssh_git_wrapper_v3.py` (see `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`;
the wrapper verifies remote == local HEAD and shreds its key copy).

---

## §12 Lessons Learnt & How to Avoid Them

**Session 1 (the build):**
1. *Parity is a measurement discipline.* Computed styles beat eyeballs and
   VLMs; the reference's own DOM is the oracle (VLM false positives cost
   real time — session 2 re-learned this).
2. *Prisma's `file:` URL anchoring depends on HOW the env var reaches the
   CLI* — shell-provided vs `.env`-loaded resolve differently (AP-1/AP-2).
   Empirical two-variable experiments settle such questions decisively.
3. *Next dev pre-resolves relative SQLite URLs* — defensive correction in
   `db-path.ts` (existence-gated fallback) keeps every entry point on one
   file.
4. *The reference's broken bits are parity targets for layout, not
   behavior* — ship the a11y-correct superset.
5. *e2e against the production build catches what dev never shows* (the
   duplicate `=` key, the detached-splash race).

**Session 2 (the parity audit):**
6. *Verify the framework's actual default scale before pinning "shifts."*
   The radius bug (AP-3) was a plausible-sounding pattern-match from the
   shadow trap — `node_modules/tailwindcss/theme.css` was the executable
   truth.
7. *Order-dependent e2e flakes are hydration races until proven otherwise*
   (AP-4); the inline `--sf-*` var is a cheap, reliable post-hydration
   signal.
8. *Persisted test databases inherit old seeds* — when seed VALUES change,
   delete `db/e2e.db` (AP-7).
9. *Small tokens, big blast radius:* one `hsl()` approximation drifted a
   canvas stop (AP-5); write measured colors in exact sRGB.
10. *VLM verdicts need DOM cross-examination* — three of its four flags were
    false positives; two of its "GOOD" misses were real (radius, icons).

---

## §13 Pitfalls to Avoid

- **Architecture:** don't create route folders per view (breaks the SPA +
  rewrites contract); don't bypass `mutations`/`data.ts` with ad-hoc fetches;
  don't import server-only modules client-side.
- **Database:** don't run raw `prisma db push` with repo-root `.env`; don't
  hardcode a url in the schema (breaks e2e isolation); don't touch
  resolution without updating `tests/db-path.test.ts` in the same commit.
- **Styling:** don't add margin children to `space-*` containers; don't
  re-pin the radius scale; don't use oklch-drifted v4 palette classes for
  parity surfaces; don't hardcode violet hexes in views (use `--sf-*`).
- **TypeScript:** `unknown` over `any`; no unused imports (lint gates it);
  Zod v4 `.max()` counts code points.
- **Testing:** don't add real logins to specs (rate limiter budget: ONE
  shared storageState); don't assert Radix `data-state="selected"`; don't
  reuse row titles across runs (db persists); don't run e2e without a fresh
  build; don't break the violet-restore cleanup in the theme spec.
- **Security:** never log or return stack traces (`errorResponse()` only);
  never trust payload shapes without their Zod schema; always scope Prisma
  queries by `userId`.

---

## §14 Best Practices

- **Organization:** views in `src/components/views/<name>-view.tsx` exporting
  `<Name>View`; chrome in `components/layout`; pure seams in `src/lib` with
  unit tests; `tests/` mirrors seams by concern, not path.
- **TypeScript:** `interface` for object shapes, `type` for unions
  (`ViewId`, `Accent`); `import type` for type-only imports; early returns.
- **React/Next:** `"use client"` at top; views orchestrate (no business
  math); keyed editors instead of effect-setState (see the notes-view
  refactor); `Link` + `preventDefault` + `navigate()` for SPA moves.
- **APIs:** thin route shells over the factory; Zod at every boundary;
  `{ error }` JSON envelope; ownership in the WHERE clause.
- **State:** three Zustand stores, selectors for reads, `mutations` for
  writes, refresh-touched-collections after each write.
- **Parity work:** measure both apps → write the failing e2e pin → fix →
  re-measure → document in `docs/remediation-plan.md`; update the trap list
  when a new engine difference is found.
- **Docs:** README (users) → AGENTS (agent quick-ref) → PAD (blueprint/ADRs)
  → this SKILL (distilled engineering knowledge). Update the right layer.

---

## §15 Coding Patterns (copy-pasteable, compile in-project)

**Add a CRUD entity (5 files, ~30 lines):**
1. Model in `prisma/schema.prisma` (`userId` + `createdAt`/`updatedAt`) →
   `bun run db:push`.
2. Zod `create`/`update` schemas in `src/lib/validation.ts`.
3. Delegate in `src/lib/server/entities.ts` (model, schemas, orderBy).
4. Route shells (collection + `[id]`) — 3 lines each (§7).
5. Client slice + `mutations` entries in `src/lib/data.ts`; render in a view.

**Hydration-safe e2e click:**
```ts
const hydrated = (page: Page) =>
  page.waitForFunction(
    () => document.documentElement.style.getPropertyValue("--sf-primary") !== "",
  );
await page.goto("/Settings");
await hydrated(page);
await page.getByRole("button", { name: "Teal accent" }).click();
```

**Accent-aware inline gradient (sRGB-exact, no oklab):**
```tsx
style={{ backgroundImage:
  "linear-gradient(to bottom right, rgb(var(--sf-primary-softest)), rgb(var(--sf-primary-softest-adjacent)))" }}
```

**Greeting buckets (reference fake-clock-probed):** morning 0–11,
afternoon 12–16, evening 17–23 — `greetingForHour` has NO "Good night"
branch. **Clock format:** `formatTime12h` renders a 2-digit hour
("03:43 AM") — used by the sidebar clock AND the mobile app bar.

**Initial-fallback avatar:** `UserAvatar` renders
`avatar || initialFor(userName, email)` — empty string means "reference
default state"; never re-introduce a default emoji.

**Computed-style parity pin (e2e):**
```ts
const card = page.locator("main .overflow-hidden.rounded-2xl").first();
await expect(card).toHaveCSS("border-radius", "16px");   // v3 = v4 here
```

**Zod-boundary route handler (factory equivalent, for special routes):**
```ts
const parsed = schema.safeParse(body);
if (!parsed.success) return errorResponse(400, "Invalid input");
const user = await requireUser();
await prisma.x.create({ data: { ...parsed.data, userId: user.id } });
```

---

## §16 Coding Anti-Patterns (don't → do)

- `any` → `unknown` + narrowing (strict mode is a gate).
- Bare `<Link href>` for SPA navigation → `Link` + `preventDefault` +
  `navigate(id)` (keeps store + URL in sync; hard loads lose session UI state).
- `bg-violet-500` in view code → `bg-sf-primary` / `rgb(var(--sf-primary))`
  (accent-aware; hardcodes break the theme system).
- `space-y-4` + `mt-2` children → `flex flex-col gap-4` (trap 4).
- `rounded-3xl` on cards → `rounded-2xl` / `.sf-card` (16px measured).
- `tailwind.config.js` → tokens in `globals.css` `@theme` (CSS-first).
- Effect-setState mirroring props → keyed child components (notes-view
  refactor pattern).
- `prisma db push` with `.env` → `bun run db:push` (inline env, §3).
- Client-side SDK imports → route-handler-only imports.
- New e2e login flows → reuse the shared storageState (rate limiter).

---

## §17 Responsive Breakpoint Reference

Tailwind v4 defaults (no custom breakpoints — verified):
`sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.

| Region | Behavior |
|---|---|
| `< lg` (mobile) | FIXED `h-16` glass app bar (hamburger + brand + live clock), slide-in drawer (`z-50`, 288px), `pt-20` main padding (content y=80); stat grid `grid-cols-2` |
| `≥ lg` (desktop) | fixed 260px glass sidebar, `lg:ml-[260px]` main, `lg:p-8`, stat grid `lg:grid-cols-4`, content grids `lg:grid-cols-3` (Tasks 2/3 + Exams 1/3) |

The ONLY structural breakpoint is `lg` — the reference's own cut (measured:
no bottom tab bar, drawer-only mobile nav). Mobile QA viewport: 390×844.

---

## §18 Z-Index Layer Map

| Layer | z | Where |
|---|---|---|
| Mobile app bar / desktop sidebar | 40 | `mobile-chrome.tsx`, `sidebar.tsx` |
| Mobile drawer overlay | 50 | `mobile-chrome.tsx` |
| Dialog + overlay | 50 | `ui/dialog.tsx` |
| Dropdown menu | 50 | `ui/dropdown-menu.tsx` |
| Toasts | top of DOM tree, portal | `ui/toast.tsx` (rendered after main) |

Rule: new overlays start at 50; never stack above toasts except modals that
must block them.

---

## §19 Color Reference (Complete — violet/default accent)

Verified against `globals.css` + `theme.ts` at distillation time.

**Accent ramp (violet):** `--sf-primary` #8b5cf6 · `--sf-primary-strong`
#7c3aed · `--sf-primary-deep` #6d28d9 · `--sf-primary-soft` #f3e8ff ·
`--sf-primary-softest` #f5f3ff · foreground #ffffff. Other six accents in
`ACCENT_TOKENS` (all v3 50/100/500/600/700-level hexes; dark counterparts
provided).

**Pinned v3 palette (subset used):** slate-50 #f8fafc … slate-950 #020817
(full 50–950 ramp pinned in `@theme`); violet-100 #ede9fe, violet-800
#5b21b6, violet-900 #4c1d95.

**Surfaces:** card white / border #f1f5f9 / radius 16px; canvas gradient
(§4); sidebar `rgba(255,255,255,0.8)` + blur; dark mode slate-950 family +
soft-dark accent tokens.

**Measured reference specifics:** "View All" links violet-600 #7C3AED; Sign-in
button slate-900 rgb(15,23,42); clock time violet-700 rgb(109,40,217); clock
date violet-600 rgb(124,58,237); Google button white/bordered.

---

## §20 TypeScript Interface Reference (key shapes)

```ts
type ViewId = "dashboard" | "myday" | "tasks" | "calendar" | "events"
  | "timetable" | "assignments" | "exams" | "notes" | "flashcards"
  | "practicetests" | "studygroups" | "gradetracker" | "analytics"
  | "files" | "calculator" | "mathsolver" | "aiassistant"
  | "focustimer" | "settings";                       // src/lib/router.ts
type Accent = "violet" | "blue" | "green" | "orange" | "pink" | "red" | "teal";
type ThemeMode = "light" | "dark" | "system";         // src/lib/theme.ts
interface AccentToken { primary, primaryFg, soft, softDark, strong,
  strongDark, deep, softest, softestAdjacent: string }  // RGB triplets
interface EntityDelegate { model, createSchema, updateSchema, orderBy, ... }
```

Entity rows are camelCase mirrors of the Prisma models (e.g. `Task {
id, userId, title, notes?, listId?, important, done, dueDate?, createdAt,
updatedAt }`); the client `mutations` object exposes typed
`create*/update*/delete*` per entity; `ApiError` carries the server's
`{ error }` envelope for `toast.error()`.

---

## Appendix A — The Meticulous Approach (six-phase workflow)

1. **ANALYZE** — read affected files completely; reproduce failures before
   theorizing; prefer executable truth (configs, lockfiles, computed styles).
2. **PLAN** — sequential, individually verifiable steps; for parity work,
   list the measured tokens being matched.
3. **VALIDATE** — confirm the plan against acceptance criteria (and the live
   reference when parity is involved) before writing code.
4. **IMPLEMENT** — smallest safe diff; respect §13/§14; update touched tests
   in the same change.
5. **VERIFY** — full gate (`lint → typecheck → test → build → test:e2e`);
   browser-verify interactive changes — a green build is not evidence a page
   works.
6. **DELIVER** — atomic Conventional Commit; update the right doc layer;
   hand off honestly (verified / not verified / remaining).

## Appendix B — Quick Reference Card

| Need | Where |
|---|---|
| Commands + gate order | `AGENTS.md` (top table) |
| DATABASE_URL contract | §3 here; `prisma/schema.prisma` header; `tests/db-path.test.ts` |
| The 6 Tailwind traps | §4 here; `docs/Tailwind-V4-Validation-Report.md` |
| Session-2 parity audit + non-gaps | `docs/remediation-plan.md` |
| View↔path map | `src/lib/router.ts` (unit-tested) |
| Accent tokens (7 accents) | `src/lib/theme.ts` `ACCENT_TOKENS` |
| CRUD factory + delegates | `src/lib/server/{http,entities}.ts` |
| Avatar default-state contract | `src/components/layout/user-avatar.tsx` |
| e2e parity pins | `tests/e2e/navigation.spec.ts` ("view chrome" describe) |
| Hydration gate pattern | `tests/e2e/calculator.spec.ts` (`hydrated`) |
| Push procedure | `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` + `docs/ssh_git_wrapper_v3.py` |
| Screenshots (all 20 views) | `docs/screenshots/` |
| Demo account | `demo@studyflow.app` / `Demo1234!` |


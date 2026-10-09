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
> (407 tests green at last update: 158 Vitest unit + 249 Playwright e2e incl. 1 setup).
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
(metadata origin, optional — resolved by `src/lib/site.ts`, consumed by
`sitemap.ts`/`robots.ts`/`layout.tsx`'s `metadataBase`; default
`http://localhost:3000`; unit-pinned by `tests/site.test.ts`).

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

**⚠️ The ten documented Tailwind v3→v4 traps (all live here):**
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
9. **The BLUR scale shifted one notch** (session 4): v4 inserted
   `blur-xs` (4px) at the bottom of the scale — v3's `backdrop-blur-sm`
   (4px) is v4's `backdrop-blur-xs`, and v4's `backdrop-blur-sm` computes
   8px. Same family as the radius trap. The drawer backdrop and the login
   card use `backdrop-blur-xs` (e2e-pinned at `blur(4px)`).
10. **Colors serialize as their LEGACY forms** (session 5): modern
   `rgb(0 0 0 / 0.1)` box-shadow syntax reads back as `rgba(0, 0, 0, 0.1)`,
   and any UNPINNED palette class reads back as `lab(...)` —
   `text-cyan-400` computed `lab(76.6 -40.9 -29.6)` before cyan-400 got
   pinned to `#22d3ee`. Pin every asserted color; write e2e expectations in
   the serialized form.

**Typography:** system sans stack (ui-sans-serif → Apple Color Emoji …);
page greeting `text-3xl font-bold`; view titles `h1 text-2xl font-bold
text-slate-800` with a 24px accent icon (16 views; MyDay/FocusTimer are
`text-3xl` 30px; Tasks/Calendar have no icon) + 16px subtitle with the
reference's exact per-view wording (S4-D); section titles `h2 text-lg
font-semibold` + `h-5 w-5` accent icon; stat values `h3 text-3xl font-bold`
(30px/36px, tracking normal — NOT leading-none/tracking-tight); empty-state
titles `h3 text-xl` (20px); nav labels 16px with `w-5` icons; body `text-sm`.

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
`.sf-skeleton` + 2 keyframes (`sf-shimmer`, `sf-slide-in`), `.sf-gradient` +
`.sf-gradient-shadow` / `-lg` (the session-5 gradient CTA surfaces — sRGB-exact
stops through `--sf-primary` → `--sf-primary-gradient-to`, hover via
`--sf-primary-gradient-to-strong`), `.sf-calc-display` (the calculator's
softest-token gradient).

**Interactive chrome (session-5, measured):** primary CTAs are GRADIENT
buttons (`Button variant="gradient"`), never solid violet — the reference's
Add Task / New Event / Create … buttons all render
`linear-gradient(to right, rgb(139,92,246), rgb(79,70,229))` + the v3
`shadow`; empty-state CTAs add the accent-tinted shadow-lg (0.25). The
reference's own gradient-button text renders YELLOW (a pixel-verified
Base44 platform bug — 180 yellow vs 21 white glyph pixels) — the clone keeps
white. Form controls run the GRAY ramp (gray-200 borders, gray-950 text,
gray-400 placeholders, h-9 transparent inputs); dialogs are
`max-w-md` + `rounded-lg`. The Events view is a DARK slate-900 terminal
panel (intentionally, in both themes) with a `CW <n>` calendar-week label
(`isoWeekNumber`) and a cyan-400 New Event link.

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
| AP-17 | MEDIUM | Drawer backdrop blurs 8px (reference: 4px) | v4 blur-scale shift — `backdrop-blur-sm` is 8px in v4 (trap 9) | `backdrop-blur-xs`; e2e `blur(4px)` pin (session-4 S4-A) |
| AP-18 | MEDIUM | Brand/CTA/avatar gradients end violet-600 | routed through `primary`/`strong`; the reference ends at the ADJACENT hue | `--sf-primary-gradient-to` + `-avatar-*` tokens (session-4 S4-G) |
| AP-19 | HIGH | Every empty view renders the wrong empty-state design | ad-hoc slate circle + gray text vs the reference's gradient-block pattern | shared `EmptyState`/`SimpleEmptyState` on 80px gradient block + 40px icon + h3 20px (session-4 S4-C) |
| AP-20 | MEDIUM | View headers drift (h2 in 8 views, tracking-tight slate-900, no icons, wrong subtitles) | hand-rolled headers in 11 views + a stale ViewHeader | ONE source: `ViewHeader` h1+icon+reference subtitle, all 20 views (session-4 S4-D) |
| AP-21 | LOW | e2e order-dependent flake: later specs see TEAL | theme spec's Violet-restore PATCH aborted by page teardown at test end | restore awaits the settings PATCH + asserts the violet triplet (session-4) |
| AP-22 | HIGH | Primary CTAs render SOLID violet | the reference's CTAs are violet→indigo GRADIENTS + v3 shadow (measured); solid bg-sf-primary was a clone-side assumption | Button `gradient` variant — `.sf-gradient` + `.sf-gradient-shadow` (session-5 S5-A) |
| AP-23 | HIGH | Events view rebuilt as a light list misses the reference entirely | the reference's Events body is a DARK slate-900 terminal panel (58% dark pixels — never audited before session-5) | `bg-slate-900 rounded-2xl shadow-2xl` panel in BOTH themes + CW label + cyan New Event (session-5 S5-B) |
| AP-24 | MEDIUM | Form controls drift zinc vs the reference's GRAY shadcn theme | the reference's base palette is gray-200 borders / gray-950 text / gray-400 muted (zinc was a clone-side default) | GRAY base palette in `@theme` (session-5 S5-D) |
| AP-25 | MEDIUM | Dialogs render rounded-2xl max-w-lg h-10 inputs | the reference's dialogs are shadcn-v3 stock: rounded-lg (8px), max-w-md (448px), h-9 transparent inputs | `dialog.tsx`/`input.tsx` reworked (session-5 S5-C) |
| AP-26 | LOW | Unpinned palette classes read back as `lab()` in computed styles | v4's oklch defaults — `text-cyan-400` computed `lab(76.6 -40.9 -29.6)` | pin every asserted color (cyan-300/400, red-600 now pinned) (session-5, trap 10) |
| AP-27 | LOW | `getByRole({ name })` strict-mode collisions in e2e | Playwright role names are substring + case-insensitive — "New note" matches "New notebook" | use `exact: true` when names collide (session-5) |
| AP-28 | HIGH | Flashcards rendered as two sf-cards with plain rows + an inline flip card | the reference's view is a two-panel layout: `w-80 border-r` deck sidebar with 40px colored icon blocks + swatch picker + `lg:grid-cols-3` card grid + 3D-flip study mode (measured with a live reference deck) | full S7-A rework + `FlashcardDeck.color` + `Flashcard.difficulty` + `/api/ai/generate-cards` (session-7) |
| AP-29 | MEDIUM | Study-group swatches green-500/orange-500; practice-test dialog a different field set | measured: the swatch picker is emerald-500/amber-500 red-before-pink; the test dialog is Test Title + Time Limit (60) + AI Generate Questions + a scrollable question list | palette fix + `PracticeTest.questions` JSON + `/api/ai/generate-questions` (session-7 S7-B) |
| AP-30 | HIGH | Timetable week grid compact "Sun 4" heads + 64px hour rows + NO mobile accordion; **columns rendered two days ahead of their headers** (`(col+1)%7` bug) | measured: grid-cols-8 with full day names + `text-lg` dates + 60px "7 AM" hour rows + accordion + My Classes today date | full S7-C rework + the `(col+6)%7` mapping fix (session-7) |
| AP-31 | MEDIUM | Analytics stat cards r16 bordered with different labels; 14-day charts | measured: r12 border-0 cards + 48px tinted icon blocks (violet/blue/green/orange-100) + "X/Y" fraction values + "Last 7 Days" chart cards | S7-D rework; green-100 `#dcfce7` pinned (NOT emerald-100) (session-7) |
| AP-32 | HIGH | Sidebar chrome drift: 6 wrong nav icons (Tasks/Calendar/Events/Notes/Files/Math Solver), active-nav gradient stop-2 violet-600 instead of **indigo-500**, tagline `truncate`d, 28px collapse button | measured live: `lucide-square-check-big`/`calendar`/`calendar-days`/`book-open`/`folder-open`/`calculator`; gradient `rgba(139,92,246,0.1)→rgba(99,102,241,0.1)`; `text-overflow: clip`; `h-9 w-9` buttons | S8-A: icon swaps + stop-2 via `--sf-primary-avatar-to` (pinned `NAV_ACTIVE_GRADIENT_STOPS`), tagline un-truncated, h-9 w-9 rounded-lg (session-8) |
| AP-33 | HIGH | Dashboard cards rendered inset bordered row-cards inside padded bodies | measured: `rounded-2xl border-slate-100 shadow-sm overflow-hidden` cards with header `p-6 border-b` + **flush** `divide-y divide-slate-50` bodies — rows run edge-to-edge as `p-4 hover:bg-slate-50` | S8-B: `SectionCard` `flush` prop + dashboard exam/assignment/task rows rebuilt (session-8) |
| AP-34 | HIGH | Calendar semantics inverted (today = solid accent fill, NO selected state, 3 nav buttons, header-split card); MyDay amber card misplaced; Timetable today tint rode the BODY column via the **dead** `bg-sf-primary-softest/50` utility | measured by clicking day 15: SELECTED = solid accent fill + white text, TODAY (unselected) = violet-100 tint + strong text — both hover-stripped; simple `p-6 border-slate-200` month card with 2 ghost navs; today tint rides the column HEADER (`bg-violet-50`) | S8-C/D/E: calendar rework + MyDay header block + suggestions + header-cell tint (inline style; the only sf-primary color utilities are `{-foreground,-soft,-soft-dark,-strong,-strong-dark}`) (session-8) |
| AP-35 | HIGH | Tasks/Notes/Study Groups rendered as single padded cards (page-header + card lists) | measured: full-height two-pane layouts — `w-80 border-r border-slate-100 pr-6` left pane (h1 + icon INSIDE, 36px gradient New button, icon search) + a BARE right pane (centered empty state / editor) | S8-F/G/H: tasks two-pane + single-row main header; Notes dropdown New + Radix combobox filters; Study Groups two-pane (session-8) |
| AP-36 | MEDIUM | Analytics chart cards had no per-card icons, no Assignment Status donut, no Subject Workload, no priority chips; Math Solver rendered input + solution side-by-side | measured: trending-up/clock/book-open/target icon headers, an SVG donut (Not-Started `#94a3b8`), an `h-[250px]` workload body, flame + slate-50 chip card; Math Solver is a single max-w-4xl column (input card + solution BELOW) | S8-I/L: ChartCard `icon` prop + donut + workload + priority chips; mathsolver single-column rework with camera/refresh-cw/sparkles footer buttons (session-8) |
| AP-37 | LOW | Icon-level drifts: Calculator Clear, AI quick actions, FocusTimer complete (skip-forward), assignment/exam search inputs (no icon), exam card location row + topics counter, Settings tab list chrome | measured: rotate-ccw, the reference quick-action set, check, inline `search` icons + pl-9 inputs, date+time·duration rows ONLY, bg-white wrapped tab list | S8-K/M/N/O/P + the dead-utility sweep (S8-J) (session-8) |
| AP-38 | HIGH | Dashboard had NO overdue alert banner and used 80px-gradient empty states inside the flush cards | measured live: conditional `from-red-50 to-orange-50 border-red-200` banner between greeting and stats (icon block + "You have N overdue item(s)" + ghost View All) + slim `p-8 text-center` inline empties with `w-12 h-12` slate-300 icons | S9-A/R: banner + `DashSectionEmpty` + the seeded overdue task (session-9) |
| AP-39 | HIGH | Calendar grid was Monday-first with a fixed 42-cell (6-row) grid; mode switch was 24px text-only tabs with `capitalize` | measured: SUNDAY-first header (Sun…Sat; October 2026 starts at Sep 27 = 35 cells) + dynamic week count; white `border-slate-200 p-1` switch container with `h-8` grid3x3/list icon tabs, capitalized raw text | S9-E/F: `monthGrid()` `first.getDay()` + `ceil((lead+days)/7)` + `CALENDAR_WEEKDAYS`; mode-switch rework (session-9) |
| AP-40 | HIGH | Analytics 7-day charts were HTML bar charts with 10px labels, no axes, no gridlines | measured: SVG AREA charts — X-axis day labels (12px `#666`), Y-axis ticks, `stroke-dasharray="3 3"` gridlines; Task Activity single area filled `#e2e8f0`; Focus Time `#8b5cf6` line over `url(#focusGradient)` | S9-K: `AreaChart` SVG component rebuild (session-9) |
| AP-41 | MEDIUM | MyDay empty state was a violet sf-card; quick-add carried an extra gradient submit button; Tasks filter was a combobox + "No lists yet" placeholder; assignments defaulted to "All" with subject/description rows; exams showed "1 day" amber for the 1-day bucket | measured: bare amber greeting empty (`w-20` sun block + time-aware "Good morning!" + amber→orange CTA); input + More Options ONLY (Enter submits); outline filter BUTTON with funnel icon; EMPTY My Lists body; "Active" default + slim rows (no subject span/description); "Tomorrow" in `bg-orange-100 text-orange-600` | S9-B/C/D/I/J/Q (session-9) |
| AP-42 | LOW | Icon-level drifts: Files text-only breadcrumb + `layout-grid` toggle, Grid Builder grid3x3 icon, FocusTimer stats (brain/flame/timer) + moon long-break, Settings text-only tabs, Notes chevron-only comboboxes, no per-deck menu, `sparkles` composer, groups hint wording | measured: `house` breadcrumb root + `grid3x3` toggle, text-only Grid Builder, flame/target/zap stats + `coffee` preset, palette/user/book-open/calendar/bell tab icons, folder/tag leading combobox icons, hover-revealed `h-8 w-8` ellipsis deck menu, `wand-sparkles`, "or create a new one" | S9-G/H/L/M/N/O/P/S (session-9) |
| AP-43 | CRITICAL | The shadcn base tokens were LITERAL values inside `@theme inline` — `bg-card`/`bg-popover`/`bg-muted`/`border-input` utilities compiled with the light value inlined, so `.dark { --color-* }` overrides never reached them: white dialogs with near-white titles (unreadable), invisible outline buttons (white-on-white, contrast 1.04), light dropdowns/tabs/badges — for nine sessions, masked because `.sf-card`-style custom CSS (direct `var()` references) re-themed correctly around the light-mode orphan islands | measured dark-mode sweep (`scripts/dark-sweep.mjs`, flashbulb + contrast detector): 10 views affected. Fix: shadcn's own v4 shape — raw triplets in `:root`/`.dark` (`--card`, `--popover`, `--muted`…) consumed as `hsl(var(--x))` inside `@theme inline`; shadows route through `--sf-shadow-sm`. Compiled proof: `.bg-card{background-color:hsl(var(--card))}`. Light values byte-identical (193 prior pins stayed green untouched) | S10-1: the globals.css token indirection (session-10) |
| AP-44 | HIGH | Inline-style gradients/tints authored for light-mode parity never re-theme: the overdue banner (red-50→orange-50), MyDay amber card, timetable today-header + mobile chips + calendar today cell (softest/empty-from tints), sidebar clock chip (softest→adjacent + deep/strong text), Settings selected theme cards; analytics SVG charts hardcode light fills (#e2e8f0 area, #f1f5f9 gridlines, #666 axis labels) | measured dark flashbulbs/contrast 1.0–1.6 on those surfaces. Fix idiom: globals.css classes with `.dark` washes (`.sf-overdue-banner` red-800/orange-900, `.sf-amber-card` amber-800/orange-900, `.sf-today-tint`/`-cell` + `.sf-clock-chip` + `.sf-selected-tint` soft-dark at 0.3–0.35 alpha, text `--sf-primary-strong-dark` violet-300) + `dark:fill-slate-800`/`dark:fill-slate-400`/`dark:stroke-slate-800` SVG utilities (CSS presentation properties override SVG attributes) | S10-2…S10-7 (session-10) |
| AP-45 | MEDIUM | Assuming the reference is the dark-mode measuring stick | measured: the reference's Dark/System options are a Base44 platform NO-OP — `html.dark` + dark `body` only; its canvas gradient, glass sidebar, and white cards stay light (VLM read its "dark" dashboard as "properly themed light mode"). The clone's full dark mode is the documented superset; dark parity standard = internal consistency (the dark sweep + the 10-spec pin family) | governing discovery (session-10) |
| AP-46 | LOW | Theme-mode mutation in specs risks poisoning the shared user record for later spec files | fix pattern: PATCH `/api/settings/preferences` `{ themeMode }` via `page.request` (the storageState cookie rides the request context — no UI navigation), `waitForFunction(html.classList.contains("dark"))` to gate hydration, and an `afterEach` that PATCHes light back and awaits the response — a failed pin can never leak dark mode into the next spec file (the S4 accent-restore lesson, per-hook) | `tests/e2e/dark-mode.spec.ts` (session-10) |
| AP-47 | CRITICAL | Theme application that waits for the auth round-trip: dark users flash light on every hard load (or see a fully light page when `/api/auth/me` stalls), the login route never themes (its `dark:*` variants are dead code there — dark-OS fresh visitors get light), and System mode goes stale on runtime OS switches (no `matchMedia` change listener) | measured with a network-route abort of `/api/auth/me` + `agent-browser set media dark/light` + a fresh-context login probe. Fix: the next-themes shape — `applyToDocument` caches `{ mode, accent }` to `localStorage["sf-theme"]` (format unit-pinned), a self-contained inline boot script in `<head>` resolves the cached mode (absent → system fallback) BEFORE first paint, `installSystemThemeTracking()` re-applies on OS change when mode==system, sign-out clears the cache, and a plain non-media `meta[name=theme-color]` (appended after Next's media variants — last match wins) tracks the effective mode | `THEME_BOOT_SCRIPT` + `themeCachePayload`/`parseThemeCache` (session-11) |
| AP-48 | HIGH | Accent-driven TEXT in dark mode left on the light-mode 600/500-level tones: the active nav item (inline `rgb(var(--sf-primary-strong))` + icon), ViewAllLink (`text-sf-primary-strong` no dark pair), the timetable mobile today chip (`bg-sf-primary-soft` — a mobile-only surface the desktop sweep never rendered), the selected avatar swatch (inline soft tint) — all pass the 2.2 contrast bar under the DEFAULT violet (violet-600 is the palette's darkest 600, 3.13:1) which is exactly why the session-10 sweep called them clean | the 7-accent sweep (`scripts/accent-dark-sweep.mjs`, desktop + mobile passes, WARN bar at 3.2 for accent text) + direct DOM probes. Fix: the repo convention — 300-level `--sf-primary-strong-dark` for dark accent text (`.sf-nav-active{,-icon}` classes, `dark:text-sf-primary-strong-dark`, `dark:bg-sf-primary-soft-dark` chips, `.sf-swatch-selected` wash); light values byte-identical | S11-2..S11-5 (session-11) |
| AP-49 | MEDIUM | Sweeping at ONE viewport / ONE accent / one threshold: the S10 dark sweep was desktop-only + violet-only + a 2.2 bar — it structurally could not find mobile-only surfaces (the timetable accordion's today chip), accent-dependent failures, or the 2.2–3.2 accent-text band | extend the audit matrix: every accent × desktop AND mobile viewports (mobile-only surfaces render below `md:hidden`), plus a WARN tier for accent text; ALSO beware sweep false-negatives from size cutoffs (flashbulb detectors with a ≥40×20 filter miss small pills) and design-intended dimming (adjacent-month days at 2.36 in dark mirror the light 2.2 — verify the LIGHT equivalent before "fixing") | `scripts/accent-dark-sweep.mjs` (session-11) |
| AP-50 | CRITICAL | State encoded ONLY by fills/tints is lost in forced-colors (Windows HC) AND print — both engines strip author colors: the calendar selected day, today markers, the mode-switch active segment, the active tab, the active nav item, and the slider progress all became indistinguishable (text stayed readable everywhere — 0 invisible-text findings — which is exactly why nothing LOOKED broken) | measured with Chromium `forcedColors: active` emulation over all 20 views + a reference baseline pass (`scripts/forced-colors-sweep.mjs` — the reference degrades IDENTICALLY, so these are superset fixes). Fix idiom: system-color outlines (`2px solid Highlight`, inset -2px) scoped to stable containers, `font-weight: 700` for the active nav (+ its `span` — inherited weights lose to inner utilities), `forced-color-adjust: none` ONLY for essential non-text graphics (WCAG 1.4.11 — the slider fill) | the `@media (forced-colors: active)` block (session-12) |
| AP-51 | CRITICAL | The print media never un-themes: dark mode printed 2–8 light-text elements per view (all 20 views) on the print-forced white canvas — `dark:text-slate-100` utilities keep rendering LIGHT text while the S11 print block whitens the body; and browsers' default background-dropping turns every white-text-on-color surface (gradient CTAs, the events terminal panel, timetable class cards, the GradeTracker summary card, the calendar selected cell, checked checkboxes) invisible in BOTH modes; the `min-w-[900px]` timetable canvas clipped Saturday on A4 | measured: print-media text-color pass in both modes + real `page.pdf()` A4 renders (`scripts/print-audit.mjs`); VLM-confirmed on the rendered pages. Fix: `beforeprint`/`afterprint` handlers in the theme boot script remove/restore the `dark` class around the print duration (one mechanism, both routes, all dark: variants at once); `sf-print-exact` (`print-color-adjust: exact`, inherited) on white-text-on-color containers; `.sf-timetable-canvas { min-width: 0 }` in print | S12-C1..C3: the boot-script print handlers + the print-exact family (session-12) |
| AP-52 | HIGH | Keyboard users face 21 sidebar Tab stops before any content with no bypass (WCAG 2.4.1), and TESTING print with `page.pdf()` alone misleads: `page.pdf()` applies the print stylesheet faithfully only when `page.emulateMedia({ media: "print" })` is already active (without it the layout can keep screen-width geometry and clip wide content — the timetable cut Saturday in the naive call); `page.emulateMedia` alone does NOT fire `beforeprint` (dispatch the event manually to exercise the handlers; `page.pdf()` DOES fire both) | measured: Tab-stop recording over the two-pane views (`scripts/focus-order-audit.mjs` — dialogs and the mobile drawer trap focus correctly, order healthy); the pdf/emulation split measured empirically. Fix: the `.sf-skip-link` (off-screen not display:none, first focusable, → `main#main-content` tabIndex -1) + the print-pipeline testing conventions | S12-B + the print-testing lessons (session-12) |
| AP-53 | CRITICAL | Optimistic UI without rollback: the AI chat rendered the user's message from LOCAL state before the POST settled — on failure it stayed rendered (never persisted), silently vanished on reload, and left no retry affordance; meanwhile NO layer carried a deadline, so a hung SDK call kept the composer disabled and "Thinking…" on screen indefinitely (>25 s measured, nothing to recover to) | measured with route interception (`scripts/ai-error-audit.mjs` — abort, hang, 500 probes). Fix idiom: capture the optimistic id BEFORE the try; on failure `removeChatMessage(localId)` + `setInput(content)` (the bounced-back text IS the retry affordance); pass `{ timeoutMs: 120_000 }` to `apiSend` at EVERY AI call site (generous — LLM completions legitimately run 30–60 s) and classify with `isTimeoutError(err)` for a "took too long" toast | S13-A1/A2: the send rollback + the api timeout opt (session-13) |
| AP-54 | HIGH | Percent-encoding a filename INSIDE the quoted `filename="…"` half of Content-Disposition is not RFC 5987 — browsers save the percent-encoded STRING as the literal filename ("файл.txt" → "%D1%84%D0%B0%D0%B9%D0%BB.txt"); and trusting `File.name` without an emptiness guard bites TWICE: `next dev` (Node undici) stores `name: ""` as an unlabeled row, while the Bun standalone's multipart parser surfaces the empty name as `undefined` — a 500 crash on `file.name.slice` | measured: `scripts/upload-edge-audit.mjs` (empty-name 201-dev/500-standalone; the disposition header read back from a real download). Fix idiom: a pure `buildContentDisposition(name)` seam emitting BOTH dialects (ASCII-safe fallback + `filename*=UTF-8''<pct-encoded>`); reject `!file.name.trim()` with 400 BEFORE the size check; test upload guards at BOTH runtimes | S13-C2/C3: the files route guard + the disposition seam (session-13) |
| AP-55 | MEDIUM | Audit tooling can poison ITS OWN later probes: a `page.route` handler that never fulfills keeps the app's `busy` state latched after `unroute` (the request never settles), so the next send() silently early-returns — the ai-error audit's first run reported "no toast for a 500" that was purely this artifact; likewise a page-wide `getByText("…")` "message removed" assertion matches the composer holding the bounced-back VALUE | both hit and fixed during the S13 audit run (reload-between-probes; `getByRole("listitem").filter({ hasText })` scoping). Generalized: isolate client state between failure-mode probes (reload), and scope DOM absence assertions to the semantic container | the audit-tooling lessons (session-13) |
| AP-56 | HIGH | Unrouting a HELD route RELEASES the pending request to the real server: the S14 a11y audit held `/api/ai/chat`, probed, then unrouted — the in-flight POST completed against the REAL route and persisted probe rows + a genuine AI reply into the chat history (found via the evidence-capture VLM pass showing probe noise in the transcript) | reload the page BEFORE unrouting (document unload aborts the fetch), then unroute; verify with a history query after any held-route probe run | the network-side twin of AP-55 (session-14) |
| AP-57 | MEDIUM | Per-request failure handling ≠ ambient-state awareness: every path recovered offline (S13 rollback, dialogs keep forms, SPA nav on cached data) yet the user had NO signal they were offline — they discovered it one raw "Failed to fetch" toast at a time; likewise the AI routes (the only per-request COST surface) had no budget while login did, and AI output landed in static containers (SR users heard nothing after sending) | measure the AMBIENT dimension separately: offline banner via `useSyncExternalStore(navigator.onLine)` rendering null online (structural byte-parity), transport-TypeError mapping at the one `doFetch` seam (timeout classification first), per-USER budgets keyed `ai:${userId}` on expensive routes, `aria-live="polite"` + `aria-busy={busy}` on async-output containers | S14-A0/C1/D1..D3 (session-14) |
| AP-58 | LOW | Stale pre-clone tooling ships alongside the real tooling: 14 scripts from the original repo crashed (`check-db-state.mjs` referenced `goal`/`activityLog` models that don't exist), imported from foreign machine paths (`/home/z/my-project/project-management/...`), or probed the original app's routes (`demo@orbital.app`, `/goals`) — each one a trap for the next agent that greps for a working example | `git rm` the broken/foreign ones; keep what the CURRENT docs reference; verify no README/AGENTS/CLAUDE/PAD/SKILL reference breaks before deleting | the S14-E hygiene sweep (session-14) |
| AP-59 | HIGH | A `[]`-deps `window.addEventListener("keydown")` effect calls component functions (`press`/`submit`) captured at MOUNT — the listener evaluates the mount-time state forever (the S15 keyboard audit typed `12+3`, pressed Enter, and got `0`: the stale `submit` closed over `display="0"`); the same effect ALSO needs form-control guards or every keystroke in the GPA rows/converter hijacks the calculator | the latest-ref indirection: `const latest = useRef({press, submit}); useEffect(() => { latest.current = {press, submit}; })` — the bound handler always calls the CURRENT functions; guard `target.tagName === INPUT/TEXTAREA/SELECT/isContentEditable` + open dialogs before `preventDefault` | S15-C0 (session-15) |
| AP-60 | MEDIUM | TWO probe artifacts produced phantom findings this session: (a) Next.js's `__next-route-announcer__` carries `role="alert"`, so unscoped `getByRole("alert")` strict-mode-collides and generic `[role=alert]` probes read the EMPTY announcer instead of the app's alert; (b) a bare `waitForSelector("h2")` after a form submit resolves on the CURRENT screen's own h2 — the probe then reads state that predates the round-trip (the S15 capture read the signup screen's h2 and found "no code note" while the register was still in flight) | scope alert locators to a container (`div.shadow-2xl`).getByRole("alert"); wait for screen transitions BY HEADING TEXT (`h2:has-text('Verify your email')`), never by tag alone; assert probe preconditions in waitForFunction before screenshotting | S15 execution lessons (session-15) |
| AP-61 | MEDIUM | A suspected one-character syntax bug (`const [historyOpen…` read as `const istoryOpen…` in TWO sessions, with elaborate "TypeScript silently repairs the parser" theories) was a PHANTOM: some tool outputs swallow the `[` following `const `, and codepoint-level inspection (`python repr`/`od -c`) + the git diff showed the file was always correct — tsc passing was the truth all along | before "fixing" an impossible-looking syntax error that lint AND tsc AND the compiler all accept, dump the exact codepoints (`[hex(ord(c) for c in line]`) and `git diff` — trust the gates over the rendered output; log the artifact so the next session doesn't re-derive the phantom | the E1 non-finding (session-15) |
| AP-62 | HIGH | An SPA shell that flips from its loading screen on AUTH alone renders with an empty data store — the first data arrival then re-layouts conditional sections (banners, growing lists) under the viewport: one layout-shift worth CLS 0.117–0.125 (CWV needs-improvement) on EVERY first paint. The fix is NOT skeletons (data-dependent heights cannot be exact) but PRE-WARMING: fire the active view's initial collections in parallel with the auth call and flip the shell only when both settle — replacements are not moves, so the shift source disappears entirely (measured CLS 0.00 post-fix; mobile LCP moved +120 ms, still GOOD, because the data fetch shares the auth round-trip window) | centralize `INITIAL_COLLECTIONS` per view (unit-pin completeness — a new view without an entry is a silent CLS regression); read the active view from the store AFTER hydrate (no stale closure); a failed pre-warm must never block the shell (`.catch(() => {})` — the views' own effects retry) | S16-A (session-16) |
| AP-63 | MEDIUM | Two measurement traps landed in one session: (a) adjacent-sibling margins COLLAPSE — the verify rhythm shipped as circle `mb-3` + h2 `mt-2` and measured 68px instead of 76px (max, not sum; padding on the h2 was ALSO wrong — it moves the text, not the box top the gauge reads); (b) a responsive reference (`h-11 sm:h-12`, `text-xl sm:text-2xl`) and a fixed-value clone measure IDENTICAL at desktop — the S16 mobile gaps (44 vs 48px button, 20 vs 24px h2, 76 vs 88px rhythm) were invisible to every existing desktop pin | put a decomposed spacing rhythm on ONE element (`mb-5 sm:mb-8`), never split across siblings; audit every new surface at BOTH viewports (390×844 AND 1280×800); fix with `sm:`-prefixed responsive classes — every ≥sm value stays byte-identical and all desktop pins keep passing by construction | S16-B/C/D (session-16) |
| AP-64 | HIGH | The reference's account state is DATA, not chrome — until its 2026-09-28 re-provision its zero-data surfaces were UNMEASURABLE (S6/S9 measured populated/partial states), so the clone shipped invented empty-state chrome the reference never renders: a "No data yet" Analytics block, a "No grades yet" GradeTracker block, seven drifted hint strings, pre-seeded register subjects. When the reference's data state changes, its empty-state chrome becomes measurable — re-sweep | treat the reference's CURRENT account state as an audit surface: sweep fresh registrations on BOTH apps side by side (delete leftover probe rows through the reference's own UI first); empty-state copy is verbatim parity, never invented; the reference's stat cards render at zero data — unconditional rendering beats conditional EmptyState branches | S17 audit (session-17) |
| AP-65 | MEDIUM | Two live lessons: (a) the reference's Settings tab CONTENT (vs its pinned tab-list chrome) was never audited — its Profile tab persists school/grade/study-goal/notifications on the User entity (captured from its own network PUT, the honest way to learn a hosted app's data model); (b) after `prisma db push` + `db:generate`, a LONG-RUNNING dev server keeps the OLD generated client — Turbopack hot-reloads app code but not node_modules, so `/api/auth/me` 500s on the new select fields and every login bounces (the login itself succeeds; the me-route crash breaks the gate) | audit the tab BODIES, not just the chrome (per-tab headers, field sets, save flows); capture the reference's network writes to learn its entity shapes; RESTART the dev server after any Prisma schema change before diagnosing "broken login" | S17 audit + the stale-client incident (session-17) |

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
Current green state: lint ✓ · tsc ✓ · 106 unit ✓ · build ✓ · 194 e2e ✓.

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
  strongDark, deep, softest, softestAdjacent, gradientTo, avatarFrom,
  avatarTo, emptyFrom, emptyTo: string }  // RGB triplets (14 CSS vars;
  gradientTo = adjacent-hue 600 for brand chips + CTA — indigo-600 for
  violet; avatarFrom/to = the lighter 400→adjacent-500 pair; emptyFrom/to
  = the 100-level pair for the empty-state block — all measured, S4-G)
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
| The 9 Tailwind traps | §4 here; `docs/Tailwind-V4-Validation-Report.md`; session-3/4 plans |
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


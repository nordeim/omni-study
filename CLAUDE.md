---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
---

# StudyFlow (Omni-Study)

## Core Identity & Purpose

StudyFlow is a self-hosted study-companion web app — a production-grade clone (functional superset, visual parity) of `omni-study1.base44.app`. Twenty views (dashboard, tasks, calendar, timetable, assignments, exams, notes, flashcards, practice tests, study groups, grade tracker, analytics, files, calculator suite, math solver, AI assistant, focus timer, settings) over a Prisma/SQLite backend with email/password auth and server-side AI features. Maintained by the repo owner (`nordeim`); primary consumers are the owner and any future coding agents working in this repo.

Key decisions that shape everything else: **Next.js 16 App Router as a one-page SPA** (twenty rewritten paths, client-side view switching — matching the reference app's routing behavior); **SQLite at the repo root** (zero-config, one file, a documented three-anchor resolution contract); **Tailwind v4 with v3-pinned tokens** (visual parity requires pinning palette + shadow geometry against v4's engine changes).

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

1. **ANALYZE** — Read the affected files completely before changing them; reproduce any reported failure before theorizing about it. Prefer executable truth (configs, lockfiles, computed styles) over prose.
2. **PLAN** — Lay out the change as sequential, individually verifiable steps. For UI-parity work, list the measured tokens you are matching.
3. **VALIDATE** — Confirm the plan against the acceptance criteria (and the reference app when parity is involved) before writing code.
4. **IMPLEMENT** — Smallest safe diff; respect the conventions below; update the touched tests in the same change.
5. **VERIFY** — Run the full gate: `bun run lint && bun run typecheck && bun run test && bun run build && bun run test:e2e`. Browser-verify interactive changes (agent-browser or Playwright) — a green build is not evidence a page works.
6. **DELIVER** — Conventional-commit the atomic change; update docs when behavior or setup steps change; hand off honestly (what was verified, what wasn't, what remains).

### Project-Specific Principles

- **Parity is measured, not guessed.** Computed styles from the live reference are the ground truth; screenshots are secondary. Every parity fix lands with a pinning test where feasible.
- **One database file, three anchors.** The `DATABASE_URL` contract (see Project_Architecture_Document.md ADR-002) is the most fragile invariant in the repo — treat changes to it as high-risk.
- **The local gate is the only gate.** No CI exists; nothing ships that hasn't passed lint/typecheck/test/build/e2e locally.

## Implementation Standards

### General Coding Practices

- Early returns over nesting; composition over inheritance; self-documenting names.
- TypeScript strict; `unknown` instead of `any`; no unused imports (lint gates it).
- Pure logic lives in `src/lib/*` seams with unit tests; views orchestrate, they don't compute.

### Language & Framework Guidelines

**Next.js 16 / React 19**
- App Router; `src/app/page.tsx` is the ONLY app route (plus `/login`). The 20 view paths are rewrites — never create per-view route folders.
- Route handlers: thin shells over the CRUD factory (`src/lib/server/`); always `userId`-scope Prisma queries; always validate through `src/lib/validation.ts` schemas.
- `"use client"` at the top of every component file; server-only imports (`z-ai-web-dev-sdk`, `node:crypto`) never appear in client modules.

**Tailwind CSS v4 (CSS-first)**
- No `tailwind.config.js`. All tokens live in `src/app/globals.css` under `@theme inline`.
- Layout with `flex gap-*` exclusively — margin utilities inside `space-y/x-*` containers are forbidden (v4 trap 4).
- Accent colors via `rgb(var(--sf-*))` inline styles or the generated `*-sf-primary-*` utilities; the v3-pinned palette and `--shadow-sm` pin must not be removed (traps 2 & 5, pinned by e2e specs).
- The radius scale is v3-identical from `md` up — do NOT re-pin it upward (trap 6); only `--radius-sm: 0.125rem` is pinned for v3 semantics. Opacity utilities serialize as oklab/lab in computed styles (trap 7) — e2e pins accept both serializations. `pt-*` after `p-*` REPLACES the shorthand's side (trap 8) — assert observable positions, not padding internals. The BLUR scale shifted one notch (trap 9): v3's `backdrop-blur-sm` (4px) is v4's `backdrop-blur-xs` — use `backdrop-blur-xs` where the reference measures 4px (drawer backdrop, login card). Colors serialize as their LEGACY forms (trap 10): modern `rgb(0 0 0 / 0.1)` syntax reads back as `rgba(...)`, and unpinned palette classes read back as `lab(...)` — pin every asserted color and write expectations in the serialized form.
- Primary CTAs use the Button `gradient` variant (`.sf-gradient` + `.sf-gradient-shadow` in globals.css) — sRGB-exact stops through the accent tokens; empty-state CTAs add `.sf-gradient-shadow-lg`. Never render solid-violet primary buttons.

**State (Zustand)**
- `useAppStore` (view/sidebar/drawer), `useThemeStore` (mode/accent/avatar), `useDataStore` + `mutations` (entity cache; every mutation refreshes the touched collections). No React Context for app state, no new state libraries. Theme vars go to `<html>` through `accentCssVars` — the COMPLETE 15-var token set (dropping tokens silently leaves stale violet values under other accents; the S4-G gradient/avatar/empty tokens and the S5 gradient hover stop are part of the set).

**Prisma / SQLite**
- Schema edits: update `prisma/schema.prisma`, then `bun run db:push`. Seeds stay idempotent (`bun run db:seed` is safe to re-run).
- The `db:*` scripts must keep setting `DATABASE_URL` inline (shell-provided env anchors correctly; `.env`-loaded env does not).

## Development Workflow

### Environment Setup

```bash
bun install
bun run db:push && bun run db:seed   # creates <repo>/db/custom.db with demo data
cp .env.example .env                  # defaults already correct for local dev
bun run dev                           # http://localhost:3000 (demo@studyflow.app / Demo1234!)
```

### Build Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Dev server :3000, logs to `dev.log` |
| `bun run build` | Standalone production build (`.next/standalone`) |
| `bun run start` | Serve the standalone build |
| `bun run lint` | ESLint (flat config) |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test` | Vitest unit layer |
| `bun run test:e2e` | Playwright (production build + isolated `db/e2e.db`) |
| `bun run db:push` / `db:seed` / `db:generate` / `db:migrate` / `db:reset` | Prisma operations (inline-anchored) |

## Testing Strategy

### Test Pyramid

- **Unit (Vitest, 100 tests)** — pure seams: router mapping (incl. the reference-probed greeting buckets), date math (2-digit-hour clock format + ISO calendar week), calculator engine (incl. unary ops), auth primitives (scrypt/HMAC/rate-limit), Zod schemas (incl. Event location/repeat/reminders + Timetable weekType + the S6 Task priority/repeat/myDay/subtasks, Assignment type/progress/urgent, Exam type/duration/topics, and the S7 deck color + card difficulty + practice-test questions), db-path resolution (the full anchor contract), theme tokens (measured values + the complete 15-var accent set incl. the S4-G gradient stops and the S5 hover stop + emerald/amber migrations + the S8 active-nav gradient stops `NAV_ACTIVE_GRADIENT_STOPS` with its kebab-case `toCssVar`).
- **E2E (Playwright, 159 specs)** — auth flows (incl. the login card's measured chrome), mobile chrome (fixed glass app bar + brand + clock, drawer geometry/backdrop blur(4px)/icon items/no footer, content offset y=80), desktop sidebar active states, all 20 views render, task CRUD golden path, calculator + theme switching; computed-style parity pins (v3 `shadow-sm`, canvas gradient, sidebar geometry, corner radii, footer avatar default + gradient stops, stat icon size + text metrics, clock chip gradient, CTA width + gradient, view-title h1/icon/subtitle model, empty-state design, "My Lists" label), the session-5 interactive-chrome pins (gradient CTAs, Events dark panel + dialog field set, dialog geometry, gray outline palette, FocusTimer layout, Settings appearance cards, Calendar segmented switch, Calculator keypad/display, MyDay quick-add row, Timetable week bar + All Weeks options, Files chrome, Notes left pane, GradeTracker gradient card, AI quick-action cards) in `tests/e2e/parity-session5.spec.ts`, the session-6 populated-state pins (task card rows + priority checkbox + pill meta + filter panel, task dialog field set, MyDay amber progress card + Suggestions, dashboard bare rows, assignment slider rows, exam card grid, calendar cells/legend/day-detail) in `tests/e2e/parity-session6.spec.ts`, the session-7 lightly-probed-views pins (flashcards deck rows/swatches/card grid/3D study mode, group + practice-test dialog palettes and field sets, timetable grid-cols-8 heads/hour cells/My Classes today date, analytics stat cards + 7-day chart titles, grade tracker icons, notes title input) in `tests/e2e/parity-session7.spec.ts`, and the session-8 deep-chrome/layout pins (nav icon set + active-gradient avatarTo stop + 36px collapse button, dashboard flush divide-y rows, calendar selected/today semantics + simple month card, MyDay amber header block + bare suggestions toggle, timetable today-header tint + ghost week-nav, tasks two-pane + icon search, notes/study-groups two-pane + gradient dropdown New, analytics per-card icons + Assignment Status donut + Subject Workload + priority chips, calculator rotate-ccw Clear, mathsolver single column + camera/refresh-cw buttons, AI quick-action icons, focustimer check button, settings tab list chrome, assignments/exams search icons + slim exam card) in `tests/e2e/parity-session8.spec.ts`.

### Test Commands

```bash
bun run test                                   # all unit
bunx vitest run tests/date.test.ts             # one file
bun run build && bun run test:e2e              # e2e (build first — always)
bunx playwright test tests/e2e/parity-session5.spec.ts --project=chromium
```

Rules: unique row titles in e2e (the db persists across runs); exactly one shared login via storageState (rate limiter!); the theme spec restores the default accent; Radix tabs assert `aria-selected` (not `data-state="selected"`); gate clicks on hydration when a spec clicks right after `goto` (see `hydrated()` in `calculator.spec.ts`); `getByRole({ name })` is substring + case-insensitive — use `exact: true` when names collide; post-click computed-color reads must poll the FINAL value (`waitForFunction`) — `transition-all` surfaces animate between states and React re-renders race immediate evaluates (S8 lessons).

## Code Quality Standards

`bun run lint` and `bun run typecheck` must exit clean. No weakening of lint rules or type strictness to make a gate pass — fix the issue or flag the debt explicitly. The `tests/` directory mirrors the src seams by concern, not by file path.

## Git & Version Control

- **`main` only.** No feature branches; atomic Conventional Commits (`feat:`, `fix:`, `docs:`, `test:` …).
- Pushes go through `python3 docs/ssh_git_wrapper_v3.py --key-file <key>` (never commit keys or the ssh shim; see `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`). The wrapper verifies the remote ref equals local HEAD after pushing.
- Gate before every push: `lint → typecheck → test → build → test:e2e`.

## Error Handling & Debugging

- API errors: uniform `{ error }` JSON via `errorResponse()` (maps Zod/Prisma/auth errors to 4xx). Never leak stack traces; `[api] unhandled error` logs carry the detail server-side.
- Client: `toast.error(err.message)` from the `ApiError` envelope; views render `ErrorText` for load failures and `EmptyState`/`SimpleEmptyState` for empty collections.
- Debugging: read `dev.log` (request traces + prisma queries); probe computed styles in Playwright (hover states lie on touch emulation — v4's `@media (hover: hover)`); reproduce before fixing; `tests/db-path.test.ts` is the first stop for any db-path weirdness.

## Communication & Documentation

- Comments explain *why*, not *what* — the six Tailwind v4 traps and the db-path anchors are commented at their sources; keep those comments true.
- `README.md` (users) → `AGENTS.md` (agent quick-reference) → `Project_Architecture_Document.md` (full blueprint + ADRs) → `omni-study_SKILL.md` (distilled engineering knowledge — traps, anti-patterns, debugging, lessons). Update the right layer for the change you made.

## Project-Specific Standards

### Architecture
One-page SPA shell + rewrites; fixed glass sidebar ≥ lg; below lg a fixed glass app bar (64px, brand + live clock) + mobile drawer (288px, nav items from the shared `nav-items.tsx`, no footer); view router + theme + data stores; CRUD delegate factory; stateless HMAC sessions. Nav item markup has ONE source (`NavItemLink`) shared by sidebar and drawer; view page headers have ONE source (`ViewHeader` — h1 + optional 24px icon + reference subtitle) consumed by all 20 views. Primary CTAs are gradient buttons (Button `gradient` variant); the Events view is a dark terminal panel (slate-900, both themes); dialogs are shadcn-v3 stock (max-w-md, rounded-lg, h-9 transparent inputs on the GRAY neutral ramp).

### API Design
REST-ish `/api/<entity>` collections with `/[id]` items; Zod at every boundary; ownership in the WHERE clause; destructive ops are plain DELETE behind auth (no tokens/approvals — single-user contexts).

### Database / Data Layer
20 views over 21 models (see `prisma/schema.prisma`); SQLite via Prisma 6.19; `db/` at repo root, gitignored; idempotent seed; e2e gets its own `db/e2e.db`.

### Environment Variables

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `DATABASE_URL` | yes | SQLite url; resolved by `src/lib/db-path.ts` | `file:../db/custom.db` |
| `AUTH_SECRET` | prod | Session HMAC key (`openssl rand -hex 32`) | *(random 64 hex chars)* |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical origin for metadata | `http://localhost:3000` |

## Success Metrics

You are successful when: the full gate is green; e2e specs that pin parity still pass untouched; `db/custom.db` and `db/e2e.db` never collide; a fresh clone reaches a seeded dashboard in under two minutes; and the visual parity verdict against the reference stays EXCELLENT on desktop AND mobile.

## Anti-Patterns to Avoid

- Real route folders per view (breaks the SPA contract + rewrites).
- `prisma db push` relying on repo-root `.env` (lands the db one directory high).
- `space-y-*` with margin-carrying children (Tailwind v4 trap 4).
- Removing the `@theme` pins (v3 palette / `--shadow-sm`) — parity e2e specs will fail.
- Importing `z-ai-web-dev-sdk` client-side.
- Re-implementing nav item markup instead of using `NavItemLink` (sidebar/drawer drift).
- Writing only SOME accent tokens to `<html>` (stale violet tokens under other accents).
- Hand-rolled page headers (use `ViewHeader`) or empty states (use the shared `EmptyState`/`SimpleEmptyState` reference pattern).
- Solid-violet primary CTAs (use the Button `gradient` variant — the reference's CTAs are violet→indigo gradients).
- Zinc/zinc-neutral form controls (the reference's shadcn theme is on the GRAY ramp — see globals.css).
- Routing brand/avatar gradients through `primary`/`strong` (they end at the ADJACENT hue — use `--sf-primary-gradient-to` / `-avatar-*`).
- Extra real logins in e2e specs (rate limiter poisons the run).
- Weakening lint/type gates to ship.

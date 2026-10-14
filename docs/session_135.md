# Session 135 — The S52 summary

## What shipped

**The collapsed-sidebar parity remediation** — the first reference
change since the S19 sweeps (the reference shipped a collapsible
desktop sidebar; the clone's session-8-era implementation had drifted
on six measured surfaces plus one functional bug), closed as a
four-file app-code fix + an 8-pin e2e spec + the corrected stale pin:

- `src/app/page.tsx` — the main offset now tracks the store's
  `sidebarCollapsed` (`lg:ml-[260px]` ↔ `lg:ml-20`), fixing the 184px
  dead-zone bug (the pre-fix clone kept the 260px offset with a 76px
  rail).
- `src/components/layout/sidebar.tsx` — the collapsed rail is `w-20`
  (80px, the reference's measured width); the header renders ONLY the
  chevron toggle when collapsed (the brand unmounted — no separate
  expand row); the footer is completely empty when collapsed (the
  reference's measured `<div class="mt-auto">`); ONE `ChevronLeft`
  glyph with `transition-transform rotate-180` when collapsed.
- `src/components/layout/nav-items.tsx` — the icons stay LEFT-ALIGNED
  at `px-4` in both states (the reference's measured svg x=32); the
  superset extended: `aria-label` + the existing `title` on icon-only
  links (the reference's own icon-only links carry no accessible name).
- `src/components/layout/mobile-chrome.tsx` — the drawer's links SHARE
  the collapsed state (icon-only when collapsed, the reference's own
  behavior; the panel/header/backdrop identical in both states).
- `tests/e2e/s52-sidebar-collapse.spec.ts` — 8 pins: the
  expanded-default composite guard, the collapse geometry (aside 80 /
  main ml 80 / content 1200 / icon-only / chevron in the header), the
  left-aligned icon pin, the empty-footer pin, the reload persistence
  round-trip, the rotated-glyph pin, and the drawer's shared state
  (icon-only + auto-close; labeled default).
- `tests/e2e/navigation.spec.ts` — the stale 76px pin corrected to the
  reference's measured 80px.

## The measurement record (the reference, live 2026-10-14)

Collapsed: aside `w-20`/80px · header ONLY the chevron (h=85) ·
icon-only links left-aligned `px-4` (svg x=32) · footer EMPTY (h=0) ·
main `ml-20` (content 1200 at 1280) · glyph chevron-left
`rotate-180` · `localStorage.sidebarOpen="false"`. Expanded (the
DEFAULT — fresh logins at both viewports write "true"): the classic
260px labeled sidebar. The mobile drawer shares the state (icon-only
links in the 288px panel when collapsed, no trailing dot; labeled when
expanded).

## The gates

**lint ✓ tsc ✓ 834 unit ✓ (20 files — no unit change; the pure seams
untouched) build ✓ cold-db 299 e2e ✓ (4.7 min) = 1133 green** (was
1125; +8 e2e pins; the 291 prior pins untouched — the default expanded
state, which every standing pin and audit stage exercises, is
byte-identical by construction).

## The session's audit record

The reference re-swept: title, greeting, 20-view order, five Settings
tabs — UNCHANGED; the collapsible sidebar is the sole change (found
because the arrival audit re-measured the sidebar at BOTH states
instead of trusting the S8-era record). The mobile navigation verified
working on BOTH apps (the clone's drawer walkthrough GREEN; the
reference's own drawer at the element level). **No Tailwind v4 bug
found** (the trap surfaces re-verified live: blur(4px), the flex-gap
nav, the oklab serialization). Zero app-code findings in the code
review; the .env/DATABASE_URL contract verified (file:../db/custom.db,
the db/ folder at the repo root); the .env.example matching and
tracked; the vitest + playwright suites present and correct.

One methodology note for the record: a VLM pairwise comparison raised
three collapsed-rail hypotheses, all refuted by pixel analysis + the
DOM pins — the S9 doctrine (VLM = hypothesis generator, DOM probes =
authority) re-learned. And the session's own first reference probe
initially mis-read the default as collapsed — traced to a stray click
on the hidden aside's toggle; the rigorous clear-storage + fresh-login
sequence established the true default (expanded).

## Remaining open

The first real `docker compose --profile init up` on the owner's
Docker host; the upstream dep patches (braces > 3.0.3, Prisma's
deepmerge-ts pin) clearing when they land; and the next session's
standing instruction — the reference now HAS moved once, so the
arrival re-sweep (both sidebar states included) stays in the protocol.

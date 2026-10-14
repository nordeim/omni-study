# Remediation Plan — Session 52 (S52): the collapsed-sidebar parity remediation

**The session's governing finding (the S52 arrival audit, 2026-10-14):**
the reference site has SHIPPED A NEW NAVIGATION FEATURE since the S19–S51
sweeps — a **collapsible desktop sidebar** — and the clone's existing
session-8-era collapse implementation has drifted from it on six measured
surfaces plus one functional bug. Every prior session's re-sweep read the
reference UNCHANGED (title, greeting, 20-view order, five Settings tabs —
all re-verified unchanged this session too); the change is confined to the
sidebar's collapse behavior, which no standing sweep stage exercises at the
collapsed state (the suite runs at the default expanded state — grep-
verified: zero scripts/ probes touch `sidebarCollapsed`).

## The reference's new feature (all measurements live, 390×844 + 1280×800, operator account)

The reference's desktop sidebar (expanded, the default — verified by
clearing storage + fresh login at BOTH viewports: `sidebarOpen: "true"`
written on mount):

- aside `hidden lg:flex fixed left-0 top-0 h-screen flex-col glass z-40
  shadow-xl shadow-slate-200/50 transition-all duration-300 w-[260px]` (or
  `w-20` collapsed) — the SAME shell classes the clone pins, PLUS the
  width toggle.
- Header (expanded, h=109): `p-6 flex items-center justify-between border-b
  border-slate-100` — brand block LEFT (w-10 h-10 gradient chip + brand
  text) + a chevron toggle button RIGHT (`h-9 w-9 rounded-lg text-slate-400
  hover:text-slate-600 hover:bg-slate-100`, glyph chevron-left w-5 h-5
  forced to 16px by the shadcn `[&_svg]:size-4` override — the S8-A pin).
- Header (collapsed, h=85): the SAME header row renders ONLY the chevron
  button (the brand block is unmounted); the glyph carries
  `transition-transform rotate-180` (chevron-left rotated to point right =
  expand). Button sits LEFT (flex-start, x=24 in the 80px rail).
- Nav (both states): `flex-1 p-4 space-y-1 overflow-y-auto`; link divs
  `flex items-center gap-3 px-4 py-3 rounded-xl` — the label span is
  simply OMITTED when collapsed (icons stay LEFT-ALIGNED at px-4: svg x=32
  in the rail, x=32 in the 288px drawer, measured centerOffset −102px —
  NOT centered). The reference's icon-only links carry NO title/aria-label
  (an a11y gap — the clone's `title` tooltip stays as the documented
  superset).
- Footer (expanded, h=185): `mt-auto` → clock chip (violet-50→indigo-50
  gradient, `text-2xl font-bold text-violet-700` time + `text-xs
  text-violet-600` date) + the user row (w-9 h-9 avatar + name/email) —
  the clone's existing parity-pinned footer.
- Footer (collapsed, h=0): **completely EMPTY** — `<div class="mt-auto">`
  `</div>` — the clock AND the user row are unmounted (no border, no
  padding).
- Main offset: `lg:ml-[260px]` expanded ↔ **`ml-20` (80px) collapsed**
  (measured mainML 80px, mainW 1200 at 1280×800) — the content reflows to
  fill the freed 180px.
- Persistence: `localStorage.sidebarOpen` ("true"/"false"), default
  expanded; the state is read on mount and written on toggle.
- **The mobile drawer SHARES the state**: with `sidebarOpen=false` the
  drawer's 20 links render ICON-ONLY (panel stays w-72/288px, nav 912 vs
  744 scrollable, the active link keeps the gradient + violet-600 icon,
  NO trailing dot); with "true" the links are labeled (the S51-recorded
  element-level state). Verified in both directions with reloads.

## The findings (the clone's deltas)

| # | Surface | Reference (measured) | Clone (current) | Class |
|---|---------|---------------------|-----------------|-------|
| F1 | Main offset when collapsed | `ml-20` (80px), content reflows | **stays `lg:ml-[260px]`** — a 184px dead zone between the 76px rail and the content | **functional bug** |
| F2 | Collapsed rail width | `w-20` (80px) | `w-[76px]` (76px) | geometry drift |
| F3 | Collapsed header structure | chevron button ONLY in the header row (brand unmounted) | logo stays in the header; the expand chevron lives in a separate `py-2` row BELOW the header | structure drift |
| F4 | Collapsed nav icon alignment | left-aligned `px-4` (svg x=32) | centered (`justify-center px-0`) | layout drift |
| F5 | Collapsed footer | empty (`<div class="mt-auto">`) — clock + user unmounted | avatar row still rendered (centered) + border-t + p-4 | structure drift |
| F6 | Mobile drawer state sharing | icon-only links when collapsed (288px panel, no dot) | always labeled | behavior gap |
| F7 | Pin debt | — | navigation.spec.ts pins the stale 76px; zero pins on the offset shift / header / footer / icon alignment / drawer sharing | test debt |

**Non-gaps (documented, no action):**

- The persistence KEY differs (`sf-sidebar-collapsed` "1"/"0" vs
  `sidebarOpen` "true"/"false") — the observable contract (state survives
  reload, default expanded) is what parity means here; no cross-app
  migration path exists. Renaming the key would break existing users'
  stored preference for zero observable gain.
- The clone's nav list uses `flex flex-col gap-1` vs the reference's
  `space-y-1` — the documented Tailwind v4 trap-4-safe equivalent
  (identical 4px rhythm; the reference's own stack is a v3-era app).
- The clone's icon-only links keep the `title` tooltip (+ this session
  adds `aria-label`) — a superset; the reference's icon-only links have
  NO accessible name.
- The expanded state (the default) is UNTOUCHED by this plan: every
  standing pin, probe, and audit stage runs at the default expanded
  state and must stay byte-identical. The only expanded-state DOM change
  is NONE (the header/footer/nav expanded branches keep their exact
  current markup).

## The fix (TDD)

### Phase A — the e2e pin family first (RED)

New spec `tests/e2e/s52-sidebar-collapse.spec.ts` (the house per-session
convention), plus the stale-pin correction in `navigation.spec.ts`
(76px → 80px — the reference's measured rail):

1. **The expanded default composite** (guards the untouched state): aside
   260px, main marginLeft 260px, 20 labeled links, brand + tagline
   visible, footer clock + user row present.
2. **The collapse geometry**: click "Collapse sidebar" → aside 80px, main
   marginLeft 80px, main width 1200 (at 1280 viewport), zero labeled
   links (20 icon-only), brand text absent, chevron "Expand sidebar"
   INSIDE the header row (the aside's first child contains it), no
   separate expand row.
3. **The collapsed icon alignment**: the second nav link's svg x ≈ 32
   (left-aligned px-4), NOT centered (center would read ≈ 30 with the
   old layout / ≈ (80−20)/2+nav offsets — the pin asserts x within
   [30, 34] AND the div's justifyContent "normal").
4. **The collapsed footer**: no clock chip, no avatar image/text inside
   the aside's last child (empty footer).
5. **The persistence round-trip**: collapsed → reload → still 80px;
   expand → reload → 260px.
6. **The drawer sharing**: with the collapsed preference stored, at
   390×844 the drawer renders 20 icon-only links (zero text), panel
   288px, the active link carries the gradient background, NO trailing
   dot; expand (desktop viewport, "Expand sidebar") → the drawer renders
   labeled links again.
7. **The rotation class**: the expand chevron's svg carries
   `rotate-180` (the reference's rotated chevron-left).

### Phase B — the app-code changes (GREEN)

- `src/app/page.tsx` (F1): the shell reads `sidebarCollapsed` from the
  app store; the main className switches `lg:ml-[260px]` ↔ `lg:ml-20`
  (the `transition-all duration-300` already present animates the
  reflow; below `lg` nothing changes — the mobile layout never offsets).
- `src/components/layout/sidebar.tsx` (F2/F3/F5): collapsed width
  `w-[76px]` → `w-20`; the header renders the brand block only when
  expanded and the toggle button ALWAYS in the header row (collapsed:
  the button alone, left); the separate collapsed `py-2` chevron row is
  deleted; the footer renders its content only when expanded (collapsed:
  the bare `mt-auto` div); the toggle icon becomes ONE ChevronLeft with
  `transition-transform` + `rotate-180` when collapsed (the reference's
  exact glyph behavior; keeps the S8-A 16px size + h-9 w-9 rounded-lg
  button pins).
- `src/components/layout/nav-items.tsx` (F4 + superset): drop
  `justify-center px-0` (icons stay left-aligned `px-4`); keep the
  `title` tooltip and ADD `aria-label={item.label}` when collapsed (the
  accessible-name superset).
- `src/components/layout/mobile-chrome.tsx` (F6): the drawer's
  NavItemLink renders with `collapsed={sidebarCollapsed}` (the shared
  state); panel, header, backdrop untouched.

### Phase C — gates + evidence + docs

- Full gates: `lint` ✓ `tsc` ✓ unit 834 ✓ `build` ✓ cold-`db/e2e.db` e2e
  (291 + the new S52 pins) ✓ — the standing-suite stages all run at the
  default expanded state (unaffected by construction).
- Evidence: dev-server screenshots (expanded + collapsed desktop, the
  collapsed drawer at 390) + the reference probe captures already saved
  this session (`s52-ref-*.png`).
- Docs: AGENTS.md (the sidebar contract line — the width + the offset +
  the shared drawer state), README (the feature table's Theme/Nav row if
  warranted), PAD §the layout section, worklog entry.

## Validation against the codebase (pre-execution)

- `grep sidebarCollapsed src/` → exactly three files consume it today
  (sidebar.tsx, store.ts, page.tsx does NOT — the F1 bug); after the fix:
  sidebar.tsx, page.tsx, mobile-chrome.tsx, store.ts.
- The standing suite's 35 stages: grep-verified zero references to
  `sidebarCollapsed` / `sf-sidebar-collapsed` / "Collapse sidebar" — the
  default expanded state governs every stage; no stage can observe the
  change.
- Existing pins that TOUCH the collapse surface: navigation.spec.ts
  "the sidebar can collapse and expand" (76px → corrected here),
  parity-session8.spec.ts "collapse button is the reference's h-9 w-9
  rounded-lg" (the button keeps h-9 w-9 rounded-lg + the 16px glyph —
  stays green), suite-verdict.test.ts:38 (an audit-envelope FIXTURE
  label, not an app pin — untouched).
- The e2e database/staging: the new spec needs NO data beyond the seed
  (the shell renders at seed) and NO theme mutations (the collapsed
  state is localStorage-only — the theme-restore closing guard is
  unaffected). The spec MUST end expanded (restore the preference in a
  finally/afterEach — the S4 accent-restore lesson applied to the
  sidebar preference).
- Playwright contexts start with EMPTY localStorage (the S11 lesson) —
  every spec file starts expanded by default; the collapsed-state pins
  set the preference explicitly (click the toggle, then reload where the
  mount-time read matters).

## The execution log (2026-10-14, the S52 session)

**Phase A — the TDD RED run** (the spec written first, against the
pre-fix production build): `tests/e2e/s52-sidebar-collapse.spec.ts` —
8 pins (S52-A the expanded-default composite, S52-B the collapse
geometry, S52-C the icon alignment, S52-D the empty footer, S52-E the
persistence round-trip, S52-F the drawer sharing ×2, S52-G the rotated
glyph) + the stale 76px pin corrected to 80px in navigation.spec.ts.
RED result: **6 failed / 3 passed** — exactly the six bug surfaces
(B/C/D/E/G + the collapsed drawer); the expanded-default composite and
the labeled default drawer passed (the default state was intact), the
documented RED pattern.

**Phase B — the GREEN implementation** (four files, the plan verbatim):

- `src/app/page.tsx`: the shell now reads `sidebarCollapsed` from the
  app store; the main className switches `lg:ml-[260px]` ↔ `lg:ml-20`
  (the pre-existing `transition-all duration-300` animates the reflow).
- `src/components/layout/sidebar.tsx`: `w-[76px]` → `w-20`; the header
  renders the brand block only when expanded with the toggle button
  ALWAYS in the header row (the separate collapsed `py-2` chevron row
  deleted); the footer renders its content only when expanded (collapsed:
  the bare `mt-auto` div — the measured empty footer); ONE `ChevronLeft`
  glyph with `transition-transform rotate-180` when collapsed; the
  expanded branch byte-identical to the pre-fix markup.
- `src/components/layout/nav-items.tsx`: `justify-center px-0` dropped
  (the icons stay left-aligned at `px-4` in both states); the superset
  extended — `aria-label={item.label}` added next to the existing
  `title` on icon-only links.
- `src/components/layout/mobile-chrome.tsx`: the drawer's NavItemLink
  now renders with `collapsed={sidebarCollapsed}` (the shared state).

Static gates after the implementation: lint ✓ tsc ✓ **834 unit ✓**
(no unit change — the pure seams are untouched; this is an app-code +
e2e session, the S8–S26 pattern). Build ✓ (rebuilt for the e2e).

**Phase C — the GREEN run + the full regression:** the S52 spec
**8/8 GREEN** after ONE pin correction (the drawer panel width's
sub-pixel rounding at the 390px viewport reads 287/288 — the pin now
carries the standing drawer-check's own <2px tolerance, the S14
precedent; documented here, never silent). The corrected navigation
pin GREEN. **The full cold-`db/e2e.db` regression: 299 passed (4.7
min)** — the 291 prior pins untouched + 8 new. **Total gates: lint ✓
tsc ✓ 834 unit ✓ build ✓ 299 e2e ✓ = 1133 green** (was 1125).

**The live verification (the dev server, both states):** collapsed —
aside 80px, main ml 80px, the drawer 20 icon-only links with svgX=32
(the reference's own measured icon x), the `title` tooltip present;
expanded — aside 260px, main ml 260px, labeled links, the preference
restored to expanded (the clean final state). The standing preflight
GREEN + the standing drawer-check GREEN (the default expanded drawer
unaffected). A VLM pairwise comparison of the collapsed rails raised
three hypotheses ("clone rail wider / icons centered / avatar in the
footer") — ALL THREE refuted by pixel analysis (icon x-range 34–42
IDENTICAL on both apps) and the passing DOM pins; the S9 doctrine
applied verbatim (VLM is the hypothesis generator, DOM probes are the
authority).

**The evidence set** (`docs/screenshots/`): `s52-ref-desktop-probe-1280.png`
+ `s52-ref-desktop-expanded-1280.png` + `s52-ref-desktop-collapsed-1280.png`
+ `s52-ref-drawer-probe-390.png` + `s52-ref-mobile-notes-390.png` (the
reference probes), `s52-clone-desktop-collapsed-before-1280.png` (the
dead-zone bug, pre-fix), `s52-clone-desktop-collapsed-1280.png` +
`s52-clone-desktop-expanded-1280.png` + `s52-clone-mobile-drawer-390.png`
+ `s52-clone-mobile-notes-390.png` + `s52-clone-mobile-drawer-icononly-390.png`
(the post-fix states).

**Docs aligned:** AGENTS.md (the collapsible-sidebar contract + the
299-spec count), README.md (the badge 1133, the counts ×3, the
session-52 row), CLAUDE.md (the 299 count + the S52 spec description),
PAD §8.1 (the S52 row + the Total 49 files/1133 + the layout tree's
sidebar line), omni-study_SKILL.md (the counts ×2), this plan, the
session docs, the worklog.

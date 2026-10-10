# Remediation Plan — Session 28 (S28): the connectivity-audit A4 repair — assert the designed failure channel, not the S14-era toast

**Audit surfaces (this session, session-54 workspace run at `270a898`):** the
standing checks all ran GREEN on arrival — the baseline gates (lint ✓ tsc ✓
258 unit ✓; `bun run build` ✓; the cold-`db/e2e.db` full e2e regression
**291 ✓ (4.4 min)** = the documented **549-green** state re-confirmed on
arrival), the mobile-drawer check on the clone (backdrop `oklab(0 0 0/0.2)`
+ blur(4px), 288px white panel, 20 links, no footer, Escape-close superset)
**plus a live agent-browser walkthrough at 390×844** (the app bar renders
with the Open-navigation-menu button + brand + live clock; the drawer opens
as a dialog with all 20 links; the Settings link navigates; the Profile tab
renders the S26 Email address card above the S24 Change password + S25
Danger zone cards; scrollWidth 390 — no horizontal overflow — **the mobile
navigation menu is working as expected**), the reference re-sweep (login +
dashboard + Settings + Profile tab): **the reference is UNCHANGED since
S19–S27** (the zero-data account 0/0, greeting from the email prefix, the
same 20 nav views in the same order, the "StudyFlow / Your study companion"
branding split, the same five Settings tabs with school/grade/goal/created
fields; the 20-view copy sweep 14/20 MATCH with the 6 remaining diffs all
DATA-STATE — the documented S17-pinned non-gap family), and the S27 code
audit (the recent changes: the repaired `scripts/dark-sweep.mjs` — the
API-driven mode forcing, the self-verifying precondition, the loud-failure
guards, the `{ mode, views }` envelope, the awaited restore — reviewed
line-by-line) — **CLEAN**. The test configs +
`DATABASE_URL="file:../db/custom.db"` (db/ at the repo root) + `.env.example`
(matches the codebase, git-tracked) verified current. The scandihaven
reference repo re-reviewed — unchanged since 10-04 (top commit `d4789c3`);
no new patterns to adopt.

The production-readiness sweep then re-ran the full standing-audit suite
(the S22/S24/S27 pattern — both backlogs empty, so the standing superset goal
governed): security ✓ (0 findings — the one transient "AI-route limiter
shape wrong" note was an artifact of MY double-run consuming the 20/15-min
budget; a clean dev-server restart + a single re-run showed the documented
shape `20x400 then 2x429; cutoffAt=21`), settings-roundtrip ✓ (0 failures),
connectivity — **1 finding, verified below**, upload-edge ✓ (0 findings),
data-volume ✓ (0 findings after 750 probe rows inserted + cleaned),
forced-colors ✓ (1 hit = the Events view's deliberately hidden `aria-hidden`
`sr-only` date trigger — a non-gap), print ✓ (0 findings), focus-order ✓
(the documented dev-mode NEXTJS-PORTAL artifacts only), CWV ✓ (CLS 0.00
everywhere; the documented S16 state — throttled-mobile dashboard LCP NI
2620 ms, the reference's own mobile login POOR), dark-sweep ✓ (the S27
repair validated live: `MODE: dark`, flashbulb=0 unreadable=0 across all 20
views in REAL dark mode, preference restored), and accent-dark-sweep ✓ (its
residual hits are the **documented S11 verified non-gap family** — the
accent CTA faces at 2.15, the Calendar adjacent-month dimming 2.36 dark, the
Timetable subject-colored class cards, the muted type pills; verified
against the reference in session-11; do not "fix" byte-parity-pinned
reference-measured surfaces).

## The governing decision (this session's work)

The sweep found exactly ONE genuine defect, again of the
**tooling-integrity class** (the AP-69/AP-70/AP-72 family — a
validated-once mechanism silently rotting after a later change):

**`scripts/connectivity-audit.mjs` family A4 — the login-offline probe —
silently rotted after the session-15 auth-flow change.** The probe submits
the demo credentials on `/login` with the context offline, waits 3 s, then
reads `[role="status"]` elements and reports:

```
family A — "Login offline shows no/silent feedback"
measured: {"toast":[],"bodyText":"…PasswordYou appear to be offline. Check
your connection and try again.Sign in…"}
```

**The finding is disproved by its own measured evidence**: the `bodyText`
in the SAME finding contains "You appear to be offline. Check your
connection and try again." — the feedback exists. A dedicated reproduction
probe this session (a scratch copy of the A4 flow that enumerates ALL
announcement roles) verified the real behavior:

```json
{
 "url": "/login",
 "toast": [],
 "alerts": [{ "text": "You appear to be offline. Check your connection and
try again.", "cls": "relative w-full rounded-xl border p-4 …" }],
 "banner": false,
 "button": { "disabled": false, "text": "Sign in" },
 "url_still_login": true
}
```

**The root cause (verified):** A4 was written in session 14 against the
THEN-current design — the login card toasted auth errors (`toast: []` was
the failure signal, and the pre-S15 build showed a toast). Session 15
(ADR-013) then replaced the login card's error rendering with the
reference's MEASURED pattern — auth errors render INLINE as a `role=alert`
red wash between Password and Sign in (`login-card.tsx`: "the reference's
measured pattern, replacing the S14 toast"), pinned by
`tests/e2e/auth-flows.spec.ts` (`div.shadow-2xl` `getByRole("alert")` +
`toHaveURL(/\/login/)`). **The A4 probe was never re-validated against the
S15 design change** — the exact AP-72 lesson ("re-run every standing audit
after any lifecycle change touches what they measure"): the S15 change
touched exactly what A4 measures, and every session since S15 that ran the
audit (S22–S27, including the S27 session that reported "connectivity ✓")
received this phantom finding. A future session acting on it would "fix"
the login card back to toasts — **breaking the S15 reference-parity pins**
(the reference renders auth errors inline; the e2e auth-flows spec would
fail).

### The semantics (tight scope, resolved by design)

- **A4 asserts what the DESIGN says** — the S15 convention: an offline
  sign-in attempt (1) keeps the user on the login card
  (`location.pathname === "/login"`), (2) announces the failure through the
  DESIGNED channel — the inline `role="alert"` on the auth card containing
  the offline message, and (3) leaves the submit button recovered (not
  latched in the busy/"Signing in…" state — the S13 latch-free doctrine).
  The S14-era toast enumeration (`[role="status"]`) is retired: on the login
  route a toast is now the WRONG design (parity-breaking).
- **The genuine-failure criterion stays LOUD.** If NO announcement renders
  (no alert text) or the user is bounced off the card, the probe keeps a
  REAL finding ("Login offline fails silently" / "Login offline loses the
  card") — the S27 doctrine: a probe that cannot see its own state must
  fail loudly, never normalize a finding away.
- **The measured evidence rides the output** — the A4 entry carries
  `{ url, alert, button }` (the observable end state), so every saved
  artifact is self-describing, the `{ mode, views }`-envelope convention.
- **No state is left mutated** (A4 already restores the context online and
  closes its page; unchanged).

### Non-gaps (documented, do not fix)

1. **The reference is unchanged** — no parity surface exists to chase.
   This session touches NO app code at all.
2. **The accent-dark-sweep residual hits** — the S11 verified non-gap
   family (the accent CTA faces 2.15, the adjacent-month dimming, the
   subject class cards, the muted type pills); fixing them would break
   byte-parity on reference-measured surfaces.
3. **The Events view's `sr-only` date input** (forced-colors sweep hit) —
   deliberately `aria-hidden` + `tabIndex=-1`; a programmatic trigger,
   never keyboard-reachable.
4. **The dev-mode NEXTJS-PORTAL focus anomalies** — a dev-tools artifact;
   the production build has no portal.
5. **The transient "AI-route limiter shape wrong" security note** — an
   artifact of running the audit twice in one session (the first run
   consumes the 20/15-min per-user budget; the second run's probe starts
   at 429). One audit run per fresh dev-server process is the operating
   rule; the clean re-run showed the documented shape.

---

## Families and fixes

### S28-A (HIGH) — the repair (`scripts/connectivity-audit.mjs`, family A4)

Replace the A4 probe block (the post-click evaluate + verdict, ~lines
188–205) with the S15-aware assertion:

1. After the offline submit + 3 s settle, evaluate the OBSERVABLE end
   state: `url` (pathname), `alert` (the `role="alert"` texts INSIDE the
   auth card — scoped the e2e convention: the card is the
   `div.shadow-2xl` container), `button` (disabled? text "Signing in…"?),
   `stillCard` (pathname === "/login").
2. Verdict:
   - `stillCard && alert.some(contains /offline/i) && !button.disabled` →
     ok("Login offline announces the failure through the S15 inline alert
     (stays on the card, button recovered)", the measured JSON).
   - otherwise → the genuine finding, loud: "Login offline fails silently
     or loses the card" with the measured JSON.
3. The screenshot evidence path (`a4-login-offline.png`) and the
   context-online restore stay unchanged.

### S28-B (MEDIUM) — docs alignment

- **AGENTS.md** — the connectivity-audit command-table entry gains the
  A4 note (asserts the S15 inline-alert channel; never the toast).
- **README.md** — the session-28 status row; the captures line gains the
  S28 evidence set.
- **Project_Architecture_Document.md** — **ADR-026** (the
  designed-channel doctrine: a probe asserts the behavior the DESIGN
  specifies, enumerated from the live DOM — the S15 change invalidated
  the A4 toast expectation; expectation rot is found by re-running
  standing audits after every change that touches what they measure).
- **omni-study_SKILL.md** — **AP-73** (the expectation-rot lesson: the
  S27 repair fixed mode-forcing rot; the A4 case extends it to VERDICT
  rot — the probe still runs, still measures, but asserts a design that
  no longer exists; the tell: a finding whose own measured evidence
  disproves it).
- **CLAUDE.md** — the audit-tools-self-verify principle gains the
  designed-channel clause.

## TDD order

Probe scripts are execution-validated (the repo's drawer-check/capture
convention) — the RED/GREEN cycle rides the script's own output:

1. **RED (observed, captured):** the current audit run → family A
   "Login offline shows no/silent feedback" with `toast: []` (captured in
   `/tmp/conn.json` + the reproduction probe output; the before-state).
2. **GREEN (target):** apply S28-A → re-run →
   "Login offline announces the failure through the S15 inline alert
   (stays on the card, button recovered)" in nonGaps with `findings: []`.
3. **The negative control:** a scratch copy of the A4 block whose alert
   wait can never satisfy (a never-true condition) → confirms the genuine
   finding path still fires loudly; deleted after.
4. **Full gates re-run:** lint → typecheck → 258 unit → build → cold-db
   291 e2e (the script change touches no app code; the regression
   re-confirms nothing else moved).
5. **Standing checks re-run:** the drawer check GREEN post-change; the
   login-offline behavior already pinned by the S15 e2e family (the full
   regression re-runs it).

## Risks

- **The alert locator must be scoped to the auth card** — Next's route
  announcer also carries `role="alert"` (the S15 e2e lesson); the probe
  scopes to the `div.shadow-2xl` card container, never page-wide.
- **The 3 s settle must precede the read** (unchanged) — a mid-state read
  could catch the busy latched state; the observable end state is polled
  by the fixed settle the S14 probe already used.
- **No parity surface is touched** — the change is a probe script only;
  the 291 e2e pins and every byte-parity pin are untouched by
  construction (verified in the gates re-run).

## Execution log (session-54 workspace run)

- Baseline on arrival: the documented 549-green state re-confirmed (lint ✓
  tsc ✓ 258 unit ✓ build ✓ cold-`db/e2e.db` 291 e2e ✓ 4.4 min); the
  standing checks FIRST, all GREEN (the drawer probe + the live
  agent-browser 390×844 walkthrough — app bar, drawer dialog with 20
  links, Settings navigation, the S26 Email card on the Profile tab, no
  overflow; the reference re-sweep UNCHANGED since S19–S27 — login +
  dashboard + Settings + Profile, the 20-view copy sweep at 14/20 MATCH
  with 6 data-state non-gaps; the S27 dark-sweep.mjs audited line-by-line
  CLEAN and validated live: MODE dark, 0/0 across 20 views).
- The production-readiness sweep (the S22/S24/S27 pattern): security ✓
  (0 findings after the double-run artifact was resolved by a clean
  restart + single re-run — `20x400 then 2x429; cutoffAt=21`),
  settings-roundtrip ✓ (0), connectivity — **the A4 finding, verified
  false by its own measured evidence + the reproduction probe + the S15
  e2e pins**, upload-edge ✓ (0), data-volume ✓ (0 findings, 750 rows
  cleaned), forced-colors ✓ (the Events sr-only non-gap), print ✓ (0),
  focus-order ✓ (NEXTJS-PORTAL dev artifacts only), CWV ✓ (CLS 0.00
  everywhere; the documented S16 state; the reference's own mobile login
  POOR), dark-sweep ✓ (the S27 repair validated live), accent-dark-sweep
  ✓ (the S11 non-gap family).
- **TDD RED** (captured): the audit's family-A finding + the reproduction
  probe output (url /login, toast [], the role=alert InlineAlert text,
  button re-enabled).
- **The fix applied** (`scripts/connectivity-audit.mjs` family A4 only):
  the S15-aware assertion (alert scoped to the auth card, stillCard, the
  button-recovered guard, the loud genuine-failure criterion, the
  measured `{ url, alert, button }` evidence riding the verdict).
- **TDD GREEN** (captured): the audit re-run → the A4 entry in nonGaps
  ("Login offline announces the failure through the S15 inline alert…"),
  `findings: []`.
- **The negative control**: a scratch never-satisfiable A4 copy → the
  genuine finding fires; deleted after.
- **Gates re-run**: lint ✓ tsc ✓ 258 unit ✓ build ✓ cold-db 291 e2e ✓ =
  549 green, the 291 prior pins untouched (no app code touched, verified
  by construction).
- **Standing checks re-run post-change**: the drawer check GREEN; the
  login-offline S15 e2e family green in the full regression; the standing
  screenshots refreshed per the brief + the S28 evidence set captured
  under `docs/screenshots/`.
- Docs aligned: AGENTS.md (the connectivity-audit A4 entry), README.md
  (the session-28 status row + the captures line), PAD (ADR-026), SKILL
  (AP-73), CLAUDE.md (the designed-channel clause). `.env.example`
  audited — matches the codebase, git-tracked (included in the commit per
  the brief).

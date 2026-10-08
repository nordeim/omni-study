# Session 24 — the S16 CWV/mobile-geometry iteration narrative

*The session-23 briefing pointed at `docs/session_22.md`'s suggested next
surfaces: (a) a Lighthouse/CWV pass over both themes (CWV scores had never
been measured — the preflight covered size/long-tasks only), (b) the auth
sub-screens' mobile geometry (S15 measured desktop only), (c) a fresh copy
sweep of the twenty views. This session executed all three as the S16
audit iteration. 398 tests green (154 unit + 244 e2e).*

---

## What happened

1. **Workspace recovery + baseline.** Fresh clone at `701be37` (S15
   landed: 390 tests green). The five core docs re-read; the environment
   rebuilt (`bun install`, `.env`, `db:push` + `db:seed`); baseline gates
   matched the documented state (lint ✓ tsc ✓ 149 unit ✓); the S15 seams
   verified present (auth routes, login state machine, `mapPhysicalKey`,
   the token models).

2. **The standing drawer check ran first: GREEN** (backdrop equivalence,
   288px panel, 20 links, no footer, Escape-close superset) — the
   briefing's standing priority, unchanged since S14.

3. **The CWV audit (Lighthouse-class, zero new deps).** The methodology is
   the same one Lighthouse itself uses — buffered PerformanceObserver
   entries (LCP/CLS/FCP), Navigation Timing TTFB, longtask observer, CDP
   throttling (4× CPU + 150 ms RTT / 1.6 Mbps, cache disabled) — built as
   `scripts/cwv-audit-s16.mjs` against the production standalone on :3200
   (never :3100). The matrix: login + dashboard, mobile + desktop, light +
   dark, clone + reference. **Findings:** every clone surface LCP-GOOD
   (login ~640 ms mobile-throttled vs the reference's 7.6–8.0 s — a 12×
   advantage); the dashboard measured **CLS 0.117–0.125 (CWV
   needs-improvement) on every scenario** while the reference's desktop
   dashboard measures 0.088. A source-attribution probe
   (`cls-source-probe-s16.mjs`) pinned the mechanism: ONE shift at
   data-arrival — the shell flipped from the Splash on auth with an EMPTY
   data store, then the conditional overdue banner inserted above the
   stats grid and the sections grew from slim-empty to populated.

4. **The mobile auth-geometry probe** (`mobile-auth-geo-probe-s16.mjs`,
   both apps at 390×844): the S16 mobile gaps — the reference renders the
   sub-screens RESPONSIVELY (h2 `text-xl sm:text-2xl` = 20px mobile; Sign
   in `h-11 sm:h-12` = 44px mobile; the verify circle rhythm 76px mobile)
   where the clone had shipped fixed desktop values (24px, 48px, 88px) —
   drifts invisible to every existing desktop pin. Non-gaps documented:
   zero horizontal overflow anywhere, OTP boxes 40×44 parity, sub-screen
   inputs 40px parity, sub-screen submits 40px parity, Google button 54px
   parity.

5. **The copy sweep** (`copy-sweep-s16.mjs`, 20 views, both apps
   logged-in): **20/20 substance parity** — the flagged rows were all
   data-state (task counts, the reference's mutating demo account) or
   DOM-tag differences; "Add Your First Task", "All Tasks", and the
   dashboard copy all verified present/matching in the clone.

6. **The plan** (`docs/remediation-plan-session16.md`) — four families
   (the CLS pre-warm + three mobile geometry fixes), the non-gaps with
   evidence (code-splitting deliberately rejected: the eager 283 KB app
   already beats the reference's 634–1087 KB on every axis), validated
   file-by-file before execution.

7. **TDD.** RED: the `view-collections` unit pin failed on the missing
   module; the three e2e pins failed exactly as measured (48px button,
   24px h2, **CLS 0.122**). GREEN: the `INITIAL_COLLECTIONS` seam +
   the page.tsx parallel pre-warm + the responsive login-card classes.
   **One honest iteration:** the verify rhythm first shipped as circle
   `mb-3` + h2 `mt-2` and measured 68px, not 76 — adjacent-sibling margins
   COLLAPSE (max, not sum). Landed the whole rhythm on the circle
   (`mb-5 sm:mb-8`). Gates: lint ✓ tsc ✓ **154 unit** ✓ build ✓ **244
   e2e ✓** (cold db, 3.7 min) = **398 tests green** — the 241 prior pins
   untouched (mobile-only responsive fixes; ≥sm values byte-identical).

8. **Verification.** `cwv-audit-s16.mjs` re-run: dashboard **CLS 0.00 on
   all four scenarios**; mobile LCP 2428 ms (still GOOD — the data tail
   rides the auth window). **Bonus:** the reference's mobile dashboard
   finally measured (the retry logic landed it): LCP 4404 ms (POOR) +
   **CLS 0.372 (POOR)** — the reference's own mobile dashboard is the
   worst CWV performer in the matrix; the clone now leads every axis.
   Mobile geo probe: full parity. Copy sweep: still 20/20 substance.
   Drawer check: GREEN. INP proxy: 233–366 ms under the 4× CPU synthetic.

9. **Site drift observed mid-session.** The reference's login page
   rebranded to **"AcademiaFlow (Copy)"** (title + login h1) between two
   sweeps — while its own sidebar still reads "StudyFlow" and its demo
   account mutates. The owner is actively experimenting with the template;
   the clone keeps the StudyFlow identity and records the drift
   (deliberately not chased — documented in the plan's execution log).

10. **Evidence + docs.** 6 mobile captures (VLM 5/6 PASS; the dashboard
    capture's FAIL was a VLM mis-read of the glass app bar — DOM probe
    verified the bar exists, and the standing mobile-navigation e2e pin is
    the authority). README/AGENTS/CLAUDE/PAD (ADR-014)/SKILL (AP-62..63)
    aligned; `.env.example` audited — no changes (no new env vars). 3-commit
    pattern + SSH wrapper push to main.

## Suggested next surfaces

(a) The reference's branding is in flux ("AcademiaFlow (Copy)" login vs
"StudyFlow" sidebar) — re-sweep once it stabilizes and decide the identity
question then; (b) a RUM hook (`web-vitals` reporting to an in-app
endpoint) would turn the synthetic CWV guard into field data; (c) the
Docker packaging pass (DEPLOYMENT.md walkthrough of the auth env
requirements) remains untouched from the session-22 list; (d) the audit
backlog itself is empty — the next iteration is whichever surface the
owner's next session brief prioritizes.

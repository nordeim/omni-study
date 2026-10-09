# Session 26 — the S17 fresh-user journey iteration narrative

*The session-24 briefing's suggested surfaces were (a) the reference's
branding question, (b) a RUM hook, (c) Docker packaging. The audit that
actually governed this session emerged from the environment: the
reference's account was re-provisioned EMPTY on 2026-09-28 ("Account
created: 9/28/2026") — which made its zero-data surfaces measurable for
the first time in the project's history. This session executed the
fresh-user journey audit as the S17 iteration. 407 tests green
(158 unit + 249 e2e).*

---

## What happened

1. **Workspace recovery + baseline.** Fresh clone at `f3076bf` (S16
   landed). The five core docs re-read; the environment rebuilt
   (`bun install`, `.env` from `.env.example`, `db:push` + `db:seed`);
   baseline gates matched the documented state (lint ✓ tsc ✓ 154 unit ✓);
   the S16 seams verified present.

2. **The standing drawer check ran first: GREEN** (backdrop equivalence,
   288px panel, 20 links, no footer, Escape-close superset).

3. **The branding question settled** (the S16 open item): the reference's
   split is now STABLE — its document title + login h1 read "AcademiaFlow
   (Copy)" (the Base44 platform app name) while every in-app surface
   (sidebar, mobile app bar, Settings subtitle) still reads "StudyFlow".
   The clone keeps StudyFlow throughout — decided non-gap, documented.

4. **The governing discovery.** The reference account's data was wiped at
   its 2026-09-28 re-provisioning (carrying only leftover S15/S16 probe
   rows named "Audit …"). After deleting those via the reference's own UI,
   the reference's TRUE zero state became measurable: the fresh-user
   journey — every view's empty state, walked on both apps (the clone via
   fresh registrations, the register API surfacing the verification code
   per ADR-013).

5. **Findings** (all reference-measured):
   - The clone hid its Analytics/GradeTracker **stat cards** behind
     "No data yet"/"No grades yet" EmptyState blocks **the reference never
     renders** — its zero state IS the stat cards (0/0 · "0% completion
     rate" … / 0% · 0 · 0).
   - **Seven empty-state hint drifts** (Tasks/Notes/Assignments/Exams/
     Flashcards/PracticeTests/Files) — the clone had invented tails
     ("…to check what you really know.") or dropped hints entirely.
   - **The Settings tab CONTENT was never audited** (S5/S8/S9 pinned the
     Appearance cards, tab-list chrome and tab icons only): the
     reference's Profile tab persists **School Name, Grade Level (12
     options, 6th Grade → Graduate), a 1–12h Daily Study Goal, and the
     Account-created line** on its User entity (captured from its own
     PUT body — the honest way to learn a hosted app's data model), and
     its Notifications tab carries a persisted **Enable Notifications**
     master toggle.
   - The clone's register created **3 starter subjects** the reference
     never creates (its fresh journey is zero-subject — measured).
   - The reference's greeting flashes **"there"** before its user entity
     loads — a Base44 async-entity artifact; the clone's pre-warmed first
     paint renders the final name at once (the S16 superset, documented
     non-gap).

6. **The plan** (`docs/remediation-plan-session17.md`) — families A–G,
   the non-gaps with evidence (the greeting flash; the reference's
   SQUEEZED mobile two-panes — geometry probes showed its mobile
   StudyGroups clips the right pane to ~112px and its Notes to 14px; the
   clone's stacked S8-H fallbacks stay as the documented superset, copy
   parity only), validated file-by-file before execution.

7. **TDD.** RED: 3 validation-schema failures + 7 e2e failures observed
   as designed. GREEN: the 4 defaulted User columns + the preferences
   schema/route + `getCurrentUser`/`PublicUserShape`/the store's user
   slice + the settings-view five-tab rework + the seven hint fixes + the
   unconditional stat cards + the StudyGroups mobile copy + zero-subject
   registrations.

8. **Two honest iterations.** (1) The starter-subjects removal was a
   genuine discovery mid-GREEN (the S17-C spec failed on the clone's
   invented nicety). (2) The "reference stacks both panes" reading was
   corrected by geometry probes — it squeezes; the clone's stacked
   fallback stays.

9. **One live incident (AP-65b).** After `db push` + `db:generate`, the
   long-running dev server kept the OLD generated Prisma client —
   `/api/auth/me` 500'd on the new select fields and every login bounced
   back to `/login`. The standing drawer check caught it; a dev-server
   restart fixed it. (The login POST itself succeeded — the me-route
   crash broke the auth gate.) Documented in AGENTS/PAD/SKILL.

10. **The registration budget enforced.** The first full-suite run hit
    `register 429` (11 total registrations > the 10/IP/15min limiter);
    the s17 spec was consolidated to THREE fresh accounts (the S16
    one-journey convention) — total suite budget 9/10.

11. **Gates + verification.** lint ✓ tsc ✓ **158 unit ✓** build ✓
    **249 e2e ✓** (cold `db/e2e.db`, 4.3 min) = **407 tests green** — the
    244 prior pins untouched. The empty-state sweep re-run GREEN on a
    fresh clone account; the standing drawer check GREEN; the reference's
    account left tidy (its benign profile values — school "Lincoln High",
    grade "9th Grade", goal 4h, notifications on).

12. **Evidence + docs.** 7 captures (`docs/screenshots/s17-*.png`) via the
    committed `scripts/capture-s17-evidence.mjs`. README/AGENTS/CLAUDE/PAD
    (ADR-015)/SKILL (AP-64..65) aligned; `.env.example` audited — no
    changes (the new fields are DB columns, not env vars). 3-commit
    pattern + SSH wrapper push to main.

## Suggested next surfaces

(a) The reference's owner is still actively experimenting (the mid-session
login flake; the profile fields appeared with the 9/28 re-provisioning) —
re-sweep the reference's account-state surfaces when it next changes;
(b) the RUM hook (`web-vitals` reporting to an in-app endpoint) from the
session-24 list remains open; (c) the Docker packaging pass
(DEPLOYMENT.md §auth-env walkthrough) also remains open; (d) the audit
backlog is empty — the next iteration is whichever surface the owner's
next brief prioritizes.

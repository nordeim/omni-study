I'll start by carefully working through this complex multi-phase task. Let me first set up a task plan and check the workspace state.
The workspace has been reset — I need to clone the repo. Let me first check the uploaded file, then clone.
Let me read the rest of the operating instructions file.
I've internalized the operating instructions. Now let me clone the omni-study repository.
Repo cloned successfully. Now let me review the repository structure and key documentation files.
Now let me review the key documentation files. First, let me check their sizes.
Let me read the files directly in manageable chunks.
The files have very long lines. Let me use bash to read them with truncation for review purposes.
Now let me read CLAUDE.md and README.md.
Now let me read the Project Architecture Document (key sections).
Now let me read the omni-study_SKILL.md (key parts).
Now let me read the session documents and worklog.
Let me check the skills catalog and review recent session summaries for the recommended next steps.
Now let me check the current environment state — .env, db folder, and key configs.
The repo has `.env.example` and `db/` folder at root with `.gitkeep`. Now let me set up `.env` and check package.json plus test configs.
Both test configs already exist. Now let me install dependencies and set up the database.
773 unit tests green — matches the documented baseline. Now the build.
Many failures — let me check the actual error message.
The documented fresh-environment issue — the Playwright chromium cache version mismatch (needs 1243, cache has 1200). Installing per the known fix.
**1064-green baseline re-confirmed on arrival** (lint ✓ tsc ✓ 773 unit ✓ build ✓ cold-db 291 e2e ✓ 4.5m). The initial 2 failures were the documented stale-cache class; the cold re-run is fully green.

Let me update my progress and check the dev-server daemon recipe before starting the dev server.
Now let me start the dev server using the S32 daemon recipe.
Dev server is up. Now let me run the preflight and drawer check, then launch the reference-site comparison with agent-browser.
Preflight GREEN, drawer check GREEN. Now let me use the agent-browser skill for the mobile navigation walkthrough and reference comparison.
Mobile contract holds. Now let me open the drawer and verify the mobile navigation menu.
Drawer nav: 20 links, scrollable (1068 vs 755) — matches documented measurements. Let me navigate through the drawer.
The active tint reads "none" — could be the documented transition-animation race. Let me re-read after a settle delay.
The active link shows no gradient tint and gray text instead of violet. This could be the TailwindCSS v4 bug the user flagged. Let me investigate the DOM and source.
The styling lives on the inner `<span>`, not the `<a>`. Let me check the span's computed styles.
The mobile nav IS working correctly — my earlier read targeted the wrong element (the `<a>` vs the inner `<span>`). The gradient tint and violet-600 text are correct. Let me now examine the CSS mechanism for potential Tailwind v4 issues.
The CSS mechanism is sound. Let me now run the standing mobile sweep audit and then compare with the reference site.
Mobile sweep GREEN. Now let me compare with the reference site — logging in with the provided credentials.
Logged into the reference site. Let me check the reference's mobile navigation structure.
The reference's hamburger is unlabeled (the documented quirk — the clone's aria-label is the intentional superset fix). Let me open the reference drawer.
Reference drawer: 20 links, 288px panel, scrollable nav (992 vs 744) — matches the clone's structure. Let me capture screenshots of both for visual comparison.
Reference drawer auto-closes on nav, Notes renders h2 — matches clone behavior. Let me verify the reference's Settings tabs and key views.
Reference UNCHANGED since S19–S49 (title, greeting, 20-view order, five Settings tabs). Let me capture the desktop dashboard for the record.
Reference re-sweep complete. Now let me run the copy sweep comparison. Let me check what the copy sweep needs.
Let me launch the standalone server on :3200 and run the copy sweep.
Copy sweep: 14/20 MATCH with the 6 documented data-state non-gaps (the reference account is zero-data; the clone demo account is seeded) — identical to the S49 record. Let me kill the :3200 server and audit the recent code changes.
The S49 commit touched only the test/seam/probe layer (zero app code). Let me audit the recent changes in detail — starting with the S49 seam classifier.
The S49 classifier is well-formed. Let me run the dependency audit and check the standing suite runner.
Dep audit GREEN (2 documented non-production advisories). Now let me review the scandihaven repo for tech stack patterns.
The scandihaven repo shares the same skills catalog and core stack (Next.js 16 + React 19 + Tailwind v4 CSS-first + Radix + Zod + Vitest/Playwright). Let me examine the tailwind-patterns skill and the mobile-chrome source for the mobile nav.
The mobile-chrome implementation correctly handles all documented Tailwind v4 traps (backdrop-blur-xs, flex gap, custom classes). Now let me launch the standing suite (the definitive audit) with the S32 clean-window protocol.
Suite running (stage 0/31, ~105 min). While it runs, let me perform the detailed code audit — scanning for code-quality issues.
Security scan clean. Let me verify the schema model count and key contracts.
Let me verify the .env.example covers all env vars the codebase actually uses.
Let me read the session_122 summary for the recommended next steps.
I now have a clear picture. The audit shows the codebase clean and at documented parity; the remaining open question is the named next candidate: **dark × landscape × SEED cell for the 13 volume-invariant views**. Let me verify the coverage map while the suite runs.
**S50 scope confirmed**: dark × landscape (844×390) × 7 accents × SEED volume for the 13 volume-invariant views is ZERO-coverage (S40 is light-only; S48 covered only the 7 volume-affected views). Let me check suite progress and study the templates.
Now let me study the S48 probe's dark-mode lifecycle and checker (my dark doctrine template).
I have the complete template picture. Let me study the S40 classifier (the SEED-volume landscape seam) as my template.
Let me check the runner structure and the test file's insertion points.
Let me check the standing suite progress before writing the remediation plan.
The suite is running (stage 7/31). While it runs, let me write the remediation plan. First, let me review the S49 plan structure for the house style.
Let me study the S49 pin block style in the test file.
Let me examine the s49Envelope fixture to model my S50 fixture.
I now have complete understanding of the patterns. Let me write the S50 remediation plan. First, checking suite progress.
The plan is saved. Now let me start the TDD work. First, finding the exact insertion points in the seam file.
Now the TDD RED phase — writing the S50 pin block. Let me insert the fixture and describe block after the S49 block.
I notice a defect in my tint-rot pin — it references "Notes" which isn't in the 13-view set (the override would be silently ignored). Let me fix that pin.
I also have a duplicate S48 cross-check pin. Let me remove the redundant one.
Now let me run the RED phase verification.
**TDD RED verified**: 18 failed / 503 passed (521 in file) — the shape-error pins pass vacuously through the unknown-audit path, the verdict pins fail. Now the GREEN phase — writing the seam. First, the AUDIT_NAMES entry.
Now the classifier function — inserted after the S49 classifier, before the cwv section.
Now the dispatch arm.
Now the GREEN verification.
One pin correction needed — let me check how the S49 seam handles the appBar structural family.
The S49 doctrine separates the three structural checks with distinct notes. Let me refactor my S50 structural block to match.
**TDD GREEN verified**: 521/521 in the file, full unit layer **805 passed** (773 + 32 S50 pins), lint ✓ tsc ✓. Now writing the probe script.
Probe syntax OK. Now the runner's 32nd stage.
Now let me add the S50 stage to the runner.
The runner has hardcoded "/31" literals. Let me update them.
Runner updated. Let me check the arrival suite progress and start docs alignment.
Now the docs alignment. Let me update AGENTS.md carefully with precise anchors.
Now let me add the command-table row for the new probe.
AGENTS.md updated. Now vitest.config.ts, CLAUDE.md, PAD, README, and SKILL.
Now updating all the count references and adding the S50 notes.
Some patterns missed — let me check the actual encoding of those lines.
Let me verify the current state of all the doc updates.
The "773" in the session-49 row is historical (correct as-is). Now let me add the S50 notes to the remaining docs.
Let me verify the PAD's suite-verdict row count needs updating.
While the suite runs, let me write the evidence capture script. First, studying the S49 capture template.
Now let me write the S50 evidence capture script — the Exams view in dark under teal at 844×390 with the drawer open.
While the suite continues, let me write the session documents. First checking the S49 narrative structure.
The suite has ~15 stages left (~60 min). Let me verify the runner's stage count and check git status while waiting.
32 audit stages confirmed. Let me verify the full gate state after all edits.
All gates green. Let me verify .env.example is tracked in git and prepare for the wait.
**ARRIVAL STANDING SUITE: 33/33 GREEN** — the documented state validated clean. Now the exploration phase: restart the dev server for the fresh clean window, then run the genuine S50 probe.
**EXPLORATION: EXIT 0, findings 0, 2m43s** (~4.4× headroom). Let me verify the genuine envelope and classify it through the seam.
Let me verify the 1 unreadable entry is the CTA-face exemption.
The 1 unreadable is the CTA-face exemption (white on amber-500 — the S11 non-gap). Now classifying through the seam via the temporary harness.
**GREEN at the seam — FIRST try.** Now the validation protocol — restart the dev server and launch the validation suite (34 rows with the new stage).
The validation suite is running (~110 min). Let me update the remediation plan's execution log with the progress so far.
While the validation suite runs, let me monitor progress periodically.
The new S50 stage is running its first integration pass. Let me wait for the final verdict.
**VALIDATION SUITE: 34/34 GREEN** — the S50 stage green on its first integration run. Let me verify the S50 row and extract the evidence.
Deterministic counts confirmed. Now the evidence screenshot capture.
**Evidence verified in-frame**: teal gradient on the active Exams link, 20 links, nav 1068/301 scrollable, dark mode, zero flashbulbs, zero non-exempt unreadable. Now refreshing the standing captures.
Theme light/violet, zero markers. Now the final gates — build and cold-db e2e.
**ALL GATES COMPLETE = 1096 green** (lint ✓ tsc ✓ 805 unit ✓ build ✓ cold-db 291 e2e ✓). Let me save the evidence envelope and finalize the docs.
Evidence saved (34 rows, S50 GREEN). Now writing session_127 — the S50 summary.
Now finalizing the remediation plan's execution log with the validation + gates results.
Now appending the worklog entry.
Let me do a final verification of the change set and the AGENTS.md table integrity before committing.
The diff is clean (the line-21 quirk is pre-existing in the original repo, untouched by my edits). Now let me write the outer worklog and prepare the commit.
Now let me stage and create the house-style feat commit.
Commit `8aecbb6` created (46 files). Now the push phase — let me read the SSH wrapper skill doc.
Now the push phase. Writing the key, checking for ssh/paramiko availability.
Key verified (ed25519, same fingerprint as the prior sessions). Now building the paramiko ssh shim.
The shim works. Now the dry-run with the shim on PATH.
Dry-run GREEN (would land `c7ea46a..8aecbb6`). Now the real push.
**PUSH VERIFIED: remote main @ `8aecbb6` == local HEAD** ✓. Now shredding the operator key.
Push verified and tree clean. Following the established pattern, let me add the session process log as the follow-up commit.
**Both commits pushed and verified** — remote main @ `6ee1510` == local HEAD, keys shredded. Let me finalize the outer worklog and complete the todos.
**S50 complete and pushed to `main`** (`8aecbb6` feat + `6ee1510` session logs — remote verified == local, keys shredded).

**Session summary:**
- **Arrival audit**: 1064-green baseline re-confirmed; reference site **UNCHANGED** since S19–S49; **mobile navigation verified working on BOTH apps** — no Tailwind v4 bug found (all documented traps correctly handled); code review: zero app-code findings; `.env`/`DATABASE_URL`/`.env.example`/vitest/playwright contracts all verified.
- **Remediation**: closed the last zero-coverage cell — **dark × landscape × SEED for the 13 volume-invariant views** — via TDD (32 pins RED→GREEN, new probe + seam + runner stage). Exploration: 0 findings in 2m43s; validation suite **34/34 GREEN**; final gates **1096 green** (805 unit + 291 e2e).

**Next steps**: the RUM-beacon cross-axis is the last standing named candidate — one command runs everything: `bun scripts/standing-suite.mjs` (34 rows, clean window). The standing open items remain the Docker-host `compose --profile init up` and the upstream dep patches.

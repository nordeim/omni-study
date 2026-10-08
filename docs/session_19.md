I'll start Session 17 by refreshing the workspace and establishing the true current state of the repo.
Workspace has been reset. Cloning the repo fresh:
The repo is at Session 16 state with `docs/session_17.md` already present as the briefing for this session. Let me read the key documents:
Session 16 (S12 accessibility iteration, 334 tests) is complete and pushed. `docs/session_17.md` is the raw narrative of that session. This session continues with the next audit iteration. Let me read the worklog and remediation plan:
Let me read the remaining core docs:
I have a strong grasp of the core contracts. Let me set up the session plan and continue with environment validation:
Docs internalized. Now validating understanding against the codebase — environment check and baseline gates:
DB seeded. Running baseline gates:
All baseline gates green (lint ✓ · typecheck ✓ · 114 unit ✓ — matching the documented S12 state). Now let me audit the code surfaces suggested for this session:
Static audit of the AI surface complete. Now let me start the dev server and set up the audit tooling:
Logged into reference. Opening the mobile drawer to verify the standing priority:
Reference drawer confirmed: backdrop `rgba(0,0,0,0.2)`+`blur(4px)`, 288px white panel, 20 links, no footer. Now the clone:
**Standing mobile-drawer check: GREEN** — clone matches reference on every axis (backdrop oklab(0 0 0/0.2)+blur(4px) ≡ rgba(0,0,0,0.2)+blur(4px), 288px white panel, 20 links, no footer, Escape-close superset).

Now the S13 audit — probing the reference's AI surface behavior:
The reference AI responded with web-search citations — noted as a content-quality difference (hosted platform feature), not a UI gap. Now let me study the repo's audit-script conventions and build the S13 audit tooling:
Now let me verify the data-listing behavior and files-view client guards before writing the audit scripts:
Now writing the three S13 audit scripts following repo conventions:
Script bug — `PREFIX` referenced inside a serialized browser function. Fixing:
Upload audit complete — 2 findings (empty filename accepted; Content-Disposition not RFC 5987) + 8 verified non-gaps. Now the AI error audit:
The existing scripts navigate via URL rewrites (`/AIAssistant` etc.) — much more robust. Fixing my scripts:
Findings captured. Let me verify the A3 toast finding against the actual toast component DOM (hypothesis → DOM verification):
The A3 finding is likely an artifact — A2's hung fetch left `busy=true`, so A3's send() early-returned and never issued a request. Fixing the audit to reset state between probes:
A3 resolved as a non-gap (the earlier "no toast" was an artifact of A2's lingering busy state — the toast does render). Now adding cleanup of audit-created chat rows, then checking the full findings:
The Tasks h1 is "All Tasks", not "Tasks". Let me map all actual view titles:
Prisma needs full ISO datetimes, not date-only strings. Fixing:
Data-volume audit: **no findings** — the app handles 300 tasks/200 notes/250 events with zero main-thread blocking. Let me do one focused re-verify of the Events view rendering under stress (my row probe selector may have missed the markup):
All 250 stress events rendered correctly — **data-volume surface verified GREEN**. Now auditing the recent S12 code changes (the print handlers, forced-colors block, skip link):
S12 changes reviewed — solid quality. Let me verify the skills/ exclusion and consult the repo's TDD skill for the remediation methodology:
Audit phase complete. Let me check the data store's chat interface before writing the remediation plan:
Now writing the S13 remediation plan:
Now TDD execution — RED phase first. Let me check unit test conventions:
Writing the RED unit tests:
Now the RED e2e spec:
Observing the RED state — unit first:
Unit RED observed (8 designed failures). Now building for the e2e RED observation:
5 failed / 1 passed — but the C2/C3 failures look like heading-visibility timeouts, not designed REDs. Let me inspect:
A1/A2 show perfect RED (composer stays empty — the exact finding). A3 has a CSS selector quoting bug. C2/C3 need investigation — there's a server-side crash `n.name.slice` on undefined. Let me see the full errors:
Two spec bugs to fix (the documented `getByRole` substring quirk and CSS selector quoting), plus the server-side `n.name.slice` crash confirms C2 is even worse on the Bun standalone (undefined name → 500). Fixing the spec:
A1/A2/C2/C3 are proper REDs (C2 even crashes the Bun standalone with a 500 — worse than the dev-server 201). But A3 false-passed — my `/image/i` matcher hit the pre-existing "Upload Image" button. Tightening the assertion:
All RED states confirmed (5 e2e + 8 unit). Now the GREEN phase — implementing the fixes:
Now the `buildContentDisposition` seam in `src/lib/server/http.ts`:
Now the download route and the empty-name rejection:
Now the data store action + the AI view rollback (A1) with the timeout (A2):
Now the math solver (A2 timeout + A3 MIME guard) and the two AI generation call sites:
All GREEN changes applied. Running the gate sequence — lint, typecheck, unit:
The stubbed fetch ignores the abort signal — real fetch rejects on signal abort. Fixing the stub to model that:
All 123 unit tests green. Rebuilding and running the e2e resilience spec:
4/5 GREEN. A1's assertion has a spec bug — let me check what matched:
The single match is the composer textarea holding the bounced-back text (by design!). Scoping the assertion to the transcript list items:
All 5 resilience pins GREEN. Now the full regression suite:
**All 225 e2e specs pass** (220 prior untouched + 5 new). Total: 348 tests green. Now the verification phase — re-running the audits against the remediated code:
Upload audit now fully GREEN — both findings fixed. Re-running the AI error audit:
A1 fixed. A2's probe measures a 25s window — shorter than the now-installed 120s deadline, so the finding text is stale. Updating the audit script to probe deadline presence instead:
Now updating the stale A5 note in the audit script:
**All audits GREEN: 0 findings.** Now the evidence captures — writing the S13 capture script:
All captures healthy. Now docs alignment — starting with README:
Updating README with all S13 changes:
README done. Now AGENTS.md:
Now the testing quirks + test pyramid sections in AGENTS.md:
Now CLAUDE.md:
Now the PAD — ADR-011 and counts:
Now updating PAD test counts and distribution table:
Now the SKILL.md anti-pattern entries:
Now appending the execution log to the remediation plan:
Now writing the session narrative (docs/session_18.md):
Now the worklog entry at repo root:
Now the final gates and commit preparation. First verify the tree state and `.env.example`:
All gates green. Now the 3-commit pattern. First, reviewing the SSH wrapper push instructions:
Now the 3-commit pattern — commit 1 (the fix):
All 3 commits in. Now the SSH-wrapper push — materializing the operator key and checking the environment:
No OpenSSH binary — deploying the paramiko shim per Appendix A:
Paramiko is ready. Writing the shim and materializing the key:
The remote has moved ahead. Checking what's on the remote:
Remote is at `1666dfe` — our parent. The push should be a fast-forward. Let me see the full dry-run output:
The wrapper defaults to the wrong repo (`task-management`) — need `--remote` for omni-study:
Dry-run green — fast-forward `1666dfe..88c0626`. Now the real push:
**Push verified** — remote `main` @ `88c0626` == local HEAD. Shredding the operator key per the runbook:
All delivered. Cleaning up the dev daemon and updating the workspace worklog:
**Session 13 (resilience) remediation — complete, 348 tests green, pushed to `main` @ `88c0626`.**

**What I found:** your clone's happy paths were all pinned (334 tests), but none exercised *failure*. A failed AI send orphaned the user's message — rendered locally, never persisted, silently vanishing on reload with no retry. No layer carried a deadline, so a hung AI call could disable the composer forever (measured >25s). And the upload surface trusted `File.name`: empty filenames uploaded fine (a 500 crash on the Bun standalone), while unicode downloads saved as percent-encoded garbage. The data-volume stress pass (300 tasks/200 notes/250 events) audited **GREEN** — zero main-thread blocking.

**What I fixed (TDD, 9 unit + 5 e2e pins):** failed AI sends now bounce the text back into the composer (the retry affordance); all four AI call sites carry 120s `AbortSignal.timeout` deadlines with distinct "took too long" toasts; the solver guards non-image files client-side; nameless uploads get a clean 400; downloads speak RFC 5987 so `файл.txt` saves correctly. All 220 prior pins untouched — light-mode byte-parity held.

**Notable lesson (now AP-55):** my own audit tooling poisoned its later probes — a route held open forever latched the app's `busy` state, making the next "500 shows no toast" finding an artifact. Reload-between-probes fixed the audit, not the app.

**Next:** pull the repo and try it — kill your network mid-AI-send and watch the message bounce back. For another round, the suggested surfaces are offline/connectivity UX, a security pass (rate-limit coverage, cookie flags, MIME allowlist), and aria-live announcements for AI replies.

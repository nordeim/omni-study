# Session 13 Remediation Plan — AI Failure States & Upload Edge Cases

> Audit: 2026-10-08, dual-app (live reference `omni-study1.base44.app` logged in as
> `sepnetflix2023@outlook.com` vs local clone dev server; desktop 1280×800 +
> mobile 390×844). Focus chosen from the session-16 suggestion recorded in
> `docs/session_16.md`: **the AI/math surfaces under failure conditions** and
> **the files/upload surface's edge cases** — plus the third suggested surface
> (data-volume stress), which audited **GREEN** and is recorded as a verified
> non-gap.
>
> New audit tooling (all committed per the S9–S12 precedent):
> `scripts/ai-error-audit.mjs` (transport-failure / hung-backend / 500 /
> payload-edge probes over the assistant + solver), `scripts/data-volume-audit.mjs`
> (300 tasks + 200 notes + 250 events inserted via Prisma with marker cleanup,
> measuring payload size, long tasks, click latency across the 7 heavy views),
> and `scripts/upload-edge-audit.mjs` (2 MiB boundary, empty/unicode filenames,
> download round-trip, concurrency, auth).
>
> Mobile drawer (the standing priority) re-verified FIRST and **GREEN**:
> backdrop `rgba(0,0,0,0.2)` + `blur(4px)` ≡ the clone's `oklab(0 0 0 / 0.2)`
> serialization, 288px white `shadow-2xl` panel, 20 links, no footer, the
> Escape-close superset re-verified live on both apps.

## The governing discovery

The happy paths are all pinned — 334 tests say so. What none of them exercise
is **what the app does when the network or the model fails**: the AI surfaces
are optimistic (the user's message renders before the server confirms), the
SDK calls have **no deadline anywhere** (client or server), and the upload
surface trusts `File.name` more than it should. Three families of findings,
all superset territory (the reference's hosted AI fails opaquely — a spinner
with no recovery — and its upload surface was not reachable for boundary
probing):

- **Optimism without rollback:** a failed AI send leaves the user's message
  rendered from local state, never persisted — it silently vanishes on the
  next reload. The user has no retry affordance and no explanation beyond a
  6-second toast.
- **No deadline:** a hung SDK call keeps the composer disabled and
  "Thinking…" on screen indefinitely (measured > 25 s with no recovery; there
  is nothing to recover *to*). All four AI surfaces (chat, solver, card
  generation, question generation) share the flaw through `apiSend`.
- **Trust without validation:** the upload route accepts a `File` with an
  **empty name** (an unlabeled row in Files), and the download route emits a
  `Content-Disposition` whose non-ASCII filename is `encodeURIComponent`-quoted
  inside `filename="…"` instead of RFC 5987 `filename*=UTF-8''…` — browsers
  show the percent-encoded string as the literal save name.

## Family A — AI-surface failure states (S13-A, 3 findings)

| # | Surface | Measured (evidence) | Fix |
|---|---|---|---|
| A1 | **AI chat failed send orphans the user message** (`aiassistant-view.tsx` `send()`): `appendChat(local-…)` runs BEFORE the POST; on failure the catch only toasts | route-aborted send → message rendered; reload → message gone (never persisted); no retry affordance. Probe: `scripts/ai-error-audit.mjs` A1 | On failure, **remove the optimistic message and restore the composer text** (`setInput(content)`) — the bounced-back text IS the retry affordance. Requires a `removeChatMessage(id)` store action (the store currently has append/clear only) |
| A2 | **No client timeout on any AI call** (`src/lib/api.ts` `apiSend` → fetch with no signal; used by chat, solver, generate-cards, generate-questions) | route held open 25 s+ → composer still disabled, "Thinking…" still shown, no cancel affordance. Probe: A2 | `apiSend`/`apiGet` gain an optional `{ timeoutMs }` opt implemented with `AbortSignal.timeout()`; the four AI call sites pass `AI_TIMEOUT_MS = 120_000` (LLM completions legitimately run 30–60 s — the deadline must be generous); a `isTimeoutError(err)` helper maps the DOMException to a specific "took too long" toast. The **mechanism** is unit-pinned with a short timeout against a hung fetch; the **recovery UX** is e2e-pinned via route-release |
| A3 | **Math solver image guard mismatch** (`mathsolver-view.tsx` `pickImage` guards 4 MB, no MIME check; the server schema caps the base64 string at 6 MB) | A 4–6 MB image is client-rejected but server-acceptable — the caps look inconsistent until you notice the units differ (file bytes vs base64 string); and a non-image picked via "All files" in the OS dialog reaches the server before failing | Client gains `file.type.startsWith("image/")` guard (immediate toast, no request); the 4 MB client cap is CORRECT and stays (4 MB file → ~5.3 MB base64 < the 6 MB server cap — base64 inflates ~33%); a comment documents the unit relationship so the "mismatch" is never re-flagged |

## Family B — data-volume stress: VERIFIED NON-GAP (S13-B)

The seed's datasets are small (tens of rows); the stress pass inserted **300
tasks / 200 notes / 250 events** and measured the 7 heaviest views:

- API: `/api/tasks` grew 2.4 KB → 113 KB (≈370 B/row) — under any reasonable
  payload concern; all responses 200.
- Rendering: **zero long tasks** (PerformanceObserver, > 50 ms) on Tasks
  (7 894 main-DOM nodes), MyDay (3 381), Events (3 133 — all 250 rows render,
  marker-verified), Notes (2 425), Dashboard/Calendar/Analytics (< 700 each).
- Interactivity: nav-click latency 30–60 ms real (the 400 ms floor is the
  probe's settle wait) on every stressed view.

The PAD's "no query library needed for this scale" claim (ADR in
Project_Architecture_Document.md) is now **empirically backed at 3–10× the
seed's volume**. Documented in this plan + the AGENTS/PAD notes; no code
change.

## Family C — upload edge cases (S13-C, 2 findings)

| # | Surface | Measured (evidence) | Fix |
|---|---|---|---|
| C2 | **Empty filename accepted** (`files/route.ts` POST: `file.name.slice(0, 200)` does not guard emptiness) | `new File([bytes], "")` uploads → 201, stored `name: ""` → an unlabeled row in the Files view. Probe: `scripts/upload-edge-audit.mjs` C2 | Reject with 400 `"File name cannot be empty"` when `!file.name.trim()` |
| C3 | **Content-Disposition is not RFC 5987** (`files/[id]/route.ts` GET: `filename="${encodeURIComponent(name)}"`) | Download of `файл-τésu" quote.txt` → `filename="s13-edge-%D1%84%D0%B0%D0%B9%D0%BB-…"` — browsers save the percent-encoded string as the literal name. Probe: C3 | Extract a pure `buildContentDisposition(name)` seam: an ASCII-safe fallback in the quoted `filename=` PLUS `filename*=UTF-8''<pct-encoded>` (the RFC 5987 form every modern browser prefers). Unit-pinned across ASCII / unicode / quote-backslash names |

## Verified non-gaps (do NOT "fix")

1. **The exact 2 MiB boundary is correct on both sides:** 2 097 152 bytes →
   201; 2 097 153 bytes → 413 with the actionable "add it as a link instead"
   message (`>` not `>=` — the boundary is inclusive, matching the client's
   identical check).
2. **Upload byte round-trip is exact:** a 24-byte binary uploaded and
   downloaded back compares byte-for-byte (SQLite base64 round-trip).
3. **5 concurrent uploads all succeed** (5 × 64 KiB parallel POSTs → 5 × 201).
4. **Folder scoping enforced:** upload with a nonexistent `folderId` → 400
   "Folder not found".
5. **Multipart shape validated:** missing `file` field → 400; non-multipart → 400.
6. **Auth enforced on every probed route** (upload/math-solve → 401 with
   `credentials: "omit"`).
7. **`GET /api/files` returns metadata only** — the base64 payload never
   appears in the list response.
8. **Math solver server validation is solid:** non-image data URL → 400 (the
   regex fires), empty problem → 400, > 2000 chars → 400, unauthenticated → 401.
9. **A 500 from the AI route DOES toast and recover** (the first audit run's
   "no toast" was an artifact of the prior probe's lingering `busy` state —
   reload-isolation between probes fixed the audit, and the finding dissolved;
   textbook VLM/DOM-hypothesis discipline applied to our own tooling).
10. **The composer re-enables after a failed/aborted send** (the `finally`
    block works — the busy-state bug is only the hung-request case, A2).
11. **Data-volume stress (Family B above): GREEN.**
12. **The reference's AI does web-search with citation markers** (`[3, 7]` in
    its reply text) — a hosted-platform content feature; the clone's
    SDK-driven AI is the documented superset story (three AI surface routes
    the reference lacks entirely). Visual parity is unaffected. Not a gap.

## Codebase alignment (validated file-by-file before execution)

| Planned change | File(s) | Validated against |
|---|---|---|
| `removeChatMessage(id)` store action | `src/lib/data.ts` (DataState + impl, next to `appendChat` at L352) | the store's shape: `chat: AiChatMessage[]`, actions are plain `set` calls; `id` equality suffices (optimistic ids are `local-${Date.now()}` — unique per send) |
| A1 rollback in `send()` | `src/components/views/aiassistant-view.tsx` (catch block L64-68) | `send()` currently: `setInput("")` + `appendChat` before fetch; the catch has access to `content` and the local id if captured before the try |
| `timeoutMs` opt + `isTimeoutError` | `src/lib/api.ts` (`apiGet`/`apiSend` signatures) | both are 2-3-arg functions today; the opt is appended (backwards-compatible — no other call site changes); `AbortSignal.timeout()` is supported in the browser matrix and Node ≥ 17.3 |
| Timeout at the 4 AI call sites | `aiassistant-view.tsx`, `mathsolver-view.tsx`, `flashcards-view.tsx` (generate-cards), `practicetests-view.tsx` (generate-questions) | all four call `apiSend`/`apiSend`-equivalent today; flashcards/practicetests catch `err instanceof Error` — `isTimeoutError` composes there |
| A3 MIME guard + comment | `mathsolver-view.tsx` `pickImage` (L47-59) | the `<input accept="image/*">` filters the picker UI but NOT drag-ins/OS-dialog "All files"; the guard is one `startsWith` check + toast + return |
| C2 empty-name rejection | `src/app/api/files/route.ts` POST (after the `instanceof File` check, before size check) | mirrors the existing early-return error style (`jsonOk({ error }, { status })` — note this route's local convention returns errors via `jsonOk` with status, NOT `jsonError`; follow the file's own pattern) |
| C3 `buildContentDisposition` | new pure export in `src/lib/server/http.ts` (server-only module — correct seam); used by `files/[id]/route.ts` GET | the route builds the header inline today; the helper is pure string logic (no DOM/Request deps) so it unit-tests cleanly in `tests/files.test.ts` |
| RED specs | `tests/e2e/resilience.spec.ts` (new), `tests/files.test.ts` (new) | follows the spec-file conventions (storageState login, unique row stamps, route unroute-in-finally per the S11 leaked-route lesson) |

## TDD execution order

1. **Unit RED** (`tests/files.test.ts`): `buildContentDisposition` — ASCII
   name → `filename="name.txt"` + `filename*=UTF-8''name.txt`; unicode name →
   ASCII-safe fallback + correctly percent-encoded `filename*`; embedded
   quote/backslash → escaped/neutralized in the fallback; empty name →
   `filename="download"` fallback (never an empty quoted string).
   Expected RED: the function doesn't exist yet.
2. **Unit RED** (`tests/api-timeout.test.ts`): `apiSend("POST", …, { timeoutMs: 30 })`
   against a stubbed hanging `fetch` rejects within ~500 ms and
   `isTimeoutError(err)` is true; without the opt, the same stub never rejects
   (asserted via a racing timer, not an infinite await). Expected RED: no
   `timeoutMs` opt exists.
3. **E2E RED** (`tests/e2e/resilience.spec.ts`):
   - A1 pin: abort `/api/ai/chat`, send, expect the message to be REMOVED and
     the composer to hold the text again (currently: message stays, composer
     empty) — fails today.
   - A2-recovery pin: hold the route, send, expect "Thinking…"; fulfill with
     500, expect the busy indicator gone + composer re-enabled (currently
     passes ONLY after the A1 fix removes the orphan; before it, the orphan
     remains — run order makes this a compound RED).
   - A3 pin: pick a non-image via `setInputFiles` on the hidden input with a
     text/plain file → expect a toast mentioning image, and ZERO requests to
     `/api/math/solve` (request counter) — fails today (no client guard).
   - C2 pin: multipart POST with an empty filename → expect 400 (currently 201).
   - C3 pin: upload a unicode-named file, GET the download → expect a
     `filename*=UTF-8''` header (currently absent).
4. **GREEN per family:** store action + view rollback (A1) → api.ts timeout +
   four call sites (A2) → MIME guard (A3) → route guard (C2) →
   `buildContentDisposition` + route use (C3).
5. **Full gates:** `lint → typecheck → test → build → test:e2e` (the e2e layer
   runs against the standalone build — rebuild after every GREEN step that
   touches src, per the standing quirk).

## Risks & guards

- **The timeout must not fire on legitimate slow completions.** 120 s is
  ~2–4× the worst observed completion time (max_tokens 1200–2400); the unit
  pin uses 30 ms against a stub to test the MECHANISM, never the constant.
- **`AbortSignal.timeout` and Playwright:** the e2e A2-recovery pin releases
  the route long before 120 s — the timeout never fires in the suite (no
  flake surface); the mechanism is unit-pinned instead.
- **The A1 rollback changes observable error-state DOM** (message removed) —
  no prior spec pins the failed-send DOM (the S12 pins cover default media),
  so no regression surface; the NEW pin owns the behavior.
- **`jsonOk` vs `jsonError` in files/route.ts:** the file's local convention
  is `jsonOk({ error }, { status })` — follow it (consistency over purity;
  the envelope shape `{"error": …}` is identical either way).
- **Empty-name e2e row cleanup:** the C2 pin uploads nothing (rejected), the
  C3 pin's row is deleted in a finally; both follow the unique-stamp
  convention.
- **`removeChatMessage` id capture:** the optimistic id must be captured in a
  variable BEFORE the try (closure over the same string), or the catch can't
  address the row.

## Execution log (post-execution addendum)

**RED observed (2026-10-08).** Unit: `tests/files.test.ts` 5/5 failed (the
`buildContentDisposition` seam did not exist) and `tests/api-timeout.test.ts`
3/4 failed as designed (no `timeoutMs` opt — the hanging-fetch stub timed the
tests out at 5 s; `isTimeoutError is not a function`). One stub fix during
RED: the first fetch stub ignored `init.signal`, so even a correct
implementation could never reject — the stub now rejects with the signal's
reason when it fires (modeling real fetch abort semantics). E2E:
`tests/e2e/resilience.spec.ts` — A1/A2 failed at the composer-value poll
(`Expected "resilience probe A1" / Received ""` — the orphan stays and the
text is gone: exactly the finding), C2 failed with the **Bun-standalone
variant of the bug** (`[api] unhandled error: TypeError: undefined is not an
object (evaluating 'n.name.slice')` — the empty name arrives as `undefined`
under Bun, a 500 crash; the dev runtime had stored `""`), C3 failed on the
absent `filename*` header. Two spec fixes during RED: `getByRole("heading",
{ name: "Files" })` needed `exact: true` (the documented substring quirk —
"No files yet" also matches) and the A3 selector needed quoting
(`accept="image/*"`). A3 false-passed once (the loose `/image/i` matcher hit
the pre-existing "Upload Image" button label) — tightened to the specific
toast wording before GREEN.

**GREEN per family.** A1: `removeChatMessage(id)` store action + the
`send()` rollback (capture `localId` before the try; on failure remove +
`setInput(content)`; timeout errors get their own toast). A2: `apiSend`/
`apiGet` gained `{ timeoutMs }` via `AbortSignal.timeout` +
`isTimeoutError(err)`; all four AI call sites pass `120_000`. A3: the
`pickImage` MIME guard (`file.type.startsWith("image/")` → "Please choose an
image file") + the unit-relationship comment (4 MB file ≈ 5.3 MB base64 <
the server's 6 MB string cap — different units, not an inconsistency). C2:
the empty/whitespace-name 400 before the size check. C3: the pure
`buildContentDisposition` seam in `src/lib/server/http.ts` + the route use.

**Gates.** lint ✓ · tsc ✓ · **123 unit ✓** (114 + 9 new) · build ✓ ·
**225 e2e ✓** (cold db, 220 prior + 5 new; the full suite ran once — all 220
prior pins untouched, light-mode byte-parity held) = **348 tests green**.

**Verification re-runs.** `upload-edge-audit.mjs`: **0 findings, 10
non-gaps** (empty-name rejected 400; `filename*=UTF-8''` present with the
ASCII-safe fallback; boundary/concurrency/round-trip/auth all green).
`ai-error-audit.mjs`: **0 findings, 10 non-gaps** — after two audit-tooling
fixes: the A2 probe now verifies deadline PRESENCE (a fetch spy records the
abort signal on the outgoing request) instead of waiting past 120 s, and the
A5 note was re-classified as the documented non-gap (the caps are different
units). The A1 orphan check now passes (message removed + composer bounced
back). The 500-toast behavior re-verified GREEN (the first run's "no toast"
was the latched-busy artifact — now AP-55).

**Evidence.** 4 captures via `scripts/capture-s13-evidence.mjs`:
`s13-ai-chat-rollback.png` (the bounced-back composer + error toast),
`s13-math-solver-mime-guard.png` (the rejection toast),
`s13-mobile-drawer.png` (the standing priority on the remediated build),
`s13-files-view.png`.

**Docs aligned.** README (badge 348, the Resilience feature row, counts
123/225, the plan entry + project-status rows, the files-API row), AGENTS.md
(4 new commands + the RESILIENCE contract + 4 testing quirks), CLAUDE.md
(the resilience contract + pyramid updates), PAD (ADR-011 + counts +
distribution rows), SKILL.md (AP-53..55 + counts). `.env.example` audited —
matches `.env`, no changes needed.

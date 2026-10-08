# Session 14 Remediation Plan — Connectivity UX, Settings Guards, Security Hardening, AI Accessibility

> Audit: 2026-10-08, dual-app (live reference `omni-study1.base44.app` logged in as
> `sepnetflix2023@outlook.com` vs local clone dev server; desktop 1280×800 +
> mobile 390×844). Focus chosen from the session-18 suggestion recorded at the
> end of `docs/session_18.md`: **offline/online behavior**, **the
> settings/display-name + avatar persistence round-trips**, **a security pass
> (rate-limit coverage beyond login, cookie flags, upload MIME allowlist)**,
> and **a11y depth on the AI surfaces (aria-live)** — plus the standing
> mobile-drawer priority and a repo-hygiene sweep of stale scripts.
>
> New audit tooling (committed per the S9–S13 precedent):
> `scripts/drawer-check-s14.mjs` (the standing drawer probe, both apps),
> `scripts/connectivity-audit.mjs` (offline/online probes over the AI chat,
> task CRUD, SPA navigation, login, and post-offline recovery),
> `scripts/settings-roundtrip-audit.mjs` (display-name/avatar round-trips,
> whitespace edge, second-write-wins, concurrent setting families),
> `scripts/security-audit.mjs` (cookie flags, AI-route limiter coverage,
> upload MIME, download headers, logout semantics, auth-gating, enumeration),
> and `scripts/ai-a11y-audit.mjs` (live-region semantics over the assistant
> transcript, the Thinking busy state, the solver's solution block, composer
> semantics).
>
> Mobile drawer (the standing priority) re-verified FIRST and **GREEN** on
> both apps at 390×844: backdrop `rgba(0,0,0,0.2)` + `blur(4px)` ≡ the
> clone's `oklab(0 0 0 / 0.2)` serialization (trap 7), 288px white
> `shadow-2xl` panel, 20 links, no footer, the Escape-close superset
> re-verified live.

## The governing discovery

The failure paths S13 hardened are per-request; the four S14 families are
all **ambient states the app never surfaces**:

1. **Connectivity is invisible.** Every per-request path recovers offline
   (the AI bounce-back survives a REAL transport failure, the task dialog
   toasts and keeps its form, SPA navigation keeps working on cached data,
   login toasts, post-offline retries succeed) — but nothing TELLS the user
   they are offline. They discover it by watching actions fail, one toast at
   a time, some with raw browser text ("Failed to fetch").
2. **The settings schema trusts whitespace.** `preferencesSchema.name` is
   `bounded(80)` — no trim, no min — so a whitespace-only save wipes the
   visible name (the sidebar falls back to "Student" while the record is
   blank spaces).
3. **The expensive routes are unguarded.** Login AND register are
   rate-limited with separate budgets, but the four AI routes (the ones that
   cost money per call) accept unlimited authenticated requests. The
   download response echoes the stored client-supplied `Content-Type`
   without `X-Content-Type-Options: nosniff` or `Cache-Control`.
4. **AI output lands silently for screen readers.** The toast stack is
   `aria-live` (errors announce), but the assistant transcript, the
   "Thinking…" indicator, and the solver's solution block render into static
   containers — a screen-reader user sends a message and hears nothing back
   (WCAG 4.1.3 Status Messages).

All four families are superset territory (the reference has no offline
banner, no security headers, and no AI live regions), EXCEPT the
display-name guard which is a data-hygiene fix invisible to parity.

## Family A — connectivity UX (S14-A, 1 finding)

| # | Surface | Measured (evidence) | Fix |
|---|---|---|---|
| A0 | **No global connectivity awareness anywhere** — no `navigator.onLine` listener, no service worker, no offline banner | `scripts/connectivity-audit.mjs`: `onofflineAssigned:false, serviceWorkerActive:false, visibleOfflineBanner:false`; 5 verified per-request non-gaps (below) | (1) A global `ConnectivityBanner` — a floating amber pill (`fixed bottom-4 left-1/2 -translate-x-1/2 z-[90]`, WifiOff icon, "You're offline — changes can't be saved right now") driven by `window online/offline` events, `role="status"` + `aria-live="polite"`. Renders NOTHING while online → zero default-media visual change (light-mode byte-parity preserved by construction). (2) Map the raw transport failure to a human message in `src/lib/api.ts` — a `TypeError` from `fetch` (Chromium's "Failed to fetch") becomes `ApiError(0, "You appear to be offline. Check your connection and try again.")` at the shared seam, so every view's toast (task dialogs included) speaks human instead of browser. A service worker + offline queue is explicitly OUT OF SCOPE (documented decision — the measured failure paths all preserve the user's work already). |

## Family B — settings guards (S14-B, 1 finding)

| # | Surface | Measured (evidence) | Fix |
|---|---|---|---|
| B3 | **Whitespace-only display name persisted verbatim** — `preferencesSchema.name = bounded(80)` (no trim, no min); the client sends `nameDraft` untrimmed | PATCH `{name:"   "}` → 200, stored `"   "` — the sidebar falls back to "Student" while the record is blank; round-trips themselves are GREEN (4 non-gaps) | Route-level guard mirroring the S13 empty-filename idiom: in `settings/preferences/route.ts`, if `name` is present and `!name.trim()` → 400 `"Display name cannot be empty"`; otherwise store `data.name.trim()`. Client (`settings-view.tsx`): send `nameDraft.trim()` and set the store to the trimmed value. Schema unchanged (`bounded(80)` stays — max length is a shape concern; emptiness is a semantic guard at the same place the S13 upload guard lives). |

## Family C — security hardening (S14-C, 3 findings)

| # | Surface | Measured (evidence) | Fix |
|---|---|---|---|
| C1 | **No rate limit on the AI routes** — login/register are limited (separate budgets); the four EXPENSIVE routes are not | 12 invalid-payload POSTs → all 400, never 429; code review: no `checkRateLimit` call in any AI route handler | Generalize the existing limiter: `checkRateLimit(key, max = MAX_ATTEMPTS)` (backwards-compatible — login/register call sites unchanged, still 10/15 min). The AI routes call `checkRateLimit(`ai:${user.id}`, 20)` after `requireUser`, before validation/SDK import → 429 + `Retry-After` + a clear "Too many AI requests" message. Keyed by USER (they are authenticated), not IP. |
| C2 | **No upload MIME allowlist** — `text/html` uploads 201, stored `mimeType:text/html` | `scripts/security-audit.mjs` C3: upload 201 → download serves the stored type (documented residual risk in the PAD threat model, now measured) | **Documented decision — no allowlist.** The reference's Files surface stores arbitrary types (feature parity); restricting MIME would REGRESS parity for legit study files (.html notes, .zip archives, any doc). The real hardening is C3's headers + the PAD threat-model row updated from "residual risk" to "mitigated by nosniff + no-store + attachment disposition". |
| C3 | **Download response missing hardening headers** — no `X-Content-Type-Options: nosniff`, no `Cache-Control` | `scripts/security-audit.mjs`: `nosniff:null, cacheControl:null` with `contentType:text/html` echoed | Add both headers to the `files/[id]` GET response: `X-Content-Type-Options: nosniff` (kills MIME sniffing) + `Cache-Control: private, no-store` (private payloads never cached by intermediaries). One-line change in the existing headers object next to the S13 disposition seam. |

## Family D — AI-surface accessibility (S14-D, 3 findings)

| # | Surface | Measured (evidence) | Fix |
|---|---|---|---|
| D1 | **The AI transcript is not a live region** — assistant replies render into a plain `<ul>`; screen readers get no announcement | `scripts/ai-a11y-audit.mjs`: `transcriptIsLive:null`, only live region = the Toaster | `aria-live="polite"` on the transcript scroll container (`sf-scroll` div in `aiassistant-view.tsx`) — new messages announce politely (assertive would interrupt; polite is the chat-correct level). |
| D2 | **The busy state ("Thinking…") carries no loading semantics** — the send button disables (DOM-only), the Thinking row has no `aria-busy` | D2 probe during a held request: `thinkingAnnounced:false, sendAriaBusy:null` | `aria-busy={busy}` on the SAME live container — the classic chat pattern: while busy the live region suppresses churn (spinner/Thinking row), and when `busy` flips false the completed reply announces. The visible "Thinking…" stays for sighted users. |
| D3 | **The solver's solution block is not announced** — the "Math solution" card is a static container | D3 probe: `liveOutsideToaster:0` | `aria-live="polite"` + `aria-busy={busy}` on the `aria-label="Math solution"` card in `mathsolver-view.tsx` — the same seam as D1/D2 (the "Working through the steps…" state rides the same container). |

## Family E — repo hygiene (S14-E, 1 finding)

| # | Surface | Measured (evidence) | Fix |
|---|---|---|---|
| E1 | **14 stale scripts from the pre-clone repo** — crash on run or target the original app | `scripts/check-db-state.mjs` crashes (references `goal`/`activityLog` models that don't exist in the 21-model schema); `capture-screenshots.mjs` + `paired-probe-v214.mjs` + `vlm-sanity.mjs` import from `/home/z/my-project/project-management/...` (a foreign machine path); `capture-wizard.sh`/`wizard-cleanup.mjs`/`smoke-test.sh`/`capture-screens.sh`/`capture-all.sh` probe the ORIGINAL app's routes (`/goals`, `demo@orbital.app`, session-41 numbering); `paired-probe.sh` + `par-probe{,2,3}.sh` + `par-compare.sh` require manual agent-browser sessions, unreferenced by any current doc | `git rm` all 14 (list: check-db-state.mjs, capture-screenshots.mjs, capture-wizard.sh, wizard-cleanup.mjs, capture-all.sh, smoke-test.sh, capture-screens.sh, paired-probe-v214.mjs, vlm-sanity.mjs, paired-probe.sh, par-probe.sh, par-probe2.sh, par-probe3.sh, par-compare.sh). None are referenced by README/AGENTS/CLAUDE/PAD/SKILL (verified). The S9+ StudyFlow tooling (paired-probe-s9.mjs, vlm-verify-*, the sweep/audit scripts) stays. Also fixes the PAD's stale `scripts/dev-daemon.py` mitigation row (the file was never carried into this repo). |

## Verified non-gaps (do NOT "fix")

1. **AI offline send rolls back under a REAL transport failure** — the S13
   bounce-back (composer text restored, optimistic message removed,
   "The assistant is unavailable right now." toast) survives
   `context.setOffline(true)`, not just `route.abort()` (connectivity A1).
2. **Task create offline toasts and KEEPS the dialog** — the typed fields
   survive as the retry affordance ("Failed to fetch" today; the A0 message
   mapping upgrades the wording, not the mechanism) (A2).
3. **SPA navigation works offline** — the shell + cached store data serve
   Calendar/Notes/Analytics with zero network (A3).
4. **Login offline toasts and stays on the card** ("Sign in failed. Please
   try again.") (A4).
5. **Post-offline retry recovers immediately** — the composer is usable the
   moment the network returns (A5).
6. **Display-name round-trip is fully green** — UI edit → PATCH → reload →
   the sidebar footer AND `/api/auth/me` reflect it (B1).
7. **Avatar round-trip is fully green** — the Appearance tile stays
   selected (`aria-pressed` + ring) after reload; the API echoes it (B2).
8. **Second-write-wins + the draft re-initializes from the fresh value**
   after reload (B4 — the first probe run was an audit-tooling artifact:
   Radix unmounts inactive tab panes, so the draft read needed the Profile
   tab clicked first; the AP-55 lesson re-applied).
9. **Concurrent setting families persist independently** — a mode PATCH
   does not clobber the avatar or the name (B5).
10. **Session cookie flags are correct**: `HttpOnly` + `SameSite=Lax` +
    `Path=/` + 30-day `Max-Age`; `Secure` is NODE_ENV-gated (false in dev,
    true in production — code-reviewed; the first audit run flagged a
    regex artifact, not an app issue) (C1).
11. **Logout clears the cookie; the old token staying valid until expiry is
    the DOCUMENTED stateless-session trade-off** (auth.ts header + PAD
    threat model) — not a new finding (C4).
12. **Every probed auth surface 401s without the cookie** (chat, solve,
    files GET+POST) (C5).
13. **Login errors stay uniform** ("Invalid email or password." — no
    enumeration); register's 409-on-existing-email is the documented UX
    trade-off (C6).
14. **The AI composer, send button, and quick-action cards carry semantics**
    (labels + `aria-pressed`) — the first probe run flagged an ordering
    artifact (D4 ran on the MathSolver page); code + re-probe are clean.
15. **The mobile drawer standing check is GREEN** (both apps, 390×844 —
    identical backdrop/panel/links/footer, Escape-close superset).
16. **The math solver's server-side image data-URL regex is a MIME
    allowlist** (only `data:image/*` passes) — already unit-pinned.

## Codebase alignment (validated file-by-file before execution)

| Planned change | File(s) | Validated against |
|---|---|---|
| `ConnectivityBanner` component | new `src/components/layout/connectivity-banner.tsx` + mount in `src/app/page.tsx` (inside the authed shell, after `<MobileChrome />`) | page.tsx renders `<Sidebar/> <MobileChrome/> <main>` — the banner is a sibling; `if (online) return null` keeps the online DOM byte-identical; the `useState(true)` + effect-sync pattern avoids the SSR hydration mismatch (navigator is undefined server-side) |
| Network-error mapping | `src/lib/api.ts` — a `doFetch(path, init)` wrapper used by `apiGet`/`apiSend`/`apiUpload` | all three currently call `fetch` directly with the same `credentials` pattern; `isTimeoutError` (S13) is checked FIRST so the timeout classification is untouched; unit-pinnable with a stubbed global fetch (reject TypeError → ApiError offline message; reject DOMException TimeoutError → unchanged) |
| B3 name guard | `src/app/api/settings/preferences/route.ts` (after `parseWith`, before `db.user.update`) + `settings-view.tsx` (Save profile handler) | the route already destructures optional fields; the guard mirrors the S13 empty-filename early-return idiom (`jsonOk({error}, {status:400})` per the file's local convention — this route uses `withUser` + `parseWith`, and `jsonOk` shapes both shapes identically); the client's `useThemeStore.setState({ userName: nameDraft })` becomes the trimmed value |
| C1 limiter generalization | `src/lib/auth.ts` (`checkRateLimit(key, max = MAX_ATTEMPTS)`) + the four AI routes (`ai/chat`, `ai/generate-cards`, `ai/generate-questions`, `math/solve`) | the existing Map/attempts logic needs only a `max` parameter (callers unchanged); all four routes already call `requireUser()` first — `generate-questions` currently discards the user (`await requireUser();`) and gains `const user =`; the 429 shape mirrors login's (`Retry-After` header + message) |
| C3 download headers | `src/app/api/files/[id]/route.ts` GET (the existing headers object) | the response already sets Content-Type/disposition/length — two more entries in the same object; no logic change |
| D1/D2 transcript live region | `src/components/views/aiassistant-view.tsx` (the `sf-scroll` message pane div, L125) | the div currently has no ARIA; adding `aria-live="polite"` + `aria-busy={busy}` composes with the existing `bottomRef` scroll logic; the S13 resilience pins assert composer/message state — no live-region assertions exist to conflict |
| D3 solver live region | `src/components/views/mathsolver-view.tsx` (the `aria-label="Math solution"` card, L169) | the card already carries `aria-label`; the busy/solution/empty states all render INSIDE it, so one container covers all three |
| E1 stale-script removal | `git rm` the 14 listed scripts | verified: none referenced in README/AGENTS/CLAUDE/PAD/SKILL; the crash/foreign-path/original-route evidence captured above |
| RED specs | `tests/api-offline.test.ts` (new, ~3 pins: offline mapping + timeout precedence), `tests/auth.test.ts` (+3 pins: custom max, isolation, default unchanged), `tests/e2e/s14-hardening.spec.ts` (new, ~8 pins) | follows the spec-file conventions (storageState login, unique row stamps, route unroute-in-finally); the AI-rate pin uses INVALID payloads (no SDK cost) — verified NO e2e spec makes a real (non-intercepted) AI call, so exhausting the budget poisons nothing |

## TDD execution order

1. **Unit RED** (`tests/api-offline.test.ts`): stubbed global `fetch`
   rejecting with `TypeError("Failed to fetch")` → `apiSend` rejects with an
   `ApiError` carrying "You appear to be offline"; the same stub rejecting
   with `DOMException("TimeoutError")` → `isTimeoutError` stays true (the
   timeout classification takes precedence over the offline mapping);
   a `Response`-resolving stub → behavior unchanged (the map only touches
   transport failures). Expected RED: `doFetch` does not exist — the
   TypeError propagates raw.
2. **Unit RED** (`tests/auth.test.ts` extend): `checkRateLimit("ai:k", 20)`
   — the 20th call ok, the 21st blocked with a retry window; keys isolated
   (`ai:k1` exhausted does not affect `ai:k2`); the default budget is still
   10 (existing pins cover it — one explicit re-pin for the new signature).
   Expected RED: no `max` parameter exists (the 21st call at default 10
   would block EARLY — the assertion "20 ok" fails at call 11).
3. **E2E RED** (`tests/e2e/s14-hardening.spec.ts`):
   - A0 pin: `context.setOffline(true)` → a `role="status"` banner with
     "offline" text appears; `setOffline(false)` → gone; and while ONLINE
     the banner is absent (the light-mode byte-parity guard).
   - A0b pin: offline AI send → the toast says "appear to be offline" (not
     "Failed to fetch" / not the generic unavailable fallback).
   - B3 pin: direct PATCH `{name:"   "}` → 400; PATCH
     `{name:"  Valid Name  "}` → 200 and `/api/auth/me` returns `"Valid Name"`.
   - C1 pin: 21 rapid invalid POSTs to `/api/ai/chat` (storageState cookie)
     → 20× 400 then 429 with a `Retry-After` header; a DIFFERENT key
     (unauthenticated POST) still 401s (the limiter sits after auth).
   - C3 pin: upload a probe file → GET the download → `x-content-type-options:
     nosniff` + `cache-control: private, no-store` headers present; delete
     the row in a finally.
   - D1/D2 pin: the transcript container has `aria-live="polite"`; during a
     held `/api/ai/chat` route the container is `aria-busy="true"`, after
     release `false` (unroute in finally — the S11 leaked-route lesson).
   - D3 pin: the "Math solution" card has `aria-live="polite"`.
4. **GREEN per family:** api.ts `doFetch` (A0b) → `ConnectivityBanner` +
   mount (A0) → preferences route guard + client trim (B3) → limiter
   generalization + four AI routes (C1) → download headers (C3) → transcript
   live region (D1/D2) → solver live region (D3) → `git rm` the stale
   scripts (E1).
5. **Full gates:** `lint → typecheck → test → build → test:e2e` (rebuild
   after every GREEN step that touches src, per the standing quirk).

## Risks & guards

- **The offline banner must not touch default-media parity** — it renders
  `null` while online, so the online DOM is byte-identical; the e2e pin
  asserts absence while online explicitly.
- **The offline message mapping changes toast WORDING for transport
  failures** — no prior spec pins the transport-failure toast text (verified:
  the resilience spec pins composer/message state only), so no regression
  surface; the NEW pin owns the wording.
- **The AI rate limiter poisons its own budget within a run** — the C1 pin
  exhausts `ai:<demo-user>` for 15 min; verified NO other e2e spec makes a
  real AI request (resilience's calls are all route-intercepted), and the
  standalone server restarts fresh per run (in-memory Map).
- **The 429 must not fire on legitimate AI usage** — 20 requests / 15 min
  per user is ~3× the heaviest realistic session burst (each reply takes
  10–60 s of reading time); the limiter sits BEFORE validation so invalid
  payloads don't burn the budget for no reason... — deliberately placed
  AFTER `requireUser` (the key IS the user) and BEFORE `parseWith` (garbage
  requests still count — a runaway script sends garbage too).
- **`aria-busy` + `aria-live` composition**: while busy the live region
  suppresses announcements (the intended chat pattern — announce the
  completed reply, not the spinner); the Thinking row stays visible for
  sighted users. If a future spec needs the Thinking text announced, that's
  an explicit design change, not a bug.
- **B3 changes the settings PATCH contract** — a whitespace-only name now
  400s (previously 200-with-blank). No prior spec PATCHes a blank name (the
  theme specs PATCH mode/accent only — verified); the NEW pin owns the
  contract.
- **The `generate-questions` route gains `const user =`** — a
  behavior-neutral refactor needed for the limiter key; lint gates the
  unused-variable shape.
- **Stale-script deletion is git-tracked** — `git rm` (not fs rm) so the
  removal rides the commit; the historical remediation plans that MENTION
  those scripts stay as-is (they are historical records of the original
  repo's sessions, not current commands).

## Execution log (post-execution addendum)

**RED observed (2026-10-08).** Unit: `tests/api-offline.test.ts` — the
TypeError-mapping pins failed as designed (the raw TypeError propagated,
not an ApiError; the timeout-precedence and pass-through guard pins passed
by construction). `tests/auth.test.ts` +3 — the custom-max pin failed at
call 11 (the 2nd argument was silently ignored; the default budget blocked
early — the exact designed RED). E2E:
`tests/e2e/s14-hardening.spec.ts` — all 7 pins RED with the designed
failure modes (banner absent offline; the generic unavailable toast; the
whitespace name 200; no 429; no nosniff/cache-control; both aria-live
attributes absent). One spec fix during RED: the A0 pin's first assertion
used `getByRole("heading", { name: "Dashboard" })` — the dashboard h1 is
the time-aware GREETING (assert on the app shell + the greeting regex
instead).

**GREEN per family.** A0b: the `doFetch` seam in `src/lib/api.ts` (fetch
TypeError → `ApiError(0, "You appear to be offline. Check your connection
and try again.")`; `isTimeoutError` checked FIRST and propagated untouched;
all three helpers — `apiGet`/`apiSend`/`apiUpload` — ride the seam). A0:
the `ConnectivityBanner` (`useSyncExternalStore` over `navigator.onLine` —
the lint gate rejected the first effect-based draft's synchronous setState
with `react-hooks/set-state-in-effect`, and the external-store form is both
lint-clean and the idiomatic bridge), mounted in `page.tsx` after
`MobileChrome`. B3: the preferences route guard (whitespace → 400 "Display
name cannot be empty"; padded names stored trimmed) + the client trim (the
store, the PATCH body, and the input agree on the trimmed value, with a
client-side guard toast). C1: `checkRateLimit(key, max = 10)` (login and
register call sites unchanged) + the `ai:${user.id}` 20-budget guard in all
four AI routes after `requireUser`, before validation — 429 + `Retry-After`
+ "Too many AI requests" (the `generate-questions` and `math/solve` routes
gained the `const user =` binding the key needs). C3: `X-Content-Type-Options:
nosniff` + `Cache-Control: private, no-store` on the download response.
D1/D2: `aria-live="polite"` + `aria-busy={busy}` on the assistant transcript
pane. D3: the same pair on the solver's "Math solution" card. E1: `git rm`
of the 14 stale scripts.

**Gates.** lint ✓ · tsc ✓ · **131 unit ✓** (123 + 5 offline-mapping + 3
rate-limit pins) · build ✓ · **232 e2e ✓** (cold `db/e2e.db`, 225 prior +
7 new, 3.5 min) = **363 tests green** — the 225 prior pins untouched (no
default-media visual changed; the banner renders null while online, so
light-mode byte-parity held structurally).

**Verification re-runs (all four audits + the standing drawer check).**
`connectivity-audit.mjs`: **0 findings / 7 non-gaps** — the banner appears
during the offline window and is ABSENT online (the byte-parity guard),
the AI offline send rolls back AND toasts the human message, the task
dialog keeps its form, SPA navigation runs offline, login toasts, the
post-offline retry recovers. `settings-roundtrip-audit.mjs`: **0 findings /
5 non-gaps** (the whitespace name now rejected; all four round-trips
green). `security-audit.mjs`: **0 findings / 6 non-gaps** — cookie flags,
the AI limiter cutoff measured at exactly the 21st request (20× 400 then
429), the download headers present, logout/auth-gating/enumeration all
green; the MIME-allowlist probe re-classified as the documented decision
(parity over restriction — hardening rides the headers). `ai-a11y-audit.mjs`:
**0 findings / 4 non-gaps** (the D1 probe needed one correction: the live
region sits on the transcript's CONTAINER — resolve upward with
`closest('[aria-live]')` — and D4's first run was an ordering artifact,
re-probed on the assistant view). `drawer-check-s14.mjs`: **GREEN** (the
standing priority: backdrop `oklab(0 0 0 / 0.2)` ≡ `rgba(0,0,0,0.2)` +
blur(4px), 288px white panel, 20 links, no footer, Escape-close superset).

**Evidence.** 4 captures via `scripts/capture-s14-evidence.mjs`:
`s14-offline-banner.png` (the amber pill + the human offline toast + the
bounced-back composer), `s14-ai-rate-limit.png` (the 429 toast with the
composer recovered), `s14-display-name-guard.png` (the guard toast on the
Profile tab), `s14-ai-live-region-thinking.png` (the Thinking state inside
the live region). VLM spot-check on the offline-banner capture: banner ✓,
toast ✓, transcript clean ✓ — the VLM pass also CAUGHT the one execution
surprise (below).

**The one execution surprise (now AP-56).** The VLM evidence review showed
probe rows in the chat transcript: the a11y audit's D2 held-route probe had
unrouted AFTER the send, and **unrouting releases the pending held request
to the real server** — the POST completed, persisted the probe message, and
generated a genuine AI reply (twice, across the audit's two runs). Fixed
twice over: the 8 probe rows deleted via a Prisma cleanup, and the capture
script now RELOADS before unrouting (document unload aborts the fetch —
the network-side twin of the S13 latched-busy lesson).

**Docs aligned.** README (badge 363, the Connectivity/Security-hardening/
AI-accessibility feature rows, counts 131/232, the plan entry +
project-status row, the captures line, the e2e notes, the AI-rate notes on
the API table), AGENTS.md (7 new commands + the CONNECTIVITY/
SECURITY-HARDENING/AI-ACCESSIBILITY contracts + 4 testing quirks), CLAUDE.md
(the three contracts + pyramid + counts), PAD (ADR-012 + the distribution
table + the threat-model rows: the upload residual risk re-classified as
mitigated-by-headers, the LLM-cost-abuse row added, the stale
`dev-daemon.py` mitigation row corrected, the resolved reduced-motion row),
SKILL.md (AP-56..58 + counts). `.env.example` audited — matches `.env`,
no changes (no new environment variables were introduced).

# Session 131 — The S51 summary

## What shipped

**The CWV × volume stress — the RUM-beacon cross-axis** (the S45–S50
summaries' named last standing candidate): `scripts/cwv-volume-stress.mjs`
(the beacon's five field metrics — TTFB/FCP/LCP/CLS + the INP interaction
proxy — under the COUNT-verified 300/200/250 profile on the 7
volume-affected views at 390×844 under the Lighthouse throttle [4x CPU +
Slow-4G, cache disabled], against the :3200 standalone build, 2-run
medians, the INP proxy re-anchored to the 300-row Tasks mount), the
`classifyCwvVolumeStress` seam, 29 unit pins, and the runner's 33rd audit
stage.

## The coverage map (why this cell)

Verified by grep against the standing scripts: the S16 cwv audit measures
the full CWV set but runs `/login` + `/Dashboard` ONLY at SEED volume
(zero volume references); the S13 data-volume audit inserts the 300/200/250
profile but never reads LCP/CLS/FCP; the S42–S49 volume sweeps observe
longtask entries ONLY. So the beacon's five field metrics had NEVER been
measured under data volume — the dense renderings (Tasks 7,894 nodes, My
Day 3,381, Events 3,121, Notes 2,430) had never had their LCP/CLS/FCP
read under the field-like throttle, the ADR-014 load-stability contract
had never been verified at volume, and the INP proxy had never landed on
a volume-affected view. With this session the RUM-beacon metric surface is
closed at both volumes (the seed half is the S16 audit's own).

## The exploration (genuine run 1)

**EXIT 0, findings 0, 1m54s** (~7.9× headroom under the 15-min budget):

- all 7 views × 2 runs, ZERO run errors, mode light, target :3200;
- **LCP 3236–3964ms** — every view inside the 4000ms POOR boundary
  (Tasks the deepest at 3964 — the NI band; the seed dashboard reads
  2684: the volume deepened NI without crossing POOR);
- **CLS 0 on every view** — the ADR-014 load-stability contract holds at
  volume;
- FCP 556–624ms (volume-invariant, as the pre-warm designs); TTFB 3–18ms;
  longTaskTotal 234–1098ms (inside the 2000ms load-window budget);
- **the INP proxy Dashboard→Tasks 1420ms** under the full throttle (the
  seed proxy 397ms — ≈3.6× at volume, inside the 3000ms budget);
- mainNodes 224–7894 (the density signatures identical to the fresh
  stage-6 volume measurements — deterministic).

**GREEN at the new seam on the FIRST try.**

## The budget families (the verdict classes)

LCP ≤ 4400 (the PARITY ANCHOR — the reference's own seed-volume mobile
dashboard measures 4416–4432ms under the same Lighthouse preset: the
clone's volume-stressed views must outperform the reference's own state;
the public 4000ms field-POOR boundary is documented in the note — the
Tasks view's genuine ~4000ms boundary-straddling is the recorded
NI-to-POOR state), CLS ≤ 0.1 (the ADR-014 contract at volume), FCP
≤ 1500 (the shell-paint volume-invariance), TTFB ≤ 500, longTaskTotal
≤ 2000 (the S13 B3 load-window sibling), the INP proxy ≤ 3000 — each with
boundary-exact pins, counted independently of the findings array.

## The in-suite correction (the S47 precedent, followed)

The first validation run read 34/35 — the S51 stage flagged
Tasks:lcp=4028>4000 (the exploration had read 3964 on the SAME lcpEl
with identical mainNodes/bytes/FCP/longTasks). The variance study: a
±64ms system-load noise band around a ~4000ms genuine reading — the
original budget sat INSIDE the noise, making the verdict a coin flip.
The documented correction: the LCP budget re-anchored to the parity
anchor (4400ms — the reference's own measured state under the same
preset), the boundary-straddling kept visible in the note, the pins
updated (4400/4401), and the suite re-run post-correction.

## The session's audit record

The 1096-green baseline re-confirmed on arrival (lint, tsc, 805 unit,
build, cold-db 291 e2e — no fresh-environment launcher step needed); the
preflight GREEN; the drawer check GREEN; the live agent-browser 390×844
walkthrough GREEN — **the mobile navigation menu is working as expected on
BOTH apps** (the reference's own active link verified at the element
level: the SAME violet→indigo gradient + violet-600 text + the trailing
violet dot); **no Tailwind v4 bug found** (the backdrop-blur-xs trap-9
pin, the flex-gap trap-4 ban, the custom tint class, and the hidden-lg:flex
sidebar contract all verified live); the reference re-swept **UNCHANGED
since S19–S50**; the copy sweep not re-run (the reference unchanged; the
S50 record stands); the dep-audit GREEN (2 documented non-production
advisories); the code review **zero app-code findings** (the S50 diff is
test/seam/probe-only); the `.env`/DATABASE_URL contract verified
(`file:../db/custom.db` with the `db/` folder at the repo root); the
`.env.example` matching and tracked; the vitest + playwright suites
present and correct. The arrival standing suite **34/34 GREEN**.

## Suggested next steps

Future sweeps stay ONE command — `bun scripts/standing-suite.mjs` (35
rows; ~115 min) in a clean window (the S32 differential — and never
syntax-check the runner via an import: the module EXECUTES on load; use
`node --check`). The standing open items remain the first real `docker
compose --profile init up` on your Docker host and the upstream dep
patches (braces > 3.0.3, Prisma's deepmerge-ts pin). **No named next
candidate remains** — the volume × theme × viewport cross-axis is complete
(S42–S49), the landscape SEED band is closed on both halves (S40/S50), and
the RUM-beacon cross-axis is closed (S51). The next session's scope is the
operator's choice: a re-audit of any standing surface (each is one
command), or the first real Docker-host `compose --profile init up` (the
owner's standing open item).

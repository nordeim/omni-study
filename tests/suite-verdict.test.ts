// Unit pins for the S32 standing-suite seam — src/lib/suite-verdict.ts.
//
// The fixtures are HARVESTED from the session-65 production-readiness sweep's
// genuine audit envelopes (the byte-exact shapes the audits printed on
// 2026-10-10): every GREEN shape is the real thing, every rot/phantom fixture
// is the documented failure family (S27 mode rot, S28 shape rot, the S29/S31/
// S65 double-run phantom, the accent WARN/FAIL boundary, the CWV
// ref-POOR-is-not-a-clone-finding boundary).
//
// The doctrine under test (AP-77): a missing key on a known audit shape is a
// LOUD shape-error — NEVER a silent green, NEVER a silent zero. That guard is
// the difference between a tool and a trap.
import { describe, expect, it } from "vitest";

import {
  classifyAudit,
  parseAuditStdout,
  suiteVerdict,
  type StageVerdict,
} from "@/lib/suite-verdict";

const isErr = (v: StageVerdict) => v.green === false && /shape not recognized/i.test(v.note);

// --- genuine fixtures (session-65, 2026-10-10) ------------------------------

const SECURITY_GREEN = {
  findings: [],
  nonGaps: [
    { surface: "Session cookie flags (httpOnly + SameSite=Lax + Path=/ + 30d Max-Age; secure is NODE_ENV-gated — dev false, prod true by code)", detail: "{\"httpOnly\":true,\"sameSite\":\"lax\",\"secure\":false}" },
    { surface: "AI routes rate-limited (20 then 429)", detail: "20x400 then 2x429; cutoffAt=21" },
  ],
};

const FC_GREEN = {
  clone: {
    views: { Dashboard: { invisible: [], unbounded: [] }, Tasks: { invisible: [], unbounded: [] } },
    states: { Tasks: { found: true, border: "2px solid rgb(0, 0, 0)" } },
    focus: [{ tag: "BUTTON", label: "Collapse sidebar", outline: "2px solid rgba(5, 0, 73, 0.8)" }],
  },
  reference: { dashboard: { invisible: [] }, nav: { activeCount: 20 } },
};

const PRINT_GREEN = {
  lightPrint: { Dashboard: 0, MyDay: 0, Timetable: 0 },
  darkPrint: { Dashboard: 0, MyDay: 0, Timetable: 0 },
  overflow: { Dashboard: { overflowRight: [{ tag: "DIV", cls: "flex flex-col gap-8", right: 1248 }], bodyScrollW: 1280 } },
  pdfs: ["Dashboard-light.pdf", "Timetable-light.pdf"],
};

const FOCUS_GREEN = {
  views: { Dashboard: { stopCount: 26, reachedBody: false, firstMainStop: 1, anomalies: [], sequence: ["A:Skip to main content"] } },
  dialogs: { newTask: { stops: [{ tag: "BUTTON", label: "☀ My Day", inDialog: true }] } },
  drawer: { trap: true, escapeClosed: true },
  skipLink: { present: true, first: true },
};

const DARK_GREEN = { mode: "dark", views: { Dashboard: { flashbulbs: [], unreadable: [] }, Tasks: { flashbulbs: [], unreadable: [] } } };

const ACCENT_GREEN = {
  desktop: { violet: { Calendar: { flashbulbs: [], unreadable: [], lowcontrast: [
    { text: "27", color: "rgb(71, 85, 105)", bgEff: "rgb(15,23,42)", contrast: 2.36, cls: "text-sm font-medium" },
  ] } } },
  mobile: { violet: { Calendar: { flashbulbs: [], unreadable: [], lowcontrast: [
    { text: "27", color: "rgb(71, 85, 105)", bgEff: "rgb(15,23,42)", contrast: 2.36, cls: "text-sm font-medium" },
  ] } } },
};

const CWV_GREEN = {
  thresholds: { lcp: 2500, cls: 0.1 },
  scenarios: { viewport: { width: 390, height: 844 } },
  verdicts: {
    "clone-login-mobile-throttled": { lcp: "GOOD", cls: "GOOD" },
    "clone-dashboard-mobile-throttled": { lcp: "NI", cls: "GOOD" },
    "ref-login-mobile-throttled": { lcp: "POOR", cls: "GOOD" },
    "ref-dashboard-mobile-throttled": { lcp: "POOR", cls: "GOOD" },
  },
};

const PRE15_GREEN = {
  runtimeDependencyCount: 13, devDependencyCount: 9, pinnedMajorStack: true,
  clientStaticKb: 214, outdatedCount: 0,
  verdict: "GREEN — deps pinned by design (majors), client bundle lean, no action",
};

const DEPAUDIT_GREEN = {
  advisories: [
    { module: "braces", severity: "high", surface: "dev", runtimeReachable: false, verdict: "NON-PRODUCTION", rationale: "Not in the standalone trace; every path roots in a devDependency (eslint-config-next) — dev-time tooling only; documented non-production risk." },
    { module: "deepmerge-ts", severity: "high", surface: "cli", runtimeReachable: false, verdict: "NON-PRODUCTION", rationale: "Not in the standalone trace, but reached from the prod-declared tooling prisma (the CLI/build class — the app runtime never imports it); documented non-production risk." },
  ],
  verdict: "GREEN — 2 advisory(ies) documented as non-production (dev/CLI surface), 0 runtime-reachable",
};

const PREFLIGHT_GREEN = {
  ranAt: "2026-10-10T07:57:59.400Z", source: "dev-server-preflight", base: "http://localhost:3000",
  path: "/login", navigations: 1, hydrated: true, reachable: true, verdict: "green", remedy: null,
};

// --- parseAuditStdout ------------------------------------------------------

describe("parseAuditStdout", () => {
  it("parses clean JSON (security — no prefix noise)", () => {
    const r = parseAuditStdout(JSON.stringify(SECURITY_GREEN, null, 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect((r.json as { findings: unknown[] }).findings).toEqual([]);
  });

  it("strips the dark-sweep 'MODE: dark' prefix line", () => {
    const r = parseAuditStdout(`MODE: dark\n${JSON.stringify(DARK_GREEN, null, 1)}`);
    expect(r.ok).toBe(true);
    if (r.ok) expect((r.json as { mode: string }).mode).toBe("dark");
  });

  it("strips the upload-edge '[cleanup]' prefix line", () => {
    const r = parseAuditStdout(`[cleanup] removed probe rows\n${JSON.stringify({ findings: [], nonGaps: [] }, null, 1)}`);
    expect(r.ok).toBe(true);
  });

  it("strips CWV per-scenario progress lines before the JSON", () => {
    const r = parseAuditStdout(`clone-login-mobile-throttled: done\nclone-login-desktop: done\n${JSON.stringify(CWV_GREEN, null, 1)}`);
    expect(r.ok).toBe(true);
    if (r.ok) expect((r.json as { verdicts: object }).verdicts).toBeTruthy();
  });

  it("is a LOUD error on non-JSON output (a crashed audit is never green)", () => {
    const r = parseAuditStdout("node:internal/modules/cjs/loader:2075\nthrow err;\n");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/parse/i);
  });
});

// --- classifyAudit: the GREEN shapes (genuine fixtures) ---------------------

describe("classifyAudit GREEN", () => {
  it("security: findings-array empty, nonGaps counted into the note", () => {
    const v = classifyAudit("security", SECURITY_GREEN);
    expect(v.green).toBe(true);
    expect(v.findings).toBe(0);
    expect(v.note).toMatch(/2 nonGaps/);
  });

  it("settings-roundtrip / connectivity / upload-edge / data-volume / ai-error / ai-a11y: findings-array rule", () => {
    for (const name of ["settings-roundtrip", "connectivity", "upload-edge", "data-volume", "ai-error", "ai-a11y"] as const) {
      const v = classifyAudit(name, { findings: [], nonGaps: [{ surface: "x" }] });
      expect(v.green, name).toBe(true);
      expect(v.findings, name).toBe(0);
    }
  });

  it("forced-colors: every clone view invisible/unbounded empty", () => {
    const v = classifyAudit("forced-colors", FC_GREEN);
    expect(v.green).toBe(true);
    expect(v.findings).toBe(0);
  });

  it("print: light/dark print text counts all zero (overflow data rides the note)", () => {
    const v = classifyAudit("print", PRINT_GREEN);
    expect(v.green).toBe(true);
    expect(v.findings).toBe(0);
    expect(v.note).toMatch(/overflow/i);
  });

  it("focus-order: anomalies empty + dialog/drawer guards", () => {
    const v = classifyAudit("focus-order", FOCUS_GREEN);
    expect(v.green).toBe(true);
    expect(v.findings).toBe(0);
  });

  it("dark-sweep: mode=dark and zero flashbulbs/unreadable (the note carries the actual view count)", () => {
    const v = classifyAudit("dark-sweep", DARK_GREEN);
    expect(v.green).toBe(true);
    expect(v.findings).toBe(0);
    expect(v.note).toMatch(/2 views/);
  });

  it("accent-dark-sweep: lowcontrast is WARN (the S11 non-gap family), NOT findings", () => {
    const v = classifyAudit("accent-dark-sweep", ACCENT_GREEN);
    expect(v.green).toBe(true);
    expect(v.findings).toBe(0);
    expect(v.note).toMatch(/2 WARN/);
  });

  it("cwv: clone scenarios GOOD/NI; the reference's own POOR LCP is informational", () => {
    const v = classifyAudit("cwv", CWV_GREEN);
    expect(v.green).toBe(true);
    expect(v.findings).toBe(0);
    expect(v.note).toMatch(/ref POOR/);
  });

  it("pre15-preflight: GREEN verdict string", () => {
    const v = classifyAudit("pre15-preflight", PRE15_GREEN);
    expect(v.green).toBe(true);
  });

  it("dep-audit: GREEN verdict string with advisories counted into the note", () => {
    const v = classifyAudit("dep-audit", DEPAUDIT_GREEN);
    expect(v.green).toBe(true);
    expect(v.note).toMatch(/2 advisories/);
  });

  it("dev-server-preflight: verdict=green (1 benign nav)", () => {
    const v = classifyAudit("dev-server-preflight", PREFLIGHT_GREEN);
    expect(v.green).toBe(true);
  });
});

// --- the anti-phantom guard (AP-77 / the S28 lesson encoded) ----------------

describe("classifyAudit shape-error (never a silent green)", () => {
  it("a findings-array audit WITHOUT the findings key reads shape-error — this is the exact manual-parse trap of session-65", () => {
    const v = classifyAudit("security", { nonGaps: [] }); // findings key absent
    expect(isErr(v)).toBe(true);
    expect(v.findings).toBe(0);
  });

  it("findings present but not an Array → shape-error", () => {
    const v = classifyAudit("security", { findings: "oops" });
    expect(isErr(v)).toBe(true);
  });

  it("forced-colors without clone.views → shape-error", () => {
    const v = classifyAudit("forced-colors", { clone: { states: {} } });
    expect(isErr(v)).toBe(true);
  });

  it("print with a non-numeric lightPrint count → shape-error", () => {
    const v = classifyAudit("print", { lightPrint: { Dashboard: null } });
    expect(isErr(v)).toBe(true);
  });

  it("focus-order without views → shape-error", () => {
    const v = classifyAudit("focus-order", { dialogs: {} });
    expect(isErr(v)).toBe(true);
  });

  it("dark-sweep without mode → shape-error", () => {
    const v = classifyAudit("dark-sweep", { views: {} });
    expect(isErr(v)).toBe(true);
  });

  it("accent entry with non-Array flashbulbs → shape-error", () => {
    const v = classifyAudit("accent-dark-sweep", { desktop: { violet: { Calendar: { flashbulbs: "x", unreadable: [] } } } });
    expect(isErr(v)).toBe(true);
  });

  it("cwv without verdicts → shape-error", () => {
    const v = classifyAudit("cwv", { thresholds: {} });
    expect(isErr(v)).toBe(true);
  });

  it("a cwv rating outside GOOD/NI/POOR/BAD → shape-error", () => {
    const v = classifyAudit("cwv", { verdicts: { "clone-x": { lcp: "MEH", cls: "GOOD" } } });
    expect(isErr(v)).toBe(true);
  });

  it("verdict-string audit without the verdict key → shape-error", () => {
    const v = classifyAudit("pre15-preflight", { outdatedCount: 3 });
    expect(isErr(v)).toBe(true);
  });

  it("an unknown audit name is a loud error (never a silent pass-through)", () => {
    const v = classifyAudit("typo-audit", { findings: [] });
    expect(isErr(v)).toBe(true);
  });
});

// --- the documented non-gap signatures (surfaced by the S32 orchestrator's
// first genuine run — each verified against the codebase and the S11/S12
// documentation before being encoded; see the session-32 execution log) ----

describe("classifyAudit documented non-gap signatures", () => {
  it("focus-order: NEXTJS-PORTAL anomalies are dev-portal artifacts (dev-mode only) — excluded from findings, counted in the note", () => {
    // The genuine session-65 suite output: 2 anomalies, both the Next.js
    // dev-tools portal ("no-indicator", out-of-viewport) — injected by the
    // dev server, absent from the standalone build.
    const v = classifyAudit("focus-order", {
      views: {
        StudyGroups: {
          stopCount: 26,
          anomalies: [
            { i: 25, tag: "NEXTJS-PORTAL", label: "", inVp: false, outlineVisible: false, ring: false, indicator: false, issue: "no-indicator" },
            { i: 25, issue: "no-indicator", tag: "NEXTJS-PORTAL", label: "", inVp: false, outlineVisible: false },
          ],
        },
      },
    });
    expect(v.green).toBe(true);
    expect(v.findings).toBe(0);
    expect(v.note).toMatch(/2 dev-portal/);
  });

  it("focus-order: a NON-portal anomaly is still a finding (the exclusion is signature-strict)", () => {
    const v = classifyAudit("focus-order", {
      views: {
        Tasks: { anomalies: [{ issue: "tab-escape", tag: "BUTTON", label: "Save" }] },
      },
    });
    expect(v.green).toBe(false);
    expect(v.findings).toBe(1);
  });

  it("forced-colors: sr-only unbounded controls are the designed a11y pattern (the Events date input) — excluded, noted", () => {
    // The genuine session-65 suite output: Events carries one unbounded
    // control — the sr-only INPUT[type=date] paired with the visible day
    // picker (events-view.tsx:445). Visually hidden BY DESIGN.
    const v = classifyAudit("forced-colors", {
      clone: {
        views: {
          Events: { invisible: [], unbounded: [{ tag: "INPUT", label: "", cls: "sr-only" }] },
          Dashboard: { invisible: [], unbounded: [] },
        },
        states: {}, focus: [],
      },
    });
    expect(v.green).toBe(true);
    expect(v.findings).toBe(0);
    expect(v.note).toMatch(/1 sr-only/);
  });

  it("forced-colors: a NON-sr-only unbounded control is still a finding", () => {
    const v = classifyAudit("forced-colors", {
      clone: { views: { Tasks: { invisible: [], unbounded: [{ tag: "BUTTON", cls: "bg-white rounded-xl" }] } }, states: {}, focus: [] },
    });
    expect(v.green).toBe(false);
    expect(v.findings).toBe(1);
  });

  it("accent-dark-sweep: white-on-accent unreadable entries are the accent CTA face (the documented S11 family-2 non-gap) — excluded, counted as CTA-face", () => {
    // The genuine session-65 suite output: the ORANGE accent's Calendar chip
    // + PracticeTests Start Test — color rgb(255,255,255) on the accent bg
    // (orange-500, contrast 2.15) — the same in light mode; the reference's
    // own accent-CTA design (remediation-plan-session11 family 2).
    const v = classifyAudit("accent-dark-sweep", {
      desktop: {
        orange: {
          Calendar: { flashbulbs: [], unreadable: [{ text: "Calendar", color: "rgb(255, 255, 255)", bgEff: "rgb(245,158,11)", contrast: 2.15, cls: "flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium tr" }], lowcontrast: [] },
          PracticeTests: { flashbulbs: [], unreadable: [{ text: "Start Test", color: "rgb(255, 255, 255)", bgEff: "rgb(245,158,11)", contrast: 2.15, cls: "inline-flex items-center justify-center whitespace-nowrap rounded-" }], lowcontrast: [] },
        },
      },
      mobile: { orange: { Calendar: { flashbulbs: [], unreadable: [{ text: "Calendar", color: "rgb(255, 255, 255)", bgEff: "rgb(245,158,11)", contrast: 2.15 }], lowcontrast: [] } } },
    });
    expect(v.green).toBe(true);
    expect(v.findings).toBe(0);
    expect(v.note).toMatch(/3 CTA-face/);
  });

  it("accent-dark-sweep: a NON-white unreadable entry is still a finding (the CTA-face signature is strict)", () => {
    const v = classifyAudit("accent-dark-sweep", {
      desktop: { violet: { Tasks: { flashbulbs: [], unreadable: [{ text: "hint", color: "rgb(71, 85, 105)", bgEff: "rgb(15,23,42)", contrast: 1.4 }], lowcontrast: [] } } },
      mobile: {},
    });
    expect(v.green).toBe(false);
    expect(v.findings).toBe(1);
  });

  it("accent-dark-sweep: flashbulbs are ALWAYS findings (never a signature class) — the genuine stale-probe-row flashbulb", () => {
    // The genuine session-65 finding: the leaked "s14 a11y probe D2" chat row
    // rendered through the designed user-bubble inversion (dark:bg-slate-100)
    // — a flashbulb in every accent. The FIX is the probe-row cleanup, never
    // a re-classification of flashbulbs.
    const v = classifyAudit("accent-dark-sweep", {
      desktop: { violet: { AIAssistant: { flashbulbs: [{ cls: "max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px]", bg: "rgb(241, 245, 249)", text: "s14 a11y probe D2" }], unreadable: [], lowcontrast: [] } } },
      mobile: {},
    });
    expect(v.green).toBe(false);
    expect(v.findings).toBe(1);
  });

  it("dark-sweep: the same stale-probe-row flashbulb reads non-green (the genuine finding that surfaced the ai-a11y leak)", () => {
    const v = classifyAudit("dark-sweep", {
      mode: "dark",
      views: { AIAssistant: { flashbulbs: [{ cls: "max-w-[78%]", bg: "rgb(241, 245, 249)", text: "s14 a11y probe D2" }], unreadable: [] } },
    });
    expect(v.green).toBe(false);
    expect(v.findings).toBe(1);
  });
});

// --- the rot / finding fixtures (each documented failure family) -----------

describe("classifyAudit findings (non-green)", () => {
  it("the double-run phantom shape (session-65's genuine second run): a NON-EMPTY findings array is a real finding under the strict rule", () => {
    const v = classifyAudit("security", {
      findings: [{ family: "C", surface: "AI-route limiter shape wrong", measured: "cutoffAt=1, statuses=429" }],
      nonGaps: [],
    });
    expect(v.green).toBe(false);
    expect(v.findings).toBe(1);
  });

  it("the pre-spent-budget differential (session-65 run 2's genuine lesson): a limiter-shape finding carries the differential diagnosis in the note", () => {
    // cutoffAt=15 (5 of the 20 already spent by manual audit runs inside the
    // window — the suite must be the window's ONLY consumer; a clean-window
    // re-run that reproduces it is a genuine limiter defect).
    const v = classifyAudit("security", {
      findings: [{ family: "C", surface: "AI-route limiter shape wrong", measured: "cutoffAt=15, statuses=400,429" }],
      nonGaps: [{ surface: "Session cookie flags", detail: "httpOnly" }],
    });
    expect(v.green).toBe(false);
    expect(v.findings).toBe(1);
    expect(v.note).toMatch(/pre-spent-budget differential/);
    expect(v.note).toMatch(/restart the dev server/);
    expect(v.note).toMatch(/window's ONLY consumer/);
  });

  it("a non-limiter security finding does NOT carry the differential note", () => {
    const v = classifyAudit("security", {
      findings: [{ family: "A", surface: "cookie flags missing", measured: "secure=false in prod" }],
      nonGaps: [],
    });
    expect(v.green).toBe(false);
    expect(v.note).not.toMatch(/pre-spent-budget/);
  });

  it("the S27 rot: a light-mode dark-sweep with zero findings reads NON-green (mode=light)", () => {
    const v = classifyAudit("dark-sweep", { mode: "light", views: { Dashboard: { flashbulbs: [], unreadable: [] } } });
    expect(v.green).toBe(false);
    expect(v.note).toMatch(/mode=light/);
  });

  it("dark-sweep with a flashbulb → findings=1", () => {
    const v = classifyAudit("dark-sweep", { mode: "dark", views: { Dashboard: { flashbulbs: [{ text: "x" }], unreadable: [] } } });
    expect(v.green).toBe(false);
    expect(v.findings).toBe(1);
  });

  it("accent FAIL-class (flashbulbs non-empty) → findings counted; lowcontrast stays WARN", () => {
    const v = classifyAudit("accent-dark-sweep", { desktop: { violet: { Calendar: { flashbulbs: [{ text: "x" }], unreadable: [], lowcontrast: [] } } }, mobile: {} });
    expect(v.green).toBe(false);
    expect(v.findings).toBe(1);
  });

  it("a clone CWV scenario rated POOR is a finding (a ref POOR alone is not — the boundary)", () => {
    const v = classifyAudit("cwv", { verdicts: { "clone-login-mobile-throttled": { lcp: "POOR", cls: "GOOD" }, "ref-login-mobile-throttled": { lcp: "POOR", cls: "GOOD" } } });
    expect(v.green).toBe(false);
    expect(v.findings).toBe(1);
  });

  it("print with light text in print media → findings counted", () => {
    const v = classifyAudit("print", { lightPrint: { Dashboard: 3 }, darkPrint: { Dashboard: 0 } });
    expect(v.green).toBe(false);
    expect(v.findings).toBe(3);
  });

  it("focus-order with an anomaly → findings counted", () => {
    const v = classifyAudit("focus-order", { views: { Dashboard: { anomalies: [{ what: "tab escape" }] } } });
    expect(v.green).toBe(false);
    expect(v.findings).toBe(1);
  });

  it("forced-colors with an invisible-text finding → findings counted", () => {
    const v = classifyAudit("forced-colors", { clone: { views: { Dashboard: { invisible: ["txt"], unbounded: [] } } } });
    expect(v.green).toBe(false);
    expect(v.findings).toBe(1);
  });

  it("pre15 non-GREEN verdict → non-green with the string in the note", () => {
    const v = classifyAudit("pre15-preflight", { verdict: "ACTION NEEDED — outdated deps", outdatedCount: 4 });
    expect(v.green).toBe(false);
    expect(v.note).toMatch(/ACTION NEEDED/);
  });

  it("dep-audit FAIL verdict → non-green", () => {
    const v = classifyAudit("dep-audit", { verdict: "FAIL — 1 runtime-reachable advisory", advisories: [] });
    expect(v.green).toBe(false);
  });

  it("preflight reload-loop verdict carries the remedy in the note", () => {
    const v = classifyAudit("dev-server-preflight", { verdict: "reload-loop", remedy: "stop the daemon, rm -rf .next/dev, restart (bun run dev), re-run this preflight", navigations: 19, hydrated: false });
    expect(v.green).toBe(false);
    expect(v.note).toMatch(/rm -rf \.next\/dev/);
  });
});

// --- suiteVerdict (the aggregate) -------------------------------------------

describe("suiteVerdict", () => {
  it("all green → green with empty failed list", () => {
    const r = suiteVerdict([
      { name: "security", verdict: { green: true, findings: 0, note: "2 nonGaps" } },
      { name: "cwv", verdict: { green: true, findings: 0, note: "ref POOR informational" } },
    ]);
    expect(r.green).toBe(true);
    expect(r.failed).toEqual([]);
    expect(r.summary).toMatch(/2\/2/);
  });

  it("mixed → non-green, failed lists the non-green stages, shape-errors ride the summary", () => {
    const r = suiteVerdict([
      { name: "security", verdict: { green: true, findings: 0, note: "" } },
      { name: "dark-sweep", verdict: { green: false, findings: 0, note: "mode=light — the sweep ran in the wrong mode" } },
      { name: "print", verdict: { green: false, findings: 0, note: "shape not recognized — the audit script changed; update the seam" } },
    ]);
    expect(r.green).toBe(false);
    expect(r.failed).toEqual(["dark-sweep", "print"]);
    expect(r.summary).toMatch(/1\/3 green/);
    expect(r.summary).toMatch(/shape not recognized/);
  });
});

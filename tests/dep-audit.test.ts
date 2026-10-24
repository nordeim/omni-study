import { describe, expect, it } from "vitest";

import {
  buildDepAuditEnvelope,
  classifyAdvisory,
  parseBunAuditOutput,
  versionInRange,
  type AuditAdvisory,
  type DepAuditContext,
} from "@/lib/dep-audit";

// The S30 dependency-security seam: `bun audit` (no JSON reporter exists in
// bun 1.3.14) emits a text report; this seam parses it, classifies every
// advisory by RUNTIME REACHABILITY against the production standalone trace
// (`.next/standalone/node_modules` — the ground truth for "does this ship"),
// and assembles the self-describing envelope. Pure functions with explicit
// args (never reads fs/spawns itself — the runner script owns that), so the
// parser format, the classification matrix, and the envelope contract are
// all pinnable. The fixture below is today's byte-exact two-advisory output
// — if a future bun release changes the text format, these pins fail and
// force the parser update in the same change (the format-change guard).

// The S30-era fixture (captured 2026-10-10, bun 1.3.14) — kept as the
// format-change guard for the marker-line + summary/trailer forms.
const S30_BUN_AUDIT = [
  "braces  <=3.0.3",
  "  (direct dependency)",
  "  eslint-config-next › @next/eslint-plugin-next › fast-glob › micromatch › braces",
  "  high: braces vulnerable to stack-exhaustion denial of service through deeply nested patterns - https://github.com/advisories/GHSA-vfj7-8cjw-p6xm",
  "",
  "deepmerge-ts  <8.0.0",
  "  prisma › @prisma/config › deepmerge-ts",
  "  high: DeepmergeTS has stack exhaustion when merging recursive object graphs - https://github.com/advisories/GHSA-ggr8-5vv4-36mx",
  "",
  "2 vulnerabilities (2 high)",
  "",
  "To update all dependencies to the latest compatible versions:",
  "  bun update",
  "",
].join("\n");

// The S96 fixture — the byte-exact report that exposed the classification
// gap (captured 2026-10-24, bun 1.3.14): the zod advisory carries BOTH the
// "(direct dependency)" marker (the top-level prod zod 4.6.5 is in range)
// and a dev-chain path. The S30 classifier keyed only on the standalone
// trace + path roots, so the RUNTIME copy (bundled by Next into the route
// chunks) was miscategorized as dev-surface. These pins force the fix.
const S96_BUN_AUDIT = [
  '[0.04ms] ".env"',
  "deepmerge-ts  <8.0.0",
  "  prisma › @prisma/config › deepmerge-ts",
  "  high: DeepmergeTS has stack exhaustion when merging recursive object graphs - https://github.com/advisories/GHSA-ggr8-5vv4-36mx",
  "",
  "zod  <4.6.6",
  "  (direct dependency)",
  "  eslint-config-next › eslint-plugin-react-hooks › zod",
  "  high: Zod can exhaust memory while validating oversized constrained collections - https://github.com/advisories/GHSA-mrhx-c7xc-m3w5",
  "",
  "2 vulnerabilities (2 high)",
  "",
  "To update all dependencies to the latest compatible versions:",
  "  bun update",
  "",
].join("\n");

const RUNTIME_MODULES = [
  "@img",
  "@next",
  "@prisma",
  "@swc",
  "client-only",
  "detect-libc",
  "next",
  "react",
  "react-dom",
  "semver",
  "sharp",
  "styled-jsx",
  "z-ai-web-dev-sdk",
];

const PROD_DEPS = [
  "@prisma/client",
  "next",
  "prisma",
  "react",
  "react-dom",
  "web-vitals",
  "z-ai-web-dev-sdk",
  "zod",
  "zustand",
];

const DEV_DEPS = [
  "@playwright/test",
  "eslint",
  "eslint-config-next",
  "tailwindcss",
  "typescript",
  "vitest",
];

const CTX: DepAuditContext = {
  runtimeModules: RUNTIME_MODULES,
  prodDependencies: PROD_DEPS,
  devDependencies: DEV_DEPS,
  // The S96 pre-bump reality: the prod-direct zod at 4.6.5, IN the
  // advisory range <4.6.6 (the S96-envelope FAIL test depends on it).
  installedVersions: { zod: "4.6.5" },
};

describe("parseBunAuditOutput", () => {
  it("parses the S30-era two-advisory report (modules, ranges, severities, paths, titles, urls)", () => {
    const out = parseBunAuditOutput(S30_BUN_AUDIT);
    expect(out).toHaveLength(2);

    expect(out[0]).toMatchObject({
      module: "braces",
      vulnerableRange: "<=3.0.3",
      severity: "high",
      paths: [
        "eslint-config-next › @next/eslint-plugin-next › fast-glob › micromatch › braces",
      ],
      url: "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm",
    });
    expect(out[0].title).toContain("stack-exhaustion");

    expect(out[1]).toMatchObject({
      module: "deepmerge-ts",
      vulnerableRange: "<8.0.0",
      severity: "high",
      paths: ["prisma › @prisma/config › deepmerge-ts"],
    });
    expect(out[1].url).toBe(
      "https://github.com/advisories/GHSA-ggr8-5vv4-36mx",
    );
  });

  it("tolerates the '(direct dependency)' marker line without treating it as a path — and RECORDS it (the S96 gap: the marker is directness evidence)", () => {
    const out = parseBunAuditOutput(S30_BUN_AUDIT);
    // braces carries the marker; its ONLY path is the chain line.
    expect(out[0].paths).toHaveLength(1);
    expect(out[0].paths[0]).not.toContain("direct dependency");
    expect(out[0].direct).toBe(true);
    // deepmerge-ts has no marker line.
    expect(out[1].direct).toBe(false);
  });

  it("parses the S96 report — the zod advisory (marker + dev chain) and the leading '[0.04ms]' env-load line", () => {
    const out = parseBunAuditOutput(S96_BUN_AUDIT);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({
      module: "deepmerge-ts",
      vulnerableRange: "<8.0.0",
      severity: "high",
      direct: false,
      paths: ["prisma › @prisma/config › deepmerge-ts"],
    });
    expect(out[1]).toMatchObject({
      module: "zod",
      vulnerableRange: "<4.6.6",
      severity: "high",
      direct: true,
      paths: ["eslint-config-next › eslint-plugin-react-hooks › zod"],
      url: "https://github.com/advisories/GHSA-mrhx-c7xc-m3w5",
    });
    expect(out[1].title).toContain("oversized constrained collections");
  });

  it("returns an empty list for a clean report (no advisory blocks)", () => {
    const clean = ["0 vulnerabilities", "", "To update all dependencies:", "  bun update", ""].join("\n");
    expect(parseBunAuditOutput(clean)).toEqual([]);
  });

  it("parses every severity grade and multi-path advisories", () => {
    const multi = [
      "some-pkg  <2.0.0",
      "  prod-root › mid › some-pkg",
      "  dev-root › other › some-pkg",
      "  critical: the title - https://example.com/a",
      "",
      "other-pkg  >=1.0.0 <1.5.0",
      "  chain › other-pkg",
      "  moderate: another title - https://example.com/b",
      "",
      "third-pkg  <9",
      "  chain › third-pkg",
      "  low: third title - https://example.com/c",
      "",
      "3 vulnerabilities (1 critical, 1 moderate, 1 low)",
    ].join("\n");
    const out = parseBunAuditOutput(multi);
    expect(out).toHaveLength(3);
    expect(out[0].severity).toBe("critical");
    expect(out[0].paths).toHaveLength(2);
    expect(out[1].severity).toBe("moderate");
    expect(out[1].vulnerableRange).toBe(">=1.0.0 <1.5.0");
    expect(out[2].severity).toBe("low");
  });

  it("never manufactures advisories from the summary or trailer lines", () => {
    const out = parseBunAuditOutput(S30_BUN_AUDIT);
    const modules = out.map((a) => a.module);
    expect(modules).not.toContain("2 vulnerabilities");
    expect(modules).not.toContain("bun update");
  });
});

describe("classifyAdvisory", () => {
  it("FAILS loudly when the advisory's module ships in the standalone runtime trace", () => {
    const advisory: AuditAdvisory = {
      module: "next",
      vulnerableRange: "<16.4.1",
      severity: "high",
      title: "hypothetical next runtime bug",
      paths: ["next"],
      url: "https://example.com/x",
      direct: true,
    };
    const c = classifyAdvisory(advisory, CTX);
    expect(c.surface).toBe("runtime");
    expect(c.runtimeReachable).toBe(true);
    expect(c.verdict).toBe("FAIL");
  });

  it("matches scoped runtime modules (@prisma/client-style)", () => {
    const advisory: AuditAdvisory = {
      module: "@prisma/client",
      vulnerableRange: "<6.20.0",
      severity: "moderate",
      title: "hypothetical client bug",
      paths: ["@prisma/client"],
      url: "https://example.com/y",
      direct: true,
    };
    const c = classifyAdvisory(advisory, {
      ...CTX,
      runtimeModules: [...RUNTIME_MODULES, "@prisma/client"],
    });
    expect(c.surface).toBe("runtime");
    expect(c.verdict).toBe("FAIL");
  });

  it("classifies the S30 braces advisory as dev-surface NON-PRODUCTION (dev-only chain, not a prod dep — the marker alone is not runtime evidence)", () => {
    const [braces] = parseBunAuditOutput(S30_BUN_AUDIT);
    const c = classifyAdvisory(braces, CTX);
    expect(c.surface).toBe("dev");
    expect(c.runtimeReachable).toBe(false);
    expect(c.verdict).toBe("NON-PRODUCTION");
    expect(c.rationale).toContain("eslint-config-next");
  });

  it("classifies the deepmerge-ts advisory as cli-surface NON-PRODUCTION (prod-declared tooling the runtime never imports)", () => {
    const [, dmt] = parseBunAuditOutput(S30_BUN_AUDIT);
    const c = classifyAdvisory(dmt, CTX);
    expect(c.surface).toBe("cli");
    expect(c.runtimeReachable).toBe(false);
    expect(c.verdict).toBe("NON-PRODUCTION");
    expect(c.rationale).toContain("prisma");
  });

  it("keeps a runtime-reachable module FAIL even when a path roots in devDependencies (the trace is the truth)", () => {
    const advisory: AuditAdvisory = {
      module: "next",
      vulnerableRange: "<16.4.1",
      severity: "high",
      title: "hypothetical",
      paths: ["eslint-config-next › next"],
      url: "https://example.com/z",
      direct: true,
    };
    const c = classifyAdvisory(advisory, CTX);
    expect(c.runtimeReachable).toBe(true);
    expect(c.verdict).toBe("FAIL");
  });

  it("labels mixed-root paths (dev + prod) as the stricter cli surface, still NON-PRODUCTION", () => {
    const advisory: AuditAdvisory = {
      module: "not-traced-pkg",
      vulnerableRange: "<1.0.0",
      severity: "low",
      title: "hypothetical",
      paths: ["eslint-config-next › not-traced-pkg", "prisma › not-traced-pkg"],
      url: "https://example.com/m",
      direct: false,
    };
    const c = classifyAdvisory(advisory, CTX);
    expect(c.surface).toBe("cli");
    expect(c.verdict).toBe("NON-PRODUCTION");
  });

  it("labels paths rooted outside both dependency lists as unclassified (honest, still NON-PRODUCTION)", () => {
    const advisory: AuditAdvisory = {
      module: "mystery-pkg",
      vulnerableRange: "<1.0.0",
      severity: "low",
      title: "hypothetical",
      paths: ["unknown-root › mystery-pkg"],
      url: "https://example.com/u",
      direct: false,
    };
    const c = classifyAdvisory(advisory, CTX);
    expect(c.surface).toBe("unclassified");
    expect(c.runtimeReachable).toBe(false);
    expect(c.verdict).toBe("NON-PRODUCTION");
  });

  // The S96 gap, pinned: a DIRECT PRODUCTION dependency is runtime-reachable
  // even when it never appears in .next/standalone/node_modules — Next
  // bundles pure-JS server deps into the route chunks, so the trace's
  // node_modules only carries the EXTERNALIZED packages (sharp, the prisma
  // client, …). Before S96 the zod advisory (prod-direct, in range at
  // runtime, dev chain as its only printed path) was classified dev-surface
  // NON-PRODUCTION — normalizing a genuine runtime finding away. The
  // authority is the INSTALLED TOP-LEVEL VERSION (bun's marker is
  // NAME-based — it kept printing after the bump patched the prod copy).
  it("FAILS the S96 zod advisory (pre-bump): prod-direct + marker + installed 4.6.5 in range → runtime", () => {
    const [, zod] = parseBunAuditOutput(S96_BUN_AUDIT);
    // zod is in PROD_DEPS with installed 4.6.5 (CTX), NOT in RUNTIME_MODULES.
    const c = classifyAdvisory(zod, CTX);
    expect(c.surface).toBe("runtime");
    expect(c.runtimeReachable).toBe(true);
    expect(c.verdict).toBe("FAIL");
    expect(c.rationale).toContain("direct production dependency");
    expect(c.rationale).toContain("4.6.5");
  });

  it("FAILS a prod-direct module with an IN-RANGE installed copy even without the marker (the version, not the marker, is the authority)", () => {
    const advisory: AuditAdvisory = {
      module: "zod",
      vulnerableRange: "<4.6.6",
      severity: "high",
      title: "hypothetical markerless form",
      paths: ["eslint-config-next › eslint-plugin-react-hooks › zod"],
      url: "https://example.com/mm",
      direct: false,
    };
    const c = classifyAdvisory(advisory, CTX); // installed zod 4.6.5 → in range
    expect(c.surface).toBe("runtime");
    expect(c.runtimeReachable).toBe(true);
    expect(c.verdict).toBe("FAIL");
  });

  it("classifies the POST-BUMP zod form as dev-surface: the name-based marker still prints, but the installed 4.6.7 copy is OUT of range — only the dev chain's own copy is affected", () => {
    const [, zod] = parseBunAuditOutput(S96_BUN_AUDIT);
    expect(zod.direct).toBe(true); // bun prints the marker on the NAME
    const c = classifyAdvisory(zod, {
      ...CTX,
      installedVersions: { ...CTX.installedVersions, zod: "4.6.7" },
    });
    expect(c.surface).toBe("dev");
    expect(c.runtimeReachable).toBe(false);
    expect(c.verdict).toBe("NON-PRODUCTION");
    expect(c.rationale).toContain("eslint-config-next");
  });

  it("treats a prod-direct module with an UNKNOWN installed version as in-range (loud on uncertainty)", () => {
    const [, zod] = parseBunAuditOutput(S96_BUN_AUDIT);
    const { zod: _omit, ...noZod } = CTX.installedVersions;
    const c = classifyAdvisory(zod, { ...CTX, installedVersions: noZod });
    expect(c.surface).toBe("runtime");
    expect(c.verdict).toBe("FAIL");
  });

  it("keeps a prod-declared TRANSITIVE advisory on the cli surface (prisma-style roots, module itself not prod-direct)", () => {
    const advisory: AuditAdvisory = {
      module: "deepmerge-ts",
      vulnerableRange: "<8.0.0",
      severity: "high",
      title: "hypothetical",
      paths: ["prisma › @prisma/config › deepmerge-ts"],
      url: "https://example.com/t",
      direct: false,
    };
    const c = classifyAdvisory(advisory, CTX);
    expect(c.surface).toBe("cli");
    expect(c.verdict).toBe("NON-PRODUCTION");
  });
});

describe("versionInRange — the S96 evidence primitive", () => {
  it("evaluates the bun-printed range forms", () => {
    expect(versionInRange("4.6.5", "<4.6.6")).toBe(true);
    expect(versionInRange("4.6.6", "<4.6.6")).toBe(false);
    expect(versionInRange("4.6.7", "<4.6.6")).toBe(false);
    expect(versionInRange("3.0.3", "<=3.0.3")).toBe(true);
    expect(versionInRange("3.0.4", "<=3.0.3")).toBe(false);
    expect(versionInRange("1.2.0", ">=1.0.0 <1.5.0")).toBe(true);
    expect(versionInRange("1.5.0", ">=1.0.0 <1.5.0")).toBe(false);
    expect(versionInRange("0.9.9", ">=1.0.0 <1.5.0")).toBe(false);
    expect(versionInRange("2.0.0", "*")).toBe(true);
    expect(versionInRange("1.2.3", "1.2.3")).toBe(true);
    expect(versionInRange("1.2.4", "1.2.3")).toBe(false);
    expect(versionInRange("8.0.1", "<8.0.0")).toBe(false);
    // Prerelease suffixes compare by their numeric triple.
    expect(versionInRange("8.0.0-rc.27", "<8.1.0")).toBe(true);
  });

  it("is LOUD on unparsable inputs (in range — never normalizes a finding away)", () => {
    expect(versionInRange("garbage", "<4.6.6")).toBe(true);
    expect(versionInRange("4.6.7", "~4.6.6")).toBe(true);
    expect(versionInRange("4.6.7", "")).toBe(true);
  });
});

describe("buildDepAuditEnvelope", () => {
  it("answers GREEN with zero findings for a clean report", () => {
    const env = buildDepAuditEnvelope([], CTX, "2026-10-10T00:00:00.000Z");
    expect(env.totalAdvisories).toBe(0);
    expect(env.runtimeFindings).toEqual([]);
    expect(env.nonProductionFindings).toEqual([]);
    expect(env.verdict).toContain("GREEN");
    // The ground truth rides the envelope (self-describing output).
    expect(env.runtimeModules).toEqual(RUNTIME_MODULES);
    expect(env.ranAt).toBe("2026-10-10T00:00:00.000Z");
    expect(env.source).toBe("bun audit");
  });

  it("answers GREEN with both S30 advisories documented as NON-PRODUCTION", () => {
    const advisories = parseBunAuditOutput(S30_BUN_AUDIT);
    const env = buildDepAuditEnvelope(advisories, CTX, "2026-10-10T00:00:00.000Z");
    expect(env.totalAdvisories).toBe(2);
    expect(env.runtimeFindings).toEqual([]);
    expect(env.nonProductionFindings).toHaveLength(2);
    expect(env.nonProductionFindings.map((f) => f.module).sort()).toEqual([
      "braces",
      "deepmerge-ts",
    ]);
    expect(env.verdict).toContain("GREEN");
  });

  it("answers FAIL for the S96 report: the prod-direct zod advisory is a RUNTIME finding, deepmerge-ts stays documented", () => {
    const advisories = parseBunAuditOutput(S96_BUN_AUDIT);
    const env = buildDepAuditEnvelope(advisories, CTX, "2026-10-24T07:00:00.000Z");
    expect(env.totalAdvisories).toBe(2);
    expect(env.runtimeFindings).toHaveLength(1);
    expect(env.runtimeFindings[0].module).toBe("zod");
    expect(env.runtimeFindings[0].verdict).toBe("FAIL");
    expect(env.nonProductionFindings).toHaveLength(1);
    expect(env.nonProductionFindings[0].module).toBe("deepmerge-ts");
    expect(env.nonProductionFindings[0].surface).toBe("cli");
    expect(env.verdict).toContain("FAIL");
  });

  it("answers FAIL and separates both families when a runtime-reachable advisory exists", () => {
    const advisories: AuditAdvisory[] = [
      ...parseBunAuditOutput(S30_BUN_AUDIT),
      {
        module: "next",
        vulnerableRange: "<16.4.1",
        severity: "critical",
        title: "hypothetical runtime bug",
        paths: ["next"],
        url: "https://example.com/n",
        direct: true,
      },
    ];
    const env = buildDepAuditEnvelope(advisories, CTX, "2026-10-10T00:00:00.000Z");
    expect(env.totalAdvisories).toBe(3);
    expect(env.runtimeFindings).toHaveLength(1);
    expect(env.runtimeFindings[0].module).toBe("next");
    expect(env.runtimeFindings[0].verdict).toBe("FAIL");
    expect(env.nonProductionFindings).toHaveLength(2);
    expect(env.verdict).toContain("FAIL");
  });
});

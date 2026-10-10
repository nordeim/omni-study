// The S30 dependency-security seam: parse `bun audit`'s text report (bun
// 1.3.14 has no JSON reporter), classify every advisory by RUNTIME
// REACHABILITY against the production standalone trace, and assemble the
// self-describing envelope. Pure functions with explicit args — the runner
// (`scripts/dep-audit.mjs`, bun-run like prisma/seed.ts) owns the fs reads
// (`.next/standalone/node_modules`, `package.json`) and the `bun audit`
// spawn; everything decidable is decided HERE so the parser format, the
// classification matrix, and the envelope contract are unit-pinned
// (tests/dep-audit.test.ts — the fixtures include the byte-exact report
// that motivated the seam, so a future bun format change fails the pins
// and forces the parser update in the same change).
//
// The doctrine (S27/S28, extended): the standalone trace is the
// reachability ground truth — a HIGH advisory in a dev-only or CLI-only
// chain is a DOCUMENTED risk (evidence: not in the trace), never an
// emergency; a runtime-reachable advisory FAILS loudly. A probe must never
// normalize a genuine finding away, and must never cry wolf on tooling
// the deployment never ships.

export type AuditSeverity = "low" | "moderate" | "high" | "critical";

export interface AuditAdvisory {
  /** The vulnerable package name, e.g. "braces". */
  module: string;
  /** The vulnerable range as bun prints it, e.g. "<=3.0.3". */
  vulnerableRange: string;
  severity: AuditSeverity;
  title: string;
  /** Dependency chains, each "root › … › module" (bun's " › " separator). */
  paths: string[];
  url: string | null;
}

/** Where the vulnerable package is actually reachable from. */
export type AdvisorySurface = "runtime" | "dev" | "cli" | "unclassified";

export interface ClassifiedAdvisory {
  module: string;
  severity: AuditSeverity;
  surface: AdvisorySurface;
  /** True iff the module ships in .next/standalone/node_modules. */
  runtimeReachable: boolean;
  paths: string[];
  /** "FAIL" for runtime-reachable advisories; "NON-PRODUCTION" otherwise. */
  verdict: "FAIL" | "NON-PRODUCTION";
  /** The evidence-bearing explanation (names the roots / the trace). */
  rationale: string;
}

export interface DepAuditContext {
  /** Top-level module roots in .next/standalone/node_modules (scoped pairs expanded). */
  runtimeModules: string[];
  /** package.json "dependencies" keys. */
  prodDependencies: string[];
  /** package.json "devDependencies" keys. */
  devDependencies: string[];
}

export interface DepAuditEnvelope {
  ranAt: string;
  source: "bun audit";
  /** The reachability ground truth, riding the envelope (self-describing). */
  runtimeModules: string[];
  totalAdvisories: number;
  runtimeFindings: ClassifiedAdvisory[];
  nonProductionFindings: ClassifiedAdvisory[];
  verdict: string;
}

const SEVERITIES: readonly AuditSeverity[] = [
  "low",
  "moderate",
  "high",
  "critical",
];

/**
 * Parse `bun audit`'s default text report. The format (bun 1.3.14):
 *
 *   braces  <=3.0.3
 *     (direct dependency)                              ← optional marker
 *     eslint-config-next › … › braces                   ← path chains
 *     high: title - https://github.com/advisories/GHSA… ← severity line
 *   (blank line between advisories)
 *   2 vulnerabilities (2 high)                          ← summary (ignored)
 *
 * Pure: no fs, no spawn. Unknown lines are ignored (forward tolerance);
 * the pins in tests/dep-audit.test.ts guard the format contract.
 */
export function parseBunAuditOutput(text: string): AuditAdvisory[] {
  const advisories: AuditAdvisory[] = [];
  let current: AuditAdvisory | null = null;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.replace(/\r$/, "");

    // Indented lines belong to the current advisory.
    if (line.startsWith("  ")) {
      if (!current) continue;
      const body = line.trim();
      // The "(direct dependency)" marker is not a path.
      if (body.startsWith("(")) continue;

      const severityMatch = SEVERITIES.find(
        (s) => body.startsWith(`${s}:`) || body.startsWith(`${s} :`),
      );
      if (severityMatch) {
        current.severity = severityMatch;
        const rest = body.slice(body.indexOf(":") + 1).trim();
        // "title - url" — split on the LAST " - " before an http(s) link.
        const urlMatch = rest.match(/\s-\s(https?:\/\/\S+)\s*$/);
        if (urlMatch) {
          current.title = rest.slice(0, urlMatch.index).trim();
          current.url = urlMatch[1];
        } else {
          current.title = rest;
        }
        continue;
      }

      // Anything else inside an advisory block with the chain separator is
      // a path; ignore bun's trailing prose ("To update…", "  bun update").
      if (body.includes("›")) {
        current.paths.push(body);
      }
      continue;
    }

    // A non-indented line that is not blank starts a new advisory block:
    // "name  <range>" (the range may be a compound like ">=1.0.0 <1.5.0").
    if (line.trim() && !line.startsWith("[")) {
      const match = line.match(/^(\S+)\s{2,}(.+)$/);
      if (match && !/^\d+ vulnerabilities/i.test(line)) {
        if (current) advisories.push(current);
        current = {
          module: match[1],
          vulnerableRange: match[2].trim(),
          severity: "high", // replaced by the severity line; safe default
          title: "",
          paths: [],
          url: null,
        };
      }
    }
  }
  if (current) advisories.push(current);
  return advisories;
}

function pathRoot(path: string): string {
  const first = path.split("›")[0];
  return first.trim();
}

/**
 * Classify one advisory by reachability. Rules, in order:
 * 1. The module IS in the runtime trace → surface "runtime", FAIL.
 * 2. Not traced + every path roots in a devDependency → "dev".
 * 3. Not traced + any path roots in a prod dependency → "cli" (prod-
 *    declared tooling the runtime never imports — the prisma-CLI class).
 * 4. Roots that classify neither way → "unclassified" (still not in the
 *    trace, so still NON-PRODUCTION — but the rationale says so honestly).
 */
export function classifyAdvisory(
  advisory: AuditAdvisory,
  ctx: DepAuditContext,
): ClassifiedAdvisory {
  const runtimeModules = new Set(ctx.runtimeModules);
  const prodDeps = new Set(ctx.prodDependencies);
  const devDeps = new Set(ctx.devDependencies);
  const roots = advisory.paths.map(pathRoot);

  if (runtimeModules.has(advisory.module)) {
    return {
      module: advisory.module,
      severity: advisory.severity,
      surface: "runtime",
      runtimeReachable: true,
      paths: advisory.paths,
      verdict: "FAIL",
      rationale:
        `The vulnerable package "${advisory.module}" ships in the production ` +
        `standalone trace — this is a RUNTIME finding; fix or override the ` +
        `dependency before deploying.`,
    };
  }

  const anyProdRoot = roots.some((r) => prodDeps.has(r));
  const allDevRoots = roots.length > 0 && roots.every((r) => devDeps.has(r));

  let surface: AdvisorySurface;
  let rationale: string;
  if (anyProdRoot) {
    const prodRoots = roots.filter((r) => prodDeps.has(r));
    surface = "cli";
    rationale =
      `Not in the standalone trace, but reached from the prod-declared ` +
      `tooling ${prodRoots.join(", ")} (the CLI/build class — the app ` +
      `runtime never imports it); documented non-production risk.`;
  } else if (allDevRoots) {
    surface = "dev";
    rationale =
      `Not in the standalone trace; every path roots in a devDependency ` +
      `(${roots.join(", ")}) — dev-time tooling only; documented ` +
      `non-production risk.`;
  } else {
    surface = "unclassified";
    rationale =
      `Not in the standalone trace; the path roots ` +
      `(${roots.join(", ")}) match neither dependency list — verify the ` +
      `chain manually; treated as non-production on trace evidence.`;
  }

  return {
    module: advisory.module,
    severity: advisory.severity,
    surface,
    runtimeReachable: false,
    paths: advisory.paths,
    verdict: "NON-PRODUCTION",
    rationale,
  };
}

/**
 * Assemble the self-describing envelope. The verdict is GREEN iff no
 * advisory is runtime-reachable — the non-production family rides as
 * DOCUMENTED entries with their classification evidence (never silently
 * dropped, never escalated).
 */
export function buildDepAuditEnvelope(
  advisories: AuditAdvisory[],
  ctx: DepAuditContext,
  ranAt: string,
): DepAuditEnvelope {
  const classified = advisories.map((a) => classifyAdvisory(a, ctx));
  const runtimeFindings = classified.filter((c) => c.runtimeReachable);
  const nonProductionFindings = classified.filter((c) => !c.runtimeReachable);

  const verdict =
    runtimeFindings.length === 0
      ? `GREEN — ${nonProductionFindings.length} advisory(ies) documented as non-production (dev/CLI surface), 0 runtime-reachable`
      : `FAIL — ${runtimeFindings.length} runtime-reachable advisory(ies) present; fix or override before deploying`;

  return {
    ranAt,
    source: "bun audit",
    runtimeModules: ctx.runtimeModules,
    totalAdvisories: advisories.length,
    runtimeFindings,
    nonProductionFindings,
    verdict,
  };
}

// S32 suite-verdict — the pure seam that interprets the standing audit
// suite's sixteen heterogeneous envelopes (pin: tests/suite-verdict.test.ts,
// fixtures harvested from the session-65 genuine runs).
//
// THE DOCTRINE (AP-77): the audit-suite operating procedure existed only in
// prose; sixteen envelope shapes were knowledge-in-the-operator's-head, and
// the documented traps recurred across three consecutive sessions (the
// double-run phantom: S29, S31, S65) while five of sixteen envelopes were
// silently mis-parsed by a careful operator following the docs. This seam
// centralizes the interpretation once, unit-pinned.
//
// THE ANTI-PHANTOM GUARD (the S28 lesson, encoded): a missing or wrong-typed
// key on a KNOWN audit shape is a LOUD shape-error — NEVER a silent green,
// NEVER a silent zero. The exact trap of session-65's manual pass was
// `(j.findings||[]).length` reading 0 on five envelopes whose finding arrays
// live nested; a genuine finding in any of them would have been reported
// GREEN. Here, "shape not recognized" is a failing verdict with an
// instruction, so a future audit-script change cannot silently pass.

export const AUDIT_NAMES = [
  "dev-server-preflight",
  "security",
  "settings-roundtrip",
  "connectivity",
  "upload-edge",
  "data-volume",
  "forced-colors",
  "print",
  "focus-order",
  "dark-sweep",
  "accent-dark-sweep",
  "cwv",
  "ai-error",
  "ai-a11y",
  "pre15-preflight",
  "dep-audit",
] as const;

export type AuditName = (typeof AUDIT_NAMES)[number];

export type StageVerdict = {
  green: boolean;
  findings: number;
  note: string;
};

const SHAPE_ERROR_PREFIX = "shape not recognized — the audit script changed; update this seam";

function shapeError(detail: string): StageVerdict {
  return { green: false, findings: 0, note: `${SHAPE_ERROR_PREFIX} (${detail})` };
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isArr(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

// --- parseAuditStdout -------------------------------------------------------
// Strips the leading non-JSON noise every audit emits ("MODE: dark",
// "[cleanup] …", CWV per-scenario progress lines) by slicing from the first
// "{" to the last "}", then JSON.parse. A crashed audit (stack trace, empty
// output) is a LOUD parse error — never a green.

export function parseAuditStdout(raw: string): { ok: true; json: unknown } | { ok: false; error: string } {
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    return { ok: false, error: `parse: no JSON object found in output (${raw.length} bytes)` };
  }
  try {
    return { ok: true, json: JSON.parse(raw.slice(first, last + 1)) };
  } catch (e) {
    return { ok: false, error: `parse: ${String(e).slice(0, 160)}` };
  }
}

// --- the findings-array family ----------------------------------------------
// security, settings-roundtrip, connectivity, upload-edge, data-volume,
// ai-error, ai-a11y — top-level `findings` Array (green iff empty) with
// `nonGaps` Array riding the note.

const FINDINGS_ARRAY_AUDITS: ReadonlySet<string> = new Set([
  "security",
  "settings-roundtrip",
  "connectivity",
  "upload-edge",
  "data-volume",
  "ai-error",
  "ai-a11y",
]);

function classifyFindingsArray(name: string, env: unknown): StageVerdict {
  if (!isObj(env) || !isArr(env.findings)) return shapeError("findings must be an Array");
  if (!isArr(env.nonGaps)) return shapeError("nonGaps must be an Array");
  let note = `${env.nonGaps.length} nonGaps`;
  // The security audit's limiter probe (session-65, run 2's genuine lesson):
  // `cutoffAt < 21` with statuses 400,429 means the ai: budget was PARTIALLY
  // spent BEFORE the audit ran — the limiter is a SHARED 20/15-min per-user
  // budget across EVERY audit invocation, so any manual audit run inside the
  // suite's window (before or during) consumes it. The differential diagnosis:
  // a clean-window re-run that clears it was the pre-spent budget (wait 15
  // min; the suite must be the window's ONLY consumer); a re-run that
  // reproduces it is a genuine limiter defect — fix the code, not the window.
  if (name === "security") {
    const limiterFinding = env.findings.find(
      (f) => isObj(f) && typeof f.surface === "string" && f.surface.includes("limiter shape"),
    );
    if (limiterFinding) {
      note += " — the pre-spent-budget differential: restart the dev server (clears the in-memory limiter — the fast documented remedy) or wait 15 min for the window to roll, then re-run the suite as the window's ONLY consumer (no manual audit runs before/during); if it recurs on a clean window it is a genuine limiter defect — fix the code";
    }
  }
  return {
    green: env.findings.length === 0,
    findings: env.findings.length,
    note,
  };
}

// --- forced-colors ----------------------------------------------------------
// findings live nested at clone.views.{view}.{invisible,unbounded}.

function classifyForcedColors(env: unknown): StageVerdict {
  if (!isObj(env) || !isObj(env.clone) || !isObj(env.clone.views)) {
    return shapeError("clone.views must be an object of per-view probe results");
  }
  let findings = 0;
  let srOnly = 0;
  const views = Object.keys(env.clone.views);
  for (const v of views) {
    const probe = env.clone.views[v];
    if (!isObj(probe) || !isArr(probe.invisible) || !isArr(probe.unbounded)) {
      return shapeError(`clone.views.${v} must carry invisible/unbounded Arrays`);
    }
    findings += probe.invisible.length;
    // The documented non-gap signature (session-65, verified at
    // events-view.tsx:445): an sr-only control is visually hidden BY DESIGN
    // (the accessible twin of a visible picker) — exempt from the
    // unbounded-control requirement. Anything else unbounded is a finding.
    for (const entry of probe.unbounded) {
      if (isObj(entry) && typeof entry.cls === "string" && entry.cls.includes("sr-only")) srOnly += 1;
      else findings += 1;
    }
  }
  return {
    green: findings === 0,
    findings,
    note: `${views.length} views probed; ${srOnly} sr-only controls exempt (visually hidden by design); reference rides the envelope`,
  };
}

// --- print ------------------------------------------------------------------
// findings = light text in print media: lightPrint/darkPrint are per-view
// counts, green iff all zero. The overflow probe data is informational.

function classifyPrint(env: unknown): StageVerdict {
  if (!isObj(env) || !isObj(env.lightPrint) || !isObj(env.darkPrint)) {
    return shapeError("lightPrint/darkPrint must be per-view count objects");
  }
  let findings = 0;
  let views = 0;
  for (const mode of [env.lightPrint, env.darkPrint] as Record<string, unknown>[]) {
    for (const [v, count] of Object.entries(mode)) {
      views += 1;
      if (typeof count !== "number") return shapeError(`print counts must be numbers (${v})`);
      findings += count;
    }
  }
  let overflowEntries = 0;
  if (isObj(env.overflow)) {
    for (const probe of Object.values(env.overflow)) {
      if (isObj(probe) && isArr(probe.overflowRight)) overflowEntries += probe.overflowRight.length;
    }
  }
  return { green: findings === 0, findings, note: `${views} view-counts checked; overflow probe data preserved (${overflowEntries} entries)` };
}

// --- focus-order ------------------------------------------------------------
// findings = per-view anomalies; the dialog/drawer/skipLink guards ride the note.

function classifyFocusOrder(env: unknown): StageVerdict {
  if (!isObj(env) || !isObj(env.views)) return shapeError("views must be an object of per-view tab-stop records");
  let findings = 0;
  let devPortal = 0;
  for (const [v, rec] of Object.entries(env.views)) {
    if (!isObj(rec) || !isArr(rec.anomalies)) {
      return shapeError(`views.${v} must carry an anomalies Array`);
    }
    // The documented non-gap signature (session-65, the AGENTS.md dev-artifact
    // note): the NEXTJS-PORTAL element is the dev-tools overlay injected by
    // the dev server — absent from the standalone build. A focus-order audit
    // against the dev server sees it on every run; it is not an app defect.
    for (const a of rec.anomalies) {
      if (isObj(a) && a.tag === "NEXTJS-PORTAL") devPortal += 1;
      else findings += 1;
    }
  }
  const drawer = isObj(env.drawer) ? env.drawer : {};
  const skip = isObj(env.skipLink) ? env.skipLink : {};
  return {
    green: findings === 0,
    findings,
    note: `dialogs=${isObj(env.dialogs) ? Object.keys(env.dialogs).length : 0}; ${devPortal} dev-portal artifacts excluded (NEXTJS-PORTAL — dev-mode only); drawer/skipLink ride the envelope (${typeof drawer.trap === "boolean" ? drawer.trap : "n/a"}/${typeof (isObj(skip) ? skip.present : null) === "boolean" ? (skip as { present: boolean }).present : "n/a"})`,
  };
}

// --- dark-sweep ---------------------------------------------------------------
// The S27 rot guard: `mode` MUST be "dark" — a light-mode sweep with zero
// findings reads NON-green ("mode=light"), not green. A missing/non-string
// mode is a shape-error.

function classifyDarkSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string");
  if (!isObj(env.views)) return shapeError("views must be an object of per-view results");
  let findings = 0;
  const views = Object.keys(env.views);
  for (const v of views) {
    const rec = env.views[v];
    if (!isObj(rec) || !isArr(rec.flashbulbs) || !isArr(rec.unreadable)) {
      return shapeError(`views.${v} must carry flashbulbs/unreadable Arrays`);
    }
    findings += rec.flashbulbs.length + rec.unreadable.length;
  }
  if (env.mode !== "dark") {
    return { green: false, findings, note: `mode=${env.mode} — the sweep ran in the wrong mode (the S27 rot)` };
  }
  return { green: findings === 0, findings, note: `${views.length} views probed in MODE dark` };
}

// --- accent-dark-sweep --------------------------------------------------------
// FAIL-class = flashbulbs + unreadable; `lowcontrast` is the documented S11
// WARN non-gap family (counted into the note, never the findings).

function classifyAccentDarkSweep(env: unknown): StageVerdict {
  if (!isObj(env) || !isObj(env.desktop) || !isObj(env.mobile)) {
    return shapeError("desktop/mobile must be accent→view maps");
  }
  let findings = 0;
  let warns = 0;
  let ctaFace = 0;
  let entries = 0;
  for (const surface of [env.desktop, env.mobile] as Record<string, unknown>[]) {
    for (const [accent, views] of Object.entries(surface)) {
      if (!isObj(views)) return shapeError(`${accent} must be a view map`);
      for (const [view, rec] of Object.entries(views)) {
        if (!isObj(rec) || !isArr(rec.flashbulbs) || !isArr(rec.unreadable)) {
          return shapeError(`${accent}.${view} must carry flashbulbs/unreadable Arrays`);
        }
        entries += 1;
        findings += rec.flashbulbs.length; // flashbulbs are ALWAYS findings — never a signature class
        // The documented non-gap signature (session-65, verified against
        // remediation-plan-session11 family 2): white-on-accent unreadable
        // entries are the accent CTA face — the SAME design in light mode,
        // the reference's own accent-CTA choice (2.15 under the bright
        // accents). Any other unreadable combination is a genuine finding.
        for (const entry of rec.unreadable) {
          if (isObj(entry) && entry.color === "rgb(255, 255, 255)") ctaFace += 1;
          else findings += 1;
        }
        if (isArr(rec.lowcontrast)) warns += rec.lowcontrast.length;
      }
    }
  }
  return {
    green: findings === 0,
    findings,
    note: `${entries} entries probed; ${ctaFace} CTA-face exempt (white on accent-500 — the S11 family-2 non-gap); ${warns} WARN (lowcontrast — the S11 non-gap family)`,
  };
}

// --- cwv -----------------------------------------------------------------------
// Ratings GOOD/NI/POOR/BAD. FINDINGS = clone-* scenarios rated POOR/BAD;
// NI = the documented S16 state (not a finding); ref-* scenarios are
// informational (the reference's own mobile login LCP POOR is the documented
// reference state, not a clone finding).

const CWV_RATINGS = new Set(["GOOD", "NI", "POOR", "BAD"]);

function classifyCwv(env: unknown): StageVerdict {
  if (!isObj(env) || !isObj(env.verdicts)) return shapeError("verdicts must be a scenario→rating map");
  let findings = 0;
  const refPoor: string[] = [];
  for (const [scenario, ratings] of Object.entries(env.verdicts)) {
    if (!isObj(ratings)) return shapeError(`${scenario} must be a ratings object`);
    for (const [metric, rating] of Object.entries(ratings)) {
      if (typeof rating !== "string" || !CWV_RATINGS.has(rating)) {
        return shapeError(`${scenario}.${metric} rating "${String(rating)}" is outside GOOD/NI/POOR/BAD`);
      }
      const bad = rating === "POOR" || rating === "BAD";
      if (!bad) continue;
      if (scenario.startsWith("clone-")) findings += 1;
      else if (scenario.startsWith("ref-")) refPoor.push(scenario);
    }
  }
  const refNote = refPoor.length
    ? `${refPoor.length} ref POOR (the reference's own documented state — informational, not a clone finding)`
    : "no ref POOR";
  return { green: findings === 0, findings, note: `ref POOR informational; ${refNote}` };
}

// --- verdict-string family (pre15-preflight, dep-audit) ------------------------

const VERDICT_STRING_AUDITS: ReadonlySet<string> = new Set(["pre15-preflight", "dep-audit"]);

function classifyVerdictString(name: string, env: unknown): StageVerdict {
  if (!isObj(env) || typeof env.verdict !== "string") return shapeError("verdict must be a string");
  const advisoryNote =
    name === "dep-audit" && isArr(env.advisories)
      ? `${env.advisories.length} advisories`
      : "";
  const note = [env.verdict, advisoryNote].filter(Boolean).join(" · ");
  return { green: env.verdict.startsWith("GREEN"), findings: 0, note };
}

// --- dev-server-preflight ------------------------------------------------------
// verdict "green" | "reload-loop" | "no-hydration" | "unreachable"; the remedy
// rides the note on failure.

function classifyPreflight(env: unknown): StageVerdict {
  if (!isObj(env) || typeof env.verdict !== "string") return shapeError("verdict must be a string");
  if (env.verdict === "green") return { green: true, findings: 0, note: "hydrated and navigation-stable" };
  const remedy = typeof env.remedy === "string" ? env.remedy : "see the preflight output";
  return { green: false, findings: 1, note: `${env.verdict} — ${remedy}` };
}

// --- classifyAudit ---------------------------------------------------------------

export function classifyAudit(name: string, envelope: unknown): StageVerdict {
  if (FINDINGS_ARRAY_AUDITS.has(name)) return classifyFindingsArray(name, envelope);
  if (name === "forced-colors") return classifyForcedColors(envelope);
  if (name === "print") return classifyPrint(envelope);
  if (name === "focus-order") return classifyFocusOrder(envelope);
  if (name === "dark-sweep") return classifyDarkSweep(envelope);
  if (name === "accent-dark-sweep") return classifyAccentDarkSweep(envelope);
  if (name === "cwv") return classifyCwv(envelope);
  if (VERDICT_STRING_AUDITS.has(name)) return classifyVerdictString(name, envelope);
  if (name === "dev-server-preflight") return classifyPreflight(envelope);
  return shapeError(`unknown audit "${name}" — not in the standing suite`);
}

// --- suiteVerdict ----------------------------------------------------------------

export function suiteVerdict(
  rows: ReadonlyArray<{ name: string; verdict: StageVerdict }>,
): { green: boolean; failed: string[]; summary: string } {
  const failed = rows.filter((r) => !r.verdict.green).map((r) => r.name);
  const greenCount = rows.length - failed.length;
  const shapeErrors = rows
    .filter((r) => r.verdict.note.includes("shape not recognized"))
    .map((r) => `${r.name}: ${r.verdict.note}`);
  const parts = [`${greenCount}/${rows.length} green`];
  if (shapeErrors.length) parts.push(`shape errors: ${shapeErrors.join("; ")}`);
  return { green: failed.length === 0, failed, summary: parts.join(" — ") };
}

// S32 standing-suite orchestrator — ONE command for the whole standing audit
// suite. Run with BUN (imports the TS seam, the dep-audit.mjs /
// dev-server-preflight.mjs precedent):
//
//   bun scripts/standing-suite.mjs
//
// Stages (the documented S31 order), each spawned EXACTLY ONCE with its
// stdout classified through the unit-pinned seam src/lib/suite-verdict.ts:
//
//   0. dev-server-preflight  (the S31 convention, ENFORCED: abort the suite
//      loudly on any non-green verdict, remedy included — the boot-stability
//      precondition is executable, not advisory)
//   1-15. security, settings-roundtrip, connectivity, upload-edge,
//      data-volume, forced-colors, print, focus-order, dark-sweep,
//      accent-dark-sweep, cwv, ai-error, ai-a11y, pre15-preflight, dep-audit
//   16. the demo-theme closing guard (light/violet via Prisma — a mid-suite
//      crash must not leave the demo user dark/teal, the documented
//      poisoning class)
//
// CWV's :3200 precondition is executable: the runner probes
// :3200/api/health; if dead and the standalone build exists it starts one
// itself (ephemeral AUTH_SECRET — the S22 boot-guard satisfied; the
// documented db convention), and stops what it started at suite end.
//
// Output: one table (STAGE | VERDICT | FINDINGS | NOTE) + one JSON envelope
// to stdout; per-stage raw envelopes under /tmp/standing-suite/; exit 0 iff
// the suite is green. The single-run-per-audit design makes the S29/S31/S65
// double-run phantom impossible by construction.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

import { classifyAudit, parseAuditStdout, suiteVerdict } from "../src/lib/suite-verdict.ts";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW_DIR = "/tmp/standing-suite";
const CWV_PORT = 3200;

// The documented S31 sequence. dep-audit + the preflight run under BUN (they
// import TS seams); the rest run under node (their documented invocation).
const STAGES = [
  { name: "security", file: "scripts/security-audit.mjs", runtime: "node" },
  { name: "settings-roundtrip", file: "scripts/settings-roundtrip-audit.mjs", runtime: "node" },
  { name: "connectivity", file: "scripts/connectivity-audit.mjs", runtime: "node" },
  { name: "upload-edge", file: "scripts/upload-edge-audit.mjs", runtime: "node" },
  { name: "data-volume", file: "scripts/data-volume-audit.mjs", runtime: "node" },
  { name: "forced-colors", file: "scripts/forced-colors-sweep.mjs", runtime: "node" },
  { name: "print", file: "scripts/print-audit.mjs", runtime: "node" },
  { name: "focus-order", file: "scripts/focus-order-audit.mjs", runtime: "node" },
  { name: "dark-sweep", file: "scripts/dark-sweep.mjs", runtime: "node" },
  { name: "accent-dark-sweep", file: "scripts/accent-dark-sweep.mjs", runtime: "node" },
  { name: "cwv", file: "scripts/cwv-audit-s16.mjs", runtime: "node" },
  { name: "ai-error", file: "scripts/ai-error-audit.mjs", runtime: "node" },
  { name: "ai-a11y", file: "scripts/ai-a11y-audit.mjs", runtime: "node" },
  { name: "pre15-preflight", file: "scripts/pre15-preflight.mjs", runtime: "node" },
  { name: "dep-audit", file: "scripts/dep-audit.mjs", runtime: "bun" },
];

const STAGE_TIMEOUT_MS = 10 * 60_000;
const SETTLE_MS = 500;

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

function run(cmd, args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: REPO, env: { ...process.env } });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve({ code: 124, stdout, stderr: `${stderr}\n[standing-suite] timed out after ${timeoutMs} ms` });
    }, timeoutMs);
    child.stdout.on("data", (c) => (stdout += c));
    child.stderr.on("data", (c) => (stderr += c));
    child.on("error", (e) => {
      clearTimeout(timer);
      resolve({ code: 127, stdout, stderr: String(e) });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

async function health(base, timeoutMs = 4000) {
  try {
    const res = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(timeoutMs) });
    return res.status === 200;
  } catch {
    return false;
  }
}

// --- the :3200 standalone precondition (executable, the S31 spirit) --------

async function ensureStandalone() {
  if (await health(`http://localhost:${CWV_PORT}`)) return { ok: true, startedHere: false };
  const serverJs = join(REPO, ".next/standalone/server.js");
  if (!existsSync(serverJs)) {
    return { ok: false, error: "the standalone build is missing — run `bun run build` first (required before e2e/CWV)" };
  }
  const AUTH_SECRET = randomBytes(32).toString("hex"); // ephemeral per suite run — the S22 boot-guard satisfied
  const child = spawn("node", [serverJs], {
    cwd: join(REPO, ".next/standalone"),
    env: {
      ...process.env,
      PORT: String(CWV_PORT),
      HOSTNAME: "127.0.0.1",
      DATABASE_URL: "file:../db/custom.db",
      AUTH_SECRET,
    },
    stdio: "ignore",
    detached: false,
  });
  for (let i = 0; i < 40; i += 1) {
    await new Promise((r) => setTimeout(r, 500));
    if (await health(`http://localhost:${CWV_PORT}`, 2000)) return { ok: true, startedHere: true, pid: child.pid };
    if (child.exitCode !== null) break;
  }
  child.kill("SIGKILL");
  return { ok: false, error: "the standalone server on :3200 failed to become healthy (boot guard? build stale?)" };
}

// --- the stages ---------------------------------------------------------------

async function runAuditStage(spec) {
  const { code, stdout, stderr } = await run(spec.runtime, [join(REPO, spec.file)], STAGE_TIMEOUT_MS);
  writeFileSync(join(RAW_DIR, `${spec.name}.json`), stdout);
  if (code !== 0) {
    return {
      name: spec.name,
      verdict: { green: false, findings: 0, note: `stage exited ${code} — ${stderr.trim().split("\n").slice(-2).join(" ").slice(0, 160)}` },
      code,
    };
  }
  const parsed = parseAuditStdout(stdout);
  if (!parsed.ok) {
    return { name: spec.name, verdict: { green: false, findings: 0, note: `stdout did not parse: ${parsed.error}` }, code };
  }
  return { name: spec.name, verdict: classifyAudit(spec.name, parsed.json), code };
}

async function themeGuard() {
  // The audit-script pattern (ai-error-audit.mjs): the datasources URL is
  // schema-anchored — run from the repo root.
  const prisma = new PrismaClient({ datasources: { db: { url: "file:../db/custom.db" } } });
  try {
    const u = await prisma.user.findUnique({
      where: { email: "demo@studyflow.app" },
      select: { themeMode: true, accentColor: true },
    });
    if (!u) {
      return { name: "theme-restore", verdict: { green: false, findings: 1, note: "demo user not found — seed first (bun run db:seed)" } };
    }
    const okTheme = u.themeMode === "light" && u.accentColor === "violet";
    return {
      name: "theme-restore",
      verdict: {
        green: okTheme,
        findings: okTheme ? 0 : 1,
        note: `demo theme = ${u.themeMode}/${u.accentColor} (expected light/violet — a mid-suite crash must not leave the demo user mutated)`,
      },
    };
  } finally {
    await prisma.$disconnect();
  }
}

// --- main ------------------------------------------------------------------------

mkdirSync(RAW_DIR, { recursive: true });
const ranAt = new Date().toISOString();
const rows = [];
let standalone = null;
let aborted = false;
let cwvPreconditionFailed = false;

try {
  // Stage 0 — the S31 preflight FIRST, enforced (the suite never starts on an
  // unstable boot; the remedy rides the verdict).
  log(`[standing-suite] stage 0/16 — dev-server-preflight (the S31 boot-stability precondition)`);
  const pre = await run("bun", [join(REPO, "scripts/dev-server-preflight.mjs")], 90_000);
  writeFileSync(join(RAW_DIR, "dev-server-preflight.json"), pre.stdout);
  const preParsed = parseAuditStdout(pre.stdout);
  const preVerdict = preParsed.ok
    ? classifyAudit("dev-server-preflight", preParsed.json)
    : { green: false, findings: 1, note: `preflight output did not parse: ${preParsed.error}` };
  rows.push({ name: "dev-server-preflight", verdict: preVerdict });
  if (!preVerdict.green) {
    log(`[standing-suite] ABORTED before any audit — dev-server preflight not green.\n  remedy: ${preVerdict.note}`);
    aborted = true;
  }

  if (!aborted) {
    // The CWV standalone precondition (before the audits, so a missing build
    // is loud BEFORE half the suite has run; a failed precondition records
    // the loud cwv row and skips spawning that stage).
    const sa = await ensureStandalone();
    if (!sa.ok) {
      cwvPreconditionFailed = true;
      rows.push({ name: "cwv", verdict: { green: false, findings: 0, note: `shape not recognized — ${sa.error}` } });
    } else {
      standalone = { startedHere: sa.startedHere, pid: sa.pid };
    }

    for (let i = 0; i < STAGES.length; i += 1) {
      const spec = STAGES[i];
      if (spec.name === "cwv" && cwvPreconditionFailed) {
        log(`[standing-suite] stage ${i + 1}/16 — cwv SKIPPED (standalone precondition failed — the loud row is already recorded)`);
        continue;
      }
      log(`[standing-suite] stage ${i + 1}/16 — ${spec.name}`);
      const r = await runAuditStage(spec);
      rows.push({ name: r.name, verdict: r.verdict });
      await new Promise((res) => setTimeout(res, SETTLE_MS));
    }

    // The closing guard.
    log(`[standing-suite] stage 16/16 — theme-restore (the demo-theme closing guard)`);
    rows.push(await themeGuard());
  }
} finally {
  if (standalone && standalone.startedHere && standalone.pid) {
    try {
      process.kill(standalone.pid, "SIGKILL");
      log(`[standing-suite] stopped the standalone :3200 server it started (pid ${standalone.pid})`);
    } catch {
      /* already gone */
    }
  }
}

const agg = suiteVerdict(rows);
const envelope = {
  ranAt,
  source: "standing-suite",
  stages: rows.map((r) => ({ name: r.name, green: r.verdict.green, findings: r.verdict.findings, note: r.verdict.note })),
  rawDir: RAW_DIR,
  standalone: standalone ? { startedHere: standalone.startedHere } : null,
  aborted,
  ...agg,
};

log("");
log("STAGE                    | VERDICT | FINDINGS | NOTE");
log("-------------------------+---------+----------+-----------------------------------------------");
for (const r of rows) {
  const verdict = r.verdict.green ? "GREEN  " : "FAIL   ";
  log(`${r.name.padEnd(25)}| ${verdict} | ${String(r.verdict.findings).padEnd(8)} | ${r.verdict.note.slice(0, 110)}`);
}
log("");
log(JSON.stringify(envelope, null, 1));
log(`\nSTANDING SUITE: ${agg.green ? "GREEN" : "NOT GREEN"} — ${agg.summary}`);
process.exit(agg.green ? 0 : 1);

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
  "mobile-sweep",
  "midband-sweep",
  "landscape-sweep",
  "dark-mobile-sweep",
  "accent-light-sweep",
  "accent-midband-sweep",
  "accent-landscape-sweep",
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

// --- mobile-sweep (S33) ------------------------------------------------------
// The light-mode 390×844 drawer-navigation sweep — the mobile navigation
// menu's executable guarantee (the AP-78 doctrine: the manual walkthrough
// every session narrative recorded as prose, encoded as a standing probe).
// Every view is navigated THROUGH THE DRAWER (the menu is the vehicle), each
// view record carrying the identity heading, the scrollWidth measurement
// (the no-horizontal-overflow guarantee), the drawer-closed flag, the app-bar
// check, and the per-view console-error list. mode MUST be "light" — the
// dark/accent mobile surfaces belong to their own audits, and a dark-mode run
// of the LIGHT sweep is the exact S27 rot class.

function classifyMobileSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string");
  if (!isObj(env.viewport) || env.viewport.width !== 390) {
    return shapeError("viewport must be the mobile 390×844 — the finding classes are width-dependent");
  }
  if (!isObj(env.views)) return shapeError("views must be an object of per-view records");
  if (!isObj(env.drawer) || typeof env.drawer.linkCount !== "number" || typeof env.drawer.order !== "string") {
    return shapeError("drawer must carry linkCount + order (the drawer-content check)");
  }
  if (!isArr(env.findings)) return shapeError("findings must be an Array");
  const views = Object.keys(env.views);
  for (const v of views) {
    const rec = env.views[v];
    if (!isObj(rec)) return shapeError(`views.${v} must be a record`);
    if (typeof rec.heading !== "string" || rec.heading.length === 0) {
      return shapeError(`views.${v}.heading must be a non-empty string`);
    }
    if (typeof rec.scrollWidth !== "number") return shapeError(`views.${v}.scrollWidth must be a number`);
    if (typeof rec.drawerClosed !== "boolean") return shapeError(`views.${v}.drawerClosed must be a boolean`);
    if (typeof rec.appBar !== "boolean") return shapeError(`views.${v}.appBar must be a boolean`);
    if (!isArr(rec.consoleErrors)) return shapeError(`views.${v}.consoleErrors must be an Array`);
  }
  if (env.mode !== "light") {
    return {
      green: false,
      findings: env.findings.length,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (the S27 rot class; the LIGHT-mode mobile surface is this audit's contract — the dark/accent mobile surfaces belong to their own audits)`,
    };
  }
  return {
    green: env.findings.length === 0,
    findings: env.findings.length,
    note: `${views.length} views swept through the drawer at 390×844 (light); drawer carried ${env.drawer.linkCount} links`,
  };
}

// --- midband-sweep (S34) -----------------------------------------------------
// The light-mode 768×1024 drawer-navigation sweep — the md breakpoint, the
// switchiest width in the 391–1023px band the standing surface never probed
// (the AP-79 lesson: a viewport band between pinned widths is a blind band —
// S16's mobile-only-gap class one band out). Every view is navigated THROUGH
// THE DRAWER (the navigation vehicle through the whole band — the sidebar is
// lg:flex, so below 1024 the drawer is the only vehicle), each view record
// carrying the identity heading, the scrollWidth measurement (≤ 768 — the
// Timetable's min-w-[900px] canvas must live INSIDE its overflow-x-auto
// container, never widen the document), the drawer-closed flag, the app-bar
// check, and the per-view console-error list. The chrome record carries the
// vehicle contract: sidebarVisible MUST be false and hamburgerVisible MUST
// be true at 768 — a violation is the lg-contract break, a genuine finding
// class (the seam is the interpretation layer, the S32 doctrine).

function classifyMidbandSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string");
  if (!isObj(env.viewport) || env.viewport.width !== 768) {
    return shapeError("viewport must be the mid-band 768×1024 (the md breakpoint) — the finding classes are width-dependent");
  }
  if (!isObj(env.chrome) || typeof env.chrome.sidebarVisible !== "boolean" || typeof env.chrome.hamburgerVisible !== "boolean") {
    return shapeError("chrome must carry boolean sidebarVisible + hamburgerVisible (the vehicle contract)");
  }
  if (!isObj(env.views)) return shapeError("views must be an object of per-view records");
  if (!isObj(env.drawer) || typeof env.drawer.linkCount !== "number" || typeof env.drawer.order !== "string") {
    return shapeError("drawer must carry linkCount + order (the drawer-content check)");
  }
  if (!isArr(env.findings)) return shapeError("findings must be an Array");
  const views = Object.keys(env.views);
  for (const v of views) {
    const rec = env.views[v];
    if (!isObj(rec)) return shapeError(`views.${v} must be a record`);
    if (typeof rec.heading !== "string" || rec.heading.length === 0) {
      return shapeError(`views.${v}.heading must be a non-empty string`);
    }
    if (typeof rec.scrollWidth !== "number") return shapeError(`views.${v}.scrollWidth must be a number`);
    if (typeof rec.drawerClosed !== "boolean") return shapeError(`views.${v}.drawerClosed must be a boolean`);
    if (typeof rec.appBar !== "boolean") return shapeError(`views.${v}.appBar must be a boolean`);
    if (!isArr(rec.consoleErrors)) return shapeError(`views.${v}.consoleErrors must be an Array`);
  }
  if (env.mode !== "light") {
    return {
      green: false,
      findings: env.findings.length,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (the S27 rot class; the LIGHT-mode mid-band surface is this audit's contract — the dark/accent surfaces belong to their own audits)`,
    };
  }
  if (env.chrome.sidebarVisible || !env.chrome.hamburgerVisible) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the chrome contract broke at 768 — sidebarVisible=${env.chrome.sidebarVisible}, hamburgerVisible=${env.chrome.hamburgerVisible} (the lg contract: the sidebar renders only ≥1024; below that the drawer is the vehicle — this is the vehicle-contract finding class)`,
    };
  }
  return {
    green: env.findings.length === 0,
    findings: env.findings.length,
    note: `${views.length} views swept through the drawer at 768×1024 (light, the md breakpoint); drawer carried ${env.drawer.linkCount} links; chrome contract holds (sidebar hidden, hamburger visible)`,
  };
}

// --- landscape-sweep (S35) ----------------------------------------------------
// The light-mode 844×390 phone-landscape drawer-navigation sweep — the
// HEIGHT axis the standing surface never varied (every pinned viewport was
// portrait-tall; the AP-80 lesson: an axis never varied is an axis never
// verified). Per-view shape as the midband sweep + headingClearance (the
// fixed h-16 bar covers 16% of a 390px viewport); the chrome record gains
// drawerNavScrollable — the short-viewport contract: the 20 reference-
// measured nav rows cannot fit the ~300px nav area at 390 height, so the
// nav scroll is the ONLY path to links 8–20 in landscape (measured live:
// scrollHeight 1068 vs clientHeight 301). A non-scrolling reading means
// the drawer geometry changed — the new class this audit owns.

function classifyLandscapeSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string");
  if (!isObj(env.viewport) || env.viewport.width !== 844 || env.viewport.height !== 390) {
    return shapeError("viewport must be the phone-landscape 844×390 (the iPhone-class landscape) — the finding classes are HEIGHT-dependent (the axis this audit owns)");
  }
  if (
    !isObj(env.chrome) ||
    typeof env.chrome.sidebarVisible !== "boolean" ||
    typeof env.chrome.hamburgerVisible !== "boolean" ||
    typeof env.chrome.drawerNavScrollable !== "boolean"
  ) {
    return shapeError("chrome must carry boolean sidebarVisible + hamburgerVisible + drawerNavScrollable (the vehicle + short-viewport contracts)");
  }
  if (!isObj(env.views)) return shapeError("views must be an object of per-view records");
  if (!isObj(env.drawer) || typeof env.drawer.linkCount !== "number" || typeof env.drawer.order !== "string") {
    return shapeError("drawer must carry linkCount + order (the drawer-content check)");
  }
  if (!isArr(env.findings)) return shapeError("findings must be an Array");
  const views = Object.keys(env.views);
  for (const v of views) {
    const rec = env.views[v];
    if (!isObj(rec)) return shapeError(`views.${v} must be a record`);
    if (typeof rec.heading !== "string" || rec.heading.length === 0) {
      return shapeError(`views.${v}.heading must be a non-empty string`);
    }
    if (typeof rec.scrollWidth !== "number") return shapeError(`views.${v}.scrollWidth must be a number`);
    if (typeof rec.drawerClosed !== "boolean") return shapeError(`views.${v}.drawerClosed must be a boolean`);
    if (typeof rec.appBar !== "boolean") return shapeError(`views.${v}.appBar must be a boolean`);
    if (typeof rec.headingClearance !== "boolean") {
      return shapeError(`views.${v}.headingClearance must be a boolean (the fixed-bar clearance — the h-16 bar covers 16% of a 390px viewport)`);
    }
    if (!isArr(rec.consoleErrors)) return shapeError(`views.${v}.consoleErrors must be an Array`);
  }
  if (env.mode !== "light") {
    return {
      green: false,
      findings: env.findings.length,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (the S27 rot class; the LIGHT-mode phone-landscape surface is this audit's contract — the dark/accent surfaces belong to their own audits)`,
    };
  }
  if (env.chrome.sidebarVisible || !env.chrome.hamburgerVisible) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the chrome contract broke at 844×390 — sidebarVisible=${env.chrome.sidebarVisible}, hamburgerVisible=${env.chrome.hamburgerVisible} (the lg contract: the sidebar renders only ≥1024; below that the drawer is the vehicle — the vehicle-contract finding class)`,
    };
  }
  if (!env.chrome.drawerNavScrollable) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the short-viewport contract broke — drawerNavScrollable=false at 390 height (the nav geometry: the 20 reference-measured rows cannot fit the ~300px nav area, so a non-scrolling nav means the drawer geometry changed — links beyond the fold would be unreachable in landscape)`,
    };
  }
  return {
    green: env.findings.length === 0,
    findings: env.findings.length,
    note: `${views.length} views swept through the drawer at 844×390 (light, the iPhone-class landscape); drawer carried ${env.drawer.linkCount} links; vehicle + nav-scroll contracts hold (sidebar hidden, hamburger visible, nav scrollable)`,
  };
}

// --- dark-mobile-sweep (S36) ----------------------------------------------------
// The dark-mode 390×844 drawer-navigation sweep — the MODE axis at the
// mobile viewport the standing surface never varied (the AP-81 lesson: a
// mode never varied at a viewport is a blind combo — dark × mobile was
// covered for 6 of 20 views by accent-dark-sweep; 14 views had never been
// rendered in dark at the stacked mobile layout by any standing audit, and
// every light mobile sweep is mode-rot-guarded by construction). Dark mode
// is the clone's SUPERSET feature (the reference's own Dark/System options
// are a measured Base44 no-op — S10-1), so the dark detectors here are a
// superset-quality contract. Per-view shape as the landscape sweep
// (heading/scrollWidth/drawerClosed/appBar/headingClearance/consoleErrors)
// + the dark-sweep detector family (flashbulbs/unreadable); the drawer
// record gains dark (the drawer's own dark rendering: dark:bg-slate-950
// panel). The dark detections are counted INDEPENDENTLY of the findings
// array (the dark-sweep semantics — a probe that forgets to push a
// detector hit into findings still reads NON-GREEN at this seam).

function classifyDarkMobileSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string");
  if (!isObj(env.viewport) || env.viewport.width !== 390 || env.viewport.height !== 844) {
    return shapeError(
      "viewport must be the mobile portrait 390×844 (the S33 mobile class) — the DARK-mode mobile surface is this audit's contract (the landscape/mid-band dark combos are documented non-gaps)",
    );
  }
  if (
    !isObj(env.chrome) ||
    typeof env.chrome.sidebarVisible !== "boolean" ||
    typeof env.chrome.hamburgerVisible !== "boolean"
  ) {
    return shapeError("chrome must carry boolean sidebarVisible + hamburgerVisible (the vehicle contract)");
  }
  if (!isObj(env.views)) return shapeError("views must be an object of per-view records");
  if (
    !isObj(env.drawer) ||
    typeof env.drawer.linkCount !== "number" ||
    typeof env.drawer.order !== "string" ||
    !isObj(env.drawer.dark) ||
    typeof env.drawer.dark.flashbulbs !== "number" ||
    typeof env.drawer.dark.unreadable !== "number"
  ) {
    return shapeError("drawer must carry linkCount + order + dark {flashbulbs, unreadable} (the drawer's own dark rendering)");
  }
  if (!isArr(env.findings)) return shapeError("findings must be an Array");
  const views = Object.keys(env.views);
  for (const v of views) {
    const rec = env.views[v];
    if (!isObj(rec)) return shapeError(`views.${v} must be a record`);
    if (typeof rec.heading !== "string" || rec.heading.length === 0) {
      return shapeError(`views.${v}.heading must be a non-empty string`);
    }
    if (typeof rec.scrollWidth !== "number") return shapeError(`views.${v}.scrollWidth must be a number`);
    if (typeof rec.drawerClosed !== "boolean") return shapeError(`views.${v}.drawerClosed must be a boolean`);
    if (typeof rec.appBar !== "boolean") return shapeError(`views.${v}.appBar must be a boolean`);
    if (typeof rec.headingClearance !== "boolean") {
      return shapeError(`views.${v}.headingClearance must be a boolean (the fixed-bar clearance — carried from S35)`);
    }
    if (!isArr(rec.flashbulbs)) {
      return shapeError(`views.${v}.flashbulbs must be an Array (the dark-sweep detector family at the mobile layout)`);
    }
    if (!isArr(rec.unreadable)) {
      return shapeError(`views.${v}.unreadable must be an Array (the dark-sweep detector family at the mobile layout)`);
    }
    if (!isArr(rec.consoleErrors)) return shapeError(`views.${v}.consoleErrors must be an Array`);
  }
  if (env.mode !== "dark") {
    return {
      green: false,
      findings: env.findings.length,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (the S27 rot class; the DARK-mode mobile surface is this audit's contract — the light mobile family belongs to mobile-sweep)`,
    };
  }
  if (env.chrome.sidebarVisible || !env.chrome.hamburgerVisible) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the chrome contract broke at 390 — sidebarVisible=${env.chrome.sidebarVisible}, hamburgerVisible=${env.chrome.hamburgerVisible} (the lg contract: the sidebar renders only ≥1024; below that the drawer is the vehicle — the vehicle-contract finding class)`,
    };
  }
  // The independent dark-detection count (the dark-sweep semantics).
  let darkDetections = 0;
  for (const v of views) {
    const rec = env.views[v];
    if (!isObj(rec)) continue; // already shape-checked above; defensive only
    if (isArr(rec.flashbulbs)) darkDetections += rec.flashbulbs.length;
    if (isArr(rec.unreadable)) darkDetections += rec.unreadable.length;
  }
  darkDetections += env.drawer.dark.flashbulbs + env.drawer.dark.unreadable;
  if (darkDetections > 0) {
    return {
      green: false,
      findings: env.findings.length + darkDetections,
      note: `${darkDetections} dark detection(s) across ${views.length} views + the drawer (flashbulb/unreadable — the dark-sweep detector family at the mobile layout; counted independently of the findings array)`,
    };
  }
  return {
    green: env.findings.length === 0,
    findings: env.findings.length,
    note: `${views.length} views swept through the drawer at 390×844 in MODE dark; drawer carried ${env.drawer.linkCount} links; vehicle contract holds (sidebar hidden, hamburger visible); 0 dark detections`,
  };
}

// --- accent-light-sweep (S37) ---------------------------------------------------
// The ACCENT axis in LIGHT mode — the theme dimension the standing surface
// never varies in light (the AP-82 lesson: the accent-dark-sweep varies the
// accent ONLY in dark — its own name is the blind spot; every light pin
// rides the default violet; the only light × non-violet rendering in any
// standing artifact is ONE desktop calculator view). The reference's accent
// picker saves but never re-themes (re-verified live in session 3) — the
// clone's working accent system is the functional superset, so its
// light-mode correctness is a superset-quality contract. Per-accent shape:
// applied (the self-verified <html data-accent> reading — an accent whose
// applied reading differs from its key did NOT apply and reads non-green)
// + views (heading/scrollWidth/unreadable/lowcontrast/consoleErrors — the
// contrast detector family ported to the light canvas; the flashbulb class
// does not apply in light mode) + the drawer record (the active-link tint
// is accent-driven). The ALL-ACCENTS guard: accents must carry all 7 — an
// accent that silently did not run must never read green-by-omission. The
// CTA-face exemption (the S11 family-2 non-gap in light: white on
// accent-500 is the reference's own accent-CTA choice) counts into the
// note, never the findings; lowcontrast entries are WARN (the note, never
// the findings). The contrast detections are counted INDEPENDENTLY of the
// findings array (the anti-phantom doctrine).

const ACCENT_LIGHT_ALL_ACCENTS = new Set(["violet", "blue", "green", "orange", "pink", "red", "teal"]);

function classifyAccentLightSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string");
  if (!isObj(env.viewport) || env.viewport.width !== 390 || env.viewport.height !== 844) {
    return shapeError(
      "viewport must be the mobile portrait 390×844 (the S33 mobile class) — the LIGHT-mode accent surface is this audit's contract (the desktop/mid-band light-accent combos are documented non-gaps)",
    );
  }
  if (
    !isObj(env.chrome) ||
    typeof env.chrome.sidebarVisible !== "boolean" ||
    typeof env.chrome.hamburgerVisible !== "boolean"
  ) {
    return shapeError("chrome must carry boolean sidebarVisible + hamburgerVisible (the vehicle contract)");
  }
  if (!isObj(env.accents)) return shapeError("accents must be an object of per-accent records");
  if (!isArr(env.findings)) return shapeError("findings must be an Array");
  const accentKeys = Object.keys(env.accents);
  for (const a of ACCENT_LIGHT_ALL_ACCENTS) {
    if (!(a in env.accents)) {
      return shapeError(
        `accents must carry all 7 (violet, blue, green, orange, pink, red, teal) — "${a}" is missing: an accent that silently did not run must never read green-by-omission`,
      );
    }
  }
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec)) return shapeError(`accents.${a} must be a record`);
    if (typeof rec.applied !== "string") return shapeError(`accents.${a}.applied must be a string (the self-verified <html data-accent> reading)`);
    if (!isObj(rec.views)) return shapeError(`accents.${a}.views must be an object of per-view records`);
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) return shapeError(`accents.${a}.views.${v} must be a record`);
      if (typeof vr.heading !== "string" || vr.heading.length === 0) {
        return shapeError(`accents.${a}.views.${v}.heading must be a non-empty string`);
      }
      if (typeof vr.scrollWidth !== "number") return shapeError(`accents.${a}.views.${v}.scrollWidth must be a number`);
      if (!isArr(vr.unreadable)) return shapeError(`accents.${a}.views.${v}.unreadable must be an Array (the light contrast detector family)`);
      if (!isArr(vr.lowcontrast)) return shapeError(`accents.${a}.views.${v}.lowcontrast must be an Array (the light contrast detector family)`);
      if (!isArr(vr.consoleErrors)) return shapeError(`accents.${a}.views.${v}.consoleErrors must be an Array`);
    }
    if (
      !isObj(rec.drawer) ||
      typeof rec.drawer.linkCount !== "number" ||
      !isArr(rec.drawer.unreadable) ||
      !isArr(rec.drawer.lowcontrast)
    ) {
      return shapeError(`accents.${a}.drawer must carry linkCount + unreadable + lowcontrast Arrays (the drawer's own accent rendering)`);
    }
  }
  if (env.mode !== "light") {
    return {
      green: false,
      findings: env.findings.length,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (the S27 rot class; the LIGHT-mode accent surface is this audit's contract — the accent × dark family belongs to accent-dark-sweep)`,
    };
  }
  if (env.chrome.sidebarVisible || !env.chrome.hamburgerVisible) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the chrome contract broke at 390 — sidebarVisible=${env.chrome.sidebarVisible}, hamburgerVisible=${env.chrome.hamburgerVisible} (the lg contract: the sidebar renders only ≥1024; below that the drawer is the vehicle — the vehicle-contract finding class)`,
    };
  }
  // The applied check: every accent's self-verified reading must match its key.
  const notApplied: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (isObj(rec) && rec.applied !== a) notApplied.push(`${a}→${String(rec.applied)}`);
  }
  // The independent contrast-detection count (the anti-phantom doctrine),
  // with the documented non-gap exemptions, each SIGNATURE-STRICT:
  //   (a) the CTA-face (the S11 family-2 non-gap in light: white on
  //       accent-500 is the reference's own accent-CTA choice);
  //   (b) the calendar adjacent-month day numbers — slate-300
  //       (rgb(203, 213, 225)) on the light canvas, 1-2 digit text: the
  //       S6-G measured parity pin, re-verified LIVE on the reference this
  //       session (the reference's own adjacent days render the identical
  //       rgb(203, 213, 225));
  //   (c) the yellow priority pill text — yellow-500 (rgb(234, 179, 8)) on
  //       the yellow-50 pill, the {high, medium, low} vocabulary: the
  //       S6/S8 measured parity pin (the reference's own priority-pill
  //       design, measured with live reference data).
  // Any OTHER unreadable combination is a genuine finding (counted).
  let detections = 0;
  let ctaFace = 0;
  let calendarDays = 0;
  let yellowPills = 0;
  let warns = 0;
  let renderings = 0;
  const isCalendarAdjacentDay = (e: unknown) =>
    isObj(e) && e.color === "rgb(203, 213, 225)" && typeof e.text === "string" && /^\d{1,2}$/.test(e.text.trim());
  const isYellowPriorityPill = (e: unknown) =>
    isObj(e) && e.color === "rgb(234, 179, 8)" && typeof e.text === "string" && /^(high|medium|low)$/i.test(e.text.trim());
  const countEntries = (arr: unknown) => {
    if (!isArr(arr)) return;
    for (const e of arr) {
      if (isObj(e) && e.color === "rgb(255, 255, 255)") {
        ctaFace += 1;
        continue;
      }
      if (isCalendarAdjacentDay(e)) {
        calendarDays += 1;
        continue;
      }
      if (isYellowPriorityPill(e)) {
        yellowPills += 1;
        continue;
      }
      detections += 1;
    }
  };
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec)) continue; // already shape-checked; defensive only
    if (isObj(rec.views)) {
      for (const v of Object.keys(rec.views)) {
        const vr = rec.views[v];
        if (!isObj(vr)) continue;
        renderings += 1;
        countEntries(vr.unreadable);
        if (isArr(vr.lowcontrast)) warns += vr.lowcontrast.length;
      }
    }
    if (isObj(rec.drawer)) {
      countEntries(rec.drawer.unreadable);
      if (isArr(rec.drawer.lowcontrast)) warns += rec.drawer.lowcontrast.length;
    }
  }
  if (notApplied.length > 0) {
    return {
      green: false,
      findings: env.findings.length + notApplied.length,
      note: `${notApplied.length} accent(s) did not apply through the real lifecycle (applied ${notApplied.join(", ")}) — the accent-application finding class`,
    };
  }
  if (detections > 0) {
    return {
      green: false,
      findings: env.findings.length + detections,
      note: `${detections} unreadable detection(s) across ${renderings} view renderings + 7 drawer records (the light contrast detector family; counted independently of the findings array; the CTA-face entries are exempt)`,
    };
  }
  return {
    green: env.findings.length === 0,
    findings: env.findings.length,
    note: `7 accents swept × ${renderings} view renderings + 7 drawer records at 390×844 in MODE light; every accent self-verified applied; ${ctaFace} CTA-face exempt (white on accent-500 — the S11 family-2 non-gap); ${calendarDays} calendar adjacent-day exempt (slate-300 — the S6-G reference-measured pin, re-verified live); ${yellowPills} yellow-pill exempt (yellow-500 — the S6/S8 reference-measured pin); ${warns} WARN (lowcontrast — the S11 non-gap family)`,
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
// The S38 contract: the accent × dark family at FULL mobile coverage — the
// mobile pass sweeps ALL 20 views per accent (the pre-S38 probe swept only
// 6: MOBILE_VIEWS — the 14-view gap S38 closed), every view is recorded
// EXPLICITLY on both surfaces (the omission-means-clean recording is
// RETIRED — clean views carry empty detector arrays), and the per-accent
// `applied` self-verified readings + `mode` + the mobile `mobileViewport`
// ride the envelope. The ALL-ACCENTS + ALL-VIEWS + drawer-present guards
// make every silently-skipped dimension a LOUD shape-error, never
// green-by-omission (the S37 anti-phantom doctrine applied to this
// family). Counting semantics preserved from S11/S65: flashbulbs are
// ALWAYS findings; white-on-accent unreadable entries are the CTA-face
// exemption (the S11 family-2 non-gap); lowcontrast entries are WARN.

const ACCENT_DARK_ALL_ACCENTS = new Set(["violet", "blue", "green", "orange", "pink", "red", "teal"]);
const ACCENT_DARK_ALL_VIEWS = [
  "Dashboard", "MyDay", "Tasks", "Calendar", "Events", "Timetable",
  "Assignments", "Exams", "Notes", "Flashcards", "PracticeTests",
  "StudyGroups", "GradeTracker", "Analytics", "Files", "Calculator",
  "MathSolver", "AIAssistant", "FocusTimer", "Settings",
];

function classifyAccentDarkSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string (the S27 rot-guard metadata)");
  if (!isObj(env.mobileViewport) || env.mobileViewport.width !== 390 || env.mobileViewport.height !== 844) {
    return shapeError("mobileViewport must be the mobile portrait 390×844 (the S33 mobile class) — the mobile pass's contract (the desktop pass rides its own 1280×800 context)");
  }
  if (!isObj(env.applied)) return shapeError("applied must be an object of per-accent self-verified <html data-accent> readings");
  if (!isObj(env.desktop) || !isObj(env.mobile)) {
    return shapeError("desktop/mobile must be accent→view maps");
  }
  // The ALL-ACCENTS guard (both surfaces + the applied map): an accent that
  // silently did not run must never read green-by-omission.
  for (const a of ACCENT_DARK_ALL_ACCENTS) {
    if (!(a in env.desktop)) return shapeError(`desktop must carry all 7 accents (violet, blue, green, orange, pink, red, teal) — "${a}" is missing: an accent that silently did not run must never read green-by-omission`);
    if (!(a in env.mobile)) return shapeError(`mobile must carry all 7 accents (violet, blue, green, orange, pink, red, teal) — "${a}" is missing: an accent that silently did not run must never read green-by-omission`);
    if (!(a in env.applied)) return shapeError(`applied must carry all 7 accents — "${a}" is missing (the self-verified reading)`);
  }
  // The ALL-VIEWS guard (both surfaces — the omission-means-clean recording
  // is RETIRED): every accent's view map must carry all 20 canonical views.
  for (const [surfaceName, surface] of [["desktop", env.desktop], ["mobile", env.mobile]] as [string, Record<string, unknown>][]) {
    for (const [accent, views] of Object.entries(surface)) {
      if (!isObj(views)) return shapeError(`${accent} must be a view map`);
      for (const v of ACCENT_DARK_ALL_VIEWS) {
        if (!(v in views)) {
          return shapeError(`${surfaceName}.${accent} must carry all 20 views — "${v}" is missing: a view that silently did not run must never read green-by-omission (the S38 mobile 20-view matrix contract)`);
        }
      }
    }
  }
  // The drawer-present guard (mobile, per accent).
  for (const [accent, views] of Object.entries(env.mobile)) {
    if (!isObj(views) || !("(drawer)" in views)) {
      return shapeError(`mobile.${accent} must carry the "(drawer)" record (the drawer is part of the mobile contract per accent)`);
    }
  }
  let findings = 0;
  let warns = 0;
  let ctaFace = 0;
  let renderings = 0;
  let drawerErrors = 0;
  let overflows = 0;
  const notApplied: string[] = [];
  for (const [accent, appliedReading] of Object.entries(env.applied)) {
    if (appliedReading !== accent) notApplied.push(`${accent}→${String(appliedReading)}`);
  }
  for (const [isMobile, surface] of [[false, env.desktop], [true, env.mobile]] as [boolean, Record<string, Record<string, unknown>>][]) {
    for (const [accent, views] of Object.entries(surface)) {
      if (!isObj(views)) continue; // already shape-checked above
      for (const [view, rec] of Object.entries(views)) {
        if (!isObj(rec) || !isArr(rec.flashbulbs) || !isArr(rec.unreadable) || !isArr(rec.lowcontrast)) {
          return shapeError(`${accent}.${view} must carry flashbulbs/unreadable/lowcontrast Arrays`);
        }
        // The drawer record: linkCount + the detector family; an `error`
        // string (the guarded drawer-open catch) is a FINDING — never a
        // swallow (the anti-phantom doctrine).
        if (view === "(drawer)") {
          if (typeof rec.linkCount !== "number") {
            return shapeError(`mobile.${accent}.(drawer) must carry linkCount (the drawer's own link census)`);
          }
          findings += rec.flashbulbs.length;
          for (const entry of rec.unreadable) {
            if (isObj(entry) && entry.color === "rgb(255, 255, 255)") ctaFace += 1;
            else findings += 1;
          }
          warns += rec.lowcontrast.length;
          if (typeof rec.error === "string" && rec.error.length > 0) {
            findings += 1;
            drawerErrors += 1;
          }
          continue;
        }
        renderings += 1;
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
        warns += rec.lowcontrast.length;
        if (isMobile) {
          if (typeof rec.scrollWidth !== "number") {
            return shapeError(`mobile.${accent}.${view}.scrollWidth must be a number (the S16 mobile-only-gap class, measured)`);
          }
          if (rec.scrollWidth > 390) {
            findings += 1;
            overflows += 1;
          }
        }
      }
    }
  }
  // The mode rot guard (the S27 family): the accent × light family belongs
  // to accent-light-sweep — the INVERSE guard of S37's.
  if (env.mode !== "dark") {
    return {
      green: false,
      findings: findings + 1,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (the accent × light family belongs to accent-light-sweep; the accent-dark contract is mode=dark)`,
    };
  }
  if (notApplied.length > 0) {
    return {
      green: false,
      findings: findings + notApplied.length,
      note: `${notApplied.length} accent(s) did not apply through the real lifecycle (applied ${notApplied.join(", ")}) — the accent-application finding class`,
    };
  }
  if (findings > 0) {
    const extras: string[] = [];
    if (overflows > 0) extras.push(`${overflows} mobile overflow(s) (scrollWidth > 390 — the S16 class)`);
    if (drawerErrors > 0) extras.push(`${drawerErrors} drawer error(s) (the drawer-open failure class)`);
    return {
      green: false,
      findings,
      note: `${findings} finding(s) across ${renderings} view renderings (7 accents × 20 views × desktop+mobile) + 7 drawer records${extras.length > 0 ? `; ${extras.join("; ")}` : ""}; ${ctaFace} CTA-face exempt (white on accent-500 — the S11 family-2 non-gap); ${warns} WARN (lowcontrast — the S11 non-gap family)`,
    };
  }
  return {
    green: true,
    findings: 0,
    note: `${renderings} view renderings probed (7 accents × 20 views × desktop+mobile) + 7 drawer records; ${ctaFace} CTA-face exempt (white on accent-500 — the S11 family-2 non-gap); ${warns} WARN (lowcontrast — the S11 non-gap family)`,
  };
}

// --- accent-landscape-sweep (S40) ----------------------------------------------
// The accent × landscape drawer-navigation sweep — the short-viewport band's
// accent half (844×390, the iPhone-class landscape — the 390–430px-tall
// band's canonical width), navigated THROUGH THE DRAWER (the only vehicle
// below 1024), in LIGHT mode: the combo the S39 summary named first among
// its next steps ("the landscape × accent drawer-navigation combo — the
// 844×390 sibling"). The per-view records carry the INTERACTION evidence —
// activeTint (the drawer's active-link inner-span gradient while THIS view
// was active; "none"/empty is the S8 no-var rot class) and activeLabel
// (the aria-current link when read — MUST equal the view's own label: the
// active state must follow the navigation) — AND the landscape-own
// headingClearance key (the identity heading's box top at/below the fixed
// 64px bar — the h-16 bar covers 16% of a 390px viewport; the S35
// contract). The chrome carries the short-viewport contract
// (drawerNavScrollable — the nav's scroll is the ONLY path to links 8–20
// at 390 height; the S35-own finding class). The dark × landscape combos
// are the documented S36 non-gap family (dark-mobile's classifier
// comment); the desktop light-accent family remains the documented S37
// non-gap (bracketed by the per-accent pins at 390 light [S37], 768 light
// [S39], and 1280 dark [S38]).

const ACCENT_LANDSCAPE_ALL_ACCENTS = new Set(["violet", "blue", "green", "orange", "pink", "red", "teal"]);
// The 20 canonical views by their DISPLAY labels — the drawer links'
// accessible names ("My Day", "Practice Tests", …), the same convention as
// the S34/S35/S39 vehicle-family envelopes; the per-view `activeLabel`
// reading is the same display label, so the interaction check compares
// like-for-like.
const ACCENT_LANDSCAPE_ALL_VIEWS = [
  "Dashboard", "My Day", "Tasks", "Calendar", "Events", "Timetable",
  "Assignments", "Exams", "Notes", "Flashcards", "Practice Tests",
  "Study Groups", "Grade Tracker", "Analytics", "Files", "Calculator",
  "Math Solver", "AI Assistant", "Focus Timer", "Settings",
];

function classifyAccentLandscapeSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string");
  if (!isObj(env.viewport) || env.viewport.width !== 844 || env.viewport.height !== 390) {
    return shapeError(
      "viewport must be the phone-landscape 844×390 (the iPhone-class landscape — the HEIGHT axis) — the LIGHT-mode accent landscape surface is this audit's contract (the mobile accent family belongs to accent-light-sweep; the mid-band accent family to accent-midband-sweep; the dark × landscape combos are the documented S36 non-gap family)",
    );
  }
  if (
    !isObj(env.chrome) ||
    typeof env.chrome.sidebarVisible !== "boolean" ||
    typeof env.chrome.hamburgerVisible !== "boolean" ||
    typeof env.chrome.drawerNavScrollable !== "boolean"
  ) {
    return shapeError("chrome must carry boolean sidebarVisible + hamburgerVisible + drawerNavScrollable (the vehicle + short-viewport contracts)");
  }
  if (!isObj(env.accents)) return shapeError("accents must be an object of per-accent records");
  if (!isArr(env.findings)) return shapeError("findings must be an Array");
  const accentKeys = Object.keys(env.accents);
  for (const a of ACCENT_LANDSCAPE_ALL_ACCENTS) {
    if (!(a in env.accents)) {
      return shapeError(
        `accents must carry all 7 (violet, blue, green, orange, pink, red, teal) — "${a}" is missing: an accent that silently did not run must never read green-by-omission`,
      );
    }
  }
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec)) return shapeError(`accents.${a} must be a record`);
    if (typeof rec.applied !== "string") return shapeError(`accents.${a}.applied must be a string (the self-verified <html data-accent> reading)`);
    if (!isObj(rec.views)) return shapeError(`accents.${a}.views must be an object of per-view records`);
    for (const v of ACCENT_LANDSCAPE_ALL_VIEWS) {
      if (!(v in rec.views)) {
        return shapeError(
          `accents.${a}.views must carry all 20 canonical views — "${v}" is missing: a view that silently did not run must never read green-by-omission (the omission-means-clean recording is RETIRED)`,
        );
      }
    }
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) return shapeError(`accents.${a}.views.${v} must be a record`);
      if (typeof vr.heading !== "string" || vr.heading.length === 0) {
        return shapeError(`accents.${a}.views.${v}.heading must be a non-empty string`);
      }
      if (typeof vr.scrollWidth !== "number") return shapeError(`accents.${a}.views.${v}.scrollWidth must be a number`);
      if (typeof vr.drawerClosed !== "boolean") return shapeError(`accents.${a}.views.${v}.drawerClosed must be a boolean (the drawer closes on navigation — the vehicle contract)`);
      if (typeof vr.appBar !== "boolean") return shapeError(`accents.${a}.views.${v}.appBar must be a boolean`);
      if (typeof vr.headingClearance !== "boolean") {
        return shapeError(`accents.${a}.views.${v}.headingClearance must be a boolean (the fixed-bar clearance — the h-16 bar covers 16% of a 390px viewport, the S35 landscape contract)`);
      }
      if (!isArr(vr.unreadable)) return shapeError(`accents.${a}.views.${v}.unreadable must be an Array (the light contrast detector family)`);
      if (!isArr(vr.lowcontrast)) return shapeError(`accents.${a}.views.${v}.lowcontrast must be an Array (the light contrast detector family)`);
      if (!isArr(vr.consoleErrors)) return shapeError(`accents.${a}.views.${v}.consoleErrors must be an Array`);
      if (typeof vr.activeTint !== "string") return shapeError(`accents.${a}.views.${v}.activeTint must be a string (the active-link gradient reading — the interaction evidence is part of the record)`);
      if (typeof vr.activeLabel !== "string") return shapeError(`accents.${a}.views.${v}.activeLabel must be a string (the aria-current link when the tint was read)`);
    }
    if (
      !isObj(rec.drawer) ||
      typeof rec.drawer.linkCount !== "number" ||
      !isArr(rec.drawer.unreadable) ||
      !isArr(rec.drawer.lowcontrast)
    ) {
      return shapeError(`accents.${a}.drawer must carry linkCount + unreadable + lowcontrast Arrays (the drawer's own accent rendering)`);
    }
  }
  if (env.mode !== "light") {
    return {
      green: false,
      findings: env.findings.length,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (the S27 rot class; the LIGHT-mode accent landscape surface is this audit's contract — the dark × landscape combos are the documented S36 non-gap family, and the accent × dark family belongs to accent-dark-sweep)`,
    };
  }
  if (env.chrome.sidebarVisible || !env.chrome.hamburgerVisible) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the chrome contract broke at 844×390 — sidebarVisible=${env.chrome.sidebarVisible}, hamburgerVisible=${env.chrome.hamburgerVisible} (the lg contract: the sidebar renders only ≥1024; below that the drawer is the vehicle — the vehicle-contract finding class)`,
    };
  }
  if (!env.chrome.drawerNavScrollable) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the short-viewport contract broke — drawerNavScrollable=false at 390 height under at least one accent (the nav geometry: the 20 reference-measured rows cannot fit the ~300px nav area, so a non-scrolling nav means the drawer geometry changed — links beyond the fold would be unreachable in landscape; the nav-scroll finding class)`,
    };
  }
  // The applied check: every accent's self-verified reading must match its key.
  const notApplied: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (isObj(rec) && rec.applied !== a) notApplied.push(`${a}→${String(rec.applied)}`);
  }
  if (notApplied.length > 0) {
    return {
      green: false,
      findings: env.findings.length + notApplied.length,
      note: `${notApplied.length} accent(s) did not apply through the real lifecycle (applied ${notApplied.join(", ")}) — the accent-application finding class`,
    };
  }
  // The drawer-error check: a drawer that failed to open is a FINDING (never
  // a swallow — the S38 doctrine).
  const drawerErrors: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (isObj(rec) && isObj(rec.drawer) && typeof rec.drawer.error === "string") drawerErrors.push(a);
  }
  if (drawerErrors.length > 0) {
    return {
      green: false,
      findings: env.findings.length + drawerErrors.length,
      note: `${drawerErrors.length} drawer record(s) carry an error (${drawerErrors.join(", ")}) — a drawer that failed to open is a finding, never a swallow`,
    };
  }
  // The interaction checks — the S40 finding classes this audit OWNS:
  //   (a) the tint rot: an activeTint that computed to "none"/empty is the
  //       S8 no-var rot class (a camelCase token silently resolves to no
  //       var and the gradient computes to none);
  //   (b) the active-state mismatch: the drawer's active link must be the
  //       view that was active when the tint was read — the active state
  //       must follow the navigation.
  const tintRots: string[] = [];
  const activeMismatches: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) continue;
      if (vr.activeTint === "" || vr.activeTint === "none") tintRots.push(`${a}/${v}`);
      if (vr.activeLabel !== v) activeMismatches.push(`${a}/${v}→${String(vr.activeLabel)}`);
    }
  }
  if (tintRots.length > 0) {
    return {
      green: false,
      findings: env.findings.length + tintRots.length,
      note: `${tintRots.length} active-link gradient reading(s) computed to none/empty (${tintRots.slice(0, 4).join(", ")}) — the S8 no-var rot class (the NAV_ACTIVE_GRADIENT_STOPS pair did not resolve)`,
    };
  }
  if (activeMismatches.length > 0) {
    return {
      green: false,
      findings: env.findings.length + activeMismatches.length,
      note: `${activeMismatches.length} active-state mismatch(es) (${activeMismatches.slice(0, 4).join(", ")}) — the drawer's active link did not follow the navigation (the interaction contract: while view V is active, V's link carries aria-current=page)`,
    };
  }
  // The overflow check (the S16/S34 class — the Timetable canvas must live
  // inside its overflow-x-auto container; at 844 it is 56px shy of fit).
  const overflows: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (isObj(vr) && typeof vr.scrollWidth === "number" && vr.scrollWidth > 844) overflows.push(`${a}/${v}:${vr.scrollWidth}`);
    }
  }
  if (overflows.length > 0) {
    return {
      green: false,
      findings: env.findings.length + overflows.length,
      note: `${overflows.length} view rendering(s) overflow the 844px canvas (${overflows.slice(0, 4).join(", ")}) — the S16/S34 overflow class`,
    };
  }
  // The independent contrast-detection count (the anti-phantom doctrine),
  // with the documented non-gap exemptions, each SIGNATURE-STRICT (the
  // S37-exact semantics): the CTA-face, the calendar adjacent-month days,
  // and the yellow priority-pill vocabulary. Any OTHER unreadable
  // combination is a genuine finding (counted).
  let detections = 0;
  let ctaFace = 0;
  let calendarDays = 0;
  let yellowPills = 0;
  let warns = 0;
  let renderings = 0;
  const isCalendarAdjacentDay = (e: unknown) =>
    isObj(e) && e.color === "rgb(203, 213, 225)" && typeof e.text === "string" && /^\d{1,2}$/.test(e.text.trim());
  const isYellowPriorityPill = (e: unknown) =>
    isObj(e) && e.color === "rgb(234, 179, 8)" && typeof e.text === "string" && /^(high|medium|low)$/i.test(e.text.trim());
  const countEntries = (arr: unknown) => {
    if (!isArr(arr)) return;
    for (const e of arr) {
      if (isObj(e) && e.color === "rgb(255, 255, 255)") {
        ctaFace += 1;
        continue;
      }
      if (isCalendarAdjacentDay(e)) {
        calendarDays += 1;
        continue;
      }
      if (isYellowPriorityPill(e)) {
        yellowPills += 1;
        continue;
      }
      detections += 1;
    }
  };
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec)) continue; // already shape-checked; defensive only
    if (isObj(rec.views)) {
      for (const v of Object.keys(rec.views)) {
        const vr = rec.views[v];
        if (!isObj(vr)) continue;
        renderings += 1;
        countEntries(vr.unreadable);
        if (isArr(vr.lowcontrast)) warns += vr.lowcontrast.length;
      }
    }
    if (isObj(rec.drawer)) {
      countEntries(rec.drawer.unreadable);
      if (isArr(rec.drawer.lowcontrast)) warns += rec.drawer.lowcontrast.length;
    }
  }
  if (detections > 0) {
    return {
      green: false,
      findings: env.findings.length + detections,
      note: `${detections} unreadable detection(s) across ${renderings} view renderings + 7 drawer records (the light contrast detector family; counted independently of the findings array; the CTA-face entries are exempt)`,
    };
  }
  return {
    green: env.findings.length === 0,
    findings: env.findings.length,
    note: `7 accents swept × ${renderings} view renderings + ${renderings} active-tint readings + 7 drawer records at 844×390 in MODE light, navigated through the drawer (the iPhone-class landscape); every accent self-verified applied; the short-viewport contracts hold (nav scrollable, heading clearance); ${ctaFace} CTA-face exempt (white on accent-500 — the S11 family-2 non-gap); ${calendarDays} calendar adjacent-day exempt (slate-300 — the S6-G reference-measured pin); ${yellowPills} yellow-pill exempt (yellow-500 — the S6/S8 reference-measured pin); ${warns} WARN (lowcontrast — the S11 non-gap family)`,
  };
}

// --- cwv -----------------------------------------------------------------------
// Ratings GOOD/NI/POOR/BAD. FINDINGS = clone-* scenarios rated POOR/BAD;
// NI = the documented S16 state (not a finding); ref-* scenarios are
// informational (the reference's own mobile login LCP POOR is the documented
// reference state, not a clone finding).

// --- accent-midband-sweep (S39) -----------------------------------------------
// The accent × mid-band drawer-navigation sweep — the 391–1023px band's
// accent half (768×1024, the md breakpoint), navigated THROUGH THE DRAWER
// (the only vehicle below 1024), in LIGHT mode: the combo the S38 summary
// named as the next step ("the drawer-navigation × accent interaction at
// mid-band"). The per-view records carry the INTERACTION evidence —
// activeTint (the drawer's active-link inner-span gradient while THIS view
// was active; "none"/empty is the S8 no-var rot class) and activeLabel
// (the aria-current link when read — MUST equal the view's own label: the
// active state must follow the navigation). The dark × mid-band combos are
// the documented S36 non-gap family (dark-mobile's classifier comment);
// the desktop light-accent family remains the documented S37 non-gap.

const ACCENT_MIDBAND_ALL_ACCENTS = new Set(["violet", "blue", "green", "orange", "pink", "red", "teal"]);
// The 20 canonical views by their DISPLAY labels — the drawer links'
// accessible names ("My Day", "Practice Tests", …), the same convention as
// the S34 midband-sweep envelope (the vehicle family this audit extends);
// the per-view `activeLabel` reading is the same display label, so the
// interaction check compares like-for-like.
const ACCENT_MIDBAND_ALL_VIEWS = [
  "Dashboard", "My Day", "Tasks", "Calendar", "Events", "Timetable",
  "Assignments", "Exams", "Notes", "Flashcards", "Practice Tests",
  "Study Groups", "Grade Tracker", "Analytics", "Files", "Calculator",
  "Math Solver", "AI Assistant", "Focus Timer", "Settings",
];

function classifyAccentMidbandSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string");
  if (!isObj(env.viewport) || env.viewport.width !== 768 || env.viewport.height !== 1024) {
    return shapeError(
      "viewport must be the mid-band 768×1024 (the md breakpoint) — the LIGHT-mode accent mid-band surface is this audit's contract (the mobile accent family belongs to accent-light-sweep; the dark mid-band combos are the documented S36 non-gap family)",
    );
  }
  if (
    !isObj(env.chrome) ||
    typeof env.chrome.sidebarVisible !== "boolean" ||
    typeof env.chrome.hamburgerVisible !== "boolean"
  ) {
    return shapeError("chrome must carry boolean sidebarVisible + hamburgerVisible (the vehicle contract)");
  }
  if (!isObj(env.accents)) return shapeError("accents must be an object of per-accent records");
  if (!isArr(env.findings)) return shapeError("findings must be an Array");
  const accentKeys = Object.keys(env.accents);
  for (const a of ACCENT_MIDBAND_ALL_ACCENTS) {
    if (!(a in env.accents)) {
      return shapeError(
        `accents must carry all 7 (violet, blue, green, orange, pink, red, teal) — "${a}" is missing: an accent that silently did not run must never read green-by-omission`,
      );
    }
  }
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec)) return shapeError(`accents.${a} must be a record`);
    if (typeof rec.applied !== "string") return shapeError(`accents.${a}.applied must be a string (the self-verified <html data-accent> reading)`);
    if (!isObj(rec.views)) return shapeError(`accents.${a}.views must be an object of per-view records`);
    for (const v of ACCENT_MIDBAND_ALL_VIEWS) {
      if (!(v in rec.views)) {
        return shapeError(
          `accents.${a}.views must carry all 20 canonical views — "${v}" is missing: a view that silently did not run must never read green-by-omission (the omission-means-clean recording is RETIRED)`,
        );
      }
    }
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) return shapeError(`accents.${a}.views.${v} must be a record`);
      if (typeof vr.heading !== "string" || vr.heading.length === 0) {
        return shapeError(`accents.${a}.views.${v}.heading must be a non-empty string`);
      }
      if (typeof vr.scrollWidth !== "number") return shapeError(`accents.${a}.views.${v}.scrollWidth must be a number`);
      if (typeof vr.drawerClosed !== "boolean") return shapeError(`accents.${a}.views.${v}.drawerClosed must be a boolean (the drawer closes on navigation — the vehicle contract)`);
      if (typeof vr.appBar !== "boolean") return shapeError(`accents.${a}.views.${v}.appBar must be a boolean`);
      if (!isArr(vr.unreadable)) return shapeError(`accents.${a}.views.${v}.unreadable must be an Array (the light contrast detector family)`);
      if (!isArr(vr.lowcontrast)) return shapeError(`accents.${a}.views.${v}.lowcontrast must be an Array (the light contrast detector family)`);
      if (!isArr(vr.consoleErrors)) return shapeError(`accents.${a}.views.${v}.consoleErrors must be an Array`);
      if (typeof vr.activeTint !== "string") return shapeError(`accents.${a}.views.${v}.activeTint must be a string (the active-link gradient reading — the interaction evidence is part of the record)`);
      if (typeof vr.activeLabel !== "string") return shapeError(`accents.${a}.views.${v}.activeLabel must be a string (the aria-current link when the tint was read)`);
    }
    if (
      !isObj(rec.drawer) ||
      typeof rec.drawer.linkCount !== "number" ||
      !isArr(rec.drawer.unreadable) ||
      !isArr(rec.drawer.lowcontrast)
    ) {
      return shapeError(`accents.${a}.drawer must carry linkCount + unreadable + lowcontrast Arrays (the drawer's own accent rendering)`);
    }
  }
  if (env.mode !== "light") {
    return {
      green: false,
      findings: env.findings.length,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (the S27 rot class; the LIGHT-mode accent mid-band surface is this audit's contract — the dark × mid-band combos are the documented S36 non-gap family, and the accent × dark family belongs to accent-dark-sweep)`,
    };
  }
  if (env.chrome.sidebarVisible || !env.chrome.hamburgerVisible) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the chrome contract broke at 768 — sidebarVisible=${env.chrome.sidebarVisible}, hamburgerVisible=${env.chrome.hamburgerVisible} (the lg contract: the sidebar renders only ≥1024; below that the drawer is the vehicle — the vehicle-contract finding class)`,
    };
  }
  // The applied check: every accent's self-verified reading must match its key.
  const notApplied: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (isObj(rec) && rec.applied !== a) notApplied.push(`${a}→${String(rec.applied)}`);
  }
  if (notApplied.length > 0) {
    return {
      green: false,
      findings: env.findings.length + notApplied.length,
      note: `${notApplied.length} accent(s) did not apply through the real lifecycle (applied ${notApplied.join(", ")}) — the accent-application finding class`,
    };
  }
  // The drawer-error check: a drawer that failed to open is a FINDING (never
  // a swallow — the S38 doctrine).
  const drawerErrors: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (isObj(rec) && isObj(rec.drawer) && typeof rec.drawer.error === "string") drawerErrors.push(a);
  }
  if (drawerErrors.length > 0) {
    return {
      green: false,
      findings: env.findings.length + drawerErrors.length,
      note: `${drawerErrors.length} drawer record(s) carry an error (${drawerErrors.join(", ")}) — a drawer that failed to open is a finding, never a swallow`,
    };
  }
  // The interaction checks — the S39 finding classes this audit OWNS:
  //   (a) the tint rot: an activeTint that computed to "none"/empty is the
  //       S8 no-var rot class (a camelCase token silently resolves to no
  //       var and the gradient computes to none);
  //   (b) the active-state mismatch: the drawer's active link must be the
  //       view that was active when the tint was read — the active state
  //       must follow the navigation.
  const tintRots: string[] = [];
  const activeMismatches: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) continue;
      if (vr.activeTint === "" || vr.activeTint === "none") tintRots.push(`${a}/${v}`);
      if (vr.activeLabel !== v) activeMismatches.push(`${a}/${v}→${String(vr.activeLabel)}`);
    }
  }
  if (tintRots.length > 0) {
    return {
      green: false,
      findings: env.findings.length + tintRots.length,
      note: `${tintRots.length} active-link gradient reading(s) computed to none/empty (${tintRots.slice(0, 4).join(", ")}) — the S8 no-var rot class (the NAV_ACTIVE_GRADIENT_STOPS pair did not resolve)`,
    };
  }
  if (activeMismatches.length > 0) {
    return {
      green: false,
      findings: env.findings.length + activeMismatches.length,
      note: `${activeMismatches.length} active-state mismatch(es) (${activeMismatches.slice(0, 4).join(", ")}) — the drawer's active link did not follow the navigation (the interaction contract: while view V is active, V's link carries aria-current=page)`,
    };
  }
  // The overflow check (the S16/S34 class — the Timetable canvas must live
  // inside its overflow-x-auto container).
  const overflows: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (isObj(vr) && typeof vr.scrollWidth === "number" && vr.scrollWidth > 768) overflows.push(`${a}/${v}:${vr.scrollWidth}`);
    }
  }
  if (overflows.length > 0) {
    return {
      green: false,
      findings: env.findings.length + overflows.length,
      note: `${overflows.length} view rendering(s) overflow the 768px canvas (${overflows.slice(0, 4).join(", ")}) — the S16/S34 overflow class`,
    };
  }
  // The independent contrast-detection count (the anti-phantom doctrine),
  // with the documented non-gap exemptions, each SIGNATURE-STRICT (the
  // S37-exact semantics): the CTA-face, the calendar adjacent-month days,
  // and the yellow priority-pill vocabulary. Any OTHER unreadable
  // combination is a genuine finding (counted).
  let detections = 0;
  let ctaFace = 0;
  let calendarDays = 0;
  let yellowPills = 0;
  let warns = 0;
  let renderings = 0;
  const isCalendarAdjacentDay = (e: unknown) =>
    isObj(e) && e.color === "rgb(203, 213, 225)" && typeof e.text === "string" && /^\d{1,2}$/.test(e.text.trim());
  const isYellowPriorityPill = (e: unknown) =>
    isObj(e) && e.color === "rgb(234, 179, 8)" && typeof e.text === "string" && /^(high|medium|low)$/i.test(e.text.trim());
  const countEntries = (arr: unknown) => {
    if (!isArr(arr)) return;
    for (const e of arr) {
      if (isObj(e) && e.color === "rgb(255, 255, 255)") {
        ctaFace += 1;
        continue;
      }
      if (isCalendarAdjacentDay(e)) {
        calendarDays += 1;
        continue;
      }
      if (isYellowPriorityPill(e)) {
        yellowPills += 1;
        continue;
      }
      detections += 1;
    }
  };
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec)) continue; // already shape-checked; defensive only
    if (isObj(rec.views)) {
      for (const v of Object.keys(rec.views)) {
        const vr = rec.views[v];
        if (!isObj(vr)) continue;
        renderings += 1;
        countEntries(vr.unreadable);
        if (isArr(vr.lowcontrast)) warns += vr.lowcontrast.length;
      }
    }
    if (isObj(rec.drawer)) {
      countEntries(rec.drawer.unreadable);
      if (isArr(rec.drawer.lowcontrast)) warns += rec.drawer.lowcontrast.length;
    }
  }
  if (detections > 0) {
    return {
      green: false,
      findings: env.findings.length + detections,
      note: `${detections} unreadable detection(s) across ${renderings} view renderings + 7 drawer records (the light contrast detector family; counted independently of the findings array; the CTA-face entries are exempt)`,
    };
  }
  return {
    green: env.findings.length === 0,
    findings: env.findings.length,
    note: `7 accents swept × ${renderings} view renderings + ${renderings} active-tint readings + 7 drawer records at 768×1024 in MODE light, navigated through the drawer; every accent self-verified applied; ${ctaFace} CTA-face exempt (white on accent-500 — the S11 family-2 non-gap); ${calendarDays} calendar adjacent-day exempt (slate-300 — the S6-G reference-measured pin); ${yellowPills} yellow-pill exempt (yellow-500 — the S6/S8 reference-measured pin); ${warns} WARN (lowcontrast — the S11 non-gap family)`,
  };
}

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
  if (name === "mobile-sweep") return classifyMobileSweep(envelope);
  if (name === "midband-sweep") return classifyMidbandSweep(envelope);
  if (name === "landscape-sweep") return classifyLandscapeSweep(envelope);
  if (name === "dark-mobile-sweep") return classifyDarkMobileSweep(envelope);
  if (name === "accent-light-sweep") return classifyAccentLightSweep(envelope);
  if (name === "accent-midband-sweep") return classifyAccentMidbandSweep(envelope);
  if (name === "accent-landscape-sweep") return classifyAccentLandscapeSweep(envelope);
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

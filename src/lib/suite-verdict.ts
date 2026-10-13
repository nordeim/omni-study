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
  "accent-desktop-sweep",
  "accent-volume-sweep",
  "accent-volume-light-sweep",
  "accent-volume-dark-mobile-sweep",
  "accent-volume-light-mobile-sweep",
  "accent-volume-dark-midband-sweep",
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

// --- accent-desktop-sweep (S41) ----------------------------------------------
// The desktop light-accent sidebar-navigation sweep — the desktop family's
// light half (1280×800), navigated THROUGH THE SIDEBAR (the desktop vehicle
// — the only chrome ≥1024; the S33–S40 vehicle contract INVERTS here: the
// sidebar MUST be visible and the lg:hidden app bar MUST be hidden), in
// LIGHT mode: the combo the S40 summary named first among its next steps
// ("the desktop light-accent family — currently the documented bracketed
// non-gap"). The per-view records carry the INTERACTION evidence —
// activeTint (the SIDEBAR's active-link inner-span gradient while THIS view
// was active; the desktop vehicle's tint was verified at ZERO views, ZERO
// accents, in either mode before this audit — the e2e pins read the tint on
// the Dashboard link only, violet only; accent-dark's desktop pass
// navigates by direct goto and never reads it) and activeLabel (the
// aria-current link when read — MUST equal the view's own label: the active
// state must follow the navigation) — AND the desktop-own keys
// (headingOffset — the identity heading's box left at/right of the fixed
// 260px sidebar, the desktop clearance contract; sidebarVisible — the
// vehicle persists through navigation). The chrome carries the
// sidebar-own scroll contract (sidebarNavScrollable — the nav's scroll is
// the ONLY path to links ~13–20 at 800 height [measured: scrollHeight 1068
// vs clientHeight 534]; the S35-family contract on the DESKTOP vehicle).
// The desktop DARK accent family belongs to accent-dark-sweep (its own
// standing surface at 1280×800 dark).

const ACCENT_DESKTOP_ALL_ACCENTS = new Set(["violet", "blue", "green", "orange", "pink", "red", "teal"]);
// The 20 canonical views by their DISPLAY labels — the sidebar links'
// accessible names ("My Day", "Practice Tests", …), the same convention as
// the S34/S35/S39/S40 vehicle-family envelopes; the per-view `activeLabel`
// reading is the same display label, so the interaction check compares
// like-for-like.
const ACCENT_DESKTOP_ALL_VIEWS = [
  "Dashboard", "My Day", "Tasks", "Calendar", "Events", "Timetable",
  "Assignments", "Exams", "Notes", "Flashcards", "Practice Tests",
  "Study Groups", "Grade Tracker", "Analytics", "Files", "Calculator",
  "Math Solver", "AI Assistant", "Focus Timer", "Settings",
];

function classifyAccentDesktopSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string");
  if (!isObj(env.viewport) || env.viewport.width !== 1280 || env.viewport.height !== 800) {
    return shapeError(
      "viewport must be the desktop 1280×800 (the canonical desktop width the dark family already sweeps) — the LIGHT-mode desktop accent surface is this audit's contract (the mobile accent family belongs to accent-light-sweep; the mid-band to accent-midband-sweep; the landscape to accent-landscape-sweep; the desktop dark accent family to accent-dark-sweep)",
    );
  }
  if (
    !isObj(env.chrome) ||
    typeof env.chrome.sidebarVisible !== "boolean" ||
    typeof env.chrome.hamburgerVisible !== "boolean" ||
    typeof env.chrome.sidebarNavScrollable !== "boolean"
  ) {
    return shapeError("chrome must carry boolean sidebarVisible + hamburgerVisible + sidebarNavScrollable (the INVERTED vehicle contract + the sidebar-own scroll contract)");
  }
  if (!isObj(env.accents)) return shapeError("accents must be an object of per-accent records");
  if (!isArr(env.findings)) return shapeError("findings must be an Array");
  const accentKeys = Object.keys(env.accents);
  for (const a of ACCENT_DESKTOP_ALL_ACCENTS) {
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
    for (const v of ACCENT_DESKTOP_ALL_VIEWS) {
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
      if (typeof vr.sidebarVisible !== "boolean") return shapeError(`accents.${a}.views.${v}.sidebarVisible must be a boolean (the sidebar persists through navigation — the desktop vehicle contract per view)`);
      if (typeof vr.headingOffset !== "boolean") {
        return shapeError(`accents.${a}.views.${v}.headingOffset must be a boolean (the content clears the fixed 260px sidebar — the lg:ml-[260px] contract, the desktop clearance)`);
      }
      if (!isArr(vr.unreadable)) return shapeError(`accents.${a}.views.${v}.unreadable must be an Array (the light contrast detector family)`);
      if (!isArr(vr.lowcontrast)) return shapeError(`accents.${a}.views.${v}.lowcontrast must be an Array (the light contrast detector family)`);
      if (!isArr(vr.consoleErrors)) return shapeError(`accents.${a}.views.${v}.consoleErrors must be an Array`);
      if (typeof vr.activeTint !== "string") return shapeError(`accents.${a}.views.${v}.activeTint must be a string (the active-link gradient reading — the interaction evidence is part of the record)`);
      if (typeof vr.activeLabel !== "string") return shapeError(`accents.${a}.views.${v}.activeLabel must be a string (the aria-current link when the tint was read)`);
    }
    if (
      !isObj(rec.sidebar) ||
      typeof rec.sidebar.linkCount !== "number" ||
      !isArr(rec.sidebar.unreadable) ||
      !isArr(rec.sidebar.lowcontrast)
    ) {
      return shapeError(`accents.${a}.sidebar must carry linkCount + unreadable + lowcontrast Arrays (the sidebar's own accent rendering)`);
    }
  }
  if (env.mode !== "light") {
    return {
      green: false,
      findings: env.findings.length,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (the S27 rot class; the LIGHT-mode desktop accent surface is this audit's contract — the desktop DARK accent family belongs to accent-dark-sweep)`,
    };
  }
  if (!env.chrome.sidebarVisible || env.chrome.hamburgerVisible) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the INVERTED chrome contract broke at 1280×800 — sidebarVisible=${env.chrome.sidebarVisible}, hamburgerVisible=${env.chrome.hamburgerVisible} (the lg contract: the sidebar is the desktop vehicle and renders ≥1024; the app bar is lg:hidden — the vehicle-contract finding class)`,
    };
  }
  if (!env.chrome.sidebarNavScrollable) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the sidebar-own scroll contract broke — sidebarNavScrollable=false at 800 height under at least one accent (the nav geometry: the 20 reference-measured rows cannot fit the ~534px nav area, so a non-scrolling nav means the sidebar geometry changed — links beyond the fold would be unreachable at desktop; the sidebarNavScrollable finding class)`,
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
  // The sidebar-error check: a sidebar record carrying an error is a FINDING
  // (never a swallow — the S38 doctrine).
  const sidebarErrors: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (isObj(rec) && isObj(rec.sidebar) && typeof rec.sidebar.error === "string") sidebarErrors.push(a);
  }
  if (sidebarErrors.length > 0) {
    return {
      green: false,
      findings: env.findings.length + sidebarErrors.length,
      note: `${sidebarErrors.length} sidebar record(s) carry an error (${sidebarErrors.join(", ")}) — a sidebar whose detectors failed is a finding, never a swallow`,
    };
  }
  // The interaction checks — the S41 finding classes this audit OWNS (the
  // DESKTOP vehicle's own proof — the drawer's was S39/S40's):
  //   (a) the tint rot: an activeTint that computed to "none"/empty is the
  //       S8 no-var rot class (a camelCase token silently resolves to no
  //       var and the gradient computes to none);
  //   (b) the active-state mismatch: the sidebar's active link must be the
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
      note: `${activeMismatches.length} active-state mismatch(es) (${activeMismatches.slice(0, 4).join(", ")}) — the sidebar's active link did not follow the navigation (the interaction contract: while view V is active, V's link carries aria-current=page)`,
    };
  }
  // The overflow check (the S16/S34 class — the Timetable's min-w-[900px]
  // canvas fits the 956px desktop content area at 1280; it must live inside
  // its container, never widen the document).
  const overflows: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (isObj(vr) && typeof vr.scrollWidth === "number" && vr.scrollWidth > 1280) overflows.push(`${a}/${v}:${vr.scrollWidth}`);
    }
  }
  if (overflows.length > 0) {
    return {
      green: false,
      findings: env.findings.length + overflows.length,
      note: `${overflows.length} view rendering(s) overflow the 1280px canvas (${overflows.slice(0, 4).join(", ")}) — the S16/S34 overflow class`,
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
    if (isObj(rec.sidebar)) {
      countEntries(rec.sidebar.unreadable);
      if (isArr(rec.sidebar.lowcontrast)) warns += rec.sidebar.lowcontrast.length;
    }
  }
  if (detections > 0) {
    return {
      green: false,
      findings: env.findings.length + detections,
      note: `${detections} unreadable detection(s) across ${renderings} view renderings + 7 sidebar records (the light contrast detector family; counted independently of the findings array; the CTA-face entries are exempt)`,
    };
  }
  return {
    green: env.findings.length === 0,
    findings: env.findings.length,
    note: `7 accents swept × ${renderings} view renderings + ${renderings} active-tint readings + 7 sidebar records at 1280×800 in MODE light, navigated through the sidebar (the desktop vehicle); every accent self-verified applied; the sidebar-own contracts hold (nav scrollable, heading offset); ${ctaFace} CTA-face exempt (white on accent-500 — the S11 family-2 non-gap); ${calendarDays} calendar adjacent-day exempt (slate-300 — the S6-G reference-measured pin); ${yellowPills} yellow-pill exempt (yellow-500 — the S6/S8 reference-measured pin); ${warns} WARN (lowcontrast — the S11 non-gap family)`,
  };
}

// --- accent-volume-sweep (S42) ---------------------------------------------------
// The data-volume × dark × accent stress — the S13 volume profile (300 tasks
// / 200 notes / 250 events) swept through the theme space's dark-accent half
// (the S41 summary's own named next step): 7 accents × the 7 volume-affected
// views (the S13 audit's own view set — the views that render task/note/
// event rows; the other 13 are volume-invariant) at 1280×800 in DARK mode,
// navigated through the SIDEBAR (the desktop vehicle). The per-view records
// carry the INTERACTION evidence (activeTint/activeLabel — the FIRST
// dark-mode readings of the sidebar's active-link tint through the
// navigation lifecycle; the S41 proof was light-only, and accent-dark's
// desktop pass navigates by direct goto and never reads the sidebar's
// active link), the S38 DARK detector family (flashbulbs — always findings;
// unreadable < 2.2 with the CTA-face exemption ONLY — the light-mode
// calendar-day + yellow-pill exemptions do NOT apply in dark, those
// surfaces re-theme; lowcontrast < 3.2 = WARN), AND the S13 volume
// measurement family (nodes/mainNodes/longTaskTotal ≤ 1500ms/clickLatencyMs
// ≤ 1500ms). The volume counts are EXACT (300/200/250 — a seed-volume
// envelope is its own rot class: the sweep measured the wrong density and
// must never read green). The volume × LIGHT family is the documented
// bracketed non-gap (the S13 data-volume audit owns light × violet ×
// volume; the S37–S41 light-accent sweeps own light × accent × seed).

const ACCENT_VOLUME_ALL_ACCENTS = new Set(["violet", "blue", "green", "orange", "pink", "red", "teal"]);
// The 7 volume-affected views by DISPLAY labels — the S13 data-volume
// audit's own view set; the per-view activeLabel reading is the same label.
const ACCENT_VOLUME_ALL_VIEWS = ["Dashboard", "My Day", "Tasks", "Calendar", "Events", "Notes", "Analytics"];

function classifyAccentVolumeSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string (the S27 rot-guard metadata)");
  if (!isObj(env.viewport) || env.viewport.width !== 1280 || env.viewport.height !== 800) {
    return shapeError(
      "viewport must be the desktop 1280×800 (the S13 volume audit's own viewport) — the volume × dark × accent surface is this audit's contract (the mobile/mid-band/landscape volume cells are future cross-axis candidates, documented in the session-42 plan's non-gaps)",
    );
  }
  if (
    !isObj(env.volume) ||
    typeof env.volume.tasks !== "number" ||
    typeof env.volume.notes !== "number" ||
    typeof env.volume.events !== "number"
  ) {
    return shapeError("volume must carry numeric tasks + notes + events (the S13 profile — the density the sweep measured)");
  }
  if (
    !isObj(env.chrome) ||
    typeof env.chrome.sidebarVisible !== "boolean" ||
    typeof env.chrome.hamburgerVisible !== "boolean" ||
    typeof env.chrome.sidebarNavScrollable !== "boolean"
  ) {
    return shapeError("chrome must carry boolean sidebarVisible + hamburgerVisible + sidebarNavScrollable (the INVERTED vehicle contract + the sidebar-own scroll contract)");
  }
  if (!isObj(env.api) || !isObj(env.api["/api/tasks"]) || typeof env.api["/api/tasks"].bytes !== "number") {
    return shapeError("api must carry the /api/tasks record with a numeric bytes (the S13 B1 payload bound's own surface)");
  }
  if (!isObj(env.accents)) return shapeError("accents must be an object of per-accent records");
  if (!isArr(env.findings)) return shapeError("findings must be an Array");
  const accentKeys = Object.keys(env.accents);
  for (const a of ACCENT_VOLUME_ALL_ACCENTS) {
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
    for (const v of ACCENT_VOLUME_ALL_VIEWS) {
      if (!(v in rec.views)) {
        return shapeError(
          `accents.${a}.views must carry all 7 volume views — "${v}" is missing: a view that silently did not run must never read green-by-omission (the omission-means-clean recording is RETIRED)`,
        );
      }
    }
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) return shapeError(`accents.${a}.views.${v} must be a record`);
      if (typeof vr.heading !== "string" || vr.heading.length === 0) return shapeError(`accents.${a}.views.${v}.heading must be a non-empty string`);
      if (typeof vr.scrollWidth !== "number") return shapeError(`accents.${a}.views.${v}.scrollWidth must be a number`);
      if (typeof vr.sidebarVisible !== "boolean") return shapeError(`accents.${a}.views.${v}.sidebarVisible must be a boolean (the vehicle persists through navigation — the desktop vehicle contract per view)`);
      if (typeof vr.headingOffset !== "boolean") {
        return shapeError(`accents.${a}.views.${v}.headingOffset must be a boolean (the content clears the fixed 260px sidebar — the lg:ml-[260px] contract)`);
      }
      if (!isArr(vr.flashbulbs)) return shapeError(`accents.${a}.views.${v}.flashbulbs must be an Array (the S38 dark detector family)`);
      if (!isArr(vr.unreadable)) return shapeError(`accents.${a}.views.${v}.unreadable must be an Array (the S38 dark detector family)`);
      if (!isArr(vr.lowcontrast)) return shapeError(`accents.${a}.views.${v}.lowcontrast must be an Array (the S38 dark detector family)`);
      if (!isArr(vr.consoleErrors)) return shapeError(`accents.${a}.views.${v}.consoleErrors must be an Array`);
      if (typeof vr.activeTint !== "string") return shapeError(`accents.${a}.views.${v}.activeTint must be a string (the active-link gradient reading — the interaction evidence is part of the record)`);
      if (typeof vr.activeLabel !== "string") return shapeError(`accents.${a}.views.${v}.activeLabel must be a string (the aria-current link when the tint was read)`);
      if (typeof vr.nodes !== "number") return shapeError(`accents.${a}.views.${v}.nodes must be a number (the S13 DOM census)`);
      if (typeof vr.mainNodes !== "number") return shapeError(`accents.${a}.views.${v}.mainNodes must be a number (the S13 DOM census)`);
      if (typeof vr.longTaskTotal !== "number") return shapeError(`accents.${a}.views.${v}.longTaskTotal must be a number (the S13 B3 main-thread budget's own measurement)`);
      if (typeof vr.clickLatencyMs !== "number") return shapeError(`accents.${a}.views.${v}.clickLatencyMs must be a number (the S13 B2 interactivity budget's own measurement)`);
    }
    if (
      !isObj(rec.sidebar) ||
      typeof rec.sidebar.linkCount !== "number" ||
      !isArr(rec.sidebar.unreadable) ||
      !isArr(rec.sidebar.lowcontrast)
    ) {
      return shapeError(`accents.${a}.sidebar must carry linkCount + unreadable + lowcontrast Arrays (the sidebar's own accent rendering at volume)`);
    }
  }
  // The mode rot guard (the S27 family): the volume × LIGHT family is the
  // documented bracketed non-gap (S13 light × violet × volume + S37–S41
  // light × accent × seed) — this audit owns the DARK half.
  if (env.mode !== "dark") {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (the S27 rot class; the volume × DARK × accent surface is this audit's contract — the volume × light family is the documented bracketed non-gap)`,
    };
  }
  // The volume rot guard: the S13 profile is EXACT — a seed-volume
  // envelope measured the wrong density and must never read green.
  if (env.volume.tasks !== 300 || env.volume.notes !== 200 || env.volume.events !== 250) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `volume=${env.volume.tasks}/${env.volume.notes}/${env.volume.events} — the sweep measured the wrong density (the S13 profile is 300 tasks / 200 notes / 250 events; the S38 omission-means-clean retirement applied to the volume axis)`,
    };
  }
  if (!env.chrome.sidebarVisible || env.chrome.hamburgerVisible) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the INVERTED chrome contract broke at 1280×800 — sidebarVisible=${env.chrome.sidebarVisible}, hamburgerVisible=${env.chrome.hamburgerVisible} (the lg contract: the sidebar is the desktop vehicle and renders ≥1024; the app bar is lg:hidden — the vehicle-contract finding class)`,
    };
  }
  if (!env.chrome.sidebarNavScrollable) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the sidebar-own scroll contract broke — sidebarNavScrollable=false at 800 height under at least one accent (the nav geometry: the 20 reference-measured rows cannot fit the ~534px nav area, so a non-scrolling nav means the sidebar geometry changed — links beyond the fold would be unreachable at desktop)`,
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
  // The sidebar checks: an error string is a FINDING (never a swallow — the
  // S38 doctrine) and the link census is 20 (the navigation census).
  const sidebarErrors: string[] = [];
  const linkCensus: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec)) continue;
    if (isObj(rec.sidebar)) {
      if (typeof rec.sidebar.error === "string" && rec.sidebar.error.length > 0) sidebarErrors.push(a);
      if (rec.sidebar.linkCount !== 20) linkCensus.push(`${a}:${rec.sidebar.linkCount}`);
    }
  }
  if (sidebarErrors.length > 0) {
    return {
      green: false,
      findings: env.findings.length + sidebarErrors.length,
      note: `${sidebarErrors.length} sidebar record(s) carry an error (${sidebarErrors.join(", ")}) — a sidebar whose detectors failed is a finding, never a swallow`,
    };
  }
  if (linkCensus.length > 0) {
    return {
      green: false,
      findings: env.findings.length + linkCensus.length,
      note: `${linkCensus.length} sidebar link census break(s) (${linkCensus.join(", ")} — the sidebar always carries all 20 links; a broken census means the navigation surface changed under volume)`,
    };
  }
  // The interaction checks — the S42 finding classes this audit OWNS in
  // DARK (the never-read cell): the tint rot + the active-state mismatch.
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
      note: `${activeMismatches.length} active-state mismatch(es) (${activeMismatches.slice(0, 4).join(", ")}) — the sidebar's active link did not follow the navigation (the interaction contract: while view V is active, V's link carries aria-current=page)`,
    };
  }
  // The overflow check (the S16/S34 class — a 300-row list must never
  // widen the document).
  const overflows: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (isObj(vr) && typeof vr.scrollWidth === "number" && vr.scrollWidth > 1280) overflows.push(`${a}/${v}:${vr.scrollWidth}`);
    }
  }
  if (overflows.length > 0) {
    return {
      green: false,
      findings: env.findings.length + overflows.length,
      note: `${overflows.length} view rendering(s) overflow the 1280px canvas (${overflows.slice(0, 4).join(", ")}) — the S16/S34 overflow class`,
    };
  }
  // The S13 volume budgets — the B3 main-thread class + the B2
  // interactivity class (per view per accent; the boundary value 1500
  // stays green on both).
  const longTaskBudgets: string[] = [];
  const clickBudgets: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) continue;
      if (typeof vr.longTaskTotal === "number" && vr.longTaskTotal > 1500) longTaskBudgets.push(`${a}/${v}:${vr.longTaskTotal}ms`);
      if (typeof vr.clickLatencyMs === "number" && vr.clickLatencyMs > 1500) clickBudgets.push(`${a}/${v}:${vr.clickLatencyMs}ms`);
    }
  }
  if (longTaskBudgets.length > 0) {
    return {
      green: false,
      findings: env.findings.length + longTaskBudgets.length,
      note: `${longTaskBudgets.length} view rendering(s) exceed the 1500ms long-task budget under stress (${longTaskBudgets.slice(0, 4).join(", ")}) — the S13 B3 main-thread-blocking class (the volume contract broke under the theme variation)`,
    };
  }
  if (clickBudgets.length > 0) {
    return {
      green: false,
      findings: env.findings.length + clickBudgets.length,
      note: `${clickBudgets.length} nav click(s) exceed the 1500ms interactivity budget under stress (${clickBudgets.slice(0, 4).join(", ")}) — the S13 B2 interactivity class (the navigation went unresponsive under volume)`,
    };
  }
  // The independent contrast-detection count (the anti-phantom doctrine),
  // with the DARK doctrine's single exemption: the CTA-face (white on
  // accent-500 — the S11 family-2 non-gap). The LIGHT-mode exemptions
  // (the calendar adjacent-day slate-300 + the yellow priority-pill
  // yellow-500) do NOT apply — in dark those surfaces re-theme, so any
  // unreadable hit is genuine. Flashbulbs are ALWAYS findings.
  let detections = 0;
  let flashbulbs = 0;
  let ctaFace = 0;
  let warns = 0;
  let renderings = 0;
  const countEntries = (arr: unknown) => {
    if (!isArr(arr)) return;
    for (const e of arr) {
      if (isObj(e) && e.color === "rgb(255, 255, 255)") {
        ctaFace += 1;
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
        if (isArr(vr.flashbulbs)) flashbulbs += vr.flashbulbs.length;
        countEntries(vr.unreadable);
        if (isArr(vr.lowcontrast)) warns += vr.lowcontrast.length;
      }
    }
    if (isObj(rec.sidebar)) {
      countEntries(rec.sidebar.unreadable);
      if (isArr(rec.sidebar.lowcontrast)) warns += rec.sidebar.lowcontrast.length;
    }
  }
  if (flashbulbs > 0) {
    return {
      green: false,
      findings: env.findings.length + flashbulbs,
      note: `${flashbulbs} flashbulb detection(s) across ${renderings} view renderings (a light surface on the dark canvas — ALWAYS a finding in dark mode, the S38 doctrine)`,
    };
  }
  if (detections > 0) {
    return {
      green: false,
      findings: env.findings.length + detections,
      note: `${detections} unreadable detection(s) across ${renderings} view renderings + 7 sidebar records at volume (the S38 dark contrast detector family; counted independently of the findings array; the CTA-face entries are exempt)`,
    };
  }
  // The S13 B1 payload bound: /api/tasks must stay bounded at 300 rows.
  if (env.api["/api/tasks"].bytes > 500_000) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the /api/tasks payload measured ${env.api["/api/tasks"].bytes} bytes at 300 rows — the S13 B1 unbounded-payload class (the list endpoints must stay bounded under stress)`,
    };
  }
  return {
    green: env.findings.length === 0,
    findings: env.findings.length,
    note: `7 accents swept × ${renderings} view renderings + ${renderings} active-tint readings + 7 sidebar records at 1280×800 in MODE dark under the 300/200/250 volume profile, navigated through the sidebar (the desktop vehicle); every accent self-verified applied; the volume budgets hold (long tasks ≤ 1500ms, clicks ≤ 1500ms, the /api/tasks payload ${env.api["/api/tasks"].bytes} bytes ≤ 500000); ${ctaFace} CTA-face exempt (white on accent-500 — the S11 family-2 non-gap); ${warns} WARN (lowcontrast — the S11 non-gap family)`,
  };
}

// --- accent-volume-light-sweep (S43) ---------------------------------------------
// The data-volume × LIGHT × accent stress — the S13 volume profile (300
// tasks / 200 notes / 250 events) swept through the theme space's
// light-accent half (the S42 summary's own first named next candidate: the
// documented bracketed non-gap — the S13 data-volume audit owns light ×
// violet × volume with ZERO theme references, the S37–S41 light-accent
// sweeps own light × accent × SEED, and the S42 accent-volume-sweep owns
// DARK × accent × volume): 7 accents × the 7 volume-affected views (the
// S13 audit's own view set) at 1280×800 in LIGHT mode, navigated through
// the SIDEBAR (the desktop vehicle). The per-view records carry the
// INTERACTION evidence (activeTint/activeLabel — the light × volume
// interaction cell: S41 proved light at SEED volume, S42 proved dark at
// volume), the LIGHT detector family (unreadable < 2.2 with the THREE
// signature-strict light exemptions — the CTA-face white-on-accent-500,
// the calendar adjacent-month day numbers slate-300, the yellow
// priority-pill yellow-500; lowcontrast < 3.2 = WARN; NO flashbulbs — the
// flashbulb class, a light surface on the dark canvas, exists only in
// dark; in light mode light surfaces are by-design, the S37/S39/S40/S41
// convention), AND the S13 volume measurement family (nodes/mainNodes/
// longTaskTotal ≤ 1500ms/clickLatencyMs ≤ 1500ms). The volume counts are
// EXACT (300/200/250 — a seed-volume envelope is its own rot class: the
// sweep measured the wrong density and must never read green). The dark ×
// accent × volume cell is the S42 audit's own contract (its seam's mode
// guard reads dark; this seam's reads light).

const ACCENT_VOLUME_LIGHT_ALL_ACCENTS = new Set(["violet", "blue", "green", "orange", "pink", "red", "teal"]);
// The 7 volume-affected views by DISPLAY labels — the S13 data-volume
// audit's own view set (the views that render task/note/event rows; the
// other 13 are volume-invariant and stay covered by the S38/S41 seed
// sweeps); the per-view activeLabel reading is the same label.
const ACCENT_VOLUME_LIGHT_ALL_VIEWS = ["Dashboard", "My Day", "Tasks", "Calendar", "Events", "Notes", "Analytics"];

function classifyAccentVolumeLightSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string (the S27 rot-guard metadata)");
  if (!isObj(env.viewport) || env.viewport.width !== 1280 || env.viewport.height !== 800) {
    return shapeError(
      "viewport must be the desktop 1280×800 (the S13 volume audit's own viewport) — the volume × light × accent surface is this audit's contract (the mobile/mid-band/landscape volume cells are future cross-axis candidates, documented in the session-43 plan's non-gaps)",
    );
  }
  if (
    !isObj(env.volume) ||
    typeof env.volume.tasks !== "number" ||
    typeof env.volume.notes !== "number" ||
    typeof env.volume.events !== "number"
  ) {
    return shapeError("volume must carry numeric tasks + notes + events (the S13 profile — the density the sweep measured)");
  }
  if (
    !isObj(env.chrome) ||
    typeof env.chrome.sidebarVisible !== "boolean" ||
    typeof env.chrome.hamburgerVisible !== "boolean" ||
    typeof env.chrome.sidebarNavScrollable !== "boolean"
  ) {
    return shapeError("chrome must carry boolean sidebarVisible + hamburgerVisible + sidebarNavScrollable (the INVERTED vehicle contract + the sidebar-own scroll contract)");
  }
  if (!isObj(env.api) || !isObj(env.api["/api/tasks"]) || typeof env.api["/api/tasks"].bytes !== "number") {
    return shapeError("api must carry the /api/tasks record with a numeric bytes (the S13 B1 payload bound's own surface)");
  }
  if (!isObj(env.accents)) return shapeError("accents must be an object of per-accent records");
  if (!isArr(env.findings)) return shapeError("findings must be an Array");
  const accentKeys = Object.keys(env.accents);
  for (const a of ACCENT_VOLUME_LIGHT_ALL_ACCENTS) {
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
    for (const v of ACCENT_VOLUME_LIGHT_ALL_VIEWS) {
      if (!(v in rec.views)) {
        return shapeError(
          `accents.${a}.views must carry all 7 volume views — "${v}" is missing: a view that silently did not run must never read green-by-omission (the omission-means-clean recording is RETIRED)`,
        );
      }
    }
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) return shapeError(`accents.${a}.views.${v} must be a record`);
      if (typeof vr.heading !== "string" || vr.heading.length === 0) return shapeError(`accents.${a}.views.${v}.heading must be a non-empty string`);
      if (typeof vr.scrollWidth !== "number") return shapeError(`accents.${a}.views.${v}.scrollWidth must be a number`);
      if (typeof vr.sidebarVisible !== "boolean") return shapeError(`accents.${a}.views.${v}.sidebarVisible must be a boolean (the vehicle persists through navigation — the desktop vehicle contract per view)`);
      if (typeof vr.headingOffset !== "boolean") {
        return shapeError(`accents.${a}.views.${v}.headingOffset must be a boolean (the content clears the fixed 260px sidebar — the lg:ml-[260px] contract)`);
      }
      if (!isArr(vr.unreadable)) return shapeError(`accents.${a}.views.${v}.unreadable must be an Array (the light detector family)`);
      if (!isArr(vr.lowcontrast)) return shapeError(`accents.${a}.views.${v}.lowcontrast must be an Array (the light detector family)`);
      if (!isArr(vr.consoleErrors)) return shapeError(`accents.${a}.views.${v}.consoleErrors must be an Array`);
      if (typeof vr.activeTint !== "string") return shapeError(`accents.${a}.views.${v}.activeTint must be a string (the active-link gradient reading — the interaction evidence is part of the record)`);
      if (typeof vr.activeLabel !== "string") return shapeError(`accents.${a}.views.${v}.activeLabel must be a string (the aria-current link when the tint was read)`);
      if (typeof vr.nodes !== "number") return shapeError(`accents.${a}.views.${v}.nodes must be a number (the S13 DOM census)`);
      if (typeof vr.mainNodes !== "number") return shapeError(`accents.${a}.views.${v}.mainNodes must be a number (the S13 DOM census)`);
      if (typeof vr.longTaskTotal !== "number") return shapeError(`accents.${a}.views.${v}.longTaskTotal must be a number (the S13 B3 main-thread budget's own measurement)`);
      if (typeof vr.clickLatencyMs !== "number") return shapeError(`accents.${a}.views.${v}.clickLatencyMs must be a number (the S13 B2 interactivity budget's own measurement)`);
    }
    if (
      !isObj(rec.sidebar) ||
      typeof rec.sidebar.linkCount !== "number" ||
      !isArr(rec.sidebar.unreadable) ||
      !isArr(rec.sidebar.lowcontrast)
    ) {
      return shapeError(`accents.${a}.sidebar must carry linkCount + unreadable + lowcontrast Arrays (the sidebar's own accent rendering at volume)`);
    }
  }
  // The mode rot guard (the S27 family, INVERTED): the volume × DARK ×
  // accent cell is the S42 audit's own contract — this audit owns the
  // LIGHT half (the documented bracketed non-gap, now closed).
  if (env.mode !== "light") {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (the S27 rot class; the volume × LIGHT × accent surface is this audit's contract — the dark half is the S42 accent-volume-sweep's own)`,
    };
  }
  // The volume rot guard: the S13 profile is EXACT — a seed-volume
  // envelope measured the wrong density and must never read green.
  if (env.volume.tasks !== 300 || env.volume.notes !== 200 || env.volume.events !== 250) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `volume=${env.volume.tasks}/${env.volume.notes}/${env.volume.events} — the sweep measured the wrong density (the S13 profile is 300 tasks / 200 notes / 250 events; the S38 omission-means-clean retirement applied to the volume axis)`,
    };
  }
  if (!env.chrome.sidebarVisible || env.chrome.hamburgerVisible) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the INVERTED chrome contract broke at 1280×800 — sidebarVisible=${env.chrome.sidebarVisible}, hamburgerVisible=${env.chrome.hamburgerVisible} (the lg contract: the sidebar is the desktop vehicle and renders ≥1024; the app bar is lg:hidden — the vehicle-contract finding class)`,
    };
  }
  if (!env.chrome.sidebarNavScrollable) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the sidebar-own scroll contract broke — sidebarNavScrollable=false at 800 height under at least one accent (the nav geometry: the 20 reference-measured rows cannot fit the ~534px nav area, so a non-scrolling nav means the sidebar geometry changed — links beyond the fold would be unreachable at desktop)`,
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
  // The sidebar checks: an error string is a FINDING (never a swallow — the
  // S38 doctrine) and the link census is 20 (the navigation census).
  const sidebarErrors: string[] = [];
  const linkCensus: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec)) continue;
    if (isObj(rec.sidebar)) {
      if (typeof rec.sidebar.error === "string" && rec.sidebar.error.length > 0) sidebarErrors.push(a);
      if (rec.sidebar.linkCount !== 20) linkCensus.push(`${a}:${rec.sidebar.linkCount}`);
    }
  }
  if (sidebarErrors.length > 0) {
    return {
      green: false,
      findings: env.findings.length + sidebarErrors.length,
      note: `${sidebarErrors.length} sidebar record(s) carry an error (${sidebarErrors.join(", ")}) — a sidebar whose detectors failed is a finding, never a swallow`,
    };
  }
  if (linkCensus.length > 0) {
    return {
      green: false,
      findings: env.findings.length + linkCensus.length,
      note: `${linkCensus.length} sidebar link census break(s) (${linkCensus.join(", ")} — the sidebar always carries all 20 links; a broken census means the navigation surface changed under volume)`,
    };
  }
  // The interaction checks — the S43 finding classes this audit OWNS in
  // LIGHT at volume (the light × volume cell): the tint rot + the
  // active-state mismatch.
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
      note: `${activeMismatches.length} active-state mismatch(es) (${activeMismatches.slice(0, 4).join(", ")}) — the sidebar's active link did not follow the navigation (the interaction contract: while view V is active, V's link carries aria-current=page)`,
    };
  }
  // The overflow check (the S16/S34 class — a 300-row list must never
  // widen the document).
  const overflows: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (isObj(vr) && typeof vr.scrollWidth === "number" && vr.scrollWidth > 1280) overflows.push(`${a}/${v}:${vr.scrollWidth}`);
    }
  }
  if (overflows.length > 0) {
    return {
      green: false,
      findings: env.findings.length + overflows.length,
      note: `${overflows.length} view rendering(s) overflow the 1280px canvas (${overflows.slice(0, 4).join(", ")}) — the S16/S34 overflow class`,
    };
  }
  // The S13 volume budgets — the B3 main-thread class + the B2
  // interactivity class (per view per accent; the boundary value 1500
  // stays green on both).
  const longTaskBudgets: string[] = [];
  const clickBudgets: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) continue;
      if (typeof vr.longTaskTotal === "number" && vr.longTaskTotal > 1500) longTaskBudgets.push(`${a}/${v}:${vr.longTaskTotal}ms`);
      if (typeof vr.clickLatencyMs === "number" && vr.clickLatencyMs > 1500) clickBudgets.push(`${a}/${v}:${vr.clickLatencyMs}ms`);
    }
  }
  if (longTaskBudgets.length > 0) {
    return {
      green: false,
      findings: env.findings.length + longTaskBudgets.length,
      note: `${longTaskBudgets.length} view rendering(s) exceed the 1500ms long-task budget under stress (${longTaskBudgets.slice(0, 4).join(", ")}) — the S13 B3 main-thread-blocking class (the volume contract broke under the theme variation)`,
    };
  }
  if (clickBudgets.length > 0) {
    return {
      green: false,
      findings: env.findings.length + clickBudgets.length,
      note: `${clickBudgets.length} nav click(s) exceed the 1500ms interactivity budget under stress (${clickBudgets.slice(0, 4).join(", ")}) — the S13 B2 interactivity class (the navigation went unresponsive under volume)`,
    };
  }
  // The independent contrast-detection count (the anti-phantom doctrine),
  // with the LIGHT doctrine's THREE signature-strict exemptions (the
  // S37/S41 doctrine — these surfaces are the reference's own design in
  // light; in dark they re-theme, which is why the S42 seam exempts the
  // CTA-face ONLY):
  //   (a) the CTA-face — white rgb(255, 255, 255) on accent-500 (the S11
  //       family-2 non-gap);
  //   (b) the calendar adjacent-month day numbers — slate-300
  //       rgb(203, 213, 225), 1–2 digit text (the S6-G measured pin);
  //   (c) the yellow priority-pill text — yellow-500 rgb(234, 179, 8), the
  //       {high, medium, low} vocabulary (the S6/S8 measured pin).
  // Any OTHER unreadable combination is a genuine finding (counted). There
  // is NO flashbulb class in light (light surfaces are by-design on the
  // light canvas — the class exists only in dark).
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
    if (isObj(rec.sidebar)) {
      countEntries(rec.sidebar.unreadable);
      if (isArr(rec.sidebar.lowcontrast)) warns += rec.sidebar.lowcontrast.length;
    }
  }
  if (detections > 0) {
    return {
      green: false,
      findings: env.findings.length + detections,
      note: `${detections} unreadable detection(s) across ${renderings} view renderings + 7 sidebar records at volume (the light contrast detector family; counted independently of the findings array; the CTA-face + calendar adjacent-day + yellow-pill entries are exempt)`,
    };
  }
  // The S13 B1 payload bound: /api/tasks must stay bounded at 300 rows.
  if (env.api["/api/tasks"].bytes > 500_000) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the /api/tasks payload measured ${env.api["/api/tasks"].bytes} bytes at 300 rows — the S13 B1 unbounded-payload class (the list endpoints must stay bounded under stress)`,
    };
  }
  return {
    green: env.findings.length === 0,
    findings: env.findings.length,
    note: `7 accents swept × ${renderings} view renderings + ${renderings} active-tint readings + 7 sidebar records at 1280×800 in MODE light under the 300/200/250 volume profile, navigated through the sidebar (the desktop vehicle); every accent self-verified applied; the volume budgets hold (long tasks ≤ 1500ms, clicks ≤ 1500ms, the /api/tasks payload ${env.api["/api/tasks"].bytes} bytes ≤ 500000); ${ctaFace} CTA-face exempt (white on accent-500 — the S11 family-2 non-gap); ${calendarDays} calendar adjacent-day exempt (slate-300 — the S6-G reference-measured pin); ${yellowPills} yellow-pill exempt (yellow-500 — the S6/S8 reference-measured pin); ${warns} WARN (lowcontrast — the S11 non-gap family)`,
  };
}

// --- accent-volume-dark-mobile-sweep (S44) ---------------------------------------
// The dark × mobile × volume stress — the S13 volume profile (300 tasks /
// 200 notes / 250 events) swept through the theme space's dark half at the
// MOBILE viewport (390×844, the S33/S36 mobile class), navigated through
// the DRAWER (the only vehicle below 1024): the cross-axis cell the
// standing surface never probed — the S13 data-volume audit runs 1280×800
// light+violet only (zero theme references), every mobile-viewport sweep
// (S33–S37/S39/S40) runs at SEED volume, and both volume × accent sweeps
// (S42 dark, S43 light) run at 1280×800 only (their viewport guards read
// the desktop — the viewport axis is their blind spot). The per-view
// records carry the MOBILE structural family (drawerClosed/appBar/
// headingClearance — the S33/S35/S36 contracts at volume), the INTERACTION
// evidence (activeTint/activeLabel — read at the NEXT drawer open while the
// view is active, the S40 pendingView pattern: the dark × mobile × volume
// cell: S36 proved dark × mobile at seed, S40 accent × drawer at seed
// light, S42 dark × volume at desktop), the DARK detector family
// (flashbulbs ALWAYS findings — a light surface on the dark canvas, the
// S38/S42 doctrine; unreadable < 2.2 with the CTA-face exemption ONLY —
// the calendar adjacent-day and yellow-pill light exemptions do NOT apply,
// those surfaces re-theme in dark; lowcontrast < 3.2 = WARN), AND the S13
// volume measurement family (nodes/mainNodes/longTaskTotal ≤ 1500ms/
// clickLatencyMs ≤ 1500ms — the drawer-click → heading path). The volume
// counts are EXACT (300/200/250 — the S38 omission-means-clean retirement
// applied to the volume axis from birth). The MOBILE vehicle contract is
// the INVERSE of the desktop seams: the sidebar (hidden lg:flex) must be
// HIDDEN at 390 and the hamburger VISIBLE, the drawer-own nav scroll is
// the only path to links ~14–20 at 844 height (scrollHeight 1068 vs
// clientHeight ≈ 700). The dark × desktop × volume cell is the S42
// audit's own contract; the light × mobile × volume cell is the documented
// future cross-axis candidate (the S43 one-half-per-session pattern).

const ACCENT_VOLUME_DARK_MOBILE_ALL_ACCENTS = new Set(["violet", "blue", "green", "orange", "pink", "red", "teal"]);
// The 7 volume-affected views by DISPLAY labels — the S13 data-volume
// audit's own view set (the views that render task/note/event rows; the
// other 13 are volume-invariant and stay covered by the S36/S40 seed
// sweeps).
const ACCENT_VOLUME_DARK_MOBILE_ALL_VIEWS = ["Dashboard", "My Day", "Tasks", "Calendar", "Events", "Notes", "Analytics"];

function classifyAccentVolumeDarkMobileSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string (the S27 rot-guard metadata)");
  if (!isObj(env.viewport) || env.viewport.width !== 390 || env.viewport.height !== 844) {
    return shapeError(
      "viewport must be the mobile portrait 390×844 (the S33/S36 mobile class) — the dark × mobile × volume surface is this audit's contract (the desktop 1280×800 halves are the S42/S43 audits' own; the mid-band/landscape volume cells are future cross-axis candidates, documented in the session-44 plan's non-gaps)",
    );
  }
  if (
    !isObj(env.volume) ||
    typeof env.volume.tasks !== "number" ||
    typeof env.volume.notes !== "number" ||
    typeof env.volume.events !== "number"
  ) {
    return shapeError("volume must carry numeric tasks + notes + events (the S13 profile — the density the sweep measured)");
  }
  if (
    !isObj(env.chrome) ||
    typeof env.chrome.sidebarVisible !== "boolean" ||
    typeof env.chrome.hamburgerVisible !== "boolean" ||
    typeof env.chrome.drawerNavScrollable !== "boolean"
  ) {
    return shapeError("chrome must carry boolean sidebarVisible + hamburgerVisible + drawerNavScrollable (the MOBILE vehicle contract + the drawer-own scroll contract)");
  }
  if (!isObj(env.api) || !isObj(env.api["/api/tasks"]) || typeof env.api["/api/tasks"].bytes !== "number") {
    return shapeError("api must carry the /api/tasks record with a numeric bytes (the S13 B1 payload bound's own surface)");
  }
  if (!isObj(env.accents)) return shapeError("accents must be an object of per-accent records");
  if (!isArr(env.findings)) return shapeError("findings must be an Array");
  const accentKeys = Object.keys(env.accents);
  for (const a of ACCENT_VOLUME_DARK_MOBILE_ALL_ACCENTS) {
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
    for (const v of ACCENT_VOLUME_DARK_MOBILE_ALL_VIEWS) {
      if (!(v in rec.views)) {
        return shapeError(
          `accents.${a}.views must carry all 7 volume views — "${v}" is missing: a view that silently did not run must never read green-by-omission (the omission-means-clean recording is RETIRED)`,
        );
      }
    }
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) return shapeError(`accents.${a}.views.${v} must be a record`);
      if (typeof vr.heading !== "string" || vr.heading.length === 0) return shapeError(`accents.${a}.views.${v}.heading must be a non-empty string`);
      if (typeof vr.scrollWidth !== "number") return shapeError(`accents.${a}.views.${v}.scrollWidth must be a number`);
      if (typeof vr.drawerClosed !== "boolean") return shapeError(`accents.${a}.views.${v}.drawerClosed must be a boolean (the drawer closes on navigation — the mobile vehicle contract)`);
      if (typeof vr.appBar !== "boolean") return shapeError(`accents.${a}.views.${v}.appBar must be a boolean (the fixed glass app bar — brand + the 2-digit-hour clock)`);
      if (typeof vr.headingClearance !== "boolean") {
        return shapeError(`accents.${a}.views.${v}.headingClearance must be a boolean (the heading clears the fixed 64px bar — the S35 contract at volume)`);
      }
      if (!isArr(vr.flashbulbs)) return shapeError(`accents.${a}.views.${v}.flashbulbs must be an Array (the S38/S42 dark detector family)`);
      if (!isArr(vr.unreadable)) return shapeError(`accents.${a}.views.${v}.unreadable must be an Array (the S38/S42 dark detector family)`);
      if (!isArr(vr.lowcontrast)) return shapeError(`accents.${a}.views.${v}.lowcontrast must be an Array (the S38/S42 dark detector family)`);
      if (!isArr(vr.consoleErrors)) return shapeError(`accents.${a}.views.${v}.consoleErrors must be an Array`);
      if (typeof vr.activeTint !== "string") return shapeError(`accents.${a}.views.${v}.activeTint must be a string (the active-link gradient reading — the interaction evidence is part of the record)`);
      if (typeof vr.activeLabel !== "string") return shapeError(`accents.${a}.views.${v}.activeLabel must be a string (the aria-current link when the tint was read)`);
      if (typeof vr.nodes !== "number") return shapeError(`accents.${a}.views.${v}.nodes must be a number (the S13 DOM census)`);
      if (typeof vr.mainNodes !== "number") return shapeError(`accents.${a}.views.${v}.mainNodes must be a number (the S13 DOM census)`);
      if (typeof vr.longTaskTotal !== "number") return shapeError(`accents.${a}.views.${v}.longTaskTotal must be a number (the S13 B3 main-thread budget's own measurement)`);
      if (typeof vr.clickLatencyMs !== "number") return shapeError(`accents.${a}.views.${v}.clickLatencyMs must be a number (the S13 B2 interactivity budget's own measurement)`);
    }
    if (
      !isObj(rec.drawer) ||
      typeof rec.drawer.linkCount !== "number" ||
      !isArr(rec.drawer.flashbulbs) ||
      !isArr(rec.drawer.unreadable) ||
      !isArr(rec.drawer.lowcontrast)
    ) {
      return shapeError(`accents.${a}.drawer must carry linkCount + flashbulbs + unreadable + lowcontrast Arrays (the drawer's own dark rendering at volume — the mobile vehicle)`);
    }
  }
  // The mode rot guard (the S27 family): the dark × mobile × volume surface
  // is this audit's contract — the light × mobile × volume family is the
  // documented future cross-axis candidate (the S43 one-half-per-session
  // pattern; the light family needs the THREE light exemptions, not the
  // dark family this seam carries).
  if (env.mode !== "dark") {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (the S27 rot class; the dark × mobile × volume surface is this audit's contract — the light × mobile × volume family is the documented future cross-axis candidate)`,
    };
  }
  // The volume rot guard: the S13 profile is EXACT — a seed-volume
  // envelope measured the wrong density and must never read green.
  if (env.volume.tasks !== 300 || env.volume.notes !== 200 || env.volume.events !== 250) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `volume=${env.volume.tasks}/${env.volume.notes}/${env.volume.events} — the sweep measured the wrong density (the S13 profile is 300 tasks / 200 notes / 250 events; the S38 omission-means-clean retirement applied to the volume axis)`,
    };
  }
  // The MOBILE vehicle contract (the INVERSE of the S41/S42/S43 desktop
  // seams): the sidebar is hidden lg:flex — below 1024 the DRAWER is the
  // only vehicle, and the app bar's hamburger is its handle.
  if (env.chrome.sidebarVisible || !env.chrome.hamburgerVisible) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the MOBILE chrome contract broke at 390 — sidebarVisible=${env.chrome.sidebarVisible}, hamburgerVisible=${env.chrome.hamburgerVisible} (the lg contract: the sidebar renders only ≥1024; below that the drawer is the vehicle — the vehicle-contract finding class)`,
    };
  }
  if (!env.chrome.drawerNavScrollable) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the drawer-own scroll contract broke — drawerNavScrollable=false at 844 height under at least one accent (the nav geometry: the 20 reference-measured rows cannot fit the ~700px nav area, so a non-scrolling nav means the drawer geometry changed — links ~14–20 would be unreachable at mobile)`,
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
  // The drawer checks: an error string is a FINDING (never a swallow — the
  // S38 doctrine) and the link census is 20 (the navigation census).
  const drawerErrors: string[] = [];
  const linkCensus: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec)) continue;
    if (isObj(rec.drawer)) {
      if (typeof rec.drawer.error === "string" && rec.drawer.error.length > 0) drawerErrors.push(a);
      if (rec.drawer.linkCount !== 20) linkCensus.push(`${a}:${rec.drawer.linkCount}`);
    }
  }
  if (drawerErrors.length > 0) {
    return {
      green: false,
      findings: env.findings.length + drawerErrors.length,
      note: `${drawerErrors.length} drawer record(s) carry an error (${drawerErrors.join(", ")}) — a drawer whose detectors failed is a finding, never a swallow`,
    };
  }
  if (linkCensus.length > 0) {
    return {
      green: false,
      findings: env.findings.length + linkCensus.length,
      note: `${linkCensus.length} drawer link census break(s) (${linkCensus.join(", ")} — the drawer always carries all 20 links; a broken census means the navigation surface changed under volume)`,
    };
  }
  // The interaction checks — the S44 finding classes this audit OWNS in
  // DARK at MOBILE at volume (the dark × mobile × volume cell): the tint
  // rot + the active-state mismatch.
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
  // The structural mobile family at volume: the drawer that did not close
  // on navigation, the missing app bar, the heading under the fixed bar.
  const stuckDrawers: string[] = [];
  const missingBars: string[] = [];
  const clearanceBreaches: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) continue;
      if (vr.drawerClosed === false) stuckDrawers.push(`${a}/${v}`);
      if (vr.appBar === false) missingBars.push(`${a}/${v}`);
      if (vr.headingClearance === false) clearanceBreaches.push(`${a}/${v}`);
    }
  }
  if (stuckDrawers.length > 0) {
    return {
      green: false,
      findings: env.findings.length + stuckDrawers.length,
      note: `${stuckDrawers.length} drawer navigation(s) did not close the drawer (${stuckDrawers.slice(0, 4).join(", ")}) — the S8/S16 drawer-closes-on-navigation contract broke at volume`,
    };
  }
  if (missingBars.length > 0) {
    return {
      green: false,
      findings: env.findings.length + missingBars.length,
      note: `${missingBars.length} view rendering(s) lost the fixed glass app bar (brand + 2-digit-hour clock) (${missingBars.slice(0, 4).join(", ")}) — the mobile chrome contract at volume`,
    };
  }
  if (clearanceBreaches.length > 0) {
    return {
      green: false,
      findings: env.findings.length + clearanceBreaches.length,
      note: `${clearanceBreaches.length} identity heading(s) sit under the fixed 64px app bar (${clearanceBreaches.slice(0, 4).join(", ")}) — the S35 heading-clearance contract broke at volume`,
    };
  }
  // The overflow check (the S16 mobile-only-gap class — a 300-row list must
  // never widen the 390px document).
  const overflows: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (isObj(vr) && typeof vr.scrollWidth === "number" && vr.scrollWidth > 390) overflows.push(`${a}/${v}:${vr.scrollWidth}`);
    }
  }
  if (overflows.length > 0) {
    return {
      green: false,
      findings: env.findings.length + overflows.length,
      note: `${overflows.length} view rendering(s) overflow the 390px canvas (${overflows.slice(0, 4).join(", ")}) — the S16 mobile-only overflow class`,
    };
  }
  // The S13 volume budgets — the B3 main-thread class + the B2
  // interactivity class (per view per accent; the boundary value 1500
  // stays green on both).
  const longTaskBudgets: string[] = [];
  const clickBudgets: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) continue;
      if (typeof vr.longTaskTotal === "number" && vr.longTaskTotal > 1500) longTaskBudgets.push(`${a}/${v}:${vr.longTaskTotal}ms`);
      if (typeof vr.clickLatencyMs === "number" && vr.clickLatencyMs > 1500) clickBudgets.push(`${a}/${v}:${vr.clickLatencyMs}ms`);
    }
  }
  if (longTaskBudgets.length > 0) {
    return {
      green: false,
      findings: env.findings.length + longTaskBudgets.length,
      note: `${longTaskBudgets.length} view rendering(s) exceed the 1500ms long-task budget under stress (${longTaskBudgets.slice(0, 4).join(", ")}) — the S13 B3 main-thread-blocking class (the volume contract broke under the theme variation at mobile)`,
    };
  }
  if (clickBudgets.length > 0) {
    return {
      green: false,
      findings: env.findings.length + clickBudgets.length,
      note: `${clickBudgets.length} drawer click(s) exceed the 1500ms interactivity budget under stress (${clickBudgets.slice(0, 4).join(", ")}) — the S13 B2 interactivity class (the navigation went unresponsive under volume at mobile)`,
    };
  }
  // The independent dark-detection count (the anti-phantom doctrine), with
  // the DARK doctrine's single exemption: the CTA-face (white on
  // accent-500 — the S11 family-2 non-gap). The LIGHT-mode exemptions (the
  // calendar adjacent-day slate-300 + the yellow priority-pill yellow-500)
  // do NOT apply — in dark those surfaces re-theme, so any unreadable hit
  // is genuine. Flashbulbs are ALWAYS findings.
  let detections = 0;
  let flashbulbs = 0;
  let ctaFace = 0;
  let warns = 0;
  let renderings = 0;
  const countEntries = (arr: unknown) => {
    if (!isArr(arr)) return;
    for (const e of arr) {
      if (isObj(e) && e.color === "rgb(255, 255, 255)") {
        ctaFace += 1;
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
        if (isArr(vr.flashbulbs)) flashbulbs += vr.flashbulbs.length;
        countEntries(vr.unreadable);
        if (isArr(vr.lowcontrast)) warns += vr.lowcontrast.length;
      }
    }
    if (isObj(rec.drawer)) {
      if (isArr(rec.drawer.flashbulbs)) flashbulbs += rec.drawer.flashbulbs.length;
      countEntries(rec.drawer.unreadable);
      if (isArr(rec.drawer.lowcontrast)) warns += rec.drawer.lowcontrast.length;
    }
  }
  if (flashbulbs > 0) {
    return {
      green: false,
      findings: env.findings.length + flashbulbs,
      note: `${flashbulbs} flashbulb detection(s) across ${renderings} view renderings + 7 drawer records (a light surface on the dark canvas — ALWAYS a finding in dark mode, the S38 doctrine at the mobile layout under volume)`,
    };
  }
  if (detections > 0) {
    return {
      green: false,
      findings: env.findings.length + detections,
      note: `${detections} unreadable detection(s) across ${renderings} view renderings + 7 drawer records at volume (the S38/S42 dark contrast detector family at the mobile layout; counted independently of the findings array; the CTA-face entries are exempt)`,
    };
  }
  // The S13 B1 payload bound: /api/tasks must stay bounded at 300 rows.
  if (env.api["/api/tasks"].bytes > 500_000) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the /api/tasks payload measured ${env.api["/api/tasks"].bytes} bytes at 300 rows — the S13 B1 unbounded-payload class (the list endpoints must stay bounded under stress)`,
    };
  }
  return {
    green: env.findings.length === 0,
    findings: env.findings.length,
    note: `7 accents swept × ${renderings} view renderings + ${renderings} active-tint readings + 7 drawer records at 390×844 in MODE dark under the 300/200/250 volume profile, navigated through the drawer (the mobile vehicle); every accent self-verified applied; the volume budgets hold (long tasks ≤ 1500ms, clicks ≤ 1500ms, the /api/tasks payload ${env.api["/api/tasks"].bytes} bytes ≤ 500000); ${ctaFace} CTA-face exempt (white on accent-500 — the S11 family-2 non-gap); ${warns} WARN (lowcontrast — the S11 non-gap family)`,
  };
}

// --- accent-volume-light-mobile-sweep (S45) ---------------------------------------
// The light × mobile × volume stress — the S13 volume profile (300 tasks /
// 200 notes / 250 events) swept through the theme space's LIGHT half at the
// MOBILE viewport (390×844, the S33/S36 mobile class), navigated through the
// DRAWER (the only vehicle below 1024): the cross-axis cell the standing
// surface never probed — the S13 data-volume audit runs 1280×800 light+violet
// only (zero theme references), every mobile-viewport sweep runs at SEED
// volume, the S42/S43 volume × accent sweeps run 1280×800 only (the viewport
// axis is their blind spot), and the S44 dark-mobile volume sweep is DARK
// only (its mode precondition reads `mode !== "dark"` → fail — the mode
// axis is its blind spot). The per-view records carry the MOBILE structural
// family (drawerClosed/appBar/headingClearance — the S33/S35/S36 contracts
// at volume), the INTERACTION evidence (activeTint/activeLabel — read at the
// NEXT drawer open while the view is active, the S40 pendingView pattern:
// the light × mobile × volume cell: S37 proved light × accent at mobile at
// seed, S40 accent × drawer at seed light, S43 light × volume at desktop,
// S44 dark × volume at mobile), the LIGHT detector family (NO flashbulbs —
// the class exists only in dark, light surfaces are by-design on the light
// canvas; unreadable < 2.2 with the THREE signature-strict light exemptions
// — the CTA-face white-on-accent + the calendar adjacent-month slate-300 day
// numbers + the yellow priority-pill yellow-500: those surfaces are the
// reference's own design in LIGHT, the S43 doctrine; lowcontrast < 3.2 =
// WARN), AND the S13 volume measurement family (nodes/mainNodes/
// longTaskTotal ≤ 1500ms/clickLatencyMs ≤ 1500ms — the drawer-click →
// heading path). The volume counts are EXACT (300/200/250 — the S38
// omission-means-clean retirement applied to the volume axis from birth).
// The MOBILE vehicle contract is the INVERSE of the desktop seams: the
// sidebar (hidden lg:flex) must be HIDDEN at 390 and the hamburger VISIBLE,
// the drawer-own nav scroll is the only path to links ~14–20 at 844 height
// (scrollHeight 1068 vs clientHeight ≈ 700). The dark × mobile × volume cell
// is the S44 audit's own contract; the mid-band/landscape × volume cells and
// the RUM-beacon second cross-axis are the documented future cross-axis
// candidates (the S44 summary's named family, the S43
// one-half-per-session pattern).

const ACCENT_VOLUME_LIGHT_MOBILE_ALL_ACCENTS = new Set(["violet", "blue", "green", "orange", "pink", "red", "teal"]);
// The 7 volume-affected views by DISPLAY labels — the S13 data-volume
// audit's own view set (the views that render task/note/event rows; the
// other 13 are volume-invariant and stay covered by the S36/S37/S40 seed
// sweeps).
const ACCENT_VOLUME_LIGHT_MOBILE_ALL_VIEWS = ["Dashboard", "My Day", "Tasks", "Calendar", "Events", "Notes", "Analytics"];

function classifyAccentVolumeLightMobileSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string (the S27 rot-guard metadata)");
  if (!isObj(env.viewport) || env.viewport.width !== 390 || env.viewport.height !== 844) {
    return shapeError(
      "viewport must be the mobile portrait 390×844 (the S33/S36 mobile class) — the light × mobile × volume surface is this audit's contract (the desktop 1280×800 halves are the S42/S43 audits' own; the S44 audit owns the DARK half of this very cell — the MODE is the discriminator; the mid-band/landscape volume cells are future cross-axis candidates, documented in the session-45 plan's non-gaps)",
    );
  }
  if (
    !isObj(env.volume) ||
    typeof env.volume.tasks !== "number" ||
    typeof env.volume.notes !== "number" ||
    typeof env.volume.events !== "number"
  ) {
    return shapeError("volume must carry numeric tasks + notes + events (the S13 profile — the density the sweep measured)");
  }
  if (
    !isObj(env.chrome) ||
    typeof env.chrome.sidebarVisible !== "boolean" ||
    typeof env.chrome.hamburgerVisible !== "boolean" ||
    typeof env.chrome.drawerNavScrollable !== "boolean"
  ) {
    return shapeError("chrome must carry boolean sidebarVisible + hamburgerVisible + drawerNavScrollable (the MOBILE vehicle contract + the drawer-own scroll contract)");
  }
  if (!isObj(env.api) || !isObj(env.api["/api/tasks"]) || typeof env.api["/api/tasks"].bytes !== "number") {
    return shapeError("api must carry the /api/tasks record with a numeric bytes (the S13 B1 payload bound's own surface)");
  }
  if (!isObj(env.accents)) return shapeError("accents must be an object of per-accent records");
  if (!isArr(env.findings)) return shapeError("findings must be an Array");
  const accentKeys = Object.keys(env.accents);
  for (const a of ACCENT_VOLUME_LIGHT_MOBILE_ALL_ACCENTS) {
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
    for (const v of ACCENT_VOLUME_LIGHT_MOBILE_ALL_VIEWS) {
      if (!(v in rec.views)) {
        return shapeError(
          `accents.${a}.views must carry all 7 volume views — "${v}" is missing: a view that silently did not run must never read green-by-omission (the omission-means-clean recording is RETIRED)`,
        );
      }
    }
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) return shapeError(`accents.${a}.views.${v} must be a record`);
      if (typeof vr.heading !== "string" || vr.heading.length === 0) return shapeError(`accents.${a}.views.${v}.heading must be a non-empty string`);
      if (typeof vr.scrollWidth !== "number") return shapeError(`accents.${a}.views.${v}.scrollWidth must be a number`);
      if (typeof vr.drawerClosed !== "boolean") return shapeError(`accents.${a}.views.${v}.drawerClosed must be a boolean (the drawer closes on navigation — the mobile vehicle contract)`);
      if (typeof vr.appBar !== "boolean") return shapeError(`accents.${a}.views.${v}.appBar must be a boolean (the fixed glass app bar — brand + the 2-digit-hour clock)`);
      if (typeof vr.headingClearance !== "boolean") {
        return shapeError(`accents.${a}.views.${v}.headingClearance must be a boolean (the heading clears the fixed 64px bar — the S35 contract at volume)`);
      }
      if (!isArr(vr.unreadable)) return shapeError(`accents.${a}.views.${v}.unreadable must be an Array (the S43 light detector family — NO flashbulbs: the class exists only in dark)`);
      if (!isArr(vr.lowcontrast)) return shapeError(`accents.${a}.views.${v}.lowcontrast must be an Array (the S43 light detector family)`);
      if (!isArr(vr.consoleErrors)) return shapeError(`accents.${a}.views.${v}.consoleErrors must be an Array`);
      if (typeof vr.activeTint !== "string") return shapeError(`accents.${a}.views.${v}.activeTint must be a string (the active-link gradient reading — the interaction evidence is part of the record)`);
      if (typeof vr.activeLabel !== "string") return shapeError(`accents.${a}.views.${v}.activeLabel must be a string (the aria-current link when the tint was read)`);
      if (typeof vr.nodes !== "number") return shapeError(`accents.${a}.views.${v}.nodes must be a number (the S13 DOM census)`);
      if (typeof vr.mainNodes !== "number") return shapeError(`accents.${a}.views.${v}.mainNodes must be a number (the S13 DOM census)`);
      if (typeof vr.longTaskTotal !== "number") return shapeError(`accents.${a}.views.${v}.longTaskTotal must be a number (the S13 B3 main-thread budget's own measurement)`);
      if (typeof vr.clickLatencyMs !== "number") return shapeError(`accents.${a}.views.${v}.clickLatencyMs must be a number (the S13 B2 interactivity budget's own measurement)`);
    }
    if (
      !isObj(rec.drawer) ||
      typeof rec.drawer.linkCount !== "number" ||
      !isArr(rec.drawer.unreadable) ||
      !isArr(rec.drawer.lowcontrast)
    ) {
      return shapeError(`accents.${a}.drawer must carry linkCount + unreadable + lowcontrast Arrays (the drawer's own light rendering at volume — the mobile vehicle; NO flashbulbs: the class exists only in dark)`);
    }
  }
  // The mode rot guard (the S27 family), INVERTED from the S44 seam: the
  // light × mobile × volume surface is this audit's contract — the dark ×
  // mobile × volume family is the S44 audit's own (the mode is the
  // discriminator on this very 390×844 cell; the light family needs the
  // THREE light exemptions, not the dark family this seam carries).
  if (env.mode !== "light") {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (the S27 rot class; the light × mobile × volume surface is this audit's contract — the dark × mobile × volume family is the S44 audit's own)`,
    };
  }
  // The volume rot guard: the S13 profile is EXACT — a seed-volume
  // envelope measured the wrong density and must never read green.
  if (env.volume.tasks !== 300 || env.volume.notes !== 200 || env.volume.events !== 250) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `volume=${env.volume.tasks}/${env.volume.notes}/${env.volume.events} — the sweep measured the wrong density (the S13 profile is 300 tasks / 200 notes / 250 events; the S38 omission-means-clean retirement applied to the volume axis)`,
    };
  }
  // The MOBILE vehicle contract (the INVERSE of the S41/S42/S43 desktop
  // seams): the sidebar is hidden lg:flex — below 1024 the DRAWER is the
  // only vehicle, and the app bar's hamburger is its handle.
  if (env.chrome.sidebarVisible || !env.chrome.hamburgerVisible) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the MOBILE chrome contract broke at 390 — sidebarVisible=${env.chrome.sidebarVisible}, hamburgerVisible=${env.chrome.hamburgerVisible} (the lg contract: the sidebar renders only ≥1024; below that the drawer is the vehicle — the vehicle-contract finding class)`,
    };
  }
  if (!env.chrome.drawerNavScrollable) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the drawer-own scroll contract broke — drawerNavScrollable=false at 844 height under at least one accent (the nav geometry: the 20 reference-measured rows cannot fit the ~700px nav area, so a non-scrolling nav means the drawer geometry changed — links ~14–20 would be unreachable at mobile)`,
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
  // The drawer checks: an error string is a FINDING (never a swallow — the
  // S38 doctrine) and the link census is 20 (the navigation census).
  const drawerErrors: string[] = [];
  const linkCensus: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec)) continue;
    if (isObj(rec.drawer)) {
      if (typeof rec.drawer.error === "string" && rec.drawer.error.length > 0) drawerErrors.push(a);
      if (rec.drawer.linkCount !== 20) linkCensus.push(`${a}:${rec.drawer.linkCount}`);
    }
  }
  if (drawerErrors.length > 0) {
    return {
      green: false,
      findings: env.findings.length + drawerErrors.length,
      note: `${drawerErrors.length} drawer record(s) carry an error (${drawerErrors.join(", ")}) — a drawer whose detectors failed is a finding, never a swallow`,
    };
  }
  if (linkCensus.length > 0) {
    return {
      green: false,
      findings: env.findings.length + linkCensus.length,
      note: `${linkCensus.length} drawer link census break(s) (${linkCensus.join(", ")} — the drawer always carries all 20 links; a broken census means the navigation surface changed under volume)`,
    };
  }
  // The interaction checks — the S45 finding classes this audit OWNS in
  // LIGHT at MOBILE at volume (the light × mobile × volume cell): the tint
  // rot + the active-state mismatch.
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
  // The structural mobile family at volume: the drawer that did not close
  // on navigation, the missing app bar, the heading under the fixed bar.
  const stuckDrawers: string[] = [];
  const missingBars: string[] = [];
  const clearanceBreaches: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) continue;
      if (vr.drawerClosed === false) stuckDrawers.push(`${a}/${v}`);
      if (vr.appBar === false) missingBars.push(`${a}/${v}`);
      if (vr.headingClearance === false) clearanceBreaches.push(`${a}/${v}`);
    }
  }
  if (stuckDrawers.length > 0) {
    return {
      green: false,
      findings: env.findings.length + stuckDrawers.length,
      note: `${stuckDrawers.length} drawer navigation(s) did not close the drawer (${stuckDrawers.slice(0, 4).join(", ")}) — the S8/S16 drawer-closes-on-navigation contract broke at volume`,
    };
  }
  if (missingBars.length > 0) {
    return {
      green: false,
      findings: env.findings.length + missingBars.length,
      note: `${missingBars.length} view rendering(s) lost the fixed glass app bar (brand + 2-digit-hour clock) (${missingBars.slice(0, 4).join(", ")}) — the mobile chrome contract at volume`,
    };
  }
  if (clearanceBreaches.length > 0) {
    return {
      green: false,
      findings: env.findings.length + clearanceBreaches.length,
      note: `${clearanceBreaches.length} identity heading(s) sit under the fixed 64px app bar (${clearanceBreaches.slice(0, 4).join(", ")}) — the S35 heading-clearance contract broke at volume`,
    };
  }
  // The overflow check (the S16 mobile-only-gap class — a 300-row list must
  // never widen the 390px document).
  const overflows: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (isObj(vr) && typeof vr.scrollWidth === "number" && vr.scrollWidth > 390) overflows.push(`${a}/${v}:${vr.scrollWidth}`);
    }
  }
  if (overflows.length > 0) {
    return {
      green: false,
      findings: env.findings.length + overflows.length,
      note: `${overflows.length} view rendering(s) overflow the 390px canvas (${overflows.slice(0, 4).join(", ")}) — the S16 mobile-only overflow class`,
    };
  }
  // The S13 volume budgets — the B3 main-thread class + the B2
  // interactivity class (per view per accent; the boundary value 1500
  // stays green on both).
  const longTaskBudgets: string[] = [];
  const clickBudgets: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) continue;
      if (typeof vr.longTaskTotal === "number" && vr.longTaskTotal > 1500) longTaskBudgets.push(`${a}/${v}:${vr.longTaskTotal}ms`);
      if (typeof vr.clickLatencyMs === "number" && vr.clickLatencyMs > 1500) clickBudgets.push(`${a}/${v}:${vr.clickLatencyMs}ms`);
    }
  }
  if (longTaskBudgets.length > 0) {
    return {
      green: false,
      findings: env.findings.length + longTaskBudgets.length,
      note: `${longTaskBudgets.length} view rendering(s) exceed the 1500ms long-task budget under stress (${longTaskBudgets.slice(0, 4).join(", ")}) — the S13 B3 main-thread-blocking class (the volume contract broke under the theme variation at mobile)`,
    };
  }
  if (clickBudgets.length > 0) {
    return {
      green: false,
      findings: env.findings.length + clickBudgets.length,
      note: `${clickBudgets.length} drawer click(s) exceed the 1500ms interactivity budget under stress (${clickBudgets.slice(0, 4).join(", ")}) — the S13 B2 interactivity class (the navigation went unresponsive under volume at mobile)`,
    };
  }
  // The independent light-detection count (the anti-phantom doctrine), with
  // the LIGHT doctrine's THREE signature-strict exemptions (the S43 family):
  // the CTA-face (white on accent-500), the calendar adjacent-month day
  // numbers (slate-300, 1–2-digit text), and the yellow priority-pill
  // (yellow-500, high/medium/low). Those surfaces are the reference's own
  // design in LIGHT. There is NO flashbulb term — the class exists only in
  // dark; a light surface on the light canvas is by-design.
  let detections = 0;
  let ctaFace = 0;
  let calendar = 0;
  let pill = 0;
  let warns = 0;
  let renderings = 0;
  const countEntries = (arr: unknown) => {
    if (!isArr(arr)) return;
    for (const e of arr) {
      if (isObj(e)) {
        if (e.color === "rgb(255, 255, 255)") { ctaFace += 1; continue; }
        if (e.color === "rgb(203, 213, 225)" && /^\d{1,2}$/.test(String(e.text ?? "").trim())) { calendar += 1; continue; }
        if (e.color === "rgb(234, 179, 8)" && /^(high|medium|low)$/i.test(String(e.text ?? "").trim())) { pill += 1; continue; }
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
      note: `${detections} unreadable detection(s) across ${renderings} view renderings + 7 drawer records at volume (the S43 light contrast detector family at the mobile layout; counted independently of the findings array; the CTA-face + calendar-day + yellow-pill entries are exempt)`,
    };
  }
  // The S13 B1 payload bound: /api/tasks must stay bounded at 300 rows.
  if (env.api["/api/tasks"].bytes > 500_000) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the /api/tasks payload measured ${env.api["/api/tasks"].bytes} bytes at 300 rows — the S13 B1 unbounded-payload class (the list endpoints must stay bounded under stress)`,
    };
  }
  return {
    green: env.findings.length === 0,
    findings: env.findings.length,
    note: `7 accents swept × ${renderings} view renderings + ${renderings} active-tint readings + 7 drawer records at 390×844 in MODE light under the 300/200/250 volume profile, navigated through the drawer (the mobile vehicle); every accent self-verified applied; the volume budgets hold (long tasks ≤ 1500ms, clicks ≤ 1500ms, the /api/tasks payload ${env.api["/api/tasks"].bytes} bytes ≤ 500000); ${ctaFace} CTA-face + ${calendar} calendar-day + ${pill} yellow-pill exempt (the THREE signature-strict light exemptions — the reference's own design in light); ${warns} WARN (lowcontrast — the S11 non-gap family)`,
  };
}

// --- accent-volume-dark-midband-sweep (S46) ---------------------------------------
// The dark × mid-band × volume stress — the S13 volume profile (300 tasks /
// 200 notes / 250 events) swept through the theme space's dark half at the
// MID-BAND viewport (768×1024, the md breakpoint — the S34/S39 mid-band
// class, the switchiest width in the 391–1023px band), navigated through
// the DRAWER (the only vehicle below 1024): the cross-axis cell the
// standing surface never probed — the S13 data-volume audit runs 1280×800
// light+violet only (zero theme references), the S34/S39 mid-band sweeps
// run LIGHT at SEED volume (the mode + volume axes are their blind spots),
// the S42/S43 volume × accent sweeps run 1280×800 only, the S44/S45 mobile
// volume sweeps run 390×844 only, and NO dark sweep runs at 768 at all
// (dark-sweep/accent-dark-sweep/dark-mobile-sweep grep-verified at other
// widths). The per-view records carry the below-lg structural family
// (drawerClosed/appBar/headingClearance — the S33/S35/S36 contracts: the
// fixed glass app bar + the pt-20 offset are IDENTICAL at 768), the
// INTERACTION evidence (activeTint/activeLabel — read at the NEXT drawer
// open while the view is active, the S40 pendingView pattern: the dark ×
// mid-band × volume cell: S34 proved mid-band light+violet at seed, S39
// accent × mid-band at seed light, S42 dark × volume at desktop, S44 dark
// × volume at mobile), the DARK detector family (flashbulbs — ALWAYS
// findings, a light surface on the dark canvas; unreadable < 2.2 with the
// CTA-face exemption ONLY — the calendar-day and yellow-pill light
// exemptions do NOT apply in dark, those surfaces re-theme; lowcontrast
// < 3.2 = WARN), AND the S13 volume measurement family
// (nodes/mainNodes/longTaskTotal ≤ 1500ms/clickLatencyMs ≤ 1500ms — the
// drawer-click → heading path). The volume counts are EXACT (300/200/250 —
// the S38 omission-means-clean retirement applied to the volume axis from
// birth). The MID-BAND vehicle contract (the below-lg family, the S34/S39
// doctrine at volume): the sidebar (hidden lg:flex) must be HIDDEN at 768
// and the hamburger VISIBLE; the drawer-own nav scroll carries to the
// mid-band geometry — the nav scrollHeight ~1068 (the 20 reference-measured
// rows) vs the ~934px nav area at 1024 height (the 1024 viewport minus the
// ~90px brand header), so links ~17–20 sit below the fold and the nav's
// scroll is the only path to them. The light × mid-band × volume cell is
// the documented future cross-axis candidate (the S47 mirror); the
// landscape × volume cells and the RUM-beacon second cross-axis remain the
// S45 summary's named family.

const ACCENT_VOLUME_DARK_MIDBAND_ALL_ACCENTS = new Set(["violet", "blue", "green", "orange", "pink", "red", "teal"]);
// The 7 volume-affected views by DISPLAY labels — the S13 data-volume
// audit's own view set (the views that render task/note/event rows; the
// other 13 are volume-invariant and stay covered by the S34/S39 seed
// sweeps).
const ACCENT_VOLUME_DARK_MIDBAND_ALL_VIEWS = ["Dashboard", "My Day", "Tasks", "Calendar", "Events", "Notes", "Analytics"];

function classifyAccentVolumeDarkMidbandSweep(env: unknown): StageVerdict {
  if (!isObj(env)) return shapeError("envelope must be an object");
  if (typeof env.mode !== "string") return shapeError("mode must be a string (the S27 rot-guard metadata)");
  if (!isObj(env.viewport) || env.viewport.width !== 768 || env.viewport.height !== 1024) {
    return shapeError(
      "viewport must be the mid-band 768×1024 (the md breakpoint, the S34/S39 mid-band class) — the dark × mid-band × volume surface is this audit's contract (the 1280×800 desktop halves are the S42/S43 audits' own; the 390×844 mobile halves are the S44/S45 audits' own; the landscape × volume cells are future cross-axis candidates, documented in the session-45 plan's non-gaps)",
    );
  }
  if (
    !isObj(env.volume) ||
    typeof env.volume.tasks !== "number" ||
    typeof env.volume.notes !== "number" ||
    typeof env.volume.events !== "number"
  ) {
    return shapeError("volume must carry numeric tasks + notes + events (the S13 profile — the density the sweep measured)");
  }
  if (
    !isObj(env.chrome) ||
    typeof env.chrome.sidebarVisible !== "boolean" ||
    typeof env.chrome.hamburgerVisible !== "boolean" ||
    typeof env.chrome.drawerNavScrollable !== "boolean"
  ) {
    return shapeError("chrome must carry boolean sidebarVisible + hamburgerVisible + drawerNavScrollable (the MID-BAND vehicle contract + the drawer-own scroll contract)");
  }
  if (!isObj(env.api) || !isObj(env.api["/api/tasks"]) || typeof env.api["/api/tasks"].bytes !== "number") {
    return shapeError("api must carry the /api/tasks record with a numeric bytes (the S13 B1 payload bound's own surface)");
  }
  if (!isObj(env.accents)) return shapeError("accents must be an object of per-accent records");
  if (!isArr(env.findings)) return shapeError("findings must be an Array");
  const accentKeys = Object.keys(env.accents);
  for (const a of ACCENT_VOLUME_DARK_MIDBAND_ALL_ACCENTS) {
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
    for (const v of ACCENT_VOLUME_DARK_MIDBAND_ALL_VIEWS) {
      if (!(v in rec.views)) {
        return shapeError(
          `accents.${a}.views must carry all 7 volume views — "${v}" is missing: a view that silently did not run must never read green-by-omission (the omission-means-clean recording is RETIRED)`,
        );
      }
    }
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) return shapeError(`accents.${a}.views.${v} must be a record`);
      if (typeof vr.heading !== "string" || vr.heading.length === 0) return shapeError(`accents.${a}.views.${v}.heading must be a non-empty string`);
      if (typeof vr.scrollWidth !== "number") return shapeError(`accents.${a}.views.${v}.scrollWidth must be a number`);
      if (typeof vr.drawerClosed !== "boolean") return shapeError(`accents.${a}.views.${v}.drawerClosed must be a boolean (the drawer closes on navigation — the mid-band vehicle contract)`);
      if (typeof vr.appBar !== "boolean") return shapeError(`accents.${a}.views.${v}.appBar must be a boolean (the fixed glass app bar — brand + the 2-digit-hour clock, lg:hidden at 768)`);
      if (typeof vr.headingClearance !== "boolean") {
        return shapeError(`accents.${a}.views.${v}.headingClearance must be a boolean (the heading clears the fixed 64px bar — the S35 contract at volume, the below-lg chrome is identical at 768)`);
      }
      if (!isArr(vr.flashbulbs)) return shapeError(`accents.${a}.views.${v}.flashbulbs must be an Array (the S38/S42/S44 dark detector family)`);
      if (!isArr(vr.unreadable)) return shapeError(`accents.${a}.views.${v}.unreadable must be an Array (the S38/S42/S44 dark detector family)`);
      if (!isArr(vr.lowcontrast)) return shapeError(`accents.${a}.views.${v}.lowcontrast must be an Array (the S38/S42/S44 dark detector family)`);
      if (!isArr(vr.consoleErrors)) return shapeError(`accents.${a}.views.${v}.consoleErrors must be an Array`);
      if (typeof vr.activeTint !== "string") return shapeError(`accents.${a}.views.${v}.activeTint must be a string (the active-link gradient reading — the interaction evidence is part of the record)`);
      if (typeof vr.activeLabel !== "string") return shapeError(`accents.${a}.views.${v}.activeLabel must be a string (the aria-current link when the tint was read)`);
      if (typeof vr.nodes !== "number") return shapeError(`accents.${a}.views.${v}.nodes must be a number (the S13 DOM census)`);
      if (typeof vr.mainNodes !== "number") return shapeError(`accents.${a}.views.${v}.mainNodes must be a number (the S13 DOM census)`);
      if (typeof vr.longTaskTotal !== "number") return shapeError(`accents.${a}.views.${v}.longTaskTotal must be a number (the S13 B3 main-thread budget's own measurement)`);
      if (typeof vr.clickLatencyMs !== "number") return shapeError(`accents.${a}.views.${v}.clickLatencyMs must be a number (the S13 B2 interactivity budget's own measurement)`);
    }
    if (
      !isObj(rec.drawer) ||
      typeof rec.drawer.linkCount !== "number" ||
      !isArr(rec.drawer.flashbulbs) ||
      !isArr(rec.drawer.unreadable) ||
      !isArr(rec.drawer.lowcontrast)
    ) {
      return shapeError(`accents.${a}.drawer must carry linkCount + flashbulbs + unreadable + lowcontrast Arrays (the drawer's own dark rendering at volume — the mid-band vehicle)`);
    }
  }
  // The mode rot guard (the S27 family): the dark × mid-band × volume
  // surface is this audit's contract — the light × mid-band × volume family
  // is the documented future cross-axis candidate (the S47 mirror; the
  // light family needs the THREE light exemptions, not the dark family
  // this seam carries).
  if (env.mode !== "dark") {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (the S27 rot class; the dark × mid-band × volume surface is this audit's contract — the light × mid-band × volume family is the documented future cross-axis candidate)`,
    };
  }
  // The volume rot guard: the S13 profile is EXACT — a seed-volume
  // envelope measured the wrong density and must never read green.
  if (env.volume.tasks !== 300 || env.volume.notes !== 200 || env.volume.events !== 250) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `volume=${env.volume.tasks}/${env.volume.notes}/${env.volume.events} — the sweep measured the wrong density (the S13 profile is 300 tasks / 200 notes / 250 events; the S38 omission-means-clean retirement applied to the volume axis)`,
    };
  }
  // The MID-BAND vehicle contract (the below-lg family, the S34/S39
  // doctrine at volume): the sidebar is hidden lg:flex — below 1024 the
  // DRAWER is the only vehicle, and the app bar's hamburger is its handle.
  if (env.chrome.sidebarVisible || !env.chrome.hamburgerVisible) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the MID-BAND chrome contract broke at 768 — sidebarVisible=${env.chrome.sidebarVisible}, hamburgerVisible=${env.chrome.hamburgerVisible} (the lg contract: the sidebar renders only ≥1024; below that the drawer is the vehicle — the vehicle-contract finding class)`,
    };
  }
  if (!env.chrome.drawerNavScrollable) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the drawer-own scroll contract broke — drawerNavScrollable=false at 1024 height under at least one accent (the nav geometry: the 20 reference-measured rows measure scrollHeight ~1068 vs the ~934px nav area at the mid-band viewport, so a non-scrolling nav means the drawer geometry changed — links ~17–20 would be unreachable at the mid-band)`,
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
  // The drawer checks: an error string is a FINDING (never a swallow — the
  // S38 doctrine) and the link census is 20 (the navigation census).
  const drawerErrors: string[] = [];
  const linkCensus: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec)) continue;
    if (isObj(rec.drawer)) {
      if (typeof rec.drawer.error === "string" && rec.drawer.error.length > 0) drawerErrors.push(a);
      if (rec.drawer.linkCount !== 20) linkCensus.push(`${a}:${rec.drawer.linkCount}`);
    }
  }
  if (drawerErrors.length > 0) {
    return {
      green: false,
      findings: env.findings.length + drawerErrors.length,
      note: `${drawerErrors.length} drawer record(s) carry an error (${drawerErrors.join(", ")}) — a drawer whose detectors failed is a finding, never a swallow`,
    };
  }
  if (linkCensus.length > 0) {
    return {
      green: false,
      findings: env.findings.length + linkCensus.length,
      note: `${linkCensus.length} drawer link census break(s) (${linkCensus.join(", ")} — the drawer always carries all 20 links; a broken census means the navigation surface changed under volume)`,
    };
  }
  // The interaction checks — the S46 finding classes this audit OWNS in
  // DARK at MID-BAND at volume (the dark × mid-band × volume cell): the
  // tint rot + the active-state mismatch.
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
  // The structural below-lg family at volume: the drawer that did not close
  // on navigation, the missing app bar, the heading under the fixed bar.
  const stuckDrawers: string[] = [];
  const missingBars: string[] = [];
  const clearanceBreaches: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) continue;
      if (vr.drawerClosed === false) stuckDrawers.push(`${a}/${v}`);
      if (vr.appBar === false) missingBars.push(`${a}/${v}`);
      if (vr.headingClearance === false) clearanceBreaches.push(`${a}/${v}`);
    }
  }
  if (stuckDrawers.length > 0) {
    return {
      green: false,
      findings: env.findings.length + stuckDrawers.length,
      note: `${stuckDrawers.length} drawer navigation(s) did not close the drawer (${stuckDrawers.slice(0, 4).join(", ")}) — the S8/S16 drawer-closes-on-navigation contract broke at volume`,
    };
  }
  if (missingBars.length > 0) {
    return {
      green: false,
      findings: env.findings.length + missingBars.length,
      note: `${missingBars.length} view rendering(s) lost the fixed glass app bar (brand + 2-digit-hour clock) (${missingBars.slice(0, 4).join(", ")}) — the below-lg chrome contract at volume (the bar is lg:hidden, identical at 768)`,
    };
  }
  if (clearanceBreaches.length > 0) {
    return {
      green: false,
      findings: env.findings.length + clearanceBreaches.length,
      note: `${clearanceBreaches.length} identity heading(s) sit under the fixed 64px app bar (${clearanceBreaches.slice(0, 4).join(", ")}) — the S35 heading-clearance contract broke at volume`,
    };
  }
  // The overflow check (the S16 mobile-only-gap class at the mid-band width
  // — a 300-row list must never widen the 768px document).
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
      note: `${overflows.length} view rendering(s) overflow the 768px canvas (${overflows.slice(0, 4).join(", ")}) — the S16 overflow class at the mid-band width`,
    };
  }
  // The S13 volume budgets — the B3 main-thread class + the B2
  // interactivity class (per view per accent; the boundary value 1500
  // stays green on both).
  const longTaskBudgets: string[] = [];
  const clickBudgets: string[] = [];
  for (const a of accentKeys) {
    const rec = env.accents[a];
    if (!isObj(rec) || !isObj(rec.views)) continue;
    for (const v of Object.keys(rec.views)) {
      const vr = rec.views[v];
      if (!isObj(vr)) continue;
      if (typeof vr.longTaskTotal === "number" && vr.longTaskTotal > 1500) longTaskBudgets.push(`${a}/${v}:${vr.longTaskTotal}ms`);
      if (typeof vr.clickLatencyMs === "number" && vr.clickLatencyMs > 1500) clickBudgets.push(`${a}/${v}:${vr.clickLatencyMs}ms`);
    }
  }
  if (longTaskBudgets.length > 0) {
    return {
      green: false,
      findings: env.findings.length + longTaskBudgets.length,
      note: `${longTaskBudgets.length} view rendering(s) exceed the 1500ms long-task budget under stress (${longTaskBudgets.slice(0, 4).join(", ")}) — the S13 B3 main-thread-blocking class (the volume contract broke under the theme variation at the mid-band viewport)`,
    };
  }
  if (clickBudgets.length > 0) {
    return {
      green: false,
      findings: env.findings.length + clickBudgets.length,
      note: `${clickBudgets.length} drawer click(s) exceed the 1500ms interactivity budget under stress (${clickBudgets.slice(0, 4).join(", ")}) — the S13 B2 interactivity class (the navigation went unresponsive under volume at the mid-band)`,
    };
  }
  // The independent dark-detection count (the anti-phantom doctrine), with
  // the DARK doctrine's single exemption: the CTA-face (white on
  // accent-500 — the S11 family-2 non-gap). The LIGHT-mode exemptions (the
  // calendar adjacent-day slate-300 + the yellow priority-pill yellow-500)
  // do NOT apply — in dark those surfaces re-theme, so any unreadable hit
  // is genuine. Flashbulbs are ALWAYS findings.
  let detections = 0;
  let flashbulbs = 0;
  let ctaFace = 0;
  let warns = 0;
  let renderings = 0;
  const countEntries = (arr: unknown) => {
    if (!isArr(arr)) return;
    for (const e of arr) {
      if (isObj(e) && e.color === "rgb(255, 255, 255)") {
        ctaFace += 1;
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
        if (isArr(vr.flashbulbs)) flashbulbs += vr.flashbulbs.length;
        countEntries(vr.unreadable);
        if (isArr(vr.lowcontrast)) warns += vr.lowcontrast.length;
      }
    }
    if (isObj(rec.drawer)) {
      if (isArr(rec.drawer.flashbulbs)) flashbulbs += rec.drawer.flashbulbs.length;
      countEntries(rec.drawer.unreadable);
      if (isArr(rec.drawer.lowcontrast)) warns += rec.drawer.lowcontrast.length;
    }
  }
  if (flashbulbs > 0) {
    return {
      green: false,
      findings: env.findings.length + flashbulbs,
      note: `${flashbulbs} flashbulb detection(s) across ${renderings} view renderings + 7 drawer records (a light surface on the dark canvas — ALWAYS a finding in dark mode, the S38 doctrine at the mid-band layout under volume)`,
    };
  }
  if (detections > 0) {
    return {
      green: false,
      findings: env.findings.length + detections,
      note: `${detections} unreadable detection(s) across ${renderings} view renderings + 7 drawer records at volume (the S38/S42 dark contrast detector family at the mid-band layout; counted independently of the findings array; the CTA-face entries are exempt)`,
    };
  }
  // The S13 B1 payload bound: /api/tasks must stay bounded at 300 rows.
  if (env.api["/api/tasks"].bytes > 500_000) {
    return {
      green: false,
      findings: env.findings.length + 1,
      note: `the /api/tasks payload measured ${env.api["/api/tasks"].bytes} bytes at 300 rows — the S13 B1 unbounded-payload class (the list endpoints must stay bounded under stress)`,
    };
  }
  return {
    green: env.findings.length === 0,
    findings: env.findings.length,
    note: `7 accents swept × ${renderings} view renderings + ${renderings} active-tint readings + 7 drawer records at 768×1024 in MODE dark under the 300/200/250 volume profile, navigated through the drawer (the mid-band vehicle); every accent self-verified applied; the volume budgets hold (long tasks ≤ 1500ms, clicks ≤ 1500ms, the /api/tasks payload ${env.api["/api/tasks"].bytes} bytes ≤ 500000); ${ctaFace} CTA-face exempt (white on accent-500 — the S11 family-2 non-gap); ${warns} WARN (lowcontrast — the S11 non-gap family)`,
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
  if (name === "accent-desktop-sweep") return classifyAccentDesktopSweep(envelope);
  if (name === "accent-volume-sweep") return classifyAccentVolumeSweep(envelope);
  if (name === "accent-volume-light-sweep") return classifyAccentVolumeLightSweep(envelope);
  if (name === "accent-volume-dark-mobile-sweep") return classifyAccentVolumeDarkMobileSweep(envelope);
  if (name === "accent-volume-light-mobile-sweep") return classifyAccentVolumeLightMobileSweep(envelope);
  if (name === "accent-volume-dark-midband-sweep") return classifyAccentVolumeDarkMidbandSweep(envelope);
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

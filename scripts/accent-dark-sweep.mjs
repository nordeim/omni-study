// Accent × dark-mode consistency sweep (session-11 audit).
// For EVERY accent (7), sets dark + accent via the settings API (the real
// application path: loadFromUser → applyToDocument), then walks all 20 views
// at desktop 1280×800 AND a mobile 390×844 pass (mobile-only surfaces the
// session-10 desktop sweep never rendered: timetable accordion, drawer,
// settings Avatar tab), flagging:
//  - "flashbulb" surfaces: opaque light backgrounds (luminance > 0.80) ≥40×20
//  - unreadable text: contrast < 2.2 (the S10 FAIL bar)
//  - low-contrast text: 2.2 ≤ contrast < 3.2 (WARN — the accent-600-on-dark
//    family lands here; the codebase's own dark convention is strongDark)
// Restores light + violet at the end (dev user resting state).
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const VIEWS = [
  "Dashboard", "MyDay", "Tasks", "Calendar", "Events", "Timetable",
  "Assignments", "Exams", "Notes", "Flashcards", "PracticeTests",
  "StudyGroups", "GradeTracker", "Analytics", "Files", "Calculator",
  "MathSolver", "AIAssistant", "FocusTimer", "Settings",
];
const ACCENTS = ["violet", "blue", "green", "orange", "pink", "red", "teal"];
// Mobile pass surfaces: timetable accordion + settings avatar tab + drawer.
const MOBILE_VIEWS = ["Dashboard", "MyDay", "Timetable", "Tasks", "Settings", "Calendar"];

const CHECKER = `(() => {
  const lum = (r, g, b) => {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const contrast = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  const parse = (c) => {
    if (!c) return null;
    let m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const parts = m[1].split(',').map(s => parseFloat(s));
    if (parts.length < 3 || parts.some(p => isNaN(p))) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  };
  const effectiveBg = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const cs = getComputedStyle(node);
      const bg = parse(cs.backgroundColor);
      if (bg && bg.a > 0.85) return bg;
      node = node.parentElement;
    }
    const bodyBg = parse(getComputedStyle(document.body).backgroundColor);
    return bodyBg || { r: 9, g: 9, b: 11, a: 1 };
  };
  const flashbulbs = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('main *, aside *, header *, [role=dialog] *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const bg = parse(cs.backgroundColor);
    if (!bg || bg.a <= 0.9) continue;
    const L = lum(bg.r, bg.g, bg.b);
    if (L <= 0.80) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 20) continue;
    const cls = (el.className && el.className.toString) ? el.className.toString() : '';
    if (/sf-gradient|UserAvatar|avatar/.test(cls)) continue;
    const key = cls.slice(0, 60) + '|' + Math.round(rect.width) + 'x' + Math.round(rect.height);
    if (seen.has(key)) continue;
    seen.add(key);
    flashbulbs.push({ cls: cls.slice(0, 70), bg: cs.backgroundColor, tag: el.tagName, w: Math.round(rect.width), h: Math.round(rect.height), text: (el.textContent || '').trim().slice(0, 30) });
    if (flashbulbs.length >= 12) break;
  }
  const unreadable = [];
  const lowcontrast = [];
  for (const el of document.querySelectorAll('main *, aside *, header *, [role=dialog] *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none') continue;
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!hasText) continue;
    const fg = parse(cs.color);
    if (!fg) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) continue;
    const bg = effectiveBg(el);
    const c = contrast(lum(fg.r, fg.g, fg.b), lum(bg.r, bg.g, bg.b));
    const cls = (el.className && el.className.toString) ? el.className.toString() : '';
    const entry = { text: (el.textContent || '').trim().slice(0, 26), color: cs.color, bgEff: 'rgb(' + bg.r + ',' + bg.g + ',' + bg.b + ')', contrast: +c.toFixed(2), cls: cls.slice(0, 66) };
    if (c < 2.2) { unreadable.push(entry); if (unreadable.length >= 10) continue; }
    else if (c < 3.2) { lowcontrast.push(entry); if (lowcontrast.length >= 14) continue; }
  }
  return JSON.stringify({ flashbulbs, unreadable, lowcontrast });
})()`;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
await page.goto(`${BASE}/login`);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.click("button[type=submit]");
await page.waitForURL(`${BASE}/Dashboard`, { timeout: 20000 });

const out = { desktop: {}, mobile: {} };
for (const accent of ACCENTS) {
  await page.request.patch(`${BASE}/api/settings/preferences`, { data: { themeMode: "dark", accentColor: accent } });
  await page.goto(`${BASE}/Dashboard`);
  await page.waitForFunction(() => document.documentElement.classList.contains("dark") && document.documentElement.dataset.accent !== "", undefined, { timeout: 8000 });
  const applied = await page.evaluate(() => document.documentElement.dataset.accent);

  // Desktop pass
  out.desktop[accent] = {};
  for (const v of VIEWS) {
    await page.goto(`${BASE}/${v}`);
    await page.waitForTimeout(1400);
    const r = await page.evaluate(CHECKER);
    const parsed = JSON.parse(r);
    if (parsed.flashbulbs.length || parsed.unreadable.length || parsed.lowcontrast.length) {
      out.desktop[accent][v] = parsed;
    }
  }

  // Mobile pass (same browser CONTEXT so the sf_session cookie rides along)
  out.mobile[accent] = {};
  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(`${BASE}/Dashboard`);
  await mobile.waitForTimeout(1200);
  for (const v of MOBILE_VIEWS) {
    await mobile.goto(`${BASE}/${v}`);
    await mobile.waitForTimeout(1400);
    if (v === "Settings") {
      // open the Avatar tab (the emoji grid — selected swatch is accent-tinted)
      try { await mobile.getByRole("tab", { name: /avatar/i }).click(); await mobile.waitForTimeout(600); } catch {}
    }
    const r = await mobile.evaluate(CHECKER);
    const parsed = JSON.parse(r);
    if (parsed.flashbulbs.length || parsed.unreadable.length || parsed.lowcontrast.length) {
      out.mobile[accent][v] = parsed;
    }
  }
  // Drawer open state (guarded — one accent's flake must not kill the sweep)
  try {
    await mobile.goto(`${BASE}/Dashboard`);
    await mobile.waitForTimeout(900);
    await mobile.getByRole("button", { name: "Open navigation menu" }).click();
    await mobile.waitForTimeout(700);
    const dr = await mobile.evaluate(CHECKER);
    const dparsed = JSON.parse(dr);
    if (dparsed.flashbulbs.length || dparsed.unreadable.length || dparsed.lowcontrast.length) {
      out.mobile[accent]["(drawer)"] = dparsed;
    }
  } catch (e) {
    out.mobile[accent]["(drawer)"] = { error: String(e).slice(0, 120) };
  }
  await mobile.close();
  console.error(`accent ${accent} (${applied}) done`);
  // incremental flush — a later crash must not lose earlier accents
  const { writeFileSync } = await import("node:fs");
  writeFileSync("/tmp/accent-sweep-partial.json", JSON.stringify(out, null, 1));
}

// Restore the dev user resting state (light + violet).
await page.request.patch(`${BASE}/api/settings/preferences`, { data: { themeMode: "light", accentColor: "violet" } });
await page.goto(`${BASE}/Dashboard`);
await page.waitForTimeout(800);
await browser.close();
console.log(JSON.stringify(out, null, 1));

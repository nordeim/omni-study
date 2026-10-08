// Dark-mode consistency sweep for the clone (session-10 audit).
// Logs in, enables dark mode, visits all 20 views, and flags:
//  - "flashbulb" surfaces: opaque light backgrounds (luminance > 0.80) at least 40x40px on the dark canvas
//  - unreadable text: contrast(text, effective bg) < 2.2
// Effective background = walk up ancestors until an opaque bg is found.
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const VIEWS = [
  "Dashboard", "MyDay", "Tasks", "Calendar", "Events", "Timetable",
  "Assignments", "Exams", "Notes", "Flashcards", "PracticeTests",
  "StudyGroups", "GradeTracker", "Analytics", "Files", "Calculator",
  "MathSolver", "AIAssistant", "FocusTimer", "Settings",
];

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
      const img = cs.backgroundImage;
      if (img && img !== 'none' && img.includes('rgb(') && !img.includes('var(')) {
        const first = parse(img);
        if (first && first.a > 0.85) return first;
      }
      node = node.parentElement;
    }
    const bodyBg = parse(getComputedStyle(document.body).backgroundColor);
    return bodyBg || { r: 9, g: 9, b: 11, a: 1 };
  };
  const flashbulbs = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('main *, aside *, header *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const bg = parse(cs.backgroundColor);
    if (!bg || bg.a <= 0.9) continue;
    const L = lum(bg.r, bg.g, bg.b);
    if (L <= 0.80) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 20) continue;
    // skip the brand avatar + gradient CTAs (intentional vivid accents)
    const cls = (el.className && el.className.toString) ? el.className.toString() : '';
    if (/sf-gradient|UserAvatar|avatar/.test(cls)) continue;
    const key = cls.slice(0, 60) + '|' + Math.round(rect.width) + 'x' + Math.round(rect.height);
    if (seen.has(key)) continue;
    seen.add(key);
    flashbulbs.push({ cls: cls.slice(0, 70), bg: cs.backgroundColor, tag: el.tagName, w: Math.round(rect.width), h: Math.round(rect.height), text: (el.textContent || '').trim().slice(0, 30) });
    if (flashbulbs.length >= 12) break;
  }
  const unreadable = [];
  for (const el of document.querySelectorAll('main *, aside *')) {
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
    if (c < 2.2) {
      const cls = (el.className && el.className.toString) ? el.className.toString() : '';
      unreadable.push({ text: (el.textContent || '').trim().slice(0, 26), color: cs.color, bgEff: 'rgb(' + bg.r + ',' + bg.g + ',' + bg.b + ')', contrast: +c.toFixed(2), cls: cls.slice(0, 60) });
      if (unreadable.length >= 12) break;
    }
  }
  return JSON.stringify({ flashbulbs, unreadable });
})()`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(`${BASE}/login`);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.click("button[type=submit]");
await page.waitForURL(`${BASE}/Dashboard`, { timeout: 20000 });
// ensure dark mode
await page.evaluate(() => { document.documentElement.classList.add("dark"); localStorage.setItem("sf-theme-mode", "dark"); });
await page.goto(`${BASE}/Dashboard`);
await page.waitForTimeout(1500);
const mode = await page.evaluate(() => document.documentElement.className);
console.log("MODE:", mode);

const out = {};
for (const v of VIEWS) {
  await page.goto(`${BASE}/${v}`);
  await page.waitForTimeout(1800);
  const r = await page.evaluate(CHECKER);
  out[v] = JSON.parse(r);
}
await browser.close();
console.log(JSON.stringify(out, null, 1));

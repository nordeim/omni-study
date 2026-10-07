// Regenerate the docs/screenshots catalog from the DEV server (:3000).
// Session-3 refresh: login + all 20 desktop views (1440×900) + 3 mobile
// captures (390×844: dashboard, navigation drawer open, tasks).
// Usage: node scripts/capture-studyflow.mjs   (dev server must be running)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = new URL("../docs/screenshots/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const DEMO_EMAIL = "demo@studyflow.app";
const DEMO_PASSWORD = "Demo1234!";

const browser = await chromium.launch();

// Sign in once via the login page (page-based keeps the flow honest and
// avoids API-context quirks under bun); reuse the session cookie after.
const loginCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const lp = await loginCtx.newPage();
await lp.goto(BASE + "/login", { waitUntil: "networkidle" });
await lp.fill('input[id="email"]', DEMO_EMAIL);
await lp.fill('input[id="password"]', DEMO_PASSWORD);
await lp.click('button[type="submit"]');
await lp.waitForURL(/\/Dashboard/, { timeout: 20_000 });
const cookies = await loginCtx.cookies(BASE);
const session = cookies.find((c) => c.name === "sf_session");
if (!session) throw new Error("no sf_session cookie after login");
console.log("login: ok");
await loginCtx.close();

const VIEWS = [
  "Dashboard", "MyDay", "Tasks", "Calendar", "Events", "Timetable",
  "Assignments", "Exams", "Notes", "Flashcards", "PracticeTests",
  "StudyGroups", "GradeTracker", "Analytics", "Files", "Calculator",
  "MathSolver", "AIAssistant", "FocusTimer", "Settings",
];

async function shot(name, ctxOptions, path, run) {
  const ctx = await browser.newContext({ deviceScaleFactor: 1, ...ctxOptions });
  await ctx.addCookies([{ name: "sf_session", value: session.value, url: BASE }]);
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  if (run) await run(page);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("captured", name);
  await ctx.close();
}

const desktop = { viewport: { width: 1440, height: 900 } };
const mobile = { viewport: { width: 390, height: 844 } };
const mobileTouch = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };

// 01 — the login card (logged-out context).
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/01-login.png` });
  console.log("captured 01-login");
  await ctx.close();
}

// 02–21 — every desktop view.
for (const view of VIEWS) {
  await shot(`desktop-${view}`, desktop, `/${view}`);
}

// 22–24 — mobile chrome: dashboard (fixed glass bar + content at 80px),
// the navigation drawer open (288px panel), and the Tasks view.
await shot("mobile-dashboard", mobile, "/Dashboard");
await shot("mobile-navigation-drawer", mobileTouch, "/Dashboard", async (page) => {
  await page.getByRole("button", { name: "Open navigation menu" }).tap();
  await page.waitForTimeout(700);
});
await shot("mobile-tasks", mobile, "/Tasks");

await browser.close();
console.log("done — " + (VIEWS.length + 4) + " captures in " + OUT);

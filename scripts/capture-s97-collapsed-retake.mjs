// S97 collapsed-capture re-take — the S95 remedy for the dev-tools badge
// transient: a fresh reload + idle settle before the shot, so the badge
// reads its idle form (the s96 epoch's collapsed capture carried dark=786
// in the badge region; the first S97 pass caught a transient at 1166).
import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLONE = "http://localhost:3000";
const OUT = join(REPO, "docs", "screenshots");

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto(`${CLONE}/login`);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.click("button[type=submit]");
await page.waitForFunction(() => location.pathname === "/Dashboard", null, { timeout: 30000 });
await page.waitForTimeout(1500);
await page.waitForSelector(".sf-toast-in", { state: "detached", timeout: 12000 }).catch(() => {});
// Fresh reload so the badge re-mounts, then a generous idle settle.
await page.reload();
await page.waitForTimeout(3500);
// Collapse via POINTER click (the S96 epoch form — a keyboard collapse
// leaves a :focus-visible violet ring on the rail's expand control, which
// the epoch sets do not carry).
await page.getByRole("button", { name: "Collapse sidebar" }).click();
await page.waitForTimeout(1200);
const watchY = await page.evaluate(() => {
  const h = [...document.querySelectorAll("h2,h3")].find((e) => e.textContent.trim() === "Upcoming Assignments");
  return h ? Math.round(h.getBoundingClientRect().y) : null;
});
await page.mouse.move(1279, 0);
await page.waitForTimeout(400);
await page.screenshot({ path: join(OUT, "s97-clone-desktop-collapsed-1280.png") });
console.log(JSON.stringify({ watchY, badgeProbe: await page.evaluate(() => {
  const el = document.elementFromPoint(55, 760);
  return el ? el.tagName : null;
}) }));
await ctx.close();
await browser.close();

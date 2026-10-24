// S96 evidence captures — the S85 contract (7 shots at exact dimensions,
// wholly inside the session's UTC day). The capture-form contract: the four
// non-Notes clone shots at /Dashboard (the walkthrough's greeting view), the
// Notes shot at /Notes (the S85 deviation-recovery doctrine).
//
// Shots: clone desktop-expanded (watch-item 860 expected), clone
// desktop-collapsed (watch-item 788 — the two-state doctrine), clone
// mobile-drawer-labeled (pref "0" + reload; fresh-open focus state; navSH
// 992 verified at shot time), clone mobile-drawer-icononly (pref "1" +
// reload; navSH 912, zero labels, 44px links), clone mobile-Notes (pref
// restored "0" first), reference desktop-expanded (aside 260), reference
// mobile-drawer-labeled (the settled form 992/48/48/scrollTop 0 verified at
// shot time).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const REF = "https://omni-study1.base44.app";
const CLONE = "http://localhost:3000";
const OUT = join(REPO, "docs", "screenshots");
mkdirSync(OUT, { recursive: true });

const vis = `(el) => { const r = el.getBoundingClientRect(); const c = getComputedStyle(el); return r.width > 0 && c.display !== 'none' && c.visibility !== 'hidden'; }`;

// The S96 capture-form lessons (both artifacts attributed live, both fixed
// here so the epoch sets stay form-identical with S95):
// 1. MOUSE REST: the last click's coordinates linger on the next page —
//    a login-button click lands inside a Dashboard task row and its
//    hover:bg-slate-50 renders in the shot. Neutralize before every shot.
// 2. DRAWER FOCUS FORM: a pointer click on the hamburger opens the drawer
//    WITHOUT :focus-visible on the Close button (no ring); the S95 epoch
//    set carries the ring. Open via keyboard so the focus transfer matches.
async function neutralMouse(page, width) {
  await page.mouse.move(width - 1, 0);
  await page.waitForTimeout(250);
}

async function openDrawerKeyboard(page) {
  await page.getByRole("button", { name: "Open navigation menu" }).focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1100);
}

async function cloneLogin(ctx) {
  const page = await ctx.newPage();
  await page.goto(`${CLONE}/login`);
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.click("button[type=submit]");
  await page.waitForFunction(() => location.pathname === "/Dashboard", null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  // The S96 toast lesson: the login fires a "Welcome back" toast that lives
  // ~5s; shots taken inside its lifetime carry it (directly on desktop,
  // blurred behind the drawer backdrop on mobile) and the capture-delta
  // reads the artifact as an unattributed band. Settle it BEFORE any shot
  // (the S85 capture-form contract: the epoch sets must be form-identical).
  await page
    .waitForSelector(".sf-toast-in", { state: "detached", timeout: 12000 })
    .catch(() => {});
  await page.waitForTimeout(500);
  return page;
}

async function refLogin(ctx) {
  const page = await ctx.newPage();
  await page.goto(`${REF}/login`);
  await page.fill("input[type=email]", "sepnetflix2023@outlook.com");
  await page.fill("input[type=password]", "$Abcd1234");
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("main") !== null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  return page;
}

const browser = await chromium.launch();
const report = {};

// --- The badge census BEFORE (the S85 contract) --------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await cloneLogin(ctx);
  report.badgeCensus = await page.evaluate(() => {
    const portal = document.querySelector("nextjs-portal");
    const root = portal?.shadowRoot;
    return {
      portalCount: document.querySelectorAll("nextjs-portal").length,
      shadowChildren: root ? root.querySelectorAll("*").length : 0,
    };
  });
  await ctx.close();
}

// --- Clone desktop pair (1280x800, /Dashboard) ----------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await cloneLogin(ctx);
  const watchY = () => page.evaluate(() => {
    const h = [...document.querySelectorAll("h2,h3")].find((e) => e.textContent.trim() === "Upcoming Assignments");
    return h ? Math.round(h.getBoundingClientRect().y) : null;
  });
  report.cloneDesktopExpandedWatchY = await watchY();
  await neutralMouse(page, 1280);
  await page.screenshot({ path: join(OUT, "s96-clone-desktop-expanded-1280.png") });
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await page.waitForTimeout(900);
  report.cloneDesktopCollapsedWatchY = await watchY();
  await neutralMouse(page, 1280);
  await page.screenshot({ path: join(OUT, "s96-clone-desktop-collapsed-1280.png") });
  await ctx.close();
}

// --- Clone mobile trio (390x844) ------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await cloneLogin(ctx);
  // Labeled drawer: pref "0" + reload, fresh-open focus state (keyboard
  // form — the ring must render, matching the S95 epoch set).
  await page.evaluate(() => localStorage.setItem("sf-sidebar-collapsed", "0"));
  await page.reload();
  await page.waitForTimeout(1800);
  await openDrawerKeyboard(page);
  report.cloneDrawerLabeled = await page.evaluate(`(() => {
    const visible = ${vis};
    const pn = [...document.querySelectorAll('div')].find(el => (el.className || '').includes('w-72') && visible(el));
    const nav = pn ? pn.querySelector('nav') : null;
    return {
      navSH: nav ? nav.scrollHeight : null,
      focusLabel: document.activeElement ? (document.activeElement.getAttribute('aria-label') || document.activeElement.textContent.trim().slice(0, 15)) : null,
    };
  })()`);
  await neutralMouse(page, 390);
  await page.screenshot({ path: join(OUT, "s96-clone-mobile-drawer-labeled-390.png") });
  // Close the drawer, flip the pref to icon-only, reload, reopen.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  await page.evaluate(() => localStorage.setItem("sf-sidebar-collapsed", "1"));
  await page.reload();
  await page.waitForTimeout(1800);
  await openDrawerKeyboard(page);
  report.cloneDrawerIconOnly = await page.evaluate(`(() => {
    const visible = ${vis};
    const pn = [...document.querySelectorAll('div')].find(el => (el.className || '').includes('w-72') && visible(el));
    const nav = pn ? pn.querySelector('nav') : null;
    const links = pn ? [...pn.querySelectorAll('a')] : [];
    return {
      navSH: nav ? nav.scrollHeight : null,
      visibleLabels: links.filter((a) => a.textContent.trim().length > 0).length,
      firstLinkH: links[0] ? Math.round(links[0].getBoundingClientRect().height) : null,
    };
  })()`);
  await neutralMouse(page, 390);
  await page.screenshot({ path: join(OUT, "s96-clone-mobile-drawer-icononly-390.png") });
  // Restore the pref, then the Notes shot at /Notes.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  await page.evaluate(() => localStorage.setItem("sf-sidebar-collapsed", "0"));
  await page.goto(`${CLONE}/Notes`);
  await page.waitForTimeout(1500);
  await neutralMouse(page, 390);
  await page.screenshot({ path: join(OUT, "s96-clone-mobile-notes-390.png") });
  await ctx.close();
}

// --- Reference desktop-expanded (1280x800) --------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await refLogin(ctx);
  await page.goto(`${REF}/Dashboard`);
  await page.waitForTimeout(1800);
  report.referenceDesktop = await page.evaluate(() => {
    const aside = document.querySelector("aside");
    const main = document.querySelector("main");
    return {
      asideW: aside ? Math.round(aside.getBoundingClientRect().width) : null,
      mainML: main ? getComputedStyle(main).marginLeft : null,
    };
  });
  await neutralMouse(page, 1280);
  await page.screenshot({ path: join(OUT, "s96-reference-desktop-expanded-1280.png") });
  await ctx.close();
}

// --- Reference mobile-drawer-labeled (390x844, settled form at shot time) -
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await refLogin(ctx);
  await page.waitForTimeout(2000);
  // Open the drawer by the lucide-menu chrome button, retrying until the
  // panel is visible (the SPA's post-login settle can swallow an early click).
  for (let attempt = 0; attempt < 4; attempt++) {
    await page.evaluate(`(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => {
        const s = b.querySelector('svg');
        return s && (s.getAttribute('class') || '').includes('lucide-menu') && b.getBoundingClientRect().width > 0;
      });
      if (btn) btn.click();
    })()`);
    await page.waitForTimeout(1500);
    const open = await page.evaluate(`(() => {
      const visible = ${vis};
      return !![...document.querySelectorAll('div')].find(el => (el.className || '').toString().includes('w-72') && visible(el));
    })()`);
    if (open) break;
  }
  report.referenceDrawer = await page.evaluate(`(() => {
    const visible = ${vis};
    const pn = [...document.querySelectorAll('div')].find(el => (el.className || '').toString().includes('w-72') && visible(el));
    const nav = pn ? pn.querySelector('nav') : null;
    const links = pn ? [...pn.querySelectorAll('a')] : [];
    return {
      panelW: pn ? Math.round(pn.getBoundingClientRect().width) : null,
      navSH: nav ? nav.scrollHeight : null,
      firstLinkH: links[0] ? Math.round(links[0].getBoundingClientRect().height) : null,
      pitch: links.length > 1 ? Math.round(links[1].getBoundingClientRect().y - links[0].getBoundingClientRect().y) : null,
      scrollTop: nav ? nav.scrollTop : null,
    };
  })()`);
  await neutralMouse(page, 390);
  await page.screenshot({ path: join(OUT, "s96-reference-mobile-drawer-labeled-390.png") });
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 1));
const watchOk = report.cloneDesktopExpandedWatchY === 860 && report.cloneDesktopCollapsedWatchY === 788;
console.log(watchOk ? "\nWATCH-ITEM TWO-STATE: EXACT (860/788)" : `\nWATCH-ITEM CHECK: ${report.cloneDesktopExpandedWatchY}/${report.cloneDesktopCollapsedWatchY} — VERIFY`);

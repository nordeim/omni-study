// S103 evidence captures — the S85 contract (7 shots at exact dimensions,
// wholly inside the session's UTC day). The capture-form contract: the four
// non-Notes clone shots at /Dashboard (the walkthrough's greeting view), the
// Notes shot at /Notes (the S85 deviation-recovery doctrine).
//
// The S96/S97/S98/S100/S101/S102 hardened capture-form lessons carried
// forward verbatim: (1) the login toast is settled (.sf-toast-in detached)
// before any shot; (2) the neutral-mouse corner-move runs before every shot;
// (3) the drawer opens via KEYBOARD so the :focus-visible ring matches the
// S95-S102 epoch form; (4) the desktop-collapsed shot uses the S97 FINAL
// epoch form — a fresh reload + 3.5s idle settle (the dev-tools badge idle
// form) + a POINTER-CLICK collapse (a keyboard collapse paints a
// :focus-visible violet ring on the rail's expand control, which the epoch
// sets do not carry) — with the badge probe recorded at shot time.
//
// S103 session-window note: the SAME-DATE + CROSS-BUCKET pair vs the S102
// epoch (hour ~23 UTC Oct 26 EVENING vs S102's hour ~1-2 UTC Oct 26 MORNING;
// the db seeded fresh on Oct 26 at 23:13 UTC — the SAME Oct-26 day-relative
// anchor as S102's seed) — the capture-delta prediction (documented BEFORE
// this run): the GREETING+CLOCK form (the S96->S97 and S100->S101 same-date
// cross-bucket precedent) — the GREETING band ("Good morning" -> "Good
// evening") + the standing footer/app-bar CLOCK bands; NO date bands (the
// same Oct 26 date sub-line in both epochs); NO day-relative-seed slivers
// (the same Oct-26 seed anchor — the pill/badge text renders identically;
// the watch-item two-state 860/788 the decisive probe). Content notes
// predicted at capture time (live-verified in the walkthrough): the h1 keeps
// the TWO-line wrap at 390px (h1H 72 = 2x36) with the EVENING wrap point —
// line 1 "Good evening, Demo" ending x367 (vs S102's "Good morning, Demo"
// ending x374) — so the drawer greeting band keeps the line-1 "Demo" tail
// through the backdrop (x288-367), 7px narrower than S102's; line 2
// "Student 👋" identical in both epochs (no line-2 diff); the mobile date
// sub-line ends x230, inside the occluded 0-288 panel region — NO date band
// through the drawer backdrop (both epochs). Zero deliberate geometry bands
// expected — the src tree is byte-identical to the S102 capture tree (zero
// production-code movement).
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
  // The overdue-banner probe (the S97 attribution discipline): the banner is
  // a STANDING element (its item is the seeded yesterday-17:00 task, day-
  // granularity overdue in every epoch); recorded so any banner band in the
  // delta is attributed at capture time.
  report.cloneOverdueBanner = await page.evaluate(() => {
    const el = [...document.querySelectorAll("div,section")].find((e) => /overdue item/i.test(e.textContent || ""));
    return el ? { present: true } : null;
  });
  await neutralMouse(page, 1280);
  await page.screenshot({ path: join(OUT, "s103-clone-desktop-expanded-1280.png") });
  // The S97 FINAL epoch form for the collapsed shot: fresh reload + 3.5s
  // idle (the badge idle form) + POINTER-CLICK collapse.
  await page.reload();
  await page.waitForTimeout(3500);
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await page.waitForTimeout(1200);
  report.cloneDesktopCollapsedWatchY = await watchY();
  report.collapsedBadgeProbe = await page.evaluate(() => {
    const el = document.elementFromPoint(55, 760);
    return el ? el.tagName : null;
  });
  await neutralMouse(page, 1280);
  await page.screenshot({ path: join(OUT, "s103-clone-desktop-collapsed-1280.png") });
  await ctx.close();
}

// --- Clone mobile trio (390x844) ------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await cloneLogin(ctx);
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
  await page.screenshot({ path: join(OUT, "s103-clone-mobile-drawer-labeled-390.png") });
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
  await page.screenshot({ path: join(OUT, "s103-clone-mobile-drawer-icononly-390.png") });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  await page.evaluate(() => localStorage.setItem("sf-sidebar-collapsed", "0"));
  await page.goto(`${CLONE}/Notes`);
  await page.waitForTimeout(1500);
  await neutralMouse(page, 390);
  await page.screenshot({ path: join(OUT, "s103-clone-mobile-notes-390.png") });
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
  await page.screenshot({ path: join(OUT, "s103-reference-desktop-expanded-1280.png") });
  await ctx.close();
}

// --- Reference mobile-drawer-labeled (390x844, settled form at shot time) -
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await refLogin(ctx);
  await page.waitForTimeout(2000);
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
  await page.screenshot({ path: join(OUT, "s103-reference-mobile-drawer-labeled-390.png") });
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 1));
const watchOk = report.cloneDesktopExpandedWatchY === 860 && report.cloneDesktopCollapsedWatchY === 788;
console.log(watchOk ? "\nWATCH-ITEM TWO-STATE: EXACT (860/788)" : `\nWATCH-ITEM CHECK: ${report.cloneDesktopExpandedWatchY}/${report.cloneDesktopCollapsedWatchY} — attribute the day-relative-seed family before concluding`);

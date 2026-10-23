import { expect, test } from "@playwright/test";

/**
 * Session-91 remediation pins — the mobile drawer focus/scroll mechanics
 * (the audit's MEDIUM finding #5, the owner's priority surface).
 *
 * The drawer already carries the S3/S52 supersets (role="dialog" +
 * aria-modal + aria-label, the labelled backdrop button, Escape-close,
 * auto-close on navigation, aria-labels on icon-only links). What it
 * lacked — the web-app-foundation §8.1 non-negotiables for a modal
 * drawer — pinned here:
 *
 *  S91-F1 focus moves INTO the panel on open (the close button).
 *  S91-F2 Tab cycles within the dialog (the focus trap — no escape
 *        into the page behind the overlay).
 *  S91-F3 closing the drawer RESTORES focus to the hamburger.
 *  S91-F4 the body is scroll-locked while open and released on close.
 *  S91-F5 the hamburger carries aria-expanded tracking the open state.
 *
 * Every pin is a superset addition — the reference's own drawer has ZERO
 * aria/focus mechanics (measured S3–S52), so none of this can regress
 * visual parity. The DOM structure, the panel geometry, and the standing
 * drawer pins (mobile-navigation.spec.ts, drawer-check-s14.mjs) are
 * untouched by construction.
 */

test.describe("S91 · mobile drawer focus + scroll-lock mechanics", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("S91-F1: opening the drawer moves focus into the panel (close button)", async ({ page }) => {
    await page.goto("/Dashboard");
    await page.waitForSelector("main");

    const burger = page.getByRole("button", { name: "Open navigation menu" });
    await burger.click();

    const close = page.getByRole("button", { name: "Close menu" });
    await expect(close).toBeVisible();
    await expect(close).toBeFocused();
  });

  test("S91-F2: Tab cycles within the dialog (the focus trap)", async ({ page }) => {
    await page.goto("/Dashboard");
    await page.waitForSelector("main");

    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const close = page.getByRole("button", { name: "Close menu" });
    await expect(close).toBeFocused();

    // Tab through every focusable element inside the dialog; focus must
    // NEVER land outside [role="dialog"] while it is open.
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]');
        return !!dlg && dlg.contains(document.activeElement);
      });
      expect(inside, `Tab press #${i + 1} escaped the dialog`).toBe(true);
    }
  });

  test("S91-F3: closing via the backdrop restores focus to the hamburger", async ({ page }) => {
    await page.goto("/Dashboard");
    await page.waitForSelector("main");

    const burger = page.getByRole("button", { name: "Open navigation menu" });
    await burger.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();

    // Click the VISIBLE backdrop region — the backdrop spans the viewport
    // but its center point sits UNDER the 288px panel; x=350 is the open
    // area to the panel's right at the 390px viewport.
    const backdrop = page.getByRole("button", { name: "Close navigation menu" });
    await backdrop.click({ position: { x: 350, y: 400 } });
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(burger).toBeFocused();
  });

  test("S91-F3b: closing via Escape also restores focus to the hamburger", async ({ page }) => {
    await page.goto("/Dashboard");
    await page.waitForSelector("main");

    const burger = page.getByRole("button", { name: "Open navigation menu" });
    await burger.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(burger).toBeFocused();
  });

  test("S91-F4: the body is scroll-locked while open and released on close", async ({ page }) => {
    await page.goto("/Dashboard");
    await page.waitForSelector("main");

    expect(
      await page.evaluate(() => document.body.style.overflow)
    ).toBe("");

    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
    expect(
      await page.evaluate(() => document.body.style.overflow)
    ).toBe("hidden");

    await page.keyboard.press("Escape");
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    expect(
      await page.evaluate(() => document.body.style.overflow)
    ).toBe("");
  });

  test("S91-F5: the hamburger carries aria-expanded tracking the open state", async ({ page }) => {
    await page.goto("/Dashboard");
    await page.waitForSelector("main");

    const burger = page.getByRole("button", { name: "Open navigation menu" });
    await expect(burger).toHaveAttribute("aria-expanded", "false");

    await burger.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
    await expect(burger).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(burger).toHaveAttribute("aria-expanded", "false");
  });
});

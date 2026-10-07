import { expect, test } from "@playwright/test";

// Mobile navigation (390×844 — the reference's mobile chrome): the app bar
// with hamburger, the slide-in drawer with brand header + close button +
// all 20 nav links, and navigation behavior. The reference app renders its
// sidebar only at lg (≥1024) — below that everything goes through the
// drawer. Contexts arrive AUTHENTICATED (setup-project storageState).

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test.describe("mobile navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/Dashboard");
  });

  test("app bar renders with hamburger, brand and view title", async ({ page }) => {
    const bar = page.getByRole("banner");
    await expect(bar).toBeVisible();
    await expect(bar).toHaveCSS("height", "64px");
    await expect(bar.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
    await expect(bar.getByText("Dashboard")).toBeVisible();
  });

  test("the sidebar is hidden below lg", async ({ page }) => {
    const aside = page.locator("aside");
    await expect(aside).toBeHidden();
  });

  test("hamburger opens the drawer with all 20 links + brand + close", async ({ page }) => {
    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("StudyFlow", { exact: true })).toBeVisible();
    await expect(dialog.getByText("Your study companion")).toBeVisible();

    for (const label of [
      "Dashboard",
      "My Day",
      "Tasks",
      "Calendar",
      "Events",
      "Timetable",
      "Assignments",
      "Exams",
      "Notes",
      "Flashcards",
      "Practice Tests",
      "Study Groups",
      "Grade Tracker",
      "Analytics",
      "Files",
      "Calculator",
      "Math Solver",
      "AI Assistant",
      "Focus Timer",
      "Settings",
    ]) {
      await expect(dialog.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(dialog.getByRole("button", { name: "Close menu" })).toBeVisible();
  });

  test("drawer links navigate and the drawer closes", async ({ page }) => {
    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("link", { name: "Tasks", exact: true }).tap();
    await expect(page).toHaveURL(/\/Tasks\/?$/);
    await expect(page.getByRole("heading", { name: "All Tasks", exact: true })).toBeVisible();
    await expect(page.getByRole("dialog")).toBeHidden();

    // Navigate again from Tasks to Settings through the drawer.
    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    await page.getByRole("dialog").getByRole("link", { name: "Settings", exact: true }).tap();
    await expect(page).toHaveURL(/\/Settings\/?$/);
    await expect(
      page.getByRole("heading", { name: "Settings", exact: true }),
    ).toBeVisible();
  });

  test("the drawer closes on Escape and on backdrop tap", async ({ page }) => {
    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    await expect(dialog).toBeVisible();
    // Tap the backdrop on the RIGHT side (the drawer panel spans the left
    // 290px at 390px wide, so the element's center is covered by it).
    await page
      .getByRole("button", { name: "Close navigation menu" })
      .click({ position: { x: 360, y: 400 } });
    await expect(dialog).toBeHidden();
  });

  test("the app bar shows the current view title after navigation", async ({ page }) => {
    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    await page.getByRole("dialog").getByRole("link", { name: "Calendar", exact: true }).tap();
    await expect(page).toHaveURL(/\/Calendar\/?$/);
    await expect(page.getByRole("banner").getByText("Calendar")).toBeVisible();
  });
});

test.describe("lg breakpoint navigation", () => {
  test.use({ viewport: { width: 1024, height: 800 } });

  test("the fixed sidebar appears at lg and the hamburger disappears", async ({ page }) => {
    await page.goto("/Dashboard");
    const aside = page.locator("aside");
    await expect(aside).toBeVisible();
    await expect(aside).toHaveCSS("width", "260px");
    await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeHidden();
    // The main content is offset by the fixed sidebar width.
    const main = page.locator("main");
    await expect(main).toHaveCSS("margin-left", "260px");
  });
});

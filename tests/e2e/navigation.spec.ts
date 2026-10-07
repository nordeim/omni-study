import { expect, test } from "@playwright/test";

// Desktop navigation + the full view surface: every one of the 20
// PascalCase routes renders its headline surface, the active sidebar item
// carries the accent treatment, and deep links (rewrites onto /) work.
// Contexts arrive AUTHENTICATED.

test.use({ viewport: { width: 1440, height: 900 } });

const VIEWS: { path: string; heading: string | RegExp }[] = [
  { path: "/Dashboard", heading: /Good (morning|afternoon|evening|night)/ },
  { path: "/MyDay", heading: "My Day" },
  { path: "/Tasks", heading: "All Tasks" },
  { path: "/Calendar", heading: "Calendar" },
  { path: "/Events", heading: "Events & Reminders" },
  { path: "/Timetable", heading: "Timetable" },
  { path: "/Assignments", heading: "Assignments" },
  { path: "/Exams", heading: "Exams" },
  { path: "/Notes", heading: "Notes" },
  { path: "/Flashcards", heading: "Flashcards" },
  { path: "/PracticeTests", heading: "Practice Tests" },
  { path: "/StudyGroups", heading: "Study Groups" },
  { path: "/GradeTracker", heading: "Grade Tracker" },
  { path: "/Analytics", heading: "Analytics" },
  { path: "/Files", heading: "Files" },
  { path: "/Calculator", heading: "Calculator Suite" },
  { path: "/MathSolver", heading: "Math Solver" },
  { path: "/AIAssistant", heading: "AI Study Assistant" },
  { path: "/FocusTimer", heading: "Focus Timer" },
  { path: "/Settings", heading: "Settings" },
];

test.describe("sidebar navigation (desktop)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/Dashboard");
  });

  test("all 20 nav links are present", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    const NAV_LABELS = [
      "Dashboard", "My Day", "Tasks", "Calendar", "Events", "Timetable",
      "Assignments", "Exams", "Notes", "Flashcards", "Practice Tests",
      "Study Groups", "Grade Tracker", "Analytics", "Files", "Calculator",
      "Math Solver", "AI Assistant", "Focus Timer", "Settings",
    ];
    for (const label of NAV_LABELS) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });

  test("the active item carries the accent tint and trailing dot", async ({ page }) => {
    const active = page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
      name: "Dashboard",
      exact: true,
    });
    await expect(active).toHaveAttribute("aria-current", "page");
    const chip = active.locator("span").first();
    const bg = await chip.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("linear-gradient");
    const color = await chip.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(124, 58, 237)"); // violet-600 (measured live)
    await expect(active.locator(".rounded-full.ml-auto")).toBeVisible();
  });

  test("clicking a nav link switches views and moves the active state", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    await nav.getByRole("link", { name: "Tasks", exact: true }).click();
    await expect(page).toHaveURL(/\/Tasks\/?$/);
    await expect(
      page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
        name: "Tasks",
        exact: true,
      }),
    ).toHaveAttribute("aria-current", "page");
    // Dashboard lost the active state.
    await expect(
      page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
        name: "Dashboard",
        exact: true,
      }),
    ).not.toHaveAttribute("aria-current", "page");
  });

  test("the sidebar can collapse and expand", async ({ page }) => {
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    const aside = page.locator("aside");
    await expect(aside).toHaveCSS("width", "76px");
    await page.getByRole("button", { name: "Expand sidebar" }).click();
    await expect(aside).toHaveCSS("width", "260px");
  });
});

test.describe("all views render (desktop)", () => {
  for (const view of VIEWS) {
    test(`/${view.path.replace("/", "")} renders`, async ({ page }) => {
      await page.goto(view.path);
      await expect(page).toHaveURL(new RegExp(view.path.replace("/", "\\/") + "\\/?$"));
      await expect(
        page.getByRole("heading", { name: view.heading }).first(),
      ).toBeVisible();
    });
  }

  test("dashboard shows the seeded stat cards and sections", async ({ page }) => {
    await page.goto("/Dashboard");
    await expect(page.getByText("Today's Progress", { exact: true })).toBeVisible();
    await expect(page.getByText("Pending Tasks", { exact: true })).toBeVisible();
    await expect(page.getByText("Due Soon", { exact: true })).toBeVisible();
    await expect(page.getByText("Focus Time", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Today's Tasks" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Upcoming Exams" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Upcoming Assignments" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start My Day" })).toBeVisible();
  });

  test("Start My Day navigates to MyDay", async ({ page }) => {
    await page.goto("/Dashboard");
    await page.getByRole("button", { name: "Start My Day" }).click();
    await expect(page).toHaveURL(/\/MyDay\/?$/);
    await expect(page.getByRole("heading", { name: "My Day" })).toBeVisible();
  });
});

test.describe("view chrome (computed parity pins)", () => {
  test("cards render the v3-pinned shadow-sm geometry", async ({ page }) => {
    await page.goto("/Dashboard");
    const card = page.locator("main .overflow-hidden.rounded-2xl").first();
    const shadow = await card.evaluate((el) => getComputedStyle(el).boxShadow);
    // v3 shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05) — pinned in globals.css
    // (TRAP 5: v4's default shadow-sm is one notch heavier).
    expect(shadow.replace(/\s+/g, " ")).toContain("rgba(0, 0, 0, 0.05) 0px 1px 2px 0px");
  });

  test("the canvas carries the measured app gradient", async ({ page }) => {
    await page.goto("/Dashboard");
    // Wait for the hydrated app shell: the SSR splash (also .sf-canvas) is
    // removed on auth, and a locator resolved against it would go detached
    // (computed styles read as "" mid-removal).
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    const canvas = page.locator(".sf-canvas").first();
    await expect(canvas).toBeAttached();
    const bg = await canvas.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("linear-gradient");
    expect(bg).toContain("rgb(248, 250, 252)"); // slate-50 first stop (measured)
  });
});

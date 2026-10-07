import { expect, test } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

// Login surface: the /login route renders the StudyFlow auth card, rejects
// bad credentials, signs the demo user in, and redirects unauthenticated
// visitors. This file OPTS OUT of the shared storageState (empty cookies)
// because it tests the logged-out surface. (Deliberately does NOT probe the
// rate limiter — 10 attempts/IP/15 min would poison the whole suite.)

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("login route", () => {
  test("renders the StudyFlow auth card", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Welcome to StudyFlow" }),
    ).toBeVisible();
    await expect(page.getByText("Sign in to continue")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  });

  test("wrong password is rejected without a session", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(DEMO_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill("WrongPassword99");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByText("Invalid email or password.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("valid credentials sign in and land on the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(DEMO_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/Dashboard\/?$/);
    await expect(
      page.getByRole("heading", { name: /Good (morning|afternoon|evening|night)/ }),
    ).toBeVisible();
  });

  test("unauthenticated visits redirect to /login", async ({ page }) => {
    await page.goto("/Dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("logout clears the session", async ({ page }) => {
    // Sign in first (fresh context), then sign out via Settings.
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(DEMO_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/Dashboard\/?$/);

    await page.goto("/Settings");
    await page.getByRole("tab", { name: "Profile" }).click();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

import { expect, test } from "@playwright/test";

// These E2E tests require a running dev server with known test credentials.
// Set ADMIN_TEST_EMAIL and ADMIN_TEST_PASSWORD in the environment,
// or use the defaults below (only valid if a test admin account exists).
const ADMIN_EMAIL = process.env.ADMIN_TEST_EMAIL ?? "eliasbitsch@hotmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_TEST_PASSWORD ?? "testpassword123";

test.describe("Admin authentication", () => {
  test("unauthenticated visit to /admin redirects to /admin/login", async ({ page }) => {
    // Clear cookies to ensure we're logged out
    await page.context().clearCookies();
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login page shows Admin Login heading", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: "Admin Login" })).toBeVisible();
  });

  test("wrong password shows error message", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByPlaceholder("Enter your email").fill(ADMIN_EMAIL);
    await page.getByPlaceholder("Enter your password").fill("wrongpassword999");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.locator(".bg-danger\\/10")).toBeVisible({ timeout: 5000 });
  });

  test("correct credentials log in and reach /admin", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByPlaceholder("Enter your email").fill(ADMIN_EMAIL);
    await page.getByPlaceholder("Enter your password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/admin$/, { timeout: 10000 });
  });

  test("after login, /admin is accessible without redirect", async ({ page }) => {
    // Login first
    await page.goto("/admin/login");
    await page.getByPlaceholder("Enter your email").fill(ADMIN_EMAIL);
    await page.getByPlaceholder("Enter your password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/admin$/, { timeout: 10000 });

    // Navigate away and back
    await page.goto("/");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin$/, { timeout: 5000 });
  });

  test("rate limiting blocks after 5 failed attempts", async ({ page }) => {
    // Use a unique IP-like scenario by making API calls directly
    for (let i = 0; i < 5; i++) {
      await page.goto("/admin/login");
      await page.getByPlaceholder("Enter your email").fill(ADMIN_EMAIL);
      await page.getByPlaceholder("Enter your password").fill(`badpassword${i}`);
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForTimeout(300);
    }

    // 6th attempt should be rate limited
    await page.goto("/admin/login");
    await page.getByPlaceholder("Enter your email").fill(ADMIN_EMAIL);
    await page.getByPlaceholder("Enter your password").fill("badpassword6");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.locator(".bg-danger\\/10")).toContainText(/too many/i, { timeout: 5000 });
  });
});

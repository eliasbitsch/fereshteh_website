import { expect, test } from "@playwright/test";

const FERESHTEH_NAME_REGEX = /Fereshteh/i;

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    await page.goto("/");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check if main content is visible
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should display hero section", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Check for name/title
    await expect(page.getByText(FERESHTEH_NAME_REGEX)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("should have navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for navigation links - use first() since there are multiple nav elements
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible({ timeout: 10_000 });
  });

  test("should be responsive", async ({ page }) => {
    await page.goto("/");

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1")).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator("h1")).toBeVisible();
  });
});

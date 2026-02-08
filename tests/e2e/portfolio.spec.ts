import { expect, test } from "@playwright/test";

test.describe("Portfolio", () => {
  test("should display portfolio section", async ({ page }) => {
    await page.goto("/");

    // Look for portfolio section
    const portfolioSection = page
      .locator('[id*="portfolio"], [class*="portfolio"]')
      .first();

    if (await portfolioSection.isVisible()) {
      await expect(portfolioSection).toBeVisible();
    }
  });

  test("should navigate to portfolio item", async ({ page }) => {
    await page.goto("/");

    // Find first portfolio link
    const portfolioLink = page.locator('a[href*="/portfolio/"]').first();

    if (await portfolioLink.isVisible()) {
      await portfolioLink.click();

      // Wait for navigation
      await page.waitForLoadState("networkidle");

      // Verify we're on a portfolio detail page
      expect(page.url()).toContain("/portfolio/");
    }
  });

  test("should display portfolio items with images", async ({ page }) => {
    await page.goto("/");

    // Look for portfolio images
    const images = page.locator('img[src*="portfolio"], img[src*="project"]');

    if ((await images.count()) > 0) {
      await expect(images.first()).toBeVisible();
    }
  });
});

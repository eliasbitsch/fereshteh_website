import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate between pages", async ({ page }) => {
    await page.goto("/");

    // Check if about link exists
    const aboutLink = page.locator('a[href*="/about"]').first();

    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/about");

      // Navigate back
      await page.goBack();
      await page.waitForLoadState("networkidle");
    }
  });

  test("should toggle theme", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for theme switcher button
    const themeButton = page
      .locator('button[aria-label*="theme"], button[title*="theme"]')
      .first();

    // Wait for button to be stable
    await themeButton.waitFor({ state: "visible", timeout: 10_000 });
    await page.waitForTimeout(500); // Wait for any animations to settle

    if (await themeButton.isVisible()) {
      // Get initial theme
      const htmlElement = page.locator("html");
      const initialClass = await htmlElement.getAttribute("class");

      // Click theme switcher with force to avoid detachment issues
      await themeButton.click({ force: true });
      await page.waitForTimeout(500); // Wait for theme transition

      // Verify theme changed
      const newClass = await htmlElement.getAttribute("class");
      expect(initialClass).not.toBe(newClass);
    }
  });

  test("should have working internal links", async ({ page }) => {
    await page.goto("/");

    // Get all internal links
    const internalLinks = page.locator('a[href^="/"]');
    const count = await internalLinks.count();

    if (count > 0) {
      // Test first few links
      for (let i = 0; i < Math.min(3, count); i++) {
        const link = internalLinks.nth(i);
        const href = await link.getAttribute("href");

        if (href && !href.includes("#")) {
          await page.goto(href);
          await page.waitForLoadState("networkidle");

          // Verify page loaded successfully (no 404)
          const statusCode = await page.evaluate(() =>
            document.querySelector("h1")?.textContent?.includes("404")
              ? 404
              : 200
          );
          expect(statusCode).toBe(200);
        }
      }
    }
  });
});

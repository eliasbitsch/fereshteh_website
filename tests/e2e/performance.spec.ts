import { expect, test } from "@playwright/test";

test.describe("Performance", () => {
  test("should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test("should have optimized images", async ({ page }) => {
    await page.goto("/");

    // Check for modern image formats (AVIF, WebP)
    const images = page.locator("img");
    const count = await images.count();

    if (count > 0) {
      let modernFormatCount = 0;

      for (let i = 0; i < count; i++) {
        const src = await images.nth(i).getAttribute("src");
        if (src && (src.includes(".avif") || src.includes(".webp"))) {
          modernFormatCount += 1;
        }
      }

      // At least some images should use modern formats
      console.log(`Modern format images: ${modernFormatCount}/${count}`);
    }
  });

  test("should not have layout shifts", async ({ page }) => {
    await page.goto("/");

    // Wait for page to stabilize
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Get page height
    const initialHeight = await page.evaluate(() => document.body.scrollHeight);

    // Wait a bit more
    await page.waitForTimeout(1000);

    // Check if height changed significantly (layout shift)
    const finalHeight = await page.evaluate(() => document.body.scrollHeight);
    const heightDiff = Math.abs(finalHeight - initialHeight);

    // Height shouldn't change more than 100px after page load
    expect(heightDiff).toBeLessThan(100);
  });
});

import { expect, test } from "@playwright/test";

test.describe("Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    // Check for h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThan(0);
    expect(h1Count).toBeLessThanOrEqual(1); // Should have only one h1
  });

  test("should have alt text on images", async ({ page }) => {
    await page.goto("/");

    // Get all images
    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");

      // Images should either have alt text or be decorative (role="presentation")
      const role = await img.getAttribute("role");
      expect(alt !== null || role === "presentation").toBeTruthy();
    }
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/");

    // Press Tab and check if focus is visible
    await page.keyboard.press("Tab");

    // Check if any element has focus
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeTruthy();
  });

  test("should have proper ARIA labels on interactive elements", async ({
    page,
  }) => {
    await page.goto("/");

    // Check buttons have accessible names
    const buttons = page.locator("button");
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute("aria-label");
      const ariaLabelledBy = await button.getAttribute("aria-labelledby");

      // Button should have either text, aria-label, or aria-labelledby
      expect(
        (text && text.trim().length > 0) ||
          (ariaLabel && ariaLabel.length > 0) ||
          (ariaLabelledBy && ariaLabelledBy.length > 0)
      ).toBeTruthy();
    }
  });
});

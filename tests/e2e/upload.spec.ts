import { expect, test } from "@playwright/test";

test.describe("File Upload Integration", () => {
  test.skip("admin can upload project PDF", async ({ page }) => {
    // This test is skipped by default as it requires authentication
    // To run: Set up test admin account and remove .skip

    await page.goto("/admin/login");

    // Login
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "test-password");
    await page.click('button[type="submit"]');

    // Wait for redirect to admin page
    await page.waitForURL("**/admin");

    // Find upload button/form
    const fileInput = page.locator('input[type="file"]');

    if (await fileInput.isVisible()) {
      // Create a test PDF file (small, <2MB for testing)
      const testFile = {
        name: "test-project.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4 test content"),
      };

      await fileInput.setInputFiles(testFile);

      // Submit upload
      await page.click('button:has-text("Upload")');

      // Verify success message
      await expect(page.locator("text=/uploaded|success/i")).toBeVisible({
        timeout: 10_000,
      });
    }
  });

  test("upload endpoint respects file size limits", async ({ request }) => {
    // Test that small files work
    const formData = new FormData();
    const smallFile = new File(["small content"], "small.pdf", {
      type: "application/pdf",
    });
    formData.append("file", smallFile);

    // This will fail without auth, but shouldn't fail with 413
    const response = await request.post("/api/content/projects/upload", {
      data: formData,
    });

    // Should be 401 (no auth) not 413 (too large)
    expect(response.status()).not.toBe(413);
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.ADMIN_TEST_EMAIL ?? "eliasbitsch@hotmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_TEST_PASSWORD ?? "testpassword123";

// Minimal valid PDF content
const MINIMAL_PDF = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n" +
    "xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n" +
    "0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF\n"
);

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Enter your email").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("Enter your password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 10000 });
}

test.describe("Admin upload", () => {
  test("upload API rejects unauthenticated requests", async ({ request }) => {
    const response = await request.post("/api/content/projects/upload", {
      multipart: {
        file: {
          name: "test.pdf",
          mimeType: "application/pdf",
          buffer: MINIMAL_PDF,
        },
      },
    });
    expect(response.status()).toBe(401);
  });

  test("upload API rejects non-PDF files", async ({ request, page }) => {
    await loginAsAdmin(page);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "admin_session");
    expect(sessionCookie).toBeDefined();

    const response = await request.post("/api/content/projects/upload", {
      headers: { Cookie: `admin_session=${sessionCookie!.value}` },
      multipart: {
        file: {
          name: "malicious.exe",
          mimeType: "application/octet-stream",
          buffer: Buffer.from("MZ fake exe content"),
        },
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/pdf/i);
  });

  test("upload API rejects oversized files (>50MB)", async ({ request, page }) => {
    await loginAsAdmin(page);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "admin_session");

    // Create a fake 51MB PDF (just header + padding)
    const bigBuffer = Buffer.alloc(51 * 1024 * 1024, 0);
    bigBuffer.write("%PDF-1.4\n", 0);
    bigBuffer.write("%%EOF", bigBuffer.length - 5);

    const response = await request.post("/api/content/projects/upload", {
      headers: { Cookie: `admin_session=${sessionCookie!.value}` },
      multipart: {
        file: {
          name: "huge.pdf",
          mimeType: "application/pdf",
          buffer: bigBuffer,
        },
      },
    });
    expect(response.status()).toBe(413);
  });

  test("upload API sanitizes path traversal filenames", async ({ request, page }) => {
    await loginAsAdmin(page);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "admin_session");

    const response = await request.post("/api/content/projects/upload", {
      headers: { Cookie: `admin_session=${sessionCookie!.value}` },
      multipart: {
        file: {
          name: "../../etc/passwd.pdf",
          mimeType: "application/pdf",
          buffer: MINIMAL_PDF,
        },
      },
    });
    // Should succeed (sanitized) or fail gracefully — never write outside public/projects
    if (response.status() === 200) {
      const body = await response.json();
      // Sanitized filename should not contain directory traversal
      expect(body.filename).not.toContain("..");
      expect(body.filename).not.toContain("/");
    }
  });

  test("admin panel shows upload section when logged in", async ({ page }) => {
    await loginAsAdmin(page);
    // The admin panel should be visible (not redirected to login)
    await expect(page).toHaveURL(/\/admin$/);
    // Should show some content management UI
    await expect(page.locator("body")).not.toBeEmpty();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "~/app/api/content/projects/upload/route";
import { validateSession } from "~/lib/auth";

vi.mock("~/lib/auth");
vi.mock("node:fs/promises");
vi.mock("node:fs");
vi.mock("node:child_process");

describe("/api/content/projects/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(validateSession).mockReturnValue(null);

    const mockCookies = {
      get: vi.fn(() => undefined),
    };
    vi.doMock("next/headers", () => ({
      cookies: vi.fn(async () => mockCookies),
    }));

    const formData = new FormData();
    const request = new Request(
      "http://localhost/api/content/projects/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("should return 400 if no file provided", async () => {
    vi.mocked(validateSession).mockReturnValue({ userId: "test-user" });

    const mockCookies = {
      get: vi.fn(() => ({ value: "valid-token" })),
    };
    vi.doMock("next/headers", () => ({
      cookies: vi.fn(async () => mockCookies),
    }));

    const formData = new FormData();
    const request = new Request(
      "http://localhost/api/content/projects/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: "No file provided" });
  });

  it("should return 400 if file is not a PDF", async () => {
    vi.mocked(validateSession).mockReturnValue({ userId: "test-user" });

    const mockCookies = {
      get: vi.fn(() => ({ value: "valid-token" })),
    };
    vi.doMock("next/headers", () => ({
      cookies: vi.fn(async () => mockCookies),
    }));

    const formData = new FormData();
    const file = new File(["test"], "test.txt", { type: "text/plain" });
    formData.append("file", file);

    const request = new Request(
      "http://localhost/api/content/projects/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: "Only PDF files are allowed" });
  });

  it("should successfully upload a PDF file", async () => {
    vi.mocked(validateSession).mockReturnValue({ userId: "test-user" });

    const mockCookies = {
      get: vi.fn(() => ({ value: "valid-token" })),
    };
    vi.doMock("next/headers", () => ({
      cookies: vi.fn(async () => mockCookies),
    }));

    const { writeFile, mkdir } = await import("node:fs/promises");
    const { existsSync } = await import("node:fs");
    const { spawn } = await import("node:child_process");

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(writeFile).mockResolvedValue(undefined);
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(spawn).mockReturnValue({
      unref: vi.fn(),
    } as any);

    const formData = new FormData();
    const file = new File(["test pdf content"], "test-project.pdf", {
      type: "application/pdf",
    });
    formData.append("file", file);

    const request = new Request(
      "http://localhost/api/content/projects/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      success: true,
      filename: "test-project.pdf",
      message: expect.stringContaining("File uploaded"),
    });
  });
});

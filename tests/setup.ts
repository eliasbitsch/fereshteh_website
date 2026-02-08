import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Polyfill for File constructor to work properly in tests
if (typeof globalThis.File === "undefined") {
  class FilePolyfill extends Blob {
    name: string;
    lastModified: number;

    constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
      super(bits, options);
      this.name = name;
      this.lastModified = options?.lastModified ?? Date.now();
    }
  }
  globalThis.File = FilePolyfill as typeof File;
}

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js modules
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Map()),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";

// Mock node:child_process for upload tests
vi.mock("node:child_process", () => ({
  spawn: vi.fn(() => ({
    unref: vi.fn(),
  })),
}));

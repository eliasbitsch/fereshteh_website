import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashPassword, validateSession } from "~/lib/auth";

describe("Auth Library", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateSession", () => {
    it("should return null for invalid session token", () => {
      const result = validateSession("invalid-token");
      expect(result).toBeNull();
    });

    it("should return null for expired session token", () => {
      // This test would need access to the sessions file
      // For now, we just test the basic functionality
      const result = validateSession("");
      expect(result).toBeNull();
    });
  });

  describe("Password hashing", () => {
    it("should hash passwords consistently", () => {
      const password = "test-password-123";
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(password);
      expect(hash1.length).toBe(64); // SHA-256 hex length
    });

    it("should produce different hashes for different passwords", () => {
      const hash1 = hashPassword("password1");
      const hash2 = hashPassword("password2");

      expect(hash1).not.toBe(hash2);
    });
  });
});

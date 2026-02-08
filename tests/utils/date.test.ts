import { describe, expect, it } from "vitest";
import { formatDate, getAge } from "~/utils/date";

const MONTH_PATTERN = /Jan|January/;
const YEAR_PATTERN = /2024/;

describe("Date Utilities", () => {
  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2024-01-15");
      const formatted = formatDate(date);

      expect(formatted).toMatch(MONTH_PATTERN); // Different formats possible
      expect(formatted).toContain("15");
      expect(formatted).toContain("2024");
    });

    it("should handle string dates", () => {
      const formatted = formatDate("2024-01-15");

      expect(formatted).toMatch(YEAR_PATTERN);
    });
  });

  describe("getAge", () => {
    it("should calculate age correctly", () => {
      const birthDate = new Date("1990-01-01");
      const age = getAge(birthDate);

      expect(age).toBeGreaterThan(30);
      expect(age).toBeLessThan(100);
    });
  });
});

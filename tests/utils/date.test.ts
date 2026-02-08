import { describe, expect, it } from "vitest";
import { formatDate, formatRange } from "~/utils/date";

const MONTH_PATTERN = /Jan|January/;
const YEAR_PATTERN = /2024/;

describe("Date Utilities", () => {
  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2024-01-15");
      const formatted = formatDate(date);

      // Default format is numeric, e.g., "1/15/2024"
      expect(formatted).toBeTruthy();
      expect(formatted).toContain("2024");
    });

    it("should handle string dates", () => {
      const formatted = formatDate("2024-01-15");

      expect(formatted).toMatch(YEAR_PATTERN);
    });
  });

  describe("formatRange", () => {
    it("should format date range correctly", () => {
      const start = new Date("2020-01-01");
      const end = new Date("2024-12-31");
      const formatted = formatRange(start, end);

      expect(formatted).toContain("2020");
      expect(formatted).toContain("2024");
    });

    it("should handle null end date", () => {
      const start = new Date("2020-01-01");
      const formatted = formatRange(start, null);

      expect(formatted).toContain("2020");
      expect(formatted).toContain("Present");
    });
  });
});

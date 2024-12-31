import { describe, it, expect, beforeEach, vi } from "vitest";
import { BRHoliday } from "../index";

describe("BRHoliday", () => {
  const mockHolidays = [
    {
      date: "2024-01-01",
      name: "Confraternização Universal",
      type: "national",
    },
    {
      date: "2024-02-13",
      name: "Carnaval",
      type: "national",
    },
  ];

  describe("API Integration", () => {
    let brHoliday: BRHoliday;

    beforeEach(() => {
      brHoliday = new BRHoliday({ liveOnly: true });
      global.fetch = vi.fn();
    });

    describe("getHolidays", () => {
      it("should fetch holidays from API for a given year", async () => {
        (global.fetch as any).mockResolvedValueOnce({
          json: () => Promise.resolve(mockHolidays),
        });

        const holidays = await brHoliday.getHolidays(2024);

        expect(global.fetch).toHaveBeenCalledWith(
          "https://brasilapi.com.br/api/feriados/v1/2024"
        );
        expect(holidays).toEqual(mockHolidays);
      });

      it("should handle API errors gracefully", async () => {
        (global.fetch as any).mockRejectedValueOnce(new Error("API Error"));

        await expect(brHoliday.getHolidays(2024)).rejects.toThrow();
      });
    });

    describe("isHoliday", () => {
      it("should return true for a holiday date", async () => {
        (global.fetch as any).mockResolvedValueOnce({
          json: () => Promise.resolve(mockHolidays),
        });

        const isHoliday = await brHoliday.isHoliday("2024-01-01");
        expect(isHoliday).toBe(true);
      });

      it("should return false for a non-holiday date", async () => {
        (global.fetch as any).mockResolvedValueOnce({
          json: () => Promise.resolve(mockHolidays),
        });

        const isHoliday = await brHoliday.isHoliday("2024-01-02");
        expect(isHoliday).toBe(false);
      });

      it("should handle invalid date format", async () => {
        await expect(brHoliday.isHoliday("invalid-date")).rejects.toThrow();
      });
    });
  });

  describe("Default Behavior", () => {
    let brHoliday: BRHoliday;

    beforeEach(() => {
      brHoliday = new BRHoliday();
      global.fetch = vi.fn();
    });

    it("should attempt API call when no static data is available", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(mockHolidays),
      });

      const holidays = await brHoliday.getHolidays(2024);

      expect(global.fetch).toHaveBeenCalled();
      expect(holidays).toEqual(mockHolidays);
    });
  });
});

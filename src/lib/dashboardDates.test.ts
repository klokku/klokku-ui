import {describe, expect, it} from "vitest";
import {dateKeyInTimezone, getDashboardPeriod} from "@/lib/dashboardDates.ts";

describe("dashboard date ranges", () => {
    it("uses the profile's calendar day and Sunday week start rather than the browser's day", () => {
        const period = getDashboardPeriod(new Date("2026-10-11T00:30:00Z"), "America/Los_Angeles", "sunday");
        expect(period.todayKey).toBe("2026-10-10");
        expect(period.weekStartKey).toBe("2026-10-04");
        expect(period.weekStart.toISOString()).toBe("2026-10-04T07:00:00.000Z");
        expect(period.historyWeekKeys).toHaveLength(8);
        expect(period.historyWeekKeys[0]).toBe("2026-08-09");
        expect(period.historyWeekKeys[7]).toBe("2026-09-27");
    });

    it("keeps calendar midnights across the spring DST transition", () => {
        const period = getDashboardPeriod(new Date("2026-03-29T12:00:00Z"), "Europe/Warsaw", "monday");
        expect(period.weekStart.toISOString()).toBe("2026-03-22T23:00:00.000Z");
        expect(period.weekEnd.toISOString()).toBe("2026-03-29T21:59:59.999Z");
        expect(period.historyFrom.toISOString()).toBe("2026-01-25T23:00:00.000Z");
        expect(period.historyTo.toISOString()).toBe("2026-03-22T22:59:59.999Z");
    });

    it("keeps the extra hour in the autumn DST week", () => {
        const period = getDashboardPeriod(new Date("2026-11-01T12:00:00Z"), "America/New_York", "monday");
        expect(period.weekStart.toISOString()).toBe("2026-10-26T04:00:00.000Z");
        expect(period.weekEnd.toISOString()).toBe("2026-11-02T04:59:59.999Z");
        expect(dateKeyInTimezone(period.historyTo, "America/New_York")).toBe("2026-10-25");
    });
});

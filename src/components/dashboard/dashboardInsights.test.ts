import {describe, expect, it} from "vitest";
import {PlanItemStats, ReportItem, StatsSummary, WeeklyPlanItem, WeeklyReportEntry} from "@/api/types.ts";
import {balanceLabel, getBudgetBalances, getEligibleHistory, getPlanRealism, getRecentTrend, getWeeklyRhythm} from "@/components/dashboard/dashboardInsights.ts";
import {getDashboardPeriod} from "@/lib/dashboardDates.ts";

const period = getDashboardPeriod(new Date("2026-10-10T12:00:00Z"), "Europe/Warsaw", "monday");
const currentItem: WeeklyPlanItem = {
    budgetItemId: 1, name: "Exercise", weeklyDuration: 3600, weeklyOccurrences: 2,
    icon: "", color: "#abcdef", notes: "", position: 0,
};

function itemStats(id: number, planned: number, actual: number): PlanItemStats {
    return {
        planItem: {
            budgetPlanId: 1, budgetItemId: id, weeklyItemId: id, name: "Same name", icon: "", color: "#abcdef",
            position: id, weeklyItemDuration: planned, budgetItemDuration: planned, weeklyOccurrences: 1, notes: "",
        },
        duration: actual, remaining: planned - actual, startDate: "2026-10-05T00:00:00+02:00", endDate: "2026-10-11T23:59:59+02:00",
    };
}

function summary(items: PlanItemStats[]): StatsSummary {
    return {perPlanItem: items, perDay: [], startDate: "", endDate: "", totalPlanned: 0, totalRemaining: 0, totalTime: 0};
}

function reportWeek(date: string, planned: number, actual: number): WeeklyReportEntry {
    const item: ReportItem = {
        budgetItemId: 1, name: "Exercise", icon: "", color: "#abcdef", position: 0,
        budgetPlanTime: 99999, weeklyPlanTime: planned, actualTime: actual, averagePerDay: 0, averagePerWeek: 0,
    };
    return {
        startDate: `${date}T00:00:00+02:00`, endDate: `${date}T23:59:59+02:00`, weekNumber: date,
        items: [item], totalBudgetPlanTime: 99999, totalWeeklyPlanTime: planned, totalActualTime: actual,
    };
}

describe("budget balance", () => {
    it("includes untouched and zero-allocation budgets and keeps identical names separate", () => {
        const rows = getBudgetBalances(summary([itemStats(1, 10800, 0), itemStats(2, 0, 3600), itemStats(3, 3600, 3600)]));
        expect(rows.map(row => row.id)).toEqual([1, 2, 3]);
        expect(balanceLabel(rows[0].difference)).toBe("3h 0m remaining");
        expect(balanceLabel(rows[1].difference)).toBe("1h 0m over allocation");
        expect(balanceLabel(rows[2].difference)).toBe("At allocation");
    });
});

describe("weekly rhythm", () => {
    it("matches daily timestamps in the profile timezone and distinguishes zero, missing, and future days", () => {
        const stats = summary([itemStats(1, 3600, 1800)]);
        stats.perDay = [
            {date: "2026-10-04T22:00:00Z", totalTime: 1800, perPlanItem: [itemStats(1, 3600, 1800)]},
            {date: "2026-10-05T22:00:00Z", totalTime: 0, perPlanItem: [itemStats(1, 3600, 0)]},
            {date: "2026-10-10T22:00:00Z", totalTime: 7200, perPlanItem: [itemStats(1, 3600, 7200)]},
        ];
        const days = getWeeklyRhythm(stats, period, "Europe/Warsaw");
        expect(days).toHaveLength(7);
        expect(days[0]).toMatchObject({label: "Mon", total: 1800, budget_1: 1800});
        expect(days[1]).toMatchObject({total: 0, budget_1: 0});
        expect(days[2].total).toBeNull();
        expect(days[5].today).toBe(true);
        expect(days[6]).toMatchObject({upcoming: true, total: null, budget_1: null});
    });
});

describe("historical insights", () => {
    it("preserves inactive weeks for an established plan even when the whole period has zero activity", () => {
        const weeks = period.historyWeekKeys.map(date => reportWeek(date, 3600, 0));
        const history = getEligibleHistory(weeks, period, "Europe/Warsaw", "2025-01-06T12:00:00Z");
        expect(history).toHaveLength(8);
        expect(getRecentTrend(history, 1, period, "Europe/Warsaw").every(point => point.actual === 0)).toBe(true);
        expect(getPlanRealism(history, [currentItem])[0]).toMatchObject({actual: 0, planned: 3600, count: 8, below: 8, enoughHistory: true});
    });

    it("excludes pre-tracking weeks but includes the first tracked calendar week from authoritative metadata", () => {
        const weeks = period.historyWeekKeys.map(date => reportWeek(date, 3600, 0));
        const history = getEligibleHistory(weeks, period, "Europe/Warsaw", "2026-09-16T12:00:00Z");
        expect(history.map(week => week.startDate.slice(0, 10))).toEqual(["2026-09-14", "2026-09-21", "2026-09-28"]);
        expect(getPlanRealism(history, [currentItem])[0]).toMatchObject({count: 3, enoughHistory: false});
    });

    it("drops synthetic leading zero weeks and the current week, but keeps genuine zero activity after tracking begins", () => {
        const weeks = [
            reportWeek("2026-08-10", 3600, 0), reportWeek("2026-08-17", 3600, 1800),
            reportWeek("2026-08-31", 3600, 0), reportWeek("2026-10-05", 3600, 3600),
        ];
        const history = getEligibleHistory(weeks, period, "Europe/Warsaw");
        expect(history.map(week => week.startDate.slice(0, 10))).toEqual(["2026-08-17", "2026-08-31"]);
        const trend = getRecentTrend(history, 1, period, "Europe/Warsaw");
        expect(trend[0].actual).toBeNull();
        expect(trend[1].actual).toBe(1800);
        expect(trend[2].actual).toBeNull(); // Missing/off week is not a zero.
        expect(trend[3].actual).toBe(0);
    });

    it("compares actual time to the weekly overrides using the same four-week sample", () => {
        const weeks = [
            reportWeek("2026-09-07", 3600, 0), reportWeek("2026-09-14", 7200, 3600),
            reportWeek("2026-09-21", 0, 3600), reportWeek("2026-09-28", 3600, 3600),
        ];
        const [row] = getPlanRealism(weeks, [currentItem]);
        expect(row).toMatchObject({planned: 3600, actual: 2700, difference: -900, count: 4, enoughHistory: true, above: 1, below: 2});
    });

    it("does not infer a pattern from fewer than four weeks or count missing items as zero", () => {
        const weeks = [reportWeek("2026-09-21", 3600, 3600), {...reportWeek("2026-09-28", 3600, 0), items: []}];
        expect(getPlanRealism(weeks, [currentItem])[0]).toMatchObject({count: 1, enoughHistory: false});
        expect(getEligibleHistory([reportWeek("2026-09-28", 3600, 0)], period, "Europe/Warsaw")).toEqual([]);
        expect(getEligibleHistory(null, period, "Europe/Warsaw")).toEqual([]);
    });
});

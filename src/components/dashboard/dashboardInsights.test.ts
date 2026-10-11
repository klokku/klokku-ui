import {describe, expect, it} from "vitest";
import {PlanItemStats, ReportItem, StatsSummary, WeeklyPlanItem, WeeklyReportEntry} from "@/api/types.ts";
import {balanceLabel, getAllocationModel, getBudgetBalances, getBudgetColor, getEligibleHistory, getPlanRealism, getRecentTrend, getTodayBreakdown, getWeeklyCompletion, getWeeklyRhythm} from "@/components/dashboard/dashboardInsights.ts";
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

describe("weekly allocation comparison", () => {
    it("uses one grouping for both donuts and reconciles tracked time outside the plan", () => {
        const items = Array.from({length: 7}, (_, index) => ({...currentItem, budgetItemId: index + 1, position: index}));
        const stats = summary([itemStats(1, 3600, 7200), itemStats(3, 3600, 1800), itemStats(99, 0, 600)]);
        stats.totalTime = 9900;
        const grouped = getAllocationModel(items, stats, false);
        const expanded = getAllocationModel(items, stats, true);
        expect(grouped.rows).toHaveLength(8);
        expect(grouped.rows.find(row => row.kind === "remaining")).toMatchObject({name: "Remaining budgets (1)", planned: 3600, actual: 0});
        expect(grouped.rows[grouped.rows.length - 1]).toMatchObject({kind: "outside", name: "Outside this plan", planned: 0, actual: 900});
        expect(grouped).toMatchObject({plannedTotal: 25200, actualTotal: 9900});
        expect(grouped.rows.reduce((sum, row) => sum + row.planned, 0)).toBe(25200);
        expect(grouped.rows.reduce((sum, row) => sum + row.actual, 0)).toBe(9900);
        expect(expanded.rows.find(row => row.kind === "outside")).toMatchObject({name: "Outside this plan", planned: 0, actual: 900});
        expect(expanded.rows).toHaveLength(8);
    });

    it("preserves budget colors when inputs are reordered or activity is missing", () => {
        const items = [{...currentItem, color: "#ff0000"}, {...currentItem, budgetItemId: 2, color: ""}];
        const normal = getAllocationModel(items, summary([itemStats(2, 3600, 1800)]), true);
        const reversed = getAllocationModel([...items].reverse(), summary([]), true);
        expect(normal.rows.find(row => row.budgetItemId === 1)?.color).toBe("#ff0000");
        expect(normal.rows.find(row => row.budgetItemId === 2)?.color).toBe(reversed.rows.find(row => row.budgetItemId === 2)?.color);
        expect(getBudgetColor(2, "")).not.toBe(getBudgetColor(3, ""));
    });

    it("has valid zero totals without an invented outside-plan slice", () => {
        expect(getAllocationModel([{...currentItem, weeklyDuration: 0}], summary([]), false)).toMatchObject({plannedTotal: 0, actualTotal: 0});
    });

    it("does not mistake separately truncated seconds for outside-plan activity", () => {
        const stats = summary([itemStats(1, 3600, 3599), itemStats(2, 3600, 1799)]);
        stats.totalTime = 5399;
        const model = getAllocationModel([currentItem, {...currentItem, budgetItemId: 2}], stats, false);
        expect(model.rows.some(row => row.kind === "outside")).toBe(false);
        expect(model.actualTotal).toBe(5398);
    });
});

describe("recently active weekly completion", () => {
    it("represents a running budget outside the plan using its own weekly events and current session", () => {
        const event = {uid: "outside", budgetItemId: 99, summary: "Outside", start: "2026-10-05T10:00:00Z", end: "2026-10-05T11:00:00Z", notes: ""};
        const current = {startTime: "2026-10-05T12:00:00Z", planItem: {budgetItemId: 99, name: "Outside", weeklyDuration: 99999}, notes: ""};
        const rows = getWeeklyCompletion(summary([itemStats(1, 3600, 1800)]), [event], current, period, new Date("2026-10-05T12:30:00Z"));
        expect(rows[0]).toMatchObject({id: 99, name: "Outside", planned: 0, actual: 5400, percent: null, isCurrent: true, outsidePlan: true});
        expect(rows[1]).toMatchObject({id: 1, actual: 1800});
    });

    it("orders unique budgets by latest activity, with the running budget first and zero-safe percentages", () => {
        const stats = summary([itemStats(1, 3600, 10800), itemStats(2, 0, 0), itemStats(3, 0, 1800), itemStats(4, 3600, 0)]);
        const events = [
            {uid: "a", budgetItemId: 1, start: "2026-10-05T08:00:00Z", end: "2026-10-05T09:00:00Z", summary: "", notes: ""},
            {uid: "b", budgetItemId: 1, start: "2026-10-05T09:00:00Z", end: "2026-10-05T10:00:00Z", summary: "", notes: ""},
            {uid: "c", budgetItemId: 3, start: "2026-10-05T10:00:00Z", end: "2026-10-05T11:00:00Z", summary: "", notes: ""},
        ];
        const currentEvent = {startTime: "2026-10-05T12:00:00Z", planItem: {budgetItemId: 2, name: "Current", weeklyDuration: 0}, notes: ""};
        const rows = getWeeklyCompletion(stats, events, currentEvent, period);
        expect(rows.map(row => row.id)).toEqual([2, 3, 1]);
        expect(rows[0]).toMatchObject({percent: null, isCurrent: true});
        expect(rows[1]).toMatchObject({percent: null, actual: 1800});
        expect(rows[2]).toMatchObject({percent: 300});
    });

    it("clips synthesized outside-plan activity to the profile's current week", () => {
        const monday = getDashboardPeriod(new Date("2026-10-05T01:00:00Z"), "UTC", "monday");
        const current = {startTime: "2026-10-04T23:00:00Z", planItem: {budgetItemId: 99, name: "Outside", weeklyDuration: 0}, notes: ""};
        expect(getWeeklyCompletion(summary([]), [], current, monday, new Date("2026-10-05T01:00:00Z"))[0].actual).toBe(3600);
        const completed = {uid: "crossing", budgetItemId: 99, summary: "Outside", start: "2026-10-04T23:00:00Z", end: "2026-10-05T00:30:00Z", notes: ""};
        const restarted = {...current, startTime: "2026-10-05T00:30:00Z"};
        expect(getWeeklyCompletion(summary([]), [completed], restarted, monday, new Date("2026-10-05T01:00:00Z"))[0].actual).toBe(3600);
    });
});

describe("today's compact breakdown", () => {
    it("uses the profile date, sorts by duration and keeps same-name budgets separate", () => {
        const stats = summary([]);
        stats.perDay = [{date: "2026-10-09T22:00:00Z", totalTime: 5400, perPlanItem: [itemStats(1, 3600, 1800), itemStats(2, 3600, 3600), itemStats(3, 3600, 0)]}];
        const today = getTodayBreakdown(stats, period, "Europe/Warsaw", 1);
        expect(today.total).toBe(5400);
        expect(today.rows.map(row => row.id)).toEqual([2, 1]);
        expect(today.rows[0].share).toBeCloseTo(66.6667);
        expect(today.rows[1]).toMatchObject({actual: 1800, isCurrent: true});
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

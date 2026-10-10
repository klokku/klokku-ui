import {StatsSummary, WeeklyPlanItem, WeeklyReportEntry} from "@/api/types.ts";
import {DashboardPeriod, dateKeyInTimezone, formatDashboardDate, getDashboardPeriod, shiftDateKey} from "@/lib/dashboardDates.ts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";

export function balanceLabel(difference: number): string {
    if (Math.abs(difference) < 60) return "At allocation";
    return `${formatSecondsToDuration(Math.abs(difference))} ${difference > 0 ? "over allocation" : "remaining"}`;
}

export function getBudgetBalances(stats?: StatsSummary | null) {
    return (stats?.perPlanItem ?? []).map(({planItem, duration}) => ({
        id: planItem.budgetItemId,
        name: planItem.name,
        color: planItem.color,
        planned: planItem.weeklyItemDuration,
        actual: duration,
        difference: duration - planItem.weeklyItemDuration,
        position: planItem.position,
    })).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference) || a.position - b.position);
}

export function getWeeklyRhythm(stats: StatsSummary | null | undefined, period: DashboardPeriod, timezone: string) {
    const daysByKey = new Map((stats?.perDay ?? []).map(day => [dateKeyInTimezone(day.date, timezone), day]));
    return Array.from({length: 7}, (_, index) => {
        const dateKey = shiftDateKey(period.weekStartKey, index);
        const day = daysByKey.get(dateKey);
        const upcoming = dateKey > period.todayKey;
        const budgets = Object.fromEntries((day?.perPlanItem ?? []).map(item => [
            `budget_${item.planItem.budgetItemId}`, upcoming ? null : item.duration,
        ]));
        return {
            ...budgets,
            dayIndex: index,
            dateKey,
            label: formatDashboardDate(dateKey, timezone, "EEE"),
            today: dateKey === period.todayKey,
            upcoming,
            total: upcoming ? null : day?.totalTime ?? null,
        };
    });
}

export function getEligibleHistory(weeks: WeeklyReportEntry[] | null | undefined, period: DashboardPeriod, timezone: string, firstTrackedAt?: string) {
    const completed = (weeks ?? []).filter(week => {
        const key = dateKeyInTimezone(week.startDate, timezone);
        return key >= period.historyStartKey && key < period.weekStartKey;
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
    if (firstTrackedAt) {
        const firstWeek = getDashboardPeriod(new Date(firstTrackedAt), timezone, period.weekStartDay).weekStartKey;
        return completed.filter(week => dateKeyInTimezone(week.startDate, timezone) >= firstWeek);
    }
    // Older backends do not expose the first tracked date outside this period.
    const firstTracked = completed.findIndex(week => week.items.some(item => item.actualTime > 0));
    return firstTracked === -1 ? [] : completed.slice(firstTracked);
}

export function getRecentTrend(weeks: WeeklyReportEntry[], budgetItemId: number | undefined, period: DashboardPeriod, timezone: string) {
    const weeksByKey = new Map(weeks.map(week => [dateKeyInTimezone(week.startDate, timezone), week]));
    return period.historyWeekKeys.map(dateKey => {
        const item = weeksByKey.get(dateKey)?.items.find(item => item.budgetItemId === budgetItemId);
        return {
            dateKey,
            label: formatDashboardDate(dateKey, timezone),
            planned: item?.weeklyPlanTime ?? null,
            actual: item?.actualTime ?? null,
        };
    });
}

export function getPlanRealism(weeks: WeeklyReportEntry[], currentItems: WeeklyPlanItem[]) {
    return currentItems.map(item => {
        const samples = weeks.flatMap(week => {
            const entry = week.items.find(entry => entry.budgetItemId === item.budgetItemId);
            return entry ? [entry] : [];
        });
        const count = samples.length;
        const planned = count ? samples.reduce((sum, entry) => sum + entry.weeklyPlanTime, 0) / count : 0;
        const actual = count ? samples.reduce((sum, entry) => sum + entry.actualTime, 0) / count : 0;
        return {
            id: item.budgetItemId,
            name: item.name,
            color: item.color,
            position: item.position,
            count,
            enoughHistory: count >= 4,
            planned,
            actual,
            difference: actual - planned,
            above: samples.filter(entry => entry.actualTime - entry.weeklyPlanTime >= 60).length,
            below: samples.filter(entry => entry.weeklyPlanTime - entry.actualTime >= 60).length,
        };
    }).sort((a, b) => Number(b.enoughHistory) - Number(a.enoughHistory)
        || Math.abs(b.difference) - Math.abs(a.difference) || a.position - b.position);
}

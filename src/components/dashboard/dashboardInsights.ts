import {CalendarEvent, CurrentEvent, StatsSummary, WeeklyPlanItem, WeeklyReportEntry} from "@/api/types.ts";
import {DashboardPeriod, dateKeyInTimezone, formatDashboardDate, getDashboardPeriod, shiftDateKey} from "@/lib/dashboardDates.ts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";

export function getBudgetColor(id: number, color?: string): string {
    return color || `hsl(${Math.round(id * 137.508) % 360} 55% 45%)`;
}

export interface AllocationRow {
    key: string;
    kind: "budget" | "outside" | "remaining";
    budgetItemId?: number;
    name: string;
    color: string;
    planned: number;
    actual: number;
    position: number;
}

export function getAllocationModel(items: WeeklyPlanItem[], stats: StatsSummary | null | undefined, showAll: boolean) {
    const actualById = new Map((stats?.perPlanItem ?? []).map(item => [item.planItem.budgetItemId, item.duration]));
    const budgetRows: AllocationRow[] = items.map(item => ({
        key: `budget_${item.budgetItemId}`, kind: "budget", budgetItemId: item.budgetItemId,
        name: item.name, color: getBudgetColor(item.budgetItemId, item.color),
        planned: item.weeklyDuration, actual: actualById.get(item.budgetItemId) ?? 0, position: item.position,
    }));
    const unmatched = Math.max(0, (stats?.totalTime ?? 0) - budgetRows.reduce((sum, row) => sum + row.actual, 0));
    // The API truncates each duration to seconds separately from the grand total.
    const outside = unmatched > (stats?.perPlanItem?.length ?? 0) ? unmatched : 0;
    const outsideRows: AllocationRow[] = outside > 0 ? [{
        key: "outside_plan", kind: "outside", name: "Outside this plan", color: "#64748b",
        planned: 0, actual: outside, position: Number.MAX_SAFE_INTEGER,
    }] : [];
    budgetRows.sort((a, b) => (b.planned + b.actual) - (a.planned + a.actual) || a.position - b.position || a.key.localeCompare(b.key));
    const plannedTotal = budgetRows.reduce((sum, row) => sum + row.planned, 0);
    const actualTotal = budgetRows.reduce((sum, row) => sum + row.actual, 0) + outside;
    let rows = budgetRows;
    if (!showAll && budgetRows.length > 6) {
        const remainder = budgetRows.slice(6);
        rows = [...budgetRows.slice(0, 6), {
            key: "remaining_budgets", kind: "remaining", name: `Remaining budgets (${remainder.length})`, color: "#94a3b8",
            planned: remainder.reduce((sum, row) => sum + row.planned, 0),
            actual: remainder.reduce((sum, row) => sum + row.actual, 0), position: Number.MAX_SAFE_INTEGER,
        }];
    }
    return {rows: [...rows, ...outsideRows], plannedTotal, actualTotal, canExpand: budgetRows.length > 6};
}

export function getWeeklyCompletion(stats: StatsSummary | null | undefined, events: CalendarEvent[], currentEvent: CurrentEvent | null | undefined, period: DashboardPeriod, now = new Date()) {
    const latestById = new Map<number, number>();
    for (const event of events) {
        latestById.set(event.budgetItemId, Math.max(latestById.get(event.budgetItemId) ?? 0, new Date(event.end).getTime()));
    }
    const rows = (stats?.perPlanItem ?? []).filter(item => item.duration > 0 || item.planItem.budgetItemId === currentEvent?.planItem.budgetItemId)
        .map(({planItem, duration}) => ({
            id: planItem.budgetItemId, name: planItem.name, color: getBudgetColor(planItem.budgetItemId, planItem.color),
            planned: planItem.weeklyItemDuration, actual: duration,
            percent: planItem.weeklyItemDuration > 0 ? Math.round(duration / planItem.weeklyItemDuration * 100) : null,
            isCurrent: planItem.budgetItemId === currentEvent?.planItem.budgetItemId,
            lastActive: latestById.get(planItem.budgetItemId) ?? 0,
            position: planItem.position,
            outsidePlan: false,
        }));
    if (currentEvent && !rows.some(row => row.id === currentEvent.planItem.budgetItemId)) {
        const id = currentEvent.planItem.budgetItemId;
        const weekStart = period.weekStart.getTime();
        const weekEnd = period.weekEnd.getTime() + 1;
        const overlap = (start: number, end: number) => Math.max(0, (Math.min(end, weekEnd) - Math.max(start, weekStart)) / 1000);
        const completed = events.filter(event => event.budgetItemId === id)
            .reduce((sum, event) => sum + overlap(new Date(event.start).getTime(), new Date(event.end).getTime()), 0);
        const running = overlap(new Date(currentEvent.startTime).getTime(), now.getTime());
        rows.push({id, name: currentEvent.planItem.name, color: getBudgetColor(id), planned: 0, actual: Math.floor(completed + running),
            percent: null, isCurrent: true, lastActive: now.getTime(), position: Number.MAX_SAFE_INTEGER, outsidePlan: true});
    }
    return rows.sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent) || b.lastActive - a.lastActive || a.position - b.position || a.id - b.id).slice(0, 5);
}

export function getTodayBreakdown(stats: StatsSummary | null | undefined, period: DashboardPeriod, timezone: string, currentBudgetId?: number) {
    const day = stats?.perDay?.find(day => dateKeyInTimezone(day.date, timezone) === period.todayKey);
    const active = (day?.perPlanItem ?? []).filter(item => item.duration > 0);
    const total = active.reduce((sum, item) => sum + item.duration, 0);
    const rows = active.map(({planItem, duration}) => ({
        id: planItem.budgetItemId, name: planItem.name, color: getBudgetColor(planItem.budgetItemId, planItem.color),
        actual: duration, share: total > 0 ? duration / total * 100 : 0,
        isCurrent: planItem.budgetItemId === currentBudgetId, position: planItem.position,
    })).sort((a, b) => b.actual - a.actual || a.position - b.position || a.id - b.id);
    return {rows, total};
}

export function balanceLabel(difference: number): string {
    if (Math.abs(difference) < 60) return "At allocation";
    return `${formatSecondsToDuration(Math.abs(difference))} ${difference > 0 ? "over allocation" : "remaining"}`;
}

export function getBudgetBalances(stats?: StatsSummary | null) {
    return (stats?.perPlanItem ?? []).map(({planItem, duration}) => ({
        id: planItem.budgetItemId,
        name: planItem.name,
        color: getBudgetColor(planItem.budgetItemId, planItem.color),
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
            color: getBudgetColor(item.budgetItemId, item.color),
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

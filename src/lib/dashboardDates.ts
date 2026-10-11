import {formatInTimeZone, fromZonedTime} from "date-fns-tz";
import {ProfileSettings} from "@/api/types.ts";

export function dateKeyInTimezone(date: Date | string, timezone: string): string {
    return formatInTimeZone(date, timezone, "yyyy-MM-dd");
}

export function shiftDateKey(dateKey: string, days: number): string {
    const date = new Date(`${dateKey}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}

export function zonedMidnight(dateKey: string, timezone: string): Date {
    return fromZonedTime(`${dateKey}T00:00:00`, timezone);
}

export function getDashboardPeriod(now: Date, timezone: string, weekStartDay: ProfileSettings["weekStartDay"]) {
    const todayKey = dateKeyInTimezone(now, timezone);
    const weekday = new Date(`${todayKey}T12:00:00Z`).getUTCDay();
    const offset = (weekday - (weekStartDay === "monday" ? 1 : 0) + 7) % 7;
    const weekStartKey = shiftDateKey(todayKey, -offset);
    const historyStartKey = shiftDateKey(weekStartKey, -8 * 7);
    const historyEndKey = shiftDateKey(weekStartKey, -1);

    return {
        weekStartDay,
        todayKey,
        weekStartKey,
        weekStart: zonedMidnight(weekStartKey, timezone),
        weekEnd: new Date(zonedMidnight(shiftDateKey(weekStartKey, 7), timezone).getTime() - 1),
        historyStartKey,
        historyEndKey,
        historyFrom: zonedMidnight(historyStartKey, timezone),
        historyTo: new Date(zonedMidnight(weekStartKey, timezone).getTime() - 1),
        historyWeekKeys: Array.from({length: 8}, (_, index) => shiftDateKey(historyStartKey, index * 7)),
    };
}

export type DashboardPeriod = ReturnType<typeof getDashboardPeriod>;

export function formatDashboardDate(dateKey: string, timezone: string, pattern = "MMM d"): string {
    return formatInTimeZone(zonedMidnight(dateKey, timezone), timezone, pattern);
}

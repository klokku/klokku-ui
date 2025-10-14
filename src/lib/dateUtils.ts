import {formatDate, intervalToDuration} from "date-fns";

export function getCurrentWeekFirstDay(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay(); // Sunday - Saturday: 0 - 6

    // Calculate the offset to the nearest Monday
    const offset = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek;

    // Apply the offset to get the Monday of the current week
    const monday = new Date(now);
    monday.setDate(now.getDate() + offset);
    monday.setHours(0, 0, 0, 0);

    return monday;
}

export function weekEndDay(weekStartDay: Date): Date {
    return new Date(weekStartDay.getTime() -1 + 7 * 24 * 60 * 60 * 1000)
}

export function nextWeekStart(weekStartDay: Date): Date {
    return new Date(weekStartDay.getTime() + 7 * 24 * 60 * 60 * 1000)
}

export function previousWeekStart(weekStartDay: Date): Date {
    return new Date(weekStartDay.getTime() - 7 * 24 * 60 * 60 * 1000)
}

export function formatSecondsToDuration(seconds?: number): string {
    if (seconds === undefined) {
        return "";
    }

    if (seconds === 0) {
        return "0h 0m";
    }

    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const duration = intervalToDuration({ start: 0, end: absSeconds * 1000 });
    const days = duration.days ? duration.days : 0;
    const hours = duration.hours ? duration.hours : 0;
    const minutes = duration.minutes ? duration.minutes : 0;
    const result = `${days * 24 + hours}h ${minutes}m`;

    return isNegative ? `-${result}` : result;
}

export function durationToSeconds(duration?: string): number | undefined {
    if (duration === undefined) {
        return undefined;
    }
    const [hours, minutes] = duration.replace("s", "").replace("m", "").split("h").map(Number);
    return hours * 60 * 60 + minutes * 60;
}

export function formatEventDuration(event?: {startTime: string, endTime?: string}): string {
    if (!event) return ""
    const start = new Date(event.startTime)
    const end = event.endTime ? new Date(event.endTime) : new Date()
    const diffInSec = (end.getTime() - start.getTime()) / 1000
    return formatSecondsToDuration(diffInSec)
}

export function toServerFormat(date: Date): string {
    return formatDate(date, "yyyy-MM-dd'T'HH:mm:ssXXX")
}

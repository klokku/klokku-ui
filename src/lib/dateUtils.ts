import {formatDate, intervalToDuration} from "date-fns";
import parseDuration from "parse-duration";

export function getCurrentWeekFirstDay(firstDayOfAWeek: "monday" | "sunday"): Date {
    return weekStartDay(new Date(), firstDayOfAWeek);
}

export function weekStartDay(date: Date, firstDayOfAWeek: "monday" | "sunday"): Date {
    const dayOfWeek = date.getDay(); // Sunday - Saturday: 0 - 6

    // Calculate the offset to the nearest Monday/Sunday
    const desiredStart = firstDayOfAWeek === "monday" ? 1 : 0;
    const offset = -((dayOfWeek - desiredStart + 7) % 7);

    // Apply the offset to get the Monday/Sunday of the current week
    const firstDay = new Date(date);
    firstDay.setDate(date.getDate() + offset);
    firstDay.setHours(0, 0, 0, 0);

    return firstDay;
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

export function formatSecondsToDuration(seconds?: number, absolute: boolean = false): string {
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

    return isNegative && !absolute ? `-${result}` : result;
}

export function durationToSeconds(duration?: string): number | undefined {
    if (duration === undefined) {
        return undefined;
    }
    const [hours, minutes] = duration.replace("s", "").replace("m", "").split("h").map(Number);
    return hours * 60 * 60 + minutes * 60;
}

/**
 * Parses duration input with support for absolute and relative formats.
 * Supports:
 * - "5h 30m" - absolute duration
 * - "+3h20m" - add to base duration
 * - "+80m" - add minutes to base duration
 * - "-2h20m" - subtract from base duration
 *
 * @param input The duration string to parse
 * @param baseDurationSeconds The base duration in seconds (for relative calculations)
 * @returns The calculated duration in seconds, or undefined if parsing fails. Never returns negative values.
 */
export function parseDurationInput(input?: string, baseDurationSeconds?: number): number | undefined {
    if (!input || input.trim() === "") {
        return undefined;
    }

    const trimmed = input.trim();
    const isRelative = trimmed.startsWith('+') || trimmed.startsWith('-');

    if (isRelative) {
        const isAddition = trimmed.startsWith('+');
        const durationStr = trimmed.substring(1); // Remove the +/- prefix
        const milliseconds = parseDuration(durationStr);

        if (milliseconds === null || milliseconds === undefined) {
            return undefined;
        }

        const deltaSeconds = Math.floor(milliseconds / 1000);
        const base = baseDurationSeconds || 0;
        const result = isAddition ? base + deltaSeconds : base - deltaSeconds;

        // Never return negative values
        return Math.max(0, result);
    } else {
        // Absolute duration
        const milliseconds = parseDuration(trimmed);

        if (milliseconds === null || milliseconds === undefined) {
            return undefined;
        }

        return Math.max(0, Math.floor(milliseconds / 1000));
    }
}

export function formatEventDuration(event?: {start: string, end?: string}): string {
    if (!event) return ""
    const start = new Date(event.start)
    const end = event.end ? new Date(event.end) : new Date()
    const diffInSec = (end.getTime() - start.getTime()) / 1000
    return formatSecondsToDuration(diffInSec)
}

export function toServerFormat(date: Date): string {
    return formatDate(date, "yyyy-MM-dd'T'HH:mm:ssXXX")
}

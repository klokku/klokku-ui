import {fromZonedTime} from "date-fns-tz";

export interface WallTime {
    year: number;
    month: number;
    day: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
}

export function getWallTime(value: Date, timezone: string): WallTime {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone, calendar: "gregory", numberingSystem: "latn", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(value);
    const field = (name: string) => Number(parts.find(part => part.type === name)?.value);
    return {year: field("year"), month: field("month"), day: field("day"), hours: field("hour"), minutes: field("minute"), seconds: field("second"), milliseconds: value.getUTCMilliseconds()};
}

function wallMilliseconds(value: WallTime) {
    return Date.UTC(value.year, value.month - 1, value.day, value.hours, value.minutes, value.seconds, value.milliseconds);
}

export function resolveWallTime(requested: WallTime, original: Date, timezone: string): Date | null {
    const matches = (value: Date) => wallMilliseconds(getWallTime(value, timezone)) === wallMilliseconds(requested);
    // Keep the existing autumn occurrence when a relative edit still matches.
    const relative = new Date(original.getTime() + wallMilliseconds(requested) - wallMilliseconds(getWallTime(original, timezone)));
    if (matches(relative)) return relative;
    const pad = (value: number, length = 2) => String(value).padStart(length, "0");
    const wallString = `${pad(requested.year, 4)}-${pad(requested.month)}-${pad(requested.day)}T${pad(requested.hours)}:${pad(requested.minutes)}:${pad(requested.seconds)}.${pad(requested.milliseconds, 3)}`;
    const resolved = fromZonedTime(wallString, timezone);
    return matches(resolved) ? resolved : null;
}

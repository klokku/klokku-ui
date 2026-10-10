import {describe, expect, it, vi} from "vitest";
import {newEventDefaults} from "@/pages/calendar/newEventDefaults.ts";

describe("new calendar event defaults", () => {
    it.each([0, 29, 30, 59])("uses midnight to 01:00 when the current time is 00:%i", (minute) => {
        expect(newEventDefaults({
            type: "timeGridDay",
            activeStart: new Date(2026, 0, 1),
            activeEnd: new Date(2026, 0, 2),
        }, new Date(2026, 9, 10, 0, minute))).toEqual({
            startDate: new Date(2026, 0, 1, 0, 0),
            endDate: new Date(2026, 0, 1, 1, 0),
        });
    });

    it("uses today when it belongs to the displayed week", () => {
        expect(newEventDefaults({
            type: "timeGridWeek",
            activeStart: new Date(2026, 9, 5),
            activeEnd: new Date(2026, 9, 12),
        }, new Date(2026, 9, 10, 14, 47))).toEqual({
            startDate: new Date(2026, 9, 10, 13, 30),
            endDate: new Date(2026, 9, 10, 14, 30),
        });
    });

    it("uses the displayed day rather than today and rounds the end time down", () => {
        expect(newEventDefaults({
            type: "timeGridDay",
            activeStart: new Date(2026, 9, 7),
            activeEnd: new Date(2026, 9, 8),
        }, new Date(2026, 9, 10, 14, 47, 53))).toEqual({
            startDate: new Date(2026, 9, 7, 13, 30),
            endDate: new Date(2026, 9, 7, 14, 30),
        });
    });

    it.each([
        {name: "a future day", type: "timeGridDay", start: new Date(2026, 9, 14), end: new Date(2026, 9, 15)},
        {name: "a past Monday-first week", type: "timeGridWeek", start: new Date(2026, 8, 28), end: new Date(2026, 9, 5)},
        {name: "a future Sunday-first week", type: "timeGridWeek", start: new Date(2026, 9, 11), end: new Date(2026, 9, 18)},
        {name: "a week spanning the new year", type: "timeGridWeek", start: new Date(2025, 11, 29), end: new Date(2026, 0, 5)},
    ])("uses the first displayed day for $name", ({type, start, end}) => {
        const defaults = newEventDefaults({type, activeStart: start, activeEnd: end}, new Date(2026, 9, 10, 14, 47));

        expect(defaults.startDate.toLocaleDateString()).toBe(start.toLocaleDateString());
        expect(defaults.endDate.toLocaleDateString()).toBe(start.toLocaleDateString());
    });

    it("includes the start of a Sunday-first week", () => {
        expect(newEventDefaults({
            type: "timeGridWeek",
            activeStart: new Date(2026, 9, 11),
            activeEnd: new Date(2026, 9, 18),
        }, new Date(2026, 9, 11, 0, 0))).toEqual({
            startDate: new Date(2026, 9, 11, 0, 0),
            endDate: new Date(2026, 9, 11, 1, 0),
        });
    });

    it("excludes today when it is exactly at the end of the displayed week", () => {
        expect(newEventDefaults({
            type: "timeGridWeek",
            activeStart: new Date(2026, 9, 5),
            activeEnd: new Date(2026, 9, 12),
        }, new Date(2026, 9, 12, 0, 0))).toEqual({
            startDate: new Date(2026, 9, 5, 0, 0),
            endDate: new Date(2026, 9, 5, 1, 0),
        });
    });

    it("keeps a one-hour duration and the local date across the spring clock change", () => {
        vi.stubEnv("TZ", "Europe/Warsaw");
        try {
            expect(newEventDefaults({
                type: "timeGridDay",
                activeStart: new Date(2026, 2, 29),
                activeEnd: new Date(2026, 2, 30),
            }, new Date(2026, 9, 10, 3, 47))).toEqual({
                startDate: new Date("2026-03-29T01:30:00+01:00"),
                endDate: new Date("2026-03-29T03:30:00+02:00"),
            });
        } finally {
            vi.unstubAllEnvs();
        }
    });

    it.each(["timeGridDay", "timeGridWeek"])("preserves the second occurrence of the current time in %s during the autumn clock change", (type) => {
        vi.stubEnv("TZ", "Europe/Warsaw");
        try {
            expect(newEventDefaults({
                type,
                activeStart: new Date(2026, 9, 25),
                activeEnd: new Date(2026, 9, 26),
            }, new Date("2026-10-25T02:47:53.123+01:00"))).toEqual({
                startDate: new Date("2026-10-25T02:30:00+02:00"),
                endDate: new Date("2026-10-25T02:30:00+01:00"),
            });
        } finally {
            vi.unstubAllEnvs();
        }
    });
});

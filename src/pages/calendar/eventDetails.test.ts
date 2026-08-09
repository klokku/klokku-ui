import {describe, expect, it} from "vitest";
import {CalendarEvent} from "@/api/types.ts";
import {
    calendarEventFromEventDetails,
    eventDetailsFromCalendarEvent,
} from "@/pages/calendar/eventDetails.ts";
import {toServerFormat} from "@/lib/dateUtils.ts";

const calendarEvent: CalendarEvent = {
    uid: "event-123",
    summary: "Project work",
    start: "2026-08-09T10:00:00+02:00",
    end: "2026-08-09T11:30:00+02:00",
    notes: "Review the proposal",
    budgetItemId: 42,
};

describe("event details mappings", () => {
    it("maps every editable calendar event field to event details", () => {
        const details = eventDetailsFromCalendarEvent(calendarEvent);

        expect(details).toEqual({
            uid: calendarEvent.uid,
            summary: calendarEvent.summary,
            startDate: new Date(calendarEvent.start),
            endDate: new Date(calendarEvent.end),
            notes: calendarEvent.notes,
            budgetPlanItemId: calendarEvent.budgetItemId,
        });
    });

    it("creates a payload without a UID", () => {
        const startDate = new Date("2026-08-09T08:00:00Z");
        const endDate = new Date("2026-08-09T09:00:00Z");

        const mapped = calendarEventFromEventDetails({
            summary: "Planning",
            startDate,
            endDate,
            notes: "Set priorities",
            budgetPlanItemId: 7,
        });

        expect(mapped).toEqual({
            mode: "create",
            event: {
                summary: "Planning",
                start: toServerFormat(startDate),
                end: toServerFormat(endDate),
                notes: "Set priorities",
                budgetItemId: 7,
            },
        });
        expect(mapped.event).not.toHaveProperty("uid");
    });

    it("creates an update payload with its UID", () => {
        const details = eventDetailsFromCalendarEvent(calendarEvent);

        expect(calendarEventFromEventDetails(details)).toEqual({
            mode: "update",
            event: {
                ...calendarEvent,
                start: toServerFormat(details.startDate),
                end: toServerFormat(details.endDate),
            },
        });
    });

    it("rejects an empty update UID", () => {
        expect(() => calendarEventFromEventDetails({
            ...eventDetailsFromCalendarEvent(calendarEvent),
            uid: "  ",
        })).toThrow("Event UID must not be empty");
    });
});

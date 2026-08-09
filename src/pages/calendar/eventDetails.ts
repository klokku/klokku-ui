import {CalendarEvent} from "@/api/types.ts";
import {toServerFormat} from "@/lib/dateUtils.ts";

export type EventDetails = {
    uid?: string;
    summary?: string;
    startDate: Date;
    endDate: Date;
    budgetPlanItemId?: number;
    notes?: string;
}

type NewCalendarEvent = Omit<CalendarEvent, "uid">;

export type MappedCalendarEvent =
    | {mode: "create"; event: NewCalendarEvent}
    | {mode: "update"; event: CalendarEvent};

export function eventDetailsFromCalendarEvent(event: CalendarEvent): EventDetails {
    return {
        uid: event.uid,
        summary: event.summary,
        startDate: new Date(event.start),
        endDate: new Date(event.end),
        budgetPlanItemId: event.budgetItemId,
        notes: event.notes,
    };
}

export function calendarEventFromEventDetails(details: EventDetails): MappedCalendarEvent {
    if (!details.summary) {
        throw new Error("Event summary is required");
    }
    if (details.budgetPlanItemId == null) {
        throw new Error("Event budget item is required");
    }

    const event: NewCalendarEvent = {
        summary: details.summary,
        start: toServerFormat(details.startDate),
        end: toServerFormat(details.endDate),
        notes: details.notes ?? "",
        budgetItemId: details.budgetPlanItemId,
    };

    if (details.uid == null) {
        return {mode: "create", event};
    }
    if (!details.uid.trim()) {
        throw new Error("Event UID must not be empty");
    }

    return {mode: "update", event: {...event, uid: details.uid}};
}

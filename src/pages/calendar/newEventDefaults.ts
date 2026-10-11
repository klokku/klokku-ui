import type {ViewApi} from "@fullcalendar/core";
import type {EventDetails} from "@/pages/calendar/eventDetails.ts";
import {isSameDay} from "date-fns";

export function newEventDefaults(
    view: Pick<ViewApi, "type" | "activeStart" | "activeEnd">,
    now: Date,
): Pick<EventDetails, "startDate" | "endDate"> {
    const todayIsVisible = now >= view.activeStart && now < view.activeEnd;
    const date = view.type === "timeGridWeek" && todayIsVisible ? now : view.activeStart;
    const endDate = new Date(date);
    if (isSameDay(date, now)) {
        // Round the instant without losing which occurrence of a repeated DST hour it belongs to.
        const remainder = (now.getMinutes() % 30) * 60 * 1000 + now.getSeconds() * 1000 + now.getMilliseconds();
        endDate.setTime(now.getTime() - remainder);
    } else {
        endDate.setHours(now.getHours(), Math.floor(now.getMinutes() / 30) * 30, 0, 0);
    }
    const startDate = new Date(endDate.getTime() - 60 * 60 * 1000);

    if (!isSameDay(startDate, date)) {
        startDate.setTime(date.getTime());
        startDate.setHours(0, 0, 0, 0);
        endDate.setTime(startDate.getTime() + 60 * 60 * 1000);
    }

    return {startDate, endDate};
}

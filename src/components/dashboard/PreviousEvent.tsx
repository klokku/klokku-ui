import {useId, useRef, useState} from "react";
import {ClockIcon, NotebookPenIcon, PencilIcon} from "lucide-react";
import {CalendarEvent, WeeklyPlanItem} from "@/api/types.ts";
import {CalendarMutations} from "@/api/useCalendarMutations.ts";
import {formatEventDuration} from "@/lib/dateUtils.ts";
import {dateKeyInTimezone} from "@/lib/dashboardDates.ts";
import {getBudgetColor} from "@/components/dashboard/dashboardInsights.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {userSettings} from "@/components/settings.ts";
import {EventDetailsPopover} from "@/pages/calendar/EventDetailsPopover.tsx";
import {calendarEventFromEventDetails, EventDetails, eventDetailsFromCalendarEvent} from "@/pages/calendar/eventDetails.ts";

export function PreviousEvent({event, planItem, timezone, actions}: {
    event: CalendarEvent;
    planItem?: WeeklyPlanItem;
    timezone: string;
    actions: CalendarMutations;
}) {
    const [input, setInput] = useState<EventDetails>();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const descriptionId = useId();
    const [position, setPosition] = useState<{x: number, y: number} | null>(null);
    const color = getBudgetColor(event.budgetItemId, planItem?.color);
    const localeTime = (date: string) => new Date(date).toLocaleTimeString(userSettings.locale, {timeZone: timezone, timeStyle: "short"});
    const localeDate = (date: string) => new Date(date).toLocaleDateString(userSettings.locale, {timeZone: timezone, weekday: "short", month: "short", day: "numeric"});
    const sameDay = dateKeyInTimezone(event.start, timezone) === dateKeyInTimezone(event.end, timezone);
    const today = dateKeyInTimezone(event.start, timezone) === dateKeyInTimezone(new Date(), timezone);
    const duration = formatEventDuration(event);
    const timeRange = `${!today || !sameDay ? `${localeDate(event.start)} ` : ""}${localeTime(event.start)} - ${!sameDay ? `${localeDate(event.end)} ` : ""}${localeTime(event.end)}`;

    const save = async (details: EventDetails) => {
        const mapped = calendarEventFromEventDetails(details);
        if (mapped.mode === "update") await actions.modifyEvent({
            ...mapped.event,
            start: details.startDate.getTime() === new Date(event.start).getTime() ? event.start : details.startDate.toISOString(),
            end: details.endDate.getTime() === new Date(event.end).getTime() ? event.end : details.endDate.toISOString(),
        });
        else await actions.createEvent(mapped.event);
        setInput(current => current === input ? undefined : current);
    };
    const remove = async (uid: string) => {
        await actions.deleteEvent(uid);
        setInput(current => current === input ? undefined : current);
    };
    return (
        <div className="relative rounded-md" style={{backgroundColor: `color-mix(in srgb, ${color}, transparent 95%)`}}>
            <span className="absolute inset-y-2 left-2 w-1 rounded-full" style={{backgroundColor: color}} aria-hidden="true"/>
            <span id={descriptionId} className="sr-only">{duration}, {timeRange}{event.notes ? ", has notes" : ""}</span>
            <button ref={buttonRef} type="button" aria-label={`Edit ${event.summary} event`} aria-describedby={descriptionId} data-slot="edit-button"
                    className="w-full rounded-md pl-6 pr-3 py-2 text-left hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring flex items-center justify-between gap-2"
                    onClick={e => {
                        const bounds = e.currentTarget.getBoundingClientRect();
                        setPosition({x: bounds.left, y: bounds.bottom});
                        setInput(eventDetailsFromCalendarEvent(event));
                    }}>
                <span className="min-w-0">
                    <span className="font-semibold text-sm flex flex-wrap gap-2 items-center"><span className="break-words min-w-0">{event.summary}</span><Badge variant="outline">{duration}</Badge>{event.notes && <NotebookPenIcon className="size-3 shrink-0" aria-hidden="true"/>}</span>
                    <span className="text-xs flex gap-2 items-start mt-1 text-muted-foreground"><ClockIcon className="size-3 shrink-0 mt-0.5" aria-hidden="true"/>
                        <span>{timeRange}</span>
                    </span>
                </span>
                <PencilIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true"/>
            </button>
            {input && (
                <EventDetailsPopover open position={position} input={input} onSave={save} onDelete={remove} onOpenChange={open => { if (!open) setInput(undefined); }} returnFocus={() => buttonRef.current?.focus()} timezone={timezone}/>
            )}
        </div>
    );
}

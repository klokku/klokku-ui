import {CalendarEvent, WeeklyPlanItem} from "@/api/types.ts";
import {ClockIcon, EllipsisIcon} from "lucide-react";
import {formatEventDuration, toServerFormat} from "@/lib/dateUtils.ts";
import {isToday} from "date-fns";
import {Badge} from "@/components/ui/badge.tsx";
import {userSettings} from "@/components/settings.ts";
import {EventDetails, EventDetailsPopover} from "@/pages/calendar/EventDetailsPopover.tsx";
import {useState} from "react";
import useCalendar from "@/api/useCalendar.ts";

interface PreviousEventProps {
    event: CalendarEvent;
    planItem?: WeeklyPlanItem;
    className?: string;
}

export function PreviousEvent({event, planItem, className}: PreviousEventProps) {

    const localeTime = (date: string) => new Date(date).toLocaleTimeString(userSettings.locale, {timeStyle: "short"})
    const localeDate = (date: string) => new Date(date).toLocaleDateString(userSettings.locale, {weekday: "short", month: "short", day: "numeric"})

    const {createEvent, modifyEvent, deleteEvent} = useCalendar(new Date(event.start), new Date(event.end));

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [eventDetailsInput, setEventDetailsInput] = useState<EventDetails | null>(null);
    const [eventDetailsPopoverPosition, setEventDetailsPopoverPosition] = useState<{ x: number, y: number } | null>(null);

    const onEventClick = (clickPosition: { x: number, y: number }, event: CalendarEvent) => {
        setEventDetailsInput({
            uid: event.uid,
            budgetPlanItemId: event.budgetItemId,
            startDate: new Date(event.start),
            endDate: new Date(event.end),
            summary: event.summary,
        })
        setEventDetailsPopoverPosition({
            x: clickPosition.x,
            y: clickPosition.y,
        })
        setPopoverOpen(true);
    }

    const handleSave = async (event: EventDetails) => {
        if (event.uid && event.budgetPlanItemId) {
            const updated: CalendarEvent = {
                uid: event.uid,
                summary: event.summary!,
                start: toServerFormat(event.startDate),
                end: toServerFormat(event.endDate),
                budgetItemId: event.budgetPlanItemId,
            };
            await modifyEvent(updated);
        } else {
            const newEvent = {
                summary: event.summary!,
                start: toServerFormat(event.startDate),
                end: toServerFormat(event.endDate),
                budgetItemId: event.budgetPlanItemId!,
            };
            await createEvent(newEvent);
        }
        setPopoverOpen(false);
    };

    const handleDelete = async (eventUid: string) => {
        await deleteEvent(eventUid);
        setPopoverOpen(false);
    };

    return (
        <div
            className={className + " hover:bg-gray-100 p-2 rounded-md cursor-pointer relative pl-6 text-sm " +
                "after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full flex gap-2 justify-between items-center " +
                "after:bg-(--event-color)"}
            style={{
                backgroundColor: `color-mix(in srgb, ${planItem?.color ?? '#000000'}, transparent 95%)`, // 5% opaque
                ['--event-color' as string]: planItem?.color ?? '#000000'
            }}
        >
            <div>
                <div className="font-semibold text-sm flex gap-2 items-center">
                    <div>{event.summary}</div>
                    <div><Badge variant="outline" className="opacity-80">{formatEventDuration(event)}</Badge></div>
                </div>
                <div className="text-xs flex gap-2 items-center mt-1 text-muted-foreground font-semibold">

                    <ClockIcon className="size-3"/>
                    <div className="flex flex-row gap-3">
                        {!isToday(event.start) && (
                            <div>
                                <span>{localeDate(event.start)}</span>
                            </div>
                        )}
                        <div>
                            {localeTime(event.start)} - {localeTime(event.end!)}
                        </div>
                    </div>
                </div>
            </div>
            <div onClick={(e) => onEventClick({x: e.clientX, y: e.clientY}, event)}
                 className="hover:opacity-80 opacity-50 transition-opacity duration-200 cursor-pointer group-hover:opacity-100 pr-3"
                 data-slot="edit-button">
                <EllipsisIcon/>
            </div>
            {eventDetailsInput && (
                <EventDetailsPopover open={popoverOpen}
                                     position={eventDetailsPopoverPosition}
                                     input={eventDetailsInput}
                                     onOpenChange={(open) => {
                                         setPopoverOpen(open);
                                     }}
                                     onSave={handleSave}
                                     onDelete={handleDelete}
                />
            )}
        </div>
    )
}

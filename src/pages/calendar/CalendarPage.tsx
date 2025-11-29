import FullCalendar from "@fullcalendar/react";
import timeGridWeek from "@fullcalendar/timegrid"
import useCalendar from "@/api/useCalendar.ts";
import {useRef, useState} from "react";
import {formatEventDuration, getCurrentWeekFirstDay, toServerFormat, weekEndDay} from "@/lib/dateUtils.ts";
import {CalendarEvent} from "@/api/types.ts";
import interactionPlugin from '@fullcalendar/interaction';
import {userSettings} from "@/components/settings.ts";
import {DateSelectArg, EventChangeArg, EventClickArg} from "@fullcalendar/core";
import useEvents from "@/api/useEvents.ts";
import {EventDetails, EventDetailsPopover} from "@/pages/calendar/EventDetailsPopover.tsx";
import {useIsMobile} from "@/hooks/use-mobile.tsx";

export function CalendarPage() {

    const currentWeekFirstDay = getCurrentWeekFirstDay();
    const lastWeekDay = weekEndDay(currentWeekFirstDay)
    const [calendarStart, setCalendarStart] = useState<Date>(currentWeekFirstDay);
    const [calendarEnd, setCalendarEnd] = useState<Date>(lastWeekDay);
    const [currentViewDate, setCurrentViewDate] = useState<Date>(currentWeekFirstDay); // Track current view date

    const calendarRef = useRef<FullCalendar>(null);

    const {isLoading, events, modifyEvent, createEvent, deleteEvent} = useCalendar(calendarStart, calendarEnd);
    const {currentEvent} = useEvents();

    const isMobile = useIsMobile();

    // Popover editor state
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [eventDetailsInput, setEventDetailsInput] = useState<EventDetails | null>(null);
    const [anchorPos, setAnchorPos] = useState<{ x: number; y: number } | null>(null);

    type UiEvent = {
        id: string,
        title: string,
        start: Date,
        end: Date,
        interactive?: boolean
        display?: string;
        startEditable?: boolean;
        durationEditable?: boolean;
        overlap?: boolean;
        backgroundColor?: string;
        borderColor?: string;
        textColor?: string;
        classNames?: string[];
        extendedProps?: {
            sourceEvent?: CalendarEvent;
        };
    }

    const prepareEvents = (events: CalendarEvent[]): UiEvent[] => {

        const uiEvents = events.map(toUIEvent);

        if (currentEvent) {
            const currentUIEvent = {
                id: "",
                title: currentEvent.budget.name,
                start: new Date(currentEvent.startTime),
                end: new Date(),
                display: "background",
                overlap: false,
            }
            uiEvents.push(currentUIEvent)
        }

        return uiEvents;
    }

    const toUIEvent = (event: CalendarEvent): UiEvent => {
        return {
            id: event.uid,
            title: event.summary + " (" + formatEventDuration({startTime: event.start, endTime: event.end}) + ")" ,
            start: new Date(event.start),
            end: new Date(event.end),
            interactive: true,
            startEditable: true,
            durationEditable: true,
            extendedProps: {
                sourceEvent: event,
            }
        }
    }

    const onUIEventTimeChange = async (info: EventChangeArg) => {
        const eventUid = info.event.id;
        const event = events?.find(e => e.uid == eventUid)
        if (event) {
            event.start = toServerFormat(info.event.start!)
            event.end = toServerFormat(info.event.end!)
            await modifyEvent(event)
        }
    }

    const isAfterCurrentEventStart = (date: Date): boolean => {
        if (!currentEvent) return false;
        const currentEventStart = new Date(currentEvent.startTime)
        return date > currentEventStart;
    }

    const scrollHour = (): string => {
        const now = new Date();
        const scrollHour = now.getHours() - 1;
        return scrollHour.toString().padStart(2, '0');
    }

    const onDateSelected = (select: DateSelectArg) => {
        setEventDetailsInput({
            startDate: select.start,
            endDate: select.end,
        })
        // Position popover near the click position
        const mouse = select.jsEvent as MouseEvent;
        setAnchorPos({x: mouse.clientX, y: mouse.clientY});
        setPopoverOpen(true);
    }

    const onEventClick = (info: EventClickArg) => {
        // Extract original event from extended props
        const source: CalendarEvent = (info.event.extendedProps)?.sourceEvent;
        if (!source) return;
        setEventDetailsInput({
            summary: source.summary,
            startDate: new Date(source.start),
            endDate: new Date(source.end),
            uid: source.uid,
            budgetId: source.budgetId,
        })
        // Position popover near the click position
        const mouse = info.jsEvent as MouseEvent;
        setAnchorPos({x: mouse.clientX, y: mouse.clientY});
        setPopoverOpen(true);
    }

    const closeEditor = () => {
        setPopoverOpen(false);
        setEventDetailsInput(null);
        calendarRef.current?.getApi().unselect();
    };

    const handleSave = async (event: EventDetails) => {
        if (event.uid && event.budgetId) {
            const updated: CalendarEvent = {
                uid: event.uid,
                summary: event.summary!,
                start: toServerFormat(event.startDate),
                end: toServerFormat(event.endDate),
                budgetId: event.budgetId,
            };
            await modifyEvent(updated);
        } else {
            const newEvent = {
                summary: event.summary!,
                start: toServerFormat(event.startDate),
                end: toServerFormat(event.endDate),
                budgetId: event.budgetId!,
            };
            await createEvent(newEvent);
        }
        closeEditor();
    };

    const handleDelete = async (eventUid: string) => {
        await deleteEvent(eventUid);
        closeEditor();
    };

    return (
        <>
            {!isLoading && events && (
                <FullCalendar
                    height="calc(100vh - 120px)"
                    ref={calendarRef}
                    plugins={[timeGridWeek, interactionPlugin]}
                    initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
                    initialDate={currentViewDate}
                    allDaySlot={false}
                    droppable={true}
                    eventClick={onEventClick}

                    events={prepareEvents(events)}
                    editable={true}
                    eventResizableFromStart={true}
                    slotDuration={'00:15:00'}
                    firstDay={1}
                    locale={userSettings.locale}
                    scrollTime={`${scrollHour()}:00:00`} // now minus 2 hours
                    slotLabelFormat={
                        [
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                                omitZeroMinute: false
                            }
                        ]
                    }
                    eventDrop={onUIEventTimeChange}
                    eventResize={onUIEventTimeChange}
                    eventAllow={
                        function (info) {
                            return !isAfterCurrentEventStart(info.end)
                        }
                    }
                    nowIndicator={true}
                    selectable={true}
                    selectMirror={true}
                    selectAllow={
                        function (info) {
                            return !isAfterCurrentEventStart(info.end)
                        }
                    }
                    select={onDateSelected}
                    datesSet={
                        function (datesSet) {
                            setCalendarStart(datesSet.start)
                            setCalendarEnd(datesSet.end)
                            if (isMobile) {
                                setCurrentViewDate(new Date())
                            } else {
                                setCurrentViewDate(datesSet.start)
                            }
                        }
                    }
                    unselectCancel={'.calendar-unselect-cancel'}
                />
            )}
            {eventDetailsInput && (
                <EventDetailsPopover open={popoverOpen}
                                     position={anchorPos}
                                     input={eventDetailsInput}
                                     onOpenChange={(open) => {
                                         setPopoverOpen(open);
                                         if (!open) {
                                             closeEditor()
                                         }
                                     }}
                                     onSave={handleSave}
                                     onDelete={handleDelete}
                />
            )}
        </>
    )
}

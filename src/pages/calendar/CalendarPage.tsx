import FullCalendar from "@fullcalendar/react";
import timeGridWeek from "@fullcalendar/timegrid"
import useCalendar from "@/api/useCalendar.ts";
import {useState} from "react";
import {formatEventDuration, getCurrentWeekFirstDay, toServerFormat, weekEndDay} from "@/lib/dateUtils.ts";
import {CalendarEvent} from "@/api/types.ts";
import interactionPlugin from '@fullcalendar/interaction';
import {defaultSettings, userSettings} from "@/components/settings.ts";
import {DateSelectArg, EventChangeArg, EventClickArg} from "@fullcalendar/core";
import useCurrentEvent from "@/api/useCurrentEvent.ts";
import {EventDetailsPopover} from "@/pages/calendar/EventDetailsPopover.tsx";
import {
    calendarEventFromEventDetails,
    EventDetails,
    eventDetailsFromCalendarEvent,
} from "@/pages/calendar/eventDetails.ts";
import {useIsMobile} from "@/hooks/use-mobile.tsx";
import useProfile from "@/api/useProfile.ts";
import useWeeklyPlan from "@/api/useWeeklyPlan.ts";
import {Button} from "@/components/ui/button.tsx";
import {NotebookPenIcon, PlusIcon} from "lucide-react";
import {newEventDefaults} from "@/pages/calendar/newEventDefaults.ts";

export function CalendarPage() {

    const {currentProfile} = useProfile()
    const isMobile = useIsMobile();
    const weekStartDay = currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay;
    const currentWeekFirstDay = getCurrentWeekFirstDay(weekStartDay);

    const lastWeekDay = weekEndDay(currentWeekFirstDay)
    const [calendarStart, setCalendarStart] = useState<Date>(currentWeekFirstDay);
    const [calendarEnd, setCalendarEnd] = useState<Date>(lastWeekDay);
    const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());

    const [calendar, setCalendar] = useState<FullCalendar | null>(null);

    const {isLoading, events, modifyEvent, createEvent, deleteEvent} = useCalendar(calendarStart, calendarEnd);
    const {currentEvent} = useCurrentEvent();
    const {weeklyPlan} = useWeeklyPlan(currentWeekFirstDay)

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
                title: currentEvent.planItem.name,
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

        const weeklyPlanItem = weeklyPlan?.items.find(item => {return item.budgetItemId === event.budgetItemId})

        return {
            id: event.uid,
            title: event.summary + " (" + formatEventDuration(event) + ")" ,
            start: new Date(event.start),
            end: new Date(event.end),
            interactive: true,
            startEditable: true,
            durationEditable: true,
            extendedProps: {
                sourceEvent: event,
            },
            backgroundColor: weeklyPlanItem?.color,
            borderColor: weeklyPlanItem?.color,
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
        setEventDetailsInput(eventDetailsFromCalendarEvent(source))
        // Position popover near the click position
        const mouse = info.jsEvent as MouseEvent;
        setAnchorPos({x: mouse.clientX, y: mouse.clientY});
        setPopoverOpen(true);
    }

    const closeEditor = () => {
        setPopoverOpen(false);
        setEventDetailsInput(null);
        calendar?.getApi().unselect();
    };

    const onAddEvent = () => {
        if (!calendar) return;

        setEventDetailsInput(newEventDefaults(calendar.getApi().view, new Date()));
        setAnchorPos({x: window.innerWidth / 2, y: window.innerHeight / 2});
        setPopoverOpen(true);
    };

    const handleSave = async (event: EventDetails) => {
        const mapped = calendarEventFromEventDetails(event);
        if (mapped.mode === "update") {
            await modifyEvent(mapped.event);
        } else {
            await createEvent(mapped.event);
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
                    ref={setCalendar}
                    plugins={[timeGridWeek, interactionPlugin]}
                    initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
                    initialDate={currentViewDate}
                    allDaySlot={false}
                    droppable={true}
                    eventClick={onEventClick}

                    events={prepareEvents(events)}
                    eventContent={(arg) => (
                        <>
                            {arg.timeText && <div className="fc-event-time">{arg.timeText}</div>}
                            <div className="fc-event-title fc-sticky flex items-center gap-1">
                                <span>{arg.event.title}</span>
                                {(arg.event.extendedProps?.sourceEvent as CalendarEvent | undefined)?.notes &&
                                    <NotebookPenIcon className="size-3 shrink-0 opacity-80"/>}
                            </div>
                        </>
                    )}
                    editable={true}
                    eventResizableFromStart={true}
                    slotDuration={'00:15:00'}
                    firstDay={weekStartDay === "sunday" ? 0 : 1}
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
                            setCurrentViewDate(datesSet.view.calendar.getDate())
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
            <Button
                size="icon-lg"
                aria-label="Add event"
                disabled={!calendar}
                className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg calendar-unselect-cancel"
                onClick={onAddEvent}
            >
                <PlusIcon/>
            </Button>
        </>
    )
}

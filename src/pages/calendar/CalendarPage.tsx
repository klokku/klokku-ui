import FullCalendar from "@fullcalendar/react";
import timeGridWeek from "@fullcalendar/timegrid"
import useCalendar from "@/api/useCalendar.ts";
import {useEffect, useRef} from "react";
import {getCurrentWeekFirstDay, toServerFormat, weekEndDay} from "@/lib/dateUtils.ts";
import {CalendarEvent} from "@/api/types.ts";
import interactionPlugin from '@fullcalendar/interaction';
import {userSettings} from "@/components/settings.ts";
import {DateSelectArg, EventChangeArg} from "@fullcalendar/core";
import useEvents from "@/api/useEvents.ts";

export function CalendarPage() {
    const calendarRef = useRef<FullCalendar>(null);
    const currentWeekFirstDay = getCurrentWeekFirstDay();
    const lastWeekDay = weekEndDay(currentWeekFirstDay)
    const {isLoading, events, modifyEvent} = useCalendar(currentWeekFirstDay, lastWeekDay);
    const {currentEvent} = useEvents();

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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                calendarRef.current?.getApi().unselect();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);


    const toUIEvent = (event: CalendarEvent): UiEvent => {
        return {
            id: event.uid,
            title: event.summary,
            start: new Date(event.start),
            end: new Date(event.end),
            interactive: true,
            startEditable: true,
            durationEditable: true,
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

    const onDateSelected = (select: DateSelectArg)=> {
        console.log(select)
    }

    // TODO: editing event with changing the budget and time
    // TODO: deleting event
    // TODO: add event create by drag and drop from list of budgets
    return (
        <>
            {!isLoading && events && (
                <FullCalendar
                    ref={calendarRef}
                    plugins={[timeGridWeek, interactionPlugin]}
                    initialView='timeGridWeek'
                    allDaySlot={false}
                    droppable={true}
                    eventClick={function (info) {
                        console.log(info.event.id)
                    }}

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
                    drop={
                        function (info) {
                            console.log(info)
                        }
                    }
                    eventDragStop={
                        function (info) {
                            console.log(info)
                        }
                    }
                    eventDrop={
                        function (info) {
                            onUIEventTimeChange(info)
                        }
                    }
                    eventResize={
                        function (info) {
                            onUIEventTimeChange(info)
                        }
                    }
                    eventAllow={
                        function (info){
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
                />
            )}
        </>
    )
}

import FullCalendar from "@fullcalendar/react";
import timeGridWeek from "@fullcalendar/timegrid"
import useCalendar from "@/api/useCalendar.ts";
import {useEffect, useRef, useState} from "react";
import {getCurrentWeekFirstDay, toServerFormat, weekEndDay} from "@/lib/dateUtils.ts";
import {CalendarEvent} from "@/api/types.ts";
import interactionPlugin from '@fullcalendar/interaction';
import {userSettings} from "@/components/settings.ts";
import {DateSelectArg, EventChangeArg, EventClickArg} from "@fullcalendar/core";
import useEvents from "@/api/useEvents.ts";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useBudget from "@/api/useBudgets";

export function CalendarPage() {

    const currentWeekFirstDay = getCurrentWeekFirstDay();
    const lastWeekDay = weekEndDay(currentWeekFirstDay)
    const [calendarStart, setCalendarStart] = useState<Date>(currentWeekFirstDay);
    const [calendarEnd, setCalendarEnd] = useState<Date>(lastWeekDay);

    const calendarRef = useRef<FullCalendar>(null);

    const {isLoading, events, modifyEvent, createEvent, deleteEvent} = useCalendar(calendarStart, calendarEnd);
    const {currentEvent} = useEvents();

    // Budgets for re-linking
    const { budgets } = useBudget(false);

    // Popover editor state
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [anchorPos, setAnchorPos] = useState<{ x: number; y: number } | null>(null);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [selectedBudgetId, setSelectedBudgetId] = useState<number | undefined>();

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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                calendarRef.current?.getApi().unselect();
                setPopoverOpen(false);
                setEditingEvent(null);
                setIsCreateMode(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Auto-select first budget when creating and none selected yet
    useEffect(() => {
        if (isCreateMode && !selectedBudgetId && budgets && budgets.length > 0) {
            const firstBudgetId = budgets.find((b) => b.id != null)?.id;
            if (firstBudgetId) setSelectedBudgetId(firstBudgetId);
        }
    }, [isCreateMode, selectedBudgetId, budgets]);


    const toUIEvent = (event: CalendarEvent): UiEvent => {
        return {
            id: event.uid,
            title: event.summary,
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

    const onDateSelected = (select: DateSelectArg)=> {
        // Open popover in create mode with selected range
        setIsCreateMode(true);
        setEditingEvent(null);
        setStartDate(select.start);
        setEndDate(select.end ?? new Date(select.start.getTime() + 15 * 60 * 1000));
        // default to first available budget if any
        const firstBudgetId = budgets?.find((b) => b.id != null)?.id;
        setSelectedBudgetId(firstBudgetId);
        // anchor to a sensible position near the top-center if mouse position isn't available
        setAnchorPos({ x: Math.round(window.innerWidth / 2), y: Math.round(window.innerHeight / 3) });
        setPopoverOpen(true);
    }

    const onEventClick = (info: EventClickArg) => {
        // Extract original event from extended props
        const source: CalendarEvent | undefined = (info.event.extendedProps)?.sourceEvent;
        if (!source) return;
        setIsCreateMode(false);
        setEditingEvent(source);
        setStartDate(new Date(source.start));
        setEndDate(new Date(source.end));
        setSelectedBudgetId(source.budgetId);
        // Position popover near the click position
        const mouse = info.jsEvent as MouseEvent;
        setAnchorPos({ x: mouse.clientX, y: mouse.clientY });
        setPopoverOpen(true);
    }

    const closeEditor = () => {
        setPopoverOpen(false);
        setEditingEvent(null);
        setIsCreateMode(false);
        calendarRef.current?.getApi().unselect();
    };

    const handleSave = async () => {
        if (!startDate || !endDate || !selectedBudgetId) return;
        if (endDate <= startDate) {
            // Minimal validation feedback
            alert("End time must be after start time");
            return;
        }
        if (editingEvent && !isCreateMode) {
            const updated: CalendarEvent = {
                ...editingEvent,
                start: toServerFormat(startDate),
                end: toServerFormat(endDate),
                budgetId: selectedBudgetId,
            };
            await modifyEvent(updated);
        } else {
            const budgetName = budgets?.find((b) => b.id === selectedBudgetId)?.name ?? 'Event';
            const newEvent = {
                summary: budgetName,
                start: toServerFormat(startDate),
                end: toServerFormat(endDate),
                budgetId: selectedBudgetId,
            };
            // create a new event
            await createEvent(newEvent);
        }
        closeEditor();
    };

    const handleDelete = async () => {
        if (!editingEvent) return;
        await deleteEvent(editingEvent);
        closeEditor();
    };

    return (
        <>
            {!isLoading && events && (
                <FullCalendar
                    ref={calendarRef}
                    plugins={[timeGridWeek, interactionPlugin]}
                    initialView='timeGridWeek'
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
                    eventDrop={onUIEventTimeChange}
                    eventResize={onUIEventTimeChange}
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
                    datesSet={
                        function (datesSet) {
                            setCalendarStart(datesSet.start)
                            setCalendarEnd(datesSet.end)
                        }
                    }
                    unselectCancel={'.calendar-unselect-cancel'}
                />
            )}

            {/* TODO refactor that to the separate component */}
            {/* Popover editor anchored at click position */}
            <Popover
                open={popoverOpen}
                onOpenChange={(open) => {
                    setPopoverOpen(open);
                    if (!open) {
                        setEditingEvent(null);
                        setIsCreateMode(false);
                        calendarRef.current?.getApi().unselect();
                    }
                }}
            >
                <PopoverTrigger asChild>
                    <button
                        aria-hidden
                        style={{
                            position: 'fixed',
                            left: anchorPos ? `${anchorPos.x}px` : '-1000px',
                            top: anchorPos ? `${anchorPos.y}px` : '-1000px',
                            width: 1,
                            height: 1,
                            opacity: 0,
                            pointerEvents: 'none',
                        }}
                    />
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-4" align="start">
                    <div className="space-y-3">
                        <div className="text-sm font-medium">{editingEvent ? (editingEvent.summary || 'Edit event') : (isCreateMode ? 'Create event' : 'Edit event')}</div>
                        <div className="grid gap-2">
                            <label className="text-xs text-muted-foreground">Start</label>
                            <DateTimePicker
                                value={startDate}
                                onChange={setStartDate}
                                granularity="minute"
                                hourCycle={24}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-xs text-muted-foreground">End</label>
                            <DateTimePicker
                                value={endDate}
                                onChange={setEndDate}
                                granularity="minute"
                                hourCycle={24}
                                className="calendar-unselect-cancel"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-xs text-muted-foreground">Budget</label>
                            <Select
                                value={selectedBudgetId ? String(selectedBudgetId) : undefined}
                                onValueChange={(val) => setSelectedBudgetId(Number(val))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select budget" />
                                </SelectTrigger>
                                <SelectContent>
                                    {budgets?.filter((b) => b.id != null).map((b) => (
                                        <SelectItem key={b.id} value={String(b.id!)} className="calendar-unselect-cancel">
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-between pt-2">
                            {editingEvent && !isCreateMode ? (
                                <Button variant="destructive" onClick={handleDelete}>
                                    Delete
                                </Button>
                            ) : (
                                <span />
                            )}
                            <div className="space-x-2">
                                <Button variant="outline" onClick={() => setPopoverOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={!startDate || !endDate || !selectedBudgetId}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </>
    )
}

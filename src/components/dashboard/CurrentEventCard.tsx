import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {createElement, useEffect, useState} from "react";
import {FolderKanbanIcon, HistoryIcon} from "lucide-react";
import {Square2StackIcon} from "@heroicons/react/24/outline";
import {Button} from "@/components/ui/button.tsx";
import {userSettings} from "@/components/settings.ts";
import {formatEventDuration} from "@/lib/dateUtils.ts";
import {PreviousEvent} from "@/components/dashboard/PreviousEvent.tsx";
import {Budget, Event} from "@/api/types.ts";
import * as Icons from "@heroicons/react/24/solid";
import useEvents from "@/api/useEvents.ts";
import useBudgets from "@/api/useBudgets.ts";
import {EventDetailsDialog} from "@/components/event/EventDetailsDialog.tsx";

export function CurrentEventCard() {

    const {budgets} = useBudgets(false);
    const {currentEvent, startEvent, lastEvents, updateEventStartTime} = useEvents();

    const [currentBudget, setCurrentBudget] = useState<Budget | undefined>(undefined)
    const [editEventOpen, setEditEventOpen] = useState<boolean>(false)
    const [eventToEdit, setEventToEdit] = useState<Event | undefined>(undefined)

    useEffect(() => {
        if (budgets && currentEvent) {
            setCurrentBudget(findBudget(currentEvent.budget.id))
        }
    }, [budgets, currentEvent])

    const onBudgetChange = async (id: string) => {
        if (!id) return;
        await startEvent(Number(id))
        setCurrentBudget(findBudget(Number(id)))
    }

    const getIcon = (iconName: string) => {
        const IconComponent = (Icons as { [index: string]: any })[iconName];
        if (IconComponent) {
            return IconComponent;
        }
        return null;
    };

    function openEditCurrentEvent() {
        if (!currentEvent) return;
        setEventToEdit(currentEvent)
        setEditEventOpen(true)
    }

    const findBudget = (id?: number) => {
        if (!id) return undefined;
        return budgets.find(budget => budget.id === id)
    }

    async function changeCurrentEventStartTime(updatedEvent: Event) {
        await updateEventStartTime(new Date(updatedEvent.startTime))
    }

    return (
        <Card className="shadow-lg gap-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2" title="Current event">
                    <div className="flex gap-2 w-full">
                        <Select onValueChange={onBudgetChange}>
                            <SelectTrigger
                                className="relative w-full pl-9 *:data-[slot=select-value]:text-black/80 [&_svg:not([class*='text-'])]:text-black/80">
                                {currentBudget?.icon && createElement(getIcon(currentBudget.icon), {
                                    className: "pointer-events-none absolute left-2" +
                                        " top-1/2 size-4 -translate-y-1/2 select-none opacity-60 hover:opacity-100"
                                })}
                                {!currentBudget?.icon && <FolderKanbanIcon
                                    className=" pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-80 hover:opacity-100"/>
                                }
                                <SelectValue placeholder={currentBudget?.name ?? "No active budget"}>
                                    {currentBudget?.name ?? "No active budget"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {budgets.map(budget => (

                                    <SelectItem key={budget.id} value={budget.id?.toString() ?? ""}>
                                        <div className="flex items-center gap-2">

                                            {budget.icon ? createElement(getIcon(budget.icon), {className: "size-4 text-gray-500"}) : null}
                                            {!budget.icon && <Square2StackIcon className="size-5 opacity-60"/>}

                                            <div>{budget.name}</div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="border" type="button" onClick={openEditCurrentEvent}>
                            <HistoryIcon/>
                            <span>{new Date(currentEvent?.startTime!!).toLocaleTimeString(userSettings.locale, {timeStyle: "short"})}</span>
                            <span className="hidden md:inline-block">({formatEventDuration(currentEvent)})</span>
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <div className="text-muted-foreground text-xs mb-0.5 pl-2">Previous events</div>
                    <div className="flex flex-col">
                        {lastEvents && lastEvents.slice(0, 4).map(event => (
                            <PreviousEvent event={event} key={event.startTime} onClick={() => {
                            }} className="block button"/>
                        ))}
                    </div>
                </div>

                {eventToEdit &&
                    <EventDetailsDialog
                        open={editEventOpen}
                        onOpenChange={setEditEventOpen}
                        event={eventToEdit}
                        onSave={(updatedEvent) => changeCurrentEventStartTime(updatedEvent)}
                        onDelete={() => {
                        }}
                    />
                }

            </CardContent>
        </Card>


    )
}

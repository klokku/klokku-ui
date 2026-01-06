import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {createElement, useState} from "react";
import {FolderKanbanIcon, HistoryIcon} from "lucide-react";
import {Square2StackIcon} from "@heroicons/react/24/outline";
import {Button} from "@/components/ui/button.tsx";
import {userSettings} from "@/components/settings.ts";
import {formatEventDuration} from "@/lib/dateUtils.ts";
import {PreviousEvent} from "@/components/dashboard/PreviousEvent.tsx";
import {CurrentEvent, WeeklyPlanItem} from "@/api/types.ts";
import * as Icons from "@heroicons/react/24/solid";
import useCurrentEvent from "@/api/useCurrentEvent.ts";
import {CurrentEventDetailsDialog} from "@/components/event/CurrentEventDetailsDialog.tsx";
import useWeeklyPlan from "@/api/useWeeklyPlan.ts";
import useCalendar from "@/api/useCalendar.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";

export function CurrentEventCard() {

    const {weeklyPlan, isLoading} = useWeeklyPlan(new Date());
    const {currentEvent, startEvent, updateEventStartTime} = useCurrentEvent();

    const now = new Date();
    const threeDaysAgo = new Date(now.setDate(now.getDate() - 3));
    const {recentEvents, isLoadingRecentEvents} = useCalendar(threeDaysAgo, now);

    const findPlanItem = (budgetItemId?: number) => {
        if (!budgetItemId) return undefined;
        return weeklyPlan?.items.find(item => item.budgetItemId === budgetItemId)
    }

    const currentPlanItem: WeeklyPlanItem | undefined = currentEvent ? findPlanItem(currentEvent.planItem.budgetItemId) : undefined

    const [editCurrentEventOpen, setEditCurrentEventOpen] = useState<boolean>(false)
    const [currentEventToEdit, setCurrentEventToEdit] = useState<CurrentEvent | undefined>(undefined)

    const onBudgetChange = async (budgetItemIdString: string) => {
        if (!budgetItemIdString) return;
        const budgetItemId = Number(budgetItemIdString);
        const item = weeklyPlan!.items.find(item => item.budgetItemId === budgetItemId)!
        await startEvent(budgetItemId, item.name, item.weeklyDuration)
    }

    const getIcon = (iconName: string, className: string) => {
        const key = iconName as keyof typeof Icons;
        const iconComponent = Icons[key] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
        return iconComponent ? createElement(iconComponent, {className}) : null
    };

    function openEditCurrentEvent() {
        if (!currentEvent) return;
        setCurrentEventToEdit(currentEvent)
        setEditCurrentEventOpen(true)
    }

    async function changeCurrentEventStartTime(updatedEvent: CurrentEvent) {
        await updateEventStartTime(new Date(updatedEvent.startTime))
    }

    if (isLoading) {
        return (
            <div className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] rounded-xl w-full"/>
            </div>
        )
    }

    return (
        <Card className="shadow-lg gap-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2" title="Current event">
                    <div className="flex gap-2 w-full">
                        <Select onValueChange={onBudgetChange}>
                            <SelectTrigger
                                className="relative w-full pl-9 *:data-[slot=select-value]:text-black/80 [&_svg:not([class*='text-'])]:text-black/80">
                                {currentPlanItem?.icon && getIcon(currentPlanItem.icon, "pointer-events-none absolute left-2" +
                                    " top-1/2 size-4 -translate-y-1/2 select-none opacity-60 hover:opacity-100")}
                                {!currentPlanItem?.icon && <FolderKanbanIcon
                                    className=" pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-80 hover:opacity-100"/>
                                }
                                <SelectValue placeholder={currentPlanItem?.name ?? "No active budget"}>
                                    {currentPlanItem?.name ?? "No active budget"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {weeklyPlan?.items.map(budget => (

                                    <SelectItem key={budget.budgetItemId} value={budget.budgetItemId?.toString() ?? ""}>
                                        <div className="flex items-center gap-2">

                                            {budget.icon && getIcon(budget.icon, "size-4 text-gray-500")}
                                            {!budget.icon && <Square2StackIcon className="size-5 opacity-60"/>}

                                            <div>{budget.name}</div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {currentEvent &&
                            <Button variant="outline" className="border" type="button" onClick={openEditCurrentEvent}>
                                <HistoryIcon/>
                                <span>{new Date(currentEvent.startTime).toLocaleTimeString(userSettings.locale, {timeStyle: "short"})}</span>
                                <span className="hidden md:inline-block">({formatEventDuration({start: currentEvent.startTime})})</span>
                            </Button>
                        }
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <div className="text-muted-foreground text-xs mb-0.5 pl-2">Previous events</div>
                    <div className="flex flex-col gap-2">
                        {isLoadingRecentEvents && <Skeleton className="w-full rounded-md h-24"/>}
                        {recentEvents && recentEvents.slice(0, 4).map(event => (
                            <PreviousEvent event={event} key={event.uid} planItem={findPlanItem(event.budgetItemId)} className="block button"/>
                        ))}
                    </div>
                </div>

                {currentEventToEdit &&
                    <CurrentEventDetailsDialog
                        open={editCurrentEventOpen}
                        onOpenChange={setEditCurrentEventOpen}
                        event={currentEventToEdit}
                        onSave={(updatedEvent) => changeCurrentEventStartTime(updatedEvent)}
                    />
                }

            </CardContent>
        </Card>


    )
}

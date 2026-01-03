import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import useEvents from "@/api/useEvents.ts";
import {FolderKanbanIcon} from "lucide-react";
import useWeeklyPlan from "@/api/useWeeklyPlan.ts";
import {useEffect, useState} from "react";

export function PlanItemSelect() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const {weeklyPlan, isLoading} = useWeeklyPlan(currentDate);
    const {currentEvent, loadingCurrentEvent, startEvent} = useEvents();

    const currentBudgetName = currentEvent?.planItem.name

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            // Check if the calendar day has changed
            if (now.getDate() !== currentDate.getDate() ||
                now.getMonth() !== currentDate.getMonth() ||
                now.getFullYear() !== currentDate.getFullYear()) {
                setCurrentDate(now);
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [currentDate]);

    const onChange = async (budgetItemId: string) => {
        if (!budgetItemId) return;
        const item = weeklyPlan?.items.find(item => item.budgetItemId === Number(budgetItemId))
        const itemName = item?.name ?? ""
        const weeklyDuration = item?.weeklyDuration ?? 0
        await startEvent(Number(budgetItemId), itemName, weeklyDuration)
    }

    if (isLoading || loadingCurrentEvent) {
        return <div className="w-36 h-7 bg-gray-500 rounded-full animate-pulse"/>
    }

    return ( weeklyPlan &&
        <Select onValueChange={onChange}>
            <SelectTrigger
                className="relative border-0 pl-8 *:data-[slot=select-value]:text-white/80 [&_svg:not([class*='text-'])]:text-white/80
                    bg-white/20  hover:bg-white/30 focus:outline-hidden focus:ring-0 max-w-36 w-36 !h-7">
                <FolderKanbanIcon
                    className="text-white pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-80 hover:opacity-100"/>
                <SelectValue placeholder={currentBudgetName ?? "No active item"}/>
            </SelectTrigger>
            <SelectContent className="bg-gray-50 text-black/85 focus:outline-hidden focus:ring-0 border-0">
                {weeklyPlan.items.map(item => (
                    <SelectItem key={`weekly-plan-item-${item.budgetItemId}`} value={item.budgetItemId.toString() ?? ""}>{item.name}</SelectItem>
                ))}
            </SelectContent>

        </Select>
    )
}

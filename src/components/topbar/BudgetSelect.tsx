import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import useBudgets from "@/api/useBudgets.ts";
import useEvents from "@/api/useEvents.ts";
import {FolderKanbanIcon} from "lucide-react";

export function BudgetSelect() {
    const {budgets} = useBudgets(false);
    const {currentEvent, startEvent} = useEvents();

    const currentBudgetName = currentEvent?.budget.name

    const onBudgetChange = async (id: string) => {
        if (!id) return;
        await startEvent(Number(id))
    }

    return (
        <Select onValueChange={onBudgetChange}>
            <SelectTrigger
                className="relative border-0 pl-8 *:data-[slot=select-value]:text-white/80 [&_svg:not([class*='text-'])]:text-white/80
                    bg-white/20  hover:bg-white/30 focus:outline-hidden focus:ring-0 max-w-36 w-36 !h-7">
                <FolderKanbanIcon
                    className="text-white pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-80 hover:opacity-100"/>
                <SelectValue placeholder={currentBudgetName ?? "No active budget"}/>
            </SelectTrigger>
            <SelectContent className="bg-gray-50 text-black/85 focus:outline-hidden focus:ring-0 border-0">
                {budgets.map(budget => (
                    <SelectItem key={budget.id} value={budget.id?.toString() ?? ""}>{budget.name}</SelectItem>
                ))}
            </SelectContent>

        </Select>
    )
}

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
            <SelectTrigger className="relative max-w-36 h-7 border-0 text-white text-opacity-80 pl-8
            bg-white bg-opacity-20 hover:text-white hover:text-opacity-90 hover:bg-white hover:bg-opacity-30 focus:outline-none focus:ring-0">
                <FolderKanbanIcon
                    className="text-white pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-80 hover:opacity-100"/>
                <SelectValue placeholder={currentBudgetName ?? "No active budget"} />
            </SelectTrigger>
            <SelectContent className="bg-gray-50 text-black text-opacity-85 focus:outline-none focus:ring-0 border-0">
                { budgets.map(budget => (
                    <SelectItem key={budget.id} value={budget.id?.toString() ?? ""}>{budget.name}</SelectItem>
                ))}
            </SelectContent>

        </Select>
    )
}

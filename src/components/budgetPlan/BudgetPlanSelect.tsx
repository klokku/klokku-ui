import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import useBudgetPlan from "@/api/useBudgetPlan.ts";
import {useEffect} from "react";

interface Props {
    selectedId?: number;
    onPlanSelected: (planId: number | undefined) => void
}

export function BudgetPlanSelect({selectedId, onPlanSelected}: Props) {

    const {budgetPlans, isLoadingPlans} = useBudgetPlan();

    useEffect(() => {
        if (!isLoadingPlans && budgetPlans.length > 0 && !selectedId) {
            const initialPlanId = budgetPlans.find(p => p.isCurrent)?.id ?? budgetPlans[0]?.id;
            onPlanSelected(initialPlanId);
        }
    }, [isLoadingPlans, budgetPlans, selectedId, onPlanSelected]);

    if (isLoadingPlans) {
        return <div className="w-80 h-7 bg-gray-500 rounded-full animate-pulse"/>
    }

    return (
        <Select
            value={selectedId?.toString()}
            onValueChange={planId => {
                onPlanSelected(Number(planId))
            }}
        >
            <SelectTrigger className="w-80">
                <SelectValue placeholder="Budget Plan"/>
            </SelectTrigger>
            <SelectContent>
                {budgetPlans.map((plan) => (
                    <SelectItem key={`plan-${plan.id}`} value={plan.id!.toString()}>
                        <div className="flex items-center gap-2">
                            {plan.name}
                            {plan.isCurrent && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Current</Badge>}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

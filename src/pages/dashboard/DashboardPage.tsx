import {CurrentEventCard} from "@/components/dashboard/CurrentEventCard.tsx";
import {WeeklyBudgetCompletionCard} from "@/components/dashboard/WeeklyBudgetCompletionCard.tsx";
import {PlannedBudgetsSplitCard} from "@/components/dashboard/PlannedBudgetsSplitCard.tsx";
import {WeeklyBudgetsSplitCard} from "@/components/dashboard/CurrentBudgetsSplitCard.tsx";
import {TimeTodayCard} from "@/components/dashboard/TimeTodayCard.tsx";
import {useState} from "react";
import {BudgetPlanWizardDialog} from "@/pages/budgetPlan/wizard/BudgetPlanWizardDialog.tsx";
import {EmptyBudgetPlan} from "@/pages/budgetPlan/EmptyBudgetPlan.tsx";
import useWeeklyPlan from "@/api/useWeeklyPlan.ts";

export function DashboardPage() {
    const {weeklyPlan, isLoading} = useWeeklyPlan(new Date());
    const [wizardOpen, setWizardOpen] = useState(false);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            {!isLoading && weeklyPlan?.items.length === 0 && (
                <EmptyBudgetPlan
                    onOpenWizard={() => setWizardOpen(true)}
                />
            )}
            <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
                <CurrentEventCard/>
                <WeeklyBudgetCompletionCard/>
            </div>
            <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
                <PlannedBudgetsSplitCard/>
                <WeeklyBudgetsSplitCard/>
            </div>
            <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
                <TimeTodayCard/>
            </div>

            <BudgetPlanWizardDialog open={wizardOpen} onOpenChange={setWizardOpen} budgetPlanId={weeklyPlan?.budgetPlanId}/>
        </div>
    )
}

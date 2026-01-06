import {CurrentEventCard} from "@/components/dashboard/CurrentEventCard.tsx";
import {WeeklyBudgetCompletionCard} from "@/components/dashboard/WeeklyBudgetCompletionCard.tsx";
import {PlannedBudgetsSplitCard} from "@/components/dashboard/PlannedBudgetsSplitCard.tsx";
import {WeeklyBudgetsSplitCard} from "@/components/dashboard/CurrentBudgetsSplitCard.tsx";
import {TimeTodayCard} from "@/components/dashboard/TimeTodayCard.tsx";
import {useState} from "react";
import {BudgetPlanWizardDialog} from "@/pages/budgetPlan/wizard/BudgetPlanWizardDialog.tsx";
import {EmptyBudgetPlan} from "@/pages/budgetPlan/EmptyBudgetPlan.tsx";
import useWeeklyPlan from "@/api/useWeeklyPlan.ts";
import {paths} from "@/pages/links.ts";
import {NavLink} from "react-router";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";

export function DashboardPage() {
    const {weeklyPlan, isLoading} = useWeeklyPlan(new Date());
    const [wizardOpen, setWizardOpen] = useState(false);

    if (!weeklyPlan && !isLoading) {
        return (
            <Empty className="mb-4 border rounded text-center">
                <EmptyHeader>
                    <EmptyMedia variant="default" className="text-primary-foreground text-6xl">
                        🚀
                    </EmptyMedia>
                    <EmptyTitle>Let’s build your first plan!</EmptyTitle>
                    <EmptyDescription>
                        Head over to <NavLink to={paths.budgetPlans.path} className="underline decoration-primary font-medium">Budget Plans</NavLink> to set up your tracking.
                    </EmptyDescription>
                    <EmptyContent>
                        Once you create a plan, you’ll be able to see your spending and stay on top of your weekly goals.
                    </EmptyContent>
                </EmptyHeader>
            </Empty>
        )
    }

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

import {CurrentEventCard} from "@/components/dashboard/CurrentEventCard.tsx";
import {WeeklyBudgetCompletionCard} from "@/components/dashboard/WeeklyBudgetCompletionCard.tsx";
import {PlannedBudgetsSplitCard} from "@/components/dashboard/PlannedBudgetsSplitCard.tsx";
import {WeeklyBudgetsSplitCard} from "@/components/dashboard/CurrentBudgetsSplitCard.tsx";
import {TimeTodayCard} from "@/components/dashboard/TimeTodayCard.tsx";
import useBudgets from "@/api/useBudgets.ts";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {BudgetWizardDialog} from "@/pages/budgets/wizard/BudgetWizardDialog.tsx";

export function DashboardPage() {
    const { budgets, isLoading } = useBudgets(false);
    const [wizardOpen, setWizardOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && budgets.length === 0) {
            setWizardOpen(true);
        }
    }, [budgets.length, isLoading]);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            {!isLoading && budgets.length === 0 && (
                <div className="p-4 border rounded">
                    <div className="mb-2">Welcome! You don't have any budgets yet.</div>
                    <Button onClick={() => setWizardOpen(true)}>Open budget wizard</Button>
                </div>
            )}
            <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
                <CurrentEventCard />
                <WeeklyBudgetCompletionCard />
            </div>
            <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
                <PlannedBudgetsSplitCard />
                <WeeklyBudgetsSplitCard />
            </div>
            <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
                <TimeTodayCard />
            </div>

            <BudgetWizardDialog open={wizardOpen} onOpenChange={setWizardOpen} />
        </div>
    )
}

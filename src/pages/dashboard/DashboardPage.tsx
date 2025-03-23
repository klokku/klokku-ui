import {CurrentEventCard} from "@/components/dashboard/CurrentEventCard.tsx";
import {WeeklyBudgetCompletionCard} from "@/components/dashboard/WeeklyBudgetCompletionCard.tsx";
import {PlannedBudgetsSplitCard} from "@/components/dashboard/PlannedBudgetsSplitCard.tsx";
import {WeeklyBudgetsSplitCard} from "@/components/dashboard/CurrentBudgetsSplitCard.tsx";
import {TimeTodayCard} from "@/components/dashboard/TimeTodayCard.tsx";

export function DashboardPage() {

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
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

        </div>
    )
}

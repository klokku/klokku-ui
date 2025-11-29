import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {formatSecondsToDuration, getCurrentWeekFirstDay, weekEndDay} from "@/lib/dateUtils.ts";
import useStats from "@/api/useStats.ts";
import {BudgetStats} from "@/api/types.ts";
import {BudgetsStatsPieChart} from "@/components/dashboard/BudgetsStatsPieChart.tsx";

export function PlannedBudgetsSplitCard() {

    const weekFirstDay = getCurrentWeekFirstDay()
    const {isLoading, statsSummary} = useStats(weekFirstDay, weekEndDay(weekFirstDay))

    function weeklyTime(budgetStats: BudgetStats): number {
        return budgetStats.budgetOverride ? budgetStats.budgetOverride.weeklyTime : budgetStats.budget.weeklyTime
    }

    const chartData = statsSummary?.budgets.map((budgetStats, idx) => {
        const weeklyTimeInSec = weeklyTime(budgetStats);
        return {
            budget: budgetStats.budget.name.replace("TTA", ""),
            time: weeklyTimeInSec,
            timeFormated: formatSecondsToDuration(weeklyTimeInSec),
            fill: `var(--chart-${idx % 5 + 1})`,
        }
    })

    return (
        <Card className="shadow-lg gap-2">
            <CardHeader>
                <CardTitle>Planned this week</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                {(isLoading) && (
                    <div className="flex justify-center items-center h-full">
                        Loading...
                    </div>
                )}
                <div>
                    <BudgetsStatsPieChart chartData={chartData} />
                </div>
            </CardContent>

        </Card>


    )
}

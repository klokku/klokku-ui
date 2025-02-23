import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {formatSecondsToDuration, getCurrentWeekFirstDay, weekEndDay} from "@/lib/dateUtils.ts";
import useStats from "@/api/useStats.ts";
import {BudgetsStatsPieChart} from "@/components/dashboard/BudgetsStatsPieChart.tsx";

export function WeeklyBudgetsSplitCard() {

    const weekFirstDay = getCurrentWeekFirstDay()
    const {isLoading, statsSummary} = useStats(weekFirstDay, weekEndDay(weekFirstDay))

    const chartData = statsSummary?.budgets
        .filter((budgetStats) => budgetStats.duration > 0)
        .map((budgetStats, idx) => {
            const thisWeekTimeInSec = budgetStats.duration;
            return {
                budget: budgetStats.budget.name.replace("TTA", ""),
                time: thisWeekTimeInSec,
                timeFormated: formatSecondsToDuration(thisWeekTimeInSec),
                fill: `hsl(var(--chart-${idx % 5 + 1}))`,
            }
        })

    return (
        <Card className="shadow-xl">
            <CardHeader className="pb-1">
                <CardTitle>Spent time this week</CardTitle>
            </CardHeader>
            <CardContent className="">
                {(isLoading) && (
                    <div className="flex justify-center items-center h-full">
                        Loading...
                    </div>
                )}
                <div className="">
                    <BudgetsStatsPieChart chartData={chartData} />
                </div>
            </CardContent>

        </Card>


    )
}

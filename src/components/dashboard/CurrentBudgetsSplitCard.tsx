import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {getDashboardPeriod} from "@/lib/dashboardDates.ts";
import useWeeklyStats from "@/api/useStats.ts";
import {BudgetsStatsPieChart} from "@/components/dashboard/BudgetsStatsPieChart.tsx";
import {defaultSettings} from "@/components/settings.ts";
import useProfile from "@/api/useProfile.ts";

export function WeeklyBudgetsSplitCard() {

    const {currentProfile} = useProfile();
    const timezone = currentProfile?.settings.timezone ?? "UTC";
    const {weekStart} = getDashboardPeriod(new Date(), timezone, currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay);

    const {isLoading, weeklyStatsSummary} = useWeeklyStats(weekStart, {timezone, enabled: !!currentProfile});

    const chartData = weeklyStatsSummary?.perPlanItem
        .filter((budgetStats) => budgetStats.duration > 0)
        .map((budgetStats, idx) => {
            const thisWeekTimeInSec = budgetStats.duration;
            return {
                budget: budgetStats.planItem.name,
                time: thisWeekTimeInSec,
                timeFormated: formatSecondsToDuration(thisWeekTimeInSec),
                fill: `var(--chart-${idx % 5 + 1})`,
            }
        })

    return (
        <Card className="shadow-lg gap-2">
            <CardHeader>
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

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {formatSecondsToDuration, getCurrentWeekFirstDay} from "@/lib/dateUtils.ts";
import {BudgetsStatsPieChart} from "@/components/dashboard/BudgetsStatsPieChart.tsx";
import {defaultSettings} from "@/components/settings.ts";
import useProfile from "@/api/useProfile.ts";
import useWeeklyPlan from "@/api/useWeeklyPlan.ts";

export function PlannedBudgetsSplitCard() {

    const {currentProfile} = useProfile();
    const weekFirstDay = getCurrentWeekFirstDay(currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay)
    const {weeklyPlan, isLoading} = useWeeklyPlan(weekFirstDay)

    const chartData = weeklyPlan?.items?.map((item, idx) => {
        return {
            budget: item.name,
            time: item.weeklyDuration,
            timeFormated: formatSecondsToDuration(item.weeklyDuration),
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

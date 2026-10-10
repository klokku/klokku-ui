import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {dateKeyInTimezone, getDashboardPeriod} from "@/lib/dashboardDates.ts";
import useWeeklyStats from "@/api/useStats.ts";
import useProfile from "@/api/useProfile.ts";
import {defaultSettings} from "@/components/settings.ts";

export function TimeTodayCard() {

    const {currentProfile} = useProfile();
    const timezone = currentProfile?.settings.timezone ?? "UTC";
    const {weekStart, todayKey} = getDashboardPeriod(new Date(), timezone, currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay);
    const {isLoading, weeklyStatsSummary} = useWeeklyStats(weekStart, {timezone, enabled: !!currentProfile});

    const todaysBudgets = weeklyStatsSummary?.perDay
        .find(day => dateKeyInTimezone(day.date, timezone) === todayKey)
        ?.perPlanItem
        ?.filter(budget => budget.duration > 0)

    return (
        <Card className="shadow-lg gap-2">
            <CardHeader>
                <CardTitle>Time today</CardTitle>
            </CardHeader>
            <CardContent>
                {(isLoading) && (
                    <div className="flex justify-center items-center h-full">
                        Loading...
                    </div>
                )}
                {todaysBudgets && (
                    <div className="grid grid-cols-3 gap-2">
                        {todaysBudgets.map((itemStats) => (
                            <Card className="shadow-card py-3" key={itemStats.planItem.budgetItemId}>
                                <CardHeader>
                                    <CardTitle className="text-sm">{itemStats.planItem.name}</CardTitle>
                                    <CardDescription className="">{formatSecondsToDuration(itemStats.duration)}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>

        </Card>


    )
}

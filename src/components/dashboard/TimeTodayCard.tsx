import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {formatSecondsToDuration, getCurrentWeekFirstDay} from "@/lib/dateUtils.ts";
import useWeeklyStats from "@/api/useStats.ts";
import {isToday} from "date-fns";
import useProfile from "@/api/useProfile.ts";
import {defaultSettings} from "@/components/settings.ts";

export function TimeTodayCard() {

    const {currentProfile} = useProfile();
    const weekFirstDay = getCurrentWeekFirstDay(currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay)
    const {isLoading, weeklyStatsSummary} = useWeeklyStats(weekFirstDay)

    const todaysBudgets = weeklyStatsSummary?.perDay
        .find(day => isToday(new Date(day.date)))
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
                            <Card className="shadow-card py-3" key={itemStats.planItem.name}>
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

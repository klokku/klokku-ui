import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {getCurrentWeekFirstDay, weekEndDay} from "@/lib/dateUtils.ts";
import useWeeklyStats from "@/api/useStats.ts";
import {Bar, BarChart, LabelList, XAxis, YAxis} from "recharts"
import {ChartConfig, ChartContainer} from "@/components/ui/chart"
import {PlanItemStats} from "@/api/types.ts";
import useEvents from "@/api/useEvents.ts";
import {NavLink} from "react-router";
import {paths} from "@/pages/links.ts";
import useProfile from "@/api/useProfile.ts";
import {defaultSettings} from "@/components/settings.ts";
import useCalendar from "@/api/useCalendar.ts";

const chartConfig = {

} satisfies ChartConfig

export function WeeklyBudgetCompletionCard() {

    const {currentProfile} = useProfile();
    const weekFirstDay = getCurrentWeekFirstDay(currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay)
    const {isLoading, weeklyStatsSummary} = useWeeklyStats(weekFirstDay)
    const {loadingCurrentEvent, currentEvent} = useEvents()
    const {recentEvents, isLoadingRecentEvents} = useCalendar(weekFirstDay, weekEndDay(weekFirstDay))

    const lastEventsBudgetItemIds = recentEvents?.map(event => event.budgetItemId)
    weeklyStatsSummary?.perPlanItem.sort((a, b) => {
        if (currentEvent && a.planItem.budgetItemId === currentEvent.planItem.budgetItemId) return -1;
        else if (currentEvent && b.planItem.budgetItemId === currentEvent.planItem.budgetItemId) return 1;
        if (!lastEventsBudgetItemIds) return 0;
        let indexOfA = lastEventsBudgetItemIds.indexOf(a.planItem.budgetItemId);
        let indexOfB = lastEventsBudgetItemIds.indexOf(b.planItem.budgetItemId);
        indexOfA = indexOfA != -1 ? indexOfA : 10
        indexOfB = indexOfB != -1 ? indexOfB : 10
        return indexOfA - indexOfB
    })

    function completionPercent(budgetStats: PlanItemStats): number {
        const weeklyTime = budgetStats.planItem.weeklyItemDuration
        return Math.round(budgetStats.duration / weeklyTime * 100)
    }

    function calculateColor(completionPercent: number): string {
        const max = 200
        const min = 30
        if (completionPercent > max) completionPercent = max;
        const value = (completionPercent - min) / (max - min);
        const hue = (1 - value) * 120;
        return `hsl(${hue}, 100%, 50%)`;
    }

    const completions = weeklyStatsSummary?.perPlanItem.slice(0, 5).map(budgetStats => completionPercent(budgetStats)) ?? []
    const maxCompletion = Math.max(...completions, 1)

    const chartData = weeklyStatsSummary?.perPlanItem.slice(0, 5).map((budgetStats, index) => {
        const completion = completions[index]
        const relativeSize = completion / maxCompletion
        return {
            budget: budgetStats.planItem.name,
            completionCut: Math.min(completion, 100),
            completion: completion,
            fill: calculateColor(completion),
            labelPosition: relativeSize < 0.15 ? 'right' : 'insideRight',
        }

    })

    return (
        <Card className="shadow-lg gap-2">
            <CardHeader>
                <CardTitle>Weekly completion</CardTitle>
                <CardDescription>Last 5 budget used</CardDescription>
            </CardHeader>
            <CardContent>
                {(isLoading || isLoadingRecentEvents || loadingCurrentEvent) && (
                    <div className="flex justify-center items-center h-full">
                        Loading...
                    </div>
                )}
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            left: 0,
                        }}
                    >
                        <XAxis type="number" dataKey="completion" hide />
                        <YAxis
                            dataKey="budget"
                            type="category"
                            tickLine={false}
                            tickMargin={5}
                            axisLine={false}
                            width={100}
                        />
                        <Bar dataKey="completion" layout="vertical" radius={5} unit="%" name="Completion (%)">
                        <LabelList
                            dataKey="completion"
                            formatter={(value: number) => `${value}%`}
                            position="insideRight"
                            offset={8}
                            className="fill-gray-700"
                            fontSize={12}
                            content={(props: any) => {
                                const { x, y, width, height, value, index } = props;
                                const item = chartData?.[index];
                                const position = item?.labelPosition || 'insideRight';
                                const xPos = position === 'right' ? x + width + 8 : x + width - 8;
                                const textAnchor = position === 'right' ? 'start' : 'end';

                                return (
                                    <text
                                        x={xPos}
                                        y={y + height / 2}
                                        fill="currentColor"
                                        textAnchor={textAnchor}
                                        dominantBaseline="middle"
                                        fontSize={12}
                                    >
                                        {value}%
                                    </text>
                                );
                            }}
                        />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-end gap-2 text-sm">
                <div className="leading-none text-muted-foreground">
                    <NavLink to={paths.history.path}>See more</NavLink>
                </div>
            </CardFooter>
        </Card>


    )
}

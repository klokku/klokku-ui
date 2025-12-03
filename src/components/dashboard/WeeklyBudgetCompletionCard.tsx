import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {getCurrentWeekFirstDay, weekEndDay} from "@/lib/dateUtils.ts";
import useStats from "@/api/useStats.ts";
import {Bar, BarChart, LabelList, XAxis, YAxis} from "recharts"
import {ChartConfig, ChartContainer} from "@/components/ui/chart"
import {BudgetStats} from "@/api/types.ts";
import useEvents from "@/api/useEvents.ts";
import {NavLink} from "react-router";
import {paths} from "@/pages/links.ts";
import useProfile from "@/api/useProfile.ts";
import {defaultSettings} from "@/components/settings.ts";

const chartConfig = {

} satisfies ChartConfig

export function WeeklyBudgetCompletionCard() {

    const {currentProfile} = useProfile();
    const weekFirstDay = getCurrentWeekFirstDay(currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay)
    const {isLoading, statsSummary} = useStats(weekFirstDay, weekEndDay(weekFirstDay))
    const {loadingLastEvents, lastEvents, loadingCurrentEvent, currentEvent} = useEvents()

    const lastEventsBudgetIds = lastEvents?.map(event => event.budget.id)
    statsSummary?.budgets.sort((a, b) => {
        if (currentEvent && a.budget.id === currentEvent.budget.id) return -1;
        else if (currentEvent && b.budget.id === currentEvent.budget.id) return 1;
        if (!lastEventsBudgetIds) return 0;
        let indexOfA = lastEventsBudgetIds.indexOf(a.budget.id);
        let indexOfB = lastEventsBudgetIds.indexOf(b.budget.id);
        indexOfA = indexOfA != -1 ? indexOfA : 10
        indexOfB = indexOfB != -1 ? indexOfB : 10
        return indexOfA - indexOfB
    })

    function completionPercent(budgetStats: BudgetStats): number {
        const weeklyTime = budgetStats.budgetOverride ? budgetStats.budgetOverride.weeklyTime : budgetStats.budget.weeklyTime
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

    const chartData = statsSummary?.budgets.slice(0, 5).map((budgetStats) => {
        const completion = completionPercent(budgetStats)
        return {
            budget: budgetStats.budget.name.replace("TTA", ""),
            completionCut: Math.min(completion, 100),
            completion: completion,
            fill: calculateColor(completion),
        }

    })

    return (
        <Card className="shadow-lg gap-2">
            <CardHeader>
                <CardTitle>Weekly completion</CardTitle>
                <CardDescription>Last 5 budget used</CardDescription>
            </CardHeader>
            <CardContent>
                {(isLoading || loadingLastEvents || loadingCurrentEvent) && (
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
                            tickFormatter={(value) => value.slice(0, 10)}
                        />
                        <Bar dataKey="completion" layout="vertical" radius={5} unit="%" name="Completion (%)">
                        <LabelList
                            dataKey="completion"
                            formatter={(value: string) => `${value}%`}
                            position="insideRight"
                            offset={8}
                            className="fill-gray-700"
                            fontSize={12}
                        />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-end gap-2 text-sm">
                <div className="leading-none text-muted-foreground">
                    <NavLink to={paths.statistics.path}>See more</NavLink>
                </div>
            </CardFooter>
        </Card>


    )
}

import {Bar, BarChart, CartesianGrid, ReferenceArea, ReferenceLine, Tooltip, XAxis, YAxis} from "recharts";
import {NavLink} from "react-router";
import {ChartContainer, ChartConfig} from "@/components/ui/chart.tsx";
import {InsightCard, InsightState} from "@/components/dashboard/InsightCard.tsx";
import {getBudgetBalances, getWeeklyRhythm} from "@/components/dashboard/dashboardInsights.ts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {paths} from "@/pages/links.ts";

export function WeeklyRhythmCard({days, budgets, state}: {
    days: ReturnType<typeof getWeeklyRhythm>;
    budgets: ReturnType<typeof getBudgetBalances>;
    state: InsightState;
}) {
    const orderedBudgets = [...budgets].sort((a, b) => a.position - b.position);
    const config: ChartConfig = Object.fromEntries(orderedBudgets.map((item, index) => [
        `budget_${item.id}`, {label: item.name, color: item.color || `var(--chart-${index % 5 + 1})`},
    ]));
    const today = days.find(day => day.today);
    const future = days.filter(day => day.upcoming);
    return (
        <InsightCard title="This week's rhythm" description="Daily time by budget · Today highlighted · Future days shaded" state={state}
                     footer={<NavLink to={paths.historyCurrentPlan.path} className="ml-auto underline underline-offset-4">View history</NavLink>}>
            {budgets.length === 0 ? <p className="text-sm text-muted-foreground">Add budget items to see how your week unfolds.</p> : <>
                <ChartContainer config={config} className="h-[260px] w-full aspect-auto" aria-label="Daily tracked time by budget">
                    <BarChart data={days} accessibilityLayer margin={{top: 12, right: 8, left: 0, bottom: 0}}>
                        <CartesianGrid vertical={false}/>
                        <XAxis dataKey="dayIndex" type="number" domain={[-0.5, 6.5]} ticks={[0, 1, 2, 3, 4, 5, 6]}
                               tickFormatter={value => days[Number(value)]?.label ?? ""} tickLine={false} axisLine={false} tickMargin={8}/>
                        <YAxis width={48} tickFormatter={value => `${Math.round(Number(value) / 3600)}h`} tickLine={false} axisLine={false}/>
                        {future.length > 0 && <ReferenceArea x1={future[0].dayIndex - 0.5} x2={6.5} fill="var(--muted)" fillOpacity={0.6}/>}
                        {today && <ReferenceLine x={today.dayIndex} stroke="var(--foreground)" strokeDasharray="3 3"/>}
                        <Tooltip formatter={(value, name) => [formatSecondsToDuration(Number(value)), config[String(name)]?.label ?? name]}
                                 labelFormatter={label => {
                                     const day = days[Number(label)];
                                     return day ? `${day.label}${day.today ? " (today)" : ""} · ${day.upcoming ? "Upcoming" : day.total === null ? "No data" : formatSecondsToDuration(day.total)}` : label;
                                 }}/>
                        {orderedBudgets.map(item => <Bar key={item.id} dataKey={`budget_${item.id}`} stackId="time" fill={`var(--color-budget_${item.id})`} isAnimationActive={false}/>)}
                    </BarChart>
                </ChartContainer>
                <ul className="flex flex-wrap gap-x-3 gap-y-1.5 mt-4 text-xs text-muted-foreground" aria-label="Budget colors">
                    {orderedBudgets.map(item => <li key={item.id} className="flex items-center gap-1.5 min-w-0">
                        <span className="size-2 rounded-full shrink-0" style={{backgroundColor: config[`budget_${item.id}`].color}}/>
                        <span className="break-words">{item.name}</span>
                    </li>)}
                </ul>
                <details className="mt-3 text-xs text-muted-foreground">
                    <summary className="cursor-pointer">Daily totals</summary>
                    <ul className="mt-2 space-y-1">{days.map(day => <li key={day.dateKey}>{day.label}{day.today ? " (today)" : ""}: {day.upcoming ? "Upcoming" : day.total === null ? "No data" : formatSecondsToDuration(day.total)}</li>)}</ul>
                </details>
            </>}
        </InsightCard>
    );
}

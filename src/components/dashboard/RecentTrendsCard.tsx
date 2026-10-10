import {useState} from "react";
import {NavLink} from "react-router";
import {CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";
import {WeeklyPlanItem, WeeklyReportEntry} from "@/api/types.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {ChartContainer} from "@/components/ui/chart.tsx";
import {InsightCard, InsightState} from "@/components/dashboard/InsightCard.tsx";
import {getRecentTrend} from "@/components/dashboard/dashboardInsights.ts";
import {DashboardPeriod} from "@/lib/dashboardDates.ts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {links} from "@/pages/links.ts";

export function RecentTrendsCard({items, weeks, planId, period, timezone, description, excludedWeekCount, state}: {
    items: WeeklyPlanItem[];
    weeks: WeeklyReportEntry[];
    planId?: number;
    period: DashboardPeriod;
    timezone: string;
    description: string;
    excludedWeekCount: number;
    state: InsightState;
}) {
    const [selectedId, setSelectedId] = useState<number>();
    const orderedItems = [...items].sort((a, b) => b.weeklyDuration - a.weeklyDuration || a.position - b.position);
    const selectedItem = items.find(item => item.budgetItemId === selectedId) ?? orderedItems[0];
    const data = getRecentTrend(weeks, selectedItem?.budgetItemId, period, timezone);
    const samples = data.filter(point => point.actual !== null);
    const average = samples.length ? samples.reduce((sum, point) => sum + point.actual!, 0) / samples.length : 0;
    const params = new URLSearchParams({mode: "custom", from: period.historyFrom.toISOString(), to: period.historyTo.toISOString()});
    const color = selectedItem?.color || "var(--chart-1)";

    return (
        <InsightCard title="Recent trends" description={<>{description}<br/>Previous 8 completed weeks · Off weeks excluded</>} state={state}
                     footer={selectedItem && planId && <NavLink to={`${links.budgetPlanItemReport(planId, selectedItem.budgetItemId)}?${params}`} className="ml-auto underline underline-offset-4">View budget report</NavLink>}>
            {items.length === 0 ? <p className="text-sm text-muted-foreground">Add budget items to explore your trends.</p> : <>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <Select value={selectedItem?.budgetItemId.toString()} onValueChange={value => setSelectedId(Number(value))}>
                        <SelectTrigger aria-label="Budget for recent trends" className="w-full sm:w-64 min-w-0"><SelectValue/></SelectTrigger>
                        <SelectContent>{items.map(item => <SelectItem key={item.budgetItemId} value={item.budgetItemId.toString()}>{item.name}</SelectItem>)}</SelectContent>
                    </Select>
                    {samples.length > 0 && <p className="text-sm text-muted-foreground">Average actual: <span className="font-medium text-foreground">{formatSecondsToDuration(average)}/week</span> · {samples.length} weeks</p>}
                </div>
                {samples.length === 0 ? <p className="text-sm text-muted-foreground py-8">No tracked history in this period yet. Completed weeks will appear here as you track time.</p> : <>
                    <div className="flex flex-wrap gap-4 mb-2 text-xs text-muted-foreground" aria-label="Chart legend">
                        <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-muted-foreground"/>Weekly plan</span>
                        <span className="flex items-center gap-1.5"><span className="w-4 border-t-2" style={{borderColor: color}}/>Actual time</span>
                    </div>
                    <ChartContainer config={{planned: {label: "Weekly plan"}, actual: {label: "Actual time", color}}}
                                    className="h-[280px] w-full aspect-auto" aria-label={`Weekly planned and actual time for ${selectedItem?.name}`}>
                        <LineChart data={data} accessibilityLayer margin={{top: 12, right: 12, left: 0, bottom: 0}}>
                            <CartesianGrid vertical={false}/>
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={12}/>
                            <YAxis width={48} tickLine={false} axisLine={false} tickFormatter={value => `${Math.round(Number(value) / 3600)}h`}/>
                            <Tooltip formatter={(value, name) => [formatSecondsToDuration(Number(value)), name === "planned" ? "Weekly plan" : "Actual time"]}
                                     labelFormatter={label => `Week starting ${label}`}/>
                            <Line dataKey="planned" type="linear" stroke="var(--muted-foreground)" strokeWidth={2} strokeDasharray="5 5" dot={{r: 3}} connectNulls={false} isAnimationActive={false}/>
                            <Line dataKey="actual" type="linear" stroke={color} strokeWidth={2.5} dot={{r: 4}} connectNulls={false} isAnimationActive={false}/>
                        </LineChart>
                    </ChartContainer>
                    <p className="text-xs text-muted-foreground mt-3">Includes zero-activity weeks after plan tracking began. Gaps indicate excluded or unavailable weeks{excludedWeekCount > 0 ? ` (${excludedWeekCount} off ${excludedWeekCount === 1 ? "week" : "weeks"} excluded)` : ""}.</p>
                    <details className="mt-3 text-xs text-muted-foreground">
                        <summary className="cursor-pointer">Weekly values</summary>
                        <ul className="mt-2 space-y-1">{data.map(point => <li key={point.dateKey}>{point.label}: {point.actual === null ? "No comparison data" : `Planned ${formatSecondsToDuration(point.planned!)} · Actual ${formatSecondsToDuration(point.actual)}`}</li>)}</ul>
                    </details>
                </>}
            </>}
        </InsightCard>
    );
}

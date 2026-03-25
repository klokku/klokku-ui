import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {BudgetPlanItemReport} from "@/api/types.ts";

interface BurndownChartProps {
    report: BudgetPlanItemReport;
}

export function BurndownChart({report}: BurndownChartProps) {
    const activeWeeks = report.weeks.filter((w) => !w.isOffWeek);
    if (activeWeeks.length === 0) return null;

    let cumulativeActual = 0;
    const data = [
        {
            label: "Start",
            remaining: report.totalBudgetPlanTime,
            ideal: report.totalBudgetPlanTime,
        },
        ...activeWeeks.map((w, i) => {
            cumulativeActual += w.actualTime;
            const remaining = Math.max(0, report.totalBudgetPlanTime - cumulativeActual);
            const ideal = Math.max(0, report.totalBudgetPlanTime * (1 - (i + 1) / activeWeeks.length));
            return {
                label: w.weekNumber.replace(/^\d{4}-/, ""),
                remaining,
                ideal: Math.round(ideal),
            };
        }),
    ];

    return (
        <Card className="py-4">
            <CardHeader className="px-4 pb-2">
                <CardTitle className="text-sm font-medium">Burndown</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                        <XAxis
                            dataKey="label"
                            tick={{fontSize: 11}}
                            className="text-muted-foreground"
                        />
                        <YAxis
                            tickFormatter={(v) => formatSecondsToDuration(v)}
                            tick={{fontSize: 11}}
                            className="text-muted-foreground"
                            width={60}
                        />
                        <Tooltip
                            formatter={(value: number, name: string) => [
                                formatSecondsToDuration(value),
                                name === "remaining" ? "Remaining" : "Ideal",
                            ]}
                        />
                        <Line
                            type="monotone"
                            dataKey="ideal"
                            stroke="#9ca3af"
                            strokeDasharray="5 5"
                            strokeWidth={1.5}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="remaining"
                            stroke={report.itemColor}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

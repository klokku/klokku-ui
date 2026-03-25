import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {BudgetPlanItemReport} from "@/api/types.ts";

interface CumulativeChartProps {
    report: BudgetPlanItemReport;
}

export function CumulativeChart({report}: CumulativeChartProps) {
    const activeWeeks = report.weeks.filter((w) => !w.isOffWeek);
    if (activeWeeks.length === 0) return null;

    let cumulative = 0;
    const data = [
        {label: "Start", cumulative: 0},
        ...activeWeeks.map((w) => {
            cumulative += w.actualTime;
            return {
                label: w.weekNumber.replace(/^\d{4}-/, ""),
                cumulative,
            };
        }),
    ];

    return (
        <Card className="py-4">
            <CardHeader className="px-4 pb-2">
                <CardTitle className="text-sm font-medium">Cumulative Time</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data}>
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
                            formatter={(value: number) => [
                                formatSecondsToDuration(value),
                                "Tracked",
                            ]}
                        />
                        <ReferenceLine
                            y={report.totalBudgetPlanTime}
                            stroke="#9ca3af"
                            strokeDasharray="5 5"
                            label={{value: "Budget", position: "right", fontSize: 11, fill: "#9ca3af"}}
                        />
                        <Area
                            type="monotone"
                            dataKey="cumulative"
                            stroke={report.itemColor}
                            fill={report.itemColor}
                            fillOpacity={0.15}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

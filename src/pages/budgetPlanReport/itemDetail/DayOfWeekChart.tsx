import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {BudgetPlanItemReport} from "@/api/types.ts";

interface DayOfWeekChartProps {
    report: BudgetPlanItemReport;
    weekFirstDay: "monday" | "sunday";
    mode: "average" | "total";
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DayOfWeekChart({report, mode}: DayOfWeekChartProps) {
    if (report.dayOfWeekAvg.length === 0) return null;

    const dataKey = mode === "average" ? "average" : "total";
    const title = mode === "average" ? "Average Time by Day of Week" : "Total Time by Day of Week";
    const tooltipLabel = mode === "average" ? "Average" : "Total";

    // dayOfWeekAvg is already ordered from the backend starting from user's week first day
    const data = report.dayOfWeekAvg.map((d) => ({
        day: DAY_NAMES[d.dayOfWeek],
        average: d.averageTime,
        total: d.totalTime,
    }));

    return (
        <Card className="py-4">
            <CardHeader className="px-4 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                        <XAxis
                            dataKey="day"
                            tick={{fontSize: 12}}
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
                                tooltipLabel,
                            ]}
                        />
                        <Bar
                            dataKey={dataKey}
                            fill={report.itemColor}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

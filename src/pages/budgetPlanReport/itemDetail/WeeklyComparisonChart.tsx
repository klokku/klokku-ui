import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {BudgetPlanItemReport} from "@/api/types.ts";

interface WeeklyComparisonChartProps {
    report: BudgetPlanItemReport;
}

export function WeeklyComparisonChart({report}: WeeklyComparisonChartProps) {
    if (report.weeks.length === 0) return null;

    const data = report.weeks.filter((w) => !w.isOffWeek).map((w) => ({
        label: w.weekNumber.replace(/^\d{4}-/, ""),
        budgetPlan: w.budgetPlanTime,
        weeklyPlan: w.weeklyPlanTime,
        actual: w.actualTime,
    }));

    return (
        <Card className="py-4">
            <CardHeader className="px-4 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Actual vs Planned</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
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
                            formatter={(value: number, name: string) => {
                                const labels: Record<string, string> = {
                                    budgetPlan: "Budget Plan",
                                    weeklyPlan: "Weekly Plan",
                                    actual: "Actual",
                                };
                                return [formatSecondsToDuration(value), labels[name] || name];
                            }}
                        />
                        <Legend
                            formatter={(value) => {
                                const labels: Record<string, string> = {
                                    budgetPlan: "Budget Plan",
                                    weeklyPlan: "Weekly Plan",
                                    actual: "Actual",
                                };
                                return labels[value] || value;
                            }}
                        />
                        <Bar dataKey="budgetPlan" fill="#d1d5db" radius={[2, 2, 0, 0]}/>
                        <Bar dataKey="weeklyPlan" fill="#93c5fd" radius={[2, 2, 0, 0]}/>
                        <Bar
                            dataKey="actual"
                            fill={report.itemColor}
                            radius={[2, 2, 0, 0]}
                            opacity={1}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

import {Cell, Pie, PieChart, Tooltip} from "recharts";
import {ChartContainer} from "@/components/ui/chart.tsx";
import {AllocationRow} from "@/components/dashboard/dashboardInsights.ts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";

export function BudgetAllocationDonut({rows, metric, total}: {
    rows: AllocationRow[];
    metric: "planned" | "actual";
    total: number;
}) {
    const title = metric === "planned" ? "Planned" : "Spent";
    return (
        <figure className="min-w-0 text-center">
            <figcaption className="font-medium text-sm mb-2">{title}</figcaption>
            <div className="relative h-[220px] mx-auto max-w-[340px]">
                {total > 0 ? <ChartContainer config={{}} className="h-full w-full aspect-auto" aria-label={`${title}: ${formatSecondsToDuration(total)}`}>
                    <PieChart accessibilityLayer>
                        <Tooltip formatter={(value, name) => [`${formatSecondsToDuration(Number(value))} · ${(Number(value) / total * 100).toFixed(1)}%`, name]}
                                 contentStyle={{backgroundColor: "var(--popover)", color: "var(--popover-foreground)", borderRadius: 8, borderColor: "var(--border)"}}/>
                        <Pie data={rows.filter(row => row[metric] > 0)} dataKey={metric} nameKey="name" innerRadius="68%" outerRadius="90%" stroke="var(--card)" strokeWidth={2} isAnimationActive={false}>
                            {rows.filter(row => row[metric] > 0).map(row => <Cell key={row.key} fill={row.color}/>)}
                        </Pie>
                    </PieChart>
                </ChartContainer> : <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true"><div className="size-44 rounded-full border-[18px] border-muted"/></div>}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-1">
                    <span className="text-xl font-semibold tabular-nums">{formatSecondsToDuration(total)}</span>
                    <span className="text-xs text-muted-foreground">{metric === "planned" ? "allocated" : "recorded"}</span>
                </div>
            </div>
            {total === 0 && <p className="text-xs text-muted-foreground">{metric === "planned" ? "No allocation this week" : "No time recorded this week"}</p>}
        </figure>
    );
}

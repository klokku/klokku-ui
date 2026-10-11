import {useState} from "react";
import {NavLink} from "react-router";
import {StatsSummary, WeeklyPlanItem} from "@/api/types.ts";
import {InsightCard, InsightState} from "@/components/dashboard/InsightCard.tsx";
import {BudgetAllocationDonut} from "@/components/dashboard/BudgetAllocationDonut.tsx";
import {getAllocationModel} from "@/components/dashboard/dashboardInsights.ts";
import {Button} from "@/components/ui/button.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {DashboardPeriod, formatDashboardDate, shiftDateKey} from "@/lib/dashboardDates.ts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {links, paths} from "@/pages/links.ts";

function share(duration: number, total: number) {
    return total > 0 ? `${(duration / total * 100).toFixed(1)}%` : "-";
}

export function WeeklyAllocationCard({items, stats, planId, period, timezone, planState, spentState}: {
    items: WeeklyPlanItem[];
    stats?: StatsSummary | null;
    planId?: number;
    period: DashboardPeriod;
    timezone: string;
    planState: InsightState;
    spentState: InsightState;
}) {
    const [showAll, setShowAll] = useState(false);
    const spentReady = !spentState.error && !spentState.isLoading;
    const model = getAllocationModel(items, spentReady ? stats : undefined, showAll);
    const params = new URLSearchParams({mode: "custom", from: period.weekStart.toISOString(), to: period.weekEnd.toISOString()});
    return (
        <InsightCard title="Weekly allocation" description={`${formatDashboardDate(period.weekStartKey, timezone)} - ${formatDashboardDate(shiftDateKey(period.weekStartKey, 6), timezone)} · Planned and recorded time`} state={planState}
                     footer={<>
                         {model.canExpand && <Button variant="ghost" size="sm" aria-expanded={showAll} onClick={() => setShowAll(!showAll)}>{showAll ? "Show fewer budgets" : "Show all budgets"}</Button>}
                         <div className="flex flex-wrap gap-4 ml-auto"><NavLink to={paths.weeklyPlanning.path} className="underline underline-offset-4">Review weekly plan</NavLink><NavLink to={paths.historyCurrentPlan.path} className="underline underline-offset-4">View weekly history</NavLink></div>
                     </>}>
            <>
                {items.length === 0 && <p className="mb-4 text-sm text-muted-foreground">Add budget items to set your weekly allocation.</p>}
                <div className="grid gap-6 xl:grid-cols-2 items-start">
                <div className="grid gap-6 sm:grid-cols-2">
                    <BudgetAllocationDonut rows={model.rows} metric="planned" total={model.plannedTotal}/>
                    {spentState.error ? <div role="alert" className="flex flex-col justify-center items-center gap-3 text-sm min-h-[250px]">
                        <p>Could not load spent time.</p><Button variant="outline" size="sm" onClick={spentState.onRetry}>Retry spent time</Button>
                    </div> : spentState.isLoading ? <div role="status" aria-label="Loading spent time" className="flex items-center justify-center min-h-[250px]"><Skeleton className="size-44 rounded-full"/></div>
                        : <BudgetAllocationDonut rows={model.rows} metric="actual" total={model.actualTotal}/>}
                </div>
                <table className="w-full table-fixed text-sm" aria-label="Weekly allocation by budget">
                    <colgroup><col className="w-1/2"/><col className="w-1/4"/><col className="w-1/4"/></colgroup>
                    <thead><tr className="border-b text-muted-foreground text-xs"><th scope="col" className="text-left py-2 font-medium">Budget</th><th scope="col" className="text-right py-2 font-medium">Planned</th><th scope="col" className="text-right py-2 font-medium">Spent</th></tr></thead>
                    <tbody>{model.rows.map(row => <tr key={row.key} className="border-b last:border-0">
                        <th scope="row" className="text-left font-medium py-2 pr-3">
                            <div className="flex items-center gap-2 min-w-0"><span className="size-2.5 rounded-full shrink-0" style={{backgroundColor: row.color}} aria-hidden="true"/>
                                {row.kind === "remaining" ? <button className="text-left hover:underline break-words min-w-0" onClick={() => setShowAll(true)}>{row.name}</button>
                                    : row.budgetItemId && planId ? <NavLink className="hover:underline break-words min-w-0" to={`${links.budgetPlanItemReport(planId, row.budgetItemId)}?${params}`}>{row.name}</NavLink>
                                        : <span className="break-words min-w-0">{row.name}</span>}
                            </div>
                        </th>
                        <td className="text-right py-2 align-top tabular-nums"><span>{formatSecondsToDuration(row.planned)}</span><span className="block text-xs text-muted-foreground">{share(row.planned, model.plannedTotal)}</span></td>
                        <td className="text-right py-2 align-top tabular-nums">{spentReady ? <><span>{formatSecondsToDuration(row.actual)}</span><span className="block text-xs text-muted-foreground">{share(row.actual, model.actualTotal)}</span></> : <span aria-label="Spent time unavailable">-</span>}</td>
                    </tr>)}</tbody>
                </table>
                </div>
            </>
        </InsightCard>
    );
}

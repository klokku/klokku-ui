import {useState} from "react";
import {NavLink} from "react-router";
import {Button} from "@/components/ui/button.tsx";
import {InsightCard, InsightState} from "@/components/dashboard/InsightCard.tsx";
import {balanceLabel, getBudgetBalances} from "@/components/dashboard/dashboardInsights.ts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {links, paths} from "@/pages/links.ts";
import {DashboardPeriod} from "@/lib/dashboardDates.ts";

export function BudgetBalanceCard({balances, planId, period, state}: {
    balances: ReturnType<typeof getBudgetBalances>;
    planId?: number;
    period: DashboardPeriod;
    state: InsightState;
}) {
    const [showAll, setShowAll] = useState(false);
    const params = new URLSearchParams({mode: "custom", from: period.weekStart.toISOString(), to: period.weekEnd.toISOString()});
    return (
        <InsightCard title="Budget balance" description="Largest differences from this week's allocation" state={state}
                     footer={<>
                         {balances.length > 5 && <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>{showAll ? "Show less" : "Show all"}</Button>}
                         <NavLink to={paths.historyCurrentPlan.path} className="ml-auto underline underline-offset-4">View history</NavLink>
                     </>}>
            {balances.length === 0 ? <p className="text-sm text-muted-foreground">Add budget items to see your weekly balance.</p> : (
                <ul className="space-y-4">
                    {(showAll ? balances : balances.slice(0, 5)).map(item => {
                        const scale = Math.max(item.planned, item.actual, 1);
                        return (
                            <li key={item.id} className="space-y-1.5">
                                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                                    <NavLink to={planId ? `${links.budgetPlanItemReport(planId, item.id)}?${params}` : paths.historyCurrentPlan.path} className="font-medium hover:underline break-words min-w-0">{item.name}</NavLink>
                                    <span className="text-muted-foreground text-xs">{balanceLabel(item.difference)}</span>
                                </div>
                                <div className="relative h-2.5 rounded-full bg-muted overflow-hidden" aria-hidden="true">
                                    <div className="h-full rounded-full" style={{width: `${item.actual / scale * 100}%`, backgroundColor: item.color || "var(--chart-1)"}}/>
                                    <div className="absolute top-0 bottom-0 border-l-2 border-foreground/70" style={{left: `calc(${item.planned / scale * 100}% - 2px)`}}/>
                                </div>
                                <p className="text-xs text-muted-foreground">Planned {formatSecondsToDuration(item.planned)} · Spent {formatSecondsToDuration(item.actual)}</p>
                            </li>
                        );
                    })}
                </ul>
            )}
            {balances.length > 0 && <p className="mt-3 text-xs text-muted-foreground">Colored bar: spent time · Vertical marker: planned allocation</p>}
        </InsightCard>
    );
}

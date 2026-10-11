import {NavLink} from "react-router";
import {InsightCard, InsightState} from "@/components/dashboard/InsightCard.tsx";
import {getWeeklyCompletion} from "@/components/dashboard/dashboardInsights.ts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {paths} from "@/pages/links.ts";

export function WeeklyBudgetCompletionCard({rows, state}: {
    rows: ReturnType<typeof getWeeklyCompletion>;
    state: InsightState;
}) {
    return (
        <InsightCard title="Weekly completion" description="Up to 5 recently active budgets · 100% = weekly allocation" state={state}
                     footer={<NavLink to={paths.historyCurrentPlan.path} className="ml-auto underline underline-offset-4">View weekly history</NavLink>}>
            {rows.length === 0 ? <p className="text-sm text-muted-foreground">Track time this week to see usage against your allocations.</p> : <>
                <ul className="space-y-4">
                    {rows.map(row => <li key={row.id} className="space-y-1.5">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                            <span className="font-medium break-words min-w-0">{row.name}{row.isCurrent && <span className="ml-2 text-xs font-normal text-muted-foreground">Tracking now</span>}</span>
                            <span className="font-semibold tabular-nums">{row.percent === null ? row.actual > 0 ? `Unplanned time: ${formatSecondsToDuration(row.actual)}` : "No allocation" : `${row.percent}%`}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatSecondsToDuration(row.actual)} spent / {formatSecondsToDuration(row.planned)} allocated</p>
                        {row.outsidePlan && <p className="text-xs text-muted-foreground">Outside this week's plan</p>}
                        {row.percent !== null && <div role="progressbar" aria-label={`${row.name} weekly allocation`} aria-valuemin={0} aria-valuemax={200}
                            aria-valuenow={Math.min(row.percent, 200)} aria-valuetext={`${row.percent}% · ${formatSecondsToDuration(row.actual)} spent of ${formatSecondsToDuration(row.planned)} allocated`}
                            className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                            <div className="absolute inset-y-0 left-0 rounded-l-full" style={{width: `${Math.min(row.percent, 100) / 2}%`, backgroundColor: row.color}}/>
                            <div className="absolute inset-y-0 left-1/2 opacity-50" style={{width: `${Math.max(0, Math.min(row.percent, 200) - 100) / 2}%`, backgroundColor: row.color}}/>
                            <div className="absolute inset-y-0 left-1/2 border-l-2 border-foreground/60" aria-hidden="true"/>
                        </div>}
                    </li>)}
                </ul>
                <p className="text-xs text-muted-foreground mt-4">Marker: 100% allocation · Lighter segment: overflow · Bars display up to 200%; labels show full usage.</p>
            </>}
        </InsightCard>
    );
}

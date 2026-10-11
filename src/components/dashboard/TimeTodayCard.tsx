import {NavLink} from "react-router";
import {InsightCard, InsightState} from "@/components/dashboard/InsightCard.tsx";
import {getTodayBreakdown} from "@/components/dashboard/dashboardInsights.ts";
import {DashboardPeriod} from "@/lib/dashboardDates.ts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {links, paths} from "@/pages/links.ts";

export function TimeTodayCard({today, planId, period, state}: {
    today: ReturnType<typeof getTodayBreakdown>;
    planId?: number;
    period: DashboardPeriod;
    state: InsightState;
}) {
    const params = new URLSearchParams({mode: "custom", from: period.weekStart.toISOString(), to: period.weekEnd.toISOString()});
    return (
        <InsightCard title="Time today" description="Recorded time in this plan today" state={state}
                     footer={<NavLink to={paths.calendar.path} className="ml-auto underline underline-offset-4">View calendar</NavLink>}>
            <p className="mb-5"><span className="text-2xl font-semibold tabular-nums">{formatSecondsToDuration(today.total)}</span><span className="ml-2 text-sm text-muted-foreground">recorded</span></p>
            {today.rows.length === 0 ? <p className="text-sm text-muted-foreground">No time recorded today.</p> : <ul className="space-y-4">
                {today.rows.map(row => <li key={row.id} className="space-y-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                        <div className="flex items-center gap-2 min-w-0"><span className="size-2.5 rounded-full shrink-0" style={{backgroundColor: row.color}} aria-hidden="true"/>
                            <NavLink to={planId ? `${links.budgetPlanItemReport(planId, row.id)}?${params}` : paths.historyCurrentPlan.path} className="font-medium break-words min-w-0 hover:underline">{row.name}</NavLink>
                        </div>
                        <span className="text-right tabular-nums"><span className="font-semibold">{formatSecondsToDuration(row.actual)}</span><span className="block text-xs text-muted-foreground">{row.share.toFixed(1)}%</span></span>
                    </div>
                    {row.isCurrent && <p className="text-xs text-muted-foreground">Tracking now</p>}
                    <div className="h-2 rounded-full bg-muted overflow-hidden" aria-hidden="true" title={`${row.share.toFixed(1)}% of recorded time today`}>
                        <div className="h-full rounded-full" style={{width: `${row.share}%`, backgroundColor: row.color}}/>
                    </div>
                    <span className="sr-only">{row.share.toFixed(1)}% of recorded time today</span>
                </li>)}
            </ul>}
        </InsightCard>
    );
}

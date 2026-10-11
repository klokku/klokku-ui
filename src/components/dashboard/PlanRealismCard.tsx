import {useState} from "react";
import {NavLink} from "react-router";
import {Button} from "@/components/ui/button.tsx";
import {InsightCard, InsightState} from "@/components/dashboard/InsightCard.tsx";
import {getPlanRealism} from "@/components/dashboard/dashboardInsights.ts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {paths} from "@/pages/links.ts";

function averageDifference(difference: number) {
    if (Math.abs(difference) < 60) return "At allocation";
    return `${formatSecondsToDuration(Math.abs(difference))} ${difference > 0 ? "above" : "below"}/week`;
}

export function PlanRealismCard({rows, description, state}: {
    rows: ReturnType<typeof getPlanRealism>;
    description: string;
    state: InsightState;
}) {
    const [showAll, setShowAll] = useState(false);
    return (
        <InsightCard title="Plan realism" description={<>{description}<br/>Average weekly plan versus actual time</>} state={state}
                     footer={<>
                         {rows.length > 5 && <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>{showAll ? "Show less" : "Show all"}</Button>}
                         <NavLink to={paths.weeklyPlanning.path} className="ml-auto underline underline-offset-4">Review weekly plan</NavLink>
                     </>}>
            {rows.length === 0 ? <p className="text-sm text-muted-foreground">Add budget items to compare plans with actual time.</p> : <>
                <div role="table" aria-label="Average weekly planned and actual time" className="text-sm">
                    <div role="row" className="hidden sm:grid grid-cols-[minmax(0,1fr)_5rem_5rem] gap-3 text-xs text-muted-foreground pb-2 border-b">
                        <span role="columnheader">Budget / pattern</span><span role="columnheader" className="text-right">Planned</span><span role="columnheader" className="text-right">Actual</span>
                    </div>
                    {(showAll ? rows : rows.slice(0, 5)).map(row => <div role="row" key={row.id} className="grid sm:grid-cols-[minmax(0,1fr)_5rem_5rem] gap-2 sm:gap-3 py-3 border-b last:border-0">
                        <div role="cell" className="min-w-0">
                            <div className="flex items-center gap-2"><span className="size-2 rounded-full shrink-0" style={{backgroundColor: row.color || "var(--chart-1)"}}/><span className="font-medium break-words">{row.name}</span></div>
                            {row.enoughHistory ? <>
                                <p className="text-xs mt-1">{averageDifference(row.difference)}</p>
                            </> : <p className="text-xs text-muted-foreground mt-1">Not enough history · {row.count}/4 weeks needed</p>}
                            {row.count > 0 && <p className="text-xs text-muted-foreground mt-1">Below in {row.below}/{row.count} weeks · Above in {row.above}/{row.count}</p>}
                        </div>
                        <div role="cell" className="sm:text-right text-xs sm:text-sm"><span className="sm:hidden text-muted-foreground">Average planned: </span>{row.count ? formatSecondsToDuration(row.planned) : "-"}</div>
                        <div role="cell" className="sm:text-right text-xs sm:text-sm"><span className="sm:hidden text-muted-foreground">Average actual: </span>{row.count ? formatSecondsToDuration(row.actual) : "-"}</div>
                    </div>)}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Uses each week's adjusted allocation, including zero-activity weeks after tracking begins. At least 4 completed, non-off weeks are needed.</p>
            </>}
        </InsightCard>
    );
}

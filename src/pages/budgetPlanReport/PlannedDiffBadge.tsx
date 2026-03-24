import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

interface PlannedDiffBadgeProps {
    budgetPlanTime: number;  // seconds
    weeklyPlanTime: number;  // seconds
}

export function PlannedDiffBadge({budgetPlanTime, weeklyPlanTime}: PlannedDiffBadgeProps) {
    if (budgetPlanTime === 0 || budgetPlanTime === weeklyPlanTime) {
        return null;
    }

    const diff = weeklyPlanTime - budgetPlanTime;
    const pctDiff = Math.round((diff / budgetPlanTime) * 100);
    const sign = pctDiff > 0 ? "+" : "";

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="secondary" className="text-xs font-normal ml-1.5 cursor-default">
                        {sign}{pctDiff}%
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="text-xs">
                        {diff > 0 ? "+" : "-"}{formatSecondsToDuration(diff, true)} vs budget plan
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

interface CompletionCellProps {
    actual: number;           // seconds
    planned: number;          // seconds
    averagePerWeek?: number;  // seconds
    averagePerDay?: number;   // seconds
}

function completionColor(percentage: number): string {
    if (percentage > 100) return "bg-red-100";
    if (percentage > 90) return "bg-green-200";
    return "bg-green-100";
}

export function CompletionCell({actual, planned, averagePerWeek, averagePerDay}: CompletionCellProps) {
    if (planned === 0) {
        return <span>{formatSecondsToDuration(planned)}</span>;
    }

    const percentage = (actual / planned) * 100;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="relative w-full h-full py-2 px-2 cursor-default">
                        <div
                            className={"absolute inset-y-1 left-0.5 rounded-sm " + completionColor(percentage)}
                            style={{
                                width: `${Math.min(percentage, 100)}%`,
                            }}
                        />
                        <span className="relative z-10">
                            {formatSecondsToDuration(planned)}
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="text-xs">
                        <div>Actual: {formatSecondsToDuration(actual)}</div>
                        <div>Completion: {Math.round(percentage)}%</div>
                        <div>Remaining: {formatSecondsToDuration(planned - actual)}</div>
                        {averagePerWeek !== undefined && <div>Avg / week: {formatSecondsToDuration(averagePerWeek)}</div>}
                        {averagePerDay !== undefined && <div>Avg / day: {formatSecondsToDuration(averagePerDay)}</div>}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

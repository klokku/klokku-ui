import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {differenceInSeconds} from "date-fns";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {ReplaceIcon, TimerIcon, TriangleAlertIcon} from "lucide-react";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {CurrentEvent, StatsSummary} from "@/api/types.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import {ProgressCell} from "@/pages/history/ProgressCell.tsx";

interface WeeklyStatisticsProps {
    weekData?: StatsSummary
    currentEvent?: CurrentEvent
}

export function WeeklyHistory({weekData, currentEvent}: WeeklyStatisticsProps) {

    const isCurrent = (budgetItemId: number) => {
        return currentEvent?.planItem.budgetItemId == budgetItemId;
    }

    const currentEventDuration = () => {
        if (!currentEvent) {
            return "";
        }
        const diffInSec = differenceInSeconds(new Date(), new Date(currentEvent.startTime));
        return formatSecondsToDuration(diffInSec);
    }

    if (!weekData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner className="size-6"/>
            </div>
        )
    }

    return (
        <div className="rounded-sm border overflow-hidden shadow-xs">
            <Table className="w-full border-collapse">
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead className="w-[150px]"></TableHead>
                        <TableHead className="font-medium">PLANNED</TableHead>
                        <TableHead className="font-medium">TOTAL</TableHead>
                        <TableHead className="font-medium">REMAINING</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {weekData!.perPlanItem.map((stat) => (
                        <TableRow className="h-full p-0" key={stat.planItem.budgetItemId}>
                            <TableCell className="font-medium bg-gray-50 flex items-center space-x-2">
                                <span>{stat.planItem.name}</span>
                                {stat.planItem.budgetItemId && isCurrent(stat.planItem.budgetItemId) && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <TimerIcon className="size-4"/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {currentEventDuration()}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <div>
                                        {formatSecondsToDuration(stat.planItem.weeklyItemDuration)}
                                    </div>
                                    {stat.planItem.weeklyItemDuration !== stat.planItem.budgetItemDuration && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <ReplaceIcon className="size-4"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Original time: {formatSecondsToDuration(stat.planItem.budgetItemDuration)}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="h-full p-0 bg-gray-50">
                                <ProgressCell duration={stat.duration}
                                              maxDuration={stat.planItem.weeklyItemDuration}/>
                            </TableCell>
                            <TableCell>{formatSecondsToDuration(stat.remaining)}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow className="h-full p-0 bg-gray-100">
                        <TableCell className="font-bold">SUM</TableCell>
                        <TableCell className="flex items-center space-x-2">
                            <span>{formatSecondsToDuration(weekData!.totalPlanned)}</span>
                            {weekData!.totalPlanned != 7 * 24 * 60 * 60 &&
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger className="p-0 border-0 bg-muted">
                                            <TriangleAlertIcon className="size-4 text-orange-400"/>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Should be 168h 0m to have a full week planned
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            }
                        </TableCell>
                        <TableCell>{formatSecondsToDuration(weekData!.totalTime)}</TableCell>
                        <TableCell>{formatSecondsToDuration(weekData!.totalRemaining)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}

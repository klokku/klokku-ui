import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {differenceInSeconds} from "date-fns";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {TextAlignStartIcon, TimerIcon, TriangleAlertIcon} from "lucide-react";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {CurrentEvent, StatsSummary} from "@/api/types.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import {ProgressCell} from "@/pages/history/ProgressCell.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Badge} from "@/components/ui/badge.tsx";

interface WeeklyStatisticsProps {
    weekData?: StatsSummary
    currentEvent?: CurrentEvent | null
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
                    {weekData!.perPlanItem.map((stat) => {
                        const diff = stat.planItem.weeklyItemDuration - stat.planItem.budgetItemDuration;
                        const isModified = stat.planItem.weeklyItemDuration !== stat.planItem.budgetItemDuration;
                        return (
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
                                <div className="flex items-center gap-1.5">
                                    {/* Duration value */}
                                    {!isModified && (
                                        <span>{formatSecondsToDuration(stat.planItem.weeklyItemDuration)}</span>
                                    )}
                                    {isModified && (
                                        <span className="font-medium">{formatSecondsToDuration(stat.planItem.weeklyItemDuration)}</span>
                                    )}
                                    {isModified && !stat.planItem.notes && (
                                        <Badge variant="secondary" className="text-xs font-normal">
                                            {diff > 0 ? '+' : '-'}{formatSecondsToDuration(diff, true)}
                                        </Badge>
                                    )}
                                    {stat.planItem.notes && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Badge variant="secondary" className="text-xs font-normal cursor-pointer">
                                                    {isModified && (
                                                        <span>{diff > 0 ? '+' : '-'}{formatSecondsToDuration(diff, true)}</span>
                                                    )}
                                                    <TextAlignStartIcon className="size-3.5 text-gray-400 ml-1"/>
                                                </Badge>
                                            </PopoverTrigger>
                                            <PopoverContent className="max-w-xs">
                                                <p className="text-sm whitespace-pre-wrap">{stat.planItem.notes}</p>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="h-full p-0 bg-gray-50">
                                <ProgressCell duration={stat.duration}
                                              maxDuration={stat.planItem.weeklyItemDuration}/>
                            </TableCell>
                            <TableCell>{formatSecondsToDuration(stat.remaining)}</TableCell>
                        </TableRow>
                        );
                    })}
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

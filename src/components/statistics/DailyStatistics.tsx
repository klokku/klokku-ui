import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {differenceInSeconds, isToday} from "date-fns";
import {userSettings} from "@/components/settings.ts";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {TimerIcon} from "lucide-react";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {ProgressCell} from "@/components/statistics/ProgressCell.tsx";
import {StatsSummary} from "@/api/types.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import {Event} from "@/api/types.ts";

interface DailyStatisticsProps {
    weekData?: StatsSummary
    currentEvent?: Event
}

export function DailyStatistics({weekData, currentEvent}: DailyStatisticsProps) {

    const isCurrent = (budgetId: number) => {
        return currentEvent?.budget.id == budgetId;
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
        <div className="rounded-md border overflow-hidden shadow-xs">
            <Table className="w-full border-collapse">
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead className="w-[150px]"></TableHead>
                        {weekData!.days.map((day) => (
                            <TableHead
                                key={day.date}
                                className={isToday(new Date(day.date)) ? "bg-blue-100" : ""}>
                                {new Date(day.date).toLocaleDateString(userSettings.locale)}
                            </TableHead>
                        ))}
                        <TableHead className="font-medium">TOTAL</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {weekData!.budgets.map((stat) => (
                        <TableRow className="h-full p-0" key={stat.budget.id}>
                            <TableCell className="font-medium bg-gray-50 flex items-center space-x-2">
                                <span>{stat.budget.name}</span>
                                {stat.budget.id && isCurrent(stat.budget.id) && (
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
                            {weekData!.days.map((day) => (
                                <TableCell
                                    key={day.date}
                                    className={isToday(new Date(day.date)) ? "bg-blue-50" : ""}
                                >
                                    {formatSecondsToDuration(day.budgets.find(it => it.budget.id == stat.budget.id)?.duration ?? 0)}
                                </TableCell>
                            ))}
                            <TableCell className="font-medium bg-gray-50 p-0">
                                <ProgressCell duration={stat.duration}
                                              maxDuration={stat.budgetOverride?.weeklyTime || stat.budget.weeklyTime}/>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

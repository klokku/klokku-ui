import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {differenceInSeconds} from "date-fns";
import {userSettings} from "@/components/settings.ts";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {TimerIcon} from "lucide-react";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {StatsSummary} from "@/api/types.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import {CurrentEvent} from "@/api/types.ts";
import {ProgressCell} from "@/pages/history/ProgressCell.tsx";
import useProfile from "@/api/useProfile.ts";
import {dateKeyInTimezone} from "@/lib/dashboardDates.ts";

interface DailyStatisticsProps {
    weekData?: StatsSummary
    currentEvent?: CurrentEvent | null
}

export function DailyHistory({weekData, currentEvent}: DailyStatisticsProps) {
    const {currentProfile} = useProfile();
    const timezone = currentProfile?.settings.timezone ?? "UTC";
    const todayKey = dateKeyInTimezone(new Date(), timezone);

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
        <div className="rounded-md border overflow-hidden shadow-xs">
            <Table className="w-full border-collapse">
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead className="w-[150px]"></TableHead>
                        {weekData!.perDay.map((day) => (
                            <TableHead
                                key={day.date}
                                className={dateKeyInTimezone(day.date, timezone) === todayKey ? "bg-blue-100" : ""}>
                                 {new Date(day.date).toLocaleDateString(userSettings.locale, {timeZone: timezone})}
                            </TableHead>
                        ))}
                        <TableHead className="font-medium">TOTAL</TableHead>
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
                            {weekData!.perDay.map((day) => (
                                <TableCell
                                    key={day.date}
                                    className={dateKeyInTimezone(day.date, timezone) === todayKey ? "bg-blue-50" : ""}
                                >
                                    {formatSecondsToDuration(day.perPlanItem.find(it => it.planItem.budgetItemId == stat.planItem.budgetItemId)?.duration ?? 0)}
                                </TableCell>
                            ))}
                            <TableCell className="font-medium bg-gray-50 p-0">
                                <ProgressCell duration={stat.duration}
                                              maxDuration={stat.planItem.weeklyItemDuration}/>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

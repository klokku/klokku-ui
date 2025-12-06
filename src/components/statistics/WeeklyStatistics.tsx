import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {differenceInSeconds} from "date-fns";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {ReplaceIcon, TimerIcon, TriangleAlertIcon} from "lucide-react";
import {formatSecondsToDuration, weekEndDay} from "@/lib/dateUtils.ts";
import {ProgressCell} from "@/components/statistics/ProgressCell.tsx";
import {Budget, BudgetOverride, BudgetStats, StatsSummary} from "@/api/types.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import {Event} from "@/api/types.ts";
import {PlannedTimeDialog} from "@/components/statistics/PlannedTimeDialog.tsx";
import BudgetDetailsDialog from "@/pages/planning/BudgetDetailsDialog.tsx";
import {useState} from "react";
import useBudgetOverrides from "@/api/useBudgetOverrides.ts";

interface WeeklyStatisticsProps {
    weekData?: StatsSummary
    currentEvent?: Event
}

export function WeeklyStatistics({weekData, currentEvent}: WeeklyStatisticsProps) {

    const [overrideDialogOpen, setOverrideDialogOpen] = useState(false)
    const [editedBudgetOverride, setEditedBudgetOverride] = useState<BudgetOverride | undefined>(undefined)
    const [editedBudget, setEditedBudget] = useState<Budget | undefined>(undefined)
    const [budgetStatsDetails, setBudgetStatsDetails] = useState<BudgetStats | undefined>(undefined)
    const [budgetStatsDetailsDialogOpen, setBudgetStatsDetailsDialogOpen] = useState(false)

    function openOverrideDialog(budget: Budget, override: BudgetOverride | undefined) {
        setEditedBudget(budget)
        setEditedBudgetOverride(override)
        setOverrideDialogOpen(true)
    }


    function openBudgetDetailsDialog(budgetStats: BudgetStats) {
        setBudgetStatsDetails(budgetStats)
        setBudgetStatsDetailsDialogOpen(true)
    }

    const {createBudgetOverride, updateBudgetOverride, deleteBudgetOverride} = useBudgetOverrides()

    function saveOverride(budgetOverride: BudgetOverride) {
        if (budgetOverride.id) {
            updateBudgetOverride(budgetOverride)
        } else {
            createBudgetOverride(budgetOverride)
        }
    }

    function deleteOverride(budgetOverrideId: number) {
        deleteBudgetOverride(budgetOverrideId)
    }

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
                    {weekData!.budgets.map((stat) => (
                        <TableRow className="h-full p-0" key={stat.budget.id}>
                            <TableCell className="font-medium bg-gray-50 flex items-center space-x-2">
                                <span className="cursor-pointer" onClick={() => openBudgetDetailsDialog(stat)}>{stat.budget.name}</span>
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
                            <TableCell className="cursor-pointer" onClick={() => openOverrideDialog(stat.budget, stat.budgetOverride)}>
                                <div className="flex items-center space-x-2">
                                    <div>
                                        {formatSecondsToDuration(stat.budgetOverride ? stat.budgetOverride.weeklyTime : stat.budget.weeklyTime)}
                                    </div>
                                    {stat.budgetOverride && (
                                        <ReplaceIcon className="size-4"/>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="h-full p-0 bg-gray-50">
                                <ProgressCell duration={stat.duration}
                                              maxDuration={stat.budgetOverride ? stat.budgetOverride.weeklyTime : stat.budget.weeklyTime}/>
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

            {overrideDialogOpen && editedBudget &&
                <PlannedTimeDialog open={overrideDialogOpen}
                                   onOpenChange={setOverrideDialogOpen}
                                   budget={editedBudget}
                                   budgetOverride={editedBudgetOverride}
                                   currentWeekStartDate={new Date(weekData.startDate)}
                                   onSave={saveOverride}
                                   onDelete={deleteOverride}
                />
            }
            {
                budgetStatsDetailsDialogOpen && budgetStatsDetails && (
                    <BudgetDetailsDialog
                        open={budgetStatsDetailsDialogOpen}
                        onOpenChange={setBudgetStatsDetailsDialogOpen}
                        budgetStats={budgetStatsDetails}
                        periodStart={new Date(weekData.startDate)}
                        periodEnd={weekEndDay(new Date(weekData.startDate))}
                    />
                )
            }
        </div>
    )
}

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {CheckCircleIcon, EqualIcon, MinusIcon, PlusIcon, ReplaceIcon, TextAlignStartIcon, TriangleAlertIcon} from "lucide-react";
import {formatSecondsToDuration, getCurrentWeekFirstDay, nextWeekStart, previousWeekStart, weekEndDay} from "@/lib/dateUtils.ts";
import {PlannedTimeDialog} from "@/components/statistics/PlannedTimeDialog.tsx";
import BudgetDetailsDialog from "@/pages/planning/BudgetDetailsDialog.tsx";
import useStats from "@/api/useStats.ts";
import useProfile from "@/api/useProfile.ts";
import {defaultSettings} from "@/components/settings.ts";
import {createElement, useState} from "react";
import {Spinner} from "@/components/ui/spinner.tsx";
import {Budget, BudgetOverride, BudgetStats} from "@/api/types.ts";
import useBudgetOverrides from "@/api/useBudgetOverrides.ts";
import {WeekChooser} from "@/components/statistics/weekChooser.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Square2StackIcon} from "@heroicons/react/24/outline";
import * as Icons from "@heroicons/react/24/solid";

export default function PlanningPage() {

    const {currentProfile} = useProfile();
    const initialWeekFirstDay = getCurrentWeekFirstDay(currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay)
    const [weekFirstDay, setWeekFirstDay] = useState(initialWeekFirstDay)

    function onNextWeek() {
        setWeekFirstDay(nextWeekStart(weekFirstDay))
    }

    function onPreviousWeek() {
        setWeekFirstDay(previousWeekStart(weekFirstDay))
    }

    function onWeekChanged(date: Date) {
        setWeekFirstDay(date)
    }

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

    function getUpDownIcon(value: number) {
        if (value > 0) {
            return <PlusIcon className="size-4 text-muted-foreground"/>
        } else if (value < 0) {
            return <MinusIcon className="size-4 text-muted-foreground"/>
        } else {
            return <EqualIcon className="size-4 text-muted-foreground"/>
        }
    }

    const {isLoading, statsSummary} = useStats(weekFirstDay, weekEndDay(weekFirstDay))
    const weekData = statsSummary

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner className="size-6"/>
            </div>
        )
    }

    const totalOriginalTime = weekData!.budgets.reduce((acc, budget) => acc + budget.budget.weeklyTime, 0)
    const totalOverrideTimeDiff = weekData!.budgets.reduce(
        (acc, budget) => {
            return acc + ((budget?.budgetOverride?.weeklyTime ?? budget.budget.weeklyTime) - budget.budget.weeklyTime)
        },
        0
    )

    const getIcon = (iconName: string, className: string) => {
        const key = iconName as keyof typeof Icons;
        const iconComponent = Icons[key] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
        return iconComponent ? createElement(iconComponent, {className}) : null
    };

    return (
        <div className="flex-grow flex flex-col gap-2">
            <WeekChooser currentWeekStart={weekFirstDay} onNext={onNextWeek} onPrevious={onPreviousWeek} onDateChanged={onWeekChanged}/>
            <div className="rounded-sm border overflow-hidden shadow-xs">
                <Table className="w-full border-collapse">
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="w-[150px]"></TableHead>
                            <TableHead className="font-medium">Original</TableHead>
                            <TableHead className="font-medium">Override</TableHead>
                            <TableHead className="font-medium hidden">Tasks</TableHead>
                            <TableHead className="font-medium">Planned</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {weekData!.budgets.map((stat) => (
                            <TableRow className="h-full p-0" key={stat.budget.id}>
                                <TableCell className="font-medium flex items-center space-x-2  py-3 pr-4">
                                    {stat.budget.icon && getIcon(stat.budget.icon, "size-5 text-gray-500")}
                                    {!stat.budget.icon && <Square2StackIcon className="size-5 text-gray-500"/>}
                                    <span className="cursor-pointer" onClick={() => openBudgetDetailsDialog(stat)}>{stat.budget.name}</span>
                                </TableCell>
                                <TableCell>
                                    {formatSecondsToDuration(stat.budget.weeklyTime)}
                                </TableCell>
                                <TableCell className="cursor-pointer" onClick={() => openOverrideDialog(stat.budget, stat.budgetOverride)}>
                                    {stat.budgetOverride && (
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center space-x-0.5">
                                                <div>
                                                    {getUpDownIcon(stat.budgetOverride.weeklyTime - stat.budget.weeklyTime)}
                                                </div>
                                                <div>
                                                    {formatSecondsToDuration(stat.budgetOverride.weeklyTime - stat.budget.weeklyTime, true)}
                                                </div>
                                            </div>
                                            {stat.budgetOverride.notes && (
                                                <div>
                                                    <TextAlignStartIcon className="size-4 text-muted-foreground"/>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {!stat.budgetOverride && (
                                        <Badge variant="outline" className="text-muted-foreground">
                                            Add
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="h-full p-0 hidden">
                                    Unavailable
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <div>
                                            {formatSecondsToDuration(stat.budgetOverride ? stat.budgetOverride.weeklyTime : stat.budget.weeklyTime)}
                                        </div>
                                        {stat.budgetOverride && (
                                            <ReplaceIcon className="size-4"/>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="h-full p-0 bg-gray-100">
                            <TableCell className="font-bold">TOTAL</TableCell>
                            <TableCell className="flex items-center space-x-2">
                                <span>{formatSecondsToDuration(totalOriginalTime)}</span>
                                {(totalOriginalTime !== 7 * 24 * 60 * 60) && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger className="p-0 border-0">
                                                <TriangleAlertIcon className="size-4 text-orange-400"/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Original Budget Plan should have 168h 0m
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{formatSecondsToDuration(totalOverrideTimeDiff)}</span>
                                    {(totalOverrideTimeDiff === 0) && (
                                        <CheckCircleIcon className="size-4 text-green-500"/>
                                    )}
                                    {(totalOverrideTimeDiff !== 0) && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger className="p-0 border-0 bg-muted">
                                                    <TriangleAlertIcon className="size-4 text-orange-400"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Override should be 0h 0m to have a full week planned
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="hidden">
                                Unavailable
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{formatSecondsToDuration(weekData!.totalPlanned)}</span>
                                    {weekData!.totalPlanned === 7 * 24 * 60 * 60 &&
                                        <CheckCircleIcon className="size-4 text-green-500"/>
                                    }
                                    {weekData!.totalPlanned !== 7 * 24 * 60 * 60 &&
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
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                {overrideDialogOpen && editedBudget && weekData &&
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
                    budgetStatsDetailsDialogOpen && budgetStatsDetails && weekData && (
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
        </div>
    )
}

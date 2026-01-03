import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {CheckCircleIcon, EqualIcon, MinusIcon, PlusIcon, ReplaceIcon, TextAlignStartIcon, TriangleAlertIcon} from "lucide-react";
import {formatSecondsToDuration, getCurrentWeekFirstDay, nextWeekStart, previousWeekStart, weekEndDay} from "@/lib/dateUtils.ts";
import WeeklyItemDetailsDialog from "@/pages/planning/WeeklyItemDetailsDialog.tsx";
import useProfile from "@/api/useProfile.ts";
import {defaultSettings} from "@/components/settings.ts";
import {createElement, useState} from "react";
import {Spinner} from "@/components/ui/spinner.tsx";
import {BudgetPlanItem, WeeklyPlanItem} from "@/api/types.ts";
import useWeeklyPlan from "@/api/useWeeklyPlan.ts";
import {WeekChooser} from "@/components/statistics/weekChooser.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Square2StackIcon} from "@heroicons/react/24/outline";
import * as Icons from "@heroicons/react/24/solid";
import {WeeklyItemDurationEditDialog} from "@/pages/planning/WeeklyItemDurationEditDialog.tsx";
import useBudgetPlan from "@/api/useBudgetPlan.ts";

type WeeklyOverride = {
    budgetItemId: number
    weeklyDuration: number
    notes: string
}

export default function WeeklyPlanningPage() {

    const {currentProfile} = useProfile();
    const initialWeekFirstDay = getCurrentWeekFirstDay(currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay)
    const [weekFirstDay, setWeekFirstDay] = useState(initialWeekFirstDay)

    // TODO add link to reset the whole weekly plan to original budget plan
    const {weeklyPlan, isLoading, updateWeeklyPlanItem, resetWeeklyPlanItem, resetWeeklyPlan} = useWeeklyPlan(weekFirstDay)
    const {budgetPlanDetails, isLoadingBudgetPlanDetails} = useBudgetPlan(weeklyPlan?.budgetPlanId)

    const [weeklyDurationEditDialogOpen, setWeeklyDurationEditDialogOpen] = useState(false)
    const [editedWeeklyItem, setEditedWeeklyItem] = useState<WeeklyPlanItem | undefined>(undefined)
    const [editedItemBudgetItem, setEditedItemBudgetItem] = useState<BudgetPlanItem | undefined>(undefined)
    const [weeklyItemDetails, setWeeklyItemDetails] = useState<WeeklyPlanItem | undefined>(undefined)
    const [weeklyItemDetailsDialogOpen, setWeeklyItemDetailsDialogOpen] = useState(false)

    if (!weeklyPlan || isLoading || isLoadingBudgetPlanDetails || !budgetPlanDetails) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner className="size-6"/>
            </div>
        )
    }

    function onNextWeek() {
        setWeekFirstDay(nextWeekStart(weekFirstDay))
    }

    function onPreviousWeek() {
        setWeekFirstDay(previousWeekStart(weekFirstDay))
    }

    function onWeekChanged(date: Date) {
        setWeekFirstDay(date)
    }

    function openOverrideDialog(weeklyItem: WeeklyPlanItem, budgetPlanItem: BudgetPlanItem) {
        setEditedWeeklyItem(weeklyItem)
        setEditedItemBudgetItem(budgetPlanItem)
        setWeeklyDurationEditDialogOpen(true)
    }

    function openItemDetailsDialog(weeklyPlanItem: WeeklyPlanItem) {
        setWeeklyItemDetails(weeklyPlanItem)
        setWeeklyItemDetailsDialogOpen(true)
    }

    async function saveWeeklyItem(weeklyOverride: WeeklyOverride) {
        await updateWeeklyPlanItem(weekFirstDay, weeklyOverride)
    }

    async function resetWeeklyItem(weeklyPlanItemId: number) {
        await resetWeeklyPlanItem(weeklyPlanItemId)
    }

    async function resetPlan() {
        await resetWeeklyPlan(weekFirstDay)
    }

    function isWeeklyItemModified(weeklyItem: WeeklyPlanItem, budgetItem: BudgetPlanItem): boolean {
        return weeklyItem.weeklyDuration !== budgetItem.weeklyDuration || weeklyItem.notes !== ""
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

    const totalOriginalTime = budgetPlanDetails!.items.reduce((acc, item) => acc + item.weeklyDuration, 0)
    const joinedItems = weeklyPlan!.items.map(weeklyItem => {
        const budgetItem = budgetPlanDetails!.items.find(b => b.id === weeklyItem.budgetItemId)
        if (!budgetItem) {
            console.error(`Budget item not found for weekly plan item with ID: ${weeklyItem.budgetItemId}`)
            return null
        }
        return {budgetItem, weeklyItem}
    }).filter(item => item !== null)
    const totalOverrideTimeDiff = joinedItems.reduce(
            (acc, item) => {
                return acc + (item.weeklyItem.weeklyDuration - item.budgetItem.weeklyDuration)
            },
            0
        )
    const totalPlannedTime = weeklyPlan.items.reduce((acc, item) => acc + item.weeklyDuration, 0)

    const getIcon = (iconName: string, className: string) => {
        const key = iconName as keyof typeof Icons;
        const iconComponent = Icons[key] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
        return iconComponent ? createElement(iconComponent, {className}) : null
    };

    return (
        <div className="grow flex flex-col gap-2">
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
                        {joinedItems.map(({weeklyItem, budgetItem}) => (
                            <TableRow className="h-full p-0" key={weeklyItem.budgetItemId}>
                                <TableCell className="font-medium flex items-center space-x-2  py-3 pr-4">
                                    {weeklyItem.icon && getIcon(weeklyItem.icon, "size-5 text-gray-500")}
                                    {!weeklyItem.icon && <Square2StackIcon className="size-5 text-gray-500"/>}
                                    <span className="cursor-pointer" onClick={() => openItemDetailsDialog(weeklyItem)}>{weeklyItem.name}</span>
                                </TableCell>
                                <TableCell>
                                    {formatSecondsToDuration(weeklyItem.weeklyDuration)}
                                </TableCell>
                                <TableCell className="cursor-pointer" onClick={() => openOverrideDialog(weeklyItem, budgetItem)}>
                                    {isWeeklyItemModified(weeklyItem, budgetItem) && (
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center space-x-0.5">
                                                <div>
                                                    {getUpDownIcon(weeklyItem.weeklyDuration - budgetItem.weeklyDuration)}
                                                </div>
                                                <div>
                                                    {formatSecondsToDuration(weeklyItem.weeklyDuration - budgetItem.weeklyDuration, true)}
                                                </div>
                                            </div>
                                            {weeklyItem.notes && ( // TODO something better?
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <TextAlignStartIcon className="size-4 text-muted-foreground"/>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {weeklyItem.notes}
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                    )}
                                    {!isWeeklyItemModified(weeklyItem, budgetItem) && (
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
                                            {formatSecondsToDuration(weeklyItem.weeklyDuration)}
                                        </div>
                                        {isWeeklyItemModified(weeklyItem, budgetItem) && (
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
                                    <span>{formatSecondsToDuration(totalPlannedTime)}</span>
                                    {totalPlannedTime === 7 * 24 * 60 * 60 &&
                                        <CheckCircleIcon className="size-4 text-green-500"/>
                                    }
                                    {totalPlannedTime !== 7 * 24 * 60 * 60 &&
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

                {weeklyDurationEditDialogOpen && editedWeeklyItem && editedItemBudgetItem &&
                    <WeeklyItemDurationEditDialog open={weeklyDurationEditDialogOpen}
                                                  onOpenChange={setWeeklyDurationEditDialogOpen}
                                                  budgetPlanItem={editedItemBudgetItem}
                                                  weeklyPlanItem={editedWeeklyItem}
                                                  currentWeekStartDate={weekFirstDay}
                                                  onSave={saveWeeklyItem}
                                                  onDelete={resetWeeklyItem}
                    />
                }
                {weeklyItemDetailsDialogOpen && weeklyItemDetails && (
                        <WeeklyItemDetailsDialog
                            open={weeklyItemDetailsDialogOpen}
                            onOpenChange={setWeeklyItemDetailsDialogOpen}
                            weeklyPlanItem={weeklyItemDetails}
                            periodStart={weekFirstDay}
                            periodEnd={weekEndDay(weekFirstDay)}
                        />
                    )
                }
            </div>
        </div>
    )
}

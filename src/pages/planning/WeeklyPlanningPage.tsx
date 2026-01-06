import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {CheckCircleIcon, PencilIcon, TextAlignStartIcon, TriangleAlertIcon} from "lucide-react";
import {formatSecondsToDuration, getCurrentWeekFirstDay, nextWeekStart, previousWeekStart, weekEndDay} from "@/lib/dateUtils.ts";
import useProfile from "@/api/useProfile.ts";
import {defaultSettings} from "@/components/settings.ts";
import {createElement, useState} from "react";
import {Spinner} from "@/components/ui/spinner.tsx";
import {BudgetPlanItem, WeeklyPlanItem} from "@/api/types.ts";
import useWeeklyPlan from "@/api/useWeeklyPlan.ts";
import {WeekChooser} from "@/components/statistics/weekChooser.tsx";
import {Square2StackIcon} from "@heroicons/react/24/outline";
import * as Icons from "@heroicons/react/24/solid";
import {WeeklyItemDurationEditDialog} from "@/pages/planning/WeeklyItemDurationEditDialog.tsx";
import useBudgetPlan from "@/api/useBudgetPlan.ts";
import {Button} from "@/components/ui/button.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import WeeklyPlanItemDetailsDialog from "@/components/weeklyPlanItem/WeeklyPlanItemDetailsDialog.tsx";

type WeeklyOverride = {
    budgetItemId: number
    weeklyDuration: number
    notes: string
}

export default function WeeklyPlanningPage() {

    const {currentProfile} = useProfile();
    const initialWeekFirstDay = getCurrentWeekFirstDay(currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay)
    const [weekFirstDay, setWeekFirstDay] = useState(initialWeekFirstDay)

    const {weeklyPlan, isLoading, updateWeeklyPlanItem, resetWeeklyPlanItem, resetWeeklyPlan} = useWeeklyPlan(weekFirstDay)
    const {budgetPlanDetails, isLoadingBudgetPlanDetails} = useBudgetPlan(weeklyPlan?.budgetPlanId)

    const {weeklyPlan: previousWeek, isLoading: previousWeekIsLoading} = useWeeklyPlan(previousWeekStart(weekFirstDay))

    const [weeklyDurationEditDialogOpen, setWeeklyDurationEditDialogOpen] = useState(false)
    const [selectedWeeklyItem, setSelectedWeeklyItem] = useState<WeeklyPlanItem | undefined>(undefined)
    const [selectedItemBudgetItem, setSelectedItemBudgetItem] = useState<BudgetPlanItem | undefined>(undefined)
    const [weeklyItemDetailsDialogOpen, setWeeklyItemDetailsDialogOpen] = useState(false)
    const [resetConfirmDialogOpen, setResetConfirmDialogOpen] = useState(false)

    if (!weeklyPlan || isLoading || isLoadingBudgetPlanDetails || !budgetPlanDetails) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner className="size-6"/>
            </div>
        )
    }

    function isPreviousEnabled() {
        if (previousWeekIsLoading) return false

        const previousWeekIsInThePast = weekEndDay(previousWeekStart(weekFirstDay)) < new Date()
        const weeklyItemsDoNotExist = previousWeek?.items.some(item => item.id === 0)
        return !(previousWeekIsInThePast && weeklyItemsDoNotExist);
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
        setSelectedWeeklyItem(weeklyItem)
        setSelectedItemBudgetItem(budgetPlanItem)
        setWeeklyDurationEditDialogOpen(true)
    }

    function openItemDetailsDialog(weeklyPlanItem: WeeklyPlanItem, budgetPlanItem: BudgetPlanItem) {
        setSelectedWeeklyItem(weeklyPlanItem)
        setSelectedItemBudgetItem(budgetPlanItem)
        setWeeklyItemDetailsDialogOpen(true)
    }

    async function saveWeeklyItem(weeklyOverride: WeeklyOverride) {
        await updateWeeklyPlanItem(weekFirstDay, weeklyOverride)
    }

    async function resetWeeklyItem(weeklyPlanItemId: number) {
        await resetWeeklyPlanItem(weeklyPlanItemId)
    }

    async function confirmResetPlan() {
        await resetWeeklyPlan(weekFirstDay)
        setResetConfirmDialogOpen(false)
    }

    function isWeeklyItemModified(weeklyItem: WeeklyPlanItem, budgetItem: BudgetPlanItem): boolean {
        return weeklyItem.weeklyDuration !== budgetItem.weeklyDuration || weeklyItem.notes !== ""
    }

    const joinedItems = weeklyPlan!.items.map(weeklyItem => {
        const budgetItem = budgetPlanDetails!.items.find(b => b.id === weeklyItem.budgetItemId)
        if (!budgetItem) {
            console.error(`Budget item not found for weekly plan item with ID: ${weeklyItem.budgetItemId}`)
            return null
        }
        return {budgetItem, weeklyItem}
    }).filter(item => item !== null)
    const totalPlannedTime = weeklyPlan.items.reduce((acc, item) => acc + item.weeklyDuration, 0)

    const getIcon = (iconName: string, className: string) => {
        const key = iconName as keyof typeof Icons;
        const iconComponent = Icons[key] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
        return iconComponent ? createElement(iconComponent, {className}) : null
    };

    return (
        <div className="grow flex flex-col gap-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <WeekChooser currentWeekStart={weekFirstDay} onNext={onNextWeek} onPrevious={onPreviousWeek} onDateChanged={onWeekChanged} isPreviousEnabled={isPreviousEnabled} />
                <Button variant="outline" size="sm" onClick={() => setResetConfirmDialogOpen(true)} className="w-full md:w-auto">
                    Reset to Budget Plan
                </Button>
            </div>
            <div className="rounded-sm border overflow-hidden shadow-xs">
                <Table className="w-full border-collapse">
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="font-medium w-[40%]"></TableHead>
                            <TableHead className="font-medium w-[30%]">
                                <div className="flex items-center gap-1.5">
                                    {/* Empty space to match note icon width */}
                                    <div className="w-4 flex-shrink-0"></div>
                                    <span>Planned</span>
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {joinedItems.map(({weeklyItem, budgetItem}) => {
                            const isModified = isWeeklyItemModified(weeklyItem, budgetItem);
                            const diff = weeklyItem.weeklyDuration - budgetItem.weeklyDuration;

                            return (
                                <TableRow className="h-full" key={weeklyItem.budgetItemId}>
                                    <TableCell className="font-medium py-3">
                                        <div className="flex items-center gap-2">
                                            {weeklyItem.icon && getIcon(weeklyItem.icon, "size-5 text-gray-500 flex-shrink-0")}
                                            {!weeklyItem.icon && <Square2StackIcon className="size-5 text-gray-500 flex-shrink-0"/>}
                                            <span
                                                className="cursor-pointer hover:text-blue-600 transition-colors"
                                                onClick={() => openItemDetailsDialog(weeklyItem, budgetItem)}
                                            >
                                                {weeklyItem.name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        className="group cursor-pointer hover:bg-accent/50 transition-colors"
                                        onClick={() => openOverrideDialog(weeklyItem, budgetItem)}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {/* Note icon - fixed width to maintain alignment */}
                                            <div className="w-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                                {weeklyItem.notes && (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <TextAlignStartIcon className="size-4 text-gray-400 cursor-pointer"/>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="max-w-xs">
                                                            <p className="text-sm whitespace-pre-wrap">{weeklyItem.notes}</p>
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            </div>
                                            {/* Duration value */}
                                            {!isModified && (
                                                <span className="text-muted-foreground">
                                                    {formatSecondsToDuration(budgetItem.weeklyDuration)}
                                                </span>
                                            )}
                                            {isModified && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {formatSecondsToDuration(weeklyItem.weeklyDuration)}
                                                    </span>
                                                    <Badge variant="secondary" className="text-xs font-normal">
                                                        {diff > 0 ? '+' : '-'}{formatSecondsToDuration(diff, true)}
                                                    </Badge>
                                                </div>
                                            )}
                                            {/* Desktop: Show on hover */}
                                            <PencilIcon className="hidden md:block size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1"/>
                                            {/* Mobile: Always visible */}
                                            <PencilIcon className="md:hidden size-3.5 text-muted-foreground flex-shrink-0 ml-1"/>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow className="bg-gray-50 font-medium">
                            <TableCell className="font-bold">TOTAL</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1.5">
                                    {/* Empty space to match note icon width */}
                                    <div className="w-4 flex-shrink-0"></div>
                                    <span className="font-bold">{formatSecondsToDuration(totalPlannedTime)}</span>
                                    {totalPlannedTime === 7 * 24 * 60 * 60 &&
                                        <CheckCircleIcon className="size-4 text-green-500"/>
                                    }
                                    {totalPlannedTime !== 7 * 24 * 60 * 60 &&
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <TriangleAlertIcon className="size-4 text-orange-400 cursor-pointer"/>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                Should be 168h 0m to have a full week planned
                                            </PopoverContent>
                                        </Popover>
                                    }
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                {weeklyDurationEditDialogOpen && selectedWeeklyItem && selectedItemBudgetItem &&
                    <WeeklyItemDurationEditDialog open={weeklyDurationEditDialogOpen}
                                                  onOpenChange={setWeeklyDurationEditDialogOpen}
                                                  budgetPlanItem={selectedItemBudgetItem}
                                                  weeklyPlanItem={selectedWeeklyItem}
                                                  currentWeekStartDate={weekFirstDay}
                                                  onSave={saveWeeklyItem}
                                                  onDelete={resetWeeklyItem}
                    />
                }
                {weeklyItemDetailsDialogOpen && selectedWeeklyItem && selectedItemBudgetItem && (
                    <WeeklyPlanItemDetailsDialog
                        open={weeklyItemDetailsDialogOpen}
                        onOpenChange={setWeeklyItemDetailsDialogOpen}
                        budgetPlanItemId={selectedItemBudgetItem.id!}
                        inWeekDate={weekFirstDay}
                    />
                )
                }
            </div>

            <AlertDialog open={resetConfirmDialogOpen} onOpenChange={setResetConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset Weekly Plan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will reset all modifications for this week back to the original budget plan. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmResetPlan}>Reset Plan</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

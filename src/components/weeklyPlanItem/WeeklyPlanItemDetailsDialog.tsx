import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {formatSecondsToDuration, previousWeekStart, weekEndDay, weekStartDay} from "@/lib/dateUtils.ts";
import {userSettings} from "@/components/settings.ts";
import {ClickupTasksList} from "@/pages/planning/ClickupTasksList.tsx";
import {Button} from "@/components/ui/button.tsx";
import useProfile from "@/api/useProfile.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import useWeeklyPlan from "@/api/useWeeklyPlan.ts";
import useBudgetPlan from "@/api/useBudgetPlan.ts";
import {useState} from "react";
import useWeeklyStats, {useItemHistoryStats} from "@/api/useStats.ts";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {ChevronLeft, ChevronRight} from "lucide-react";

type Props = {
    budgetPlanItemId: number
    budgetPlanId: number
    inWeekDate: Date
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function WeeklyPlanItemDetailsDialog({budgetPlanItemId, budgetPlanId, inWeekDate, open, onOpenChange}: Props) {

    const [currentWeekDate, setCurrentWeekDate] = useState<Date>(inWeekDate)

    const {currentProfile, isLoadingCurrent} = useProfile();

    const statsStartDate = new Date(weekStartDay(inWeekDate, currentProfile?.settings?.weekStartDay || "monday"))
    statsStartDate.setDate(statsStartDate.getDate() - (7 * 5))

    const {weeklyPlan, isLoading: isLoadingWeeklyPlan} = useWeeklyPlan(currentWeekDate)
    const {weeklyPlan: previousWeek, isLoading: previousWeekIsLoading} = useWeeklyPlan(previousWeekStart(currentWeekDate))
    const {budgetPlanDetails, isLoadingBudgetPlanDetails} = useBudgetPlan(budgetPlanId)
    const {weeklyStatsSummary, isLoading: isLoadingStats} = useWeeklyStats(currentWeekDate)
    const {itemHistoryStats, isLoading} = useItemHistoryStats(statsStartDate, weekEndDay(currentWeekDate), budgetPlanItemId)

    if (isLoadingCurrent || isLoadingWeeklyPlan || isLoadingBudgetPlanDetails || isLoadingStats) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <div className="flex items-center justify-center h-screen">
                    <Spinner className="size-6"/>
                </div>
            </Dialog>
        )
    }

    const weeklyPlanItem = weeklyPlan?.items?.find(item => item.budgetItemId === budgetPlanItemId)
    const budgetPlanItem = budgetPlanDetails?.items?.find(item => item.id === budgetPlanItemId)

    if (!weeklyPlanItem || !budgetPlanItem) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <div className="flex items-center justify-center h-screen">
                    <p className="text-center">Item not found</p>
                </div>
            </Dialog>
        )
    }

    const weekStart = weekStartDay(currentWeekDate, currentProfile!.settings.weekStartDay)
    const weekEnd = weekEndDay(weekStart)

    const statsItem = weeklyStatsSummary?.perPlanItem.find(it => it.weeklyPlanItem.budgetItemId === budgetPlanItemId)

    // Prepare chart data for the last 5 weeks
    const chartData = itemHistoryStats?.statsPerWeek.slice(-5).map(stat => {
        const statWeekStart = new Date(stat.startDate)
        const statWeekEnd = new Date(stat.endDate)
        return {
            week: `${statWeekStart.toLocaleDateString(userSettings.locale, {month: 'short', day: 'numeric'})} - ${statWeekEnd.toLocaleDateString(userSettings.locale, {month: 'short', day: 'numeric'})}`,
            planned: stat.weeklyPlanItem.weeklyDuration / 3600,
            actual: stat.duration / 3600,
        }
    }) || []

    // Calculate progress for current week
    const usedDuration = statsItem?.duration || 0
    const plannedDuration = weeklyPlanItem.weeklyDuration
    const remainingDuration = statsItem?.remaining || plannedDuration
    const usedPercentage = plannedDuration > 0 ? (usedDuration / plannedDuration) * 100 : 0

    function isPreviousEnabled() {
        if (previousWeekIsLoading) return false

        const previousWeekIsInThePast = weekEndDay(previousWeekStart(currentWeekDate)) < new Date()
        const weeklyItemsDoNotExist = previousWeek?.items.some(item => item.id === 0)
        return !(previousWeekIsInThePast && weeklyItemsDoNotExist);
    }

    // Week navigation
    const handlePreviousWeek = () => {
        const newDate = new Date(currentWeekDate)
        newDate.setDate(newDate.getDate() - 7)
        setCurrentWeekDate(newDate)
    }

    const handleNextWeek = () => {
        const newDate = new Date(currentWeekDate)
        newDate.setDate(newDate.getDate() + 7)
        setCurrentWeekDate(newDate)
    }

    // Prepare list of last 5 weeks with planned durations
    const weeklyDurationsList = itemHistoryStats?.statsPerWeek.slice(-5).map(stat => {
        const statWeekStart = new Date(stat.startDate)
        const statWeekEnd = new Date(stat.endDate)

        // Find the corresponding budget plan item for this week (original duration)
        const originalDuration = stat.weeklyPlanItem.weeklyDuration
        const actualPlanned = stat.weeklyPlanItem.weeklyDuration

        return {
            weekRange: `${statWeekStart.toLocaleDateString(userSettings.locale)} - ${statWeekEnd.toLocaleDateString(userSettings.locale)}`,
            originalDuration,
            actualPlanned,
        }
    }) || []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] lg:max-w-[1400px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <span>
                            {weeklyPlanItem.name}
                        </span>
                        {weeklyPlanItem.weeklyDuration !== budgetPlanItem.weeklyDuration && (
                            <Badge variant="outline" className="opacity-50 line-through">
                                {formatSecondsToDuration(budgetPlanItem.weeklyDuration)}
                            </Badge>
                        )}
                        <Badge variant="outline" className="opacity-80">
                            {formatSecondsToDuration(weeklyPlanItem.weeklyDuration)}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                {/* Week Chooser */}
                <div className="flex items-center justify-center gap-2 py-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousWeek}
                        className="h-8"
                        disabled={!isPreviousEnabled()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium min-w-[280px] text-center">
                        {weekStart.toLocaleDateString(userSettings.locale)} - {weekEnd.toLocaleDateString(userSettings.locale)}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextWeek}
                        className="h-8"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Current Week Progress Bar */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Current Week Progress</CardTitle>
                            <CardDescription>
                                {formatSecondsToDuration(usedDuration)} used of {formatSecondsToDuration(plannedDuration)} planned
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="relative h-8 w-full bg-gray-200 rounded-md overflow-hidden">
                                    <div
                                        className="absolute h-full bg-blue-500 transition-all"
                                        style={{width: `${Math.min(usedPercentage, 100)}%`}}
                                    />
                                    {usedPercentage > 100 && (
                                        <div
                                            className="absolute h-full bg-red-500 transition-all"
                                            style={{width: `${usedPercentage - 100}%`, left: '100%'}}
                                        />
                                    )}
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{usedPercentage.toFixed(1)}% used</span>
                                    <span>{formatSecondsToDuration(remainingDuration)} remaining</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Historical Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Last 5 Weeks History</CardTitle>
                            <CardDescription>Planned vs actual time (hours)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="week" tick={{fontSize: 12}} />
                                        <YAxis tick={{fontSize: 12}} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="planned" fill="#8884d8" name="Planned (hours)" />
                                        <Bar dataKey="actual" fill="#82ca9d" name="Actual (hours)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                                    {isLoading ? <Spinner className="size-6" /> : "No historical data available"}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Weekly Durations List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Weekly Durations (Last 5 Weeks)</CardTitle>
                            <CardDescription>Original budget vs actual planned duration</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {weeklyDurationsList.length > 0 ? (
                                <div className="space-y-2">
                                    {weeklyDurationsList.reverse().map((week, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                            <span className="text-sm">{week.weekRange}</span>
                                            <div className="flex gap-4">
                                                <span className="text-sm text-muted-foreground">
                                                    Budget: {formatSecondsToDuration(week.originalDuration)}
                                                </span>
                                                <span className="text-sm font-medium">
                                                    Planned: {formatSecondsToDuration(week.actualPlanned)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-4 text-muted-foreground">
                                    {isLoading ? <Spinner className="size-6" /> : "No historical data available"}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ClickUp Tasks */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">ClickUp Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ClickupTasksList budgetItemId={weeklyPlanItem.budgetItemId}/>
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

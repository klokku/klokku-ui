import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {BudgetPlanItemReport} from "@/api/types.ts";

interface ItemDetailStatsProps {
    report: BudgetPlanItemReport;
}

export function ItemDetailStats({report}: ItemDetailStatsProps) {
    const isOverBudget = report.overBudgetTime > 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="py-4">
                <CardHeader className="pb-1 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total Tracked</CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                    <div className="text-2xl font-bold">{formatSecondsToDuration(report.totalActualTime)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {formatSecondsToDuration(report.averagePerDay)}/day avg
                    </p>
                </CardContent>
            </Card>

            <Card className="py-4">
                <CardHeader className="pb-1 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Budget Plan</CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                    <div className="text-2xl font-bold">{formatSecondsToDuration(report.totalBudgetPlanTime)}</div>
                    {report.totalWeeklyPlanTime !== report.totalBudgetPlanTime && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Weekly planned: {formatSecondsToDuration(report.totalWeeklyPlanTime)}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card className="py-4">
                <CardHeader className="pb-1 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Completion</CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                    <div className={`text-2xl font-bold ${isOverBudget ? "text-red-600" : ""}`}>
                        {report.completionPercent.toFixed(0)}%
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${isOverBudget ? "bg-red-500" : "bg-green-500"}`}
                            style={{width: `${Math.min(report.completionPercent, 100)}%`}}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="py-4">
                <CardHeader className="pb-1 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                        {isOverBudget ? "Over Budget" : "Remaining"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                    <div className={`text-2xl font-bold ${isOverBudget ? "text-red-600" : "text-green-600"}`}>
                        {formatSecondsToDuration(isOverBudget ? report.overBudgetTime : report.remainingTime)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {isOverBudget ? "above budget plan" : "until budget plan"}
                    </p>
                </CardContent>
            </Card>

            <Card className="py-4">
                <CardHeader className="pb-1 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Per Week</CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                    <div className="text-2xl font-bold">{formatSecondsToDuration(report.averagePerWeek)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        median: {formatSecondsToDuration(report.medianPerWeek)}
                    </p>
                </CardContent>
            </Card>

            <Card className="py-4">
                <CardHeader className="pb-1 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Per Active Day</CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                    <div className="text-2xl font-bold">{formatSecondsToDuration(report.averagePerActiveDay)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        median: {formatSecondsToDuration(report.medianPerActiveDay)} · {report.activeDaysCount}/{report.totalDaysCount} days
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

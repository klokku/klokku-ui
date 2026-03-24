import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {ReportTotals as ReportTotalsType} from "@/api/types.ts";
import {ReportItemName} from "@/pages/budgetPlanReport/ReportItemName.tsx";
import {CompletionCell} from "@/pages/budgetPlanReport/CompletionCell.tsx";
import {PlannedDiffBadge} from "@/pages/budgetPlanReport/PlannedDiffBadge.tsx";

interface ReportTotalsProps {
    totals: ReportTotalsType;
    onItemClick?: (itemId: number) => void;
}

export function ReportTotals({totals, onItemClick}: ReportTotalsProps) {
    return (
        <div className="rounded-md border overflow-hidden shadow-xs">
            <Table className="w-full border-collapse">
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead className="w-52"></TableHead>
                        <TableHead className="font-medium">BUDGET PLAN</TableHead>
                        <TableHead className="font-medium">PLANNED</TableHead>
                        <TableHead className="font-medium">ACTUAL</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {totals.items.map((item) => (
                        <TableRow
                            key={item.budgetItemId}
                            onClick={() => onItemClick?.(item.budgetItemId)}
                            className={onItemClick ? "cursor-pointer hover:bg-muted/50" : ""}
                        >
                            <TableCell className="font-medium">
                                <ReportItemName name={item.name} icon={item.icon} color={item.color}/>
                            </TableCell>
                            <TableCell className="h-full">
                                <CompletionCell actual={item.actualTime} planned={item.budgetPlanTime} averagePerWeek={item.averagePerWeek} averagePerDay={item.averagePerDay}/>
                            </TableCell>
                            <TableCell className="h-full">
                                <div className="flex items-center">
                                    <CompletionCell actual={item.actualTime} planned={item.weeklyPlanTime} averagePerWeek={item.averagePerWeek} averagePerDay={item.averagePerDay}/>
                                    <PlannedDiffBadge budgetPlanTime={item.budgetPlanTime} weeklyPlanTime={item.weeklyPlanTime} className="hidden md:block" />
                                </div>
                            </TableCell>
                            <TableCell>{formatSecondsToDuration(item.actualTime)}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow className="bg-gray-100 font-bold">
                        <TableCell>TOTAL</TableCell>
                        <TableCell>{formatSecondsToDuration(totals.totalBudgetPlanTime)}</TableCell>
                        <TableCell>
                            <div className="flex items-center">
                                <span>{formatSecondsToDuration(totals.totalWeeklyPlanTime)}</span>
                                <PlannedDiffBadge budgetPlanTime={totals.totalBudgetPlanTime} weeklyPlanTime={totals.totalWeeklyPlanTime} className="hidden md:block" />
                            </div>
                        </TableCell>
                        <TableCell>{formatSecondsToDuration(totals.totalActualTime)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}

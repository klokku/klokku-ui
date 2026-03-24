import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {WeeklyReportEntry} from "@/api/types.ts";
import {ReportItemName} from "@/pages/budgetPlanReport/ReportItemName.tsx";
import {CompletionCell} from "@/pages/budgetPlanReport/CompletionCell.tsx";
import {PlannedDiffBadge} from "@/pages/budgetPlanReport/PlannedDiffBadge.tsx";
import {useState} from "react";
import {ChevronDownIcon, ChevronRightIcon} from "lucide-react";
import {formatDate} from "date-fns";

interface WeeklyBreakdownProps {
    weeks: WeeklyReportEntry[];
}

function formatWeekRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${formatDate(start, "MMM d")} — ${formatDate(end, "MMM d, yyyy")}`;
}

export function WeeklyBreakdown({weeks}: WeeklyBreakdownProps) {
    const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

    if (weeks.length === 0) {
        return null;
    }

    const toggleWeek = (weekNumber: string) => {
        setExpandedWeeks(prev => {
            const next = new Set(prev);
            if (next.has(weekNumber)) {
                next.delete(weekNumber);
            } else {
                next.add(weekNumber);
            }
            return next;
        });
    };

    return (
        <div className="rounded-md border overflow-hidden shadow-xs">
            <Table className="w-full border-collapse">
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead className="w-8"></TableHead>
                        <TableHead className="w-52">WEEK</TableHead>
                        <TableHead className="font-medium">BUDGET PLAN</TableHead>
                        <TableHead className="font-medium">PLANNED</TableHead>
                        <TableHead className="font-medium">ACTUAL</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {weeks.map((week) => {
                        const isExpanded = expandedWeeks.has(week.weekNumber);

                        return (
                            <>
                                <TableRow
                                    key={week.weekNumber}
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => toggleWeek(week.weekNumber)}
                                >
                                    <TableCell className="w-8 px-2">
                                        {isExpanded
                                            ? <ChevronDownIcon className="size-4 text-muted-foreground"/>
                                            : <ChevronRightIcon className="size-4 text-muted-foreground"/>
                                        }
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{week.weekNumber}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatWeekRange(week.startDate, week.endDate)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="h-full">
                                        <CompletionCell actual={week.totalActualTime} planned={week.totalBudgetPlanTime}/>
                                    </TableCell>
                                    <TableCell className="h-full">
                                        <div className="flex items-center">
                                            <CompletionCell actual={week.totalActualTime} planned={week.totalWeeklyPlanTime}/>
                                            <PlannedDiffBadge budgetPlanTime={week.totalBudgetPlanTime} weeklyPlanTime={week.totalWeeklyPlanTime}/>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatSecondsToDuration(week.totalActualTime)}</TableCell>
                                </TableRow>
                                {isExpanded && week.items.map((item) => (
                                    <TableRow key={`${week.weekNumber}-${item.budgetItemId}`} className="bg-gray-50/50">
                                        <TableCell></TableCell>
                                        <TableCell>
                                            <ReportItemName name={item.name} icon={item.icon} color={item.color}/>
                                        </TableCell>
                                        <TableCell className="text-sm h-full">
                                            <CompletionCell actual={item.actualTime} planned={item.budgetPlanTime}/>
                                        </TableCell>
                                        <TableCell className="text-sm h-full">
                                            <div className="flex items-center">
                                                <CompletionCell actual={item.actualTime} planned={item.weeklyPlanTime}/>
                                                <PlannedDiffBadge budgetPlanTime={item.budgetPlanTime} weeklyPlanTime={item.weeklyPlanTime}/>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{formatSecondsToDuration(item.actualTime)}</TableCell>
                                    </TableRow>
                                ))}
                            </>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

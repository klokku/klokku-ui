import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {BudgetPlanItemReport} from "@/api/types.ts";
import {formatDate} from "date-fns";

interface ActivityHeatmapProps {
    report: BudgetPlanItemReport;
    weekFirstDay: "monday" | "sunday";
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function hexToRgb(hex: string): {r: number; g: number; b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16)}
        : null;
}

export function ActivityHeatmap({report, weekFirstDay}: ActivityHeatmapProps) {
    if (report.weeks.length === 0) return null;

    // Build a map from date string to actual time
    const dayMap = new Map<string, number>();
    for (const d of report.days) {
        const dateKey = formatDate(new Date(d.date), "yyyy-MM-dd");
        dayMap.set(dateKey, d.actualTime);
    }

    // Find max daily time for intensity scaling
    const maxTime = Math.max(...report.days.map((d) => d.actualTime), 1);

    // Build grid: rows = days of week, columns = weeks
    const firstDayOffset = weekFirstDay === "monday" ? 1 : 0;
    const orderedDayIndices: number[] = [];
    for (let i = 0; i < 7; i++) {
        orderedDayIndices.push((firstDayOffset + i) % 7);
    }

    const orderedLabels = orderedDayIndices.map((i) => DAY_LABELS[i]);

    // Build week columns from the report weeks
    const weekColumns: {weekNumber: string; startDate: Date; isOffWeek: boolean}[] = report.weeks.map((w) => ({
        weekNumber: w.weekNumber,
        startDate: new Date(w.startDate),
        isOffWeek: w.isOffWeek,
    }));

    const rgb = hexToRgb(report.itemColor);
    const colorBase = rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "34, 197, 94";

    return (
        <Card className="py-4">
            <CardHeader className="px-4 pb-2">
                <CardTitle className="text-sm font-medium">Activity Heatmap</CardTitle>
            </CardHeader>
            <CardContent className="px-4 overflow-x-auto">
                <TooltipProvider delayDuration={100}>
                    <div className="flex gap-0.5">
                        {/* Day labels column */}
                        <div className="flex flex-col gap-0.5 mr-1">
                            {orderedLabels.map((label, i) => (
                                <div
                                    key={i}
                                    className="h-5 w-6 text-[9px] text-muted-foreground flex items-center"
                                >
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* Week columns */}
                        {weekColumns.map((week) => (
                            <div key={week.weekNumber} className="flex flex-col gap-0.5">
                                {orderedDayIndices.map((dayIndex) => {
                                    // Calculate the date for this cell
                                    const dayOffset = (dayIndex - week.startDate.getDay() + 7) % 7;
                                    const cellDate = new Date(week.startDate);
                                    cellDate.setDate(cellDate.getDate() + dayOffset);
                                    const dateKey = formatDate(cellDate, "yyyy-MM-dd");

                                    const actualTime = week.isOffWeek ? 0 : (dayMap.get(dateKey) || 0);
                                    const intensity = actualTime > 0 ? Math.max(0.15, actualTime / maxTime) : 0;

                                    return (
                                        <Tooltip key={dateKey}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="h-5 w-5 rounded-[2px] border border-transparent"
                                                    style={{
                                                        backgroundColor: intensity > 0
                                                            ? `rgba(${colorBase}, ${intensity})`
                                                            : "var(--color-muted)",
                                                    }}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-xs">
                                                <div>{formatDate(cellDate, "EEE, MMM d")}</div>
                                                <div className="font-medium">
                                                    {actualTime > 0
                                                        ? formatSecondsToDuration(actualTime)
                                                        : "No activity"}
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}

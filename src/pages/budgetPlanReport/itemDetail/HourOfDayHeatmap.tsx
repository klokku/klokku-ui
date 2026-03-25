import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {BudgetPlanItemReport} from "@/api/types.ts";

interface HourOfDayHeatmapProps {
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

export function HourOfDayHeatmap({report, weekFirstDay}: HourOfDayHeatmapProps) {
    if (report.hourlyHeatmap.length === 0) return null;

    // Build lookup: counts[dayOfWeek][hour] = count
    const counts = new Map<string, number>();
    let maxCount = 0;
    for (const entry of report.hourlyHeatmap) {
        const key = `${entry.dayOfWeek}-${entry.hour}`;
        counts.set(key, entry.count);
        if (entry.count > maxCount) maxCount = entry.count;
    }

    // Order days starting from user's week first day
    const firstDayOffset = weekFirstDay === "monday" ? 1 : 0;
    const orderedDayIndices: number[] = [];
    for (let i = 0; i < 7; i++) {
        orderedDayIndices.push((firstDayOffset + i) % 7);
    }

    const rgb = hexToRgb(report.itemColor);
    const colorBase = rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "34, 197, 94";

    const hours = Array.from({length: 24}, (_, i) => i);

    return (
        <Card className="py-4">
            <CardHeader className="px-4 pb-2">
                <CardTitle className="text-sm font-medium">Activity by Day & Hour</CardTitle>
            </CardHeader>
            <CardContent className="px-4 overflow-x-auto">
                <TooltipProvider delayDuration={100}>
                    <div className="flex flex-col gap-0.5">
                        {/* Hour labels row */}
                        <div className="flex gap-0.5 ml-9">
                            {hours.map((hour) => (
                                <div
                                    key={hour}
                                    className="w-5 text-[9px] text-muted-foreground text-center"
                                >
                                    {hour % 3 === 0 ? `${hour}` : ""}
                                </div>
                            ))}
                        </div>

                        {/* Day rows */}
                        {orderedDayIndices.map((dayIndex) => (
                            <div key={dayIndex} className="flex gap-0.5 items-center">
                                <div className="w-8 text-[10px] text-muted-foreground text-right pr-1">
                                    {DAY_LABELS[dayIndex]}
                                </div>
                                {hours.map((hour) => {
                                    const key = `${dayIndex}-${hour}`;
                                    const count = counts.get(key) || 0;
                                    const intensity = count > 0 ? Math.max(0.15, count / maxCount) : 0;

                                    return (
                                        <Tooltip key={key}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="h-5 w-5 rounded-[2px]"
                                                    style={{
                                                        backgroundColor: intensity > 0
                                                            ? `rgba(${colorBase}, ${intensity})`
                                                            : "var(--color-muted)",
                                                    }}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-xs">
                                                <div>{DAY_LABELS[dayIndex]} {hour}:00–{hour + 1 === 24 ? "0" : hour + 1}:00</div>
                                                <div className="font-medium">
                                                    {count > 0
                                                        ? `${count} event${count > 1 ? "s" : ""}`
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

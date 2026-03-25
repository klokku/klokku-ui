import {useState} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router";
import {useBudgetPlanItemReport} from "@/api/useBudgetPlanItemReport.ts";
import {ReportItemName} from "@/pages/budgetPlanReport/ReportItemName.tsx";
import {PeriodSelector} from "@/pages/budgetPlanReport/PeriodSelector.tsx";
import {ItemDetailStats} from "@/pages/budgetPlanReport/itemDetail/ItemDetailStats.tsx";
import {BurndownChart} from "@/pages/budgetPlanReport/itemDetail/BurndownChart.tsx";
import {CumulativeChart} from "@/pages/budgetPlanReport/itemDetail/CumulativeChart.tsx";
import {WeeklyComparisonChart} from "@/pages/budgetPlanReport/itemDetail/WeeklyComparisonChart.tsx";
import {DayOfWeekChart} from "@/pages/budgetPlanReport/itemDetail/DayOfWeekChart.tsx";
import {ActivityHeatmap} from "@/pages/budgetPlanReport/itemDetail/ActivityHeatmap.tsx";
import {HourOfDayHeatmap} from "@/pages/budgetPlanReport/itemDetail/HourOfDayHeatmap.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeftIcon} from "lucide-react";
import {formatDate} from "date-fns";
import {getCurrentWeekFirstDay, weekEndDay, toServerFormat} from "@/lib/dateUtils.ts";
import useProfile from "@/api/useProfile.ts";
import {defaultSettings} from "@/components/settings.ts";
import {paths} from "@/pages/links.ts";

export function BudgetPlanItemDetailPage() {
    const navigate = useNavigate();
    const {planId, itemId} = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const {currentProfile} = useProfile();
    const weekFirstDay = currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay;

    const currentWeekStart = getCurrentWeekFirstDay(weekFirstDay);

    // Initialize from URL search params
    const initialMode = searchParams.get("mode") === "custom" ? "custom" : "all" as "all" | "custom";
    const initialFrom = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(currentWeekStart.getTime() - 3 * 7 * 24 * 60 * 60 * 1000);
    const initialTo = searchParams.get("to") ? new Date(searchParams.get("to")!) : weekEndDay(currentWeekStart);

    const [mode, setMode] = useState<"all" | "custom">(initialMode);
    const [fromDate, setFromDate] = useState<Date>(initialFrom);
    const [toDate, setToDate] = useState<Date>(initialTo);

    const from = mode === "custom" ? fromDate : undefined;
    const to = mode === "custom" ? toDate : undefined;

    const {isLoading, report} = useBudgetPlanItemReport(
        planId ? Number(planId) : undefined,
        itemId ? Number(itemId) : undefined,
        from,
        to,
    );

    const handleBack = () => {
        const params = new URLSearchParams();
        params.set("mode", mode);
        if (mode === "custom") {
            params.set("from", toServerFormat(fromDate));
            params.set("to", toServerFormat(toDate));
        }
        navigate(`${paths.budgetPlanReport.path}?${params.toString()}`);
    };

    const handleModeChange = (newMode: "all" | "custom") => {
        setMode(newMode);
        const params = new URLSearchParams(searchParams);
        params.set("mode", newMode);
        setSearchParams(params, {replace: true});
    };

    const handleFromChange = (date: Date) => {
        setFromDate(date);
        const params = new URLSearchParams(searchParams);
        params.set("from", toServerFormat(date));
        setSearchParams(params, {replace: true});
    };

    const handleToChange = (date: Date) => {
        setToDate(date);
        const params = new URLSearchParams(searchParams);
        params.set("to", toServerFormat(date));
        setSearchParams(params, {replace: true});
    };

    const formatRange = () => {
        if (!report || report.weekCount === 0) return null;
        const start = new Date(report.startDate);
        const end = new Date(report.endDate);
        return `${formatDate(start, "MMM d, yyyy")} — ${formatDate(end, "MMM d, yyyy")}`;
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                    <ArrowLeftIcon className="size-4"/>
                </Button>
                {report && (
                    <div className="text-lg font-semibold">
                        <ReportItemName name={report.itemName} icon={report.itemIcon} color={report.itemColor}/>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant={mode === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleModeChange("all")}
                >
                    All time
                </Button>
                <Button
                    variant={mode === "custom" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleModeChange("custom")}
                >
                    Custom period
                </Button>
            </div>

            {mode === "custom" && (
                <PeriodSelector
                    from={fromDate}
                    to={toDate}
                    onFromChange={handleFromChange}
                    onToChange={handleToChange}
                />
            )}

            {report && report.weekCount > 0 && (
                <div className="text-sm text-muted-foreground">
                    {formatRange()} — {report.weekCount} weeks
                    {report.excludedWeekCount > 0 && (
                        <span> ({report.excludedWeekCount} week{report.excludedWeekCount > 1 ? "s" : ""} off excluded)</span>
                    )}
                </div>
            )}

            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Spinner className="size-6"/>
                </div>
            )}

            {!isLoading && report && report.weekCount === 0 && (
                <div className="text-center text-muted-foreground py-12">
                    No tracked time found for this item.
                </div>
            )}

            {!isLoading && report && report.weekCount > 0 && (
                <div className="flex flex-col gap-6">
                    <ItemDetailStats report={report}/>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BurndownChart report={report}/>
                        <CumulativeChart report={report}/>
                    </div>

                    <WeeklyComparisonChart report={report}/>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DayOfWeekChart report={report} weekFirstDay={weekFirstDay} mode="total"/>
                        <DayOfWeekChart report={report} weekFirstDay={weekFirstDay} mode="average"/>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <ActivityHeatmap report={report} weekFirstDay={weekFirstDay}/>
                        <HourOfDayHeatmap report={report} weekFirstDay={weekFirstDay}/>
                    </div>
                </div>
            )}
        </div>
    );
}

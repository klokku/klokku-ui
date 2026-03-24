import {useState} from "react";
import {useNavigate} from "react-router";
import {BudgetPlanSelect} from "@/components/budgetPlan/BudgetPlanSelect.tsx";
import {useBudgetPlanReport} from "@/api/useBudgetPlanReport.ts";
import {ReportTotals} from "@/pages/budgetPlanReport/ReportTotals.tsx";
import {PeriodSelector} from "@/pages/budgetPlanReport/PeriodSelector.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {Button} from "@/components/ui/button.tsx";
import {formatDate} from "date-fns";
import {getCurrentWeekFirstDay, weekEndDay, toServerFormat} from "@/lib/dateUtils.ts";
import useProfile from "@/api/useProfile.ts";
import {defaultSettings} from "@/components/settings.ts";
import {links} from "@/pages/links.ts";

export function BudgetPlanReportPage() {
    const navigate = useNavigate();
    const {currentProfile} = useProfile();
    const weekFirstDay = currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay;

    const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>();
    const [mode, setMode] = useState<"all" | "custom">("all");

    // Default custom period: last 4 weeks
    const currentWeekStart = getCurrentWeekFirstDay(weekFirstDay);
    const [fromDate, setFromDate] = useState<Date>(
        new Date(currentWeekStart.getTime() - 3 * 7 * 24 * 60 * 60 * 1000)
    );
    const [toDate, setToDate] = useState<Date>(weekEndDay(currentWeekStart));

    const from = mode === "custom" ? fromDate : undefined;
    const to = mode === "custom" ? toDate : undefined;

    const {isLoading, report} = useBudgetPlanReport(selectedPlanId, from, to);

    const handleItemClick = (itemId: number) => {
        if (!selectedPlanId) return;
        const params = new URLSearchParams();
        params.set("mode", mode);
        if (mode === "custom") {
            params.set("from", toServerFormat(fromDate));
            params.set("to", toServerFormat(toDate));
        }
        navigate(`${links.budgetPlanItemReport(selectedPlanId, itemId)}?${params.toString()}`);
    };

    const formatRange = () => {
        if (!report || report.weekCount === 0) return null;
        const start = new Date(report.startDate);
        const end = new Date(report.endDate);
        return `${formatDate(start, "MMM d, yyyy")} — ${formatDate(end, "MMM d, yyyy")}`;
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <BudgetPlanSelect selectedId={selectedPlanId} onPlanSelected={setSelectedPlanId}/>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant={mode === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("all")}
                >
                    All time
                </Button>
                <Button
                    variant={mode === "custom" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("custom")}
                >
                    Custom period
                </Button>
            </div>

            {mode === "custom" && (
                <PeriodSelector
                    from={fromDate}
                    to={toDate}
                    onFromChange={setFromDate}
                    onToChange={setToDate}
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
                    No tracked time found for this budget plan.
                </div>
            )}

            {!isLoading && report && report.weekCount > 0 && (
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Period Totals</h3>
                        <ReportTotals totals={report.totals} onItemClick={handleItemClick}/>
                    </div>
                </div>
            )}
        </div>
    );
}

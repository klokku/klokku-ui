import {useEffect, useState} from "react";
import useProfile from "@/api/useProfile.ts";
import useWeeklyPlan from "@/api/useWeeklyPlan.ts";
import useWeeklyStats from "@/api/useStats.ts";
import {useBudgetPlanReport} from "@/api/useBudgetPlanReport.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import {getDashboardPeriod, formatDashboardDate} from "@/lib/dashboardDates.ts";
import {getBudgetBalances, getEligibleHistory, getPlanRealism, getWeeklyRhythm} from "@/components/dashboard/dashboardInsights.ts";

export default function useDashboardInsights() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 60_000);
        return () => window.clearInterval(timer);
    }, []);

    const {currentProfileUid} = useCurrentProfile();
    const profileQuery = useProfile();
    const timezone = profileQuery.currentProfile?.settings.timezone ?? "UTC";
    const period = getDashboardPeriod(now, timezone, profileQuery.currentProfile?.settings.weekStartDay ?? "monday");
    const planQuery = useWeeklyPlan(period.weekStart, {timezone, enabled: !!profileQuery.currentProfile});
    const statsQuery = useWeeklyStats(period.weekStart, {
        timezone,
        enabled: !!profileQuery.currentProfile && !!planQuery.weeklyPlan,
        refetchInterval: 60_000,
    });
    const reportQuery = useBudgetPlanReport(planQuery.weeklyPlan?.budgetPlanId, period.historyFrom, period.historyTo);
    const historyWeeks = getEligibleHistory(reportQuery.report?.weeks, period, timezone, reportQuery.report?.firstTrackedAt);
    const items = planQuery.weeklyPlan?.items ?? [];
    const planError = profileQuery.error ?? planQuery.error;
    const retryPlan = () => {
        if (profileQuery.error || !profileQuery.currentProfile) void profileQuery.refetch();
        else void planQuery.refetch();
    };

    return {
        profileUid: currentProfileUid,
        timezone,
        period,
        weeklyPlan: planQuery.weeklyPlan,
        isLoadingPlan: profileQuery.isLoadingCurrent || planQuery.isLoading,
        planError,
        retryPlan,
        currentState: {
            isLoading: profileQuery.isLoadingCurrent || planQuery.isLoading || statsQuery.isLoading,
            error: profileQuery.error ?? planQuery.error ?? statsQuery.error,
            onRetry: () => { if (planError) retryPlan(); else void statsQuery.refetch(); },
        },
        historyState: {
            isLoading: profileQuery.isLoadingCurrent || planQuery.isLoading || reportQuery.isLoading,
            error: profileQuery.error ?? planQuery.error ?? reportQuery.error,
            onRetry: () => { if (planError) retryPlan(); else void reportQuery.refetch(); },
        },
        balances: getBudgetBalances(statsQuery.weeklyStatsSummary),
        rhythm: getWeeklyRhythm(statsQuery.weeklyStatsSummary, period, timezone),
        historyWeeks,
        realism: getPlanRealism(historyWeeks, items),
        historyDescription: `${formatDashboardDate(period.historyStartKey, timezone)} - ${formatDashboardDate(period.historyEndKey, timezone, "MMM d, yyyy")} · ${historyWeeks.length} included ${historyWeeks.length === 1 ? "week" : "weeks"}`,
        excludedWeekCount: reportQuery.report?.excludedWeekCount ?? 0,
    };
}

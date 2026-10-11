import {useEffect, useState} from "react";
import useProfile from "@/api/useProfile.ts";
import useWeeklyPlan from "@/api/useWeeklyPlan.ts";
import useWeeklyStats from "@/api/useStats.ts";
import {useBudgetPlanReport} from "@/api/useBudgetPlanReport.ts";
import useCurrentEvent from "@/api/useCurrentEvent.ts";
import useCalendar from "@/api/useCalendar.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import {getDashboardPeriod, formatDashboardDate} from "@/lib/dashboardDates.ts";
import {getBudgetBalances, getEligibleHistory, getPlanRealism, getTodayBreakdown, getWeeklyCompletion, getWeeklyRhythm} from "@/components/dashboard/dashboardInsights.ts";

export default function useDashboardInsights() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const update = () => setNow(new Date());
        const resume = () => { if (!document.hidden) update(); };
        const timer = window.setInterval(update, 60_000);
        document.addEventListener("visibilitychange", resume);
        return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", resume); };
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
        planId: planQuery.weeklyPlan?.budgetPlanId,
    });
    const activity = useCurrentEvent({enabled: !!currentProfileUid, refetchInterval: 60_000});
    const calendar = useCalendar(period.weekStart, period.weekEnd, {enabled: !!profileQuery.currentProfile, refetchInterval: 60_000});
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
        weeklyStats: statsQuery.weeklyStatsSummary,
        activity,
        calendarActions: {modifyEvent: calendar.modifyEvent, createEvent: calendar.createEvent, deleteEvent: calendar.deleteEvent},
        recentEvents: calendar.recentEvents,
        profileError: profileQuery.error,
        isLoadingPlan: profileQuery.isLoadingCurrent || planQuery.isLoading,
        planError,
        retryPlan,
        planState: {isLoading: profileQuery.isLoadingCurrent || planQuery.isLoading, error: planError, onRetry: retryPlan},
        activityState: {
            isLoading: profileQuery.isLoadingCurrent || activity.loadingCurrentEvent,
            error: profileQuery.error ?? activity.error,
            onRetry: () => { if (profileQuery.error) void profileQuery.refetch(); else void activity.refetch(); },
        },
        recentState: {
            isLoading: profileQuery.isLoadingCurrent || calendar.isLoadingRecentEvents,
            error: profileQuery.error ?? calendar.recentError,
            onRetry: () => { if (profileQuery.error) void profileQuery.refetch(); else void calendar.refetchRecent(); },
        },
        completionState: {
            isLoading: profileQuery.isLoadingCurrent || planQuery.isLoading || statsQuery.isLoading || calendar.isLoading,
            error: planError ?? statsQuery.error ?? calendar.error,
            onRetry: () => {
                if (planError) retryPlan();
                else { void statsQuery.refetch(); void calendar.refetch(); }
            },
        },
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
        completion: getWeeklyCompletion(statsQuery.weeklyStatsSummary, calendar.events, activity.currentEvent, period, now),
        today: getTodayBreakdown(statsQuery.weeklyStatsSummary, period, timezone, activity.currentEvent?.planItem.budgetItemId),
        rhythm: getWeeklyRhythm(statsQuery.weeklyStatsSummary, period, timezone),
        historyWeeks,
        realism: getPlanRealism(historyWeeks, items),
        historyDescription: `${formatDashboardDate(period.historyStartKey, timezone)} - ${formatDashboardDate(period.historyEndKey, timezone, "MMM d, yyyy")} · ${historyWeeks.length} included ${historyWeeks.length === 1 ? "week" : "weeks"}`,
        excludedWeekCount: reportQuery.report?.excludedWeekCount ?? 0,
    };
}

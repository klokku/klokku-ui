import {CurrentEventCard} from "@/components/dashboard/CurrentEventCard.tsx";
import {WeeklyBudgetCompletionCard} from "@/components/dashboard/WeeklyBudgetCompletionCard.tsx";
import {WeeklyAllocationCard} from "@/components/dashboard/WeeklyAllocationCard.tsx";
import {TimeTodayCard} from "@/components/dashboard/TimeTodayCard.tsx";
import {useState} from "react";
import {BudgetPlanWizardDialog} from "@/pages/budgetPlan/wizard/BudgetPlanWizardDialog.tsx";
import {EmptyBudgetPlan} from "@/pages/budgetPlan/EmptyBudgetPlan.tsx";
import useDashboardInsights from "@/pages/dashboard/useDashboardInsights.ts";
import {BudgetBalanceCard} from "@/components/dashboard/BudgetBalanceCard.tsx";
import {WeeklyRhythmCard} from "@/components/dashboard/WeeklyRhythmCard.tsx";
import {RecentTrendsCard} from "@/components/dashboard/RecentTrendsCard.tsx";
import {PlanRealismCard} from "@/components/dashboard/PlanRealismCard.tsx";
import {Button} from "@/components/ui/button.tsx";
import {paths} from "@/pages/links.ts";
import {NavLink} from "react-router";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";

export function DashboardPage() {
    const insights = useDashboardInsights();
    const {weeklyPlan, isLoadingPlan: isLoading} = insights;
    const [wizardOpen, setWizardOpen] = useState(false);
    const trackingCard = <CurrentEventCard key={`tracking:${insights.profileUid}`} weeklyPlan={weeklyPlan} activity={insights.activity}
        activityState={insights.activityState} planState={insights.planState} recentEvents={insights.recentEvents}
        recentState={insights.recentState} calendarActions={insights.calendarActions} timezone={insights.timezone}/>;

    if (insights.profileError) {
        return <div role="alert" className="p-4 space-y-3">
            <p>Could not load your dashboard.</p>
            <Button variant="outline" onClick={insights.retryPlan}>Retry</Button>
        </div>;
    }

    if (!weeklyPlan && !isLoading && !insights.planError) {
        return (
            <div className="flex flex-col gap-4 p-4">
            {(insights.activity.currentEvent || insights.activityState.isLoading || insights.activityState.error) && trackingCard}
            <Empty className="mb-4 border rounded text-center">
                <EmptyHeader>
                    <EmptyMedia variant="default" className="text-primary-foreground text-6xl">
                        🚀
                    </EmptyMedia>
                    <EmptyTitle>Let’s build your first plan!</EmptyTitle>
                    <EmptyDescription>
                        Head over to <NavLink to={paths.budgetPlans.path} className="underline decoration-primary font-medium">Budget Plans</NavLink> to set up your tracking.
                    </EmptyDescription>
                    <EmptyContent>
                        Once you create a plan, you’ll be able to see your spending and stay on top of your weekly goals.
                    </EmptyContent>
                </EmptyHeader>
            </Empty>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            {weeklyPlan?.isOffWeek && <div role="status" className="rounded-md border bg-muted px-4 py-3 text-sm">
                This is an off week. Current activity is shown, but this week is excluded from historical comparisons.
                {" "}<NavLink to={paths.weeklyPlanning.path} className="underline underline-offset-4">View weekly plan</NavLink>
            </div>}
            {!isLoading && weeklyPlan?.items.length === 0 && (
                <EmptyBudgetPlan
                    onOpenWizard={() => setWizardOpen(true)}
                />
            )}
            <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
                {trackingCard}
                <WeeklyBudgetCompletionCard rows={insights.completion} state={insights.completionState}/>
            </div>
            <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
                <BudgetBalanceCard key={`balance:${insights.profileUid}:${weeklyPlan?.budgetPlanId}`} balances={insights.balances}
                                   planId={weeklyPlan?.budgetPlanId} period={insights.period} state={insights.currentState}/>
                <PlanRealismCard key={`realism:${insights.profileUid}:${weeklyPlan?.budgetPlanId}`} rows={insights.realism}
                                 description={insights.historyDescription} state={insights.historyState}/>
            </div>
            <WeeklyAllocationCard key={`allocation:${insights.profileUid}:${weeklyPlan?.budgetPlanId}`} items={weeklyPlan?.items ?? []}
                                  stats={insights.weeklyStats} planId={weeklyPlan?.budgetPlanId} period={insights.period} timezone={insights.timezone}
                                  planState={insights.planState} spentState={insights.currentState}/>
            <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
                <TimeTodayCard today={insights.today} planId={weeklyPlan?.budgetPlanId} period={insights.period} state={insights.currentState}/>
                <WeeklyRhythmCard days={insights.rhythm} budgets={insights.balances} state={insights.currentState}/>
            </div>
            <RecentTrendsCard key={`${insights.profileUid}:${weeklyPlan?.budgetPlanId}`} items={weeklyPlan?.items ?? []}
                              weeks={insights.historyWeeks} planId={weeklyPlan?.budgetPlanId} period={insights.period}
                              timezone={insights.timezone} description={insights.historyDescription}
                              excludedWeekCount={insights.excludedWeekCount} state={insights.historyState}/>

            <BudgetPlanWizardDialog open={wizardOpen} onOpenChange={setWizardOpen} budgetPlanId={weeklyPlan?.budgetPlanId}/>
        </div>
    )
}

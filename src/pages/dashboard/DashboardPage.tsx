import {CurrentEventCard} from "@/components/dashboard/CurrentEventCard.tsx";
import {WeeklyBudgetCompletionCard} from "@/components/dashboard/WeeklyBudgetCompletionCard.tsx";
import {WeeklyAllocationCard} from "@/components/dashboard/WeeklyAllocationCard.tsx";
import {TimeTodayCard} from "@/components/dashboard/TimeTodayCard.tsx";
import {ReactNode, useState} from "react";
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
import {DashboardCustomization} from "@/components/dashboard/DashboardCustomization";
import {DashboardCardId} from "@/components/dashboard/dashboardConfiguration";

export function DashboardPage() {
    const insights = useDashboardInsights();
    const {weeklyPlan, isLoadingPlan: isLoading} = insights;
    const [wizardOpen, setWizardOpen] = useState(false);
    const configuration = insights.dashboardConfiguration;
    const configurationControls = <div className="flex flex-col items-end gap-2">
        {configuration.isReady && <DashboardCustomization key={configuration.profileUid} configuration={configuration.configuration!} onSave={configuration.saveConfiguration}/>}
        {configuration.isLoading && <p role="status" className="text-sm text-muted-foreground">Loading dashboard configuration...</p>}
        {configuration.error && <div role="alert" className="flex flex-wrap items-center gap-3 text-sm">
            <p>Could not load your dashboard configuration.</p><Button variant="outline" size="sm" onClick={configuration.retry}>Retry configuration</Button>
        </div>}
    </div>;
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
            {configurationControls}
            {trackingCard}
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

    const cardContent: Record<DashboardCardId, ReactNode> = {
        "weekly-completion": <WeeklyBudgetCompletionCard rows={insights.completion} state={insights.completionState}/>,
        "budget-balance": <BudgetBalanceCard balances={insights.balances} planId={weeklyPlan?.budgetPlanId} period={insights.period} state={insights.currentState}/>,
        "plan-realism": <PlanRealismCard rows={insights.realism} description={insights.historyDescription} state={insights.historyState}/>,
        "weekly-allocation": <WeeklyAllocationCard items={weeklyPlan?.items ?? []} stats={insights.weeklyStats} planId={weeklyPlan?.budgetPlanId}
            period={insights.period} timezone={insights.timezone} planState={insights.planState} spentState={insights.currentState}/>,
        "time-today": <TimeTodayCard today={insights.today} planId={weeklyPlan?.budgetPlanId} period={insights.period} state={insights.currentState}/>,
        "weekly-rhythm": <WeeklyRhythmCard days={insights.rhythm} budgets={insights.balances} state={insights.currentState}/>,
        "recent-trends": <RecentTrendsCard items={weeklyPlan?.items ?? []} weeks={insights.historyWeeks} planId={weeklyPlan?.budgetPlanId}
            period={insights.period} timezone={insights.timezone} description={insights.historyDescription}
            excludedWeekCount={insights.excludedWeekCount} state={insights.historyState}/>,
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            {configurationControls}
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
                <div className="min-w-0">{trackingCard}</div>
                {configuration.cards.filter(card => card.visible).map(card => <div
                    key={`${card.id}:${insights.profileUid}:${weeklyPlan?.budgetPlanId}`}
                    className={card.wide ? "min-w-0 lg:col-span-2" : "min-w-0"}>
                    {cardContent[card.id]}
                </div>)}
            </div>

            <BudgetPlanWizardDialog open={wizardOpen} onOpenChange={setWizardOpen} budgetPlanId={weeklyPlan?.budgetPlanId}/>
        </div>
    )
}

import {createElement, useEffect, useRef, useState} from "react";
import {NavLink} from "react-router";
import * as Icons from "lucide-react";
import {CurrentEvent, CalendarEvent, WeeklyPlan} from "@/api/types.ts";
import {CurrentActivity} from "@/api/useCurrentEvent.ts";
import {CalendarMutations} from "@/api/useCalendarMutations.ts";
import {Button} from "@/components/ui/button.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {InsightCard, InsightContent, InsightState} from "@/components/dashboard/InsightCard.tsx";
import {ElapsedActivityTime} from "@/components/dashboard/ElapsedActivityTime.tsx";
import {PreviousEvent} from "@/components/dashboard/PreviousEvent.tsx";
import {getBudgetColor} from "@/components/dashboard/dashboardInsights.ts";
import {CurrentEventDetailsDialog} from "@/components/event/CurrentEventDetailsDialog.tsx";
import {userSettings} from "@/components/settings.ts";
import {paths} from "@/pages/links.ts";

export type ActivityControls = Pick<CurrentActivity, "currentEvent" | "startEvent" | "updateEventStartTime" | "updateEventNotes" | "isStartingEvent" | "startError" | "resetStartError"> & {
    refetch: () => Promise<{data?: CurrentEvent | null; error?: Error | null}>;
};

export function CurrentEventCard({weeklyPlan, activity, activityState, planState, recentEvents, recentState, calendarActions, timezone}: {
    weeklyPlan?: WeeklyPlan | null;
    activity: ActivityControls;
    activityState: InsightState;
    planState: InsightState;
    recentEvents: CalendarEvent[];
    recentState: InsightState;
    calendarActions: CalendarMutations;
    timezone: string;
}) {
    const {currentEvent} = activity;
    const items = weeklyPlan?.items ?? [];
    const currentItem = items.find(item => item.budgetItemId === currentEvent?.planItem.budgetItemId);
    const [eventToEdit, setEventToEdit] = useState<CurrentEvent>();
    const editorIdentity = useRef<{budgetId: number; startTime: number} | null>(null);
    useEffect(() => () => { editorIdentity.current = null; }, []);
    const [switchError, setSwitchError] = useState(false);

    const onBudgetChange = async (value: string) => {
        const item = items.find(item => item.budgetItemId === Number(value));
        if (!item || activity.isStartingEvent) return;
        setSwitchError(false);
        activity.resetStartError();
        try { await activity.startEvent(item.budgetItemId, item.name, item.weeklyDuration); }
        catch { setSwitchError(true); }
    };
    const saveCurrentEventChanges = async (updated: CurrentEvent) => {
        const expected = editorIdentity.current;
        const fresh = await activity.refetch();
        if (fresh.error) throw fresh.error;
        const latest = fresh.data;
        if (!expected || editorIdentity.current !== expected || !latest || expected.budgetId !== latest.planItem.budgetItemId || expected.startTime !== new Date(latest.startTime).getTime()) {
            throw new Error("The running activity changed. Close this editor and open it again.");
        }
        if (new Date(updated.startTime).getTime() !== new Date(latest.startTime).getTime()) {
            await activity.updateEventStartTime(new Date(updated.startTime));
            expected.startTime = new Date(updated.startTime).getTime();
        }
        if (editorIdentity.current !== expected) return;
        if (updated.notes !== latest.notes) await activity.updateEventNotes(updated.notes);
    };

    return (
        <InsightCard title="Tracking now" description={null} hideHeader
                     footer={<NavLink to={paths.calendar.path} className="ml-auto underline underline-offset-4">View calendar</NavLink>}>
            <InsightContent state={activityState} label="running activity">
                {currentEvent ? <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-2 min-w-0"><span className="relative inline-flex size-3 shrink-0" aria-hidden="true">
                        <span className="tracking-halo absolute inset-0 rounded-full" style={{backgroundColor: getBudgetColor(currentEvent.planItem.budgetItemId, currentItem?.color)}}/>
                        <span className="relative size-3 rounded-full" style={{backgroundColor: getBudgetColor(currentEvent.planItem.budgetItemId, currentItem?.color)}}/>
                    </span>
                        <h3 className="text-lg font-semibold break-words min-w-0">{currentItem?.name ?? currentEvent.planItem.name}</h3>
                    </div>
                    {!currentItem && !planState.isLoading && !planState.error && <p className="text-xs text-muted-foreground">Outside this week's plan</p>}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <ElapsedActivityTime key={currentEvent.startTime} startTime={currentEvent.startTime}/>
                        <Button variant="outline" size="sm" onClick={() => {
                            editorIdentity.current = {budgetId: currentEvent.planItem.budgetItemId, startTime: new Date(currentEvent.startTime).getTime()};
                            setEventToEdit(currentEvent);
                        }}>Edit activity details</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Started {new Date(currentEvent.startTime).toLocaleString(userSettings.locale, {timeZone: timezone, dateStyle: "medium", timeStyle: "short"})}</p>
                    {currentEvent.notes && <details key={`${currentEvent.planItem.budgetItemId}:${currentEvent.startTime}`} className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                        <summary className="cursor-pointer break-words">Notes: {currentEvent.notes.length > 80 ? `${currentEvent.notes.slice(0, 80)}…` : currentEvent.notes}</summary>
                        <p className="pt-3 whitespace-pre-wrap break-words">{currentEvent.notes}</p>
                    </details>}
                </div> : <p className="text-sm text-muted-foreground mb-4">No activity running. Choose a budget to start tracking.</p>}
            </InsightContent>
            <div className="mt-4 mb-5">
                <InsightContent state={planState} label="budget choices">
                    {items.length > 0 ? <Select onValueChange={onBudgetChange} value={currentItem?.budgetItemId.toString() ?? ""} disabled={activity.isStartingEvent || activityState.isLoading || !!activityState.error}>
                        <SelectTrigger aria-label={currentEvent ? "Switch activity" : "Start tracking a budget"} className="w-full"><SelectValue placeholder={currentEvent ? "Switch to a budget" : "Choose a budget"}/></SelectTrigger>
                        <SelectContent>{items.map(item => {
                            const icon = Icons[item.icon as keyof typeof Icons] as React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined;
                            return <SelectItem key={item.budgetItemId} value={item.budgetItemId.toString()}>
                                <span className="flex items-center gap-2">{icon && createElement(icon, {className: "size-4 shrink-0", "aria-hidden": true})}<span>{item.name}</span></span>
                            </SelectItem>;
                        })}</SelectContent>
                    </Select> : <p className="text-sm text-muted-foreground">Add budgets in <NavLink to={paths.budgetPlans.path} className="underline">Budget Plans</NavLink> to start tracking.</p>}
                </InsightContent>
                {activity.isStartingEvent && <p role="status" className="text-xs text-muted-foreground mt-2">Switching activity...</p>}
                {(switchError || activity.startError) && <p role="alert" className="text-sm mt-2">Could not switch activity. Select a budget to try again.</p>}
            </div>
            <h3 className="text-sm font-medium mb-2">Previous events</h3>
            <InsightContent state={recentState} label="recent activity">
                {recentEvents.length === 0 ? <p className="text-sm text-muted-foreground">No previous events yet.</p> : <div className="space-y-2">
                    {recentEvents.slice(0, 4).map(event => <PreviousEvent key={event.uid} event={event} planItem={items.find(item => item.budgetItemId === event.budgetItemId)} timezone={timezone} actions={calendarActions}/>)}
                </div>}
            </InsightContent>
            {eventToEdit && <CurrentEventDetailsDialog key={`${eventToEdit.planItem.budgetItemId}:${eventToEdit.startTime}`} open onOpenChange={open => { if (!open) { editorIdentity.current = null; setEventToEdit(undefined); } }} event={eventToEdit} onSave={saveCurrentEventChanges} timezone={timezone}/>}
        </InsightCard>
    );
}

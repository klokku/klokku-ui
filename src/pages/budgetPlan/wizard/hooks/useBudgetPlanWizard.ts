import {useEffect, useMemo, useState} from "react";
import {BudgetPlanItem} from "@/api/types.ts";

export type Frequency = "daily" | "weekly";

export interface TimeAmount {
    hours: number;
    minutes: number;
    frequency: Frequency; // how the user entered this amount
    daysPerWeek?: number; // used for activities that happen N days/week
    enabled?: boolean; // for optional activities toggle
    name?: string; // for custom activities and remaining budget name helper
}

export interface WizardStep {
    id: string;
    title: string;
    description?: string;
    isComplete: boolean;
    isValid: boolean;
    show: boolean;
}

export interface BudgetPlanWizardState {
    currentStep: number;
    steps: WizardStep[];
    isOpen: boolean;
    budgetPlanId: number;

    // Collected data
    budgetPlanName: string;
    sleep: TimeAmount & { color: string; icon: string };
    work: TimeAmount & { daysPerWeek: number; color: string; icon: string };
    activities: Record<string, TimeAmount & { daysPerWeek: number; color: string; icon: string }>;
    customs: (TimeAmount & { daysPerWeek: number; name: string; color: string; icon: string })[];
    remaining: { name: string; color: string; icon: string };
}

const STORAGE_KEY = "klokku_budget_wizard_v1";

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

export function timeToWeeklySeconds(t: TimeAmount): number {
    const minutes = clamp((t.hours || 0), 0, 1000) * 60 + clamp((t.minutes || 0), 0, 59);
    if (t.frequency === "daily") {
        // daily value possibly multiplied by daysPerWeek if provided
        const days = typeof t.daysPerWeek === "number" ? clamp(t.daysPerWeek, 0, 7) : 7;
        return minutes * 60 * days;
    }
    // weekly – already whole week value
    return minutes * 60;
}

export function useBudgetPlanWizard(budgetPlanId: number | undefined) {

    const defaultState = (id: number | undefined) => {
        const steps = [
            {id: "welcome", title: "Welcome", isComplete: false, isValid: true, show: true},
            {id: "budgetplan", title: "New Budget Plan", isComplete: false, isValid: true, show: id === undefined},
            {id: "sleep", title: "Sleep", isComplete: false, isValid: true, show: true},
            {id: "work", title: "Work", isComplete: false, isValid: true, show: true},
            {id: "activities", title: "Activities", isComplete: false, isValid: true, show: true},
            {id: "customs", title: "Custom tasks", isComplete: false, isValid: true, show: true},
            {id: "remaining", title: "Remaining", isComplete: false, isValid: true, show: true},
        ].filter(s => s.show);

        return {
            currentStep: 0,
            budgetPlanId: id || 0,
            budgetPlanName: "My Budget Plan",
            steps: steps,
            isOpen: false,
            sleep: {hours: 8, minutes: 0, frequency: "daily", color: "#10B981", icon: "MoonIcon"},
            work: {hours: 8, minutes: 0, frequency: "daily", daysPerWeek: 5, color: "#3B82F6", icon: "BriefcaseIcon"},
            activities: {
                sport: {hours: 1, minutes: 0, frequency: "weekly", daysPerWeek: 2, enabled: false, color: "#F97316", icon: "TrophyIcon"},
                chores: {hours: 0, minutes: 45, frequency: "daily", daysPerWeek: 7, enabled: false, color: "#F59E0B", icon: "WrenchScrewdriverIcon"},
                eating: {hours: 1, minutes: 30, frequency: "daily", daysPerWeek: 7, enabled: true, color: "#6366F1", icon: "FaceSmileIcon"},
                entertainment: {hours: 1, minutes: 0, frequency: "daily", daysPerWeek: 5, enabled: false, color: "#06B6D4", icon: "TvIcon"},
                planning: {hours: 0, minutes: 30, frequency: "weekly", daysPerWeek: 1, enabled: false, color: "#8B5CF6", icon: "CalendarIcon"},
            },
            customs: [],
            remaining: {name: "Other", color: "#64748B", icon: "EllipsisHorizontalCircleIcon"}
        } as BudgetPlanWizardState
    }

    const [state, setState] = useState<BudgetPlanWizardState>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as BudgetPlanWizardState;
                    // Keep the saved state but update the budgetPlanId to match current context
                    return { ...parsed, isOpen: false, budgetPlanId: budgetPlanId || 0 };
            } catch {
                return defaultState(budgetPlanId);
            }
        }
        return defaultState(budgetPlanId);
    });

    // Effect to handle budgetPlanId changes without losing wizard progress
    useEffect(() => {
        setState(s => {
            const newId = budgetPlanId || 0;
            if (s.budgetPlanId === newId) return s;
            return { ...s, budgetPlanId: newId };
        });
    }, [budgetPlanId]);

    useEffect(() => {
        if (state.isOpen) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [
        state.isOpen,
        state.budgetPlanName,
        state.currentStep,
        state.sleep,
        state.work,
        state.activities,
        state.customs,
        state.remaining
    ]);

    const plannedWeeklySeconds = useMemo(() => {
        let total = 0;
        total += timeToWeeklySeconds(state.sleep);
        total += timeToWeeklySeconds(state.work);
        Object.values(state.activities).forEach(a => {
            if (a.enabled) total += timeToWeeklySeconds(a);
        });
        state.customs.forEach(c => total += timeToWeeklySeconds(c));
        return total;
    }, [state]);

    const remainingWeeklySeconds = useMemo(() => Math.max(0, 7 * 24 * 60 * 60 - plannedWeeklySeconds), [plannedWeeklySeconds]);

    function setOpen(isOpen: boolean) {
        setState(s => {
            if (s.isOpen === isOpen) return s;
            return { ...s, isOpen };
        });
    }

    function goNext() {
        setState(s => (
            {
                ...s,
                currentStep: clamp(s.currentStep + 1, 0, s.steps.length - 1),
                steps: s.steps.map((st, i) => i === s.currentStep ? {...st, isComplete: true} : st)
            }));
    }

    function goPrev() {
        setState(s => ({...s, currentStep: clamp(s.currentStep - 1, 0, s.steps.length - 1)}));
    }

    function goTo(step: number) {
        setState(s => ({...s, currentStep: clamp(step, 0, s.steps.length - 1)}));
    }

    function updateBudgetPlanName(name: string) {
        setState(s => {
            const isValid = name.trim().length > 0;
            // Only update if something actually changed
            if (s.budgetPlanName === name && s.steps.find(st => st.id === "budgetplan")?.isValid === isValid) {
                return s;
            }
            return {
                ...s,
                budgetPlanName: name,
                steps: s.steps.map(st =>
                    st.id === "budgetplan" ? { ...st, isValid } : st
                )
            };
        });
    }

    function updateSleep(val: Partial<TimeAmount>) {
        setState(s => ({...s, sleep: {...s.sleep, ...val}}));
    }

    function updateWork(val: Partial<TimeAmount & { daysPerWeek: number }>) {
        setState(s => ({...s, work: {...s.work, ...val}}));
    }

    function updateActivity(key: string, val: Partial<TimeAmount & { daysPerWeek: number }>) {
        setState(s => ({...s, activities: {...s.activities, [key]: {...s.activities[key], ...val}}}));
    }

    function addCustom(item?: Partial<TimeAmount & { daysPerWeek: number; name: string }>) {
        setState(s => ({...s,
            customs: [...s.customs, {
                name: "Custom",
                hours: 1,
                minutes: 0,
                frequency: "weekly",
                daysPerWeek: 1,
                color: "#64748B",
                icon: "Square2StackIcon", ...item
            }]
        }));
    }

    function updateCustom(index: number, val: Partial<TimeAmount & { daysPerWeek: number; name: string }>) {
        setState(s => ({...s, customs: s.customs.map((c, i) => i === index ? {...c, ...val} : c)}));
    }

    function removeCustom(index: number) {
        setState(s => ({...s, customs: s.customs.filter((_, i) => i !== index)}));
    }

    function setRemainingName(name: string) {
        setState(s => ({...s, remaining: {name: name, color: "#64748B", icon: "EllipsisHorizontalCircleIcon"}}));
    }

    function reset() {
        localStorage.removeItem(STORAGE_KEY);
        setState({ ...defaultState(budgetPlanId), isOpen: false });
    }

    function buildBudgetPlanItems(): BudgetPlanItem[] {
        const planItems: BudgetPlanItem[] = [];
        const pushBudget = (name: string, amount: TimeAmount, color: string, icon?: string) => {
            const weeklyTime = timeToWeeklySeconds(amount);
            planItems.push({
                name,
                weeklyDuration: weeklyTime,
                weeklyOccurrences: amount.daysPerWeek || 0,
                icon: icon || "Square2StackIcon",
                color: color,
            });
        };
        pushBudget("Sleep", state.sleep, state.sleep.color, state.sleep.icon);
        pushBudget("Work", state.work, state.work.color, state.work.icon);
        Object.entries(state.activities).forEach(([key, a]) => {
            if (a.enabled) pushBudget(capitalize(key), a, a.color, a.icon);
        });
        state.customs.forEach(c => pushBudget(c.name || "Custom", c, c.color, c.icon));
        if (remainingWeeklySeconds > 0) {
            planItems.push({
                name: state.remaining.name || "Other",
                weeklyDuration: remainingWeeklySeconds,
                weeklyOccurrences: 0,
                icon: "EllipsisHorizontalCircleIcon",
                color: state.remaining.color,
            });
        }
        return planItems;
    }

    function capitalize(s: string) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    return {
        state,
        setOpen,
        goNext,
        goPrev,
        goTo,

        updateBudgetPlanName,
        updateSleep,
        updateWork,
        updateActivity,
        addCustom,
        updateCustom,
        removeCustom,
        setRemainingName,

        plannedWeeklySeconds,
        remainingWeeklySeconds,
        buildBudgetPlanItems: buildBudgetPlanItems,
        reset,
    } as const;
}

export type UseBudgetPlanWizard = ReturnType<typeof useBudgetPlanWizard>;

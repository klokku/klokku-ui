import {useEffect, useMemo, useState} from "react";
import {Budget} from "@/api/types.ts";

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
}

export interface BudgetWizardState {
  currentStep: number;
  steps: WizardStep[];
  isOpen: boolean;

  // Collected data
  sleep: TimeAmount;
  work: TimeAmount & { daysPerWeek: number };
  activities: Record<string, TimeAmount & { daysPerWeek: number }>;
  customs: (TimeAmount & { daysPerWeek: number; name: string })[];
  remainingName: string;
}

const STORAGE_KEY = "klokku_budget_wizard_v1";

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

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

export function useBudgetWizard() {
  const [state, setState] = useState<BudgetWizardState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved) as BudgetWizardState } catch {}
    }
    return {
      currentStep: 0,
      steps: [
        { id: "welcome", title: "Welcome", isComplete: false, isValid: true },
        { id: "sleep", title: "Sleep", isComplete: false, isValid: true },
        { id: "work", title: "Work", isComplete: false, isValid: true },
        { id: "activities", title: "Activities", isComplete: false, isValid: true },
        { id: "customs", title: "Custom tasks", isComplete: false, isValid: true },
        { id: "remaining", title: "Remaining", isComplete: false, isValid: true },
      ],
      isOpen: false,
      sleep: { hours: 8, minutes: 0, frequency: "daily" },
      work: { hours: 8, minutes: 0, frequency: "daily", daysPerWeek: 5 },
      activities: {
        sport: { hours: 1, minutes: 0, frequency: "weekly", daysPerWeek: 2, enabled: false },
        chores: { hours: 0, minutes: 45, frequency: "daily", daysPerWeek: 7, enabled: false },
        eating: { hours: 1, minutes: 30, frequency: "daily", daysPerWeek: 7, enabled: true },
        entertainment: { hours: 1, minutes: 0, frequency: "daily", daysPerWeek: 5, enabled: false },
        planning: { hours: 0, minutes: 30, frequency: "weekly", daysPerWeek: 1, enabled: false },
      },
      customs: [],
      remainingName: "Other",
    } as BudgetWizardState
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const plannedWeeklySeconds = useMemo(() => {
    let total = 0;
    total += timeToWeeklySeconds(state.sleep);
    total += timeToWeeklySeconds(state.work);
    Object.values(state.activities).forEach(a => { if (a.enabled) total += timeToWeeklySeconds(a); });
    state.customs.forEach(c => total += timeToWeeklySeconds(c));
    return total;
  }, [state]);

  const remainingWeeklySeconds = useMemo(() => Math.max(0, 7 * 24 * 60 * 60 - plannedWeeklySeconds), [plannedWeeklySeconds]);

  function setOpen(isOpen: boolean) { setState(s => ({...s, isOpen})); }
  function goNext() {
    setState(s => ({...s, currentStep: clamp(s.currentStep + 1, 0, s.steps.length - 1), steps: s.steps.map((st, i) => i === s.currentStep ? {...st, isComplete: true} : st)}));
  }
  function goPrev() { setState(s => ({...s, currentStep: clamp(s.currentStep - 1, 0, s.steps.length - 1)})); }
  function goTo(step: number) { setState(s => ({...s, currentStep: clamp(step, 0, s.steps.length - 1)})); }

  function updateSleep(val: Partial<TimeAmount>) { setState(s => ({...s, sleep: {...s.sleep, ...val}})); }
  function updateWork(val: Partial<TimeAmount & {daysPerWeek: number}>) { setState(s => ({...s, work: {...s.work, ...val}})); }
  function updateActivity(key: string, val: Partial<TimeAmount & {daysPerWeek: number}>) {
    setState(s => ({...s, activities: {...s.activities, [key]: {...s.activities[key], ...val}}}));
  }
  function addCustom(item?: Partial<TimeAmount & {daysPerWeek: number; name: string}>) {
    setState(s => ({...s, customs: [...s.customs, {name: "Custom", hours: 1, minutes: 0, frequency: "weekly", daysPerWeek: 1, ...item}]}));
  }
  function updateCustom(index: number, val: Partial<TimeAmount & {daysPerWeek: number; name: string}>) {
    setState(s => ({...s, customs: s.customs.map((c, i) => i === index ? {...c, ...val} : c)}));
  }
  function removeCustom(index: number) {
    setState(s => ({...s, customs: s.customs.filter((_, i) => i !== index)}));
  }
  function setRemainingName(name: string) { setState(s => ({...s, remainingName: name})); }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setState(prev => ({...prev, currentStep: 0, customs: [], remainingName: "Other"}));
  }

  function buildBudgets(): Budget[] {
    const budgets: Budget[] = [];
    const pushBudget = (name: string, amount: TimeAmount) => {
      const weeklyTime = timeToWeeklySeconds(amount);
      budgets.push({ name, weeklyTime, weeklyOccurrences: amount.daysPerWeek || 0, icon: "Square2StackIcon" });
    };
    pushBudget("Sleep", state.sleep);
    pushBudget("Work", state.work);
    console.log("activities", state);
    Object.entries(state.activities).forEach(([key, a]) => {
      if (a.enabled) pushBudget(capitalize(key), a);
    });
    state.customs.forEach(c => pushBudget(c.name || "Custom", c));
    if (remainingWeeklySeconds > 0) {
      budgets.push({ name: state.remainingName || "Other", weeklyTime: remainingWeeklySeconds, weeklyOccurrences: 0, icon: "Square2StackIcon" });
    }
    return budgets;
  }

  function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

  return {
    state,
    setOpen,
    goNext,
    goPrev,
    goTo,

    updateSleep,
    updateWork,
    updateActivity,
    addCustom,
    updateCustom,
    removeCustom,
    setRemainingName,

    plannedWeeklySeconds,
    remainingWeeklySeconds,
    buildBudgets,
    reset,
  } as const;
}

export type UseBudgetWizard = ReturnType<typeof useBudgetWizard>;

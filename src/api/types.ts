export type BudgetStatus = "active" | "inactive" | "archived";

export interface Budget {
    id?: number;
    name: string;
    weeklyTime: number;
    status: BudgetStatus;
    weeklyOccurrences: number;
    icon: string;
}

export interface BudgetOverride {
    id?: number;
    budgetId: number;
    startDate: string; // Using string for the ISO date representation
    weeklyTime: number;
    notes?: string;
}

export interface BudgetStats {
    budget: Budget;
    budgetOverride?: BudgetOverride;
    duration: number;
    remaining: number;
}

export interface DailyStats {
    date: string; // Using string for the ISO date representation
    budgets: BudgetStats[];
    totalTime: number;
}

export interface StatsSummary {
    startDate: string; // Using string for the ISO date representation
    endDate: string; // Using string for the ISO date representation
    days: DailyStats[];
    budgets: BudgetStats[];
    totalPlanned: number;
    totalTime: number;
    totalRemaining: number;
}

export interface Event {
    id: number;
    budget: Budget;
    startTime: string;
    endTime?: string;
    notes: string;
}

export interface ProfileSettings {
    timezone: string;
    weekStartDay: string;
    eventCalendarType: "google" | "klokku" | "";
    googleCalendar?: {
        calendarId: string;
    };
}

export interface Profile {
    id?: number;
    username: string;
    displayName: string;
    photoUrl: string;
    settings: ProfileSettings;
}

export interface GoogleCalendarItem {
    id: string;
    summary: string;
}

export interface GoogleAuthRedirect {
    redirectUrl: string;
}

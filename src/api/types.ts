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

export interface ClickUpAuthRedirect {
    redirectUrl: string;
}

export interface ClickUpWorkspace {
    id: string;
    name: string;
}

export interface ClickUpSpace {
    id: string;
    name: string;
}

export interface ClickUpFolder {
    id: string;
    name: string;
}

export interface ClickUpTag {
    name: string;
}

export interface ClickUpTagMapping {
    clickUpSpaceId: number;
    clickUpTagName: string;
    budgetId: number;
    position: number;
}

export interface ClickUpTask {
    id: string;
    name: string;
    timeEstimateSec: number;
}

export interface ClickUpConfig {
    workspaceId: number;
    spaceId: number;
    folderId?: number;
    mappings: ClickUpTagMapping[];
}

export interface BudgetPlan {
    id?: number;
    name: string;
    isCurrent: boolean;
    items: BudgetPlanItem[];
}

export interface BudgetPlanItem {
    id?: number;
    name: string;
    weeklyDuration: number;
    weeklyOccurrences: number;
    icon: string;
    color: string;
}

export interface WeeklyPlan {
    budgetPlanId: number;
    items: WeeklyPlanItem[];
}

export interface WeeklyPlanItem {
    id?: number;
    budgetItemId: number;
    name: string;
    weeklyDuration: number;
    weeklyOccurrences: number;
    icon: string;
    color: string;
    notes: string;
    position: number;
}

export interface PlanItemStats {
    weeklyPlanItem: WeeklyPlanItem;
    duration: number;
    remaining: number;
}

export interface DailyStats {
    date: string; // Using string for the ISO date representation
    perPlanItem: PlanItemStats[];
    totalTime: number;
}

export interface StatsSummary {
    startDate: string; // Using string for the ISO date representation
    endDate: string; // Using string for the ISO date representation
    perDay: DailyStats[];
    perPlanItem: PlanItemStats[];
    totalPlanned: number;
    totalTime: number;
    totalRemaining: number;
}

export interface CurrentEvent {
    startTime: string;
    planItem: CurrentEventPlanItem;
}

export interface CurrentEventPlanItem {
    budgetItemId: number;
    name: string;
    weeklyDuration: number;
}

export interface ProfileSettings {
    timezone: string;
    weekStartDay: "monday" | "sunday";
    eventCalendarType: "google" | "klokku" | "";
    googleCalendar?: {
        calendarId: string;
    };
}

export interface Profile {
    uid?: string;
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
    budgetItemId: number;
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

export interface CalendarEvent {
    uid: string;
    summary: string;
    start: string;
    end: string;
    budgetItemId: number;
}

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
    isOffWeek: boolean;
    items: WeeklyPlanItem[];
}

export interface WeeklyPlanItem {
    id?: number;
    budgetItemId: number;
    name: string;
    weeklyDuration: number; // Planned duration for the whole week in seconds
    weeklyOccurrences: number;
    icon: string;
    color: string;
    notes: string;
    position: number;
}

export interface PlanItem {
    budgetPlanId: number;
    budgetItemId: number;
    weeklyItemId: number;
    name: string;
    icon: string;
    color: string;
    position: number;
    weeklyItemDuration: number;
    budgetItemDuration: number;
    weeklyOccurrences: number;
    notes: string;
}

export interface PlanItemStats {
    planItem: PlanItem;
    duration: number; // Actual duration of this item in the given time period (week) in seconds
    remaining: number; // Remaining duration of this item in the given time period (week) in seconds
    startDate: string; // Using string for the ISO date representation
    endDate: string; // Using string for the ISO date representation
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

export interface PlanItemHistoryStats {
    startDate: string;
    endDate: string;
    statsPerWeek: PlanItemStats[];
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
    ignoreShortEvents: boolean;
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
    clickUpSpaceId: string;
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
    workspaceId: string;
    spaceId: string;
    folderId?: string;
    mappings: ClickUpTagMapping[];
}

export interface CalendarEvent {
    uid: string;
    summary: string;
    start: string;
    end: string;
    budgetItemId: number;
}

// Budget Plan Report
export interface ReportItem {
    budgetItemId: number;
    name: string;
    icon: string;
    color: string;
    position: number;
    budgetPlanTime: number;   // seconds
    weeklyPlanTime: number;   // seconds
    actualTime: number;       // seconds
    averagePerWeek: number;   // seconds
    averagePerDay: number;    // seconds
}

export interface WeeklyReportEntry {
    weekNumber: string;
    startDate: string;
    endDate: string;
    items: ReportItem[];
    totalBudgetPlanTime: number;
    totalWeeklyPlanTime: number;
    totalActualTime: number;
}

export interface ReportTotals {
    items: ReportItem[];
    totalBudgetPlanTime: number;
    totalWeeklyPlanTime: number;
    totalActualTime: number;
}

export interface BudgetPlanReport {
    planId: number;
    planName: string;
    startDate: string;
    endDate: string;
    weekCount: number;
    excludedWeekCount: number;
    weeks: WeeklyReportEntry[];
    totals: ReportTotals;
}

// Budget Plan Item Detail Report
export interface ItemWeekEntry {
    weekNumber: string;
    startDate: string;
    endDate: string;
    budgetPlanTime: number;
    weeklyPlanTime: number;
    actualTime: number;
    isOffWeek: boolean;
}

export interface ItemDayEntry {
    date: string;
    actualTime: number;
    dayOfWeek: number;
}

export interface DayOfWeekEntry {
    dayOfWeek: number;
    averageTime: number;
}

export interface BudgetPlanItemReport {
    planId: number;
    planName: string;
    itemId: number;
    itemName: string;
    itemIcon: string;
    itemColor: string;
    startDate: string;
    endDate: string;
    totalActualTime: number;
    totalBudgetPlanTime: number;
    totalWeeklyPlanTime: number;
    completionPercent: number;
    remainingTime: number;
    overBudgetTime: number;
    averagePerDay: number;
    averagePerActiveDay: number;
    averagePerWeek: number;
    medianPerDay: number;
    medianPerActiveDay: number;
    medianPerWeek: number;
    activeDaysCount: number;
    totalDaysCount: number;
    weekCount: number;
    excludedWeekCount: number;
    weeks: ItemWeekEntry[];
    days: ItemDayEntry[];
    dayOfWeekAvg: DayOfWeekEntry[];
}

export interface Webhook {
    id: number;
    type: string;
    token: string;
    webhookUrl: string;
    data: {
        budgetItemId: number;
    };
}

export interface WebhookCreateRequest {
    type: string;
    data: {
        budgetItemId: number;
    };
}

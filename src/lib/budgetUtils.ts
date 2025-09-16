import {Budget} from "@/api/types.ts";

export function isBudgetActive(budget: Budget, date: Date): boolean {
    // If there's no start date or end date, the budget is always active
    if (!budget.startDate && !budget.endDate) {
        return true;
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Check if date is after start date (if there is one)
    if (budget.startDate) {
        const startDate = new Date(budget.startDate);
        startDate.setHours(0, 0, 0, 0);

        if (targetDate < startDate) {
            return false;
        }
    }

    // Check if date is before end date (if there is one)
    if (budget.endDate) {
        const endDate = new Date(budget.endDate);
        endDate.setHours(0, 0, 0, 0);

        if (targetDate > endDate) {
            return false;
        }
    }

    return true;

}

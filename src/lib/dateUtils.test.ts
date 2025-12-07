import { describe, it, expect } from 'vitest';
import { isBudgetActive } from './budgetUtils';
import { Budget } from '@/api/types';

describe('isBudgetActive', () => {
    const createBudget = (startDate?: string, endDate?: string): Budget => ({
        name: 'Test Budget',
        weeklyTime: 3600,
        weeklyOccurrences: 2,
        icon: 'calendar',
        startDate,
        endDate
    });

    it('should return true when budget has no start or end date', () => {
        const budget = createBudget();
        const date = new Date('2023-01-01');

        expect(isBudgetActive(budget, date)).toBe(true);
    });

    it('should return true when date is after start date and before end date', () => {
        const budget = createBudget('2022-01-01', '2024-01-01');
        const date = new Date('2023-01-01');

        expect(isBudgetActive(budget, date)).toBe(true);
    });

    it('should return true when date is equal to start date', () => {
        const budget = createBudget('2023-01-01', '2024-01-01');
        const date = new Date('2023-01-01');

        expect(isBudgetActive(budget, date)).toBe(true);
    });

    it('should return true when date is equal to end date', () => {
        const budget = createBudget('2022-01-01', '2023-01-01');
        const date = new Date('2023-01-01');

        expect(isBudgetActive(budget, date)).toBe(true);
    });

    it('should return false when date is before start date', () => {
        const budget = createBudget('2023-02-01', '2024-01-01');
        const date = new Date('2023-01-01');

        expect(isBudgetActive(budget, date)).toBe(false);
    });

    it('should return false when date is after end date', () => {
        const budget = createBudget('2022-01-01', '2022-12-31');
        const date = new Date('2023-01-01');

        expect(isBudgetActive(budget, date)).toBe(false);
    });

    it('should return true when budget has only start date and date is after it', () => {
        const budget = createBudget('2022-01-01');
        const date = new Date('2023-01-01');

        expect(isBudgetActive(budget, date)).toBe(true);
    });

    it('should return false when budget has only start date and date is before it', () => {
        const budget = createBudget('2023-02-01');
        const date = new Date('2023-01-01');

        expect(isBudgetActive(budget, date)).toBe(false);
    });

    it('should return true when budget has only end date and date is before it', () => {
        const budget = createBudget(undefined, '2023-02-01');
        const date = new Date('2023-01-01');

        expect(isBudgetActive(budget, date)).toBe(true);
    });

    it('should return false when budget has only end date and date is after it', () => {
        const budget = createBudget(undefined, '2022-12-31');
        const date = new Date('2023-01-01');

        expect(isBudgetActive(budget, date)).toBe(false);
    });

    it('should ignore time component of dates when comparing', () => {
        // Budget active for the whole day of 2023-01-01
        const budget = createBudget('2023-01-01', '2023-01-01');

        // Early morning
        const earlyDate = new Date('2023-01-01T01:00:00');
        expect(isBudgetActive(budget, earlyDate)).toBe(true);

        // Late night
        const lateDate = new Date('2023-01-01T23:59:59');
        expect(isBudgetActive(budget, lateDate)).toBe(true);
    });
});

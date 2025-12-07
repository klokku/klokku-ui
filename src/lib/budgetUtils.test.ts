import { describe, it, expect } from 'vitest';
import {weekStartDay} from "@/lib/dateUtils.ts";

describe('weekStartDay', () => {

    it('should return previous Monday when day is between Tuesday and Sunday and first day of a week is Monday', () => {
        const start = weekStartDay(new Date(2025, 11, 2) /* Tuesday */, "monday");
        expect(start).toEqual(new Date(2025, 11, 1));
    });

    it('should return same Monday when day is Monday and first day of a week is Monday', () => {
        const start = weekStartDay(new Date(2025, 11, 1) /* Monday */, "monday");
        expect(start).toEqual(new Date(2025, 11, 1));
    });

    it('should return previous Sunday when day is between Tuesday and Sunday and first day of a week is Monday', () => {
        const start = weekStartDay(new Date(2025, 11, 2) /* Tuesday */, "sunday");
        expect(start).toEqual(new Date(2025, 10, 30));
    });

    it('should return same Sunday when day is Sunday and first day of a week is Sunday', () => {
        const start = weekStartDay(new Date(2025, 10, 30) /* Sunday */, "sunday");
        expect(start).toEqual(new Date(2025, 10, 30));
    });

    it('should return exactly start of monday even if the input date is not at midnight', () => {
        const start = weekStartDay(new Date(2025, 11, 3, 13, 15, 45) /* Wed */, "monday");
        expect(start).toEqual(new Date(2025, 11, 1));
    });
});

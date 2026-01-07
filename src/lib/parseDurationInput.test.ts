import {describe, expect, it} from "vitest";
import {parseDurationInput} from "./dateUtils.ts";

describe("parseDurationInput", () => {
    const baseSeconds = 3600; // 1 hour

    describe("absolute duration", () => {
        it("should parse absolute duration with hours and minutes", () => {
            expect(parseDurationInput("5h 30m")).toBe(19800); // 5.5 hours
            expect(parseDurationInput("5h30m")).toBe(19800);
        });

        it("should parse absolute duration with only hours", () => {
            expect(parseDurationInput("2h")).toBe(7200);
        });

        it("should parse absolute duration with only minutes", () => {
            expect(parseDurationInput("45m")).toBe(2700);
        });

        it("should return undefined for empty or invalid input", () => {
            expect(parseDurationInput("")).toBeUndefined();
            expect(parseDurationInput(undefined)).toBeUndefined();
            expect(parseDurationInput("invalid")).toBeUndefined();
        });
    });

    describe("relative duration - addition", () => {
        it("should add hours and minutes to base duration", () => {
            expect(parseDurationInput("+3h20m", baseSeconds)).toBe(15600); // 1h + 3h20m = 4h20m (3600 + 12000)
        });

        it("should add only minutes to base duration", () => {
            expect(parseDurationInput("+80m", baseSeconds)).toBe(8400); // 1h + 80m = 2h20m
        });

        it("should add only hours to base duration", () => {
            expect(parseDurationInput("+2h", baseSeconds)).toBe(10800); // 1h + 2h = 3h
        });
    });

    describe("relative duration - subtraction", () => {
        it("should subtract hours and minutes from base duration", () => {
            expect(parseDurationInput("-30m", baseSeconds)).toBe(1800); // 1h - 30m = 30m
        });

        it("should not go below 0", () => {
            expect(parseDurationInput("-2h", baseSeconds)).toBe(0); // 1h - 2h = 0 (clamped)
            expect(parseDurationInput("-2h20m", baseSeconds)).toBe(0);
        });

        it("should handle valid subtraction", () => {
            expect(parseDurationInput("-20m", 7200)).toBe(6000); // 2h - 20m = 1h40m (7200 - 1200)
        });
    });

    describe("edge cases", () => {
        it("should handle whitespace", () => {
            expect(parseDurationInput("  5h 30m  ")).toBe(19800);
            expect(parseDurationInput("  +3h20m  ", baseSeconds)).toBe(15600); // 1h + 3h20m (3600 + 12000)
        });

        it("should work without base duration for relative operations", () => {
            expect(parseDurationInput("+3h", undefined)).toBe(10800);
            expect(parseDurationInput("-3h", undefined)).toBe(0); // 0 - 3h = 0 (clamped)
        });
    });
});

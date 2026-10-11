import {act, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {ElapsedActivityTime} from "@/components/dashboard/ElapsedActivityTime.tsx";

afterEach(() => vi.useRealTimers());

describe("running activity timer", () => {
    it("advances locally and immediately reflects a changed start time", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-10T12:00:00Z"));
        const {rerender} = render(<ElapsedActivityTime startTime="2026-10-10T11:30:00Z"/>);
        expect(screen.getByRole("timer")).toHaveTextContent("0h 30m");
        act(() => vi.advanceTimersByTime(60_000));
        expect(screen.getByRole("timer")).toHaveTextContent("0h 31m");
        rerender(<ElapsedActivityTime startTime="2026-10-10T12:01:00Z"/>);
        expect(screen.getByRole("timer")).toHaveTextContent("0h 0m");
    });

    it("resynchronizes when the page becomes visible after being suspended", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-10T12:00:00Z"));
        render(<ElapsedActivityTime startTime="2026-10-10T12:00:00Z"/>);
        vi.setSystemTime(new Date("2026-10-10T12:45:00Z"));
        act(() => document.dispatchEvent(new Event("visibilitychange")));
        expect(screen.getByRole("timer")).toHaveTextContent("0h 45m");
    });
});

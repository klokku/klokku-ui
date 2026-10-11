import {fireEvent, render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {StatsSummary, WeeklyPlanItem} from "@/api/types.ts";
import {WeeklyAllocationCard} from "@/components/dashboard/WeeklyAllocationCard.tsx";
import {getDashboardPeriod} from "@/lib/dashboardDates.ts";

const items: WeeklyPlanItem[] = Array.from({length: 7}, (_, index) => ({
    budgetItemId: index + 1, name: `Budget ${index + 1}`, weeklyDuration: 3600, weeklyOccurrences: 1,
    color: "#123456", icon: "", notes: "", position: index,
}));
const stats: StatsSummary = {
    startDate: "", endDate: "", totalTime: 0, totalPlanned: 25200, totalRemaining: 25200, perDay: [], perPlanItem: [],
};
const period = getDashboardPeriod(new Date("2026-10-10T12:00:00Z"), "Europe/Warsaw", "monday");
const ready = {isLoading: false, error: null, onRetry: vi.fn()};

beforeEach(() => {
    vi.stubGlobal("ResizeObserver", class implements ResizeObserver {
        constructor(private callback: ResizeObserverCallback) {}
        observe(target: Element) {
            this.callback([{target, contentRect: new DOMRect(0, 0, 320, 220), borderBoxSize: [], contentBoxSize: [], devicePixelContentBoxSize: []}], this);
        }
        unobserve() {}
        disconnect() {}
    });
});
afterEach(() => vi.unstubAllGlobals());

describe("Weekly allocation card", () => {
    it("expands both comparisons and gives budget links the same current-week period", () => {
        render(<MemoryRouter><WeeklyAllocationCard items={items} stats={stats} planId={7} period={period} timezone="Europe/Warsaw" planState={ready} spentState={ready}/></MemoryRouter>);
        expect(screen.getByText("7h 0m")).toBeInTheDocument();
        expect(screen.queryByRole("link", {name: "Budget 7"})).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", {name: "Show all budgets"}));
        const link = screen.getByRole("link", {name: "Budget 7"});
        expect(link.getAttribute("href")).toContain("/history/budget-report/7/item/7?mode=custom");
        expect(link.getAttribute("href")).toContain("from=2026-10-04T22%3A00%3A00.000Z");
        fireEvent.click(screen.getByRole("button", {name: "Show fewer budgets"}));
        expect(screen.queryByRole("link", {name: "Budget 7"})).not.toBeInTheDocument();
    });

    it("keeps the planned comparison usable when spent time fails instead of showing false zeroes", () => {
        const onRetry = vi.fn();
        render(<MemoryRouter><WeeklyAllocationCard items={items} stats={stats} planId={7} period={period} timezone="Europe/Warsaw" planState={ready} spentState={{...ready, error: new Error("offline"), onRetry}}/></MemoryRouter>);
        expect(screen.getByText("7h 0m")).toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent("Could not load spent time");
        expect(screen.getAllByLabelText("Spent time unavailable")).toHaveLength(7);
        expect(screen.queryByText("No time recorded this week")).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", {name: "Retry spent time"}));
        expect(onRetry).toHaveBeenCalledOnce();
    });

    it("shows explicit empty states for zero allocation and zero tracked time", () => {
        render(<MemoryRouter><WeeklyAllocationCard items={[{...items[0], weeklyDuration: 0}]} stats={stats} period={period} timezone="Europe/Warsaw" planState={ready} spentState={ready}/></MemoryRouter>);
        expect(screen.getByText("No allocation this week")).toBeInTheDocument();
        expect(screen.getByText("No time recorded this week")).toBeInTheDocument();
        expect(screen.getByRole("region", {name: "Weekly allocation"})).not.toHaveTextContent(/NaN|Infinity/);
    });

    it("shows outside-plan spending even when the plan has no allocated items", () => {
        render(<MemoryRouter><WeeklyAllocationCard items={[]} stats={{...stats, totalTime: 7200}} period={period} timezone="Europe/Warsaw" planState={ready} spentState={ready}/></MemoryRouter>);
        expect(screen.getByText("No allocation this week")).toBeInTheDocument();
        expect(screen.getByText("Outside this plan")).toBeInTheDocument();
        expect(screen.getAllByText("2h 0m")).toHaveLength(2);
        expect(screen.queryByText("No time recorded this week")).not.toBeInTheDocument();
    });
});

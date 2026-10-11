import {fireEvent, render, screen, within} from "@testing-library/react";
import {MemoryRouter} from "react-router";
import {describe, expect, it, vi} from "vitest";
import {BudgetBalanceCard} from "@/components/dashboard/BudgetBalanceCard.tsx";
import {getDashboardPeriod} from "@/lib/dashboardDates.ts";

const balances = Array.from({length: 6}, (_, index) => ({
    id: index + 1, name: `Budget ${index + 1}`, color: "#abcdef", planned: 3600, actual: 0, difference: -3600, position: index,
}));
const period = getDashboardPeriod(new Date("2026-10-10T12:00:00Z"), "Europe/Warsaw", "monday");
const state = {isLoading: false, error: null, onRetry: vi.fn()};

describe("Budget balance panel", () => {
    it("lets the user expand the list and opens the selected item's current-week report", () => {
        render(<MemoryRouter><BudgetBalanceCard balances={balances} planId={7} period={period} state={state}/></MemoryRouter>);
        const panel = screen.getByRole("region", {name: "Budget balance"});
        expect(within(panel).queryByRole("link", {name: "Budget 6"})).not.toBeInTheDocument();
        fireEvent.click(within(panel).getByRole("button", {name: "Show all"}));
        const link = within(panel).getByRole("link", {name: "Budget 6"});
        expect(link.getAttribute("href")).toContain("/history/budget-report/7/item/6?mode=custom");
        expect(link.getAttribute("href")).toContain("from=2026-10-04T22%3A00%3A00.000Z");
        fireEvent.click(within(panel).getByRole("button", {name: "Show less"}));
        expect(within(panel).queryByRole("link", {name: "Budget 6"})).not.toBeInTheDocument();
    });

    it("shows an actionable error instead of silently presenting no activity", () => {
        const onRetry = vi.fn();
        render(<MemoryRouter><BudgetBalanceCard balances={[]} period={period} state={{...state, error: new Error("offline"), onRetry}}/></MemoryRouter>);
        expect(screen.getByRole("alert")).toHaveTextContent("Could not load budget balance");
        fireEvent.click(screen.getByRole("button", {name: "Retry"}));
        expect(onRetry).toHaveBeenCalledOnce();
    });
});

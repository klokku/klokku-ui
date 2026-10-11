import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router";
import {describe, expect, it, vi} from "vitest";
import {WeeklyBudgetCompletionCard} from "@/components/dashboard/WeeklyBudgetCompletionCard.tsx";

describe("Weekly completion card", () => {
    it("caps visual overflow while reporting true usage and explicit zero-allocation states", () => {
        const base = {name: "Work", color: "#123456", position: 0, lastActive: 0, isCurrent: false, outsidePlan: false};
        render(<MemoryRouter><WeeklyBudgetCompletionCard state={{isLoading: false, error: null, onRetry: vi.fn()}} rows={[
            {...base, id: 1, planned: 3600, actual: 10800, percent: 300},
            {...base, id: 2, name: "Unplanned", planned: 0, actual: 1800, percent: null},
            {...base, id: 3, name: "Starting", planned: 0, actual: 0, percent: null, isCurrent: true},
        ]}/></MemoryRouter>);
        expect(screen.getByText("300%")).toBeInTheDocument();
        expect(screen.getByText("3h 0m spent / 1h 0m allocated")).toBeInTheDocument();
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "200");
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "300% · 3h 0m spent of 1h 0m allocated");
        expect(screen.getByText("Unplanned time: 0h 30m")).toBeInTheDocument();
        expect(screen.getByText("No allocation")).toBeInTheDocument();
        expect(screen.getByRole("region", {name: "Weekly completion"})).not.toHaveTextContent(/NaN|Infinity/);
    });
});

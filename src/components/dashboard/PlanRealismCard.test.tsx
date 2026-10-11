import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router";
import {describe, expect, it, vi} from "vitest";
import {PlanRealismCard} from "@/components/dashboard/PlanRealismCard.tsx";

describe("Plan realism panel", () => {
    it("shows descriptive averages for a short history without presenting a recurring pattern", () => {
        render(<MemoryRouter><PlanRealismCard description="Previous completed weeks" state={{isLoading: false, error: null, onRetry: vi.fn()}}
            rows={[{id: 1, name: "Exercise", color: "#123456", position: 0, count: 2, enoughHistory: false, planned: 7200, actual: 3600, difference: -3600, below: 2, above: 0}]}/></MemoryRouter>);
        expect(screen.getByText("Not enough history · 2/4 weeks needed")).toBeInTheDocument();
        expect(screen.getByText("2h 0m")).toBeInTheDocument();
        expect(screen.getByText("1h 0m")).toBeInTheDocument();
        expect(screen.getByText("Below in 2/2 weeks · Above in 0/2")).toBeInTheDocument();
        expect(screen.queryByText("1h 0m below/week")).not.toBeInTheDocument();
    });
});

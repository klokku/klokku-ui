import {fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {DashboardCustomization} from "./DashboardCustomization";

describe("dashboard customization", () => {
    it("restores defaults as a cancellable draft and resets server preferences only on Save", async () => {
        const save = vi.fn().mockResolvedValue(null);
        render(<DashboardCustomization configuration={{cards: [{id: "time-today", visible: false}]}} onSave={save}/>);
        fireEvent.click(screen.getByRole("button", {name: "Customize dashboard"}));
        fireEvent.click(screen.getByRole("button", {name: "Restore defaults"}));
        expect(screen.getByRole("switch", {name: "Show Time today"})).toHaveAttribute("aria-checked", "true");
        expect(save).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole("button", {name: "Cancel"}));
        fireEvent.click(screen.getByRole("button", {name: "Customize dashboard"}));
        expect(screen.getByRole("switch", {name: "Show Time today"})).toHaveAttribute("aria-checked", "false");
        fireEvent.click(screen.getByRole("button", {name: "Restore defaults"}));
        fireEvent.click(screen.getByRole("button", {name: "Save"}));
        await waitFor(() => expect(save).toHaveBeenCalledWith(null));
    });

    it("preserves unrecognized cards when editing visible cards", async () => {
        const save = vi.fn().mockResolvedValue(null);
        render(<DashboardCustomization configuration={{cards: [{id: "future-card", visible: false}, {id: "time-today", visible: true}]}} onSave={save}/>);
        fireEvent.click(screen.getByRole("button", {name: "Customize dashboard"}));
        fireEvent.click(screen.getByRole("switch", {name: "Show Time today"}));
        fireEvent.click(screen.getByRole("button", {name: "Save"}));
        await waitFor(() => expect(save).toHaveBeenCalled());
        expect(save.mock.calls[0][0].cards.slice(0, 2)).toEqual([{id: "future-card", visible: false}, {id: "time-today", visible: false}]);
    });

    it("discards cancelled edits and keeps failed saves available for retry", async () => {
        const save = vi.fn().mockRejectedValueOnce(new Error("Server offline")).mockResolvedValue(null);
        render(<DashboardCustomization configuration={null} onSave={save}/>);
        fireEvent.click(screen.getByRole("button", {name: "Customize dashboard"}));
        fireEvent.click(screen.getByRole("switch", {name: "Show Time today"}));
        fireEvent.click(screen.getByRole("button", {name: "Move Time today up"}));
        fireEvent.click(screen.getByRole("button", {name: "Cancel"}));
        expect(save).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole("button", {name: "Customize dashboard"}));
        expect(screen.getByRole("switch", {name: "Show Time today"})).toHaveAttribute("aria-checked", "true");
        fireEvent.click(screen.getByRole("switch", {name: "Show Time today"}));
        fireEvent.click(screen.getByRole("button", {name: "Move Time today up"}));
        fireEvent.click(screen.getByRole("button", {name: "Save"}));
        expect(await screen.findByRole("alert")).toHaveTextContent("Server offline");
        const dialog = screen.getByRole("dialog");
        expect(within(dialog).getByRole("switch", {name: "Show Time today"})).toHaveAttribute("aria-checked", "false");
        fireEvent.click(within(dialog).getByRole("button", {name: "Retry save"}));
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        expect(save.mock.calls[1][0].cards.slice(3, 5)).toEqual([
            {id: "time-today", visible: false}, {id: "weekly-allocation", visible: true},
        ]);
    });
});

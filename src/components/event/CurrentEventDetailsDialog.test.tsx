import {act, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {CurrentEventDetailsDialog} from "@/components/event/CurrentEventDetailsDialog.tsx";

describe("running activity editor", () => {
    it("disables updates and form controls while saving, then closes after success", async () => {
        let resolveSave!: () => void;
        const onSave = vi.fn(() => new Promise<void>(resolve => { resolveSave = resolve; }));
        const onOpenChange = vi.fn();
        render(<CurrentEventDetailsDialog open onOpenChange={onOpenChange} onSave={onSave} timezone="UTC"
            event={{startTime: "2026-10-19T00:30:00Z", notes: "Original note", planItem: {budgetItemId: 1, name: "Work", weeklyDuration: 3600}}}/>);
        fireEvent.click(screen.getByRole("button", {name: "Update"}));
        await waitFor(() => expect(screen.getByRole("button", {name: "Updating..."})).toBeDisabled());
        expect(screen.getByRole("textbox", {name: "Notes"})).toBeDisabled();
        expect(onOpenChange).not.toHaveBeenCalled();
        await act(async () => resolveSave());
        await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
        expect(screen.getByRole("button", {name: "Update"})).toBeEnabled();
    });

    it("preserves notes after a failed save and lets the user retry", async () => {
        const onSave = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
        const onOpenChange = vi.fn();
        render(<CurrentEventDetailsDialog open onOpenChange={onOpenChange} onSave={onSave} timezone="America/New_York"
            event={{startTime: "2026-10-19T00:30:00Z", notes: "Original note", planItem: {budgetItemId: 1, name: "Work", weeklyDuration: 3600}}}/>);
        expect(screen.getByLabelText("Start time", {selector: "input"})).toHaveValue("20:30");
        fireEvent.change(screen.getByRole("textbox", {name: "Notes"}), {target: {value: "Keep this edit"}});
        fireEvent.click(screen.getByRole("button", {name: "Update"}));
        expect(await screen.findByRole("alert")).toHaveTextContent("Could not update this activity");
        expect(onOpenChange).not.toHaveBeenCalled();
        expect(screen.getByRole("textbox", {name: "Notes"})).toHaveValue("Keep this edit");
        fireEvent.click(screen.getByRole("button", {name: "Update"}));
        await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
        const saved = onSave.mock.calls[1][0];
        expect(saved.notes).toBe("Keep this edit");
        expect(new Date(saved.startTime).toISOString()).toBe("2026-10-19T00:30:00.000Z");
    });
});

import {act, render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {CurrentEvent} from "@/api/types.ts";
import {CurrentEventDetailsDialog} from "@/components/event/CurrentEventDetailsDialog.tsx";

const dialogMocks = vi.hoisted(() => ({
    submit: undefined as ((event: CurrentEvent) => Promise<void>) | undefined,
}));

vi.mock("@radix-ui/react-dialog", () => ({
    Dialog: ({open, children}: {open: boolean; children: React.ReactNode}) => open ? <div>{children}</div> : null,
    DialogDescription: ({children}: {children?: React.ReactNode}) => <div>{children}</div>,
}));

vi.mock("@/components/ui/dialog.tsx", () => ({
    DialogContent: ({children}: {children: React.ReactNode}) => <div role="dialog">{children}</div>,
    DialogFooter: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
    DialogHeader: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
    DialogTitle: ({children}: {children: React.ReactNode}) => <h2>{children}</h2>,
}));

vi.mock("@/components/event/CurrentEventDetailsForm.tsx", () => ({
    CurrentEventDetailsForm: ({onSubmit}: {onSubmit: (event: CurrentEvent) => Promise<void>}) => {
        dialogMocks.submit = onSubmit;
        return <div>Event form</div>;
    },
}));

const currentEvent: CurrentEvent = {
    startTime: "2026-08-09T10:00:00Z",
    notes: "Current note",
    planItem: {
        budgetItemId: 12,
        name: "Project work",
        weeklyDuration: 3600,
    },
};

describe("CurrentEventDetailsDialog", () => {
    it("disables Update while saving and closes after success", async () => {
        let resolveSave!: () => void;
        const onSave = vi.fn(() => new Promise<void>((resolve) => {
            resolveSave = resolve;
        }));
        const onOpenChange = vi.fn();
        render(<CurrentEventDetailsDialog open event={currentEvent} onSave={onSave} onOpenChange={onOpenChange}/>);

        let submitPromise!: Promise<void>;
        act(() => {
            submitPromise = dialogMocks.submit!(currentEvent);
        });
        expect(screen.getByRole("button", {name: "Update"})).toBeDisabled();

        await act(async () => {
            resolveSave();
            await submitPromise;
        });

        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(screen.getByRole("button", {name: "Update"})).toBeEnabled();
    });

    it("stays open and propagates a save rejection", async () => {
        const error = new Error("Save failed");
        const onSave = vi.fn().mockRejectedValue(error);
        const onOpenChange = vi.fn();
        render(<CurrentEventDetailsDialog open event={currentEvent} onSave={onSave} onOpenChange={onOpenChange}/>);

        await act(async () => {
            await expect(dialogMocks.submit!(currentEvent)).rejects.toBe(error);
        });

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Update"})).toBeEnabled();
        expect(onOpenChange).not.toHaveBeenCalled();
    });
});

import {useState} from "react";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {CurrentEvent} from "@/api/types.ts";
import {CurrentEventCard} from "@/components/dashboard/CurrentEventCard.tsx";
import {userSettings} from "@/components/settings.ts";

const mocks = vi.hoisted(() => ({
    updateEventNotes: vi.fn(),
    updateEventStartTime: vi.fn(),
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

vi.mock("@/api/useCurrentEvent.ts", () => ({
    default: () => ({
        currentEvent,
        startEvent: vi.fn(),
        updateEventNotes: mocks.updateEventNotes,
        updateEventStartTime: mocks.updateEventStartTime,
    }),
}));

vi.mock("@/api/useWeeklyPlan.ts", () => ({
    default: () => ({
        isLoading: false,
        weeklyPlan: {
            items: [{...currentEvent.planItem, color: "#123456"}],
        },
    }),
}));

vi.mock("@/api/useCalendar.ts", () => ({
    default: () => ({recentEvents: [], isLoadingRecentEvents: false}),
}));

vi.mock("@/components/dashboard/PreviousEvent.tsx", () => ({
    PreviousEvent: () => null,
}));

vi.mock("@/components/event/CurrentEventDetailsDialog.tsx", () => ({
    CurrentEventDetailsDialog: ({
        event,
        onOpenChange,
        onSave,
    }: {
        event: CurrentEvent;
        onOpenChange: (open: boolean) => void;
        onSave: (event: CurrentEvent) => Promise<void>;
    }) => {
        const [notes, setNotes] = useState(event.notes);
        const [startTime, setStartTime] = useState(event.startTime);
        return (
            <div role="dialog" aria-label="Edit current event">
                <label htmlFor="current-event-notes">Notes</label>
                <textarea
                    id="current-event-notes"
                    value={notes}
                    onChange={(changeEvent) => setNotes(changeEvent.target.value)}
                />
                <label htmlFor="current-event-start">Start time</label>
                <input
                    id="current-event-start"
                    value={startTime}
                    onChange={(changeEvent) => setStartTime(changeEvent.target.value)}
                />
                <button type="button" onClick={() => onOpenChange(false)}>Close editor</button>
                <button type="button" onClick={() => onSave({...event, notes, startTime})}>Save editor</button>
            </div>
        );
    },
}));

describe("CurrentEventCard", () => {
    beforeEach(() => {
        mocks.updateEventNotes.mockReset();
        mocks.updateEventStartTime.mockReset();
        mocks.updateEventNotes.mockResolvedValue(undefined);
        mocks.updateEventStartTime.mockResolvedValue(undefined);
    });

    it("discards unsaved form state when the editor is closed and reopened", () => {
        render(<CurrentEventCard/>);
        const editButton = screen.getByText(new Date(currentEvent.startTime).toLocaleTimeString(userSettings.locale, {timeStyle: "short"})).closest("button")!;

        fireEvent.click(editButton);
        fireEvent.change(screen.getByRole("textbox", {name: "Notes"}), {target: {value: "Unsaved note"}});
        fireEvent.click(screen.getByRole("button", {name: "Close editor"}));
        fireEvent.click(editButton);

        expect(screen.getByRole("textbox", {name: "Notes"})).toHaveValue("Current note");
    });

    it("updates changed notes", async () => {
        render(<CurrentEventCard/>);
        const editButton = screen.getByText(new Date(currentEvent.startTime).toLocaleTimeString(userSettings.locale, {timeStyle: "short"})).closest("button")!;

        fireEvent.click(editButton);
        fireEvent.change(screen.getByRole("textbox", {name: "Notes"}), {target: {value: "Updated note"}});
        fireEvent.click(screen.getByRole("button", {name: "Save editor"}));

        await waitFor(() => expect(mocks.updateEventNotes).toHaveBeenCalledWith("Updated note"));
        expect(mocks.updateEventStartTime).not.toHaveBeenCalled();
    });

    it("updates a changed start time", async () => {
        render(<CurrentEventCard/>);
        const editButton = screen.getByText(new Date(currentEvent.startTime).toLocaleTimeString(userSettings.locale, {timeStyle: "short"})).closest("button")!;
        const changedStartTime = "2026-08-09T11:00:00Z";

        fireEvent.click(editButton);
        fireEvent.change(screen.getByRole("textbox", {name: "Start time"}), {target: {value: changedStartTime}});
        fireEvent.click(screen.getByRole("button", {name: "Save editor"}));

        await waitFor(() => expect(mocks.updateEventStartTime).toHaveBeenCalledWith(new Date(changedStartTime)));
        expect(mocks.updateEventNotes).not.toHaveBeenCalled();
    });

    it("does not update unchanged current event values", async () => {
        render(<CurrentEventCard/>);
        const editButton = screen.getByText(new Date(currentEvent.startTime).toLocaleTimeString(userSettings.locale, {timeStyle: "short"})).closest("button")!;

        fireEvent.click(editButton);
        fireEvent.click(screen.getByRole("button", {name: "Save editor"}));

        await waitFor(() => {
            expect(mocks.updateEventNotes).not.toHaveBeenCalled();
            expect(mocks.updateEventStartTime).not.toHaveBeenCalled();
        });
    });
});

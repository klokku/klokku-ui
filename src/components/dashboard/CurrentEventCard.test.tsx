import {ComponentProps} from "react";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {CurrentEvent} from "@/api/types.ts";
import {CurrentEventCard} from "@/components/dashboard/CurrentEventCard.tsx";
import {MemoryRouter} from "react-router";

const mocks = vi.hoisted(() => ({
    updateEventNotes: vi.fn(),
    updateEventStartTime: vi.fn(),
    startEvent: vi.fn(),
    refetch: vi.fn(),
}));

const currentEvent: CurrentEvent = {
    startTime: "2026-08-09T10:00:00.123456Z",
    notes: "Current note",
    planItem: {
        budgetItemId: 12,
        name: "Project work",
        weeklyDuration: 3600,
    },
};

vi.mock("@/components/dashboard/PreviousEvent.tsx", () => ({
    PreviousEvent: () => null,
}));

const activity = {
    currentEvent, startEvent: mocks.startEvent, updateEventNotes: mocks.updateEventNotes, updateEventStartTime: mocks.updateEventStartTime,
    isStartingEvent: false, startError: null, resetStartError: vi.fn(),
    refetch: mocks.refetch,
};
const ready = {isLoading: false, error: null, onRetry: vi.fn()};

function card(overrides: Partial<ComponentProps<typeof CurrentEventCard>> = {}) {
    return <MemoryRouter><CurrentEventCard
        weeklyPlan={{budgetPlanId: 1, isOffWeek: false, items: [{...currentEvent.planItem, weeklyOccurrences: 1, color: "#123456", icon: "", notes: "", position: 0}]}}
        activity={activity} activityState={ready} planState={ready} recentEvents={[]} recentState={ready}
        calendarActions={{createEvent: vi.fn(), modifyEvent: vi.fn(), deleteEvent: vi.fn()}} timezone="UTC" {...overrides}
    /></MemoryRouter>;
}

const renderCard = (overrides: Partial<ComponentProps<typeof CurrentEventCard>> = {}) => render(card(overrides));

describe("CurrentEventCard", () => {
    beforeEach(() => {
        mocks.updateEventNotes.mockReset();
        mocks.updateEventStartTime.mockReset();
        mocks.updateEventNotes.mockResolvedValue(undefined);
        mocks.updateEventStartTime.mockResolvedValue(undefined);
        mocks.startEvent.mockReset();
        mocks.startEvent.mockResolvedValue(undefined);
        mocks.refetch.mockReset();
        mocks.refetch.mockResolvedValue({data: currentEvent, error: null});
    });

    it("discards unsaved form state when the editor is closed and reopened", () => {
        renderCard();
        const editButton = screen.getByRole("button", {name: "Edit activity details"});

        fireEvent.click(editButton);
        fireEvent.change(screen.getByRole("textbox", {name: "Notes"}), {target: {value: "Unsaved note"}});
        fireEvent.click(screen.getByRole("button", {name: "Close"}));
        fireEvent.click(editButton);

        expect(screen.getByRole("textbox", {name: "Notes"})).toHaveValue("Current note");
    });

    it("updates changed notes", async () => {
        renderCard();
        const editButton = screen.getByRole("button", {name: "Edit activity details"});

        fireEvent.click(editButton);
        fireEvent.change(screen.getByRole("textbox", {name: "Notes"}), {target: {value: "Updated note"}});
        fireEvent.click(screen.getByRole("button", {name: "Update"}));

        await waitFor(() => expect(mocks.updateEventNotes).toHaveBeenCalledWith("Updated note"));
        expect(mocks.updateEventStartTime).not.toHaveBeenCalled();
    });

    it("updates a changed start time", async () => {
        renderCard();
        const editButton = screen.getByRole("button", {name: "Edit activity details"});
        const changedStartTime = "2026-08-09T11:00:00.123Z";

        fireEvent.click(editButton);
        fireEvent.change(screen.getByLabelText("Start time", {selector: "input"}), {target: {value: "11:00"}});
        fireEvent.click(screen.getByRole("button", {name: "Update"}));

        await waitFor(() => expect(mocks.updateEventStartTime).toHaveBeenCalledWith(new Date(changedStartTime)));
        expect(mocks.updateEventNotes).not.toHaveBeenCalled();
    });

    it("does not update unchanged current event values", async () => {
        renderCard();
        const editButton = screen.getByRole("button", {name: "Edit activity details"});

        fireEvent.click(editButton);
        fireEvent.click(screen.getByRole("button", {name: "Update"}));

        await waitFor(() => {
            expect(mocks.updateEventNotes).not.toHaveBeenCalled();
            expect(mocks.updateEventStartTime).not.toHaveBeenCalled();
        });
    });

    it("keeps the running activity and timer visible when the activity is absent from the weekly plan", () => {
        renderCard({weeklyPlan: {budgetPlanId: 2, isOffWeek: false, items: []}});
        expect(screen.getByRole("heading", {name: "Project work"})).toBeInTheDocument();
        expect(screen.getByText("Outside this week's plan")).toBeInTheDocument();
        expect(screen.getByRole("timer", {name: "Elapsed activity time"})).toBeInTheDocument();
        expect(screen.queryByText("No activity running.")).not.toBeInTheDocument();
    });

    it("disables switching while a switch is pending and preserves the timer when recent history fails", () => {
        renderCard({activity: {...activity, isStartingEvent: true}, recentState: {...ready, error: new Error("offline")}});
        expect(screen.getByRole("combobox", {name: "Switch activity"})).toBeDisabled();
        expect(screen.getByRole("timer")).toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent("Could not load recent activity");
    });

    it("does not apply an open editor's changes to a different running activity", async () => {
        const {rerender} = renderCard();
        fireEvent.click(screen.getByRole("button", {name: "Edit activity details"}));
        fireEvent.change(screen.getByRole("textbox", {name: "Notes"}), {target: {value: "For the original activity"}});
        rerender(card({activity: {...activity, currentEvent: {...currentEvent, startTime: "2026-08-09T11:00:00Z", planItem: {...currentEvent.planItem, budgetItemId: 13, name: "Another activity"}}}}));
        mocks.refetch.mockResolvedValue({data: {...currentEvent, startTime: "2026-08-09T11:00:00Z", planItem: {...currentEvent.planItem, budgetItemId: 13}}});
        fireEvent.click(screen.getByRole("button", {name: "Update"}));
        expect(await screen.findByRole("alert")).toHaveTextContent("The running activity changed");
        expect(mocks.updateEventNotes).not.toHaveBeenCalled();
        expect(mocks.updateEventStartTime).not.toHaveBeenCalled();
        expect(screen.getByRole("textbox", {name: "Notes"})).toHaveValue("For the original activity");
    });

    it("retries unsaved notes after the start-time patch succeeded and current activity was refreshed", async () => {
        mocks.updateEventNotes.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
        const {rerender} = renderCard();
        fireEvent.click(screen.getByRole("button", {name: "Edit activity details"}));
        fireEvent.change(screen.getByLabelText("Start time", {selector: "input"}), {target: {value: "11:00"}});
        fireEvent.change(screen.getByRole("textbox", {name: "Notes"}), {target: {value: "Retain this draft"}});
        fireEvent.click(screen.getByRole("button", {name: "Update"}));
        await screen.findByRole("alert");
        const refreshed = {...currentEvent, startTime: "2026-08-09T11:00:00.123Z"};
        rerender(card({activity: {...activity, currentEvent: refreshed}}));
        mocks.refetch.mockResolvedValue({data: refreshed, error: null});
        expect(screen.getByRole("textbox", {name: "Notes"})).toHaveValue("Retain this draft");
        fireEvent.click(screen.getByRole("button", {name: "Update"}));
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        expect(mocks.updateEventStartTime).toHaveBeenCalledOnce();
        expect(mocks.updateEventNotes).toHaveBeenCalledTimes(2);
        expect(mocks.updateEventNotes).toHaveBeenLastCalledWith("Retain this draft");
    });
});

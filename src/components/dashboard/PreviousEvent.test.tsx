import {ReactNode} from "react";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {CalendarEvent} from "@/api/types.ts";
import {PreviousEvent} from "@/components/dashboard/PreviousEvent.tsx";
import {toServerFormat} from "@/lib/dateUtils.ts";

const mocks = vi.hoisted(() => ({
    createEvent: vi.fn(),
    modifyEvent: vi.fn(),
    deleteEvent: vi.fn(),
}));

vi.mock("@/api/useCalendar.ts", () => ({
    default: () => mocks,
}));

vi.mock("@/api/useWeeklyPlan.ts", () => ({
    default: () => ({
        weeklyPlan: {
            items: [{budgetItemId: 42, name: "Project work"}],
        },
    }),
}));

vi.mock("@/components/ui/popover.tsx", () => ({
    Popover: ({open, children}: {open: boolean; children: ReactNode}) => open ? <div>{children}</div> : null,
    PopoverContent: ({children}: {children: ReactNode}) => <div>{children}</div>,
    PopoverTrigger: ({children}: {children: ReactNode}) => <>{children}</>,
}));

vi.mock("@/components/ui/select.tsx", () => ({
    Select: ({children}: {children: ReactNode}) => <div>{children}</div>,
    SelectContent: ({children}: {children: ReactNode}) => <div>{children}</div>,
    SelectItem: ({children}: {children: ReactNode}) => <div>{children}</div>,
    SelectTrigger: ({children}: {children: ReactNode}) => <button type="button">{children}</button>,
    SelectValue: ({placeholder}: {placeholder?: string}) => <span>{placeholder}</span>,
}));

vi.mock("@/components/datetime/DateTimePicker.tsx", () => ({
    DateTimePicker: ({value, onChange}: {value: Date; onChange: (value: Date) => void}) => (
        <button
            type="button"
            aria-label={`Change date ${value.getTime()}`}
            onClick={() => onChange(new Date(value.getTime() + 15 * 60 * 1000))}
        >
            {value.toISOString()}
        </button>
    ),
}));

const event: CalendarEvent = {
    uid: "event-123",
    summary: "Project work",
    start: "2026-08-09T10:00:00Z",
    end: "2026-08-09T11:00:00Z",
    notes: "Keep this context",
    budgetItemId: 42,
};

function renderAndOpenEditor() {
    const rendered = render(<PreviousEvent event={event}/>);
    fireEvent.click(rendered.container.querySelector("[data-slot='edit-button']")!);
    return rendered;
}

describe("PreviousEvent editor", () => {
    beforeEach(() => {
        mocks.createEvent.mockReset();
        mocks.modifyEvent.mockReset();
        mocks.deleteEvent.mockReset();
        mocks.createEvent.mockResolvedValue(undefined);
        mocks.modifyEvent.mockResolvedValue(undefined);
        mocks.deleteEvent.mockResolvedValue(undefined);
    });

    it("prefills existing notes", () => {
        renderAndOpenEditor();

        expect(screen.getByRole("textbox", {name: "Notes"})).toHaveValue("Keep this context");
    });

    it("preserves notes when only the start time changes", async () => {
        renderAndOpenEditor();
        fireEvent.click(screen.getAllByRole("button", {name: /Change date/})[0]);
        fireEvent.click(await screen.findByRole("button", {name: "Save"}));

        await waitFor(() => expect(mocks.modifyEvent).toHaveBeenCalledWith({
            ...event,
            start: toServerFormat(new Date(new Date(event.start).getTime() + 15 * 60 * 1000)),
            end: toServerFormat(new Date(event.end)),
        }));
    });

    it("sends an empty string when notes are cleared", async () => {
        renderAndOpenEditor();
        fireEvent.click(screen.getByRole("button", {name: "Remove note"}));
        await waitFor(() => expect(screen.getByRole("button", {name: "Save"})).toBeEnabled());
        fireEvent.click(screen.getByRole("button", {name: "Save"}));

        await waitFor(() => expect(mocks.modifyEvent).toHaveBeenCalledWith({
            ...event,
            start: toServerFormat(new Date(event.start)),
            end: toServerFormat(new Date(event.end)),
            notes: "",
        }));
    });

    it("resets notes and dirty state after closing and reopening", async () => {
        const rendered = renderAndOpenEditor();
        fireEvent.change(screen.getByRole("textbox", {name: "Notes"}), {target: {value: "Unsaved context"}});
        await waitFor(() => expect(screen.getByRole("button", {name: "Save"})).toBeEnabled());

        fireEvent.click(screen.getByRole("button", {name: "Cancel"}));
        fireEvent.click(rendered.container.querySelector("[data-slot='edit-button']")!);

        expect(screen.getByRole("textbox", {name: "Notes"})).toHaveValue("Keep this context");
        await waitFor(() => expect(screen.getByRole("button", {name: "Save"})).toBeDisabled());
    });
});

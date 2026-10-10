import {useEffect} from "react";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {CalendarPage} from "@/pages/calendar/CalendarPage.tsx";
import {CurrentProfileProvider, useCurrentProfile} from "@/hooks/currentProfileContext.tsx";

function ProfileCalendar() {
    const {currentProfileUid, setCurrentProfileUid} = useCurrentProfile();
    useEffect(() => setCurrentProfileUid("test-profile"), [setCurrentProfileUid]);
    return currentProfileUid ? <CalendarPage/> : null;
}

function renderCalendar(weekStartDay: "monday" | "sunday" = "monday") {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
        if (url === "/api/user/current") {
            return Response.json({settings: {weekStartDay}});
        }
        if (url === "/api/user/current/photo") return new Response();
        if (url === "/api/event/current") return new Response(null, {status: 404});
        if (url.startsWith("/api/weeklyplan?")) return Response.json({items: []});
        if (url.startsWith("/api/calendar/event")) return Response.json([]);
        throw new Error(`Unexpected request: ${url}`);
    }));
    const client = new QueryClient({defaultOptions: {queries: {retry: false, gcTime: 0}}});
    return render(
        <QueryClientProvider client={client}>
            <CurrentProfileProvider>
                <ProfileCalendar/>
            </CurrentProfileProvider>
        </QueryClientProvider>,
    );
}

describe("calendar event creation", () => {
    beforeEach(() => {
        vi.useFakeTimers({toFake: ["Date"]});
        vi.setSystemTime(new Date(2026, 9, 10, 14, 47));
        vi.stubGlobal("innerWidth", 390);
        vi.stubGlobal("matchMedia", vi.fn(() => ({addEventListener: vi.fn(), removeEventListener: vi.fn()})));
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("prefills the displayed mobile day after navigation", async () => {
        const {container} = renderCalendar();
        await screen.findByRole("button", {name: "Previous day"});
        fireEvent.click(screen.getByRole("button", {name: "Previous day"}));
        await waitFor(() => expect(container.querySelector(".fc-col-header-cell")).toHaveAttribute("data-date", "2026-10-09"));
        fireEvent.click(screen.getByRole("button", {name: "Add event"}));

        expect(await screen.findAllByRole("button", {name: new Date(2026, 9, 9).toLocaleDateString()})).toHaveLength(2);
        const times = document.querySelectorAll<HTMLInputElement>('input[type="time"]');
        expect(Array.from(times, input => input.value)).toEqual(["13:30", "14:30"]);
    });

    it("uses today in the current desktop week", async () => {
        vi.stubGlobal("innerWidth", 1280);
        renderCalendar();
        await screen.findByRole("button", {name: "Previous week"});
        fireEvent.click(screen.getByRole("button", {name: "Add event"}));

        expect(await screen.findAllByRole("button", {name: new Date(2026, 9, 10).toLocaleDateString()})).toHaveLength(2);
    });

    it.each([
        {weekStartDay: "monday" as const, initialDate: "2026-10-05", previousDate: "2026-09-28", expected: new Date(2026, 8, 28)},
        {weekStartDay: "sunday" as const, initialDate: "2026-10-04", previousDate: "2026-09-27", expected: new Date(2026, 8, 27)},
    ])("uses the first displayed day after navigation with a $weekStartDay-first profile", async ({weekStartDay, initialDate, previousDate, expected}) => {
        vi.stubGlobal("innerWidth", 1280);
        const {container} = renderCalendar(weekStartDay);
        await waitFor(() => expect(container.querySelector(".fc-col-header-cell")).toHaveAttribute("data-date", initialDate));
        fireEvent.click(screen.getByRole("button", {name: "Previous week"}));
        await waitFor(() => expect(container.querySelector(".fc-col-header-cell")).toHaveAttribute("data-date", previousDate));
        fireEvent.click(screen.getByRole("button", {name: "Add event"}));

        expect(await screen.findAllByRole("button", {name: expected.toLocaleDateString()})).toHaveLength(2);
    });

    it("disables creation until the calendar is mounted", async () => {
        renderCalendar();
        expect(screen.getByRole("button", {name: "Add event"})).toBeDisabled();
        await waitFor(() => expect(screen.getByRole("button", {name: "Add event"})).toBeEnabled());
    });

    it("opens the current week on Sunday for a Sunday-first profile", async () => {
        vi.setSystemTime(new Date(2026, 9, 11, 14, 47));
        vi.stubGlobal("innerWidth", 1280);
        const {container} = renderCalendar("sunday");

        await waitFor(() => expect(container.querySelector(".fc-col-header-cell")).toHaveAttribute("data-date", "2026-10-11"));
        fireEvent.click(screen.getByRole("button", {name: "Add event"}));
        expect(await screen.findAllByRole("button", {name: new Date(2026, 9, 11).toLocaleDateString()})).toHaveLength(2);
    });
});

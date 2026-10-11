import {PropsWithChildren, useEffect} from "react";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {MemoryRouter} from "react-router";
import {afterEach, describe, expect, it, vi} from "vitest";
import {CurrentProfileProvider, useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import {TimeTodayCard} from "@/components/dashboard/TimeTodayCard.tsx";
import {HistoryPage} from "@/pages/history/HistoryPage.tsx";
import useDashboardInsights from "@/pages/dashboard/useDashboardInsights.ts";

function TodayDashboard() {
    const insights = useDashboardInsights();
    return <TimeTodayCard today={insights.today} planId={insights.weeklyPlan?.budgetPlanId} period={insights.period} state={insights.currentState}/>;
}

function ProfileBootstrap() {
    const {setCurrentProfileUid} = useCurrentProfile();
    useEffect(() => setCurrentProfileUid("timezone-profile"), [setCurrentProfileUid]);
    return null;
}

function setup() {
    // It is Monday in UTC, but still Sunday in the profile's New York timezone.
    vi.useFakeTimers({toFake: ["Date"]});
    vi.setSystemTime(new Date("2026-10-19T00:30:00Z"));
    const statsDates: string[] = [];
    const itemStats = {
        planItem: {budgetItemId: 1, name: "Exercise", weeklyItemDuration: 3600, budgetItemDuration: 3600},
        duration: 3600, remaining: 0,
    };
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
        const url = new URL(String(input), "http://localhost");
        if (url.pathname === "/api/user/current/dashboard") return Response.json(null);
        if (url.pathname === "/api/user/current") {
            return Response.json({uid: "timezone-profile", settings: {timezone: "America/New_York", weekStartDay: "monday"}});
        }
        if (url.pathname === "/api/stats/weekly") {
            statsDates.push(url.searchParams.get("date")!);
            return Response.json({
                perPlanItem: [itemStats], totalPlanned: 3600, totalTime: 3600, totalRemaining: 0,
                perDay: [{date: "2026-10-18T00:00:00-04:00", totalTime: 3600, perPlanItem: [itemStats]}],
            });
        }
        if (url.pathname === "/api/weeklyplan") {
            return Response.json({budgetPlanId: 1, isOffWeek: false, items: [{budgetItemId: 1, name: "Exercise", weeklyDuration: 3600, color: "#123456", position: 0}]});
        }
        if (url.pathname.startsWith("/api/calendar/event")) return Response.json([]);
        if (url.pathname === "/api/budgetplan/1/report") return Response.json({weeks: [], excludedWeekCount: 0});
        return new Response("", {status: 404});
    }));
    const client = new QueryClient({defaultOptions: {queries: {retry: false, gcTime: 0}}});
    function Wrapper({children}: PropsWithChildren) {
        return <QueryClientProvider client={client}><MemoryRouter><CurrentProfileProvider><ProfileBootstrap/>{children}</CurrentProfileProvider></MemoryRouter></QueryClientProvider>;
    }
    return {Wrapper, statsDates};
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

describe("existing statistics views with a different profile timezone", () => {
    it("shows the profile's Sunday activity in Time today and requests the profile's current week", async () => {
        const {Wrapper, statsDates} = setup();
        render(<Wrapper><TodayDashboard/></Wrapper>);
        expect(await screen.findByText("Exercise")).toBeInTheDocument();
        expect(screen.getAllByText("1h 0m")).toHaveLength(2);
        expect(statsDates).toEqual(["2026-10-12T00:00:00-04:00"]);
    });

    it("keeps History's selected calendar week and its requests aligned during navigation", async () => {
        const {Wrapper, statsDates} = setup();
        render(<Wrapper><HistoryPage/></Wrapper>);
        await screen.findByText("Exercise");
        expect(statsDates[0]).toBe("2026-10-12T00:00:00-04:00");
        expect(screen.getByRole("button", {name: "Next"})).toBeDisabled();
        fireEvent.click(screen.getByRole("button", {name: "Previous"}));
        await waitFor(() => expect(statsDates).toContain("2026-10-05T00:00:00-04:00"));
        fireEvent.click(await screen.findByRole("button", {name: "Next"}));
        await waitFor(() => expect(screen.getByRole("button", {name: "Next"})).toBeDisabled());
    });
});

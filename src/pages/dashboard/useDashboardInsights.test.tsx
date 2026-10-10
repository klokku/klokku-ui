import {PropsWithChildren, useEffect} from "react";
import {fireEvent, renderHook, screen, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {afterEach, describe, expect, it, vi} from "vitest";
import {CurrentProfileProvider, useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import useDashboardInsights from "@/pages/dashboard/useDashboardInsights.ts";
import {getDashboardPeriod} from "@/lib/dashboardDates.ts";

function ProfileControls() {
    const {setCurrentProfileUid} = useCurrentProfile();
    useEffect(() => setCurrentProfileUid("profile-a"), [setCurrentProfileUid]);
    return <button onClick={() => setCurrentProfileUid("profile-b")}>Switch profile</button>;
}

function setupApi() {
    const period = getDashboardPeriod(new Date(), "UTC", "monday");
    const fetchMock = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
        const url = new URL(String(input), "http://localhost");
        const profile = new Headers(options?.headers).get("X-User-Id");
        const name = profile === "profile-a" ? "Budget A" : "Budget B";
        const actual = profile === "profile-a" ? 3600 : 7200;
        const item = {budgetItemId: 1, name, weeklyDuration: 3600, weeklyOccurrences: 1, icon: "", color: "#123456", position: 0, notes: ""};
        if (url.pathname === "/api/user/current") {
            return Response.json({uid: profile, settings: {timezone: "UTC", weekStartDay: "monday"}});
        }
        if (url.pathname === "/api/weeklyplan") {
            return Response.json({budgetPlanId: 7, isOffWeek: false, items: [item]});
        }
        if (url.pathname === "/api/stats/weekly") {
            return Response.json({perDay: [], perPlanItem: [{planItem: {...item, weeklyItemDuration: 3600}, duration: actual, remaining: 3600 - actual}]});
        }
        if (url.pathname === "/api/budgetplan/7/report") {
            return Response.json({weeks: period.historyWeekKeys.slice(-4).map(date => ({
                startDate: `${date}T00:00:00Z`, endDate: `${date}T23:59:59Z`,
                items: [{budgetItemId: 1, name, weeklyPlanTime: 3600, actualTime: actual}],
            })), excludedWeekCount: 0});
        }
        throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

function createWrapper() {
    const client = new QueryClient({defaultOptions: {queries: {retry: false, gcTime: 0}}});
    return function Wrapper({children}: PropsWithChildren) {
        return <QueryClientProvider client={client}><CurrentProfileProvider><ProfileControls/>{children}</CurrentProfileProvider></QueryClientProvider>;
    };
}

afterEach(() => vi.unstubAllGlobals());

describe("dashboard insight queries", () => {
    it("uses one historical request for trends and realism, without fetching before a profile is available", async () => {
        const fetchMock = setupApi();
        const {result} = renderHook(() => useDashboardInsights(), {wrapper: createWrapper()});
        await waitFor(() => expect(result.current.historyState.isLoading).toBe(false));
        expect(result.current.historyWeeks).toHaveLength(4);
        expect(result.current.realism[0]).toMatchObject({actual: 3600, count: 4, enoughHistory: true});
        const reportCalls = fetchMock.mock.calls.filter(([input]) => String(input).includes("/report?"));
        expect(reportCalls).toHaveLength(1);
        expect(fetchMock.mock.calls.every(([, options]) => new Headers(options?.headers).has("X-User-Id"))).toBe(true);
    });

    it("does not reuse another profile's plan or statistics when their IDs and date ranges match", async () => {
        setupApi();
        const {result} = renderHook(() => useDashboardInsights(), {wrapper: createWrapper()});
        await waitFor(() => expect(result.current.realism[0]?.name).toBe("Budget A"));
        fireEvent.click(screen.getByRole("button", {name: "Switch profile"}));
        expect(result.current.balances).toEqual([]);
        expect(result.current.historyWeeks).toEqual([]);
        await waitFor(() => expect(result.current.realism[0]?.name).toBe("Budget B"));
        expect(result.current.realism[0].actual).toBe(7200);
        expect(result.current.balances[0]).toMatchObject({name: "Budget B", actual: 7200});
    });
});

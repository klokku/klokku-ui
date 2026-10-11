import {useEffect} from "react";
import {fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {MemoryRouter} from "react-router";
import {afterEach, beforeEach, expect, it, vi} from "vitest";
import {CurrentProfileProvider, useCurrentProfile} from "@/hooks/currentProfileContext";
import {DashboardConfiguration} from "@/components/dashboard/dashboardConfiguration";
import {DashboardPage} from "./DashboardPage";

function Dashboard() {
    const {setCurrentProfileUid} = useCurrentProfile();
    useEffect(() => setCurrentProfileUid("dashboard-profile"), [setCurrentProfileUid]);
    return <DashboardPage/>;
}

function renderDashboard() {
    const client = new QueryClient({defaultOptions: {queries: {retry: false, gcTime: 0}}});
    return render(<QueryClientProvider client={client}><CurrentProfileProvider><MemoryRouter><Dashboard/></MemoryRouter></CurrentProfileProvider></QueryClientProvider>);
}

beforeEach(() => vi.stubGlobal("localStorage", {getItem: () => null, setItem: () => {}, removeItem: () => {}}));
afterEach(() => vi.unstubAllGlobals());

it("renders saved card order, allows tracking-only, and restores that choice after a reload", async () => {
    let configuration: DashboardConfiguration = {cards: [
        {id: "time-today", visible: true}, {id: "budget-balance", visible: true},
        ...["weekly-completion", "plan-realism", "weekly-allocation", "weekly-rhythm", "recent-trends"].map(id => ({id, visible: false})),
    ]};
    vi.stubGlobal("fetch", vi.fn(async (input: string, options?: RequestInit) => {
        const url = new URL(input, "http://localhost");
        if (url.pathname === "/api/user/current/dashboard") {
            if (options?.method === "PUT") configuration = JSON.parse(String(options.body));
            return Response.json(configuration);
        }
        if (url.pathname === "/api/user/current") return Response.json({uid: "dashboard-profile", settings: {timezone: "UTC", weekStartDay: "monday"}});
        if (url.pathname === "/api/weeklyplan") return Response.json({budgetPlanId: 7, items: [{budgetItemId: 1, name: "Work", weeklyDuration: 3600, position: 0}]});
        if (url.pathname === "/api/event/current") return new Response(null, {status: 404});
        if (url.pathname === "/api/calendar/event/recent") return Response.json([]);
        if (url.pathname === "/api/stats/weekly") return Response.json({perDay: [], perPlanItem: []});
        return new Response(null, {status: 404});
    }));
    const view = renderDashboard();
    await screen.findByRole("region", {name: "Time today"});
    expect(screen.getAllByRole("region").map(region => region.getAttribute("aria-labelledby"))).toEqual(
        ["Tracking now", "Time today", "Budget balance"].map(title => screen.getByRole("heading", {name: title}).id),
    );
    fireEvent.click(screen.getByRole("button", {name: "Customize dashboard"}));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("switch", {name: "Show Time today"}));
    fireEvent.click(within(dialog).getByRole("switch", {name: "Show Budget balance"}));
    fireEvent.click(within(dialog).getByRole("button", {name: "Save"}));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getAllByRole("region")).toHaveLength(1);
    expect(screen.getByRole("region", {name: "Tracking now"})).toHaveTextContent("No activity running");
    view.unmount();
    renderDashboard();
    await screen.findByRole("button", {name: "Customize dashboard"});
    expect(screen.getAllByRole("region")).toHaveLength(1);
});

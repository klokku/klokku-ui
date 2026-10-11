import {PropsWithChildren, useEffect} from "react";
import {act, fireEvent, render, renderHook, screen, waitFor} from "@testing-library/react";
import {onlineManager, QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {afterEach, expect, it, vi} from "vitest";
import {CurrentProfileProvider, useCurrentProfile} from "@/hooks/currentProfileContext";
import useDashboardConfiguration from "./useDashboardConfiguration";
import {DashboardCustomization} from "@/components/dashboard/DashboardCustomization";

function ProfileControls() {
    const {setCurrentProfileUid} = useCurrentProfile();
    useEffect(() => setCurrentProfileUid("profile-a"), [setCurrentProfileUid]);
    return <><button onClick={() => setCurrentProfileUid("profile-b")}>Switch profile</button><button onClick={() => setCurrentProfileUid("profile-a")}>Return to profile</button></>;
}

function wrapper({children}: PropsWithChildren) {
    const client = new QueryClient({defaultOptions: {queries: {retry: false, gcTime: 0}}});
    return <QueryClientProvider client={client}><CurrentProfileProvider><ProfileControls/>{children}</CurrentProfileProvider></QueryClientProvider>;
}

afterEach(() => { onlineManager.setOnline(true); vi.unstubAllGlobals(); });

it("serializes overlapping saves even after switching away from and back to the same profile", async () => {
    const responses: ((response: Response) => void)[] = [];
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => {
        if (options?.method === "PUT") return new Promise<Response>(resolve => { responses.push(resolve); });
        return Response.json(null);
    });
    vi.stubGlobal("fetch", fetchMock);
    const {result} = renderHook(() => useDashboardConfiguration(), {wrapper});
    await waitFor(() => expect(result.current.isReady).toBe(true));
    const first = {cards: [{id: "time-today", visible: false}]};
    const second = {cards: [{id: "time-today", visible: true}]};
    let firstSave!: Promise<unknown>;
    let secondSave!: Promise<unknown>;
    act(() => { firstSave = result.current.saveConfiguration(first); });
    await waitFor(() => expect(responses).toHaveLength(1));
    fireEvent.click(screen.getByRole("button", {name: "Switch profile"}));
    await waitFor(() => expect(result.current.profileUid).toBe("profile-b"));
    fireEvent.click(screen.getByRole("button", {name: "Return to profile"}));
    await waitFor(() => expect(result.current.profileUid).toBe("profile-a"));
    act(() => { secondSave = result.current.saveConfiguration(second); });
    expect(responses).toHaveLength(1);
    await act(async () => { responses[0](Response.json(first)); await firstSave; });
    await waitFor(() => expect(responses).toHaveLength(2));
    await act(async () => { responses[1](Response.json(second)); await secondSave; });
    await waitFor(() => expect(result.current.configuration).toEqual(second));
});

function Settings() {
    const configuration = useDashboardConfiguration();
    return configuration.configuration !== undefined
        ? <DashboardCustomization key={configuration.profileUid} configuration={configuration.configuration} onSave={configuration.saveConfiguration}/>
        : null;
}

it("retains an offline draft with Retry and Cancel instead of pausing the save indefinitely", async () => {
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => {
        if (options?.method === "PUT") throw new TypeError("Network offline");
        return Response.json(null);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<Settings/>, {wrapper});
    fireEvent.click(await screen.findByRole("button", {name: "Customize dashboard"}));
    fireEvent.click(screen.getByRole("switch", {name: "Show Time today"}));
    act(() => onlineManager.setOnline(false));
    fireEvent.click(screen.getByRole("button", {name: "Save"}));
    expect(await screen.findByRole("alert")).toHaveTextContent("Network offline");
    expect(screen.getByRole("switch", {name: "Show Time today"})).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("button", {name: "Retry save"})).toBeEnabled();
    expect(screen.getByRole("button", {name: "Cancel"})).toBeEnabled();
});

it("keeps a save started on one profile from updating another profile's dashboard", async () => {
    let finishSave!: (response: Response) => void;
    const saved = {cards: [{id: "time-today", visible: false}]};
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => {
        if (options?.method === "PUT") return new Promise<Response>(resolve => { finishSave = resolve; });
        return Response.json(null);
    });
    vi.stubGlobal("fetch", fetchMock);
    const {result} = renderHook(() => useDashboardConfiguration(), {wrapper});
    await waitFor(() => expect(result.current.isReady).toBe(true));
    let saving!: Promise<unknown>;
    act(() => { saving = result.current.saveConfiguration(saved); });
    await waitFor(() => expect(finishSave).toBeDefined());
    fireEvent.click(screen.getByRole("button", {name: "Switch profile"}));
    await waitFor(() => expect(result.current.isReady).toBe(true));
    await act(async () => { finishSave(Response.json(saved)); await saving; });
    expect(result.current.configuration).toBeNull();
    expect(result.current.cards.find(card => card.id === "time-today")?.visible).toBe(true);
    const write = fetchMock.mock.calls.find(([, options]) => options?.method === "PUT");
    expect(new Headers(write?.[1]?.headers).get("X-User-Id")).toBe("profile-a");
});

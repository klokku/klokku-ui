import {act, cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";
import {OfflineBoundary} from "./OfflineBoundary";
import {fetchWithProfileUid} from "@/api/fetchWithProfileUid";

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

it("blocks offline actions, preserves an unfinished edit, and retries without reloading", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    render(<OfflineBoundary><input aria-label="Event notes" defaultValue=""/></OfflineBoundary>);
    fireEvent.change(screen.getByRole("textbox", {name: "Event notes"}), {target: {value: "Unfinished note"}});
    act(() => { window.dispatchEvent(new Event("offline")); });
    expect(screen.getByRole("dialog", {name: "You're offline"})).toBeInTheDocument();
    expect(screen.queryByRole("textbox", {name: "Event notes"})).not.toBeInTheDocument();
    const fetch = vi.fn().mockRejectedValueOnce(new TypeError("Failed to fetch")).mockResolvedValueOnce(new Response(null, {status: 200}));
    vi.stubGlobal("fetch", fetch);
    fireEvent.click(screen.getByRole("button", {name: "Retry connection"}));
    await screen.findByRole("status");
    expect(screen.getByRole("dialog", {name: "You're offline"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "Retry connection"}));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("textbox", {name: "Event notes"})).toHaveValue("Unfinished note");
});

it("keeps an unfinished edit when the session expires during an outage", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    render(<OfflineBoundary><input aria-label="Event notes" defaultValue="Keep this draft"/></OfflineBoundary>);
    act(() => { window.dispatchEvent(new Event("offline")); });
    let authenticated = false;
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
        if (url === "/") return new Response(null, {status: 200});
        return authenticated ? Response.json({uid: "same-profile"}) : new Response(null, {status: 401});
    }));
    await act(async () => {
        await expect(fetchWithProfileUid("/api/user/current", "same-profile")).rejects.toThrow("Unauthorized");
    });
    expect(screen.getByRole("dialog", {name: "Sign in to continue"})).toBeInTheDocument();
    expect(screen.getByTitle("Sign in to Klokku")).toHaveAttribute("src", "/start");
    fireEvent.click(screen.getByRole("button", {name: "Continue after signing in"}));
    await screen.findByRole("status");
    expect(screen.getByRole("dialog", {name: "Sign in to continue"})).toBeInTheDocument();
    authenticated = true;
    fireEvent.click(screen.getByRole("button", {name: "Continue after signing in"}));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("textbox", {name: "Event notes"})).toHaveValue("Keep this draft");
});

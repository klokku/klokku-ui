import {act, cleanup, fireEvent, render, screen} from "@testing-library/react";
import {useEffect, useState} from "react";
import {afterEach, expect, it, vi} from "vitest";
import {UpdateNotice} from "./UpdateNotice";

const {reload, worker, callbacks} = vi.hoisted(() => ({reload: vi.fn().mockResolvedValue(undefined), worker: {waiting: {} as ServiceWorker | null}, callbacks: {activated: () => {}}}));
vi.mock("virtual:pwa-register/react", () => ({
    useRegisterSW: (options: {onRegisteredSW: (url: string, worker: unknown) => void; onNeedReload: () => void}) => {
        useEffect(() => {
            options.onRegisteredSW("/sw.js", worker);
            callbacks.activated = options.onNeedReload;
        }, [options]);
        return {needRefresh: useState(true), updateServiceWorker: reload};
    },
}));
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
    worker.waiting = {} as ServiceWorker;
});

it("lets the user defer an update without activating it or losing their edit", () => {
    render(<><input aria-label="Notes" defaultValue="Unsaved edit"/><UpdateNotice/></>);
    expect(screen.getByRole("status")).toHaveTextContent("A new version of Klokku is ready");
    expect(reload).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", {name: "Later"}));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", {name: "Notes"})).toHaveValue("Unsaved edit");
    expect(reload).not.toHaveBeenCalled();
});

it("activates the update only after the user chooses Reload", () => {
    render(<UpdateNotice/>);
    expect(reload).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", {name: "Reload"}));
    expect(reload).toHaveBeenCalledWith(true);
});

it("recovers if the waiting update does not activate", async () => {
    vi.useFakeTimers();
    render(<UpdateNotice/>);
    fireEvent.click(screen.getByRole("button", {name: "Reload"}));
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(screen.getByRole("status")).toHaveTextContent("could not finish");
    expect(screen.getByRole("button", {name: "Reload"})).toBeEnabled();
    expect(screen.getByRole("button", {name: "Later"})).toBeEnabled();
});

it("dismisses a stale notice if another window already applied the update", () => {
    worker.waiting = null;
    render(<UpdateNotice/>);
    fireEvent.click(screen.getByRole("button", {name: "Reload"}));
    expect(reload).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("preserves edits when activation arrives after the timeout and Later", async () => {
    vi.useFakeTimers();
    render(<><input aria-label="Notes" defaultValue=""/><UpdateNotice/></>);
    fireEvent.click(screen.getByRole("button", {name: "Reload"}));
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    fireEvent.click(screen.getByRole("button", {name: "Later"}));
    fireEvent.change(screen.getByRole("textbox", {name: "Notes"}), {target: {value: "New edit after Later"}});
    worker.waiting = null;
    act(() => { callbacks.activated(); });
    expect(screen.getByRole("textbox", {name: "Notes"})).toHaveValue("New edit after Later");
    expect(screen.getByRole("button", {name: "Reload"})).toBeEnabled();
});

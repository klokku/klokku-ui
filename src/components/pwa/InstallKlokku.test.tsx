import {act, cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, expect, it, vi} from "vitest";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {PwaProvider} from "./PwaProvider";
import {InstallMenuItem} from "./InstallMenuItem";

beforeEach(() => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn()})));
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36");
});
afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

function renderMenu() {
    return render(
        <PwaProvider>
            <DropdownMenu open>
                <DropdownMenuTrigger>User menu</DropdownMenuTrigger>
                <DropdownMenuContent><InstallMenuItem/></DropdownMenuContent>
            </DropdownMenu>
        </PwaProvider>,
    );
}

it("uses the browser install prompt once and offers manual instructions after dismissal", async () => {
    renderMenu();
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = Object.assign(new Event("beforeinstallprompt", {cancelable: true}), {
        prompt,
        userChoice: Promise.resolve({outcome: "dismissed"}),
    });
    act(() => { window.dispatchEvent(event); });
    expect(event.defaultPrevented).toBe(true);
    fireEvent.click(screen.getByRole("menuitem", {name: "Install Klokku"}));
    await waitFor(() => expect(prompt).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole("menuitem", {name: "Install Klokku"}));
    expect(await screen.findByRole("dialog", {name: "Install Klokku"})).toHaveTextContent("Chrome");
    expect(prompt).toHaveBeenCalledOnce();
});

it("keeps iOS instructions visible after the user menu closes", async () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("iPhone");
    render(
        <PwaProvider>
            <DropdownMenu>
                <DropdownMenuTrigger>User menu</DropdownMenuTrigger>
                <DropdownMenuContent><InstallMenuItem/></DropdownMenuContent>
            </DropdownMenu>
        </PwaProvider>,
    );
    fireEvent.pointerDown(screen.getByRole("button", {name: "User menu"}), {button: 0, ctrlKey: false, pointerType: "mouse"});
    fireEvent.click(await screen.findByRole("menuitem", {name: "Install Klokku"}));
    const dialog = await screen.findByRole("dialog", {name: "Install Klokku"});
    expect(dialog).toHaveTextContent("Safari");
    expect(dialog).toHaveTextContent("Open as Web App");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByRole("link", {name: /Full Android and iOS/})).toHaveAttribute("href", "https://klokku.com/docs/getting-started/mobile-app/");
});

it("hides installation after appinstalled and in standalone mode", () => {
    const view = renderMenu();
    act(() => { window.dispatchEvent(new Event("appinstalled")); });
    expect(screen.queryByRole("menuitem", {name: "Install Klokku"})).not.toBeInTheDocument();
    view.unmount();
    vi.stubGlobal("matchMedia", vi.fn(() => ({matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn()})));
    renderMenu();
    expect(screen.queryByRole("menuitem", {name: "Install Klokku"})).not.toBeInTheDocument();
});

it.each([
    ["Windows", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36"],
    ["Linux", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36"],
    ["macOS", "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 Version/17.6 Safari/605.1.15"],
    ["Android tablet", "Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36"],
    ["iPad", "Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"],
    ["iPad in desktop mode", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/17.6 Safari/605.1.15"],
])("hides the install menu on %s even with a narrow screen and native install support", (_device, userAgent) => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);
    vi.stubGlobal("innerWidth", 390);
    renderMenu();
    act(() => {
        window.dispatchEvent(Object.assign(new Event("beforeinstallprompt", {cancelable: true}), {
            prompt: vi.fn().mockResolvedValue(undefined),
            userChoice: Promise.resolve({outcome: "accepted"}),
        }));
    });
    expect(screen.queryByRole("menuitem", {name: "Install Klokku"})).not.toBeInTheDocument();
});

import {PropsWithChildren, useEffect, useRef, useState} from "react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {InstallPromptEvent, PwaContext} from "./pwaContext";

const GUIDE_URL = "https://klokku.com/docs/getting-started/mobile-app/";

function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & {standalone?: boolean}).standalone === true;
}

export function PwaProvider({children}: PropsWithChildren) {
    const [installed, setInstalled] = useState(isStandalone);
    const [instructionsOpen, setInstructionsOpen] = useState(false);
    const promptEvent = useRef<InstallPromptEvent | null>(null);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    useEffect(() => {
        const displayMode = window.matchMedia("(display-mode: standalone)");
        const capturePrompt = (event: Event) => {
            event.preventDefault();
            promptEvent.current = event as InstallPromptEvent;
        };
        const installedApp = () => {
            promptEvent.current = null;
            setInstalled(true);
            setInstructionsOpen(false);
        };
        const modeChanged = () => setInstalled(isStandalone());
        window.addEventListener("beforeinstallprompt", capturePrompt);
        window.addEventListener("appinstalled", installedApp);
        displayMode.addEventListener("change", modeChanged);
        return () => {
            window.removeEventListener("beforeinstallprompt", capturePrompt);
            window.removeEventListener("appinstalled", installedApp);
            displayMode.removeEventListener("change", modeChanged);
        };
    }, []);

    const install = async () => {
        const event = promptEvent.current;
        if (!event) {
            setInstructionsOpen(true);
            return;
        }
        // A browser prompt can only be used once and must start during the user's click.
        promptEvent.current = null;
        try {
            await event.prompt();
            await event.userChoice;
        } catch {
            setInstructionsOpen(true);
        }
    };

    return (
        <PwaContext.Provider value={{installed, install}}>
            {children}
            <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Install Klokku</DialogTitle>
                        <DialogDescription>Add Klokku to your home screen for quick access.</DialogDescription>
                    </DialogHeader>
                    {isIOS ? (
                        <ol className="list-decimal space-y-2 pl-5 text-sm">
                            <li>Open this Klokku address in Safari.</li>
                            <li>Tap Share (you may need to open the More menu first).</li>
                            <li>Choose <strong>Add to Home Screen</strong>.</li>
                            <li>Keep <strong>Open as Web App</strong> enabled if shown, then tap <strong>Add</strong>.</li>
                        </ol>
                    ) : (
                        <div className="space-y-2 text-sm">
                            <p>On Android, open Klokku in Chrome and use the browser menu to choose <strong>Install app</strong> or <strong>Add to Home screen</strong>, then confirm installation.</p>
                            <p>Some versions group this under <strong>Install and create shortcut</strong>.</p>
                            <p>If you opened Klokku inside another app, open it in your browser first. Installation options depend on your browser and whether Klokku is already installed.</p>
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">Klokku needs an internet connection. You may need to sign in again when you first open the installed app.</p>
                    <a href={GUIDE_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline underline-offset-4">
                        Full Android and iOS installation guide (opens in a new tab)
                    </a>
                </DialogContent>
            </Dialog>
        </PwaContext.Provider>
    );
}

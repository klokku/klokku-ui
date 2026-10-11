import {createContext, useContext} from "react";

export interface InstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{outcome: "accepted" | "dismissed"}>;
}

export const PwaContext = createContext<{installed: boolean; install: () => void} | null>(null);

export function usePwa() {
    const context = useContext(PwaContext);
    if (!context) throw new Error("PWA controls require PwaProvider");
    return context;
}

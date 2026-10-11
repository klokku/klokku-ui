import {useEffect, useRef, useState} from "react";
import {useRegisterSW} from "virtual:pwa-register/react";
import {Button} from "@/components/ui/button";

export function UpdateNotice() {
    const registration = useRef<ServiceWorkerRegistration | undefined>(undefined);
    const activationTimeout = useRef<number | undefined>(undefined);
    const reloadRequested = useRef(false);
    const [activated, setActivated] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const {needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker} = useRegisterSW({
        onRegisteredSW(_url, worker) { registration.current = worker; },
        onRegisterError(error) { console.error("Klokku service worker registration failed", error); },
        onNeedReload() {
            window.clearTimeout(activationTimeout.current);
            setActivated(true);
            setUpdating(false);
            setError("");
            if (reloadRequested.current) window.location.reload();
        },
    });

    useEffect(() => {
        const check = () => {
            const worker = registration.current;
            if (navigator.onLine && document.visibilityState === "visible" && worker && !worker.installing) {
                void worker.update().catch(() => { /* Try again on the next connection or check. */ });
            }
        };
        const interval = window.setInterval(check, 60 * 60 * 1000);
        window.addEventListener("online", check);
        document.addEventListener("visibilitychange", check);
        return () => {
            window.clearInterval(interval);
            window.clearTimeout(activationTimeout.current);
            window.removeEventListener("online", check);
            document.removeEventListener("visibilitychange", check);
        };
    }, []);

    const reload = async () => {
        if (activated) {
            window.location.reload();
            return;
        }
        if (!registration.current?.waiting) {
            setNeedRefresh(false);
            return;
        }
        setUpdating(true);
        setError("");
        reloadRequested.current = true;
        // Sending SKIP_WAITING does not acknowledge activation. Allow retry if it stalls.
        activationTimeout.current = window.setTimeout(() => {
            reloadRequested.current = false;
            setUpdating(false);
            setError("The update could not finish yet. Choose Later or retry; delayed activation will not reload your edits.");
        }, 10_000);
        try {
            await updateServiceWorker(true);
        } catch {
            window.clearTimeout(activationTimeout.current);
            reloadRequested.current = false;
            setUpdating(false);
            setError("Could not update. Please try again when connected.");
        }
    };

    if (!needRefresh && !activated) return null;
    return (
        <div role="status" className="fixed bottom-4 left-4 right-4 z-40 mx-auto flex max-w-lg flex-col gap-3 rounded-lg border bg-background p-4 shadow-lg">
            <div className="space-y-1 text-sm">
                <p className="font-medium">A new version of Klokku is ready.</p>
                <p>Save your changes before reloading. Other open Klokku windows will wait for you to reload them too.</p>
                {error && <p className="text-destructive">{error}</p>}
            </div>
            <div className="flex gap-2">
                <Button onClick={reload} disabled={updating}>{updating ? "Updating..." : "Reload"}</Button>
                <Button variant="outline" disabled={updating} onClick={() => {
                    reloadRequested.current = false;
                    setActivated(false);
                    setNeedRefresh(false);
                }}>Later</Button>
            </div>
        </div>
    );
}

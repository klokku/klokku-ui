import {PropsWithChildren, useCallback, useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {ConnectionBlockedContext} from "./connectionContext";
import {SESSION_EXPIRED_EVENT, SessionExpiredEvent} from "@/lib/sessionExpired";
import {probeConnection} from "@/lib/probeConnection";

export function OfflineBoundary({children, onReconnected}: PropsWithChildren<{onReconnected?: () => void}>) {
    const [online, setOnline] = useState(() => navigator.onLine);
    const [hasConnected, setHasConnected] = useState(() => navigator.onLine);
    const [checking, setChecking] = useState(false);
    const [message, setMessage] = useState("");
    const [requiresSignIn, setRequiresSignIn] = useState(false);
    const request = useRef<AbortController | null>(null);
    const sessionProfileUid = useRef<string | null>(null);
    const hasBeenOffline = useRef(!navigator.onLine);

    const retry = useCallback(async () => {
        if (request.current) return;
        const controller = new AbortController();
        request.current = controller;
        let sessionTimeout: number | undefined;
        setChecking(true);
        setMessage("");
        try {
            if (!await probeConnection(controller.signal)) throw new Error("Server unavailable");
            if (sessionProfileUid.current) {
                sessionTimeout = window.setTimeout(() => controller.abort(), 5000);
                const session = await fetch("/api/user/current", {cache: "no-store", signal: controller.signal});
                if (!session.ok || (await session.json()).uid !== sessionProfileUid.current) {
                    setMessage("Sign in with the same account, then choose Continue after signing in.");
                    return;
                }
                sessionProfileUid.current = null;
                setRequiresSignIn(false);
            }
            setHasConnected(true);
            setOnline(true);
            onReconnected?.();
        } catch {
            setMessage("Still unable to connect. Check your connection and try again.");
        } finally {
            window.clearTimeout(sessionTimeout);
            request.current = null;
            setChecking(false);
        }
    }, [onReconnected]);

    useEffect(() => {
        const offline = () => {
            hasBeenOffline.current = true;
            request.current?.abort();
            setOnline(false);
        };
        const sessionExpired = (event: Event) => {
            if (!hasBeenOffline.current) return;
            event.preventDefault();
            request.current?.abort();
            sessionProfileUid.current = (event as SessionExpiredEvent).detail.profileUid;
            setRequiresSignIn(true);
            setOnline(false);
            setMessage("");
        };
        const online = () => { void retry(); };
        window.addEventListener("offline", offline);
        window.addEventListener("online", online);
        window.addEventListener(SESSION_EXPIRED_EVENT, sessionExpired);
        return () => {
            window.removeEventListener("offline", offline);
            window.removeEventListener("online", online);
            window.removeEventListener(SESSION_EXPIRED_EVENT, sessionExpired);
            request.current?.abort();
        };
    }, [retry]);

    return (
        <ConnectionBlockedContext.Provider value={!online || requiresSignIn}>
            {/* Keep mounted editors intact, but do not start authentication while offline. */}
            {hasConnected && <div hidden={!online} inert={!online}>{children}</div>}
            <Dialog open={!online}>
                <DialogContent showCloseButton={false} onEscapeKeyDown={event => event.preventDefault()} onPointerDownOutside={event => event.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>{requiresSignIn ? "Sign in to continue" : "You're offline"}</DialogTitle>
                        <DialogDescription>{requiresSignIn ? "Your session expired while disconnected. Sign in below with the same account to continue without losing your unfinished edits." : "Klokku needs an internet connection to load your data and save changes. Reconnect to continue."}</DialogDescription>
                    </DialogHeader>
                    {requiresSignIn && <iframe src="/start" title="Sign in to Klokku" className="h-[min(24rem,50svh)] w-full rounded-md border" allow="publickey-credentials-get; publickey-credentials-create"/>}
                    <Button onClick={retry} disabled={checking}>{checking ? "Checking connection..." : requiresSignIn ? "Continue after signing in" : "Retry connection"}</Button>
                    {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
                </DialogContent>
            </Dialog>
        </ConnectionBlockedContext.Provider>
    );
}

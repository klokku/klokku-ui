import {useEffect, useState} from "react";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";

export function ElapsedActivityTime({startTime}: {startTime: string}) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const update = () => { if (!document.hidden) setNow(Date.now()); };
        const timer = window.setInterval(update, 1000);
        document.addEventListener("visibilitychange", update);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", update);
        };
    }, []);
    return <span role="timer" aria-label="Elapsed activity time" className="text-2xl font-semibold tabular-nums">
        {formatSecondsToDuration(Math.max(0, (now - new Date(startTime).getTime()) / 1000))}
    </span>;
}

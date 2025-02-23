import {Event} from "@/api/types.ts";
import {ClockIcon} from "lucide-react";
import {formatEventDuration} from "@/lib/dateUtils.ts";
import {isToday} from "date-fns";
import {Badge} from "@/components/ui/badge.tsx";
import {userSettings} from "@/components/settings.ts";

interface PreviousEventProps {
    event: Event;
    onClick: () => void;
    className?: string;
}

export function PreviousEvent({event, onClick, className}: PreviousEventProps) {

    const localeTime = (date: string) => new Date(date).toLocaleTimeString(userSettings.locale, {timeStyle: "short"})
    const localeDate = (date: string) => new Date(date).toLocaleDateString(userSettings.locale, {weekday: "short", month: "short", day: "numeric"})

    return (
        <div className={className + " hover:bg-gray-100 p-2 rounded-md cursor-pointer"} onClick={onClick}>
            <div className="font-semibold text-sm flex gap-2 items-center">
                <div>{event.budget.name}</div>
                <div><Badge variant="outline" className="opacity-80">{formatEventDuration(event)}</Badge></div>
            </div>
            <div className="text-xs flex gap-2 items-center mt-1 opacity-50 font-semibold">
                <ClockIcon className="size-3"/>
                <div className="flex flex-row gap-3">
                    {!isToday(event.startTime) && (
                        <div>
                            <span>{localeDate(event.startTime)}</span>
                        </div>
                    )}
                    <div>
                        {localeTime(event.startTime)} - {localeTime(event.endTime!!)}
                    </div>
                </div>
            </div>
        </div>
    )
}

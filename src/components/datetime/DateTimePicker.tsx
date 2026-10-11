import {useState} from "react";
import {ChevronDownIcon} from "lucide-react";
import {getWallTime, resolveWallTime, WallTime} from "@/lib/zonedDateTime.ts";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {TimePicker} from "@/components/datetime/TimePicker.tsx";

type Props = {
    value: Date;
    onChange: (date: Date) => void;
    timezone?: string;
    label?: string;
};

export function DateTimePicker({value, onChange, timezone, label = "Event"}: Props) {
    const [open, setOpen] = useState(false);
    const editingTimezone = timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    const [invalidAttempt, setInvalidAttempt] = useState<{origin: number; timezone: string; requested: WallTime}>();
    const attempt = invalidAttempt?.origin === value.getTime() && invalidAttempt.timezone === editingTimezone ? invalidAttempt.requested : undefined;
    const invalidTime = !!attempt;
    const displayed = attempt ?? getWallTime(value, editingTimezone);
    const changeDisplayed = (requested: WallTime) => {
        const next = resolveWallTime(requested, value, editingTimezone);
        if (!next) { setInvalidAttempt({origin: value.getTime(), timezone: editingTimezone, requested}); return; }
        setInvalidAttempt(undefined);
        onChange(next);
    };
    const validationMessage = invalidTime ? "This time does not exist in this timezone. Choose a different time." : "";
    const calendarDate = resolveWallTime({...displayed, hours: 12, minutes: 0, seconds: 0, milliseconds: 0}, value, editingTimezone) ?? value;

    return (
        <div>
        <div className="flex flex-wrap gap-2 min-w-0">
            <div className="flex flex-col gap-3 flex-1 min-w-0">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between font-normal" aria-label={`Change ${label.toLowerCase()} date`}>
                            {calendarDate.toLocaleDateString(undefined, {timeZone: editingTimezone})}<ChevronDownIcon/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar mode="single" selected={calendarDate} timeZone={editingTimezone} onSelect={selected => {
                            if (!selected) return;
                            changeDisplayed({...displayed, year: selected.getFullYear(), month: selected.getMonth() + 1, day: selected.getDate()});
                            setOpen(false);
                        }}/>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex flex-col gap-3">
                <TimePicker hours={displayed.hours} minutes={displayed.minutes} label={`${label} time`} validationMessage={validationMessage} onChange={(hours, minutes) => {
                    changeDisplayed({...displayed, hours, minutes});
                }}/>
            </div>
        </div>
        {invalidTime && <p role="alert" className="mt-2 text-xs">{validationMessage}</p>}
        </div>
    );
}

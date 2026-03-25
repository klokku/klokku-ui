import {Button} from "@/components/ui/button.tsx";
import {CalendarIcon, ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {cn} from "@/lib/utils.ts";
import {useState} from "react";
import {weekEndDay, weekStartDay} from "@/lib/dateUtils.ts";
import useProfile from "@/api/useProfile.ts";
import {defaultSettings, userSettings} from "@/components/settings.ts";

interface PeriodSelectorProps {
    from: Date;
    to: Date;
    onFromChange: (date: Date) => void;
    onToChange: (date: Date) => void;
}

export function PeriodSelector({from, to, onFromChange, onToChange}: PeriodSelectorProps) {
    const [fromOpen, setFromOpen] = useState(false);
    const [toOpen, setToOpen] = useState(false);

    const {currentProfile} = useProfile();
    const weekFirstDay = currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay;

    const periodLengthMs = to.getTime() - from.getTime() + 24 * 60 * 60 * 1000; // +1 day since to is end of week

    function shiftPeriod(direction: number) {
        const newFrom = new Date(from.getTime() + direction * periodLengthMs);
        const newTo = new Date(to.getTime() + direction * periodLengthMs);
        onFromChange(weekStartDay(newFrom, weekFirstDay));
        onToChange(weekEndDay(weekStartDay(newTo, weekFirstDay)));
    }

    function onFromDayClick(day: Date) {
        onFromChange(weekStartDay(day, weekFirstDay));
        setFromOpen(false);
    }

    function onToDayClick(day: Date) {
        onToChange(weekEndDay(weekStartDay(day, weekFirstDay)));
        setToOpen(false);
    }

    function setPresetWeeks(weeks: number) {
        const now = new Date();
        const toDate = weekEndDay(weekStartDay(now, weekFirstDay));
        const fromDate = new Date(weekStartDay(now, weekFirstDay).getTime() - (weeks - 1) * 7 * 24 * 60 * 60 * 1000);
        onFromChange(fromDate);
        onToChange(toDate);
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => shiftPeriod(-1)}>
                    <ChevronLeftIcon className="size-4"/>
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => shiftPeriod(1)}>
                    <ChevronRightIcon className="size-4"/>
                </Button>

                <span className="text-muted-foreground">From</span>
                <DatePickerButton
                    date={from}
                    isOpen={fromOpen}
                    setIsOpen={setFromOpen}
                    onDayClick={onFromDayClick}
                    weekFirstDay={weekFirstDay}
                />
                <span className="text-muted-foreground">to</span>
                <DatePickerButton
                    date={to}
                    isOpen={toOpen}
                    setIsOpen={setToOpen}
                    onDayClick={onToDayClick}
                    weekFirstDay={weekFirstDay}
                />
            </div>
            <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPresetWeeks(4)}>4 weeks</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPresetWeeks(8)}>8 weeks</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPresetWeeks(12)}>12 weeks</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPresetWeeks(26)}>26 weeks</Button>
            </div>
        </div>
    );
}

function DatePickerButton({date, isOpen, setIsOpen, onDayClick, weekFirstDay}: {
    date: Date;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onDayClick: (day: Date) => void;
    weekFirstDay: "monday" | "sunday";
}) {
    return (
        <Popover open={isOpen} onOpenChange={(open: boolean) => isOpen && setIsOpen(open)}>
            <PopoverTrigger asChild onClick={() => setIsOpen(true)}>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn("h-8 justify-start text-left font-normal gap-1.5")}
                >
                    <CalendarIcon className="size-3.5"/>
                    {date.toLocaleDateString(userSettings.locale)}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    required={true}
                    selected={date}
                    onSelect={onDayClick}
                    weekStartsOn={weekFirstDay === "monday" ? 1 : 0}
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    );
}

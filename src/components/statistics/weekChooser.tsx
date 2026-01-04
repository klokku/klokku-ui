import {CalendarIcon} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Calendar} from "@/components/ui/calendar"
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover"
import {cn} from "@/lib/utils.ts";
import {useState} from "react";
import {defaultSettings, userSettings} from "@/components/settings.ts";
import {weekStartDay} from "@/lib/dateUtils.ts";
import useProfile from "@/api/useProfile.ts";

type Props = {
    currentWeekStart: Date;
    onPrevious: () => void;
    onNext: () => void;
    onDateChanged: (date: Date) => void;
    isPreviousEnabled: () => boolean;
};

export function WeekChooser({currentWeekStart, onPrevious, onNext, onDateChanged, isPreviousEnabled}: Props) {

    const [date, setDate] = useState<Date>(currentWeekStart)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const {currentProfile} = useProfile();
    const weekFirstDay = currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay

    function weekEndDay(weekStartDay: Date): string {
        return new Date(weekStartDay.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(userSettings.locale)
    }

    function onDayClick(day: Date) {
        setDate(day)
        onDateChanged(weekStartDay(day, weekFirstDay))
        setIsOpen(false)
    }

    return (
        <div className="gap-y-2 flex items-center text-sm">
            <Button variant="outline" className="w-24 rounded-r-none border-r" onClick={onPrevious} disabled={!isPreviousEnabled()}>Previous</Button>
            <Button variant="outline" className="w-24 rounded-l-none mr-3 border-l" onClick={onNext}>Next</Button>
            <span>Week from {currentWeekStart.toLocaleDateString(userSettings.locale)} to {weekEndDay(currentWeekStart)}</span>
            <span>
            <Popover open={isOpen} onOpenChange={(open: boolean) => isOpen && setIsOpen(open)}>
                <PopoverTrigger asChild className="ml-2 mr-2" onClick={() => setIsOpen(true)}>
                    <Button
                        type="button"
                        variant="outline"
                        className={cn(
                            "justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="h-4 w-4"/>

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
            </span>
        </div>
    )
}

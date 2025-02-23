import {CalendarIcon} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Calendar} from "@/components/ui/calendar"
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover"
import {cn} from "@/lib/utils.ts";
import {useState} from "react";
import {userSettings} from "@/components/settings.ts";

type Props = {
    currentWeekStart: Date;
    onPrevious: () => void;
    onNext: () => void;
};

export function WeekChooser({currentWeekStart, onPrevious, onNext}: Props) {

    const [date, setDate] = useState<Date>()

    function weekEndDay(weekStartDay: Date): String {
        return new Date(weekStartDay.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(userSettings.locale)
    }

    return (
        <div className="gap-y-2 flex items-center text-sm">
            <Button variant="outline" className="w-24 rounded-r-none border-r" onClick={onPrevious}>Previous</Button>
            <Button variant="outline" className="w-24 rounded-l-none mr-3 border-l" onClick={onNext}>Next</Button>
            <span>Week from {currentWeekStart.toLocaleDateString(userSettings.locale)}</span>
            <Popover>
                <PopoverTrigger asChild className="ml-2 mr-2">
                    <Button
                        variant={"outline"}
                        className={cn(
                            "justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="h-4 w-4" />

                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        weekStartsOn={1}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            <span>to {weekEndDay(currentWeekStart)}</span>
        </div>
    )
}

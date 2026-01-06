import {ChevronDownIcon} from "lucide-react"

import {Button} from "@/components/ui/button"
import {Calendar} from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {useState} from "react";
import {TimePicker} from "@/components/datetime/TimePicker.tsx";

type Props = {
    value: Date;
    onChange: (date: Date) => void;
}


export function DateTimePicker({value, onChange}: Props) {
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<Date>(value)

    function onChangeDate(date: Date) {
        setDate(date)
        onChange(date)
    }

    return (
        <div className="flex gap-2">
            <div className="flex flex-col gap-3 flex-1">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger>
                        <Button asChild
                                variant="outline"
                                id="date-picker"
                                className="w-full justify-between font-normal"
                        >
                            <span>
                            {date ? date.toLocaleDateString() : "Select date"}
                                <ChevronDownIcon/>
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => {
                                onChangeDate(date!)
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex flex-col gap-3">
                <TimePicker hours={date?.getHours() ?? 0} minutes={date?.getMinutes() ?? 0}
                            onChange={(hours, minutes) => {
                                if (!date) return;
                                const newDate = new Date(date)
                                newDate.setHours(hours)
                                newDate.setMinutes(minutes)
                                onChangeDate(newDate)
                            }}
                />
            </div>
        </div>
    )
}

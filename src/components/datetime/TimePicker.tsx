import {Input} from "@/components/ui/input.tsx";

type Props = {
    hours: number;
    minutes: number;
    onChange: (hours: number, minutes: number) => void;
}

export function TimePicker({ hours, minutes, onChange }: Props) {

    return (
        <Input
            type="time"
            id="time-picker"
            step="60"
            defaultValue={hours ? `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}` : ''}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            onChange={(e) => {
                const hours = parseInt(e.target.value.split(":")[0])
                const minutes = parseInt(e.target.value.split(":")[1])
                onChange(hours, minutes)
            }}
        />
    )
}

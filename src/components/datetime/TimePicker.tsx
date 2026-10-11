import {Input} from "@/components/ui/input.tsx";
import {useId} from "react";

type Props = {
    hours: number;
    minutes: number;
    onChange: (hours: number, minutes: number) => void;
    label?: string;
    validationMessage?: string;
}

export function TimePicker({ hours, minutes, onChange, label, validationMessage }: Props) {
    const id = useId();
    return (
        <Input
            type="time"
            id={id}
            aria-label={label ?? "Time"}
            ref={input => { input?.setCustomValidity(validationMessage ?? ""); }}
            required
            step="60"
            value={`${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            onChange={(e) => {
                if (!/^\d{2}:\d{2}$/.test(e.target.value)) return;
                const [hours, minutes] = e.target.value.split(":").map(Number)
                onChange(hours, minutes)
            }}
        />
    )
}

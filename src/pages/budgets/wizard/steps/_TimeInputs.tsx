import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {TimeAmount} from "../hooks/useBudgetWizard.ts";
import {ButtonGroup} from "@/components/ui/button-group.tsx";

interface Props {
    label: string;
    value: TimeAmount & { daysPerWeek?: number };
    onChange: (val: Partial<TimeAmount & { daysPerWeek?: number }>) => void;
    showDaysPerWeek?: boolean;
}

export function TimeInputs({label, value, onChange, showDaysPerWeek}: Props) {
    return (
        <div className="space-y-3">
            <div className="font-medium">{label}</div>
            <div className="grid grid-cols-3 gap-3 items-end">
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">Hours</label>
                    <Input type="number" min={0} max={24} value={value.hours}
                           onChange={e => onChange({hours: Number(e.target.value)})}/>
                </div>
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">Minutes</label>
                    <Input type="number" min={0} max={59} value={value.minutes}
                           onChange={e => onChange({minutes: Number(e.target.value)})}/>
                </div>
                <div className="flex gap-2">
                    <ButtonGroup>
                        <Button type="button" variant={value.frequency === 'daily' ? 'default' : 'outline'}
                                onClick={() => onChange({frequency: 'daily'})}>Daily</Button>
                        <Button type="button" variant={value.frequency === 'weekly' ? 'default' : 'outline'}
                                onClick={() => onChange({frequency: 'weekly'})}>Weekly</Button>
                    </ButtonGroup>
                </div>
            </div>

            {showDaysPerWeek && (
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">Days per week</label>
                    <Input type="number" min={0} max={7} value={value.daysPerWeek ?? 1}
                           onChange={e => onChange({daysPerWeek: Number(e.target.value)})}/>
                </div>
            )}
        </div>
    );
}

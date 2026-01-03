import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {TimeAmount} from "../hooks/useBudgetPlanWizard.ts";
import {ButtonGroup} from "@/components/ui/button-group.tsx";

interface Props {
    label: string;
    value: TimeAmount & { daysPerWeek?: number };
    onChange: (val: Partial<TimeAmount & { daysPerWeek?: number }>) => void;
    showDaysPerWeek?: boolean;
}

export function TimeInputs({label, value, onChange, showDaysPerWeek}: Props) {
    return (
        <div className="space-y-4">
            <div className="font-medium">{label}</div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
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
                </div>
                <div>
                    <label className="block text-sm text-muted-foreground mb-2">Frequency</label>
                    <ButtonGroup className="w-full">
                        <Button type="button" variant={value.frequency === 'daily' ? 'default' : 'outline'}
                                onClick={() => onChange({frequency: 'daily'})} className="flex-1 text-sm">Daily</Button>
                        <Button type="button" variant={value.frequency === 'weekly' ? 'default' : 'outline'}
                                onClick={() => onChange({frequency: 'weekly'})} className="flex-1 text-sm">Weekly</Button>
                    </ButtonGroup>
                </div>
            </div>

            {showDaysPerWeek && (
                <div className="max-w-32">
                    <label className="block text-sm text-muted-foreground mb-1">Days per week</label>
                    <Input type="number" min={0} max={7} value={value.daysPerWeek ?? 1}
                           onChange={e => onChange({daysPerWeek: Number(e.target.value)})}/>
                </div>
            )}
        </div>
    );
}

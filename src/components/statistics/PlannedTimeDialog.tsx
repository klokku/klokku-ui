import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Budget, BudgetOverride} from "@/api/types.ts";
import {Input} from "@/components/ui/input.tsx";
import {durationToSeconds, formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {userSettings} from "@/components/settings.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {useState} from "react";
import {formatDate} from "date-fns";
import {Trash2Icon} from "lucide-react";

interface PlannedTimeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (budgetOverride: BudgetOverride) => void;
    onDelete: (budgetOverrideId: number) => void;
    budget: Budget;
    budgetOverride?: BudgetOverride;
    currentWeekStartDate: Date;
}

export function PlannedTimeDialog({open, onOpenChange, onSave, onDelete, budget, budgetOverride, currentWeekStartDate}: PlannedTimeDialogProps) {

    const [overrideDuration, setOverrideDuration] = useState<number | undefined>(budgetOverride?.weeklyTime);
    const [overrideNotes, setOverrideNotes] = useState<string | undefined>(budgetOverride?.notes);

    function onSaveButton() {
        if (overrideDuration !== undefined) {
            const changedOverride: BudgetOverride = {
                id: budgetOverride?.id,
                budgetId: budget.id!,
                startDate: formatDate(currentWeekStartDate, "yyyy-MM-dd'T'HH:mm:ssXXX"),
                weeklyTime: overrideDuration,
                notes: overrideNotes,
            }
            onSave(changedOverride)
        }
        onOpenChange(false)
    }

    function onDeleteOverrideButton() {
        if (budgetOverride?.id) {
            onDelete(budgetOverride.id)
        }
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Budget Planned Time
                    </DialogTitle>
                    <DialogDescription>
                        {budget.name} (week starting {currentWeekStartDate.toLocaleDateString(userSettings.locale)})
                    </DialogDescription>
                </DialogHeader>
                <div className="text-sm space-y-2">
                    <div className="flex gap-2 items-center">
                        <div className="w-40">Planned time:</div>
                        <div className="w-full">{formatSecondsToDuration(budget.weeklyTime)}</div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="w-40">Weekly Override:</div>
                        <div className="w-full">
                            <Input type="text"
                                   onBlur={(event) => setOverrideDuration(durationToSeconds(event.target.value))}
                                   defaultValue={formatSecondsToDuration(overrideDuration)}
                                   placeholder="example: 13h 27m"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 items-start">
                        <div className="w-40">Notes:</div>
                        <div className="w-full">
                            <Textarea className="h-40"
                                      placeholder="Add note about override"
                                      onChange={(event) => setOverrideNotes(event.target.value)}
                                      value={overrideNotes || ""}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    { budgetOverride &&
                        <Button type="reset" variant="destructive" onClick={() => onDeleteOverrideButton()}><Trash2Icon />Delete override</Button>
                    }
                    <Button type="submit" onClick={() => onSaveButton()} disabled={overrideDuration === undefined}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

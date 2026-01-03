import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {BudgetPlanItem, WeeklyPlanItem} from "@/api/types.ts";
import {Input} from "@/components/ui/input.tsx";
import {parseDurationInput, formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {userSettings} from "@/components/settings.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {useState} from "react";
import {Trash2Icon} from "lucide-react";

interface PlannedTimeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (weeklyPlanItem: WeeklyPlanItem) => void;
    onDelete: (weeklyPlanItemId: number) => void;
    budgetPlanItem: BudgetPlanItem;
    weeklyPlanItem: WeeklyPlanItem;
    currentWeekStartDate: Date;
}

export function WeeklyItemDurationEditDialog({open, onOpenChange, onSave, onDelete, budgetPlanItem, weeklyPlanItem, currentWeekStartDate}: PlannedTimeDialogProps) {

    const hasOverride = weeklyPlanItem.weeklyDuration !== budgetPlanItem.weeklyDuration || weeklyPlanItem.notes !== "";
    const [overrideDuration, setOverrideDuration] = useState<number | undefined>(hasOverride ? weeklyPlanItem.weeklyDuration : undefined);
    const [overrideNotes, setOverrideNotes] = useState<string>(weeklyPlanItem.notes);



    function onSaveButton() {
        console.log("Saving item", weeklyPlanItem.id, overrideDuration, overrideNotes);
        const hasOverrideChanged = overrideDuration !== weeklyPlanItem.weeklyDuration || overrideNotes !== weeklyPlanItem.notes;
        if (hasOverrideChanged) {
            const changedWeeklyItem: WeeklyPlanItem = {
                ...weeklyPlanItem,
                weeklyDuration: overrideDuration || budgetPlanItem.weeklyDuration,
                notes: overrideNotes,
            }
            onSave(changedWeeklyItem)
        }
        onOpenChange(false)
    }

    function onResetButton() {
        if (weeklyPlanItem?.id) {
            onDelete(weeklyPlanItem.id)
        }
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Adjust weekly planned time
                    </DialogTitle>
                    <DialogDescription>
                        {weeklyPlanItem.name} (week starting {currentWeekStartDate.toLocaleDateString(userSettings.locale)})
                    </DialogDescription>
                </DialogHeader>
                <div className="text-sm space-y-2">
                    <div className="flex gap-2 items-center">
                        <div className="w-40">Original time:</div>
                        <div className="w-full">{formatSecondsToDuration(budgetPlanItem.weeklyDuration)}</div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="w-40">Weekly override:</div>
                        <div className="w-full">
                            <Input type="text"
                                   onBlur={(event) => {
                                       if (event.target.value !== "") {
                                           const parsed = parseDurationInput(event.target.value, budgetPlanItem.weeklyDuration);
                                           if (parsed !== undefined) {
                                               setOverrideDuration(parsed);
                                           }
                                       } else {
                                           setOverrideDuration(weeklyPlanItem.weeklyDuration)
                                       }
                                   }}
                                   defaultValue={formatSecondsToDuration(overrideDuration)}
                                   placeholder="5h 30m, +3h20m, +80m, -2h20m"
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
                    { weeklyPlanItem &&
                        <Button type="reset" variant="destructive" onClick={() => onResetButton()}><Trash2Icon />Reset Item</Button>
                    }
                    <Button type="submit" onClick={() => onSaveButton()} disabled={overrideDuration === undefined}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

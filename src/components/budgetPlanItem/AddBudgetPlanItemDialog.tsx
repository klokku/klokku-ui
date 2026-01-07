import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {Button} from "@/components/ui/button.tsx";
import {BudgetPlanItem} from "@/api/types.ts";
import {BudgetPlanItemDetailsForm} from "@/components/budgetPlanItem/BudgetPlanItemDetailsForm.tsx";

interface AddBudgetDialogProps {
    budgetPlanItem: BudgetPlanItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (budget: BudgetPlanItem) => void;
    onDelete: (budget: BudgetPlanItem) => void;
    totalBudgetsTime: number;
}

export function AddBudgetPlanItemDialog({budgetPlanItem, open, onOpenChange, onSave, onDelete, totalBudgetsTime}: AddBudgetDialogProps) {

    const remainingWeeklyTime = 168 * 60 * 60 - totalBudgetsTime

    function onSaveButton(budget: BudgetPlanItem) {
        onSave(budget)
        onOpenChange(false)
    }

    function onDeleteButton() {
        if (budgetPlanItem?.id) {
            onDelete(budgetPlanItem)
        }
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[99vw]">

                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {budgetPlanItem?.name ?? "Creating new budget"}
                    </DialogTitle>
                    <DialogDescription className="flex gap-1">
                        Remaining weekly time:
                        <span className={remainingWeeklyTime < 0 ? "text-red-600" : ""}> {formatSecondsToDuration(remainingWeeklyTime)}</span>
                    </DialogDescription>
                </DialogHeader>
                <BudgetPlanItemDetailsForm formId="add-budget-form" item={budgetPlanItem} onSubmit={(formData) => onSaveButton(formData)}/>
                <DialogFooter>
                    <div className="flex justify-between w-full">
                        <div className="flex gap-2">
                            <Button type="button" variant="destructive" onClick={() => onDeleteButton()}>Delete</Button>
                        </div>
                        <div>
                            <Button form="add-budget-form" type="submit">Save</Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

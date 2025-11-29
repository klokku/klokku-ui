import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {Button} from "@/components/ui/button.tsx";
import {Budget} from "@/api/types.ts";
import {BudgetDetailsForm} from "@/components/budgets/BudgetDetailsForm.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {isBudgetActive} from "@/lib/budgetUtils.ts";

interface AddBudgetDialogProps {
    budget: Budget | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (budget: Budget) => void;
    onDelete: (budget: Budget) => void;
    totalBudgetsTime: number;
}

export function AddBudgetDialog({budget, open, onOpenChange, onSave, onDelete, totalBudgetsTime}: AddBudgetDialogProps) {

    const remainingWeeklyTime = 168 * 60 * 60 - totalBudgetsTime

    function onSaveButton(budget: Budget) {
        onSave(budget)
        onOpenChange(false)
    }

    function onDeleteButton() {
        if (budget?.id) {
            onDelete(budget)
        }
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[99vw]">

                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {budget?.name ?? "Creating new budget"}
                        {budget && !isBudgetActive(budget, new Date()) &&
                            <Badge variant="secondary">inactive</Badge>
                        }
                    </DialogTitle>
                    <DialogDescription className="flex gap-1">
                        Remaining weekly time:
                        <span className={remainingWeeklyTime < 0 ? "text-red-600" : ""}> {formatSecondsToDuration(remainingWeeklyTime)}</span>
                    </DialogDescription>
                </DialogHeader>
                <BudgetDetailsForm formId="add-budget-form" budget={budget} onSubmit={(formData) => onSaveButton(formData)}/>
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

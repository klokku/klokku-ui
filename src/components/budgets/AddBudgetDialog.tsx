import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {Button} from "@/components/ui/button.tsx";
import {Budget} from "@/api/types.ts";
import {BudgetDetailsForm} from "@/components/budgets/BudgetDetailsForm.tsx";
import {Badge} from "@/components/ui/badge.tsx";

interface AddBudgetDialogProps {
    budget: Budget | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (budget: Budget) => void;
    totalBudgetsTime: number;
}

export function AddBudgetDialog({budget, open, onOpenChange, onSave, totalBudgetsTime}: AddBudgetDialogProps) {

    const remainingWeeklyTime = 168 * 60 * 60 - totalBudgetsTime

    function onSaveButton(budget: Budget) {
        onSave(budget)
        onOpenChange(false)
    }

    function onArchiveButton() {
        if (budget?.id) {
            budget.status = "archived"
            onSave(budget)
        }
        onOpenChange(false)
    }

    function onActivateButton() {
        if (budget?.id) {
            budget.status = "active"
            onSave(budget)
        }
        onOpenChange(false)
    }

    function onDeactivateButton() {
        if (budget?.id) {
            budget.status = "inactive"
            onSave(budget)
        }
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {budget?.name ?? "Creating new budget"}
                        {budget?.status === "inactive" &&
                            <Badge variant="secondary">inactive</Badge>
                        }
                    </DialogTitle>
                    <DialogDescription>
                        Remaining weekly time:
                        <span className={remainingWeeklyTime < 0 ? "text-red-600" : ""}> {formatSecondsToDuration(remainingWeeklyTime)}</span>
                    </DialogDescription>
                </DialogHeader>
                <BudgetDetailsForm formId="add-budget-form" budget={budget} onSubmit={(formData) => onSaveButton(formData)}/>
                <DialogFooter>
                    <div className="flex justify-between w-full">
                        <div className="flex gap-2">
                            {budget && budget.status === "inactive" &&
                                <Button type="button" variant="secondary" onClick={() => onActivateButton()}>Activate</Button>
                            }
                            {budget && budget.status === "active" &&
                                <Button type="button" variant="secondary" onClick={() => onDeactivateButton()}>Deactivate</Button>
                            }
                            {budget && budget.status === "inactive" &&
                                <Button type="button" variant="destructive" onClick={() => onArchiveButton()}>Archive</Button>
                            }
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

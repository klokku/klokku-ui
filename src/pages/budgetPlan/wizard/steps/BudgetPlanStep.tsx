import {UseBudgetPlanWizard} from "../hooks/useBudgetPlanWizard.ts";
import {Input} from "@/components/ui/input.tsx";

export function BudgetPlanStep({wiz}: { wiz: UseBudgetPlanWizard }) {
    return (
        <div className="space-y-4">
            <p className="text-muted-foreground">Choose name of your Budget Plan?</p>
            <div className="w-full">
                <label className="block text-sm text-muted-foreground mb-1">Budget Plan Name</label>
                <Input type="text" value={wiz.state.budgetPlanName} onChange={e => wiz.updateBudgetPlanName(e.target.value)}/>
            </div>
        </div>
    );
}

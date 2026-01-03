import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useBudgetPlanWizard} from "./hooks/useBudgetPlanWizard.ts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {paths} from "@/pages/links.ts";
import {WelcomeStep} from "./steps/WelcomeStep.tsx";
import {SleepStep} from "./steps/SleepStep.tsx";
import {WorkStep} from "./steps/WorkStep.tsx";
import {ActivitiesStep} from "./steps/ActivitiesStep.tsx";
import {CustomActivitiesStep} from "./steps/CustomActivitiesStep.tsx";
import {RemainingStep} from "./steps/RemainingStep.tsx";
import useBudgetPlan from "@/api/useBudgetPlan.ts";
import useBudgetPlanItem from "@/api/useBudgetPlanItem.ts";
import {BudgetPlanStep} from "@/pages/budgetPlan/wizard/steps/BudgetPlanStep.tsx";

export interface BudgetWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetPlanId: number | undefined;
}

export function BudgetPlanWizardDialog({open, onOpenChange, budgetPlanId}: BudgetWizardDialogProps) {
  const wiz = useBudgetPlanWizard(budgetPlanId);
  const { createBudgetPlan } = useBudgetPlan();
  const { addBudgetPlanItem } = useBudgetPlanItem();
  const navigate = useNavigate();

  useEffect(() => {
    if (open !== wiz.state.isOpen) {
      wiz.setOpen(open);
    }
  }, [open]);

  async function finish() {
    let stateBudgetPlanId = wiz.state.budgetPlanId;
    if (budgetPlanId === undefined) {
      const plan = await createBudgetPlan({name: wiz.state.budgetPlanName});
      stateBudgetPlanId = plan.id!;
    }
    const items = wiz.buildBudgetPlanItems();
    for (const item of items) { // sequential to preserve order server-side if applicable
      await addBudgetPlanItem(stateBudgetPlanId, item);
    }
    onOpenChange(false);
    wiz.reset();
    navigate(paths.budgets.path);
  }

  const steps = [
    { id: "welcome", isVisible: true,  el: <WelcomeStep /> },
    { id: "budgetplan", isVisible: budgetPlanId === undefined, el: <BudgetPlanStep wiz={wiz} /> },
    { id: "sleep", isVisible: true, el: <SleepStep wiz={wiz} /> },
    { id: "work", isVisible: true, el: <WorkStep wiz={wiz} /> },
    { id: "activities", isVisible: true, el: <ActivitiesStep wiz={wiz} /> },
    { id: "customs", isVisible: true, el: <CustomActivitiesStep wiz={wiz} /> },
    { id: "remaining", isVisible: true, el: <RemainingStep wiz={wiz} /> },
  ].filter(s => s.isVisible);

  const isLast = wiz.state.currentStep === wiz.state.steps.length - 1;

  const isFirst = wiz.state.currentStep === 0;

  return (
      <Dialog open={open} onOpenChange={(newOpen) => {
        if (!newOpen) wiz.reset();
        onOpenChange(newOpen);
      }}>
      <DialogContent className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create budget items</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex gap-1 sm:gap-2 text-sm text-muted-foreground">
            {wiz.state.steps.map((s, i) => (
              <div key={s.id} className={`flex-1 h-1 rounded ${i <= wiz.state.currentStep ? 'bg-blue-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <div className="min-h-48 sm:min-h-64">
          {steps[wiz.state.currentStep]?.el || <div>Loading...</div>}
        </div>

        <div className="mt-4 sm:mt-6 flex flex-col gap-3">
          <div className="text-sm">
            <div className="font-medium">Weekly time</div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              <div className="sm:inline">Planned: {formatSecondsToDuration(wiz.plannedWeeklySeconds)}</div>
              <div className="sm:inline sm:ml-2">Remaining: {formatSecondsToDuration(wiz.remainingWeeklySeconds)}</div>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => wiz.goPrev()} disabled={isFirst} className="flex-1 sm:flex-none">
              Back
            </Button>
            <div className="flex gap-2">
              {!isLast && (
                <Button onClick={() => wiz.goNext()} disabled={!wiz.state.steps[wiz.state.currentStep]?.isValid} className="flex-1 sm:flex-none min-w-20">Next</Button>
              )}
              {isLast && (
                <Button onClick={finish} className="flex-1 sm:flex-none min-w-20">Finish</Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BudgetPlanWizardDialog;

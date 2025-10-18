import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useBudgetWizard} from "./hooks/useBudgetWizard.ts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {useEffect} from "react";
import useBudgets from "@/api/useBudgets.ts";
import {useNavigate} from "react-router-dom";
import {paths} from "@/pages/links.ts";
import {WelcomeStep} from "./steps/WelcomeStep.tsx";
import {SleepStep} from "./steps/SleepStep.tsx";
import {WorkStep} from "./steps/WorkStep.tsx";
import {ActivitiesStep} from "./steps/ActivitiesStep.tsx";
import {CustomActivitiesStep} from "./steps/CustomActivitiesStep.tsx";
import {RemainingStep} from "./steps/RemainingStep.tsx";

export interface BudgetWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// TODO budget wizard doesn work on mobile, fix it
export function BudgetWizardDialog({open, onOpenChange}: BudgetWizardDialogProps) {
  const wiz = useBudgetWizard();
  const { createBudget } = useBudgets(false);
  const navigate = useNavigate();

  useEffect(() => { wiz.setOpen(open); }, [open]);
  useEffect(() => { onOpenChange(wiz.state.isOpen); }, [wiz.state.isOpen]);

  async function finish() {
    const budgets = wiz.buildBudgets();
    for (const b of budgets) { // sequential to preserve order server-side if applicable
      await createBudget(b);
    }
    wiz.reset();
    onOpenChange(false);
    navigate(paths.budgets.path);
  }

  const steps = [
    { id: "welcome", el: <WelcomeStep /> },
    { id: "sleep", el: <SleepStep wiz={wiz} /> },
    { id: "work", el: <WorkStep wiz={wiz} /> },
    { id: "activities", el: <ActivitiesStep wiz={wiz} /> },
    { id: "customs", el: <CustomActivitiesStep wiz={wiz} /> },
    { id: "remaining", el: <RemainingStep wiz={wiz} /> },
  ];

  const isLast = wiz.state.currentStep === steps.length - 1;
  const isFirst = wiz.state.currentStep === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create your budgets</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex gap-2 text-sm text-muted-foreground">
            {wiz.state.steps.map((s, i) => (
              <div key={s.id} className={`flex-1 h-1 rounded ${i <= wiz.state.currentStep ? 'bg-blue-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <div className="min-h-64">
          {steps[wiz.state.currentStep].el}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm">
            <div>
              <div className="font-medium">Weekly time</div>
              <div className="text-muted-foreground">Planned: {formatSecondsToDuration(wiz.plannedWeeklySeconds)} | Remaining: {formatSecondsToDuration(wiz.remainingWeeklySeconds)}</div>
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              <Button variant="outline" onClick={() => wiz.goPrev()} disabled={isFirst}>Back</Button>
            </div>
            <div className="flex gap-2">
              {!isLast && (
                <Button onClick={() => wiz.goNext()}>Next</Button>
              )}
              {isLast && (
                <Button onClick={finish}>Finish</Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BudgetWizardDialog;

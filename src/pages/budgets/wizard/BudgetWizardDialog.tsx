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
      <DialogContent className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create your budgets</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex gap-1 sm:gap-2 text-sm text-muted-foreground">
            {wiz.state.steps.map((s, i) => (
              <div key={s.id} className={`flex-1 h-1 rounded ${i <= wiz.state.currentStep ? 'bg-blue-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <div className="min-h-48 sm:min-h-64">
          {steps[wiz.state.currentStep].el}
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
                <Button onClick={() => wiz.goNext()} className="flex-1 sm:flex-none min-w-20">Next</Button>
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

export default BudgetWizardDialog;

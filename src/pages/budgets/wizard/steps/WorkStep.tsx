import {UseBudgetWizard} from "../hooks/useBudgetWizard.ts";
import {TimeInputs} from "./_TimeInputs.tsx";

export function WorkStep({wiz}: {wiz: UseBudgetWizard}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">How much time do you spend at work?</p>
      <TimeInputs label="Work" value={wiz.state.work} onChange={wiz.updateWork} showDaysPerWeek />
    </div>
  );
}

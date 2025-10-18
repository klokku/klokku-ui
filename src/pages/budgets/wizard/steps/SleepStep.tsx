import {UseBudgetWizard} from "../hooks/useBudgetWizard.ts";
import {TimeInputs} from "./_TimeInputs.tsx";

export function SleepStep({wiz}: {wiz: UseBudgetWizard}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">How much time would you like to spend sleeping?</p>
      <TimeInputs label="Sleep" value={wiz.state.sleep} onChange={wiz.updateSleep} />
    </div>
  );
}

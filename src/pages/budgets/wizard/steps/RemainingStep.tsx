import {UseBudgetWizard} from "../hooks/useBudgetWizard.ts";
import {Input} from "@/components/ui/input.tsx";

export function RemainingStep({wiz}: {wiz: UseBudgetWizard}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">The remaining hours will be always automatically assigned to the "other" budget. You can name it differently if you'd like.</p>
      <div>
        <label className="block text-sm text-muted-foreground mb-1">Remaining time budget name:</label>
        <Input value={wiz.state.remainingName} onChange={e => wiz.setRemainingName(e.target.value)} />
      </div>
    </div>
  );
}

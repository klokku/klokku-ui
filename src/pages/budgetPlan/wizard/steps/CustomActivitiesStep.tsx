import {UseBudgetPlanWizard} from "../hooks/useBudgetPlanWizard.ts";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {TimeInputs} from "./_TimeInputs.tsx";

export function CustomActivitiesStep({wiz}: {wiz: UseBudgetPlanWizard}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Would you like to add a budget for any other recurring weekly task with a predictable duration?</p>
      <div className="rounded border p-3 space-y-3">
        {wiz.state.customs.map((c, i) => (
          <div key={i} className="border rounded p-3 space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Name</label>
              <Input value={c.name} onChange={e => wiz.updateCustom(i, {name: e.target.value})}/>
            </div>
            <TimeInputs label={c.name || `Custom #${i+1}`} value={c} onChange={(v) => wiz.updateCustom(i, v)} showDaysPerWeek />
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={() => wiz.removeCustom(i)}>Remove</Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => wiz.addCustom()}>Add custom activity</Button>
      </div>
      <p className="text-xs text-muted-foreground">Don't worry. You do not have to use all the remaining time. You even shouldn't.</p>
    </div>
  );
}

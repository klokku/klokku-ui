import {UseBudgetWizard} from "../hooks/useBudgetWizard.ts";
import {TimeInputs} from "./_TimeInputs.tsx";
import {Switch} from "@/components/ui/switch.tsx";

export function ActivitiesStep({wiz}: {wiz: UseBudgetWizard}) {
  const entries = Object.entries(wiz.state.activities);
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Do you spend time on any of the following activities?</p>
      <div className="space-y-4">
        {entries.map(([key, val]) => (
          <div key={key} className="border rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium capitalize">{key}</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Enable</span>
                <Switch checked={val.enabled} onCheckedChange={(checked) => wiz.updateActivity(key, {enabled: checked})} />
              </div>
            </div>
            {val.enabled && (
              <TimeInputs label="" value={val} onChange={(v) => wiz.updateActivity(key, v)} showDaysPerWeek />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import {AlertCircle, Settings2} from "lucide-react";
import useDashboardConfiguration from "@/api/useDashboardConfiguration";
import {Button} from "@/components/ui/button";
import {DashboardCustomization} from "./DashboardCustomization";

export function DashboardHeaderActions() {
    const configuration = useDashboardConfiguration();

    if (configuration.configuration !== undefined) {
        return <DashboardCustomization key={configuration.profileUid} compact
            configuration={configuration.configuration} onSave={configuration.saveConfiguration}/>;
    }

    if (configuration.error) {
        return <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={configuration.retry}
            aria-label="Retry dashboard configuration" title="Could not load dashboard configuration. Click to retry.">
            <AlertCircle className="size-4" aria-hidden="true"/>
        </Button>;
    }

    return <Button variant="ghost" size="icon" className="size-8" disabled aria-busy="true"
        aria-label="Loading dashboard configuration" title="Loading dashboard configuration">
        <Settings2 className="size-4" aria-hidden="true"/>
    </Button>;
}

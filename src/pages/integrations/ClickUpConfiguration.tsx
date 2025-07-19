import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import useClickUp from "@/api/useClickUp.ts";
import useBudgets from "@/api/useBudgets.ts";
import {ClickUpConfigurationForm} from "@/pages/integrations/ClickUpConfigurationForm.tsx";


export function ClickUpConfiguration() {

    const {
        workspaces,
        config,
        authLogout,
    } = useClickUp();

    const {budgets} = useBudgets(false);


    const handleClickUpLogout = async () => {
        try {
            await authLogout();
        } catch (error) {
            console.error("Error logging out from ClickUp:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    Connected to ClickUp
                </p>
                <Button variant="outline" onClick={handleClickUpLogout}>
                    Disconnect
                </Button>
            </div>


            {workspaces && budgets && config && (
                <>
                    <Separator/>
                    <ClickUpConfigurationForm config={config} workspaces={workspaces} budgets={budgets}/>
                </>
            )
            }
        </div>
    )
}

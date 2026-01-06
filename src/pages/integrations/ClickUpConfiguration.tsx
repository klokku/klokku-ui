import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import useClickUp from "@/api/useClickUp.ts";
import useBudgetPlan from "@/api/useBudgetPlan.ts";
import {ClickUpConfigurationForm} from "@/pages/integrations/ClickUpConfigurationForm.tsx";
import {useState} from "react";
import {BudgetPlanSelect} from "@/components/budgetPlan/BudgetPlanSelect.tsx";
import {Trash2} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";


export function ClickUpConfiguration() {

    const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        workspaces,
        isLoadingWorkspaces,
        authLogout,
        deleteConfig,
        config,
    } = useClickUp(selectedPlanId);

    const {budgetPlanDetails, isLoadingBudgetPlanDetails} = useBudgetPlan(selectedPlanId)


    const handleClickUpLogout = async () => {
        try {
            await authLogout();
        } catch (error) {
            console.error("Error logging out from ClickUp:", error);
        }
    };

    const handleDeleteConfig = async () => {
        if (!selectedPlanId) return;

        setIsDeleting(true);
        try {
            await deleteConfig(selectedPlanId);
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting configuration:", error);
        } finally {
            setIsDeleting(false);
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

            <Separator/>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">
                        Select Budget Plan
                    </label>
                    {selectedPlanId && config && (
                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                >
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Delete Configuration
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete ClickUp Configuration</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this ClickUp configuration? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteConfig} disabled={isDeleting}>
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Choose a budget plan to configure ClickUp tag mappings
                </p>
                <BudgetPlanSelect selectedId={selectedPlanId} onPlanSelected={setSelectedPlanId}/>
            </div>

            {!isLoadingWorkspaces && !isLoadingBudgetPlanDetails && workspaces && budgetPlanDetails && (
                <ClickUpConfigurationForm
                    key={`config-form-${selectedPlanId}-${config?.workspaceId || 'empty'}`}
                    workspaces={workspaces}
                    budgetPlan={budgetPlanDetails}
                />
            )}
        </div>
    )
}

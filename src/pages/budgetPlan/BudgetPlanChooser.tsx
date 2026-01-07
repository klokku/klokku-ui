import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CheckIcon, PencilIcon, PlusIcon, Settings2Icon, Trash2Icon} from "lucide-react";
import {BudgetPlan} from "@/api/types.ts";
import {useState} from "react";
import useBudgetPlan from "@/api/useBudgetPlan.ts";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import {BudgetPlanSelect} from "@/components/budgetPlan/BudgetPlanSelect.tsx";
import {BudgetPlanEdit} from "@/components/budgetPlan/BudgetPlanEdit.tsx";

interface BudgetPlanChooserProps {
    budgetPlans: BudgetPlan[]
    selectedPlanId: number | undefined
    setSelectedPlanId: (planId: number | undefined) => void
}

export function BudgetPlanChooser({budgetPlans, selectedPlanId, setSelectedPlanId}: BudgetPlanChooserProps) {

    const {updateBudgetPlan, createBudgetPlan, deleteBudgetPlan} = useBudgetPlan();

    const currentPlanId = budgetPlans.find(p => p.isCurrent)?.id;
    const selectedPlan = budgetPlans.find(p => p.id === selectedPlanId);

    const [planAction, setPlanAction] = useState<"rename" | "create" | undefined>(undefined);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleRename = async (newName: string) => {
        if (selectedPlan && selectedPlanId) {
            await updateBudgetPlan(selectedPlanId, {name: newName, isCurrent: selectedPlan.isCurrent});
        }
    };

    const handleDelete = async () => {
        if (selectedPlanId && selectedPlanId !== currentPlanId) {
            await deleteBudgetPlan(selectedPlanId);
            setSelectedPlanId(currentPlanId || budgetPlans[0]?.id);
            setIsDeleting(false);
        }
    };

    const handleCreate = async (planName: string) => {
        if (planName.trim()) {
            const newPlan = await createBudgetPlan({name: planName});
            setSelectedPlanId(newPlan.id);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                    <BudgetPlanSelect selectedId={selectedPlanId} onPlanSelected={setSelectedPlanId}/>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Settings2Icon className="size-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuItem onClick={() => {
                                setPlanAction("rename");
                            }}>
                                <PencilIcon className="mr-2 size-4"/>
                                Rename Plan
                            </DropdownMenuItem>
                            {selectedPlanId !== currentPlanId && (
                                <DropdownMenuItem onClick={async () => {
                                    await updateBudgetPlan(selectedPlanId!, {name: selectedPlan!.name, isCurrent: true});
                                }}>
                                    <CheckIcon className="mr-2 size-4"/>
                                    Set as Current
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem onClick={() => {
                                setPlanAction("create");
                            }}>
                                <PlusIcon className="mr-2 size-4"/>
                                Create New Plan
                            </DropdownMenuItem>

                            {selectedPlanId !== currentPlanId && (
                                <>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                        onClick={() => setIsDeleting(true)}
                                    >
                                        <Trash2Icon className="mr-2 size-4"/>
                                        Delete Plan
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {planAction && (
                <BudgetPlanEdit
                    planName={selectedPlan?.name || ""}
                    open={planAction !== undefined}
                    onSave={async (name) => {
                        if (planAction === "create") {
                            await handleCreate(name);
                        } else if (planAction === "rename") {
                            await handleRename(name);
                        }
                        setPlanAction(undefined);
                    }}
                    onOpenChange={(open) => {
                        if (!open) {
                            setPlanAction(undefined);
                        }
                    }}
                    action={planAction}
                />
            )}

            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the budget plan <strong>{selectedPlan?.name}</strong> and all its items.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete Plan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

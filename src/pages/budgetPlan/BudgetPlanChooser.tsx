import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CheckIcon, PencilIcon, PlusIcon, Settings2Icon, Trash2Icon} from "lucide-react";
import {BudgetPlan} from "@/api/types.ts";
import {useState} from "react";
import useBudgetPlan from "@/api/useBudgetPlan.ts";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
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
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";

interface BudgetPlanChooserProps {
    budgetPlans: BudgetPlan[]
    selectedPlanId: number | undefined
    setSelectedPlanId: (planId: number | undefined) => void
}

export function BudgetPlanChooser({budgetPlans, selectedPlanId, setSelectedPlanId}: BudgetPlanChooserProps) {

    const {updateBudgetPlan, createBudgetPlan, deleteBudgetPlan} = useBudgetPlan();

    const currentPlanId = budgetPlans.find(p => p.isCurrent)?.id;
    const activePlan = budgetPlans.find(p => p.id === selectedPlanId);

    const [isRenaming, setIsRenaming] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [planName, setPlanName] = useState("");

    const handleRename = async () => {
        if (activePlan && selectedPlanId) {
            await updateBudgetPlan(selectedPlanId, {name: planName, isCurrent: activePlan.isCurrent});
            setIsRenaming(false);
        }
    };

    const handleDelete = async () => {
        if (selectedPlanId && selectedPlanId !== currentPlanId) {
            await deleteBudgetPlan(selectedPlanId);
            setSelectedPlanId(currentPlanId || budgetPlans[0]?.id);
            setIsDeleting(false);
        }
    };

    const handleCreate = async () => {
        if (planName.trim()) {
            const newPlan = await createBudgetPlan({ name: planName });
            setSelectedPlanId(newPlan.id);
            setIsCreating(false);
            setPlanName("");
        }
    };

    return (
        <div>
            <div className="mb-4 flex items-center gap-2">
                <div className="flex items-center gap-2">
                    <Select
                        value={selectedPlanId?.toString()}
                        onValueChange={planId => setSelectedPlanId(Number(planId))}
                    >
                        <SelectTrigger className="w-80">
                            <SelectValue placeholder="Budget Plan"/>
                        </SelectTrigger>
                        <SelectContent>
                            {budgetPlans.map((plan) => (
                                <SelectItem key={`plan-${plan.id}`} value={plan.id!.toString()}>
                                    <div className="flex items-center gap-2">
                                        {plan.name}
                                        {plan.isCurrent && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Current</Badge>}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Settings2Icon className="size-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuItem onClick={() => {
                                setPlanName(activePlan?.name || "");
                                setIsRenaming(true);
                            }}>
                                <PencilIcon className="mr-2 size-4"/>
                                Rename Plan
                            </DropdownMenuItem>
                            {selectedPlanId !== currentPlanId && (
                                <DropdownMenuItem onClick={async () => {
                                    await updateBudgetPlan(selectedPlanId!, {name: activePlan!.name, isCurrent: true});
                                }}>
                                    <CheckIcon className="mr-2 size-4"/>
                                    Set as Current
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                                setPlanName("");
                                setIsCreating(true);
                            }}>
                                <PlusIcon className="mr-2 size-4" />
                                Create New Plan
                            </DropdownMenuItem>

                            {selectedPlanId !== currentPlanId && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                        onClick={() => setIsDeleting(true)}
                                    >
                                        <Trash2Icon className="mr-2 size-4" />
                                        Delete Plan
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Dialog open={isRenaming || isCreating} onOpenChange={(open) => {
                if (!open) {
                    setIsRenaming(false);
                    setIsCreating(false);
                }
            }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isCreating ? "Create New Budget Plan" : "Rename Budget Plan"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input
                                id="name"
                                value={planName}
                                onChange={(e) => setPlanName(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. Summer 2024"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsRenaming(false);
                            setIsCreating(false);
                        }}>Cancel</Button>
                        <Button onClick={isCreating ? handleCreate : handleRename}>
                            {isCreating ? "Create Plan" : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the budget plan <strong>{activePlan?.name}</strong> and all its items.
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

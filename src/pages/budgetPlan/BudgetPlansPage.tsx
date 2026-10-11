import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {CheckCircleIcon, MessageCircleWarningIcon, PlusIcon} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {AddBudgetPlanItemDialog} from "@/components/budgetPlanItem/AddBudgetPlanItemDialog.tsx";
import {BudgetPlanItem} from "@/api/types.ts";
import {useState} from "react";
import {closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from "@dnd-kit/sortable";
import BudgetPlanWizardDialog from "@/pages/budgetPlan/wizard/BudgetPlanWizardDialog.tsx";
import {EmptyBudgetPlan} from "@/pages/budgetPlan/EmptyBudgetPlan.tsx";
import useBudgetPlanItem from "@/api/useBudgetPlanItem.ts";
import useBudgetPlan from "@/api/useBudgetPlan.ts";
import {BudgetPlanChooser} from "@/pages/budgetPlan/BudgetPlanChooser.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {NoBudgetPlan} from "@/pages/budgetPlan/NoBudgetPlan.tsx";
import {BudgetPlanEdit} from "@/components/budgetPlan/BudgetPlanEdit.tsx";
import {SortableBudgetPlanItemRow} from "@/pages/budgetPlan/SortableBudgetPlanItemRow.tsx";

export function BudgetPlansPage() {

    const {budgetPlans, isLoadingPlans, createBudgetPlan} = useBudgetPlan();
    const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>();

    const {budgetPlanDetails, isLoadingBudgetPlanDetails} = useBudgetPlan(selectedPlanId)
    const {addBudgetPlanItem, updateBudgetPlanItem, deleteBudgetPlanItem, changeBudgetPlanItemPosition, isChangingBudgetPlanItemPosition} = useBudgetPlanItem()

    const [editedItem, setEditedItem] = useState<BudgetPlanItem | null>(null)
    const [itemDialogOpen, setItemDialogOpen] = useState<boolean>(false)
    const [wizardOpen, setWizardOpen] = useState<boolean>(false)
    const [createPlanDialogOpen, setCreatePlanDialogOpen] = useState<boolean>(false)
    const [reorderError, setReorderError] = useState<{planId: number; message: string} | null>(null)
    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 8}}),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    )

    if (isLoadingPlans || isLoadingBudgetPlanDetails) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <Spinner className="size-8"/>
            </div>
        )
    }

    const totalItemsTime = budgetPlanDetails?.items?.reduce((acc, budget) => acc + budget.weeklyDuration, 0) || 0

    const createNewBudgetPlan = async (planName: string) => {
        if (planName.trim()) {
            await createBudgetPlan({name: planName});
            setCreatePlanDialogOpen(false)
        }
    };

    function editItem(budget: BudgetPlanItem) {
        setEditedItem(budget)
        setItemDialogOpen(true)
    }

    function addNewBudget() {
        setEditedItem(null)
        setItemDialogOpen(true)
    }

    async function onItemSave(item: BudgetPlanItem) {
        if (selectedPlanId && item.id) {
            await updateBudgetPlanItem(selectedPlanId, item)
        } else if (selectedPlanId) {
            await addBudgetPlanItem(selectedPlanId, item)
        }
        setItemDialogOpen(false)
        setEditedItem(null)
    }

    async function onItemDelete(item: BudgetPlanItem) {
        await deleteBudgetPlanItem(selectedPlanId!, item.id!)
        setItemDialogOpen(false)
        setEditedItem(null)
    }

    async function onDragEnd({active, over}: DragEndEvent) {
        if (!over || active.id === over.id || !selectedPlanId || !budgetPlanDetails || isChangingBudgetPlanItemPosition) return;
        const items = budgetPlanDetails.items;
        const from = items.findIndex(item => item.id === active.id);
        const to = items.findIndex(item => item.id === over.id);
        if (from === -1 || to === -1) return;
        const reordered = arrayMove(items, from, to);
        const precedingId = to === 0 ? 0 : reordered[to - 1].id;
        if (precedingId === undefined) return;
        const planId = selectedPlanId;
        setReorderError(null);
        try {
            await changeBudgetPlanItemPosition(planId, items[from].id!, precedingId);
        } catch {
            setReorderError({planId, message: "Could not save the item order. Please try dragging the item again."});
        }
    }

    const itemName = (id: string | number) => budgetPlanDetails?.items.find(item => item.id === id)?.name ?? "Item";
    const itemPosition = (id: string | number) => (budgetPlanDetails?.items.findIndex(item => item.id === id) ?? -1) + 1;

    return (
        <div className="grow flex flex-col gap-2">

            {budgetPlans.length === 0 && (
                <NoBudgetPlan
                    onOpenWizard={() => {
                        setWizardOpen(true)
                    }}
                    onCreateEmptyBudgetPlan={() => setCreatePlanDialogOpen(true)}
                />
            )}

            {budgetPlans.length > 0 && (
                <BudgetPlanChooser
                    budgetPlans={budgetPlans}
                    selectedPlanId={selectedPlanId}
                    setSelectedPlanId={setSelectedPlanId}
                />
            )}

            {budgetPlanDetails && (totalItemsTime !== 7 * 24 * 60 * 60) && (
                <Alert className="mb-4 border-amber-300 bg-amber-50">
                    <MessageCircleWarningIcon className="h-4 w-4"/>
                    <AlertTitle>Budgets time issue</AlertTitle>
                    <AlertDescription>
                        <p>The sum of time in your budgets does not match the total time available in a week (168 hours).</p>
                    </AlertDescription>
                </Alert>
            )}

            {budgetPlanDetails && !isLoadingPlans && !isLoadingBudgetPlanDetails && (!budgetPlanDetails?.items || budgetPlanDetails?.items.length === 0) && (
                <EmptyBudgetPlan
                    onOpenWizard={() => setWizardOpen(true)}
                    onAddBudgetItem={addNewBudget}
                />
            )}

            {budgetPlanDetails?.items && (
                <>
                    {reorderError && reorderError.planId === selectedPlanId && <p role="alert" className="text-sm text-destructive">{reorderError.message}</p>}
                    <DndContext key={selectedPlanId} sensors={sensors} collisionDetection={closestCenter}
                                modifiers={[({transform}) => ({...transform, x: 0})]}
                                onDragEnd={event => { void onDragEnd(event); }}
                                accessibility={{
                                    screenReaderInstructions: {draggable: "To reorder a budget item, press Space or Enter to pick it up, use the up and down arrow keys to move, and press Space or Enter to drop. Press Escape to cancel."},
                                    announcements: {
                                        onDragStart: ({active}) => `Picked up ${itemName(active.id)}, position ${itemPosition(active.id)} of ${budgetPlanDetails.items.length}.`,
                                        onDragOver: ({active, over}) => over ? `${itemName(active.id)} moved to position ${itemPosition(over.id)} of ${budgetPlanDetails.items.length}.` : `${itemName(active.id)} is outside the list.`,
                                        onDragEnd: ({active, over}) => over ? `${itemName(active.id)} dropped at position ${itemPosition(over.id)}.` : `Reordering ${itemName(active.id)} cancelled.`,
                                        onDragCancel: ({active}) => `Reordering ${itemName(active.id)} cancelled.`,
                                    },
                                }}>
                        <div className="rounded-md border overflow-hidden shadow-xs">
                            <Table className="w-full border-collapse">
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="w-60"></TableHead>
                                        <TableHead>Weekly</TableHead>
                                        <TableHead>Daily</TableHead>
                                        <TableHead className="hidden md:table-cell">Events per week</TableHead>
                                        <TableHead className="w-12"><span className="sr-only">Reorder</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <SortableContext items={budgetPlanDetails.items.flatMap(item => item.id === undefined ? [] : [item.id])} strategy={verticalListSortingStrategy}>
                                        {budgetPlanDetails.items.map(item => <SortableBudgetPlanItemRow key={item.id} item={item}
                                            disabled={isChangingBudgetPlanItemPosition || budgetPlanDetails.items.length < 2} onEdit={editItem}/>)}
                                    </SortableContext>
                                    <TableRow key="add-new-budget-row" className="text-muted-foreground">
                                        <TableCell className="text-center cursor-pointer hover:text-blue-500" onClick={addNewBudget}>
                                            <div className="flex items-center gap-2">
                                                <PlusIcon className="size-4"/>
                                                <span>Add new item</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span>{formatSecondsToDuration(totalItemsTime)}</span>
                                                {(totalItemsTime === 7 * 24 * 60 * 60) && (
                                                    <CheckCircleIcon className="size-4 text-green-500"/>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span>{formatSecondsToDuration((totalItemsTime ?? 1) / 7)}</span>
                                                {(totalItemsTime === 7 * 24 * 60 * 60) && (
                                                    <CheckCircleIcon className="size-4 text-green-500"/>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell"></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </DndContext>
                </>
            )}

            <AddBudgetPlanItemDialog
                budgetPlanItem={editedItem}
                open={itemDialogOpen} onOpenChange={setItemDialogOpen}
                onSave={onItemSave} onDelete={onItemDelete}
                totalBudgetsTime={totalItemsTime!}
            />
            <BudgetPlanWizardDialog open={wizardOpen} onOpenChange={setWizardOpen} budgetPlanId={budgetPlanDetails?.id}/>
            <BudgetPlanEdit open={createPlanDialogOpen} onSave={createNewBudgetPlan} onOpenChange={setCreatePlanDialogOpen} action={"create"}
            />
        </div>
    )
}

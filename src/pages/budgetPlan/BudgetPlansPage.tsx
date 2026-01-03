import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, MessageCircleWarningIcon, PlusIcon} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {AddBudgetPlanItemDialog} from "@/components/budgetPlanItem/AddBudgetPlanItemDialog.tsx";
import {BudgetPlanItem} from "@/api/types.ts";
import {createElement, useState} from "react";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import * as Icons from "@heroicons/react/24/solid";
import {Square2StackIcon} from "@heroicons/react/24/outline";
import BudgetPlanWizardDialog from "@/pages/budgetPlan/wizard/BudgetPlanWizardDialog.tsx";
import {EmptyBudgetPlan} from "@/pages/budgetPlan/EmptyBudgetPlan.tsx";
import useBudgetPlanItem from "@/api/useBudgetPlanItem.ts";
import useBudgetPlan from "@/api/useBudgetPlan.ts";
import {BudgetPlanChooser} from "@/pages/budgetPlan/BudgetPlanChooser.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {NoBudgetPlan} from "@/pages/budgetPlan/NoBudgetPlan.tsx";

export function BudgetPlansPage() {

    const {budgetPlans, isLoadingPlans} = useBudgetPlan();
    const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>(budgetPlans.find(p => p.isCurrent)?.id);

    const effectivePlanId = selectedPlanId ?? budgetPlans.find(p => p.isCurrent)?.id ?? budgetPlans[0]?.id;

    const {budgetPlanDetails, isLoadingBudgetPlanDetails} = useBudgetPlan(effectivePlanId)
    const {addBudgetPlanItem, updateBudgetPlanItem, deleteBudgetPlanItem, changeBudgetPlanItemPosition} = useBudgetPlanItem()

    const [editedItem, setEditedItem] = useState<BudgetPlanItem | null>(null)
    const [itemDialogOpen, setItemDialogOpen] = useState<boolean>(false)
    const [wizardOpen, setWizardOpen] = useState<boolean>(false)

    if (isLoadingPlans || isLoadingBudgetPlanDetails) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <Spinner className="size-8"/>
            </div>
        )
    }

    const totalItemsTime = budgetPlanDetails?.items?.reduce((acc, budget) => acc + budget.weeklyDuration, 0)


    function editItem(budget: BudgetPlanItem) {
        setEditedItem(budget)
        setItemDialogOpen(true)
    }

    function addNewBudget() {
        setEditedItem(null)
        setItemDialogOpen(true)
    }

    async function onItemSave(item: BudgetPlanItem) {
        if (effectivePlanId && item.id) {
            await updateBudgetPlanItem(effectivePlanId, item)
        } else if (effectivePlanId) {
            await addBudgetPlanItem(effectivePlanId, item)
        }
        setItemDialogOpen(false)
        setEditedItem(null)
    }

    async function onItemDelete(item: BudgetPlanItem) {
        await deleteBudgetPlanItem(effectivePlanId!, item.id!)
        setItemDialogOpen(false)
        setEditedItem(null)
    }

    function isFirstOnTheList(item: BudgetPlanItem): boolean {
        return budgetPlanDetails?.items.findIndex((b) => b.id === item.id) === 0
    }

    function isLastOnTheList(item: BudgetPlanItem): boolean {
        const index = budgetPlanDetails?.items.findIndex((b) => b.id === item.id)
        if (index === budgetPlanDetails!.items.length - 1) {
            return true
        }
        return !budgetPlanDetails!.items[index! + 1];
    }

    async function moveUp(item: BudgetPlanItem) {
        const index = budgetPlanDetails?.items.findIndex((b) => b.id === item.id)
        if (index! < 2) {
            await changeBudgetPlanItemPosition(effectivePlanId!, item.id!, 0)
        }
        await changeBudgetPlanItemPosition(effectivePlanId!, item.id!, budgetPlanDetails!.items[index! - 2].id!)
    }

    async function moveDown(item: BudgetPlanItem) {
        const index = budgetPlanDetails?.items.findIndex((b) => b.id === item.id)
        await changeBudgetPlanItemPosition(effectivePlanId!, item.id!, budgetPlanDetails!.items[index! + 1].id!)
    }

    const getIcon = (iconName: string, className: string) => {
        const key = iconName as keyof typeof Icons;
        const iconComponent = Icons[key] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
        return iconComponent ? createElement(iconComponent, {className}) : null
    };

    return (
        <div className="grow flex flex-col gap-2">

            {!budgetPlanDetails && (
                <NoBudgetPlan
                    onOpenWizard={() => {
                        setWizardOpen(true)
                    }}
                    onCreateEmptyBudgetPlan={addNewBudget}
                />
            )}

            {budgetPlanDetails && (
                <BudgetPlanChooser
                    budgetPlans={budgetPlans}
                    selectedPlanId={effectivePlanId}
                    setSelectedPlanId={setSelectedPlanId}
                />)
            }

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
                    <div className="rounded-md border overflow-hidden shadow-xs">
                        <Table className="w-full border-collapse">
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="w-60"></TableHead>
                                    <TableHead>Weekly</TableHead>
                                    <TableHead>Daily</TableHead>
                                    <TableHead className="hidden md:table-cell">Events per week</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {budgetPlanDetails?.items?.map((item) => (
                                    <TableRow key={`budget-plan-item-${item.id}`}>
                                        <TableCell className="cursor-pointer font-medium hover:text-blue-500 flex gap-2"
                                                   onClick={() => {
                                                       editItem(item)
                                                   }}>
                                            {item.icon && getIcon(item.icon, "size-5 text-gray-500")}
                                            {!item.icon && <Square2StackIcon className="size-5 text-gray-500"/>}
                                            {item.name}
                                        </TableCell>
                                        <TableCell>{formatSecondsToDuration(item.weeklyDuration)}</TableCell>
                                        <TableCell>{formatSecondsToDuration(item.weeklyDuration / 7)}</TableCell>
                                        <TableCell className="hidden md:table-cell">{item.weeklyOccurrences !== 0 ? item.weeklyOccurrences : (
                                            <Badge variant="outline" className="text-gray-500">undefined</Badge>)}</TableCell>
                                        <TableCell className="flex justify-end items-center">
                                            <div className="flex gap-1">
                                                {!isFirstOnTheList(item) &&
                                                    <Button type="button" variant="outline" size="icon" className="h-[30px]" onClick={() => {
                                                        moveUp(item)
                                                    }}>
                                                        <ChevronUpIcon className="size-4"/>
                                                    </Button>
                                                }
                                                {!isLastOnTheList(item) &&
                                                    <Button type="button" variant="outline" size="icon" className="h-[30px]" onClick={() => {
                                                        moveDown(item)
                                                    }}>
                                                        <ChevronDownIcon className="size-4"/>
                                                    </Button>
                                                }
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow key="add-new-budget-row" className="text-muted-foreground">
                                    <TableCell className="text-center cursor-pointer hover:text-blue-500" onClick={addNewBudget}>
                                        <div className="flex items-center gap-2">
                                            <PlusIcon className="size-4"/>
                                            <span>Add new budget</span>
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
                    <AddBudgetPlanItemDialog
                        key={editedItem?.id ?? `new-budget-item-dialog`}
                        budgetPlanItem={editedItem} open={itemDialogOpen} onOpenChange={setItemDialogOpen} onSave={onItemSave} onDelete={onItemDelete}
                        totalBudgetsTime={totalItemsTime!}/>
                </>
            )}

            <BudgetPlanWizardDialog open={wizardOpen} onOpenChange={setWizardOpen} budgetPlanId={budgetPlanDetails?.id}/>
        </div>
    )
}

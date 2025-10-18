import useBudgets from "@/api/useBudgets.ts";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, MenuIcon, MessageCircleWarningIcon, PlusIcon} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {AddBudgetDialog} from "@/components/budgets/AddBudgetDialog.tsx";
import {Budget} from "@/api/types.ts";
import {createElement, useEffect, useState} from "react";
import {Badge} from "@/components/ui/badge.tsx";
import {DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import * as Icons from "@heroicons/react/24/solid";
import {Square2StackIcon} from "@heroicons/react/24/outline";
import {isBudgetActive} from "@/lib/budgetUtils.ts";
import BudgetWizardDialog from "@/pages/budgets/wizard/BudgetWizardDialog.tsx";

export function BudgetsPage() {
    const [showInactive, setShowInactive] = useState(false)
    const {budgets, isLoading, createBudget, updateBudget, deleteBudget, setBudgetPosition} = useBudgets(showInactive);

    const totalBudgetsTime = budgets.filter((budget) => isBudgetActive(budget, new Date()))
        .reduce((acc, budget) => acc + budget.weeklyTime, 0)
    const [editedBudget, setEditedBudget] = useState<Budget | null>(null)
    const [budgetDialogOpen, setBudgetDialogOpen] = useState<boolean>(false)
    const [wizardOpen, setWizardOpen] = useState<boolean>(false)

    useEffect(() => {
        if (!isLoading && budgets.length === 0) {
            setWizardOpen(true)
        }
    }, [budgets.length, isLoading])

    function editBudget(budget: Budget) {
        setEditedBudget(budget)
        setBudgetDialogOpen(true)
    }

    function addNewBudget() {
        setEditedBudget(null)
        setBudgetDialogOpen(true)
    }

    async function onBudgetSave(budget: Budget) {
        if (budget.id) {
            await updateBudget(budget)
        } else {
            await createBudget(budget)
        }
        setBudgetDialogOpen(false)
        setEditedBudget(null)
    }

    async function onBudgetDelete(budget: Budget) {
        await deleteBudget(budget.id!)
        setBudgetDialogOpen(false)
        setEditedBudget(null)
    }

    function isFirstOnTheList(budget: Budget): boolean {
        return budgets.findIndex((b) => b.id === budget.id) === 0
    }

    function isLastActiveOnTheList(budget: Budget): boolean {
        const now = new Date()
        const index = budgets.findIndex((b) => b.id === budget.id && isBudgetActive(budget, now))
        if (index === budgets.length - 1) {
            return true
        }
        return !isBudgetActive(budgets[index + 1], now);
    }

    async function moveUp(budget: Budget) {
        const index = budgets.findIndex((b) => b.id === budget.id)
        if (index < 2) {
            await setBudgetPosition(budget.id!)
        }
        await setBudgetPosition(budget.id!, budgets[index-2].id)
    }

    async function moveDown(budget: Budget) {
        const index = budgets.findIndex((b) => b.id === budget.id)
        await setBudgetPosition(budget.id!, budgets[index+1].id)
    }

    const getIcon = (iconName: string) => {
        const IconComponent = (Icons as { [index: string]: any })[iconName];
        if (IconComponent) {
            return IconComponent;
        }
        return null;
    };

    function sortBudgetsByActive(a: Budget, b: Budget): number {
        if (isBudgetActive(a, new Date()) && !isBudgetActive(b, new Date())) {
            return -1;
        } else if (!isBudgetActive(a, new Date()) && isBudgetActive(b, new Date())) {
            return 1;
        }
        return 0
    }

    return (
        <div>
            {(totalBudgetsTime !== 7 * 24 * 60 * 60) && (
                <Alert className="mb-4 border-amber-300 bg-amber-50">
                    <MessageCircleWarningIcon className="h-4 w-4"/>
                    <AlertTitle>Budgets time issue</AlertTitle>
                    <AlertDescription>
                        <p>The sum of time in your budgets does not match the total time available in a week (168 hours).</p>
                    </AlertDescription>
                </Alert>
            )}

            {!isLoading && budgets.length === 0 && (
                <div className="mb-4 p-6 border rounded text-center">
                    <p className="mb-2">You don't have any budgets yet.</p>
                    <Button onClick={() => setWizardOpen(true)}>Open budget wizard</Button>
                </div>
            )}

            <div className="rounded-md border overflow-hidden shadow-sm">
                <Table className="w-full border-collapse">
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="w-60"></TableHead>
                            <TableHead>Weekly</TableHead>
                            <TableHead>Daily</TableHead>
                            <TableHead>Events per week</TableHead>
                            <TableHead className="flex justify-end items-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger><MenuIcon className="size-4"/></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuCheckboxItem checked={showInactive} onCheckedChange={setShowInactive}>
                                            Show inactive
                                        </DropdownMenuCheckboxItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {budgets.sort(sortBudgetsByActive).map((budget) => (
                            <TableRow key={budget.id} className={!isBudgetActive(budget, new Date()) ? 'text-gray-500' : ''}>
                                <TableCell className="cursor-pointer font-medium hover:text-blue-500 flex gap-2"
                                           onClick={() => {
                                               editBudget(budget)
                                           }}>
                                    {budget.icon && createElement(getIcon(budget.icon), {className: "size-5 text-gray-500"})}
                                    {!budget.icon && <Square2StackIcon className="size-5 text-gray-500" /> }
                                    {budget.name}
                                </TableCell>
                                <TableCell>{formatSecondsToDuration(budget.weeklyTime)}</TableCell>
                                <TableCell>{formatSecondsToDuration(budget.weeklyTime / 7)}</TableCell>
                                <TableCell>{budget.weeklyOccurrences !== 0 ? budget.weeklyOccurrences : (
                                    <Badge variant="outline" className="text-gray-500">undefined</Badge>)}</TableCell>
                                <TableCell className="flex justify-end items-center">
                                    {isBudgetActive(budget, new Date()) &&
                                        <div className="flex gap-1">
                                            {!isFirstOnTheList(budget) &&
                                                <Button type="button" variant="outline" size="icon" className="h-[30px]" onClick={() => {moveUp(budget)}}>
                                                    <ChevronUpIcon className="size-4"/>
                                                </Button>
                                            }
                                            {!isLastActiveOnTheList(budget) &&
                                                <Button type="button" variant="outline" size="icon" className="h-[30px]" onClick={() => {moveDown(budget)}}>
                                                    <ChevronDownIcon className="size-4"/>
                                                </Button>
                                            }
                                        </div>
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="text-muted-foreground">
                            <TableCell className="text-center cursor-pointer hover:text-blue-500" onClick={addNewBudget}>
                                <div className="flex items-center gap-2">
                                    <PlusIcon className="size-4"/>
                                    <span>Add new budget</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{formatSecondsToDuration(totalBudgetsTime)}</span>
                                    {(totalBudgetsTime === 7 * 24 * 60 * 60) && (
                                        <CheckCircleIcon className="size-4 text-green-500"/>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{formatSecondsToDuration(totalBudgetsTime / 7)}</span>
                                    {(totalBudgetsTime === 7 * 24 * 60 * 60) && (
                                        <CheckCircleIcon className="size-4 text-green-500"/>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <AddBudgetDialog
                budget={editedBudget} open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen} onSave={onBudgetSave} onDelete={onBudgetDelete}
                totalBudgetsTime={totalBudgetsTime}/>

            <BudgetWizardDialog open={wizardOpen} onOpenChange={setWizardOpen} />
        </div>
    )
}

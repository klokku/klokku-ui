import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowUpRightIcon, FolderIcon} from "lucide-react";

type Props = {
    onOpenWizard: () => void
    onAddBudgetItem?: () => void
}

export function EmptyBudget({onOpenWizard, onAddBudgetItem}: Props) {
    return (
        <Empty className="mb-4 border rounded text-center">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <FolderIcon/>
                </EmptyMedia>
                <EmptyTitle>No Budget Items Yet</EmptyTitle>
                <EmptyDescription>
                    {onAddBudgetItem && (
                        <span>
                            Get started by creating first budget or use budget wizard to go through the process step by step.
                        </span>
                    )}
                    {!onAddBudgetItem && (
                        <span>
                            Use budget wizard to go create your first budget plan step by step.
                        </span>
                    )}

                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <div className="flex gap-2">
                    {onAddBudgetItem && (
                        <Button variant="outline" onClick={onAddBudgetItem}>Create Budget</Button>
                    )}
                    <Button onClick={onOpenWizard}>Start Wizard</Button>
                </div>
            </EmptyContent>
            <Button
                variant="link"
                asChild
                className="text-muted-foreground"
                size="sm"
            >
                <a href="https://klokku.com/docs/getting-started/first-steps/" target="_blank">
                    Learn More <ArrowUpRightIcon/>
                </a>
            </Button>
        </Empty>
    )
}

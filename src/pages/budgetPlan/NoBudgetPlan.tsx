import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowUpRightIcon, FolderIcon} from "lucide-react";

type Props = {
    onOpenWizard: () => void
    onCreateEmptyBudgetPlan?: () => void
}

export function NoBudgetPlan({onOpenWizard, onCreateEmptyBudgetPlan}: Props) {
    return (
        <Empty className="mb-4 border rounded text-center">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <FolderIcon/>
                </EmptyMedia>
                <EmptyTitle>No Budget Plan Yet</EmptyTitle>
                <EmptyDescription>
                    {onCreateEmptyBudgetPlan && (
                        <span>
                            It's time to create your first Budget Plan.<br /><br />
                            Create new empty Budget Plan or use budget plan wizard to go through the process step by step.
                        </span>
                    )}
                    {!onCreateEmptyBudgetPlan && (
                        <span>
                            Use budget plan wizard to go create your first budget plan step by step.
                        </span>
                    )}

                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <div className="flex gap-2">
                    {onCreateEmptyBudgetPlan && (
                        <Button variant="outline" onClick={onCreateEmptyBudgetPlan}>Create Empty Plan</Button>
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

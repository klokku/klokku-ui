import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {BudgetStats} from "@/api/types.ts";
import {Button} from "@/components/ui/button.tsx";
import {userSettings} from "@/components/settings.ts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {Badge} from "@/components/ui/badge.tsx";
import useClickUp from "@/api/useClickUp.ts";
import {useState, useEffect} from "react";
import {ClickUpTask} from "@/api/types.ts";
import {Loader2, ExternalLink} from "lucide-react";

type Props = {
    budgetStats: BudgetStats,
    periodStart: Date,
    periodEnd: Date,
    open: boolean,
    onOpenChange: (open: boolean) => void;
}

export default function BudgetDetailsDialog({budgetStats, periodStart, periodEnd, open, onOpenChange}: Props) {

    const {getTasks} = useClickUp();
    const [tasks, setTasks] = useState<ClickUpTask[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && budgetStats.budget.id) {
            fetchTasks();
        }
    }, [open, budgetStats.budget.id]);

    const fetchTasks = async () => {
        if (!budgetStats.budget.id) return;

        setIsLoadingTasks(true);
        setError(null);
        try {
            const fetchedTasks = await getTasks(budgetStats.budget.id);
            setTasks(fetchedTasks);
        } catch (err) {
            setError("Failed to load tasks from ClickUp");
            console.error("Error fetching tasks:", err);
        } finally {
            setIsLoadingTasks(false);
        }
    };

    const openTaskInClickUp = (taskId: string) => {
        window.open(`https://app.clickup.com/t/${taskId}`, '_blank');
    };

    const totalEstimatedTime = tasks.reduce((sum, task) => sum + task.timeEstimateSec, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <span>
                            {budgetStats.budget.name}
                        </span>
                        <Badge variant="outline" className="opacity-80">
                            {formatSecondsToDuration(budgetStats.budgetOverride?.weeklyTime || budgetStats.budget.weeklyTime)}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Week from {periodStart.toLocaleDateString(userSettings.locale)} to {periodEnd.toLocaleDateString(userSettings.locale)}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">ClickUp Tasks</h3>
                            {!isLoadingTasks && !error && tasks.length > 0 && (
                                <Badge variant="secondary">
                                    Total: {formatSecondsToDuration(totalEstimatedTime)}
                                </Badge>
                            )}
                        </div>
                        {isLoadingTasks && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading tasks...
                            </div>
                        )}
                        {error && (
                            <div className="text-sm text-destructive">
                                {error}
                            </div>
                        )}
                        {!isLoadingTasks && !error && tasks.length === 0 && (
                            <div className="text-sm text-muted-foreground">
                                No tasks found for this budget.
                            </div>
                        )}
                        {!isLoadingTasks && !error && tasks.length > 0 && (
                            <div className="space-y-2">
                                {tasks.map((task) => (
                                    <div key={task.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium flex-1">{task.name}</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 flex-shrink-0"
                                                onClick={() => openTaskInClickUp(task.id)}
                                                title="Open in ClickUp"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </Button>
                                            <Badge variant="outline" className="flex-shrink-0">
                                                {formatSecondsToDuration(task.timeEstimateSec)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

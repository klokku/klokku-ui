import useClickUp from "@/api/useClickUp.ts";
import {useEffect, useState} from "react";
import {ClickUpTask} from "@/api/types.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {ExternalLink, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";

type Props = {
    budgetItemId: number;
}

export function ClickupTasksList({budgetItemId}: Props) {
    const {isAuthenticated, getTasks} = useClickUp();

    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tasks, setTasks] = useState<ClickUpTask[]>([]);


    useEffect(() => {
        if (budgetItemId) {
            fetchTasks();
        }
    }, [budgetItemId]);


    const fetchTasks = async () => {
        if (!budgetItemId) return;

        setIsLoadingTasks(true);
        setError(null);
        try {
            const fetchedTasks = await getTasks(budgetItemId);
            setTasks(fetchedTasks);
        } catch (err) {
            setError("Failed to load tasks from ClickUp");
            console.error("Error fetching tasks:", err);
        } finally {
            setIsLoadingTasks(false);
        }
    };

    const totalEstimatedTime = tasks.reduce((sum, task) => sum + task.timeEstimateSec, 0);

    const openTaskInClickUp = (taskId: string) => {
        window.open(`https://app.clickup.com/t/${taskId}`, '_blank');
    };

    if (!isAuthenticated) {
        return (
            <div className="text-sm text-muted-foreground">
                No external tasks integration configured. <br />
                Go to user settings to configure it.
            </div>
        )
    }

    return (
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
                                    className="h-6 w-6 p-0 shrink-0"
                                    onClick={() => openTaskInClickUp(task.id)}
                                    title="Open in ClickUp"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                                <Badge variant="outline" className="shrink-0">
                                    {formatSecondsToDuration(task.timeEstimateSec)}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )


}

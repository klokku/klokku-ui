import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import {WeeklyPlanItem} from "@/api/types.ts";
import {Button} from "@/components/ui/button.tsx";
import {userSettings} from "@/components/settings.ts";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {ClickupTasksList} from "@/pages/planning/ClickupTasksList.tsx";

type Props = {
    weeklyPlanItem: WeeklyPlanItem,
    periodStart: Date,
    periodEnd: Date,
    open: boolean,
    onOpenChange: (open: boolean) => void;
}

export default function WeeklyItemDetailsDialog({weeklyPlanItem, periodStart, periodEnd, open, onOpenChange}: Props) {

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <span>
                            {weeklyPlanItem.name}
                        </span>
                        <Badge variant="outline" className="opacity-80">
                            {formatSecondsToDuration(weeklyPlanItem.weeklyDuration)}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Week from {periodStart.toLocaleDateString(userSettings.locale)} to {periodEnd.toLocaleDateString(userSettings.locale)}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <ClickupTasksList budgetItemId={weeklyPlanItem.budgetItemId} />
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

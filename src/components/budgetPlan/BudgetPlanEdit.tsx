import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useState} from "react";

interface Props {
    action: "rename" | "create" | "duplicate";
    planName?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (name: string) => void;
}

export function BudgetPlanEdit({action, planName, open, onOpenChange, onSave}: Props) {

    const [planNameState, setPlanName] = useState(
        action === "rename" ? planName || "" :
        action === "duplicate" ? `${planName || ""} (copy)` :
        ""
    );

    const save = () => {
        onSave(planNameState);
    }

    const cancel = () => {
        onOpenChange(false);
    }

    const title = action === "create" ? "Create New Budget Plan" :
                  action === "duplicate" ? "Duplicate Plan" :
                  "Rename Budget Plan";

    const buttonLabel = action === "create" ? "Create Plan" :
                        action === "duplicate" ? "Duplicate Plan" :
                        "Save changes";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                            id="name"
                            value={planNameState}
                            onChange={(e) => setPlanName(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g. Summer 2024"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={cancel}>Cancel</Button>
                    <Button onClick={save}>
                        {buttonLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

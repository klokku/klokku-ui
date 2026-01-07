import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useState} from "react";

interface Props {
    action: "rename" | "create";
    planName?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (name: string) => void;
}

export function BudgetPlanEdit({action, planName, open, onOpenChange, onSave}: Props) {

    const [planNameState, setPlanName] = useState(action === "rename" ? planName || "" : "");

    const save = () => {
        onSave(planNameState);
    }

    const cancel = () => {
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{action === "create" ? "Create New Budget Plan" : "Rename Budget Plan"}</DialogTitle>
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
                        {action === "create" ? "Create Plan" : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

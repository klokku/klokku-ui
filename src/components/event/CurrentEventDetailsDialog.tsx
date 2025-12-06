import {DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Dialog, DialogDescription} from "@radix-ui/react-dialog";
import {Event} from "@/api/types.ts";
import {Button} from "@/components/ui/button.tsx";
import {Trash2Icon} from "lucide-react";
import {CurrentEventDetailsForm} from "@/components/event/CurrentEventDetailsForm.tsx";


interface EventDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (event: Event) => void;
    onDelete?: (event: Event) => void;
    event: Event;
}

export function CurrentEventDetailsDialog({open, onOpenChange, event, onSave, onDelete}: EventDetailsDialogProps) {

    const isCurrent = () => {
        return !event.endTime
    }

    const onDeleteButton = () => {
        onDelete?.(event)
    }

    const onDialogOpenClose = (open: boolean) => {
        onOpenChange(open)
    }

    const onFormSubmit = (formData: Event) => {
        onSave(formData)
        onDialogOpenClose(false)
    }

    return (
        <Dialog open={open} onOpenChange={onDialogOpenClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{event.budget.name}</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <CurrentEventDetailsForm formId="edit-event-form" event={event} onSubmit={onFormSubmit}/>
                <DialogFooter>
                    {!isCurrent() &&
                        <Button variant="destructive" onSelect={onDeleteButton}><Trash2Icon/>Delete</Button>
                    }
                    <Button form="edit-event-form" type="submit">Update</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

import {DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Dialog, DialogDescription} from "@radix-ui/react-dialog";
import {CurrentEvent} from "@/api/types.ts";
import {Button} from "@/components/ui/button.tsx";
import {CurrentEventDetailsForm} from "@/components/event/CurrentEventDetailsForm.tsx";


interface EventDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (event: CurrentEvent) => void;
    event: CurrentEvent;
}

export function CurrentEventDetailsDialog({open, onOpenChange, event, onSave}: EventDetailsDialogProps) {

    const onDialogOpenClose = (open: boolean) => {
        onOpenChange(open)
    }

    const onFormSubmit = (formData: CurrentEvent) => {
        onSave(formData)
        onDialogOpenClose(false)
    }

    return (
        <Dialog open={open} onOpenChange={onDialogOpenClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{event.planItem.name}</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <CurrentEventDetailsForm formId="edit-event-form" event={event} onSubmit={onFormSubmit}/>
                <DialogFooter>
                    <Button form="edit-event-form" type="submit">Update</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

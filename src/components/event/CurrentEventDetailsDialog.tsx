import {DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Dialog, DialogDescription} from "@radix-ui/react-dialog";
import {CurrentEvent} from "@/api/types.ts";
import {Button} from "@/components/ui/button.tsx";
import {CurrentEventDetailsForm} from "@/components/event/CurrentEventDetailsForm.tsx";
import {useState} from "react";


interface EventDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (event: CurrentEvent) => Promise<void>;
    event: CurrentEvent;
    timezone?: string;
}

export function CurrentEventDetailsDialog({open, onOpenChange, event, onSave, timezone}: EventDetailsDialogProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>();

    const onDialogOpenClose = (open: boolean) => {
        onOpenChange(open)
    }

    const onFormSubmit = async (formData: CurrentEvent) => {
        setSaving(true)
        setError(undefined);
        try {
            await onSave(formData)
            onDialogOpenClose(false)
        } catch (error) {
            setError(`Could not update this activity. ${error instanceof Error ? error.message : "Please try again."}`);
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onDialogOpenClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{event.planItem.name}</DialogTitle>
                    <DialogDescription>Update the start time and notes for your running activity.</DialogDescription>
                </DialogHeader>
                <fieldset disabled={saving}>
                    <CurrentEventDetailsForm formId="edit-event-form" event={event} onSubmit={onFormSubmit} timezone={timezone}/>
                </fieldset>
                {error && <p role="alert" className="text-sm">{error}</p>}
                <DialogFooter>
                    <Button form="edit-event-form" type="submit" disabled={saving}>{saving ? "Updating..." : "Update"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

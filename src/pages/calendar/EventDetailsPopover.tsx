import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {DateTimePicker} from "@/components/datetime/DateTimePicker.tsx";
import useWeeklyPlan from "@/api/useWeeklyPlan.ts";
import {EventDetails} from "@/pages/calendar/eventDetails.ts";
import {OptionalNotesField} from "@/components/event/OptionalNotesField.tsx";
import {useState} from "react";
import {useConnectionBlocked} from "@/components/pwa/connectionContext";

const eventDetailsSchema = z.object({
    startDate: z.date(),
    endDate: z.date(),
    budgetPlanItemId: z.number(),
    notes: z.string(),
}).refine((data) =>
        data.startDate.getTime() < data.endDate.getTime(),
    {
        message: "End date must be after start date",
        path: ["endDate"],
    }
).refine((data) =>
        data.budgetPlanItemId !== 0,
    {
        message: "Budget must be selected",
        path: ["budgetId"],
    }
)

type EventDetailsForm = z.infer<typeof eventDetailsSchema>;

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    position: { x: number, y: number } | null;
    input: EventDetails;
    onSave: (event: EventDetails) => void | Promise<void>;
    onDelete: (eventUid: string) => void | Promise<void>;
    returnFocus?: () => void;
    timezone?: string;
}

export function EventDetailsPopover({open, onOpenChange, position, input, onSave, onDelete, returnFocus, timezone}: Props) {
    const connectionBlocked = useConnectionBlocked();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>();

    // Budgets for re-linking
    const {weeklyPlan} = useWeeklyPlan(input.startDate, {timezone});
    const planItems = weeklyPlan?.items
    const form = useForm<EventDetailsForm>({
        resolver: zodResolver(eventDetailsSchema),
        mode: "onChange",
        defaultValues: {
            startDate: input.startDate,
            endDate: input.endDate,
            budgetPlanItemId: input.budgetPlanItemId || 0,
            notes: input.notes ?? "",
        }
    })

    const isCreateMode = () => {
        return input.uid == null;
    }

    const handleSave = async (formData: z.infer<typeof eventDetailsSchema>) => {
        const itemName = input.uid && formData.budgetPlanItemId === input.budgetPlanItemId
            ? input.summary ?? "Event"
            : planItems?.find((b) => b.budgetItemId === formData.budgetPlanItemId)?.name ?? "Event";
        setSaving(true);
        setError(undefined);
        try {
            await onSave({
                startDate: formData.startDate,
                endDate: formData.endDate,
                budgetPlanItemId: formData.budgetPlanItemId,
                uid: input.uid,
                summary: itemName,
                notes: formData.notes,
            });
        } catch { setError("Could not save this event. Please try again."); }
        finally { setSaving(false); }
    }

    const handleDelete = async () => {
        setSaving(true);
        setError(undefined);
        try { await onDelete(input.uid!); }
        catch { setError("Could not delete this event. Please try again."); }
        finally { setSaving(false); }
    };

    // Extract formState properties to ensure proper subscription
    const { isDirty, isValid } = form.formState;

    return (

        <Popover
            open={open}
            onOpenChange={nextOpen => { if (nextOpen || !connectionBlocked) onOpenChange(nextOpen); }}
            key={input.uid || 'new-event'}
        >
            <PopoverTrigger asChild>
                <div
                    aria-hidden
                    style={{
                        position: 'fixed',
                        left: position ? `${position.x}px` : '-1000px',
                        top: position ? `${position.y}px` : '-1000px',
                        width: 1,
                        height: 1,
                        opacity: 0,
                        pointerEvents: 'none',
                    }}
                />
            </PopoverTrigger>
            <PopoverContent className="w-[360px] max-w-[calc(100vw-2rem)] p-4" align="start" aria-label={isCreateMode() ? "Create calendar event" : `Edit ${input.summary} event`}
                            onInteractOutside={event => { if (connectionBlocked) event.preventDefault(); }}
                            onCloseAutoFocus={event => { if (returnFocus) { event.preventDefault(); returnFocus(); } }}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6 calendar-unselect-cancel">
                        <fieldset disabled={saving} className="space-y-3 calendar-unselect-cancel">
                            <div className="text-sm font-medium">{isCreateMode() ? 'Create event' : input.summary}</div>
                            <FormField control={form.control} name="startDate" render={({field}) => {
                                return (
                                    <FormItem className="grid gap-2">
                                        <FormLabel className="text-xs text-muted-foreground">Start</FormLabel>
                                        <DateTimePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            timezone={timezone}
                                            label="Start"
                                        />
                                    </FormItem>
                                )
                            }}/>
                            <FormField control={form.control} name="endDate" render={({field}) => {
                                return (
                                    <FormItem className="grid gap-2">
                                        <FormLabel className="text-xs text-muted-foreground">End</FormLabel>
                                        <DateTimePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            timezone={timezone}
                                            label="End"
                                        />
                                        {form.formState.errors.endDate && (
                                            <div className="text-xs text-red-500">
                                                {form.formState.errors.endDate.message}
                                            </div>
                                        )}
                                    </FormItem>
                                )
                            }}/>
                            <FormField control={form.control} name="budgetPlanItemId" render={({field}) => {
                                return (
                                    <FormItem className="grid gap-2">
                                        <FormLabel className="text-xs text-muted-foreground">Plan item</FormLabel>
                                        <Select
                                            value={field.value?.toString()}
                                            onValueChange={(value) => {
                                                field.onChange(Number(value))
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select item"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {planItems?.map((item) => (
                                                    <SelectItem key={`plan-item-${item.budgetItemId}`} value={String(item.budgetItemId!)} className="calendar-unselect-cancel">
                                                        {item.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {form.formState.errors.budgetPlanItemId && (
                                            <div className="text-xs text-red-500">
                                                {form.formState.errors.budgetPlanItemId.message}
                                            </div>
                                        )}
                                    </FormItem>
                                )
                            }}/>
                            <FormField control={form.control} name="notes" render={({field}) => (
                                <OptionalNotesField value={field.value} onChange={field.onChange}/>
                            )}/>
                            {error && <p role="alert" className="text-sm">{error}</p>}
                            <div className="flex justify-between pt-2">
                                {!isCreateMode() ? (
                                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={saving}>
                                        Delete
                                    </Button>
                                ) : (
                                    <span/>
                                )}
                                <div className="space-x-2">
                                    <Button type="reset" variant="outline" onClick={() => onOpenChange(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={saving || (isCreateMode() ? !isValid : (!isDirty || !isValid))}>
                                        {saving ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </fieldset>
                    </form>
                </Form>
            </PopoverContent>
        </Popover>
    )
}

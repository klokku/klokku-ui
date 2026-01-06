import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {DateTimePicker} from "@/components/datetime/DateTimePicker.tsx";
import useWeeklyPlan from "@/api/useWeeklyPlan.ts";

const eventDetailsSchema = z.object({
    startDate: z.date(),
    endDate: z.date(),
    budgetPlanItemId: z.number(),
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

export type EventDetails = {
    uid?: string;
    summary?: string;
    startDate: Date;
    endDate: Date;
    budgetPlanItemId?: number;
}

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    position: { x: number, y: number } | null;
    input: EventDetails;
    onSave: (event: EventDetails) => void;
    onDelete: (eventUid: string) => void;
}

export function EventDetailsPopover({open, onOpenChange, position, input, onSave, onDelete}: Props) {

    // Budgets for re-linking
    const {weeklyPlan} = useWeeklyPlan(input.startDate);
    const planItems = weeklyPlan?.items

    const form = useForm<EventDetailsForm>({
        resolver: zodResolver(eventDetailsSchema),
        defaultValues: {
            startDate: input.startDate,
            endDate: input.endDate,
            budgetPlanItemId: input.budgetPlanItemId || 0,
        }
    })

    const isCreateMode = () => {
        return input.uid == null;
    }

    const handleSave = async (formData: z.infer<typeof eventDetailsSchema>) => {
        const itemName = planItems?.find((b) => b.budgetItemId === formData.budgetPlanItemId)?.name ?? 'Event';
        onSave({
            startDate: formData.startDate,
            endDate: formData.endDate,
            budgetPlanItemId: formData.budgetPlanItemId,
            uid: input.uid,
            summary: itemName,
        })
    }

    return (

        <Popover
            open={open}
            onOpenChange={onOpenChange}
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
            <PopoverContent className="w-[360px] p-4" align="start">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6 calendar-unselect-cancel">
                        <div className="space-y-3 calendar-unselect-cancel">
                            <div className="text-sm font-medium">{isCreateMode() ? 'Create event' : input.summary}</div>
                            <FormField control={form.control} name="startDate" render={({field}) => {
                                return (
                                    <FormItem className="grid gap-2">
                                        <FormLabel className="text-xs text-muted-foreground">Start</FormLabel>
                                        <DateTimePicker
                                            value={field.value}
                                            onChange={field.onChange}
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
                            <div className="flex justify-between pt-2">
                                {!isCreateMode() ? (
                                    <Button type="button" variant="destructive" onClick={() => onDelete(input.uid!)}>
                                        Delete
                                    </Button>
                                ) : (
                                    <span/>
                                )}
                                <div className="space-x-2">
                                    <Button type="reset" variant="outline" onClick={() => onOpenChange(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={!form.formState.isDirty && !form.formState.isValid}>
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </PopoverContent>
        </Popover>
    )
}

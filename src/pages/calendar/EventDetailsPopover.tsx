import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {DateTimePicker} from "@/components/ui/datetime-picker.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import useBudget from "@/api/useBudgets.ts";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {userSettings} from "@/components/settings.ts";

const eventDetailsSchema = z.object({
    startDate: z.date(),
    endDate: z.date(),
    budgetId: z.number(),
}).refine((data) =>
        data.startDate.getTime() < data.endDate.getTime(),
    {
        message: "End date must be after start date",
        path: ["endDate"],
    }
).refine((data) =>
        data.budgetId !== 0,
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
    budgetId?: number;
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
    const {budgets} = useBudget(false);

    const form = useForm<EventDetailsForm>({
        resolver: zodResolver(eventDetailsSchema),
        defaultValues: {
            startDate: input.startDate,
            endDate: input.endDate,
            budgetId: input.budgetId || 0,
        }
    })

    const isCreateMode = () => {
        return input.uid == null;
    }

    const handleSave = async (formData: z.infer<typeof eventDetailsSchema>) => {
        const budgetName = budgets?.find((b) => b.id === formData.budgetId)?.name ?? 'Event';
        onSave({
            startDate: formData.startDate,
            endDate: formData.endDate,
            budgetId: formData.budgetId,
            uid: input.uid,
            summary: budgetName,
        })
    }

    return (

        <Popover
            open={open}
            onOpenChange={onOpenChange}
        >
            <PopoverTrigger asChild>
                <button
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
                                            granularity="minute"
                                            hourCycle={24}
                                            className="calendar-unselect-cancel"
                                            locale={{code: userSettings.locale}}
                                            weekStartsOn={userSettings.locale === "sunday" ? 0 : 1}
                                            showWeekNumber={false}
                                            showOutsideDays={true}
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
                                            granularity="minute"
                                            hourCycle={24}
                                            className="calendar-unselect-cancel"
                                            locale={{code: userSettings.locale}}
                                            weekStartsOn={userSettings.locale === "sunday" ? 0 : 1}
                                            showWeekNumber={false}
                                            showOutsideDays={true}
                                        />
                                        {form.formState.errors.endDate && (
                                            <div className="text-xs text-red-500">
                                                {form.formState.errors.endDate.message}
                                            </div>
                                        )}
                                    </FormItem>
                                )
                            }}/>
                            <FormField control={form.control} name="budgetId" render={({field}) => {
                                return (
                                    <FormItem className="grid gap-2">
                                        <FormLabel className="text-xs text-muted-foreground">Budget</FormLabel>
                                        <Select
                                            value={field.value?.toString()}
                                            onValueChange={(value) => {
                                                field.onChange(Number(value))
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select budget"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {budgets?.map((b) => (
                                                    <SelectItem key={b.id} value={String(b.id!)} className="calendar-unselect-cancel">
                                                        {b.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {form.formState.errors.budgetId && (
                                            <div className="text-xs text-red-500">
                                                {form.formState.errors.budgetId.message}
                                            </div>
                                        )}
                                    </FormItem>
                                )
                            }}/>
                            <div className="flex justify-between pt-2">
                                {!isCreateMode() ? (
                                    <Button variant="destructive" onClick={() => onDelete(input.uid!)}>
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

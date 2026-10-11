import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {z} from "zod";
import {CurrentEvent} from "@/api/types.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {DateTimePicker} from "@/components/datetime/DateTimePicker.tsx";
import {OptionalNotesField} from "@/components/event/OptionalNotesField.tsx";

const formSchema = z.object({
    startTime: z.date(),
    notes: z.string(),
})

interface EventDetailsFormProps {
    formId: string;
    event: CurrentEvent;
    onSubmit: (event: CurrentEvent) => void | Promise<void>;
    timezone?: string;
}

export function CurrentEventDetailsForm({formId, event, onSubmit, timezone}: EventDetailsFormProps) {
    const onFormSubmit = async (formData: z.infer<typeof formSchema>) => {
        const eventToSave: CurrentEvent = {
            startTime: formData.startTime.toISOString(),
            planItem: event.planItem,
            notes: formData.notes,
        }
        await onSubmit(eventToSave)
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startTime: new Date(event.startTime),
            notes: event.notes ?? "",
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} id={formId} className="space-y-4">
                <FormField control={form.control} name="startTime" render={({field}) => (
                    <FormItem>
                        <FormLabel>Start time</FormLabel>
                        <FormControl>
                            <div>
                                <DateTimePicker value={field.value} onChange={field.onChange} timezone={timezone} label="Start"/>
                            </div>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
                <FormField control={form.control} name="notes" render={({field}) => (
                    <OptionalNotesField layout="inline" value={field.value} onChange={field.onChange}/>
                )}/>
            </form>
        </Form>
    )
}

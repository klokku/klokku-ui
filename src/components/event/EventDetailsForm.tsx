import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {TimePicker} from "@/components/ui/datetime-picker.tsx";
import {z} from "zod";
import {Event} from "@/api/types.ts";
import {toServerFormat} from "@/lib/dateUtils.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

const formSchema = z.object({
    startTime: z.date(),
    endTime: z.date().optional(),
})

interface EventDetailsFormProps {
    formId: string;
    event: Event;
    onSubmit: (event: Event) => void;
    onDelete?: (event: Event) => void;
}

export function EventDetailsForm({formId, event, onSubmit}: EventDetailsFormProps) {

    const onFormSubmit = (formData: z.infer<typeof formSchema>) => {
        const eventToSave: Event = {
            id: event.id,
            startTime: toServerFormat(formData.startTime),
            endTime: formData.endTime ? toServerFormat(formData.endTime) : undefined,
            budget: event.budget,
            notes: event.notes,
        }
        onSubmit(eventToSave)
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startTime: new Date(event.startTime),
            endTime: event.endTime ? new Date(event.endTime) : undefined,
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} id={formId}>
                    <FormField control={form.control} name="startTime" render={({field}) => (
                        <FormItem className="flex items-center">
                            <FormLabel className="w-44">Start time</FormLabel>
                            <FormControl className="w-full">
                                <TimePicker date={new Date(field.value)} onChange={(date) => form.setValue(field.name, date!!)}
                                            hourCycle={24} granularity="minute"/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    {form.getValues().endTime &&
                        <FormField control={form.control} name="endTime" render={({field}) => (
                            <FormItem className="flex items-center">
                                <FormLabel className="w-44">End time</FormLabel>
                                <FormControl className="w-full">
                                    <TimePicker date={new Date(field.value!!)} onChange={(date) => form.setValue(field.name, date!!)}
                                                hourCycle={24} granularity="minute"/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                    }
            </form>
        </Form>
    )
}

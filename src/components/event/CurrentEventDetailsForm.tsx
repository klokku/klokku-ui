import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {z} from "zod";
import {CurrentEvent} from "@/api/types.ts";
import {toServerFormat} from "@/lib/dateUtils.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {TimePicker} from "@/components/datetime/TimePicker.tsx";
import {ClockIcon} from "lucide-react";

const formSchema = z.object({
    startTime: z.date(),
})

interface EventDetailsFormProps {
    formId: string;
    event: CurrentEvent;
    onSubmit: (event: CurrentEvent) => void;
}

export function CurrentEventDetailsForm({formId, event, onSubmit}: EventDetailsFormProps) {

    const onFormSubmit = (formData: z.infer<typeof formSchema>) => {
        const eventToSave: CurrentEvent = {
            startTime: toServerFormat(formData.startTime),
            planItem: event.planItem,
        }
        onSubmit(eventToSave)
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startTime: new Date(event.startTime),
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} id={formId}>
                <FormField control={form.control} name="startTime" render={({field}) => (
                    <FormItem className="flex items-center">
                        <FormLabel className="w-44">Start time</FormLabel>
                        <FormControl>
                            <div className="flex gap-5 items-center">
                                <ClockIcon/>
                                <TimePicker
                                    hours={new Date(field.value).getHours()}
                                    minutes={new Date(field.value).getMinutes()}
                                    onChange={(hours, minutes) => {
                                        const newDate = new Date(field.value)
                                        newDate.setHours(hours)
                                        newDate.setMinutes(minutes)
                                        form.setValue(field.name, newDate)
                                    }}
                                />
                            </div>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
            </form>
        </Form>
    )
}

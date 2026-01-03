import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {BudgetPlanItem} from "@/api/types.ts";
import {durationToSeconds, formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {XIcon} from "lucide-react";
import {IconPickerCommandPalette} from "@/components/budgetPlanItem/IconPickerCommandPalette.tsx";
import {ColorPicker} from "@/components/budgetPlanItem/ColorPicker.tsx";

const formSchema = z.object({
    name: z.string(),
    weeklyDuration: z.string().regex(/^(\d{1,3}h)?\s*(\d{1,2}m)?$/, {
        message: "Invalid duration format",
    }),
    weeklyOccurrences: z.coerce.number().gte(0, "cannot be negative").optional(),
    icon: z.string(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

interface BudgetFormProps {
    formId: string;
    item: BudgetPlanItem | null,
    onSubmit: (item: BudgetPlanItem) => void;
}

export function BudgetPlanItemDetailsForm({formId, item, onSubmit}: BudgetFormProps) {

    const _onSubmit = (formData: z.infer<typeof formSchema>) => {
        const itemToSubmit: BudgetPlanItem = {
            id: item?.id,
            name: formData.name,
            weeklyDuration: durationToSeconds(formData.weeklyDuration) ?? 0,
            weeklyOccurrences: formData.weeklyOccurrences ?? 0,
            icon: formData.icon ?? "",
            color: formData.color ?? "",
        }
        onSubmit(itemToSubmit)
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: item?.name,
            weeklyDuration: formatSecondsToDuration(item?.weeklyDuration),
            weeklyOccurrences: item?.weeklyOccurrences ?? 0,
            icon: item?.icon ?? "",
            color: item?.color ?? "",
        }
    });


    return (
        <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(_onSubmit)} className="flex flex-col gap-2">


                <FormField control={form.control} name="name" render={({field}) => (
                    <FormItem className="flex gap-2 items-center">
                        <FormLabel className="w-44">Name</FormLabel>
                        <FormControl className="w-full">
                            <Input placeholder="Name" {...field} />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>

                <div className="flex flex-col flex-1">
                    <FormField control={form.control} name="weeklyDuration" render={({field}) => (
                        <FormItem className="flex gap-2 items-center">
                            <FormLabel className="w-44">Weekly duration</FormLabel>
                            <FormControl className="w-full">
                                <Input placeholder="e.g. 4h30m" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                </div>
                <div className="flex flex-col flex-1">
                    <FormField control={form.control} name="icon" render={({field}) => (
                        <FormItem className="flex gap-2 items-center">
                            <FormLabel className="w-44">Icon</FormLabel>
                            <FormControl className="w-full">
                                <div className="relative w-full">
                                    <IconPickerCommandPalette value={field.value} onChanged={(iconName) => {
                                        form.setValue(field.name, iconName)
                                    }}/>
                                </div>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                </div>
                <div className="flex flex-col flex-1">
                    <FormField control={form.control} name="color" render={({field}) => {
                        return (
                            <FormItem className="flex gap-2 items-center">
                                <FormLabel className="w-44">Color</FormLabel>
                                <FormControl className="w-full">
                                    <div className="relative w-full">
                                        <ColorPicker
                                            key={`color-picker-${field.name}`}
                                            color={field.value ?? ""}
                                            onChange={(color) => {
                                                form.setValue(field.name, color)
                                            }}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        );
                    }}/>
                </div>

                <div className="flex flex-col flex-1">
                    <FormField control={form.control} name="weeklyOccurrences" render={({field}) => (
                        <FormItem className="flex gap-2 items-center">
                            <FormLabel className="w-44">Weekly occurrences</FormLabel>
                            <FormControl className="w-full">
                                <div className="relative w-full">
                                    <Input type="number" placeholder="How many days in week (optional)" {...field}
                                           value={field.value != 0 ? field.value : ""}/>
                                    <Button type="button" variant="ghost" size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mr-8"
                                            onClick={() => {
                                                form.setValue(field.name, 0)
                                            }}>
                                        <XIcon className="h-4 w-4"/>
                                        <span className="sr-only">Clear</span>
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                </div>
            </form>
        </Form>
    )
}

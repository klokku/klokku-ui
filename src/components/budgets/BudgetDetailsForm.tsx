import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Budget} from "@/api/types.ts";
import {durationToSeconds, formatSecondsToDuration} from "@/lib/dateUtils.ts";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CalendarIcon, XIcon} from "lucide-react";
import {IconPickerCommandPalette} from "@/components/budgets/IconPickerCommandPalette.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {cn} from "@/lib/utils.ts";
import {format, formatDate} from "date-fns";
import {Calendar} from "@/components/ui/calendar.tsx";

const formSchema = z.object({
    name: z.string(),
    weeklyTime: z.string().regex(/^(\d{1,3}h)?\s*(\d{1,2}m)?$/, {
        message: "Invalid duration format",
    }),
    icon: z.string(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    weeklyOccurrences: z.coerce.number().gte(0, "cannot be negative").optional(),
})

interface BudgetFormProps {
    formId: string;
    budget: Budget | null,
    onSubmit: (budget: Budget) => void;
}

export function BudgetDetailsForm({formId, budget, onSubmit}: BudgetFormProps) {

    const _onSubmit = (formData: z.infer<typeof formSchema>) => {
        const budgetToSubmit: Budget = {
            id: budget?.id,
            name: formData.name,
            weeklyTime: durationToSeconds(formData.weeklyTime) ?? 0,
            weeklyOccurrences: formData.weeklyOccurrences ?? 0,
            startDate: formData.startDate ? formatDate(formData.startDate, "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined,
            endDate: formData.endDate ? formatDate(formData.endDate, "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined,
            icon: formData.icon ?? "",
        }
        onSubmit(budgetToSubmit)
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: budget?.name,
            weeklyTime: formatSecondsToDuration(budget?.weeklyTime),
            weeklyOccurrences: budget?.weeklyOccurrences ?? 0,
            startDate: budget?.startDate ? new Date(budget.startDate) : undefined,
            endDate: budget?.endDate ? new Date(budget.endDate) : undefined,
            icon: budget?.icon ?? "",
        }
    });

    return (
        <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(_onSubmit)}>


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
                    <FormField control={form.control} name="weeklyTime" render={({field}) => (
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
                                <div className="relative w-full my-96">
                                    <IconPickerCommandPalette value={field.value} onChanged={(iconName) => {form.setValue(field.name, iconName)}} />
                                </div>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                </div>
                <div className="flex flex-col flex-1">
                    <FormField control={form.control} name="startDate" render={({field}) => {
                        return (
                            <FormItem className="flex gap-2 items-center">
                                <FormLabel className="w-44">Start date</FormLabel>
                                <div className="relative w-full">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl className="w-full">
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] text-left font-normal relative",
                                                        field.value ? "pl-10" : "pl-3",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("2000-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {field.value && (
                                        <div
                                            className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTimeout(() => {
                                                    form.setValue("startDate", undefined);
                                                }, 0);
                                            }}
                                        >
                                            <XIcon className="h-4 w-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100" />
                                        </div>
                                    )}
                                </div>
                                <FormMessage/>
                            </FormItem>
                        );
                    }}/>
                </div>
                <div className="flex flex-col flex-1">
                    <FormField control={form.control} name="endDate" render={({field}) => (
                        <FormItem className="flex gap-2 items-center">
                            <FormLabel className="w-44">End date</FormLabel>
                            <div className="relative w-full">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl className="w-full">
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] text-left font-normal relative",
                                                    field.value ? "pl-10" : "pl-3",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => {
                                                const startDate = form.getValues("startDate");
                                                if (startDate) {
                                                    return date <= startDate
                                                } else {
                                                    return date < new Date("2000-01-01")
                                                }
                                            }}
                                            captionLayout="dropdown"
                                        />
                                    </PopoverContent>
                                </Popover>
                                {field.value && (
                                    <div
                                        className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setTimeout(() => {
                                                form.setValue("endDate", undefined);
                                            }, 0);
                                        }}
                                    >
                                        <XIcon className="h-4 w-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100" />
                                    </div>
                                )}
                            </div>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                </div>

                <div className="flex flex-col flex-1">
                    <FormField control={form.control} name="weeklyOccurrences" render={({field}) => (
                        <FormItem className="flex gap-2 items-center">
                            <FormLabel className="w-44">Weekly occurrences</FormLabel>
                            <FormControl className="w-full">
                                <div className="relative w-full my-96">
                                    <Input type="number" placeholder="How many times per week (optional)" {...field} value={field.value != 0 ? field.value : "" } />
                                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                            onClick={() => {form.setValue(field.name, 0)}}>
                                        <XIcon className="h-4 w-4" />
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

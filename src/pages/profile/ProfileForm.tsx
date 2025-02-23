import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Profile} from "@/api/types.ts";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";
import {Check, ChevronsUpDown} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

const formSchema = z.object({
    username: z.string(),
    displayName: z.string(),
    photoUrl: z.string().optional(),
    timezone: z.string(),
    weekStartDay: z.enum(['monday', 'sunday']),
})

type Props = {
    profile: Profile;
    onSave: (profile: Profile) => void;
}

export function ProfileForm({profile, onSave}: Props) {
    const timezones = Intl.supportedValuesOf('timeZone');

    const onSubmit = async (formData: z.infer<typeof formSchema>) => {
        onSave({
            username: formData.username,
            displayName: formData.displayName,
            photoUrl: formData.photoUrl || "",
            settings: {
                timezone: formData.timezone,
                weekStartDay: formData.weekStartDay,
                eventCalendarType: "",
            }
        });
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: profile?.username,
            displayName: profile?.displayName,
            photoUrl: profile?.photoUrl || "",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            weekStartDay: "monday",
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="divide-y divide-gray-200 dark:divide-gray-700 gap-6 flex flex-col">
                <div className="space-y-5">

                    <FormField control={form.control} name="displayName" render={({field}) => (
                        <FormItem>
                            <FormLabel>Display name</FormLabel>
                            <FormControl className="w-full">
                                <Input placeholder="Choose how your name will be displayed" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="username" render={({field}) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl className="w-full">
                                <Input placeholder="Unique profile name" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="timezone" render={({field}) => (
                        <FormItem>
                            <FormLabel className="block">What's your timezone?</FormLabel>
                            <FormControl className="w-full">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? timezones.find(
                                                        (timezone) => timezone === field.value
                                                    )
                                                    : "Select language"}
                                                <ChevronsUpDown className="opacity-50"/>
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Choose timezone..."
                                                className="h-9"
                                            />
                                            <CommandList>
                                                <CommandEmpty>No timezone found.</CommandEmpty>
                                                <CommandGroup>
                                                    {timezones.map((timezone) => (
                                                        <CommandItem
                                                            value={timezone}
                                                            key={timezone}
                                                            onSelect={() => {
                                                                form.setValue("timezone", timezone)
                                                            }}
                                                        >
                                                            {timezone}
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto",
                                                                    timezone === field.value
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField
                        control={form.control}
                        name="weekStartDay"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Start of the calendar week</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select first day of a week"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="monday">Monday</SelectItem>
                                        <SelectItem value="sunday">Sunday</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end">
                        <Button type="submit" disabled={!form.formState.isDirty}>
                            Save changes
                        </Button>
                    </div>

                </div>
            </form>
        </Form>
    )
}

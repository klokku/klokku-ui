import '@fontsource-variable/sour-gummy/index.css';
import HeaderLogo from "@/components/headerLogo/HeaderLogo.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Check, ChevronsUpDown} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from "@/components/ui/command"
import {cn} from "@/lib/utils.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import useProfiles from "@/api/useProfiles.ts";
import {useNavigate} from "react-router-dom";
import {paths} from "@/pages/links.ts";
import {v4 as uuidv4} from 'uuid';


const formSchema = z.object({
    username: z.string()
        .min(3, {message: "Username must be at least 3 characters long."})
        .max(30, {message: "Username cannot be longer than 30 characters."})
        .regex(/^[a-zA-Z0-9_-]+$/, {message: "Username can only contain letters, numbers, underscores and dashes."}),
    displayName: z.string(),
    photoUrl: z.string().optional(),
    timezone: z.string(),
    weekStartDay: z.enum(['monday', 'sunday']),
})

export function CreateProfilePage() {
    const timezones = Intl.supportedValuesOf('timeZone');
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            displayName: "",
            photoUrl: "",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            weekStartDay: "monday",
        }
    });

    const username = form.watch("username");
    const {createProfile, isUsernameAvailable, isCheckingUsername} = useProfiles(username);

    // Check if form can be submitted
    const canSubmit = username.length >= 3 ? isUsernameAvailable === true : true;
    const isFormValid = form.formState.isValid && canSubmit;

    const onSubmit = async (formData: z.infer<typeof formSchema>) => {
        await createProfile({
            uid: uuidv4(),
            username: formData.username,
            displayName: formData.displayName,
            photoUrl: formData.photoUrl || "",
            settings: {
                timezone: formData.timezone,
                weekStartDay: formData.weekStartDay,
                eventCalendarType: "",
            }
        });
        navigate(paths.root.path, {replace: true})
    }

    return (
        <div className="h-screen">
            <div className="w-full h-16 pl-4 flex items-center">
                <HeaderLogo className="h-8"/>
            </div>
            <div className="flex flex-col w-screen h-screen items-center justify-center">
                <div className="min-w-[400px] max-w-[600px]">
                    <h1 className="font-sour-gummy text-8xl font-light bg-linear-to-r from-[#464646] to-[#00BCD4] text-transparent bg-clip-text mb-5 text-center">
                        Hello!
                    </h1>
                    <div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

                                <FormField control={form.control} name="displayName" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>What's your name?</FormLabel>
                                        <FormControl className="w-full">
                                            <Input placeholder="Choose how your name will be displayed" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}/>

                                <FormField control={form.control} name="username" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Choose your profile name</FormLabel>
                                        <FormControl className="w-full">
                                            <Input placeholder="Unique profile name" {...field} />
                                        </FormControl>
                                        {username && username.length >= 3 && (
                                            <div className="text-sm mt-1">
                                                {isCheckingUsername ? (
                                                    <span className="text-gray-500">Checking availability...</span>
                                                ) : isUsernameAvailable ? (
                                                    <span className="text-green-600">✓ Username is available</span>
                                                ) : (
                                                    <span className="text-red-600">✗ Username is taken</span>
                                                )}
                                            </div>
                                        )}
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
                                                            <CommandEmpty>No framework found.</CommandEmpty>
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
                                            <FormLabel>Which day is your first day of a week?</FormLabel>
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

                                <Button
                                    type="submit"
                                    className="bg-[#00BCD4] h-[50px] text-md"
                                    disabled={!isFormValid || isCheckingUsername}
                                >
                                    I'm ready to start!
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}

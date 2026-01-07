import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {BudgetPlan, ClickUpWorkspace} from "@/api/types.ts";
import * as z from "zod";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import useClickUp from "@/api/useClickUp.ts";
import {Button} from "@/components/ui/button.tsx";
import {PlusCircle, Trash2} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {Spinner} from "@/components/ui/spinner.tsx";

const clickUpConfigSchema = z.object({
    workspaceId: z.string({
        required_error: "Please select a workspace",
    }),
    spaceId: z.string({
        required_error: "Please select a space",
    }),
    folderId: z.string().optional(),
    tagMappings: z.array(
        z.object({
            tagName: z.string({
                required_error: "Please select a tag",
            }),
            budgetItemId: z.number({
                required_error: "Please select a budget",
            }),
        })
    ).min(1, "Please add at least one tag mapping.")
}).refine((data) => {
    // Check for duplicate tag names
    const tagNames = data.tagMappings.map(m => m.tagName).filter(t => t !== "");
    const uniqueTagNames = new Set(tagNames);
    return tagNames.length === uniqueTagNames.size;
}, {
    message: "Each ClickUp tag can only be mapped once",
    path: ["tagMappings"]
}).refine((data) => {
    // Check for duplicate budget items
    const budgetItemIds = data.tagMappings.map(m => m.budgetItemId).filter(id => id !== 0);
    const uniqueBudgetItemIds = new Set(budgetItemIds);
    return budgetItemIds.length === uniqueBudgetItemIds.size;
}, {
    message: "Each budget item can only be mapped once",
    path: ["tagMappings"]
});

type ClickUpConfigForm = z.infer<typeof clickUpConfigSchema>;

type Props = {
    workspaces: ClickUpWorkspace[]
    budgetPlan: BudgetPlan
}

export function ClickUpConfigurationForm({workspaces, budgetPlan}: Props) {

    const {
        spaces,
        isLoadingFolders,
        folders,
        isLoadingTags,
        tags,
        isLoadingConfig,
        config,
        getSpaces,
        getFolders,
        getTags,
        saveConfig,
    } = useClickUp(budgetPlan.id!);

    const budgetItems = budgetPlan.items;

    const form = useForm<ClickUpConfigForm>({
        resolver: zodResolver(clickUpConfigSchema),
        defaultValues: {
            workspaceId: "",
            spaceId: "",
            folderId: "",
            tagMappings: [
                {
                    tagName: "",
                    budgetItemId: 0,
                }
            ],
        },
    });

    const {fields, append, remove} = useFieldArray({
        control: form.control,
        name: "tagMappings"
    });

    // Use ref to track if initial data has been loaded for current budget plan
    const initialDataLoaded = useRef(false);
    const loadedBudgetPlanId = useRef<number | undefined>(undefined);
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSavedMessage, setShowSavedMessage] = useState(false);

    // Reset initialDataLoaded and form when budget plan changes
    useEffect(() => {
        if (loadedBudgetPlanId.current !== budgetPlan.id) {
            initialDataLoaded.current = false;
            loadedBudgetPlanId.current = budgetPlan.id;

            // Reset form to default values when switching budget plans
            form.reset({
                workspaceId: "",
                spaceId: "",
                folderId: "",
                tagMappings: [
                    {
                        tagName: "",
                        budgetItemId: 0,
                    }
                ],
            });
        }
    }, [budgetPlan.id, form]);

    // Load spaces, folders, and tags when the component mounts with existing config
    useEffect(() => {
        if (initialDataLoaded.current || isLoadingConfig) return;

        // If config is undefined (no saved config), mark as loaded and keep default form values
        if (!config) {
            initialDataLoaded.current = true;
            setIsLoadingInitialData(false);
            return;
        }

        const loadInitialData = async () => {
            if (config.workspaceId) {
                try {
                    setIsLoadingInitialData(true);

                    // Load spaces, folders, and tags first
                    await getSpaces(config.workspaceId);

                    if (config.spaceId) {
                        await Promise.all([
                            getTags(config.spaceId),
                            getFolders(config.spaceId)
                        ]);
                    }

                    // Reset form with config values after data is loaded
                    form.reset({
                        workspaceId: config.workspaceId,
                        spaceId: config.spaceId,
                        folderId: config.folderId,
                        tagMappings: config.mappings.map(
                            (mapping) => ({
                                tagName: mapping.clickUpTagName,
                                budgetItemId: mapping.budgetItemId,
                            })
                        ),
                    });

                    initialDataLoaded.current = true;
                    setIsLoadingInitialData(false);
                } catch (error) {
                    console.error("Error loading initial data:", error);
                    setIsLoadingInitialData(false);
                }
            }
        };

        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, isLoadingConfig, budgetPlan.id]);

    const handleWorkspaceChange = async (workspaceId: string) => {
        form.setValue("workspaceId", workspaceId);
        form.setValue("spaceId", "");
        form.setValue("folderId", "");

        try {
            await getSpaces(workspaceId);
        } catch (error) {
            console.error("Error fetching spaces:", error);
        }
    };

    const handleSpaceChange = async (spaceId: string) => {
        form.setValue("spaceId", spaceId);
        form.setValue("folderId", "");

        try {
            await Promise.all([
                getTags(spaceId),
                getFolders(spaceId)
            ]);
        } catch (error) {
            console.error("Error fetching folders and tags:", error);
        }
    };

    const handleFolderChange = (folderId: string) => {
        form.setValue("folderId", folderId);
    };

    const onSubmit = async (data: ClickUpConfigForm) => {
        setIsSaving(true);
        setShowSavedMessage(false);

        try {
            await saveConfig(
                budgetPlan.id!,
                {
                    workspaceId: data.workspaceId,
                    spaceId: data.spaceId,
                    folderId: data.folderId,
                    mappings: data.tagMappings.map((mapping, idx) => ({
                        budgetItemId: mapping.budgetItemId,
                        clickUpTagName: mapping.tagName,
                        clickUpSpaceId: data.spaceId,
                        position: idx,
                    })),
                });

            // Reset form state to mark it as clean
            form.reset(data);

            // Show saved message
            setShowSavedMessage(true);

            // Hide saved message after 3 seconds
            setTimeout(() => {
                setShowSavedMessage(false);
            }, 3000);
        } catch (error) {
            console.error("Error saving configuration:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const addTagMapping = () => {
        append({
            tagName: "",
            budgetItemId: 0
        });
    };

    const removeTagMapping = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    if (isLoadingConfig || isLoadingInitialData) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner className="size-8" />
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">ClickUp Configuration</h3>

                    <FormField
                        control={form.control}
                        name="workspaceId"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Workspace</FormLabel>
                                <Select
                                    onValueChange={(value) => handleWorkspaceChange(value)}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a workspace"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {workspaces?.map((workspace) => (
                                            <SelectItem key={workspace.id} value={workspace.id}>
                                                {workspace.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Select the ClickUp workspace to use.
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="spaceId"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Space</FormLabel>
                                <Select
                                    disabled={!form.getValues("workspaceId")}
                                    onValueChange={(value) => handleSpaceChange(value)}
                                    value={field.value || undefined}
                                    key={`space-${form.watch("workspaceId")}`}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a space"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {spaces?.map((space) => (
                                            <SelectItem key={space.id} value={space.id}>
                                                {space.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Select the ClickUp space to use.
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="folderId"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Folder (Optional)</FormLabel>
                                <Select
                                    disabled={!form.getValues("spaceId") || isLoadingFolders}
                                    onValueChange={(value) => handleFolderChange(value)}
                                    value={field.value || undefined}
                                    key={`folder-${form.watch("spaceId")}`}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a folder (optional)"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="0">All</SelectItem>
                                        {isLoadingFolders ? (
                                            <SelectItem value="" disabled>Loading folders...</SelectItem>
                                        ) : (
                                            folders?.map((folder) => (
                                                <SelectItem key={folder.id} value={folder.id}>
                                                    {folder.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Optionally select a specific folder to use for filtering.
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Tag to Budget Item Mappings</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addTagMapping}
                            disabled={!form.getValues("spaceId")}
                        >
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Add Mapping
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {fields.map((field, index) => {
                            const selectedTags = form.watch("tagMappings").map(m => m.tagName).filter((_, i) => i !== index);
                            const selectedBudgetItems = form.watch("tagMappings").map(m => m.budgetItemId).filter((_, i) => i !== index);

                            return (
                                <div key={field.id} className="flex items-end gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`tagMappings.${index}.tagName`}
                                        render={({field}) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>ClickUp Tag</FormLabel>
                                                <Select
                                                    disabled={isLoadingTags || !form.getValues("spaceId")}
                                                    onValueChange={field.onChange}
                                                    value={field.value?.toString() || ""}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a tag"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {tags?.map((tag) => {
                                                            const isDisabled = selectedTags.includes(tag.name);
                                                            return (
                                                                <SelectItem
                                                                    key={tag.name}
                                                                    value={tag.name}
                                                                    disabled={isDisabled}
                                                                >
                                                                    {tag.name} {isDisabled && "(already mapped)"}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`tagMappings.${index}.budgetItemId`}
                                        render={({field}) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Klokku Budget Item</FormLabel>
                                                <Select
                                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                                    value={field.value.toString()}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a budget"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {budgetItems?.map((budget) => {
                                                            const isDisabled = budget.id ? selectedBudgetItems.includes(budget.id) : false;
                                                            return (
                                                                <SelectItem
                                                                    key={budget.id}
                                                                    value={budget.id?.toString() || ""}
                                                                    disabled={isDisabled}
                                                                >
                                                                    {budget.name} {isDisabled && "(already mapped)"}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeTagMapping(index)}
                                        disabled={fields.length <= 1}
                                    >
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                    <FormDescription>
                        Map ClickUp tags to Klokku budgets. Tasks with these tags will be associated with the corresponding budget.
                    </FormDescription>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="submit"
                        disabled={isLoadingConfig || isSaving || !form.formState.isDirty}
                    >
                        {isSaving ? "Saving..." : "Save Configuration"}
                    </Button>
                    {showSavedMessage && (
                        <span className="text-sm text-green-600 font-medium animate-in fade-in">
                            Saved successfully!
                        </span>
                    )}
                </div>
            </form>
        </Form>
    )
}

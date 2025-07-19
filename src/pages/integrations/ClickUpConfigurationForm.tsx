import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Budget, ClickUpConfig, ClickUpWorkspace} from "@/api/types.ts";
import * as z from "zod";
import {useForm, useFieldArray} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import useClickUp from "@/api/useClickUp.ts";
import {Button} from "@/components/ui/button.tsx";
import {PlusCircle, Trash2} from "lucide-react";
import {useEffect, useRef} from "react";

const clickUpConfigSchema = z.object({
    workspaceId: z.number({
        required_error: "Please select a workspace",
    }),
    spaceId: z.number({
        required_error: "Please select a space",
    }),
    folderId: z.number().optional(),
    tagMappings: z.array(
        z.object({
            tagName: z.string({
                required_error: "Please select a tag",
            }),
            budgetId: z.number({
                required_error: "Please select a budget",
            }),
        })
    ).min(1, "Please add at least one tag mapping.")
});

type ClickUpConfigForm = z.infer<typeof clickUpConfigSchema>;

type Props = {
    config: ClickUpConfig
    workspaces: ClickUpWorkspace[]
    budgets: Budget[]
}

export function ClickUpConfigurationForm({config, workspaces, budgets}: Props) {

    const {
        isLoadingSpaces,
        spaces,
        isLoadingFolders,
        folders,
        isLoadingTags,
        tags,
        isLoadingConfig,
        getSpaces,
        getFolders,
        getTags,
        saveConfig,
    } = useClickUp();

    const form = useForm<ClickUpConfigForm>({
        resolver: zodResolver(clickUpConfigSchema),
        defaultValues: {
            workspaceId: config.workspaceId,
            spaceId: config.spaceId,
            folderId: config.folderId,
            tagMappings: config.mappings.map(
                (mapping) => ({
                    tagName: mapping.clickUpTagName,
                    budgetId: mapping.budgetId,
                })
            ) || [
                {
                    tagName: "",
                    budgetId: 0,
                }
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "tagMappings"
    });

    // Use ref to track if initial data has been loaded
    const initialDataLoaded = useRef(false);

    // Load spaces, folders, and tags when the component mounts with existing config
    useEffect(() => {
        if (initialDataLoaded.current) return;

        const loadInitialData = async () => {
            if (config.workspaceId) {
                try {
                    await getSpaces(config.workspaceId);

                    if (config.spaceId) {
                        await Promise.all([
                            getTags(config.spaceId),
                            getFolders(config.spaceId)
                        ]);
                    }
                    initialDataLoaded.current = true;
                } catch (error) {
                    console.error("Error loading initial data:", error);
                }
            }
        };

        loadInitialData();
    }, [config.workspaceId, config.spaceId]);

    const handleWorkspaceChange = async (workspaceId: number) => {
        form.setValue("workspaceId", workspaceId);
        form.setValue("spaceId", 0);
        form.setValue("folderId", 0);

        try {
            await getSpaces(workspaceId);
        } catch (error) {
            console.error("Error fetching spaces or tags:", error);
        }
    };
    //
    const handleSpaceChange = async (spaceId: number) => {
        form.setValue("spaceId", spaceId);
        form.setValue("folderId", 0);

        try {
            await getTags(spaceId);
            await getFolders(spaceId);
        } catch (error) {
            console.error("Error fetching folders:", error);
        }
    };

    const handleFolderChange = async (folderId: number) => {
        form.setValue("folderId", folderId);
    };

    const onSubmit = async (data: ClickUpConfigForm) => {
        try {
            await saveConfig({
                workspaceId: data.workspaceId,
                spaceId: data.spaceId,
                folderId: data.folderId || undefined,
                mappings: data.tagMappings.map((mapping, idx) => {
                    return {
                        budgetId: mapping.budgetId,
                        clickUpTagName: mapping.tagName,
                        clickUpSpaceId: data.spaceId,
                        position: idx,
                    }
                }),
            });
            console.log("Configuration saved successfully");
        } catch (error) {
            console.error("Error saving configuration:", error);
        }
    };

    const addTagMapping = () => {
        append({
                tagName: "",
                budgetId: 0
        });
    };

    const removeTagMapping = (index: number) => {
        if (fields.length > 1) {
            remove(index);
            }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">ClickUp Configuration</h3>

                    <FormField
                        control={form.control}
                        name="workspaceId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Workspace</FormLabel>
                                <Select
                                    onValueChange={(value) => handleWorkspaceChange(parseInt(value))}
                                    value={field.value.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a workspace" />
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="spaceId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Space</FormLabel>
                                <Select
                                    disabled={isLoadingSpaces || !form.getValues("workspaceId")}
                                    onValueChange={(value) => handleSpaceChange(parseInt(value))}
                                    value={field.value.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a space" />
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="folderId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Folder (Optional)</FormLabel>
                                <Select
                                    disabled={isLoadingFolders || !form.getValues("spaceId")}
                                    onValueChange={(value) => handleFolderChange(parseInt(value))}
                                    value={field.value?.toString() ?? ""}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a folder (optional)" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="0">All</SelectItem>
                                        {folders?.map((folder) => (
                                            <SelectItem key={folder.id} value={folder.id}>
                                                {folder.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Optionally select a specific folder to use for filtering.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Tag to Budget Mappings</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={ addTagMapping }
                            disabled={!form.getValues("spaceId")}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Mapping
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-end gap-4">
                                <FormField
                                    control={form.control}
                                    name={`tagMappings.${index}.tagName`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>ClickUp Tag</FormLabel>
                                            <Select
                                                disabled={isLoadingTags || !form.getValues("spaceId")}
                                                onValueChange={field.onChange}
                                                value={field.value.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a tag" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {tags?.map((tag) => (
                                                        <SelectItem key={tag.name} value={tag.name}>
                                                            {tag.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`tagMappings.${index}.budgetId`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Klokku Budget</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                value={field.value.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a budget" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {budgets?.map((budget) => (
                                                        <SelectItem key={budget.id} value={budget.id?.toString() || ""}>
                                                            {budget.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
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
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <FormDescription>
                        Map ClickUp tags to Klokku budgets. Tasks with these tags will be associated with the corresponding budget.
                    </FormDescription>
                </div>

                <Button
                    type="submit"
                    disabled={isLoadingConfig}
                >
                    Save Configuration
                </Button>
            </form>
        </Form>
    )
}

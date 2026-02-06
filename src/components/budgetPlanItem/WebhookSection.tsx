import {useState} from "react";
import useWebhook from "@/api/useWebhook.ts";
import {Switch} from "@/components/ui/switch.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {CopyIcon, InfoIcon, Trash2Icon} from "lucide-react";
import {Label} from "@/components/ui/label.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";

interface WebhookSectionProps {
    budgetItemId: number;
}

export function WebhookSection({budgetItemId}: WebhookSectionProps) {
    const {webhooks, isLoading, createWebhook, deleteWebhook} = useWebhook("START_CURRENT_EVENT", budgetItemId);
    const [copySuccess, setCopySuccess] = useState(false);

    const webhook = webhooks?.[0] ?? null;

    const isEnabled = !!webhook;

    const handleToggle = async (enabled: boolean) => {
        try {
            if (enabled) {
                await createWebhook({
                    type: "START_CURRENT_EVENT",
                    data: {budgetItemId}
                });
            } else if (webhook) {
                await deleteWebhook(webhook.id);
            }
        } catch (error) {
            console.error("Failed to toggle webhook:", error);
        }
    };

    const handleCopy = async () => {
        const url = webhook?.webhookUrl;
        if (url) {
            await navigator.clipboard.writeText(url);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleDelete = async () => {
        try {
            if (webhook) {
                await deleteWebhook(webhook.id);
            }
        } catch (error) {
            console.error("Failed to delete webhook:", error);
        }
    };

    return (
        <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-1">
                    <Label className="text-sm font-medium">Incoming Webhook</Label>
                    <p className="text-xs text-muted-foreground">
                        Enable a webhook URL to activate this budget item remotely
                    </p>
                </div>
                <Switch
                    checked={isEnabled}
                    onCheckedChange={handleToggle}
                    disabled={isLoading}
                />
            </div>

            {webhook?.webhookUrl && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <Label className="text-sm">Webhook URL</Label>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <InfoIcon className="h-3.5 w-3.5 text-muted-foreground cursor-help"/>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-sm">
                                <div className="space-y-2">
                                    <p className="font-medium">POST request required</p>
                                    <p className="text-xs">Example with cURL:</p>
                                    <pre className="text-[10px] bg-background/50 p-2 rounded overflow-x-auto">
{`curl -X POST '${webhook.webhookUrl}'`}
                                    </pre>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            value={webhook.webhookUrl}
                            readOnly
                            className="font-mono text-xs"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleCopy}
                            className="shrink-0"
                        >
                            <CopyIcon className="h-4 w-4"/>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleDelete}
                            className="shrink-0"
                        >
                            <Trash2Icon className="h-4 w-4"/>
                        </Button>
                    </div>
                    {copySuccess && (
                        <p className="text-xs text-green-600">Copied to clipboard!</p>
                    )}
                </div>
            )}
        </div>
    );
}

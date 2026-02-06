import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";
import {Webhook, WebhookCreateRequest} from "@/api/types.ts";

type HookType = (type: string, budgetItemId?: number) => {
    webhooks?: Webhook[];
    isLoading: boolean;
    createWebhook: (request: WebhookCreateRequest) => Promise<Webhook>;
    deleteWebhook: (webhookId: number) => Promise<void>;
};

const useWebhook: HookType = (type: string, budgetItemId?: number) => {
    const fetchWithAuth = useFetchWithProfileUid();
    const queryClient = useQueryClient();

    const {data, isLoading} = useQuery({
        queryKey: ["webhooks", type, budgetItemId],
        queryFn: async () => {
            const response = await fetchWithAuth(`/api/webhook?type=${type}`);

            if (!response.ok) {
                throw new Error("Failed to list webhooks");
            }

            const webhooks = (await response.json()) as Webhook[];

            if (budgetItemId !== undefined) {
                return webhooks.filter(w => w.data.budgetItemId === budgetItemId);
            }

            return webhooks;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (request: WebhookCreateRequest) => {
            const response = await fetchWithAuth(`/api/webhook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error("Failed to create webhook");
            }

            return response.json() as Promise<Webhook>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["webhooks"] });
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (webhookId: number) => {
            const response = await fetchWithAuth(`/api/webhook/${webhookId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error("Failed to delete webhook");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["webhooks"] });
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const createWebhook = async (request: WebhookCreateRequest) => {
        return createMutation.mutateAsync(request);
    };

    const deleteWebhook = async (webhookId: number) => {
        return deleteMutation.mutateAsync(webhookId);
    };

    return {
        webhooks: data,
        isLoading,
        createWebhook,
        deleteWebhook,
    };
};

export default useWebhook;

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {BudgetPlan, BudgetPlanItem} from "@/api/types.ts";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";
import {invalidateTimeInsights} from "@/api/invalidateTimeInsights.ts";

type HookType = () => {
    addBudgetPlanItem: (planId: number, item: BudgetPlanItem) => Promise<BudgetPlanItem>;
    updateBudgetPlanItem: (planId: number, item: BudgetPlanItem) => Promise<BudgetPlanItem>;
    deleteBudgetPlanItem: (planId: number, itemId: number) => Promise<void>;
    changeBudgetPlanItemPosition: (planId: number, itemId: number, precedingItemId: number) => Promise<void>;
    isChangingBudgetPlanItemPosition: boolean;
};

const useBudgetPlanItem: HookType = () => {
    const fetchWithAuth = useFetchWithProfileUid()
    const queryClient = useQueryClient();

    const addItem = useMutation({
        mutationFn: async (createItemData: { planId: number, item: BudgetPlanItem }) => {
            const response = await fetchWithAuth(`/api/budgetplan/${createItemData.planId}/item`, {
                method: "POST",
                body: JSON.stringify(createItemData.item),
            });

            if (!response.ok) {
                throw new Error("Failed to create budget plan item");
            }

            const data = await response.json();
            return data as BudgetPlanItem;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["budgetPlanDetails"]});
            queryClient.invalidateQueries({queryKey: ["weeklyPlan"]});
            invalidateTimeInsights(queryClient);
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const updateItem = useMutation({
        mutationFn: async (updateItemData: { planId: number, item: BudgetPlanItem }) => {
            const response = await fetchWithAuth(`/api/budgetplan/${updateItemData.planId}/item/${updateItemData.item.id}`, {
                method: "PUT",
                body: JSON.stringify(updateItemData.item),
            });

            if (!response.ok) {
                throw new Error("Failed to update budget plan item");
            }

            const data = await response.json();
            return data as BudgetPlanItem;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["budgetPlanDetails"]});
            queryClient.invalidateQueries({queryKey: ["weeklyPlan"]});
            invalidateTimeInsights(queryClient);
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const deleteItem = useMutation({
        mutationFn: async (deleteData: {planId: number, itemId: number}) => {
            const response = await fetchWithAuth(`/api/budgetplan/${deleteData.planId}/item/${deleteData.itemId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete budget plan item");
            }
            return;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["budgetPlanDetails"]});
            queryClient.invalidateQueries({queryKey: ["weeklyPlan"]});
            invalidateTimeInsights(queryClient);
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const changeItemPosition = useMutation({
        networkMode: "always",
        mutationFn: async (changePositionData: {planId: number, itemId: number, precedingItemId: number}) => {
            const response = await fetchWithAuth(`/api/budgetplan/${changePositionData.planId}/item/${changePositionData.itemId}/position`, {
                method: "PUT",
                body: JSON.stringify({
                    precedingId: changePositionData.precedingItemId
                })
            });
            if (!response.ok) {
                throw new Error("Failed to change budget plan item position");
            }
            return;
        },
        onMutate: async ({planId, itemId, precedingItemId}) => {
            const queryKey = ["budgetPlanDetails", planId];
            await queryClient.cancelQueries({queryKey, exact: true});
            const previousPlan = queryClient.getQueryData<BudgetPlan>(queryKey);
            const movedItem = previousPlan?.items.find(item => item.id === itemId);
            if (previousPlan && movedItem && precedingItemId !== itemId) {
                const items = previousPlan.items.filter(item => item.id !== itemId);
                const precedingIndex = items.findIndex(item => item.id === precedingItemId);
                if (precedingItemId === 0 || precedingIndex !== -1) {
                    items.splice(precedingItemId === 0 ? 0 : precedingIndex + 1, 0, movedItem);
                    queryClient.setQueryData(queryKey, {...previousPlan, items});
                }
            }
            return {previousItemIds: previousPlan?.items.map(item => item.id)};
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["weeklyPlan"]});
            invalidateTimeInsights(queryClient);
        },
        onError: (_error, {planId}, context) => {
            if (context?.previousItemIds) {
                const positions = new Map(context.previousItemIds.map((id, index) => [id, index]));
                queryClient.setQueryData<BudgetPlan>(["budgetPlanDetails", planId], currentPlan => {
                    if (!currentPlan) return currentPlan;
                    // Restore order without overwriting edits, additions, or deletions made during the save.
                    const items = [...currentPlan.items].sort((a, b) =>
                        (positions.get(a.id) ?? positions.size) - (positions.get(b.id) ?? positions.size));
                    return {...currentPlan, items};
                });
            }
        },
        onSettled: (_data, error, {planId}) => {
            const refresh = queryClient.invalidateQueries({queryKey: ["budgetPlanDetails", planId], exact: true});
            // A failed offline save must release the handles even if the refresh is paused.
            return error ? undefined : refresh;
        },
    })

    const addBudgetPlanItem = async (planId: number, item: BudgetPlanItem) => {
        return addItem.mutateAsync({ planId: planId, item: item });
    };

    const updateBudgetPlanItem = async (planId: number, item: BudgetPlanItem) => {
        return updateItem.mutateAsync({ planId: planId, item: item });
    };

    const deleteBudgetPlanItem = async (planId: number, itemId: number) => {
        return deleteItem.mutateAsync({ planId: planId, itemId: itemId });
    }

    const changeBudgetPlanItemPosition = async (planId: number, itemId: number, precedingItemId: number) => {
        return changeItemPosition.mutateAsync({ planId: planId, itemId: itemId, precedingItemId: precedingItemId });
    }

    return {
        addBudgetPlanItem,
        updateBudgetPlanItem,
        deleteBudgetPlanItem,
        changeBudgetPlanItemPosition,
        isChangingBudgetPlanItemPosition: changeItemPosition.isPending,
    };
};

export default useBudgetPlanItem;

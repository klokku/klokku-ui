import {useMutation, useQueryClient} from "@tanstack/react-query";
import {BudgetPlanItem} from "@/api/types.ts";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";

type HookType = () => {
    addBudgetPlanItem: (planId: number, item: BudgetPlanItem) => Promise<BudgetPlanItem>;
    updateBudgetPlanItem: (planId: number, item: BudgetPlanItem) => Promise<BudgetPlanItem>;
    deleteBudgetPlanItem: (planId: number, itemId: number) => Promise<void>;
    changeBudgetPlanItemPosition: (planId: number, itemId: number, precedingItemId: number) => Promise<void>;
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

            return response.json() as BudgetPlanItem;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["budgetPlanDetails"]});
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

            return response.json() as BudgetPlanItem;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["budgetPlanDetails"]});
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
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const changeItemPosition = useMutation({
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
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["budgetPlanDetails"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
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
    };
};

export default useBudgetPlanItem;

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BudgetOverride } from "@/api/types.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import {fetchWithProfileId} from "@/api/fetchWithProfileId.ts";

type Result = {
    createBudgetOverride: (override: BudgetOverride) => Promise<void>;
    updateBudgetOverride: (override: BudgetOverride) => Promise<void>;
    deleteBudgetOverride: (overrideId: number) => Promise<void>;
};

const useBudgetOverrides: () => Result = () => {
    const { currentProfileId } = useCurrentProfile()
    const queryClient = useQueryClient();
    const create = useMutation({
        mutationFn: async (newOverride: BudgetOverride) => {
            const response = await fetchWithProfileId("/api/budget/override", currentProfileId, {
                method: "POST",
                body: JSON.stringify(newOverride),
            });

            if (!response.ok) {
                throw new Error("Failed to create budget override");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stats"] });
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const update = useMutation({
        mutationFn: async (override: BudgetOverride) => {
            const response = await fetchWithProfileId(`/api/budget/override/${override.id}`, currentProfileId, {
                method: "PUT",
                body: JSON.stringify(override),
            });

            if (!response.ok) {
                throw new Error("Failed to update budget override");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stats"] });
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });
    const deleteOverride = useMutation({
        mutationFn: async (overrideId: number) => {
            const response = await fetchWithProfileId(`/api/budget/override/${overrideId}`, currentProfileId, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete budget override");
            }

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stats"] });
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const createBudgetOverride = async (override: BudgetOverride) => {
        return create.mutate(override);
    };

    const updateBudgetOverride = async (override: BudgetOverride) => {
        return update.mutate(override);
    };

    const deleteBudgetOverride = async (overrideId: number) => {
        return deleteOverride.mutate(overrideId);
    };

    return {
        createBudgetOverride: createBudgetOverride,
        updateBudgetOverride: updateBudgetOverride,
        deleteBudgetOverride: deleteBudgetOverride,
    };
};

export default useBudgetOverrides;

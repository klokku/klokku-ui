import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Budget} from "@/api/types.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import {fetchWithProfileId} from "@/api/fetchWithProfileId.ts";

type HookType = (includeInactive: boolean) => {
    budgets: Budget[];
    createBudget: (budget: Budget) => Promise<void>;
    updateBudget: (budget: Budget) => Promise<void>;
    deleteBudget: (budgetId: number) => Promise<void>;
    setBudgetPosition: (budgetId: number, precedingId?: number) => Promise<void>;
};

const useBudget: HookType = (includeInactive: boolean = true) => {
    const { currentProfileId } = useCurrentProfile()
    const queryClient = useQueryClient();
    const {data} = useQuery({
        queryKey: ["budgets", includeInactive],
        queryFn: async () => {
            const response = await fetchWithProfileId(`/api/budget${includeInactive ? "?includeInactive=true" : ""}`, currentProfileId);
            return (await response.json()) as Budget[]
        },
    });
    const create = useMutation({
        mutationFn: async (budget: Budget) => {
            const response = await fetchWithProfileId("/api/budget", currentProfileId, {
                method: "POST",
                body: JSON.stringify(budget),
            });

            if (!response.ok) {
                throw new Error("Failed to create budget");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["budgets"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const update = useMutation({
        mutationFn: async (budget: Budget) => {
            const response = await fetchWithProfileId(`/api/budget/${budget.id}`, currentProfileId, {
                method: "PUT",
                body: JSON.stringify(budget),
            });

            if (!response.ok) {
                throw new Error("Failed to update budget");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["budgets"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const deleteBudgetMutation = useMutation({
        mutationFn: async (budgetId: number) => {
            const response = await fetchWithProfileId(`/api/budget/${budgetId}`, currentProfileId, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete budget");
            }
            return;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["budgets"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const setPosition = useMutation({
        mutationFn: async ({budgetId, precedingId}: {budgetId: number, precedingId?: number}) => {
            const response = await fetchWithProfileId(`/api/budget/${budgetId}/position`, currentProfileId, {
                method: "PUT",
                body: JSON.stringify({
                    id: budgetId,
                    precedingId
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to change budget position");
            }

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["budgets"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const createBudget = async (budget: Budget) => {
        return create.mutate(budget);
    };

    const updateBudget = async (budget: Budget) => {
        return update.mutate(budget);
    };

    const deleteBudget = async (budgetId: number) => {
        return deleteBudgetMutation.mutate(budgetId)
    }

    const setBudgetPosition = async (budgetId: number, precedingId?: number) => {
        return setPosition.mutate({budgetId, precedingId})
    }

    return {
        budgets: data ?? [],
        createBudget,
        updateBudget,
        deleteBudget,
        setBudgetPosition,
    };
};

export default useBudget;

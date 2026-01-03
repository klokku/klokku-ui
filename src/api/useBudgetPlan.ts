import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {BudgetPlan} from "@/api/types.ts";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";

type HookType = (planId?: number) => {
    budgetPlans: BudgetPlan[];
    isLoadingPlans: boolean
    budgetPlanDetails?: BudgetPlan
    isLoadingBudgetPlanDetails: boolean
    createBudgetPlan: (createPlanData: { name: string }) => Promise<BudgetPlan>;
    updateBudgetPlan: (planId: number, updatePlanData: { name: string, isCurrent: boolean }) => Promise<BudgetPlan>;
    deleteBudgetPlan: (planId: number) => Promise<void>;
};

const useBudgetPlan: HookType = (planId?: number) => {
    const fetchWithAuth = useFetchWithProfileUid()
    const queryClient = useQueryClient();
    const {data: budgetPlans, isLoading: isLoadingPlans} = useQuery({
        queryKey: ["budgetPlans"],
        queryFn: async () => {
            const response = await fetchWithAuth("/api/budgetplan");
            return (await response.json()) as BudgetPlan[]
        },
    });

    const {data: budgetPlanDetails, isLoading: isLoadingBudgetPlanDetails} = useQuery({
        queryKey: ["budgetPlanDetails", planId],
        queryFn: async () => {
            if (!planId) return undefined
            const response = await fetchWithAuth(`/api/budgetplan/${planId}`, {
                method: "GET"
            })
            return (await response.json()) as BudgetPlan
        },
        enabled: !!planId
    });

    const create = useMutation({
        mutationFn: async (createPlanData: { name: string }) => {
            const response = await fetchWithAuth("/api/budgetplan", {
                method: "POST",
                body: JSON.stringify(createPlanData),
            });

            if (!response.ok) {
                throw new Error("Failed to create budget plan");
            }

            return response.json() as BudgetPlan;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["budgetPlans"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const update = useMutation({
        mutationFn: async (updatePlanData: { planId: number, name: string, isCurrent: boolean }) => {
            const response = await fetchWithAuth(`/api/budgetplan/${updatePlanData.planId}`, {
                method: "PUT",
                body: JSON.stringify({
                    id: updatePlanData.planId,
                    name: updatePlanData.name,
                    isCurrent: updatePlanData.isCurrent
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update budget plan");
            }

            return response.json() as BudgetPlan;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["budgetPlans"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (planId: number) => {
            const response = await fetchWithAuth(`/api/budgetplan/${planId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete budget plan");
            }
            return;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["budgetPlans"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const createBudgetPlan = async (createPlanData: {name: string}) => {
        return create.mutateAsync(createPlanData);
    };

    const updateBudgetPlan = async (planId: number, updatePlanData: {name: string, isCurrent: boolean}) => {
        return update.mutateAsync({planId: planId, name: updatePlanData.name, isCurrent: updatePlanData.isCurrent});
    };

    const deleteBudgetPlan = async (planId: number) => {
        return deleteMutation.mutateAsync(planId)
    }

    return {
        budgetPlans: budgetPlans ?? [],
        isLoadingPlans,
        budgetPlanDetails,
        isLoadingBudgetPlanDetails,
        createBudgetPlan,
        updateBudgetPlan,
        deleteBudgetPlan,
    };
};

export default useBudgetPlan;

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {WeeklyPlan, WeeklyPlanItem} from "@/api/types.ts";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";

type HookType = (inWeekDate: Date) => {
    weeklyPlan?: WeeklyPlan;
    isLoading: boolean;
    resetWeeklyPlan: (inWeekDate: Date) => Promise<WeeklyPlan>;
    resetWeeklyPlanItem: (weeklyPlanItemId: number) => Promise<WeeklyPlanItem>;
    updateWeeklyPlanItem: (inWeekDate: Date, itemUpdate: {budgetItemId: number, weeklyDuration: number, notes: string}) => Promise<WeeklyPlanItem>;
};

const useWeeklyPlan: HookType = (inWeekDate: Date) => {
    const fetchWithAuth = useFetchWithProfileUid();
    const queryClient = useQueryClient();

    // Normalize the date to a string (e.g., "2023-10-27") to ensure
    // the cache key is stable for the same calendar day.
    const dateKey = inWeekDate.toISOString().split('T')[0];

    const {data, isLoading} = useQuery({
        queryKey: ["weeklyPlan", dateKey],
        queryFn: async () => {
            const response = await fetchWithAuth(`/api/weeklyplan?date=${inWeekDate.toISOString()}`);
            return (await response.json()) as WeeklyPlan
        },
    });

    const resetPlan = useMutation({
        mutationFn: async (inWeekDate: Date) => {
            const response = await fetchWithAuth(`/api/weeklyplan?date=${inWeekDate.toISOString()}`, {
                method: "DELETE",
                body: JSON.stringify({date: inWeekDate.toISOString()}),
            });

            if (!response.ok) {
                throw new Error("Failed to reset weekly plan");
            }

            return response.json() as WeeklyPlan;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["weeklyPlan"] });
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const updatePlanItem = useMutation({
        mutationFn: async (itemUpdate: {inWeekDate: Date, budgetItemId: number, weeklyDuration: number, notes: string}) => {
            const response = await fetchWithAuth(`/api/weeklyplan/item?date=${itemUpdate.inWeekDate.toISOString()}`, {
                method: "PUT",
                body: JSON.stringify(itemUpdate),
            });

            if (!response.ok) {
                throw new Error("Failed to update weekly plan item");
            }

            return response.json() as WeeklyPlanItem;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["weeklyPlan"] });
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const resetPlanItem = useMutation({
        mutationFn: async (weeklyPlanItemId: number) => {
            const response = await fetchWithAuth(`/api/weeklyplan/item/${weeklyPlanItemId}`, {
                method: "DELETE",
                body: JSON.stringify({date: inWeekDate.toISOString()}),
            });

            if (!response.ok) {
                throw new Error("Failed to reset weekly plan item");
            }

            return response.json() as WeeklyPlanItem;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["weeklyPlan"] });
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const resetWeeklyPlan = async (inWeekDate: Date) => {
        return resetPlan.mutateAsync(inWeekDate);
    };

    const resetWeeklyPlanItem = async (weeklyPlanItemId: number) => {
        return resetPlanItem.mutateAsync(weeklyPlanItemId);
    };

    const updateWeeklyPlanItem = async (inWeekDate: Date, itemUpdate: {budgetItemId: number, weeklyDuration: number, notes: string}) => {
        return updatePlanItem.mutateAsync({inWeekDate, ...itemUpdate});
    };

    return {
        weeklyPlan: data,
        isLoading,
        resetWeeklyPlan: resetWeeklyPlan,
        resetWeeklyPlanItem: resetWeeklyPlanItem,
        updateWeeklyPlanItem: updateWeeklyPlanItem,
    };
};

export default useWeeklyPlan;

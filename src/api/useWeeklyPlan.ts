import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {WeeklyPlan, WeeklyPlanItem} from "@/api/types.ts";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";
import {toServerFormat} from "@/lib/dateUtils.ts";

type HookType = (inWeekDate: Date) => {
    weeklyPlan?: WeeklyPlan | null;
    isLoading: boolean;
    resetWeeklyPlan: (inWeekDate: Date) => Promise<WeeklyPlan>;
    resetWeeklyPlanItem: (weeklyPlanItemId: number) => Promise<WeeklyPlanItem>;
    updateWeeklyPlanItem: (inWeekDate: Date, itemUpdate: {budgetItemId: number, weeklyDuration: number, notes: string}) => Promise<WeeklyPlanItem>;
    setOffWeek: (inWeekDate: Date, isOffWeek: boolean) => Promise<WeeklyPlan>;
};

const useWeeklyPlan: HookType = (inWeekDate: Date) => {
    const fetchWithAuth = useFetchWithProfileUid();
    const queryClient = useQueryClient();

    // Normalize the date to a string (e.g., "2023-10-27") to ensure
    // the cache key is stable for the same calendar day.
    const dateKey = toServerFormat(inWeekDate).split('T')[0];

    const {data, isLoading} = useQuery({
        queryKey: ["weeklyPlan", dateKey],
        queryFn: async () => {
            const response = await fetchWithAuth(`/api/weeklyplan?date=${encodeURIComponent(toServerFormat(inWeekDate))}`);
            if (response.status === 404) {
                return null;
            }
            if (!response.ok) {
                throw new Error("Failed to fetch weekly plan");
            }
            return (await response.json()) as WeeklyPlan
        },
    });

    const resetPlan = useMutation({
        mutationFn: async (inWeekDate: Date) => {
            const response = await fetchWithAuth(`/api/weeklyplan?date=${encodeURIComponent(toServerFormat(inWeekDate))}`, {
                method: "DELETE",
                body: JSON.stringify({date: toServerFormat(inWeekDate)}),
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
            const response = await fetchWithAuth(`/api/weeklyplan/item?date=${encodeURIComponent(toServerFormat(itemUpdate.inWeekDate))}`, {
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
                body: JSON.stringify({date: toServerFormat(inWeekDate)}),
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

    const setOffWeekMutation = useMutation({
        mutationFn: async (params: {inWeekDate: Date, isOffWeek: boolean}) => {
            const response = await fetchWithAuth(`/api/weeklyplan/off-week?date=${encodeURIComponent(toServerFormat(params.inWeekDate))}`, {
                method: "PUT",
                body: JSON.stringify({isOffWeek: params.isOffWeek}),
            });
            if (!response.ok) {
                throw new Error("Failed to set off week");
            }
            return response.json() as WeeklyPlan;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["weeklyPlan"] });
        },
    });

    const resetWeeklyPlan = async (inWeekDate: Date) => {
        return resetPlan.mutateAsync(inWeekDate);
    };

    const resetWeeklyPlanItem = async (weeklyPlanItemId: number) => {
        return resetPlanItem.mutateAsync(weeklyPlanItemId);
    };

    const updateWeeklyPlanItem = async (inWeekDate: Date, itemUpdate: {budgetItemId: number, weeklyDuration: number, notes: string}) => {
        return updatePlanItem.mutateAsync({inWeekDate, ...itemUpdate});
    };

    const setOffWeek = async (inWeekDate: Date, isOffWeek: boolean) => {
        return setOffWeekMutation.mutateAsync({inWeekDate, isOffWeek});
    };

    return {
        weeklyPlan: data,
        isLoading,
        resetWeeklyPlan,
        resetWeeklyPlanItem,
        updateWeeklyPlanItem,
        setOffWeek,
    };
};

export default useWeeklyPlan;

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {WeeklyPlan, WeeklyPlanItem} from "@/api/types.ts";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";
import {toServerFormat} from "@/lib/dateUtils.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import {formatInTimeZone} from "date-fns-tz";
import {invalidateTimeInsights} from "@/api/invalidateTimeInsights.ts";

interface WeeklyPlanOptions {
    enabled?: boolean;
    timezone?: string;
}

const useWeeklyPlan = (inWeekDate: Date, options: WeeklyPlanOptions = {}) => {
    const fetchWithAuth = useFetchWithProfileUid();
    const {currentProfileUid} = useCurrentProfile();
    const queryClient = useQueryClient();

    // Normalize the date to a string (e.g., "2023-10-27") to ensure
    // the cache key is stable for the same calendar day.
    const dateString = options.timezone
        ? formatInTimeZone(inWeekDate, options.timezone, "yyyy-MM-dd'T'HH:mm:ssXXX")
        : toServerFormat(inWeekDate);
    const dateKey = dateString.split('T')[0];

    const {data, isLoading, error, refetch} = useQuery({
        queryKey: ["weeklyPlan", currentProfileUid, dateKey, options.timezone],
        queryFn: async () => {
            const response = await fetchWithAuth(`/api/weeklyplan?date=${encodeURIComponent(dateString)}`);
            if (response.status === 404) {
                return null;
            }
            if (!response.ok) {
                throw new Error("Failed to fetch weekly plan");
            }
            return (await response.json()) as WeeklyPlan
        },
        enabled: !!currentProfileUid && (options.enabled ?? true),
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

            const data = await response.json();
            return data as WeeklyPlan;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["weeklyPlan"] });
            invalidateTimeInsights(queryClient);
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

            const data = await response.json();
            return data as WeeklyPlanItem;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["weeklyPlan"] });
            invalidateTimeInsights(queryClient);
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

            const data = await response.json();
            return data as WeeklyPlanItem;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["weeklyPlan"] });
            invalidateTimeInsights(queryClient);
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
            const data = await response.json();
            return data as WeeklyPlan;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["weeklyPlan"] });
            invalidateTimeInsights(queryClient);
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
        error,
        refetch,
        resetWeeklyPlan,
        resetWeeklyPlanItem,
        updateWeeklyPlanItem,
        setOffWeek,
    };
};

export default useWeeklyPlan;

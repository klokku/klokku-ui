import {PlanItemHistoryStats, StatsSummary} from "@/api/types.ts";
import {useQuery} from "@tanstack/react-query";
import {toServerFormat} from "@/lib/dateUtils.ts";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import {formatInTimeZone} from "date-fns-tz";

interface StatsOptions {
    enabled?: boolean;
    timezone?: string;
    refetchInterval?: number;
    planId?: number;
}

const useWeeklyStats = (inWeekDate: Date, options: StatsOptions = {}) => {
    const fetchWithAuth = useFetchWithProfileUid();
    const {currentProfileUid} = useCurrentProfile();
    const dateString = options.timezone
        ? formatInTimeZone(inWeekDate, options.timezone, "yyyy-MM-dd'T'HH:mm:ssXXX")
        : toServerFormat(inWeekDate);
    const inWeekDateString = encodeURIComponent(dateString);
    const {isLoading, data, error, refetch} = useQuery({
        queryKey: ["stats", currentProfileUid, dateString, options.planId],
        queryFn: async () => {
            const response = await fetchWithAuth(`/api/stats/weekly?date=${inWeekDateString}`)
            if (response.status === 404) {
                return null;
            }
            if (!response.ok) {
                throw new Error("Failed to fetch weekly stats summary");
            }
            return (await response.json()) as StatsSummary
        },
        enabled: !!currentProfileUid && (options.enabled ?? true),
        refetchInterval: options.refetchInterval,
    })

    return {
        isLoading,
        weeklyStatsSummary: data,
        error,
        refetch,
    }
}

export const useItemHistoryStats = (from: Date, to: Date, budgetItemId: number) => {
    const fetchWithAuth = useFetchWithProfileUid();
    const fromString = encodeURIComponent(toServerFormat(from));
    const toString = encodeURIComponent(toServerFormat(to));

    const {isLoading, data} = useQuery({
        queryKey: ["itemHistoryStats", from, to, budgetItemId],
        queryFn: async () => {
            const response = await fetchWithAuth(
                `/api/stats/item-history?from=${fromString}&to=${toString}&budgetItemId=${budgetItemId}`
            );
            return (await response.json()) as PlanItemHistoryStats;
        }
    });

    return {
        isLoading,
        itemHistoryStats: data
    };
};

export default useWeeklyStats;

import {PlanItemHistoryStats, StatsSummary} from "@/api/types.ts";
import {useQuery} from "@tanstack/react-query";
import {toServerFormat} from "@/lib/dateUtils.ts";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";

type HookType = (inWeekDate: Date) => {
    isLoading: boolean,
    weeklyStatsSummary?: StatsSummary | null,
}

const useWeeklyStats: HookType = (inWeekDate: Date) => {
    const fetchWithAuth = useFetchWithProfileUid();
    const inWeekDateString = encodeURIComponent(toServerFormat(inWeekDate))
    const {isLoading, data} = useQuery({
        queryKey: ["stats", inWeekDate],
        queryFn: async () => {
            const response = await fetchWithAuth(`/api/stats/weekly?date=${inWeekDateString}`)
            if (response.status === 404) {
                return null;
            }
            if (!response.ok) {
                throw new Error("Failed to fetch weekly stats summary");
            }
            return (await response.json()) as StatsSummary
        }
    })

    return {
        isLoading,
        weeklyStatsSummary: data
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

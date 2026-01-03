import {StatsSummary} from "@/api/types.ts";
import {useQuery} from "@tanstack/react-query";
import {toServerFormat} from "@/lib/dateUtils.ts";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";

type HookType = (inWeekDate: Date) => {
    isLoading: boolean,
    statsSummary: StatsSummary | undefined,
}

const useStats: HookType = (inWeekDate: Date) => {
    const fetchWithAuth = useFetchWithProfileUid();
    const inWeekDateString = encodeURIComponent(toServerFormat(inWeekDate))
    const {isLoading, data} = useQuery({
        queryKey: ["stats", inWeekDate],
        queryFn: async () => {
            const response = await fetchWithAuth(`/api/stats/weekly?date=${inWeekDateString}`)
            return (await response.json()) as StatsSummary
        }
    })

    return {
        isLoading,
        statsSummary: data
    }
}

export default useStats;

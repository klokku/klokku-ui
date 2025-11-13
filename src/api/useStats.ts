import {StatsSummary} from "@/api/types.ts";
import {useQuery} from "@tanstack/react-query";
import {toServerFormat} from "@/lib/dateUtils.ts";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";

type HookType = (fromDate: Date, toDate: Date) => {
    isLoading: boolean,
    statsSummary: StatsSummary | undefined,
}

const useStats: HookType = (fromDate: Date, toDate: Date) => {
    const fetchWithAuth = useFetchWithProfileUid();
    const fromDateString = encodeURIComponent(toServerFormat(fromDate))
    const toDateString = encodeURIComponent(toServerFormat(toDate))
    const {isLoading, data} = useQuery({
        queryKey: ["stats", fromDate, toDate],
        queryFn: async () => {
            const response = await fetchWithAuth(`/api/stats?fromDate=${fromDateString}&toDate=${toDateString}`)
            return (await response.json()) as StatsSummary
        }
    })

    return {
        isLoading,
        statsSummary: data
    }
}

export default useStats;

import {StatsSummary} from "@/api/types.ts";
import {useQuery} from "@tanstack/react-query";
import {toServerFormat} from "@/lib/dateUtils.ts";
import {fetchWithProfileId} from "@/api/fetchWithProfileId.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";

type HookType = (fromDate: Date, toDate: Date) => {
    isLoading: boolean,
    statsSummary: StatsSummary | undefined,
}

const useStats: HookType = (fromDate: Date, toDate: Date) => {
    const { currentProfileId } = useCurrentProfile()
    const fromDateString = encodeURIComponent(toServerFormat(fromDate))
    const toDateString = encodeURIComponent(toServerFormat(toDate))
    const { isLoading, data } = useQuery({
        queryKey: ["stats", fromDate, toDate],
        queryFn: async () => {
            const response = await fetchWithProfileId(`/api/stats?fromDate=${fromDateString}&toDate=${toDateString}`, currentProfileId)
            return (await response.json()) as StatsSummary
        }
    })

    return {
        isLoading,
        statsSummary: data
    }
}

export default useStats;

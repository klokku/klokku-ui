import {useQuery} from "@tanstack/react-query";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";
import {BudgetPlanReport} from "@/api/types.ts";
import {toServerFormat} from "@/lib/dateUtils.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";

export const useBudgetPlanReport = (planId?: number, from?: Date, to?: Date, options: {enabled?: boolean} = {}) => {
    const fetchWithAuth = useFetchWithProfileUid();
    const {currentProfileUid} = useCurrentProfile();
    const fromStr = from ? toServerFormat(from) : undefined;
    const toStr = to ? toServerFormat(to) : undefined;

    const {isLoading, data, error, refetch} = useQuery({
        queryKey: ["budgetPlanReport", currentProfileUid, planId, fromStr, toStr],
        queryFn: async () => {
            let url = `/api/budgetplan/${planId}/report`;
            if (fromStr && toStr) {
                url += `?from=${encodeURIComponent(fromStr)}&to=${encodeURIComponent(toStr)}`;
            }
            const response = await fetchWithAuth(url);
            if (!response.ok) throw new Error("Failed to fetch report");
            return (await response.json()) as BudgetPlanReport;
        },
        enabled: !!currentProfileUid && !!planId && (options.enabled ?? true),
    });
    return {isLoading, report: data, error, refetch};
};

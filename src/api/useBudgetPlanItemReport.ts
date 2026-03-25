import {useQuery} from "@tanstack/react-query";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";
import {BudgetPlanItemReport} from "@/api/types.ts";
import {toServerFormat} from "@/lib/dateUtils.ts";

export const useBudgetPlanItemReport = (planId?: number, itemId?: number, from?: Date, to?: Date) => {
    const fetchWithAuth = useFetchWithProfileUid();
    const fromStr = from ? toServerFormat(from) : undefined;
    const toStr = to ? toServerFormat(to) : undefined;

    const {isLoading, data} = useQuery({
        queryKey: ["budgetPlanItemReport", planId, itemId, fromStr, toStr],
        queryFn: async () => {
            let url = `/api/budgetplan/${planId}/report/item/${itemId}`;
            if (fromStr && toStr) {
                url += `?from=${encodeURIComponent(fromStr)}&to=${encodeURIComponent(toStr)}`;
            }
            const response = await fetchWithAuth(url);
            if (!response.ok) throw new Error("Failed to fetch item report");
            return (await response.json()) as BudgetPlanItemReport;
        },
        enabled: !!planId && !!itemId,
    });
    return {isLoading, report: data};
};

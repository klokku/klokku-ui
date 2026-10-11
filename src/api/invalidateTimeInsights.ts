import {QueryClient} from "@tanstack/react-query";

export function invalidateTimeInsights(queryClient: QueryClient) {
    for (const key of ["stats", "budgetPlanReport", "budgetPlanItemReport", "itemHistoryStats"]) {
        void queryClient.invalidateQueries({queryKey: [key]});
    }
}

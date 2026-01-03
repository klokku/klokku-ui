import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {CurrentEvent} from "@/api/types.ts";
import {formatDate} from "date-fns";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";

type HookType = () => {
    loadingCurrentEvent: boolean,
    currentEvent?: CurrentEvent,
    startEvent: (budgetItemId: number, itemName: string, weeklyDuration: number) => Promise<void>,
    updateEventStartTime: (startTime: Date) => Promise<void>,
}

const useEvents: HookType = () => {
    const fetchWithAuth = useFetchWithProfileUid()
    const queryClient = useQueryClient();
    const { isLoading: loadingCurrentEvent, data } = useQuery({
        queryKey: ["currentEvent"],
        queryFn: async () => {
            const response = await fetchWithAuth("/api/event/current")
            return (await response.json()) as CurrentEvent
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: "always"
    })
    const start = useMutation({
        mutationFn: async (startData: {budgetItemId: number, itemName: string, weeklyDuration: number}) => {
            const response = await fetchWithAuth("/api/event", {
                method: "POST",
                body: JSON.stringify({
                    budgetItemId: startData.budgetItemId,
                    name: startData.itemName,
                    weeklyDuration: startData.weeklyDuration,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to start event with budgetItemId: ${startData.budgetItemId}`);
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["currentEvent"]});
            queryClient.invalidateQueries({queryKey: ["calendarEvents"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const updateStartTime = useMutation({
        mutationFn: async (startTime: Date) => {
            const response = await fetchWithAuth("/api/event/current/start", {
                method: "PATCH",
                body: JSON.stringify({
                    startTime: formatDate(startTime, "yyyy-MM-dd'T'HH:mm:ssXXX")
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update current event start time");
            }
            return;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["currentEvent"]});
            queryClient.invalidateQueries({queryKey: ["calendarEvents"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const startEvent = async (budgetItemId: number, itemName: string, weeklyDuration: number) => {
        return start.mutate({budgetItemId: budgetItemId, itemName, weeklyDuration});
    };

    const updateEventStartTime = async (startTime: Date) => {
        return updateStartTime.mutate(startTime)
    }

    return {
        loadingCurrentEvent,
        currentEvent: data,
        startEvent,
        updateEventStartTime,
    }
}

export default useEvents;

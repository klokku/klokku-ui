import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Event} from "@/api/types.ts";
import {formatDate} from "date-fns";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";

type HookType = () => {
    loadingCurrentEvent: boolean,
    currentEvent?: Event,
    loadingLastEvents: boolean,
    lastEvents?: Event[],
    startEvent: (budgetId: number) => Promise<void>,
    endEvent: () => Promise<void>,
    updateEventStartTime: (startTime: Date) => Promise<void>,
}

const useEvents: HookType = () => {
    const fetchWithAuth = useFetchWithProfileUid()
    const queryClient = useQueryClient();
    const { isLoading: loadingCurrentEvent, data } = useQuery({
        queryKey: ["currentEvent"],
        queryFn: async () => {
            const response = await fetchWithAuth("/api/event/current")
            return (await response.json()) as Event
        }
    })
    const { isLoading: loadingLastEvents, data: last } = useQuery({
        queryKey: ["lastEvents"],
        queryFn: async () => {
            const response = await fetchWithAuth("/api/event?last=5")
            return (await response.json()) as Event[]
        }
    })
    const start = useMutation({
        mutationFn: async (budgetId: number) => {
            const response = await fetchWithAuth("/api/event", {
                method: "POST",
                body: JSON.stringify({
                    budgetId: budgetId,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to start event with budgetId: ${budgetId}`);
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["currentEvent"]});
            queryClient.invalidateQueries({queryKey: ["lastEvents"]});
            queryClient.invalidateQueries({queryKey: ["calendarEvents"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const end = useMutation({
        mutationFn: async () => {
            const response = await fetchWithAuth("/api/event/current", {
                method: "PATCH",
                body: JSON.stringify({
                    status: "finished",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to end event");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["currentEvent"]});
            queryClient.invalidateQueries({queryKey: ["lastEvents"]});
            queryClient.invalidateQueries({queryKey: ["calendarEvents"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

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
            queryClient.invalidateQueries({queryKey: ["lastEvents"]});
            queryClient.invalidateQueries({queryKey: ["calendarEvents"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const startEvent = async (budgetId: number) => {
        return start.mutate(budgetId);
    };

    const endEvent = async () => {
        return end.mutate();
    }

    const updateEventStartTime = async (startTime: Date) => {
        return updateStartTime.mutate(startTime)
    }

    return {
        loadingCurrentEvent,
        currentEvent: data,
        loadingLastEvents,
        lastEvents: last,
        startEvent,
        endEvent,
        updateEventStartTime,
    }
}

export default useEvents;

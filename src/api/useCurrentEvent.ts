import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {CurrentEvent} from "@/api/types.ts";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";
import {invalidateTimeInsights} from "@/api/invalidateTimeInsights.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";

interface CurrentEventOptions {
    enabled?: boolean;
    refetchInterval?: number;
}

const useCurrentEvent = (options: CurrentEventOptions = {}) => {
    const fetchWithAuth = useFetchWithProfileUid()
    const {currentProfileUid} = useCurrentProfile();
    const queryClient = useQueryClient();
    const { isLoading: loadingCurrentEvent, data, error, refetch } = useQuery({
        queryKey: ["currentEvent", currentProfileUid],
        queryFn: async () => {
            const response = await fetchWithAuth("/api/event/current")
            if (response.status === 404) {
                return null;
            }
            if (!response.ok) {
                throw new Error("Failed to fetch current event");
            }
            return (await response.json()) as CurrentEvent
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: "always",
        enabled: !!currentProfileUid && (options.enabled ?? true),
        refetchInterval: options.refetchInterval,
    })
    const start = useMutation({
        mutationKey: ["startEvent", currentProfileUid],
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
        onSuccess: async () => {
            queryClient.invalidateQueries({queryKey: ["calendarEvents"]});
            invalidateTimeInsights(queryClient);
            await queryClient.invalidateQueries({queryKey: ["currentEvent"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const updateStartTime = useMutation({
        mutationKey: ["updateCurrentEventStart", currentProfileUid],
        mutationFn: async (startTime: Date) => {
            const response = await fetchWithAuth("/api/event/current/start", {
                method: "PATCH",
                body: JSON.stringify({
                    startTime: startTime.toISOString()
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
            invalidateTimeInsights(queryClient);
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const updateNotes = useMutation({
        mutationKey: ["updateCurrentEventNotes", currentProfileUid],
        mutationFn: async (notes: string) => {
            const response = await fetchWithAuth("/api/event/current/notes", {
                method: "PATCH",
                body: JSON.stringify({notes}),
            });

            if (!response.ok) {
                throw new Error("Failed to update current event notes");
            }
            return;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["currentEvent"]});
            invalidateTimeInsights(queryClient);
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const startEvent = async (budgetItemId: number, itemName: string, weeklyDuration: number) => {
        return start.mutateAsync({budgetItemId: budgetItemId, itemName, weeklyDuration});
    };

    const updateEventStartTime = async (startTime: Date) => {
        return updateStartTime.mutateAsync(startTime)
    }

    const updateEventNotes = async (notes: string) => {
        return updateNotes.mutateAsync(notes)
    }

    return {
        loadingCurrentEvent,
        currentEvent: data,
        error,
        refetch,
        isStartingEvent: start.isPending,
        startError: start.error,
        resetStartError: start.reset,
        startEvent,
        updateEventStartTime,
        updateEventNotes,
    }
}

export default useCurrentEvent;

export type CurrentActivity = ReturnType<typeof useCurrentEvent>;

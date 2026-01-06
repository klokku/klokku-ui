import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {CalendarEvent} from "@/api/types.ts";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";
import {toServerFormat} from "@/lib/dateUtils.ts";

type HookType = (fromDate?: Date, toDate?: Date) => {
    isLoading: boolean,
    events: CalendarEvent[] | undefined,
    recentEvents: CalendarEvent[] | undefined,
    isLoadingRecentEvents: boolean,
    modifyEvent: (event: CalendarEvent) => Promise<void>,
    createEvent: (event: Omit<CalendarEvent, 'uid'> & Partial<Pick<CalendarEvent, 'uid'>>) => Promise<void>,
    deleteEvent: (eventUid: string) => Promise<void>,
}

const useCalendar: HookType = (fromDate?: Date, toDate?: Date) => {
    const fetchWithAuth = useFetchWithProfileUid()
    const queryClient = useQueryClient();

    const from = fromDate ? encodeURIComponent(toServerFormat(fromDate)) : undefined
    const to = toDate ? encodeURIComponent(toServerFormat(toDate)) : undefined
    const { isLoading, data } = useQuery({
        queryKey: ["calendarEvents", from, to],
        queryFn: async () => {
            const response = await fetchWithAuth(`/api/calendar/event?from=${from}&to=${to}`)
            return (await response.json()) as CalendarEvent[]
        },
        enabled: !!from && !!to
    })

    const { data: recentEvents, isLoading: isLoadingRecentEvents } = useQuery({
        queryKey: ["calendarEvents"],
        queryFn: async () => {
            const response = await fetchWithAuth(`/api/calendar/event/recent?last=5`)
            return (await response.json()) as CalendarEvent[]
        },
    })

    const modify = useMutation({
        mutationFn: async (event: CalendarEvent) => {
            const response = await fetchWithAuth(`/api/calendar/event/${event.uid}`, {
                method: "PUT",
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                throw new Error("Failed to update current event start time");
            }
            return;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["calendarEvents"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const create = useMutation({
        mutationFn: async (event: Omit<CalendarEvent, 'uid'> & Partial<Pick<CalendarEvent, 'uid'>>) => {
            const response = await fetchWithAuth("/api/calendar/event", {
                method: "POST",
                body: JSON.stringify(event),
            });
            if (!response.ok) {
                throw new Error("Failed to create calendar event");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["calendarEvents"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const deleteEv = useMutation({
        mutationFn: async (eventUid: string) => {
            const response = await fetchWithAuth(`/api/calendar/event/${eventUid}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete calendar event");
            }
            return;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["calendarEvents"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const modifyEvent = async (event: CalendarEvent) => {
        return modify.mutateAsync(event)
    }

    const createEvent = async (event: Omit<CalendarEvent, 'uid'> & Partial<Pick<CalendarEvent, 'uid'>>) => {
        return create.mutateAsync(event)
    }

    const deleteEvent = async (eventUid: string) => {
        return deleteEv.mutateAsync(eventUid)
    }

    return {
        isLoading,
        events: data,
        recentEvents,
        isLoadingRecentEvents,
        modifyEvent,
        createEvent,
        deleteEvent,
    }
}

export default useCalendar;

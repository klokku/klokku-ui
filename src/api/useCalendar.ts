import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {CalendarEvent} from "@/api/types.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import {fetchWithProfileId} from "@/api/fetchWithProfileId.ts";
import {toServerFormat} from "@/lib/dateUtils.ts";

type HookType = (fromDate: Date, toDate: Date) => {
    isLoading: boolean,
    events: CalendarEvent[] | undefined,
    modifyEvent: (event: CalendarEvent) => Promise<void>,
    createEvent: (event: Omit<CalendarEvent, 'uid'> & Partial<Pick<CalendarEvent, 'uid'>>) => Promise<void>,
    deleteEvent: (event: CalendarEvent) => Promise<void>,
}

const useCalendar: HookType = (fromDate: Date, toDate: Date) => {
    const { currentProfileId } = useCurrentProfile()
    const queryClient = useQueryClient();

    const from = encodeURIComponent(toServerFormat(fromDate))
    const to = encodeURIComponent(toServerFormat(toDate))
    const { isLoading, data } = useQuery({
        queryKey: ["calendarEvents", from, to],
        queryFn: async () => {
            const response = await fetchWithProfileId(`/api/calendar/event?from=${from}&to=${to}`, currentProfileId)
            return (await response.json()) as CalendarEvent[]
        }
    })

    const modify = useMutation({
        mutationFn: async (event: CalendarEvent) => {
            const response = await fetchWithProfileId(`/api/calendar/event/${event.uid}`, currentProfileId, {
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
            const response = await fetchWithProfileId("/api/calendar/event", currentProfileId, {
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
        mutationFn: async (event: CalendarEvent) => {
            const response = await fetchWithProfileId(`/api/calendar/event/${event.uid}`, currentProfileId, {
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
        return modify.mutate(event)
    }

    const createEvent = async (event: Omit<CalendarEvent, 'uid'> & Partial<Pick<CalendarEvent, 'uid'>>) => {
        return create.mutate(event)
    }

    const deleteEvent = async (event: CalendarEvent) => {
        return deleteEv.mutate(event)
    }

    return {
        isLoading,
        events: data,
        modifyEvent,
        createEvent,
        deleteEvent,
    }
}

export default useCalendar;

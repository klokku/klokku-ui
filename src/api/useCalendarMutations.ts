import {useMutation, useQueryClient} from "@tanstack/react-query";
import {CalendarEvent} from "@/api/types.ts";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";
import {invalidateTimeInsights} from "@/api/invalidateTimeInsights.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";

export default function useCalendarMutations() {
    const fetchWithAuth = useFetchWithProfileUid();
    const queryClient = useQueryClient();
    const {currentProfileUid} = useCurrentProfile();
    const onSuccess = () => {
        void queryClient.invalidateQueries({queryKey: ["calendarEvents"]});
        invalidateTimeInsights(queryClient);
    };
    const modify = useMutation({
        mutationKey: ["modifyCalendarEvent", currentProfileUid],
        mutationFn: async (event: CalendarEvent) => {
            const response = await fetchWithAuth(`/api/calendar/event/${event.uid}`, {
                method: "PUT", body: JSON.stringify(event),
            });
            if (!response.ok) throw new Error("Failed to update calendar event");
        },
        onSuccess,
    });
    const create = useMutation({
        mutationKey: ["createCalendarEvent", currentProfileUid],
        mutationFn: async (event: Omit<CalendarEvent, "uid"> & Partial<Pick<CalendarEvent, "uid">>) => {
            const response = await fetchWithAuth("/api/calendar/event", {
                method: "POST", body: JSON.stringify(event),
            });
            if (!response.ok) throw new Error("Failed to create calendar event");
        },
        onSuccess,
    });
    const remove = useMutation({
        mutationKey: ["deleteCalendarEvent", currentProfileUid],
        mutationFn: async (eventUid: string) => {
            const response = await fetchWithAuth(`/api/calendar/event/${eventUid}`, {method: "DELETE"});
            if (!response.ok) throw new Error("Failed to delete calendar event");
        },
        onSuccess,
    });

    return {modifyEvent: modify.mutateAsync, createEvent: create.mutateAsync, deleteEvent: remove.mutateAsync};
}

export type CalendarMutations = ReturnType<typeof useCalendarMutations>;

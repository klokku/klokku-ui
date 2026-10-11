import {useQuery} from "@tanstack/react-query";
import {CalendarEvent} from "@/api/types.ts";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import {toServerFormat} from "@/lib/dateUtils.ts";
import useCalendarMutations from "@/api/useCalendarMutations.ts";

interface CalendarOptions {
    enabled?: boolean;
    rangeEnabled?: boolean;
    refetchInterval?: number;
}

export default function useCalendar(fromDate?: Date, toDate?: Date, options: CalendarOptions = {}) {
    const fetchWithAuth = useFetchWithProfileUid();
    const {currentProfileUid} = useCurrentProfile();
    const mutations = useCalendarMutations();
    const from = fromDate ? toServerFormat(fromDate) : undefined;
    const to = toDate ? toServerFormat(toDate) : undefined;
    const enabled = !!currentProfileUid && (options.enabled ?? true);
    const eventsQuery = useQuery({
        queryKey: ["calendarEvents", currentProfileUid, "range", from, to],
        queryFn: async () => {
            const response = await fetchWithAuth(`/api/calendar/event?from=${encodeURIComponent(from!)}&to=${encodeURIComponent(to!)}`);
            if (!response.ok) throw new Error("Failed to fetch calendar events");
            return (await response.json()) as CalendarEvent[] | null;
        },
        enabled: enabled && (options.rangeEnabled ?? true) && !!from && !!to,
        refetchInterval: options.refetchInterval,
    });
    const recentQuery = useQuery({
        queryKey: ["calendarEvents", currentProfileUid, "recent"],
        queryFn: async () => {
            const response = await fetchWithAuth("/api/calendar/event/recent?last=5");
            if (!response.ok) throw new Error("Failed to fetch recent events");
            return (await response.json()) as CalendarEvent[] | null;
        },
        enabled,
        refetchInterval: options.refetchInterval,
    });

    return {
        ...mutations,
        events: eventsQuery.data ?? [],
        isLoading: eventsQuery.isLoading,
        error: eventsQuery.error,
        refetch: eventsQuery.refetch,
        recentEvents: recentQuery.data ?? [],
        isLoadingRecentEvents: recentQuery.isLoading,
        recentError: recentQuery.error,
        refetchRecent: recentQuery.refetch,
    };
}

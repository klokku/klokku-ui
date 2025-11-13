import {GoogleAuthRedirect, GoogleCalendarItem} from "@/api/types.ts";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";

type HookType = () => {
    isLoadingCalendars: boolean,
    calendars?: GoogleCalendarItem[],
    authLogin: () => Promise<GoogleAuthRedirect>,
    authLogout: () => Promise<void>,
}

const useGoogle: HookType = () => {
    const fetchWithAuth = useFetchWithProfileUid()
    const queryClient = useQueryClient();

    const {isLoading: isLoadingCalendars, data: calendars} = useQuery({
        queryKey: ["googleCalendars"],
        queryFn: async () => {
            const response = await fetchWithAuth("/api/integrations/google/calendars", {
                method: "GET",
            })
            if (!response.ok) {
                throw new Error("Failed to fetch profile");
            }
            return (await response.json()) as GoogleCalendarItem[]
        },
        retry: false,
    });

    const authLoginGoogle = useMutation({
        mutationFn: async () => {
            const response = await fetchWithAuth("/api/integrations/google/auth/login?finalUrl=" + encodeURI(window.location.href), {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error("Google integration authentication failed");
            }
            return (response.json()) as GoogleAuthRedirect;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["currentProfile"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const authLogoutGoogle = useMutation({
        mutationFn: async () => {
            const response = await fetchWithAuth("/api/integrations/google/auth/logout", {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Google integration logout failed");
            }
            return;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["currentProfile"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    })

    const authLogin = async (): Promise<GoogleAuthRedirect> => {
        return authLoginGoogle.mutateAsync()
    };

    const authLogout = async (): Promise<void> => {
        return authLogoutGoogle.mutateAsync()
    }

    return {
        isLoadingCalendars,
        calendars,
        authLogin,
        authLogout,
    }
}

export default useGoogle;

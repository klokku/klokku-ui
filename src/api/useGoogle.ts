import {GoogleAuthRedirect, GoogleCalendarItem} from "@/api/types.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {fetchWithProfileId} from "@/api/fetchWithProfileId.ts";

type HookType = () => {
    isLoadingCalendars: boolean,
    calendars?: GoogleCalendarItem[],
    authLogin: () => Promise<GoogleAuthRedirect>,
    authLogout: () => Promise<void>,
}

const useGoogle: HookType = () => {
    const { currentProfileId } = useCurrentProfile()
    const queryClient = useQueryClient();

    const {isLoading: isLoadingCalendars, data: calendars} = useQuery({
        queryKey: ["googleCalendars"],
        queryFn: async () => {
            const response = await fetchWithProfileId("/api/integrations/google/calendars", currentProfileId, {
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
            const response = await fetchWithProfileId("/api/integrations/google/auth/login?finalUrl=" + encodeURI(window.location.href), currentProfileId, {
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
            const response = await fetchWithProfileId("/api/integrations/google/auth/logout", currentProfileId, {
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

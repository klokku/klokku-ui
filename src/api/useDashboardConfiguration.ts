import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useCurrentProfile} from "@/hooks/currentProfileContext";
import {fetchWithProfileUid} from "@/api/fetchWithProfileUid";
import {DashboardConfiguration, dashboardConfigurationSchema, getDashboardCards, resolveDashboardConfiguration} from "@/components/dashboard/dashboardConfiguration";

const endpoint = "/api/user/current/dashboard";

export default function useDashboardConfiguration() {
    const {currentProfileUid} = useCurrentProfile();
    const client = useQueryClient();
    const query = useQuery({
        queryKey: ["dashboardConfiguration", currentProfileUid],
        enabled: !!currentProfileUid,
        retry: false,
        queryFn: async ({signal}) => {
            const response = await fetchWithProfileUid(endpoint, currentProfileUid, {signal});
            if (!response.ok) throw new Error("Could not load your dashboard configuration.");
            return dashboardConfigurationSchema.parse(await response.json());
        },
    });
    const mutation = useMutation({
        mutationKey: ["dashboardConfiguration", currentProfileUid],
        scope: {id: `dashboardConfiguration:${currentProfileUid}`},
        networkMode: "always",
        mutationFn: async ({profileUid, configuration}: {profileUid: string; configuration: DashboardConfiguration | null}) => {
            const response = await fetchWithProfileUid(endpoint, profileUid, configuration === null
                ? {method: "DELETE"}
                : {method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify(configuration)});
            if (!response.ok) throw new Error("Could not save your dashboard. Your changes are still here; please try again.");
            return configuration === null ? null : dashboardConfigurationSchema.parse(await response.json());
        },
        onSuccess: async (configuration, {profileUid}) => {
            // Cancel an older read before publishing the successful save to this profile's cache.
            await client.cancelQueries({queryKey: ["dashboardConfiguration", profileUid]});
            client.setQueryData(["dashboardConfiguration", profileUid], configuration);
        },
    });
    const resolved = query.data === undefined ? {cards: []} : resolveDashboardConfiguration(query.data);

    return {
        profileUid: currentProfileUid,
        configuration: query.data,
        resolved,
        cards: getDashboardCards(resolved),
        isReady: query.data !== undefined,
        isLoading: query.isLoading,
        error: query.error,
        retry: () => { void query.refetch(); },
        saveConfiguration: (configuration: DashboardConfiguration | null) => {
            if (!currentProfileUid) return Promise.reject(new Error("No profile selected."));
            return mutation.mutateAsync({profileUid: currentProfileUid, configuration});
        },
    };
}

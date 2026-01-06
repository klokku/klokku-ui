import {Profile} from "@/api/types.ts";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";


type HookType = (username?: string) => {
    isLoadingAll: boolean,
    allProfiles?: Profile[]
    createProfile: (profile: Profile) => Promise<Profile>
    deleteProfile: (profileUid: string) => Promise<void>,
    isUsernameAvailable?: boolean,
    isCheckingUsername: boolean,
}

const useProfiles: HookType = (username) => {
    const queryClient = useQueryClient();
    const {isLoading: isLoadingAll, data: all} = useQuery({
        queryKey: ["allProfiles"],
        queryFn: async() => {
            const response = await fetch('/api/user', {
                method: "GET",
            })
            return (await response.json()) as Profile[]
        }
    })

    const {data: isUsernameAvailable, isLoading: isCheckingUsername} = useQuery({
        queryKey: ["usernameAvailable", username],
        queryFn: async() => {
            const response = await fetch(`/api/user/name-availability?username=${username}`, {
                method: "GET"
            })
            return (await response.json()).available as boolean
        },
        enabled: !!username && username.length >= 3
    })



    const create = useMutation({
        mutationFn: async (profile: Profile) => {
            const response = await fetch("/api/user", {
                method: "POST",
                body: JSON.stringify(profile),
            });

            if (!response.ok) {
                throw new Error("Failed to create profile");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["allProfiles"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const deleteIt = useMutation({
        mutationFn: async (profileUid: string) => {
            const response = await fetch(`/api/user/${profileUid}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to create profile");
            }
            return;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["allProfiles"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const createProfile = async (profile: Profile): Promise<Profile> => {
        return create.mutateAsync(profile);
    };

    const deleteProfile = async (profileUid: string) => {
        return deleteIt.mutateAsync(profileUid);
    };

    return {
        isLoadingAll,
        allProfiles: all,
        createProfile,
        deleteProfile,
        isUsernameAvailable,
        isCheckingUsername
    }
}

export default useProfiles;

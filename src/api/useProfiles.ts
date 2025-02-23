import {Profile} from "@/api/types.ts";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";


type HookType = () => {
    isLoadingAll: boolean,
    allProfiles?: Profile[]
    createProfile: (profile: Profile) => Promise<Profile>
    deleteProfile: (profileId: number) => Promise<void>,
}

const useProfiles: HookType = () => {
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
        mutationFn: async (profileId: number) => {
            const response = await fetch(`/api/user/${profileId}`, {
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

    const deleteProfile = async (profileId: number) => {
        return deleteIt.mutate(profileId);
    };

    return {
        isLoadingAll,
        allProfiles: all,
        createProfile,
        deleteProfile,
    }
}

export default useProfiles;

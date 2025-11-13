import {Profile} from "@/api/types.ts";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";


type HookType = () => {
    isLoadingCurrent: boolean,
    currentProfile?: Profile,
    updateProfile: (user: Profile) => Promise<Profile>,
    isUploadingAvatar: boolean,
    uploadAvatarImage: (file: File) => Promise<void>,
    isLoadingAvatar: boolean,
    avatar?: Blob,
    deleteAvatarImage: () => Promise<void>
}

const useProfile: HookType = () => {
    let isUploadingAvatar: boolean = false
    const { currentProfileUid } = useCurrentProfile()
    const fetchWithAuth = useFetchWithProfileUid()
    const queryClient = useQueryClient();

    const {isLoading: isLoadingCurrent, data: current} = useQuery({
        queryKey: ["currentProfile"],
        queryFn: async () => {
            const response = await fetchWithAuth("/api/user/current", {
                method: "GET",
            })
            if (!response.ok) {
                throw new Error("Failed to fetch profile");
            }
            return (await response.json()) as Profile
        },
        enabled: !!currentProfileUid,
        retry: false,
    });

    const {isLoading: isLoadingAvatar, data: avatar} = useQuery({
        queryKey: ["profileAvatar"],
        queryFn: async () => {
            const response = await fetchWithAuth("/api/user/current/photo", {
                method: "GET",
            })
            if (!response.ok) {
                throw new Error("Failed to fetch profile avatar")
            }
            return (await response.blob())
        },
    })

    const update = useMutation({
        mutationFn: async (profile: Profile) => {
            const response = await fetchWithAuth("/api/user/current", {
                method: "PUT",
                body: JSON.stringify(profile),
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["allProfiles"]});
            queryClient.invalidateQueries({queryKey: ["currentProfile"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    const uploadAvatar = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("photo", file);
            isUploadingAvatar = true
            const response = await fetchWithAuth("/api/user/current/photo", {
                method: "PUT",
                body: formData,
            });
            if (!response.ok) {
                throw new Error("Failed to update avatar image");
            }
        },
        onSuccess: () => {
            isUploadingAvatar = false
            queryClient.invalidateQueries({queryKey: ["allProfiles"]});
            queryClient.invalidateQueries({queryKey: ["currentProfile"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
            isUploadingAvatar = false
        },
    })

    const deleteAvatar = useMutation({
        mutationFn: async () => {
            const response = await fetchWithAuth("/api/user/current/photo", {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete avatar image");
            }
        }
    })

    const updateProfile = async (profile: Profile): Promise<Profile> => {
        return update.mutateAsync(profile);
    };

    const uploadAvatarImage = async (file: File): Promise<void> => {
        return uploadAvatar.mutateAsync(file)
    }

    const deleteAvatarImage = async (): Promise<void> => {
        return deleteAvatar.mutateAsync()
    }


    return {
        isLoadingCurrent,
        currentProfile: current,
        updateProfile,
        isUploadingAvatar,
        uploadAvatarImage,
        isLoadingAvatar,
        avatar,
        deleteAvatarImage,
    }
}

export default useProfile;

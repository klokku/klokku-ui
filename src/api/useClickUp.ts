import {
    ClickUpAuthRedirect,
    ClickUpConfig,
    ClickUpFolder,
    ClickUpSpace,
    ClickUpTag,
    ClickUpTask,
    ClickUpWorkspace
} from "@/api/types.ts";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {fetchWithProfileId} from "@/api/fetchWithProfileId.ts";

type HookType = () => {
    isAuthenticated: boolean;
    isLoadingWorkspaces: boolean;
    workspaces?: ClickUpWorkspace[];
    isLoadingSpaces: boolean;
    spaces?: ClickUpSpace[];
    isLoadingFolders: boolean;
    folders?: ClickUpFolder[];
    isLoadingTags: boolean;
    tags?: ClickUpTag[];
    isLoadingConfig: boolean;
    config?: ClickUpConfig;
    authLogin: () => Promise<ClickUpAuthRedirect>;
    authLogout: () => Promise<void>;
    getSpaces: (workspaceId: number) => Promise<ClickUpSpace[]>;
    getFolders: (spaceId: number) => Promise<ClickUpFolder[]>;
    getTags: (spaceId: number) => Promise<ClickUpTag[]>;
    getTasks: (budgetId: number) => Promise<ClickUpTask[]>;
    saveConfig: (config: ClickUpConfig) => Promise<void>;
}

const useClickUp: HookType = () => {
    const { currentProfileId } = useCurrentProfile()
    const queryClient = useQueryClient();

    // Check if user is authenticated with ClickUp
    const { data: isAuthenticated = false } = useQuery({
        queryKey: ["clickUpAuthenticated", currentProfileId],
        queryFn: async () => {
            const response = await fetchWithProfileId("/api/integrations/clickup/auth", currentProfileId, {
                method: "GET",
            })
            if (!response.ok) {
                return false;
            }
            return (await response.json()) as boolean;
        },
        enabled: !!currentProfileId,
        retry: false,
    });

    // Get ClickUp workspaces
    const { isLoading: isLoadingWorkspaces, data: workspaces } = useQuery({
        queryKey: ["clickUpWorkspaces", currentProfileId],
        queryFn: async () => {
            if (!isAuthenticated) return [];

            const response = await fetchWithProfileId("/api/integrations/clickup/workspace", currentProfileId, {
                method: "GET",
            })
            if (!response.ok) {
                throw new Error("Failed to fetch ClickUp workspaces");
            }
            return (await response.json()) as ClickUpWorkspace[]
        },
        enabled: isAuthenticated && !!currentProfileId,
        retry: false,
    });

    // Get ClickUp spaces for a workspace
    const { isLoading: isLoadingSpaces, data: spaces } = useQuery({
        queryKey: ["clickUpSpaces", currentProfileId],
        queryFn: async () => {
            if (!isAuthenticated) return [];

            // This will be replaced by the getSpaces function when a workspace is selected
            return [] as ClickUpSpace[];
        },
        enabled: false, // Disabled by default, will be triggered by getSpaces
        retry: false,
    });

    // Get ClickUp folders for a space
    const { isLoading: isLoadingFolders, data: folders } = useQuery({
        queryKey: ["clickUpFolders", currentProfileId],
        queryFn: async () => {
            if (!isAuthenticated) return [];

            // This will be replaced by the getFolders function when a space is selected
            return [] as ClickUpFolder[];
        },
        enabled: false, // Disabled by default, will be triggered by getFolders
        retry: false,
    });

    // Get ClickUp tags for a workspace
    const { isLoading: isLoadingTags, data: tags } = useQuery({
        queryKey: ["clickUpTags", currentProfileId],
        queryFn: async () => {
            if (!isAuthenticated) return [];

            // This will be replaced by the getTags function when a workspace is selected
            return [] as ClickUpTag[];
        },
        enabled: false, // Disabled by default, will be triggered by getTags
        retry: false,
    });

    // Get ClickUp configuration
    const { isLoading: isLoadingConfig, data: config } = useQuery({
        queryKey: ["clickUpConfig", currentProfileId],
        queryFn: async () => {
            if (!isAuthenticated) return undefined;

            const response = await fetchWithProfileId("/api/integrations/clickup/configuration", currentProfileId, {
                method: "GET",
            })
            if (!response.ok) {
                if (response.status === 404) {
                    // No configuration found, return undefined
                    return undefined;
                }
                throw new Error("Failed to fetch ClickUp configuration");
            }
            return (await response.json()) as ClickUpConfig;
        },
        enabled: isAuthenticated && !!currentProfileId,
        retry: false,
    });

    // ClickUp authentication login
    const authLoginClickUp = useMutation({
        mutationFn: async () => {
            const response = await fetchWithProfileId("/api/integrations/clickup/auth/login?finalUrl=" + encodeURI(window.location.href), currentProfileId, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error("ClickUp integration authentication failed");
            }
            return (response.json()) as ClickUpAuthRedirect;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["currentProfile"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    // ClickUp authentication logout
    const authLogoutClickUp = useMutation({
        mutationFn: async () => {
            const response = await fetchWithProfileId("/api/integrations/clickup/auth", currentProfileId, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("ClickUp integration logout failed");
            }
            return;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["currentProfile"]});
            queryClient.invalidateQueries({queryKey: ["clickUpAuthenticated"]});
            queryClient.invalidateQueries({queryKey: ["clickUpWorkspaces"]});
            queryClient.invalidateQueries({queryKey: ["clickUpSpaces"]});
            queryClient.invalidateQueries({queryKey: ["clickUpFolders"]});
            queryClient.invalidateQueries({queryKey: ["clickUpTags"]});
            queryClient.invalidateQueries({queryKey: ["clickUpConfig"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    // Save ClickUp configuration
    const saveClickUpConfig = useMutation({
        mutationFn: async (config: ClickUpConfig) => {
            const response = await fetchWithProfileId("/api/integrations/clickup/configuration", currentProfileId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(config),
            });

            if (!response.ok) {
                throw new Error("Failed to save ClickUp configuration");
            }
            return;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["clickUpConfig"]});
        },
        onError: (error) => {
            console.log(">>>error", error);
        },
    });

    // Get spaces for a workspace
    const getSpaces = async (workspaceId: number): Promise<ClickUpSpace[]> => {
        const response = await fetchWithProfileId(`/api/integrations/clickup/space?workspaceId=${workspaceId}`, currentProfileId, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch ClickUp spaces");
        }
        const data = await response.json() as ClickUpSpace[];
        queryClient.setQueryData(["clickUpSpaces", currentProfileId], data);
        return data;
    };

    // Get folders for a space
    const getFolders = async (spaceId: number): Promise<ClickUpFolder[]> => {
        const response = await fetchWithProfileId(`/api/integrations/clickup/folder?spaceId=${spaceId}`, currentProfileId, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch ClickUp folders");
        }
        const data = await response.json() as ClickUpFolder[];
        queryClient.setQueryData(["clickUpFolders", currentProfileId], data);
        return data;
    };

    // Get tags for a workspace
    const getTags = async (spaceId: number): Promise<ClickUpTag[]> => {
        const response = await fetchWithProfileId(`/api/integrations/clickup/tag?spaceId=${spaceId}`, currentProfileId, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch ClickUp tags");
        }
        const data = await response.json() as ClickUpTag[];
        queryClient.setQueryData(["clickUpTags", currentProfileId], data);
        return data;
    };

    // Get tasks for a budget
    const getTasks = async (budgetId: number): Promise<ClickUpTask[]> => {
        const response = await fetchWithProfileId(`/api/integrations/clickup/tasks?budgetId=${budgetId}`, currentProfileId, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch ClickUp tasks");
        }
        const data = await response.json() as ClickUpTask[];
        return data;
    };

    const authLogin = async (): Promise<ClickUpAuthRedirect> => {
        return authLoginClickUp.mutateAsync();
    };

    const authLogout = async (): Promise<void> => {
        return authLogoutClickUp.mutateAsync();
    };

    const saveConfig = async (config: ClickUpConfig): Promise<void> => {
        return saveClickUpConfig.mutateAsync(config);
    };

    return {
        isAuthenticated,
        isLoadingWorkspaces,
        workspaces,
        isLoadingSpaces,
        spaces,
        isLoadingFolders,
        folders,
        isLoadingTags,
        tags,
        isLoadingConfig,
        config,
        authLogin,
        authLogout,
        getSpaces,
        getFolders,
        getTags,
        getTasks,
        saveConfig,
    };
};

export default useClickUp;

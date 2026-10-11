import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import {paths} from "@/pages/links.ts";
import {SESSION_EXPIRED_EVENT} from "@/lib/sessionExpired";

export const fetchWithProfileUid = async (
    url: string,
    currentProfileUid: string | null,
    options: RequestInit = {}
) => {
    if (!currentProfileUid) {
        throw new Error('No profile id found');
    }
    const response = await addHeaders(fetch, url, currentProfileUid, options);

    if (response.status === 401) {
        const shouldRedirect = window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, {
            cancelable: true,
            detail: {profileUid: currentProfileUid},
        }));
        if (shouldRedirect) window.location.href = paths.start.path;
        throw new Error('Unauthorized');
    }

    return response;
};

const addHeaders = async (
    fetchFn: (url: string, options?: RequestInit) => Promise<Response>,
    url: string,
    currentProfileUid: string | null,
    options: RequestInit = {}
) => {
    const headers = {
        ...options.headers,
        'X-User-Id': currentProfileUid?.toString() || '',
    };

    const customOptions = {
        ...options,
        headers,
    };

    return fetchFn(url, customOptions);
};

export const useFetchWithProfileUid = () => {
    const {currentProfileUid} = useCurrentProfile();

    return (url: string, options: RequestInit = {}) => {
        return fetchWithProfileUid(url, currentProfileUid, options);
    };
};

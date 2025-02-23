export const fetchWithProfileId = async (
    url: string,
    currentProfileId: number | null,
    options: RequestInit = {}
) => {
    if (!currentProfileId) {
        throw new Error('No profile id');
    }
    return addHeaders(fetch, url, currentProfileId, options);
};

const addHeaders = async (
    fetchFn: (url: string, options?: RequestInit) => Promise<any>,
    url: string,
    currentProfileId: number | null,
    options: RequestInit = {}
) => {
    const headers = {
        ...options.headers,
        'X-User-Id': currentProfileId?.toString() || '',
    };

    const customOptions = {
        ...options,
        headers,
    };

    return fetchFn(url, customOptions);
};

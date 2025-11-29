import {useQuery} from "@tanstack/react-query";
import {useFetchWithProfileUid} from "@/api/fetchWithProfileUid.ts";

const securityStatusUrl = import.meta.env.VITE_KLOKKU_EXTERNAL_SECURITY_STATUS_ENDPOINT

type HookType = () => {
    isLoading: boolean,
    externalSecurityEnabled: boolean | undefined,
}

const useExternalSecurity: HookType = () => {
    const fetchWithAuth = useFetchWithProfileUid();
    const {isLoading, data} = useQuery({
        queryKey: ["externalAuthEnabled"],
        queryFn: async () => {
            const response = await fetchWithAuth(securityStatusUrl)
            if (response.ok) {
                const responseJson = await response.json()
                return responseJson.status === "OK"
            }
            return false
        }
    })

    return {
        isLoading,
        externalSecurityEnabled: data
    }
}

export default useExternalSecurity;

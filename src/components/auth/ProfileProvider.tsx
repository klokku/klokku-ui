interface CurrentProfileResponse {
    uid: string | null;
    isAuthenticated: boolean;
    hasProfile: boolean;
}

async function getCurrentProfile(): Promise<CurrentProfileResponse> {
    const profileUid = localStorage.getItem("profileUid");
    if (profileUid === null) {
        console.log("No profile id found in local storage. Fetching from API...");
        const currentAuthenticatedUserResponse = await fetch('/api/user/current', {
            method: 'GET',
        })
        if (currentAuthenticatedUserResponse.ok) {
            const responseJson = await currentAuthenticatedUserResponse.json();
            return {
                uid: responseJson.uid,
                isAuthenticated: true,
                hasProfile: true,
            };
        } else if (currentAuthenticatedUserResponse.status === 403) {
            // Forbidden means the user is authenticated but doesn't have a profile yet
            return {uid: null, isAuthenticated: true, hasProfile: false};
        }
        return {uid: null, isAuthenticated: false, hasProfile: false};
    }
    return { uid: profileUid, isAuthenticated: true, hasProfile: true};
}

function setCurrentProfileUid(profileUid: string) {
    localStorage.setItem("profileUid", profileUid.toString());
}

function clearProfileUid() {
    localStorage.removeItem("profileUid");
}

export { getCurrentProfile, setCurrentProfileUid, clearProfileUid };

function getCurrentProfileId(): number | null {
    const profileId = localStorage.getItem("profileId");
    return profileId !== null ? parseInt(profileId) : null;
}

function setCurrentProfileId(profileId: number) {
    localStorage.setItem("profileId", profileId.toString());
}

function clearProfileId() {
    localStorage.removeItem("profileId");
}

export { getCurrentProfileId, setCurrentProfileId, clearProfileId };

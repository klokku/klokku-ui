import {PropsWithChildren, useEffect, useState} from "react";
import {paths} from "@/pages/links.ts";
import {getCurrentProfile} from "@/components/auth/ProfileProvider.tsx";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import {Navigate} from "react-router-dom";
import {Spinner} from "@/components/ui/spinner.tsx";

type Props = {};

const ProtectedRoute = ({children}: PropsWithChildren<Props>) => {

    const [isLoading, setIsLoading] = useState(true);
    const [isProfileSet, setIsProfileSet] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const {setCurrentProfileUid} = useCurrentProfile();

    useEffect(() => {
            const checkProfileSet = async () => {
                try {
                    const currentProfile = await getCurrentProfile();
                    const profileKnown = currentProfile.uid !== null;
                    setIsProfileSet(profileKnown);

                    if (profileKnown) {
                        setCurrentProfileUid(currentProfile.uid);
                    }
                    setIsAuthenticated(currentProfile.isAuthenticated);
                } catch (error) {
                    console.error('Authentication check failed:', error);
                    setIsProfileSet(false);
                    setIsAuthenticated(false);
                } finally {
                    setIsLoading(false);
                }
            };

            checkProfileSet();

        },
        [setCurrentProfileUid])

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <Spinner className="size-8" />
            </div>
        )
    }

    // Redirect to create page if profile is unknown, but the user is authenticated
    if (!isProfileSet && isAuthenticated) {
        // redirect with navigation to paths.createProfile.path
        return <Navigate to={paths.createProfile.path} replace={true} />
    }

    // Redirect to login if not authenticated
    if (!isProfileSet) {
        window.location.href = paths.start.path
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <Spinner className="size-8" />
            </div>
        )
    }

    // Render protected content
    return children

};

export default ProtectedRoute;

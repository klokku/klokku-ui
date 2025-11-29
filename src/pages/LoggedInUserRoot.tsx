import ProtectedRoute from "@/components/auth/ProtectedRoute.tsx";
import {Outlet} from "react-router";
import {CurrentProfileProvider} from "@/hooks/currentProfileContext.tsx";

export default function LoggedInUserRoot() {
    return (
        <CurrentProfileProvider>
            <ProtectedRoute>
                <Outlet/>
            </ProtectedRoute>
        </CurrentProfileProvider>
    );
}

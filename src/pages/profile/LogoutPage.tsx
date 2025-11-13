import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";
import {clearProfileUid} from "@/components/auth/ProfileProvider.tsx";
import {paths} from "@/pages/links.ts";
import {useNavigate} from "react-router-dom";
import {Spinner} from "@/components/ui/spinner.tsx";

export const LogoutPage = () => {
    const navigate = useNavigate();
    const {setCurrentProfileUid} = useCurrentProfile()

    const logout = () => {
        setCurrentProfileUid(null);
        clearProfileUid()
    }

    logout();
    navigate(paths.root.path);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
            <Spinner className="size-8"/>
        </div>
    )
}

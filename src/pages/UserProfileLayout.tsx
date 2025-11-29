import {Outlet} from "react-router";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {useLocation} from "react-router-dom";
import {paths} from "@/pages/links.ts";
import {UserProfileSidebar} from "@/components/sidebar/UserProfileSidebar.tsx";
import useExternalSecurity from "@/api/useExternalSecurity.ts";
import {Spinner} from "@/components/ui/spinner.tsx";

export default function UserProfileLayout() {
    const location = useLocation();

    const {isLoading} = useExternalSecurity()

    function findTitle(path: string) {
        for (const [_, value] of Object.entries(paths)) {
            if (value.path === path) return value.title;
        }
        return "Unknown";
    }

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <Spinner className="size-8" />
            </div>
        )
    }

    return (
        <div className="flex flex-col w-screen">
            <SidebarProvider>
                <UserProfileSidebar/>
                <SidebarInset className="w-full">
                    <header className="flex h-11 shrink-0 items-center gap-2 border-b px-4 text-sm">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator orientation="vertical" className="mr-1 h-4"/>
                        <span>{findTitle(location.pathname)}</span>
                    </header>
                    <div className="p-4">
                        <Outlet/>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}

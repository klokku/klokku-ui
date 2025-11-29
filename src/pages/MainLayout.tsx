import {Outlet} from "react-router";
import {Topbar} from "@/components/topbar/topbar.tsx";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/sidebar/AppSidebar.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {useLocation} from "react-router-dom";
import {paths} from "@/pages/links.ts";

export default function MainLayout() {
    const location = useLocation();

    function findTitle(path: string) {
        for (const [_, value] of Object.entries(paths)) {
            if (value.path === path) return value.title;
        }
        return "Unknown";
    }

    return (
        <div className="flex flex-col w-screen">
            <Topbar/>
            <SidebarProvider className="min-h-[calc(100svh-48px)]">
                <AppSidebar/>
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

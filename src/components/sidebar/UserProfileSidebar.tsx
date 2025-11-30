import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {ArrowLeftIcon, BlocksIcon, CodeIcon, LockIcon, UserIcon} from "lucide-react";
import {paths} from "@/pages/links.ts";
import {NavLink} from "react-router";
import {useLocation, useNavigate} from "react-router-dom";
import useExternalSecurity from "@/api/useExternalSecurity.ts";
import {Button} from "@/components/ui/button.tsx";

const items = [
    {
        title: paths.profile.title,
        url: paths.profile.path,
        icon: UserIcon,
        onSecurityEnabledOnly: false,
        redirect: false,
    },
    {
        title: paths.security.title,
        url: paths.security.path,
        icon: LockIcon,
        onSecurityEnabledOnly: true,
        redirect: true,
    },
    {
        title: paths.integrations.title,
        url: paths.integrations.path,
        icon: BlocksIcon,
        onSecurityEnabledOnly: false,
        redirect: false,
    },
    {
        title: paths.apiKeys.title,
        url: paths.apiKeys.path,
        icon: CodeIcon,
        onSecurityEnabledOnly: true,
        redirect: true,
    },
]

export function UserProfileSidebar() {
    const location = useLocation();
    const {setOpenMobile} = useSidebar();
    const {externalSecurityEnabled} = useExternalSecurity()
    const navigate = useNavigate()

    const redirectIfNeeded = (item: {url: string, redirect?: boolean}) => {
        if (item.redirect) {
            window.location.href = item.url;
        } else {
            navigate(item.url);
        }
    }

    const onMenuItemClick = (item: {url: string, redirect?: boolean}) => {
        redirectIfNeeded(item);
        setOpenMobile(false);
    }

    return (
        <Sidebar variant="inset">
            <SidebarHeader className="flex items-center justify-between px-4  border-b-2 border-accent">
                <SidebarMenuButton asChild className="h-11 gap-x-3">
                    <NavLink to="/" onClick={() => setOpenMobile(false)}>
                        <ArrowLeftIcon/>
                        <span>Back to Klokku</span>
                    </NavLink>
                </SidebarMenuButton>
            </SidebarHeader>
            <SidebarContent className="mt-2">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {
                                items.filter((item) => {
                                    return !(!externalSecurityEnabled && item.onSecurityEnabledOnly);
                                }).map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={location.pathname == item.url} className="h-11 gap-x-3">
                                            <Button variant="link" className="w-full justify-start text-left cursor-pointer hover:no-underline"
                                                    onClick={() => onMenuItemClick(item)}>
                                                <item.icon/>
                                                <span>{item.title}</span>
                                            </Button>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup/>
            </SidebarContent>
            <SidebarFooter/>
        </Sidebar>
    )
}

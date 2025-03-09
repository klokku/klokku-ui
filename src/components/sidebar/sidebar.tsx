import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent, SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar"
import {CalendarDaysIcon, ChartPieIcon, FolderKanbanIcon, LayoutDashboardIcon} from "lucide-react";
import {paths} from "@/pages/links.ts";
import {NavLink} from "react-router";
import {useLocation} from "react-router-dom";

const items = [
    {
        title: paths.root.title,
        url: paths.root.path,
        icon: LayoutDashboardIcon
    },
    {
        title: paths.statistics.title,
        url: paths.statistics.path,
        icon: ChartPieIcon
    },
    {
        title: paths.calendar.title,
        url: paths.calendar.path,
        icon: CalendarDaysIcon
    },
    {
        title: paths.budgets.title,
        url: paths.budgets.path,
        icon: FolderKanbanIcon
    },
]

export function AppSidebar() {
    const location = useLocation();
    const { setOpenMobile } = useSidebar();

    return (
        <Sidebar variant="sidebar" className="absolute inset-y-[48px] z-10 h-[calc(100svh-48px)]">
            <SidebarContent className="mt-2">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={location.pathname == item.url}  className="h-11 gap-x-3">
                                        <NavLink to={item.url} onClick={() => setOpenMobile(false)}>
                                            <item.icon/>
                                            <span>{item.title}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup />
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}

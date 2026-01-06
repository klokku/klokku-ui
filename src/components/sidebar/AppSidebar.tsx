import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {CalendarDaysIcon, ChartBarIcon, HistoryIcon, LayoutDashboardIcon} from "lucide-react";
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
        title: paths.history.title,
        url: paths.history.path,
        icon: HistoryIcon
    },
    {
        title: paths.calendar.title,
        url: paths.calendar.path,
        icon: CalendarDaysIcon
    },
    {
        title: paths.weeklyPlanning.title,
        url: paths.weeklyPlanning.path,
        icon: ChartBarIcon,
        items: [
            {
                title: "Weekly",
                url: paths.weeklyPlanning.path,
            },
            {
                title: "Budget Plans",
                url: paths.budgets.path,
            },
        ]
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
                                    {item.items?.length ? (
                                        <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                                            {item.items.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild isActive={location.pathname == item.url} className="h-8">
                                                        <NavLink to={item.url} onClick={() => setOpenMobile(false)}>
                                                            <span>{item.title}</span>
                                                        </NavLink>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    ) : null}
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

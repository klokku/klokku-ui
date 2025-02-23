import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {CalendarDaysIcon, ChartPieIcon, FolderKanbanIcon, LayoutDashboardIcon} from "lucide-react";
import {paths} from "@/pages/links.ts";
import {useNavigate} from "react-router-dom";

const pagesItems = [
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

type CommandMenuProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

export function CommandMenu({open, setOpen}: CommandMenuProps) {
    const navigate = useNavigate();

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..."/>
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Pages">
                    {pagesItems.map((item) => (
                        <CommandItem key={item.title} onSelect={() => { navigate(item.url); setOpen(false) }}>
                            <item.icon/>
                            <span>{item.title}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}

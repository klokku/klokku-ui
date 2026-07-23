import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {createElement} from "react";
import {CalendarDaysIcon, ChartPieIcon, CheckIcon, FolderKanbanIcon, LayoutDashboardIcon} from "lucide-react";
import * as Icons from "lucide-react";
import {paths} from "@/pages/links.ts";
import {useNavigate} from "react-router-dom";
import useWeeklyPlan from "@/api/useWeeklyPlan.ts";
import useCurrentEvent from "@/api/useCurrentEvent.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {toast} from "sonner";

const pagesItems = [
    {
        title: paths.root.title,
        url: paths.root.path,
        icon: LayoutDashboardIcon
    },
    {
        title: paths.history.title,
        url: paths.history.path,
        icon: ChartPieIcon
    },
    {
        title: paths.calendar.title,
        url: paths.calendar.path,
        icon: CalendarDaysIcon
    },
    {
        title: paths.budgetPlans.title,
        url: paths.budgetPlans.path,
        icon: FolderKanbanIcon
    },
]

type CommandMenuProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

const getIcon = (iconName: string, className: string) => {
    const key = iconName as keyof typeof Icons;
    const iconComponent = Icons[key] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
    return iconComponent ? createElement(iconComponent, {className}) : null
};

export function CommandMenu({open, setOpen}: CommandMenuProps) {
    const navigate = useNavigate();
    const {weeklyPlan, isLoading: isLoadingWeeklyPlan} = useWeeklyPlan(new Date());
    const {currentEvent, startEvent, loadingCurrentEvent} = useCurrentEvent();

    const handleTrackItem = async (budgetItemId: number, name: string, weeklyDuration: number) => {
        if (budgetItemId === currentEvent?.planItem.budgetItemId) {
            setOpen(false)
            return
        }

        try {
            await startEvent(budgetItemId, name, weeklyDuration)
            setOpen(false)
        } catch {
            toast.error("Failed to start tracking", {
                description: `Could not start tracking "${name}". Please try again.`,
            })
        }
    }

    const isLoading = isLoadingWeeklyPlan || loadingCurrentEvent;

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
                {weeklyPlan && (
                    <CommandGroup heading="Track">
                        {isLoading ? (
                            <>
                                <Skeleton className="h-9 w-full rounded-sm"/>
                                <Skeleton className="h-9 w-full rounded-sm"/>
                                <Skeleton className="h-9 w-full rounded-sm"/>
                            </>
                        ) : weeklyPlan.items.length === 0 ? (
                            <CommandEmpty>No items in this week's plan.</CommandEmpty>
                        ) : (
                            weeklyPlan.items.map((item) => {
                                const isTracked = item.budgetItemId === currentEvent?.planItem.budgetItemId;
                                return (
                                    <CommandItem
                                        key={item.budgetItemId}
                                        onSelect={() => handleTrackItem(item.budgetItemId, item.name, item.weeklyDuration)}
                                    >
                                        {item.icon ? getIcon(item.icon, "size-4") : <FolderKanbanIcon className="size-4"/>}
                                        <span>Track: {item.name}</span>
                                        {isTracked && <CheckIcon className="ml-auto size-4"/>}
                                    </CommandItem>
                                );
                            })
                        )}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    )
}

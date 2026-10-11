import {createElement} from "react";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import * as Icons from "lucide-react";
import {GripVertical, SquareStack} from "lucide-react";
import {BudgetPlanItem} from "@/api/types.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {formatSecondsToDuration} from "@/lib/dateUtils.ts";

interface SortableBudgetPlanItemRowProps {
    item: BudgetPlanItem;
    disabled: boolean;
    onEdit: (item: BudgetPlanItem) => void;
}

export function SortableBudgetPlanItemRow({item, disabled, onEdit}: SortableBudgetPlanItemRowProps) {
    const {attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging} = useSortable({
        id: item.id!,
        disabled: disabled || item.id === undefined,
    });
    const icon = Icons[item.icon as keyof typeof Icons] as React.ComponentType<React.SVGProps<SVGSVGElement>>;

    return (
        <TableRow ref={setNodeRef}
                  style={{transform: CSS.Translate.toString(transform), transition}}
                  className={isDragging ? "relative z-10 bg-background shadow-lg" : undefined}>
            <TableCell className="cursor-pointer font-medium hover:text-blue-500" onClick={() => onEdit(item)}>
                <div className="flex gap-2 items-center">
                    {item.color && <div className="w-1 h-5 rounded-full flex-shrink-0" style={{backgroundColor: item.color}}/>}
                    {icon ? createElement(icon, {className: "size-5 text-gray-500"}) : <SquareStack className="size-5 text-gray-500"/>}
                    {item.name}
                </div>
            </TableCell>
            <TableCell>{formatSecondsToDuration(item.weeklyDuration)}</TableCell>
            <TableCell>{formatSecondsToDuration(item.weeklyDuration / 7)}</TableCell>
            <TableCell className="hidden md:table-cell">
                {item.weeklyOccurrences !== 0 ? item.weeklyOccurrences : <Badge variant="outline" className="text-gray-500">undefined</Badge>}
            </TableCell>
            <TableCell className="text-right">
                <Button ref={setActivatorNodeRef} type="button" variant="ghost" size="icon"
                        className="touch-none cursor-grab active:cursor-grabbing aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
                        {...attributes} {...listeners} aria-disabled={disabled || item.id === undefined}
                        aria-label={`Drag ${item.name} to reorder`}>
                    <GripVertical className="size-4" aria-hidden="true"/>
                </Button>
            </TableCell>
        </TableRow>
    );
}

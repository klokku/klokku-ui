import {useState} from "react";
import {closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {ArrowDown, ArrowUp, GripVertical, Lock, Settings2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {DashboardConfiguration, getDashboardCards, resolveDashboardConfiguration} from "./dashboardConfiguration";

type ResolvedCard = ReturnType<typeof getDashboardCards>[number];

function SortableCard({card, index, count, disabled, onMove, onToggle}: {
    card: ResolvedCard; index: number; count: number; disabled: boolean;
    onMove: (offset: number) => void; onToggle: (visible: boolean) => void;
}) {
    const {attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging} = useSortable({id: card.id, disabled});
    return <li ref={setNodeRef} style={{transform: CSS.Transform.toString(transform), transition}}
               className={`flex items-center gap-2 rounded-md border bg-background p-2 ${isDragging ? "relative z-10 shadow-lg" : ""}`}>
        <Button ref={setActivatorNodeRef} variant="ghost" size="icon" className="touch-none shrink-0 cursor-grab active:cursor-grabbing"
                disabled={disabled} {...attributes} {...listeners} aria-label={`Drag ${card.title} to reorder`}>
            <GripVertical className="size-4" aria-hidden="true"/>
        </Button>
        <span className="min-w-0 flex-1 text-sm font-medium">{card.title}</span>
        <Switch checked={card.visible} disabled={disabled} onCheckedChange={onToggle} aria-label={`Show ${card.title}`}/>
        <div className="flex shrink-0">
            <Button variant="ghost" size="icon" disabled={disabled || index === 0} onClick={() => onMove(-1)} aria-label={`Move ${card.title} up`}>
                <ArrowUp className="size-4" aria-hidden="true"/>
            </Button>
            <Button variant="ghost" size="icon" disabled={disabled || index === count - 1} onClick={() => onMove(1)} aria-label={`Move ${card.title} down`}>
                <ArrowDown className="size-4" aria-hidden="true"/>
            </Button>
        </div>
    </li>;
}

export function DashboardCustomization({configuration, onSave, compact = false}: {
    configuration: DashboardConfiguration | null;
    onSave: (configuration: DashboardConfiguration | null) => Promise<unknown>;
    compact?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<DashboardConfiguration | null>(configuration);
    const [error, setError] = useState<string>();
    const [saving, setSaving] = useState(false);
    const [announcement, setAnnouncement] = useState("");
    const [dragging, setDragging] = useState(false);
    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 8}}),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );
    const resolved = resolveDashboardConfiguration(draft);
    const cards = getDashboardCards(resolved);
    const moveCard = (id: string, targetId: string) => {
        const from = resolved.cards.findIndex(card => card.id === id);
        const to = resolved.cards.findIndex(card => card.id === targetId);
        if (from === -1 || to === -1 || from === to) return;
        const moved = {cards: arrayMove(resolved.cards, from, to)};
        setDraft(moved);
        const known = getDashboardCards(moved);
        setAnnouncement(`${cards.find(card => card.id === id)?.title} moved to position ${known.findIndex(card => card.id === id) + 2}.`);
    };
    const dragEnd = ({active, over}: DragEndEvent) => {
        setDragging(false);
        if (over) moveCard(String(active.id), String(over.id));
    };
    const changeOpen = (nextOpen: boolean) => {
        if (saving) return;
        if (nextOpen) {
            setDraft(configuration);
            setError(undefined);
            setAnnouncement("");
        }
        setOpen(nextOpen);
    };
    const save = async () => {
        setSaving(true);
        setError(undefined);
        try {
            await onSave(draft === null ? null : resolved);
            setOpen(false);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Could not save your dashboard. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return <Dialog open={open} onOpenChange={changeOpen}>
        <DialogTrigger asChild><Button variant={compact ? "ghost" : "outline"} size={compact ? "icon" : "sm"}
            className={compact ? "size-8" : undefined} aria-label="Customize dashboard" title={compact ? "Customize dashboard" : undefined}>
            <Settings2 className="size-4" aria-hidden="true"/>{!compact && "Customize dashboard"}
        </Button></DialogTrigger>
        <DialogContent className="max-h-[calc(100dvh-2rem)] flex flex-col p-4 sm:p-6" showCloseButton={!saving}
                       onEscapeKeyDown={event => { if (dragging || saving) event.preventDefault(); }}>
            <DialogHeader>
                <DialogTitle>Customize dashboard</DialogTitle>
                <DialogDescription>Choose your cards and their order. Changes apply to this profile on all devices after saving.</DialogDescription>
            </DialogHeader>
            <div className="min-h-0 overflow-y-auto space-y-2">
                <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-3">
                    <Lock className="size-4 shrink-0" aria-hidden="true"/>
                    <div><p className="text-sm font-medium">Tracking now</p><p className="text-xs text-muted-foreground">Always visible and first</p></div>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={() => setDragging(true)} onDragEnd={dragEnd} onDragCancel={() => setDragging(false)}>
                    <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
                        <ol aria-label="Dashboard cards" className="space-y-2">
                            {cards.map((card, index) => <SortableCard key={card.id} card={card} index={index} count={cards.length} disabled={saving}
                                onMove={offset => moveCard(card.id, cards[index + offset].id)}
                                onToggle={visible => setDraft({cards: resolved.cards.map(item => item.id === card.id ? {...item, visible} : item)})}/>) }
                        </ol>
                    </SortableContext>
                </DndContext>
                <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogFooter className="shrink-0">
                <Button variant="ghost" className="sm:mr-auto" disabled={saving} onClick={() => { setDraft(null); setAnnouncement("Default visibility and order restored. Save to apply."); }}>Restore defaults</Button>
                <Button variant="outline" disabled={saving} onClick={() => changeOpen(false)}>Cancel</Button>
                <Button disabled={saving} onClick={() => { void save(); }}>{saving ? "Saving..." : error ? "Retry save" : "Save"}</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>;
}

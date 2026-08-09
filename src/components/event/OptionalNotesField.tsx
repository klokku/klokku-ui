import {useId, useState} from "react";
import {PlusIcon, XIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";

type OptionalNotesFieldProps = {
    value: string;
    onChange: (value: string) => void;
    layout?: "stacked" | "inline";
}

export function OptionalNotesField({value, onChange, layout = "stacked"}: OptionalNotesFieldProps) {
    const [expanded, setExpanded] = useState(Boolean(value));
    const textareaId = useId();

    if (!expanded) {
        return (
            <Button
                type="button"
                variant="ghost"
                className={`h-auto w-fit px-0 text-muted-foreground ${layout === "stacked" ? "text-xs" : "text-sm"}`}
                onClick={() => setExpanded(true)}
            >
                <PlusIcon/>
                Add note
            </Button>
        );
    }

    const clear = () => {
        onChange("");
        setExpanded(false);
    };

    if (layout === "inline") {
        return (
            <div className="flex items-start">
                <Label htmlFor={textareaId} className="w-44 pt-2">Notes</Label>
                <div className="flex w-full items-start gap-1">
                    <Textarea
                        id={textareaId}
                        className="h-24"
                        placeholder="Add a note..."
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        autoFocus={!value}
                    />
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove note" onClick={clear}>
                        <XIcon/>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between">
                <Label htmlFor={textareaId} className="text-xs text-muted-foreground">Notes</Label>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove note" onClick={clear}>
                    <XIcon/>
                </Button>
            </div>
            <Textarea
                id={textareaId}
                className="h-20"
                placeholder="Add a note..."
                value={value}
                onChange={(event) => onChange(event.target.value)}
                autoFocus={!value}
            />
        </div>
    );
}

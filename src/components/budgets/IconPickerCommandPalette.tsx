import { useState } from "react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { CheckIcon } from "@heroicons/react/20/solid";
import {IconRenderer, useIconPicker} from "@/components/ui/icon-picker.tsx";

interface IconPickerCommandPaletteProps {
    value: string;
    onChanged: (icon: string) => void;
}

export const IconPickerCommandPalette = ({value, onChanged}: IconPickerCommandPaletteProps) => {
    const [open, setOpen] = useState(false);
    const { icons } = useIconPicker();

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger>
                <Button type="button" variant="outline" role="combobox" aria-expanded={open} className="min-w-[150px]">
                    {value ? (
                        <>
                            <IconRenderer className="size-4 text-zinc-500" icon={value} />
                            <span className="font-light"></span>
                        </>
                    ) : (
                        "Choose Icon"
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-sm p-0">
                <Command className="w-full max-w-sm">
                    <CommandInput placeholder="Search for icon..." />
                    <CommandList>
                        <CommandEmpty>No icons found.</CommandEmpty>
                        <CommandGroup>
                            {icons.map(({ name, Component, friendly_name }) => (
                                <CommandItem
                                    key={name}
                                    value={friendly_name}
                                    onSelect={() => {
                                        onChanged(name)
                                        setOpen(false);
                                    }}
                                    className="flex items-center gap-x-2 truncate capitalize"
                                >
                                    <Component />
                                    {friendly_name}
                                    <CheckIcon
                                        data-selected={value === name}
                                        className="ml-auto opacity-0 data-[selected=true]:opacity-100"
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

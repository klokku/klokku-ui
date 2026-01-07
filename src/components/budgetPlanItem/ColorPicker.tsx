import {useState} from "react";
import Circle from "@uiw/react-color-circle";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import Colorful from "@uiw/react-color-colorful";
import { getContrastingColor, } from '@uiw/color-convert';
import {Button} from "@/components/ui/button.tsx";

interface ColorPickerProps {
    color: string;
    onChange: (hex: string) => void;
}

export function ColorPicker({color, onChange}: ColorPickerProps) {

    const presetColors = [
        '#3B82F6', // Ocean Blue
        '#10B981', // Forest Green
        '#F59E0B', // Goldenrod
        '#8B5CF6', // Royal Purple
        '#06B6D4', // Cyan
        '#F43F5E', // Rosewood
        '#6366F1', // Indigo
        '#64748B', // Slate
        '#F97316', // Sunset Orange
    ];

    const [hex, setHex] = useState(color);
    const [customHex, setCustomHex] = useState(color);
    const [customColorDialogOpen, setCustomColorDialogOpen] = useState(false);

    const isCustomColorActive = hex === customHex && !presetColors.includes(hex.toUpperCase());

    return (
        <div className="flex gap-3 items-center">
            <Circle
                key="preset-colors-circle"
                colors={presetColors}
                color={hex}
                style={{
                    gap: 6
                }}
                rectProps={{
                    style: {
                        borderRadius: 2,
                        width: 10,
                        height: 10,
                    }
                }}
                pointProps={{
                    style: {
                        width: 24,
                        height: 24,
                        borderRadius: 5
                    },
                }}
                onChange={(color) => {
                    setHex(color.hex);
                    onChange(color.hex);
                }}
            />



            <Popover modal={true} open={customColorDialogOpen} onOpenChange={(open) => setCustomColorDialogOpen(open)}>
                <PopoverTrigger asChild>
                    <div
                        className={`flex items-center justify-center text-gray-500 cursor-pointer
                                    w-6 h-6 border rounded-[5px] transition-all duration-150
                                    ${isCustomColorActive ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
                        style={{ backgroundColor: customHex }}
                    >
                        {isCustomColorActive ? (
                            <div
                                className="w-2.5 h-2.5 rounded-xs border-0"
                                style={{ backgroundColor: getContrastingColor(customHex) }}
                            />
                        ) : (
                            <span className="leading-none mb-0.5" style={{ color: getContrastingColor(customHex) }}>+</span>
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                    <div className="flex flex-col gap-3">
                        <Colorful
                            color={customHex}
                            onChange={(color) => {
                                setCustomHex(color.hex);
                            }}
                            disableAlpha={true}
                        />
                        <Button
                            size="sm"
                            className="w-full"
                            onClick={() => {
                                setHex(customHex);
                                onChange(customHex);
                                setCustomColorDialogOpen(false);
                            }}
                        >
                            Apply Color
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

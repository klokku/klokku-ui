import {createElement} from "react";
import * as Icons from "lucide-react";
import {SquareStack as Square2StackIcon} from "lucide-react";

interface ReportItemNameProps {
    name: string;
    icon: string;
    color: string;
}

export function ReportItemName({name, icon, color}: ReportItemNameProps) {
    const getIcon = (iconName: string, className: string) => {
        const key = iconName as keyof typeof Icons;
        const iconComponent = Icons[key] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
        return iconComponent ? createElement(iconComponent, {className}) : null;
    };

    return (
        <div className="flex gap-2 items-center">
            {color && (
                <div
                    className="w-1 h-5 rounded-full flex-shrink-0"
                    style={{backgroundColor: color}}
                />
            )}
            {icon ? getIcon(icon, "size-4 text-gray-500") : <Square2StackIcon className="size-4 text-gray-500"/>}
            <span>{name}</span>
        </div>
    );
}

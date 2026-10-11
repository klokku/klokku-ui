import {SmartphoneIcon} from "lucide-react";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {usePwa} from "./pwaContext";

export function InstallMenuItem() {
    const {installed, install} = usePwa();
    const userAgent = navigator.userAgent;
    const isPhone = /iPhone/.test(userAgent) || (/Android/.test(userAgent) && /Mobile/.test(userAgent));
    if (installed || !isPhone) return null;
    return (
        <DropdownMenuItem onSelect={install}>
            <SmartphoneIcon className="opacity-50" aria-hidden="true"/>
            Install Klokku
        </DropdownMenuItem>
    );
}

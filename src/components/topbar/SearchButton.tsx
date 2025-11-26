import {Search} from "lucide-react"
import {Button} from "@/components/ui/button.tsx";

type SearchButtonProps = {
    onClick: () => void;
    className?: string;
};


export function SearchButton({onClick, className}: SearchButtonProps) {
    return (
        <div className={className + " relative"}>
            <Button variant="outline" onClick={onClick}
                    className="h-7 border-0 text-white/80 w-full text-left justify-start pl-8 bg-white/20
                        hover:text-white/90 focus:outline-hidden hover:bg-white/30">
                Search...
            </Button>
            <Search
                className="text-white pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-80 hover:opacity-100"/>
        </div>
    )
}

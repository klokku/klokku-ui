import HeaderLogo from "@/components/headerLogo/HeaderLogo.tsx";
import {SearchButton} from "@/components/topbar/SearchButton.tsx";
import {CommandMenu} from "@/components/commandMenu/CommandMenu.tsx";
import {useEffect, useState} from "react";
import {UserButton} from "@/components/topbar/UserButton.tsx";
import {BudgetSelect} from "@/components/topbar/BudgetSelect.tsx";
import useProfile from "@/api/useProfile.ts";

export function Topbar() {

    const [commandMenuOpen, setCommandMenuOpen] = useState(false)

    const {isLoadingCurrent, currentProfile} = useProfile()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setCommandMenuOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <div className="w-full h-12 pl-4 flex items-center justify-between bg-gray-700 ">
            <HeaderLogo className="h-5" dark={true}/>
            <div className="w-full flex justify-center items-center gap-4">
                <SearchButton className="w-full max-w-80 hidden md:inline-block" onClick={() => setCommandMenuOpen(true)}/>
                <BudgetSelect />
            </div>
            {!isLoadingCurrent && currentProfile ? (
                <UserButton profile={currentProfile}/>
            ) : (
                <div className="w-8 h-8 bg-gray-500 rounded-full animate-pulse"/> // Placeholder (e.g., a skeleton)
            )}


            <CommandMenu open={commandMenuOpen} setOpen={setCommandMenuOpen}/>
        </div>
    );
}

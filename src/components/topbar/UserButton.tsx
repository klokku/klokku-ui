import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {BlocksIcon, ChevronDownIcon, ChevronUpIcon, LogOutIcon, UserIcon} from "lucide-react";
import {useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Profile} from "@/api/types.ts";
import {clearProfileId} from "@/components/auth/ProfileProvider.tsx";
import {paths} from "@/pages/links.ts";
import {useNavigate} from "react-router-dom";
import useProfile from "@/api/useProfile.ts";


type UserButtonProps = {
    profile: Profile,
}

export function UserButton({profile}: UserButtonProps) {

    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate();
    const {avatar} = useProfile();

    function logout() {
        clearProfileId()
        navigate(paths.root.path);
    }

    function navigateToProfile() {
        navigate(paths.profile.path);
    }

    function navigateToIntegrations() {
        navigate(paths.integrations.path);
    }

    function getInitials(username: string) {
        return username.split(' ').map(name => name[0].toUpperCase()).join('');
    }

    const ProfileAvatar = ( {className} : {className: string} ) => (
        <Avatar className={className}>
            {avatar &&
                <AvatarImage src={URL.createObjectURL(avatar)} />
            }
            <AvatarFallback className="bg-gray-300">{getInitials(profile.username)}</AvatarFallback>
        </Avatar>
    )

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger
                className="mr-4 p-0 rounded-full flex items-center border-0 bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 cursor-pointer focus:outline-none">

                <ProfileAvatar className="w-8 h-8 rounded-full cursor-pointer"/>
                {!isOpen &&
                    <ChevronDownIcon className="w-3 h-3 ml-2 mr-2 text-gray-300"/>
                }
                {isOpen &&
                    <ChevronUpIcon className="w-3 h-3 ml-2 mr-2 text-gray-300"/>
                }
                {/*</div>*/}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-4 w-48 shadow-2xl">
                <DropdownMenuLabel className="flex flex-row gap-2 p-2">
                    <ProfileAvatar className="mr-1 w-10 h-10 rounded-full cursor-pointer" />
                    <div className="flex flex-col gap-1">
                        <div>{profile.displayName}</div>
                        <div className="text-xs text-gray-400">@{profile.username}</div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={() => {navigateToProfile()}}>
                    <UserIcon className="opacity-50" />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {navigateToIntegrations()}}>
                    <BlocksIcon className="opacity-50" />
                    Integrations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {logout()}}>
                    <LogOutIcon className="opacity-50" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>

        </DropdownMenu>
    )
}

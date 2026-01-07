import useProfile from "@/api/useProfile.ts";
import {ProfileForm} from "@/pages/profile/ProfileForm.tsx";
import {Profile} from "@/api/types.ts";
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import {useState} from "react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {DialogDescription} from "@radix-ui/react-dialog";
import {CalendarIntegrationForm} from "@/pages/profile/CalendarIntegrationForm.tsx";


export function ProfileEditPage() {
    const {currentProfile, updateProfile, avatar, uploadAvatarImage, deleteAvatarImage} = useProfile()
    const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
    const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false)
    const [avatarUploadFile, setAvatarUploadFile] = useState<File | null>(null)

    async function saveProfileChanges(changedProfile: Profile) {
        await updateProfile(changedProfile);
    }

    function selectAvatarFile(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return
        setAvatarUploadFile(file)
    }

    async function uploadAvatarFile() {
        if (!avatarUploadFile) return
        await uploadAvatarImage(avatarUploadFile)
        setAvatarDialogOpen(false)
    }

    async function onCalendarTypeChange(value: "klokku" | "google") {
        if (!currentProfile) return;
        const updatedProfile = {
            ...currentProfile,
            settings: {
                ...currentProfile.settings,
                eventCalendarType: value
            }
        };
        await saveProfileChanges(updatedProfile);
    }

    async function onGoogleCalendarChange(value: string) {
        if (!currentProfile) return;
        const updatedProfile = {
            ...currentProfile,
            settings: {
                ...currentProfile.settings,
                googleCalendar: { calendarId: value }
            }
        };
        await saveProfileChanges(updatedProfile);
    }

    if (!currentProfile) return (
        <div className="space-y-6 p-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Your personal information and account settings.
                </p>
            </div>
            <div className="flex justify-center items-center h-full">
                Loading...
            </div>
        </div>
    )

    return currentProfile && (
        <div className="space-y-6 p-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Your personal information and account settings.
                </p>
            </div>

            <div className="flex items-center space-x-4">
                <DropdownMenu open={avatarDropdownOpen} onOpenChange={setAvatarDropdownOpen}>
                    <DropdownMenuTrigger>
                        <Avatar className="rounded-xl h-20 w-20">
                            {avatar &&
                                <AvatarImage src={URL.createObjectURL(avatar)} />
                            }
                            <AvatarFallback>MJ</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {avatar && (
                            <DropdownMenuItem onSelect={() => {
                                deleteAvatarImage()
                            }}>
                                Remove avatar
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => {
                            setAvatarDialogOpen(true);
                            setAvatarDropdownOpen(false)
                        }}>
                            Change avatar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <div>
                    <div className="font-semibold">{currentProfile?.displayName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        @{currentProfile?.username}
                    </div>
                </div>
            </div>

            <ProfileForm profile={currentProfile} onSave={(profile) => {
                saveProfileChanges(profile)
            }}/>

            <hr className="my-4"/>

            <div className="space-y-3">
                <h2 className="text-lg font-semibold block">
                    Calendar integration
                </h2>
                <CalendarIntegrationForm
                    settings={currentProfile.settings}
                    onCalendarTypeChange={onCalendarTypeChange}
                    onGoogleCalendarChange={onGoogleCalendarChange}
                />
            </div>

            <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
                <DialogContent>
                    <form>
                        <DialogHeader className="mb-3">
                            <DialogTitle>Choose your avatar photo</DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                                File size should not exceed 3MB
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 text-sm">
                            <Label htmlFor="file">
                                Choose a file
                            </Label>
                            <Input id="file" type="file" placeholder="File" accept="image/jpeg" onChange={selectAvatarFile}/>
                        </div>

                        <Button className="w-full mt-2"
                                type="button"
                                disabled={!avatarUploadFile}
                                onClick={uploadAvatarFile}
                        >
                            Upload
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

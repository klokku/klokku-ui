import useProfile from "@/api/useProfile.ts";
import {Profile} from "@/api/types.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";


export function AppSettingsPage() {
    const {currentProfile, updateProfile, isLoadingCurrent} = useProfile()

    async function saveProfileChanges(changedProfile: Profile) {
        await updateProfile(changedProfile);
    }

    if (isLoadingCurrent) return (
        <div className="space-y-6 p-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Klokku settings.
                </p>
            </div>
            <div className="flex justify-center items-center h-full">
                <Spinner className="size-8"/>
            </div>
        </div>
    )

    return currentProfile && (
        <div className="space-y-6 p-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Klokku application settings.
                </p>
            </div>

            <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
                <div className="space-y-0.5">
                    <Label htmlFor="ignore-short-events">Ignore Short Events</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        { currentProfile.settings.ignoreShortEvents &&
                            <>Events shorter than 1 minute will be ignored.</>
                        }
                        { !currentProfile.settings.ignoreShortEvents &&
                            <>Enable to ignore events shorter than 1 minute.</>
                        }
                    </p>
                </div>
                <Switch
                    id="ignore-short-events"
                    checked={currentProfile.settings.ignoreShortEvents}
                    onCheckedChange={async (checked) => {
                        await saveProfileChanges({
                            ...currentProfile,
                            settings: {
                                ...currentProfile.settings,
                                ignoreShortEvents: checked
                            }
                        });
                    }}
                />
            </div>
        </div>
    )
}

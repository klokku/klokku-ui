import {Button} from "@/components/ui/button.tsx";
import {CalendarIcon, MessageSquareWarningIcon} from "lucide-react";
import {ProfileSettings} from "@/api/types.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import useGoogle from "@/api/useGoogle.ts";
import {Alert, AlertDescription, AlertTitle,} from "@/components/ui/alert"
import {Label} from "@/components/ui/label.tsx";

type Props = {
    settings: ProfileSettings
    onCalendarTypeChange: (value: "klokku" | "google") => void
    onGoogleCalendarChange: (value: string) => void
}

export function CalendarIntegrationForm({settings, onCalendarTypeChange, onGoogleCalendarChange}: Props) {

    const {isLoadingCalendars, calendars, authLogin, authLogout} = useGoogle()

    const authGoogleCalendar = async () => {
        const googleAuthRedirect = await authLogin();
        window.location.href = googleAuthRedirect.redirectUrl;
    }

    const isGoogleAuthenticated = () => {
        return !isLoadingCalendars && calendars;
    }

    const calendarTypeChange = async (value: "klokku" | "google") => {
        if (value === "klokku") {
            await authLogout()
        }
        onCalendarTypeChange(value)
    }

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <Label>Calendar Type</Label>
                <Select value={settings.eventCalendarType || "klokku"} onValueChange={calendarTypeChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose calendar type"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="google">Google Calendar</SelectItem>
                        <SelectItem value="klokku">Klokku Calendar</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {settings.eventCalendarType === 'google' && !isGoogleAuthenticated() && (
                <div className="flex flex-col items-center gap-4">
                    <Alert className="border border-yellow-400 bg-yellow-50">
                        <MessageSquareWarningIcon className="h-4 w-4"/>
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            You need to authenticate to Google Calendar to use this integration.<br/>
                            Use the button below to authenticate.
                        </AlertDescription>
                    </Alert>
                    <Button onClick={authGoogleCalendar}><CalendarIcon/>Authenticate to Google Calendar</Button>
                </div>
            )}

            {settings.eventCalendarType === 'google' && isGoogleAuthenticated() && (
                <div className="space-y-2">
                    <Label>
                        Google Calendar to store events
                    </Label>
                    <Select value={settings.googleCalendar?.calendarId} onValueChange={onGoogleCalendarChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose calendar to store events"/>
                        </SelectTrigger>
                        <SelectContent>
                            {calendars!!.map((calendar) => (
                                <SelectItem value={calendar.id} key={calendar.id}>
                                    {calendar.summary}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )
}

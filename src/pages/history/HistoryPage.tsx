import {WeekChooser} from "@/components/statistics/weekChooser.tsx";
import {defaultSettings} from "@/components/settings.ts";
import useWeeklyStats from "@/api/useStats.ts";
import {getCurrentWeekFirstDay, nextWeekStart, previousWeekStart} from "@/lib/dateUtils.ts";
import {useState} from "react";
import useCurrentEvent from "@/api/useCurrentEvent.ts";
import useProfile from "@/api/useProfile.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {DailyHistory} from "@/pages/history/DailyHistory.tsx";
import {WeeklyHistory} from "@/pages/history/WeeklyHistory.tsx";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {FolderIcon} from "lucide-react";
import {NavLink} from "react-router";
import {paths} from "@/pages/links.ts";

export function HistoryPage() {

    const {currentProfile} = useProfile();
    const initialWeekFirstDay = getCurrentWeekFirstDay(currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay)
    const [weekFirstDay, setWeekFirstDay] = useState(initialWeekFirstDay)
    const [activeTab, setActiveTab] = useState("weekly")

    const nextWeekFirstDay = nextWeekStart(weekFirstDay)


    function onNextWeek() {
        setWeekFirstDay(nextWeekStart(weekFirstDay))
    }

    function onPreviousWeek() {
        setWeekFirstDay(previousWeekStart(weekFirstDay))
    }

    function onWeekChanged(date: Date) {
        setWeekFirstDay(date)
    }


    const {isLoading, weeklyStatsSummary} = useWeeklyStats(weekFirstDay)
    const {currentEvent} = useCurrentEvent()


    const weekData = weeklyStatsSummary

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner className="size-6"/>
            </div>
        )
    }

    if (!weekData) {
        return (
            <Empty className="mb-4 border rounded text-center">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FolderIcon/>
                    </EmptyMedia>
                    <EmptyTitle>No data Yet</EmptyTitle>
                    <EmptyDescription>
                        Make sure to <NavLink to={paths.budgetPlans.path}>create Budget Plan</NavLink>.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <div className="flex flex-col gap-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="grow">
                <TabsList className="flex gap-2 shrink-0 w-full justify-center"
                          aria-label="Week chooser">
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                </TabsList>
                <TabsContent value="weekly" className="grow flex flex-col gap-2">
                    <WeekChooser currentWeekStart={weekFirstDay} onNext={onNextWeek} onPrevious={onPreviousWeek} onDateChanged={onWeekChanged}
                                 isNextEnabled={() => nextWeekFirstDay < new Date()}/>
                    <WeeklyHistory weekData={weekData} currentEvent={currentEvent}/>
                </TabsContent>
                <TabsContent value="daily" className="grow flex flex-col gap-2">
                    <WeekChooser currentWeekStart={weekFirstDay} onNext={onNextWeek} onPrevious={onPreviousWeek} onDateChanged={onWeekChanged}
                                 isNextEnabled={() => nextWeekFirstDay < new Date()}/>
                    <DailyHistory weekData={weekData} currentEvent={currentEvent}/>
                </TabsContent>
            </Tabs>
        </div>
    )
}



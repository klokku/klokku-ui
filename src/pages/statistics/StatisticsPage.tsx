import {WeekChooser} from "@/components/statistics/weekChooser.tsx";
import {defaultSettings} from "@/components/settings.ts";
import useStats from "@/api/useStats.ts";
import {getCurrentWeekFirstDay, nextWeekStart, previousWeekStart, weekEndDay} from "@/lib/dateUtils.ts";
import {useState} from "react";
import useEvents from "@/api/useEvents.ts";
import useProfile from "@/api/useProfile.ts";
import {DailyStatistics} from "@/components/statistics/DailyStatistics.tsx";
import {WeeklyStatistics} from "@/components/statistics/WeeklyStatistics.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";

export function StatisticsPage() {

    const {currentProfile} = useProfile();
    const initialWeekFirstDay = getCurrentWeekFirstDay(currentProfile?.settings.weekStartDay ?? defaultSettings.weekStartDay)
    const [weekFirstDay, setWeekFirstDay] = useState(initialWeekFirstDay)


    function onNextWeek() {
        setWeekFirstDay(nextWeekStart(weekFirstDay))
    }

    function onPreviousWeek() {
        setWeekFirstDay(previousWeekStart(weekFirstDay))
    }

    function onWeekChanged(date: Date) {
        setWeekFirstDay(date)
    }


    const {isLoading, statsSummary} = useStats(weekFirstDay, weekEndDay(weekFirstDay))
    const {currentEvent} = useEvents()


    const weekData = statsSummary

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner className="size-6"/>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-y-4">
            <Tabs defaultValue="daily" className="flex-grow">
                <TabsList className="flex gap-2 flex-shrink-0 w-full justify-center"
                          aria-label="Week chooser">
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                </TabsList>
                <TabsContent value="daily" className="flex-grow flex flex-col gap-2">
                    <WeekChooser currentWeekStart={weekFirstDay} onNext={onNextWeek} onPrevious={onPreviousWeek} onDateChanged={onWeekChanged}/>
                    <DailyStatistics weekData={weekData} currentEvent={currentEvent}/>
                </TabsContent>
                <TabsContent value="weekly" className="flex-grow flex flex-col gap-2">
                    <WeekChooser currentWeekStart={weekFirstDay} onNext={onNextWeek} onPrevious={onPreviousWeek} onDateChanged={onWeekChanged}/>
                    <WeeklyStatistics weekData={weekData} currentEvent={currentEvent}/>
                </TabsContent>
            </Tabs>
        </div>
    )
}



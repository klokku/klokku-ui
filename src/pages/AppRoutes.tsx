import {Route, Routes} from "react-router";
import {paths} from "@/pages/links.ts";
import ErrorPage from "@/pages/ErrorPage.tsx";
import ErrorPage404 from "@/pages/ErrorPage404.tsx";
import {HistoryPage} from "@/pages/history/HistoryPage.tsx";
import {BudgetPlansPage} from "@/pages/budgetPlan/BudgetPlansPage.tsx";
import {CalendarPage} from "@/pages/calendar/CalendarPage.tsx";
import {DashboardPage} from "@/pages/dashboard/DashboardPage.tsx";
import LoggedInUserRoot from "@/pages/LoggedInUserRoot.tsx";
import {StartPage} from "@/pages/start/StartPage.tsx";
import {CreateProfilePage} from "@/pages/profile/CreateProfilePage.tsx";
import {ProfileEditPage} from "@/pages/profile/ProfileEditPage.tsx";
import {IntegrationsPage} from "@/pages/integrations/IntegrationsPage.tsx";
import {LogoutPage} from "@/pages/profile/LogoutPage.tsx";
import MainLayout from "@/pages/MainLayout.tsx";
import UserProfileLayout from "@/pages/UserProfileLayout.tsx";
import WeeklyPlanningPage from "@/pages/planning/WeeklyPlanningPage.tsx";
import {AppSettingsPage} from "@/pages/settings/AppSettingsPage.tsx";
import {BudgetPlanReportPage} from "@/pages/budgetPlanReport/BudgetPlanReportPage.tsx";
import {BudgetPlanItemDetailPage} from "@/pages/budgetPlanReport/itemDetail/BudgetPlanItemDetailPage.tsx";

const AppRoutes = () => (
    <Routes>
        <Route path={paths.start.path} element={<StartPage/>}/>
        <Route path={paths.createProfile.path} element={<CreateProfilePage/>}/>
        <Route path={paths.root.path} element={<LoggedInUserRoot/>} errorElement={<ErrorPage/>}>
            <Route element={<MainLayout/>}>
                <Route index element={<DashboardPage/>}/>
                <Route path={paths.historyCurrentPlan.path} element={<HistoryPage/>}/>
                <Route path={paths.budgetPlanReport.path} element={<BudgetPlanReportPage/>}/>
                <Route path={paths.budgetPlanItemReport.path} element={<BudgetPlanItemDetailPage/>}/>
                <Route path={paths.budgetPlans.path} element={<BudgetPlansPage/>}/>
                <Route path={paths.calendar.path} element={<CalendarPage/>}/>
                <Route path={paths.weeklyPlanning.path} element={<WeeklyPlanningPage/>}/>
            </Route>
            <Route element={<UserProfileLayout/>}>
                <Route path={paths.profile.path} element={<ProfileEditPage/>}/>
                <Route path={paths.appSettings.path} element={<AppSettingsPage/>}/>
                <Route path={paths.integrations.path} element={<IntegrationsPage/>}/>
                <Route path={paths.logout.path} element={<LogoutPage/>}/>
            </Route>
        </Route>
        <Route path="*" element={<ErrorPage404/>} />
    </Routes>
);

export default AppRoutes;

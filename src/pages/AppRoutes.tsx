import {Route, Routes} from "react-router";
import {paths} from "@/pages/links.ts";
import ErrorPage from "@/pages/ErrorPage.tsx";
import ErrorPage404 from "@/pages/ErrorPage404.tsx";
import {StatisticsPage} from "@/pages/statistics/StatisticsPage.tsx";
import {BudgetsPage} from "@/pages/budgets/BudgetsPage.tsx";
import {CalendarPage} from "@/pages/calendar/CalendarPage.tsx";
import {DashboardPage} from "@/pages/dashboard/DashboardPage.tsx";
import LoggedInUserRoot from "@/pages/LoggedInUserRoot.tsx";
import {StartPage} from "@/pages/start/StartPage.tsx";
import {CreateProfilePage} from "@/pages/profile/CreateProfilePage.tsx";
import {ProfileEditPage} from "@/pages/profile/ProfileEditPage.tsx";
import {IntegrationsPage} from "@/pages/integrations/IntegrationsPage.tsx";
import {LogoutPage} from "@/pages/profile/LogoutPage.tsx";

const AppRoutes = () => (
  <Routes>
    <Route path={paths.start.path} element={<StartPage />}/>
    <Route path={paths.createProfile.path} element={<CreateProfilePage />}/>
    <Route path={paths.root.path} element={<LoggedInUserRoot />} errorElement={<ErrorPage />}>
      <Route index element={<DashboardPage />} />
      <Route path={paths.statistics.path} element={<StatisticsPage />} />
      <Route path={paths.budgets.path} element={<BudgetsPage />} />
      <Route path={paths.calendar.path} element={<CalendarPage />} />
      <Route path={paths.profile.path} element={<ProfileEditPage />} />
      <Route path={paths.integrations.path} element={<IntegrationsPage />} />
      <Route path={paths.logout.path} element={<LogoutPage />}/>
    </Route>
    <Route path="*" element={<ErrorPage404 />} />
  </Routes>
);

export default AppRoutes;

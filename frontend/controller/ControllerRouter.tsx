import { Navigate, Route, Routes } from 'react-router-dom'
import Debug from '../common/Debug'
import { RouteE } from '../Routes'
import { EditOrganization } from './access/organizations/EditOrganization'
import { OrganizationDetails } from './access/organizations/OrganizationDetails'
import { Organizations } from './access/organizations/Organizations'
import { EditTeam } from './access/teams/EditTeam'
import { TeamDetails } from './access/teams/TeamDetails'
import { Teams } from './access/teams/Teams'
import { CreateUser } from './access/users/CreateUser'
import { EditUser } from './access/users/EditUser'
import { UserDetailsPage } from './access/users/UserDetails'
import { Users } from './access/users/Users'
import { ExecutionEnvironments } from './administration/execution-environments/ExecutionEnvironments'
import { Credentials } from './resources/credentials/Credentials'
import { Hosts } from './resources/hosts/Hosts'
import { Inventories } from './resources/inventories/Inventories'
import { Projects } from './resources/projects/Projects'
import Settings from './settings/Settings'
import Dashboard from './views/Dashboard'

export function ControllerRouter() {
    return (
        <Routes>
            <Route path={RouteE.Dashboard.replace(RouteE.Controller, '')} element={<Dashboard />} />
            {/* <Route path={RouteE.Jobs} element={JobsPage} /> */}
            {/* <Route path={RouteE.Schedules} element={SchedulesPage} /> */}
            {/* <Route path={RouteE.ActivityStream} element={ActivityStreeam} /> */}
            {/* <Route path={RouteE.WorkflowApprovals} element={WorkflowApprovalsPage} /> */}

            {/* <Route path={RouteE.Templates} element={TemplatesPage} /> */}

            <Route path={RouteE.Credentials.replace(RouteE.Controller, '')} element={<Credentials />} />

            <Route path={RouteE.Projects.replace(RouteE.Controller, '')} element={<Projects />} />
            {/* <Route path={RouteE.ProjectDetails} element={ProjectsDetailsPage} /> */}
            {/* <Route path={RouteE.ProjectEdit} element={ProjectEditPage} /> */}

            <Route path={RouteE.Inventories.replace(RouteE.Controller, '')} element={<Inventories />} />

            <Route path={RouteE.Hosts.replace(RouteE.Controller, '')} element={<Hosts />} />

            <Route path={RouteE.Organizations.replace(RouteE.Controller, '')} element={<Organizations />} />
            <Route path={RouteE.OrganizationDetails.replace(RouteE.Controller, '')} element={<OrganizationDetails />} />
            <Route path={RouteE.CreateOrganization.replace(RouteE.Controller, '')} element={<EditOrganization />} />
            <Route path={RouteE.EditOrganization.replace(RouteE.Controller, '')} element={<EditOrganization />} />

            <Route path={RouteE.Users.replace(RouteE.Controller, '')} element={<Users />} />
            <Route path={RouteE.UserDetails.replace(RouteE.Controller, '')} element={<UserDetailsPage />} />
            <Route path={RouteE.CreateUser.replace(RouteE.Controller, '')} element={<CreateUser />} />
            <Route path={RouteE.EditUser.replace(RouteE.Controller, '')} element={<EditUser />} />

            <Route path={RouteE.Teams.replace(RouteE.Controller, '')} element={<Teams />} />
            <Route path={RouteE.TeamDetails.replace(RouteE.Controller, '')} element={<TeamDetails />} />
            <Route path={RouteE.CreateTeam.replace(RouteE.Controller, '')} element={<EditTeam />} />
            <Route path={RouteE.EditTeam.replace(RouteE.Controller, '')} element={<EditTeam />} />

            {/* <Route path={RouteE.CredentialTypes} element={CredentialTypesPage} /> */}
            {/* <Route path={RouteE.Notifications} element={NotificationsPage} /> */}
            {/* <Route path={RouteE.ManagementJobs} element={ManagementJobsPage} /> */}
            {/* <Route path={RouteE.InstanceGroups} element={InstanceGroupsPage} /> */}
            {/* <Route path={RouteE.Instances} element={InstancesPage} /> */}
            {/* <Route path={RouteE.Applications} element={ApplicationsPage} /> */}
            <Route path={RouteE.ExecutionEnvironments.replace(RouteE.Controller, '')} element={<ExecutionEnvironments />} />
            {/* <Route path={RouteE.TopologyView} element={TopologyView} /> */}

            <Route path={RouteE.Settings.replace(RouteE.Controller, '')} element={<Settings />} />

            <Route path={RouteE.Debug.replace(RouteE.Controller, '')} element={<Debug />} />
            <Route path="*" element={<Navigate to={RouteE.Login} replace />} />
        </Routes>
    )
}

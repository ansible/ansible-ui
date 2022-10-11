import { Navigate, Route, Routes } from 'react-router-dom'
import { RouteE } from '../route'
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
import Debug from './settings/Debug'
import Settings from './settings/Settings'
import Dashboard from './views/Dashboard'

export function ControllerRouter() {
    return (
        <Routes>
            <Route path={RouteE.Dashboard} element={<Dashboard />} />
            {/* <Route path={RouteE.Jobs} element={JobsPage} /> */}
            {/* <Route path={RouteE.Schedules} element={SchedulesPage} /> */}
            {/* <Route path={RouteE.ActivityStream} element={ActivityStreeam} /> */}
            {/* <Route path={RouteE.WorkflowApprovals} element={WorkflowApprovalsPage} /> */}

            {/* <Route path={RouteE.Templates} element={TemplatesPage} /> */}

            <Route path={RouteE.Credentials} element={<Credentials />} />

            <Route path={RouteE.Projects} element={<Projects />} />
            {/* <Route path={RouteE.ProjectDetails} element={ProjectsDetailsPage} /> */}
            {/* <Route path={RouteE.ProjectEdit} element={ProjectEditPage} /> */}

            <Route path={RouteE.Inventories} element={<Inventories />} />

            <Route path={RouteE.Hosts} element={<Hosts />} />

            <Route path={RouteE.Organizations} element={<Organizations />} />
            <Route path={RouteE.OrganizationDetails} element={<OrganizationDetails />} />
            <Route path={RouteE.CreateOrganization} element={<EditOrganization />} />
            <Route path={RouteE.EditOrganization} element={<EditOrganization />} />

            <Route path={RouteE.Users} element={<Users />} />
            <Route path={RouteE.UserDetails} element={<UserDetailsPage />} />
            <Route path={RouteE.CreateUser} element={<CreateUser />} />
            <Route path={RouteE.EditUser} element={<EditUser />} />

            <Route path={RouteE.Teams} element={<Teams />} />
            <Route path={RouteE.TeamDetails} element={<TeamDetails />} />
            <Route path={RouteE.CreateTeam} element={<EditTeam />} />
            <Route path={RouteE.EditTeam} element={<EditTeam />} />

            {/* <Route path={RouteE.CredentialTypes} element={CredentialTypesPage} /> */}
            {/* <Route path={RouteE.Notifications} element={NotificationsPage} /> */}
            {/* <Route path={RouteE.ManagementJobs} element={ManagementJobsPage} /> */}
            {/* <Route path={RouteE.InstanceGroups} element={InstanceGroupsPage} /> */}
            {/* <Route path={RouteE.Instances} element={InstancesPage} /> */}
            {/* <Route path={RouteE.Applications} element={ApplicationsPage} /> */}
            <Route path={RouteE.ExecutionEnvironments} element={<ExecutionEnvironments />} />
            {/* <Route path={RouteE.TopologyView} element={TopologyView} /> */}

            <Route path={RouteE.Settings} element={<Settings />} />

            <Route path={RouteE.Debug} element={<Debug />} />
            <Route path="*" element={<Navigate to={RouteE.Login} replace />} />
        </Routes>
    )
}

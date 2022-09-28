import { Navigate, Route, Routes } from 'react-router-dom'
import { EditOrganization } from './controller/access/organizations/EditOrganization'
import { OrganizationDetails } from './controller/access/organizations/OrganizationDetails'
import { Organizations } from './controller/access/organizations/Organizations'
import { EditTeam } from './controller/access/teams/EditTeam'
import { TeamDetails } from './controller/access/teams/TeamDetails'
import { Teams } from './controller/access/teams/Teams'
import { CreateUser } from './controller/access/users/CreateUser'
import { EditUser } from './controller/access/users/EditUser'
import { UserDetailsPage } from './controller/access/users/UserDetails'
import { Users } from './controller/access/users/Users'
import Debug from './controller/settings/Debug'
import Login from './controller/settings/Login'
import Settings from './controller/settings/Settings'
import Dashboard from './controller/views/Dashboard'
import { RouteE } from './route'

export function DemoRouter(): JSX.Element {
    return (
        <Routes>
            <Route path={RouteE.Login} element={<Login />} />

            <Route path={RouteE.Dashboard} element={Dashboard} />
            {/* <Route path={RouteE.Jobs} component={JobsPage} /> */}
            {/* <Route path={RouteE.Schedules} component={SchedulesPage} /> */}
            {/* <Route path={RouteE.ActivityStream} component={ActivityStreeam} /> */}
            {/* <Route path={RouteE.WorkflowApprovals} component={WorkflowApprovalsPage} /> */}

            {/* <Route path={RouteE.Templates} component={TemplatesPage} /> */}
            {/* <Route path={RouteE.Credentials} component={CredentialsPage} />
            <Route path={RouteE.Projects} component={ProjectsPage} />
            <Route path={RouteE.ProjectDetails} component={ProjectsDetailsPage} />
            <Route path={RouteE.ProjectEdit} component={ProjectEditPage} />
            <Route path={RouteE.Inventories} component={InventoriesPage} />
            <Route path={RouteE.Hosts} component={HostsPage} /> */}

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

            {/* <Route path={RouteE.CredentialTypes} component={CredentialTypesPage} />
            <Route path={RouteE.Notifications} component={NotificationsPage} />
            <Route path={RouteE.ManagementJobs} component={ManagementJobsPage} />
            <Route path={RouteE.InstanceGroups} component={InstanceGroupsPage} />
            <Route path={RouteE.Instances} component={InstancesPage} />
            <Route path={RouteE.Applications} component={ApplicationsPage} />
            <Route path={RouteE.ExecutionEnvironments} component={ExecutionEnvironmentsPage} />
            <Route path={RouteE.TopologyView} component={TopologyView} /> */}

            <Route path={RouteE.Settings} element={Settings} />

            <Route path={RouteE.Debug} element={Debug} />
            <Route path="*" element={<Navigate to={RouteE.Login} replace />} />
        </Routes>
    )
}

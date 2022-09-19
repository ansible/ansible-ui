import { Redirect, Route, Switch } from 'react-router-dom'
import { OrganizationDetails } from './controller/access/organizations/OrganizationDetails'
import { Organizations } from './controller/access/organizations/Organizations'
import { EditTeam } from './controller/access/teams/EditTeam'
import { TeamDetails } from './controller/access/teams/TeamDetails'
import { TeamsPage } from './controller/access/teams/Teams'
import { CreateUser } from './controller/access/users/CreateUser'
import { EditUser } from './controller/access/users/EditUser'
import { UserDetailsPage } from './controller/access/users/UserDetails'
import { Users } from './controller/access/users/Users'
import Debug from './controller/settings/Debug'
import Settings from './controller/settings/Settings'
import Dashboard from './controller/views/Dashboard'
import { RouteE } from './route'

export function DemoRouter(): JSX.Element {
    return (
        <Switch>
            <Route exact path={RouteE.Dashboard} component={Dashboard} />
            {/* <Route exact path={RouteE.Jobs} component={JobsPage} /> */}
            {/* <Route exact path={RouteE.Schedules} component={SchedulesPage} /> */}
            {/* <Route exact path={RouteE.ActivityStream} component={ActivityStreeam} /> */}
            {/* <Route exact path={RouteE.WorkflowApprovals} component={WorkflowApprovalsPage} /> */}

            {/* <Route exact path={RouteE.Templates} component={TemplatesPage} /> */}
            {/* <Route exact path={RouteE.Credentials} component={CredentialsPage} />
            <Route exact path={RouteE.Projects} component={ProjectsPage} />
            <Route exact path={RouteE.ProjectDetails} component={ProjectsDetailsPage} />
            <Route exact path={RouteE.ProjectEdit} component={ProjectEditPage} />
            <Route exact path={RouteE.Inventories} component={InventoriesPage} />
            <Route exact path={RouteE.Hosts} component={HostsPage} /> */}

            <Route exact path={RouteE.Organizations} component={Organizations} />
            <Route exact path={RouteE.OrganizationDetails} component={OrganizationDetails} />

            <Route exact path={RouteE.Users} component={Users} />
            <Route exact path={RouteE.UserDetails} component={UserDetailsPage} />
            <Route exact path={RouteE.CreateUser} component={CreateUser} />
            <Route exact path={RouteE.EditUser} component={EditUser} />

            <Route exact path={RouteE.Teams} component={TeamsPage} />
            <Route exact path={RouteE.TeamDetails} component={TeamDetails} />
            <Route exact path={RouteE.CreateTeam} component={EditTeam} />
            <Route exact path={RouteE.EditTeam} component={EditTeam} />

            {/* <Route exact path={RouteE.CredentialTypes} component={CredentialTypesPage} />
            <Route exact path={RouteE.Notifications} component={NotificationsPage} />
            <Route exact path={RouteE.ManagementJobs} component={ManagementJobsPage} />
            <Route exact path={RouteE.InstanceGroups} component={InstanceGroupsPage} />
            <Route exact path={RouteE.Instances} component={InstancesPage} />
            <Route exact path={RouteE.Applications} component={ApplicationsPage} />
            <Route exact path={RouteE.ExecutionEnvironments} component={ExecutionEnvironmentsPage} />
            <Route exact path={RouteE.TopologyView} component={TopologyView} /> */}

            <Route exact path={RouteE.Settings} component={Settings} />

            {process.env.NODE_ENV === 'development' && <Route exact path={RouteE.Debug} component={Debug} />}

            <Route path="*">
                <Redirect to={RouteE.Login} />
            </Route>
        </Switch>
    )
}

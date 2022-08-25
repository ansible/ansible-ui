import { Redirect, Route, Switch } from 'react-router-dom'
import { RouteE } from './route'
import { Organizations } from './routes/access/organizations/Organizations'
import { CreateTeam } from './routes/access/teams/TeamCreate'
import { TeamDetails } from './routes/access/teams/TeamDetails'
import { Teams } from './routes/access/teams/Teams'
import Users from './routes/access/users/Users'
import ApplicationsPage from './routes/administration/Applications'
import CredentialTypesPage from './routes/administration/CredentialTypes'
import ExecutionEnvironmentsPage from './routes/administration/ExecutionEnvironments'
import InstanceGroupsPage from './routes/administration/InstanceGroups'
import InstancesPage from './routes/administration/Instances'
import ManagementJobsPage from './routes/administration/ManagementJobs'
import NotificationsPage from './routes/administration/Notifications'
import TopologyView from './routes/administration/TopologyView'
import CredentialsPage from './routes/resources/Credentials'
import HostsPage from './routes/resources/Hosts'
import InventoriesPage from './routes/resources/Inventories'
import { ProjectsDetailsPage } from './routes/resources/ProjectDetails'
import { ProjectEditPage } from './routes/resources/ProjectEdit'
import ProjectsPage from './routes/resources/Projects'
import TemplatesPage from './routes/resources/Templates'
import Settings from './routes/settings/Settings'
import ActivityStreeam from './routes/views/ActivityStream'
import Dashboard from './routes/views/Dashboard/Dashboard'
import JobsPage from './routes/views/Jobs'
import SchedulesPage from './routes/views/Schedules'
import WorkflowApprovalsPage from './routes/views/WorkflowApprovals'

export function DemoRouter(): JSX.Element {
    return (
        <Switch>
            <Route exact path={RouteE.Dashboard} component={Dashboard} />
            <Route exact path={RouteE.Jobs} component={JobsPage} />
            <Route exact path={RouteE.Schedules} component={SchedulesPage} />
            <Route exact path={RouteE.ActivityStream} component={ActivityStreeam} />
            <Route exact path={RouteE.WorkflowApprovals} component={WorkflowApprovalsPage} />

            <Route exact path={RouteE.Templates} component={TemplatesPage} />
            <Route exact path={RouteE.Credentials} component={CredentialsPage} />
            <Route exact path={RouteE.Projects} component={ProjectsPage} />
            <Route exact path={RouteE.ProjectDetails} component={ProjectsDetailsPage} />
            <Route exact path={RouteE.ProjectEdit} component={ProjectEditPage} />
            <Route exact path={RouteE.Inventories} component={InventoriesPage} />
            <Route exact path={RouteE.Hosts} component={HostsPage} />

            <Route exact path={RouteE.Organizations} component={Organizations} />
            <Route exact path={RouteE.Users} component={Users} />
            {/* <Route exact path={RouteE.UserDetails} component={UserDetails} /> */}
            <Route exact path={RouteE.Teams} component={Teams} />
            <Route exact path={RouteE.TeamDetails} component={TeamDetails} />
            <Route exact path={RouteE.TeamCreate} component={CreateTeam} />

            <Route exact path={RouteE.CredentialTypes} component={CredentialTypesPage} />
            <Route exact path={RouteE.Notifications} component={NotificationsPage} />
            <Route exact path={RouteE.ManagementJobs} component={ManagementJobsPage} />
            <Route exact path={RouteE.InstanceGroups} component={InstanceGroupsPage} />
            <Route exact path={RouteE.Instances} component={InstancesPage} />
            <Route exact path={RouteE.Applications} component={ApplicationsPage} />
            <Route exact path={RouteE.ExecutionEnvironments} component={ExecutionEnvironmentsPage} />
            <Route exact path={RouteE.TopologyView} component={TopologyView} />

            <Route exact path={RouteE.Settings} component={Settings} />

            <Route path="*">
                <Redirect to={RouteE.Dashboard} />
            </Route>
        </Switch>
    )
}

import { Redirect, Route, Switch } from 'react-router-dom'
import { Organizations } from './controller/access/organizations/Organizations'
import { CreateTeam } from './controller/access/teams/TeamCreate'
import { TeamDetails } from './controller/access/teams/TeamDetails'
import { Teams } from './controller/access/teams/Teams'
import Users from './controller/access/users/Users'
import ApplicationsPage from './controller/administration/Applications'
import CredentialTypesPage from './controller/administration/CredentialTypes'
import ExecutionEnvironmentsPage from './controller/administration/ExecutionEnvironments'
import InstanceGroupsPage from './controller/administration/InstanceGroups'
import InstancesPage from './controller/administration/Instances'
import ManagementJobsPage from './controller/administration/ManagementJobs'
import NotificationsPage from './controller/administration/Notifications'
import TopologyView from './controller/administration/TopologyView'
import CredentialsPage from './controller/resources/Credentials'
import HostsPage from './controller/resources/Hosts'
import InventoriesPage from './controller/resources/Inventories'
import { ProjectsDetailsPage } from './controller/resources/ProjectDetails'
import { ProjectEditPage } from './controller/resources/ProjectEdit'
import ProjectsPage from './controller/resources/Projects'
import TemplatesPage from './controller/resources/Templates'
import Settings from './controller/settings/Settings'
import ActivityStreeam from './controller/views/ActivityStream'
import Dashboard from './controller/views/Dashboard/Dashboard'
import JobsPage from './controller/views/Jobs'
import SchedulesPage from './controller/views/Schedules'
import WorkflowApprovalsPage from './controller/views/WorkflowApprovals'
import { RouteE } from './route'

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

import { Bullseye, Spinner } from '@patternfly/react-core';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RouteObj, useRoutesWithoutPrefix } from '../Routes';
import { AutomationServers } from '../automation-servers/AutomationServers';
import Debug from '../common/Debug';
import { PageNotFound } from '../common/PageNotFound';
import { PageNotImplemented } from '../common/PageNotImplemented';
import { CreateOrganization, EditOrganization } from './access/organizations/OrganizationForm';
import { OrganizationPage } from './access/organizations/OrganizationPage/OrganizationPage';
import { Organizations } from './access/organizations/Organizations';
import { CreateTeam, EditTeam } from './access/teams/TeamForm';
import { TeamPage } from './access/teams/TeamPage/TeamPage';
import { Teams } from './access/teams/Teams';
import { AddRolesToTeam } from './access/teams/components/AddRolesToTeam';
import { CreateUser, EditUser } from './access/users/UserForm';
import { UserPage } from './access/users/UserPage/UserPage';
import { Users } from './access/users/Users';
import { AddRolesToUser } from './access/users/components/AddRolesToUser';
import { ExecutionEnvironments } from './administration/execution-environments/ExecutionEnvironments';
import { InstanceGroups } from './administration/instance-groups/InstanceGroups';
import { EditInstance } from './administration/instances/EditInstance';
import { InstanceDetails } from './administration/instances/InstanceDetails';
import { Instances } from './administration/instances/Instances';
import Reports from './analytics/Reports/Reports';
import { AwxDashboard } from './dashboard/AwxDashboard';
import { CreateCredential, EditCredential } from './resources/credentials/CredentialForm';
import { CredentialPage } from './resources/credentials/CredentialPage/CredentialPage';
import { Credentials } from './resources/credentials/Credentials';
import { Hosts } from './resources/hosts/Hosts';
import { Inventories } from './resources/inventories/Inventories';
import { CreateInventory, EditInventory } from './resources/inventories/InventoryForm';
import { InventoryPage } from './resources/inventories/InventoryPage/InventoryPage';
import { ProjectPage } from './resources/projects/ProjectPage/ProjectPage';
import { Projects } from './resources/projects/Projects';
import { CreateJobTemplate, EditJobTemplate } from './resources/templates/TemplateForm';
import { CreateSchedule } from './views/schedules/ScheduleForm';
import { TemplatePage } from './resources/templates/TemplatePage/TemplatePage';
import { WorkflowJobTemplatePage } from './resources/templates/WorkflowJobTemplatePage/WorkflowJobTemplatePage';
import { Templates } from './resources/templates/Templates';
import Settings from './settings/Settings';
import { JobPage } from './views/jobs/JobPage';
import Jobs from './views/jobs/Jobs';
import HostMetrics from './views/jobs/HostMetrics';
import { CreateProject, EditProject } from './resources/projects/ProjectPage/ProjectForm';
import { Schedules } from './views/schedules/Schedules';
import { HostPage } from './resources/hosts/HostPage/HostPage';
import { CredentialTypePage } from './administration/credential-types/CredentialTypePage/CredentialTypePage';
import { CredentialTypes } from './administration/credential-types/CredentialTypes';
import { NotificationPage } from './administration/notifications/NotificationPage/NotificationPage';
import { Notifications } from './administration/notifications/Notifications';
import { ManagementJobPage } from './administration/management-jobs/ManagementJobPage/ManagementJobPage';
import { ManagementJobs } from './administration/management-jobs/ManagementJobs';
import { ApplicationPage } from './administration/applications/ApplicationPage/ApplicationPage';
import { Applications } from './administration/applications/Applications';

export function AwxRouter() {
  const RouteObjWithoutPrefix = useRoutesWithoutPrefix(RouteObj.AWX);

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      <Routes>
        <Route path={RouteObjWithoutPrefix.AwxAutomationServers} element={<AutomationServers />} />
        <Route path={RouteObjWithoutPrefix.Dashboard} element={<AwxDashboard />} />
        <Route path={RouteObjWithoutPrefix.Jobs} element={<Jobs />} />
        <Route path={RouteObjWithoutPrefix.JobPage} element={<JobPage />} />
        {[
          RouteObjWithoutPrefix.JobTemplateSchedulesCreate,
          RouteObjWithoutPrefix.WorkflowJobTemplateSchedulesCreate,
          RouteObjWithoutPrefix.ProjectSchedulesCreate,
          RouteObjWithoutPrefix.CreateSchedule,
        ].map((path) => {
          return <Route path={path} key={path} element={<CreateSchedule />} />;
        })}
        <Route path={RouteObjWithoutPrefix.Schedules} element={<Schedules />} />
        <Route path={RouteObjWithoutPrefix.ActivityStream} element={<PageNotImplemented />} />
        <Route path={RouteObjWithoutPrefix.WorkflowApprovals} element={<PageNotImplemented />} />
        <Route path={RouteObjWithoutPrefix.WorkflowApprovalPage} element={<PageNotImplemented />} />
        <Route
          path={RouteObjWithoutPrefix.WorkflowApprovalDetails}
          element={<PageNotImplemented />}
        />
        <Route path={RouteObjWithoutPrefix.HostMetrics} element={<HostMetrics />} />
        <Route path={RouteObjWithoutPrefix.Templates} element={<Templates />} />
        <Route path={RouteObjWithoutPrefix.JobTemplatePage} element={<TemplatePage />} />
        <Route
          path={RouteObjWithoutPrefix.WorkflowJobTemplatePage}
          element={<WorkflowJobTemplatePage />}
        />
        <Route path={RouteObjWithoutPrefix.CreateJobTemplate} element={<CreateJobTemplate />} />
        <Route path={RouteObjWithoutPrefix.EditJobTemplate} element={<EditJobTemplate />} />
        <Route path={RouteObjWithoutPrefix.Credentials} element={<Credentials />} />
        <Route path={RouteObjWithoutPrefix.CredentialPage} element={<CredentialPage />} />
        <Route path={RouteObjWithoutPrefix.CreateCredential} element={<CreateCredential />} />
        <Route path={RouteObjWithoutPrefix.EditCredential} element={<EditCredential />} />
        <Route path={RouteObjWithoutPrefix.Projects} element={<Projects />} />
        <Route path={RouteObjWithoutPrefix.ProjectPage} element={<ProjectPage />} />
        <Route path={RouteObjWithoutPrefix.CreateProject} element={<CreateProject />} />
        <Route path={RouteObjWithoutPrefix.EditProject} element={<EditProject />} />
        <Route path={RouteObjWithoutPrefix.Inventories} element={<Inventories />} />
        <Route path={RouteObjWithoutPrefix.InventoryPage} element={<InventoryPage />} />
        <Route path={RouteObjWithoutPrefix.CreateInventory} element={<CreateInventory />} />
        <Route path={RouteObjWithoutPrefix.EditInventory} element={<EditInventory />} />

        <Route path={RouteObjWithoutPrefix.Hosts} element={<Hosts />} />
        <Route path={RouteObjWithoutPrefix.HostPage} element={<HostPage />} />
        <Route path={RouteObjWithoutPrefix.Organizations} element={<Organizations />} />
        <Route path={RouteObjWithoutPrefix.OrganizationPage} element={<OrganizationPage />} />
        <Route path={RouteObjWithoutPrefix.CreateOrganization} element={<CreateOrganization />} />
        <Route path={RouteObjWithoutPrefix.EditOrganization} element={<EditOrganization />} />
        <Route path={RouteObjWithoutPrefix.Users} element={<Users />} />
        <Route path={RouteObjWithoutPrefix.UserPage} element={<UserPage />} />
        <Route path={RouteObjWithoutPrefix.CreateUser} element={<CreateUser />} />
        <Route path={RouteObjWithoutPrefix.EditUser} element={<EditUser />} />
        <Route path={RouteObjWithoutPrefix.AddRolesToUser} element={<AddRolesToUser />} />
        <Route path={RouteObjWithoutPrefix.Teams} element={<Teams />} />
        <Route path={RouteObjWithoutPrefix.TeamPage} element={<TeamPage />} />
        <Route path={RouteObjWithoutPrefix.CreateTeam} element={<CreateTeam />} />
        <Route path={RouteObjWithoutPrefix.EditTeam} element={<EditTeam />} />
        <Route path={RouteObjWithoutPrefix.AddRolesToTeam} element={<AddRolesToTeam />} />
        <Route path={RouteObjWithoutPrefix.CredentialTypes} element={<CredentialTypes />} />
        <Route path={RouteObjWithoutPrefix.CredentialTypePage} element={<CredentialTypePage />} />
        <Route path={RouteObjWithoutPrefix.Notifications} element={<Notifications />} />
        <Route path={RouteObjWithoutPrefix.NotificationPage} element={<NotificationPage />} />
        <Route path={RouteObjWithoutPrefix.ManagementJobs} element={<ManagementJobs />} />
        <Route path={RouteObjWithoutPrefix.ManagementJobPage} element={<ManagementJobPage />} />
        <Route path={RouteObjWithoutPrefix.InstanceGroups} element={<InstanceGroups />} />
        <Route path={RouteObjWithoutPrefix.InstanceGroupDetails} element={<PageNotImplemented />} />
        <Route path={RouteObjWithoutPrefix.Instances} element={<Instances />} />
        <Route path={RouteObjWithoutPrefix.InstanceDetails} element={<InstanceDetails />} />
        <Route path={RouteObjWithoutPrefix.EditInstance} element={<EditInstance />} />
        <Route path={RouteObjWithoutPrefix.Applications} element={<Applications />} />
        <Route path={RouteObjWithoutPrefix.ApplicationPage} element={<ApplicationPage />} />
        <Route path={RouteObjWithoutPrefix.TopologyView} element={<PageNotImplemented />} />
        <Route
          path={RouteObjWithoutPrefix.ExecutionEnvironments}
          element={<ExecutionEnvironments />}
        />
        <Route path={RouteObjWithoutPrefix.Settings} element={<Settings />} />
        {/* Analytics */}
        <Route path={RouteObjWithoutPrefix.ControllerReports} element={<Reports />} />
        <Route path={RouteObjWithoutPrefix.AwxDebug} element={<Debug />} />
        <Route path="*" element={<PageNotFound dashboardUrl={RouteObj.Dashboard} />} />
      </Routes>
    </Suspense>
  );
}

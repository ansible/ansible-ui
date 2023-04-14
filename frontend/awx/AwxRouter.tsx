import { Bullseye, Spinner } from '@patternfly/react-core';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AutomationServers } from '../automation-servers/AutomationServers';
import Debug from '../common/Debug';
import { RouteObj, useRoutesWithoutPrefix } from '../Routes';
import { CreateOrganization, EditOrganization } from './access/organizations/OrganizationForm';
import { OrganizationPage } from './access/organizations/OrganizationPage/OrganizationPage';
import { Organizations } from './access/organizations/Organizations';
import { AddRolesToTeam } from './access/teams/components/AddRolesToTeam';
import { CreateTeam, EditTeam } from './access/teams/TeamForm';
import { TeamPage } from './access/teams/TeamPage/TeamPage';
import { Teams } from './access/teams/Teams';
import { AddRolesToUser } from './access/users/components/AddRolesToUser';
import { CreateUser, EditUser } from './access/users/UserForm';
import { UserPage } from './access/users/UserPage/UserPage';
import { Users } from './access/users/Users';
import { ExecutionEnvironments } from './administration/execution-environments/ExecutionEnvironments';
import { InstanceGroups } from './administration/instance-groups/InstanceGroups';
import { EditInstance } from './administration/instances/EditInstance';
import { InstanceDetails } from './administration/instances/InstanceDetails';
import { Instances } from './administration/instances/Instances';
import Dashboard from './dashboard/Dashboard';
import { CreateCredential, EditCredential } from './resources/credentials/CredentialForm';
import { CredentialPage } from './resources/credentials/CredentialPage/CredentialPage';
import { Credentials } from './resources/credentials/Credentials';
import { Hosts } from './resources/hosts/Hosts';
import { InventoryPage } from './resources/inventories/InventoryPage/InventoryPage';
import { Inventories } from './resources/inventories/Inventories';
import { ProjectPage } from './resources/projects/ProjectPage/ProjectPage';
import { Projects } from './resources/projects/Projects';
import { TemplatePage } from './resources/templates/TemplatePage/TemplatePage';
import { CreateJobTemplate } from './resources/templates/TemplateForm';
import { Templates } from './resources/templates/Templates';
import { WorkflowJobTemplateDetail } from './resources/templates/WorkflowJobTemplateDetail';
import Settings from './settings/Settings';
import { JobPage } from './views/jobs/JobPage';
import Jobs from './views/jobs/Jobs';
import Reports from './analytics/Reports/Reports';
import { PageNotFound } from '../common/PageNotFound';
import { PageNotImplemented } from '../common/PageNotImplemented';

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
        <Route path={RouteObjWithoutPrefix.Dashboard} element={<Dashboard />} />

        <Route path={RouteObjWithoutPrefix.Jobs} element={<Jobs />} />
        <Route path={RouteObjWithoutPrefix.JobDetails} element={<JobPage />} />

        {/* <Route path={RouteObjWithoutPrefix.Schedules} element={<Schedules />} /> */}
        {/* <Route path={RouteObjWithoutPrefix.ActivityStream} element={<ActivityStreeam />} /> */}
        {/* <Route path={RouteObjWithoutPrefix.WorkflowApprovals} element={<WorkflowApprovals />} /> */}
        <Route path={RouteObjWithoutPrefix.JobOutput} element={<JobPage />} />
        <Route path={RouteObjWithoutPrefix.Templates} element={<Templates />} />
        <Route path={RouteObjWithoutPrefix.JobTemplateDetails} element={<TemplatePage />} />
        <Route
          path={RouteObjWithoutPrefix.WorkflowJobTemplateDetails}
          element={<WorkflowJobTemplateDetail />}
        />
        <Route path={RouteObjWithoutPrefix.CreateJobTemplate} element={<CreateJobTemplate />} />
        <Route path={RouteObjWithoutPrefix.EditJobTemplate} element={<PageNotImplemented />} />
        <Route path={RouteObjWithoutPrefix.Credentials} element={<Credentials />} />
        <Route path={RouteObjWithoutPrefix.CredentialDetails} element={<CredentialPage />} />
        <Route path={RouteObjWithoutPrefix.CreateCredential} element={<CreateCredential />} />
        <Route path={RouteObjWithoutPrefix.EditCredential} element={<EditCredential />} />
        <Route path={RouteObjWithoutPrefix.Projects} element={<Projects />} />
        <Route path={RouteObjWithoutPrefix.ProjectDetails} element={<ProjectPage />} />
        {/* <Route path={RouteObjWithoutPrefix.ProjectEdit} element={<ProjectEdit />} /> */}
        <Route path={RouteObjWithoutPrefix.Inventories} element={<Inventories />} />
        <Route path={RouteObjWithoutPrefix.InventoryDetails} element={<InventoryPage />} />

        <Route path={RouteObjWithoutPrefix.Hosts} element={<Hosts />} />
        <Route path={RouteObjWithoutPrefix.Organizations} element={<Organizations />} />
        <Route path={RouteObjWithoutPrefix.OrganizationDetails} element={<OrganizationPage />} />
        <Route path={RouteObjWithoutPrefix.CreateOrganization} element={<CreateOrganization />} />
        <Route path={RouteObjWithoutPrefix.EditOrganization} element={<EditOrganization />} />
        <Route path={RouteObjWithoutPrefix.Users} element={<Users />} />
        <Route path={RouteObjWithoutPrefix.UserPage} element={<UserPage />} />
        <Route path={RouteObjWithoutPrefix.CreateUser} element={<CreateUser />} />
        <Route path={RouteObjWithoutPrefix.EditUser} element={<EditUser />} />
        <Route path={RouteObjWithoutPrefix.AddRolesToUser} element={<AddRolesToUser />} />
        <Route path={RouteObjWithoutPrefix.Teams} element={<Teams />} />
        <Route path={RouteObjWithoutPrefix.TeamDetails} element={<TeamPage />} />
        <Route path={RouteObjWithoutPrefix.CreateTeam} element={<CreateTeam />} />
        <Route path={RouteObjWithoutPrefix.EditTeam} element={<EditTeam />} />
        <Route path={RouteObjWithoutPrefix.AddRolesToTeam} element={<AddRolesToTeam />} />
        {/* <Route path={RouteObjWithoutPrefix.CredentialTypes} element={<CredentialTypes />} /> */}
        {/* <Route path={RouteObjWithoutPrefix.Notifications} element={<Notifications />} /> */}
        {/* <Route path={RouteObjWithoutPrefix.ManagementJobs} element={<ManagementJobs />} /> */}
        <Route path={RouteObjWithoutPrefix.InstanceGroups} element={<InstanceGroups />} />
        <Route path={RouteObjWithoutPrefix.InstanceGroupDetails} element={<PageNotImplemented />} />
        <Route path={RouteObjWithoutPrefix.Instances} element={<Instances />} />
        <Route path={RouteObjWithoutPrefix.InstanceDetails} element={<InstanceDetails />} />
        <Route path={RouteObjWithoutPrefix.EditInstance} element={<EditInstance />} />
        {/* <Route path={RouteObjWithoutPrefix.Applications} element={<Applications />} /> */}
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

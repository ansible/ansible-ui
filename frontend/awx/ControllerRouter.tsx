import { Bullseye, Spinner } from '@patternfly/react-core';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AutomationServers } from '../automation-servers/AutomationServers';
import Debug from '../common/Debug';
import { RouteE } from '../Routes';
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
import { Credentials } from './resources/credentials/Credentials';
import { Hosts } from './resources/hosts/Hosts';
import { Inventories } from './resources/inventories/Inventories';
import { Projects } from './resources/projects/Projects';
import { ProjectPage } from './resources/projects/ProjectPage/ProjectPage';
import { TemplateDetail } from './resources/templates/TemplateDetail';
import { CreateJobTemplate } from './resources/templates/TemplateForm';
import { Templates } from './resources/templates/Templates';
import Settings from './settings/Settings';
import Jobs from './views/jobs/Jobs';
import { WorkflowJobTemplateDetail } from './resources/templates/WorkflowJobTemplateDetail';

export function AwxRouter() {
  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      <Routes>
        <Route
          path={RouteE.AwxAutomationServers.replace(RouteE.AWX, '')}
          element={<AutomationServers />}
        />
        <Route path={RouteE.Dashboard.replace(RouteE.AWX, '')} element={<Dashboard />} />
        <Route path={RouteE.Jobs.replace(RouteE.AWX, '')} element={<Jobs />} />
        {/* <Route path={RouteE.Schedules} element={<Schedules />} /> */}
        {/* <Route path={RouteE.ActivityStream} element={<ActivityStreeam />} /> */}
        {/* <Route path={RouteE.WorkflowApprovals} element={<WorkflowApprovals />} /> */}

        <Route path={RouteE.Templates.replace(RouteE.AWX, '')} element={<Templates />} />
        <Route
          path={RouteE.JobTemplateDetails.replace(RouteE.AWX, '')}
          element={<TemplateDetail />}
        />
        <Route
          path={RouteE.WorkflowJobTemplateDetails.replace(RouteE.AWX, '')}
          element={<WorkflowJobTemplateDetail />}
        />
        <Route
          path={RouteE.CreateJobTemplate.replace(RouteE.AWX, '')}
          element={<CreateJobTemplate />}
        />

        <Route path={RouteE.Credentials.replace(RouteE.AWX, '')} element={<Credentials />} />

        <Route path={RouteE.Projects.replace(RouteE.AWX, '')} element={<Projects />} />
        <Route path={RouteE.ProjectDetails.replace(RouteE.AWX, '')} element={<ProjectPage />} />
        {/* <Route path={RouteE.ProjectEdit} element={<ProjectEdit />} /> */}

        <Route path={RouteE.Inventories.replace(RouteE.AWX, '')} element={<Inventories />} />

        <Route path={RouteE.Hosts.replace(RouteE.AWX, '')} element={<Hosts />} />

        <Route path={RouteE.Organizations.replace(RouteE.AWX, '')} element={<Organizations />} />
        <Route
          path={RouteE.OrganizationDetails.replace(RouteE.AWX, '')}
          element={<OrganizationPage />}
        />
        <Route
          path={RouteE.CreateOrganization.replace(RouteE.AWX, '')}
          element={<CreateOrganization />}
        />
        <Route
          path={RouteE.EditOrganization.replace(RouteE.AWX, '')}
          element={<EditOrganization />}
        />

        <Route path={RouteE.Users.replace(RouteE.AWX, '')} element={<Users />} />
        <Route path={RouteE.UserDetails.replace(RouteE.AWX, '')} element={<UserPage />} />
        <Route path={RouteE.CreateUser.replace(RouteE.AWX, '')} element={<CreateUser />} />
        <Route path={RouteE.EditUser.replace(RouteE.AWX, '')} element={<EditUser />} />
        <Route path={RouteE.AddRolesToUser.replace(RouteE.AWX, '')} element={<AddRolesToUser />} />

        <Route path={RouteE.Teams.replace(RouteE.AWX, '')} element={<Teams />} />
        <Route path={RouteE.TeamDetails.replace(RouteE.AWX, '')} element={<TeamPage />} />
        <Route path={RouteE.CreateTeam.replace(RouteE.AWX, '')} element={<CreateTeam />} />
        <Route path={RouteE.EditTeam.replace(RouteE.AWX, '')} element={<EditTeam />} />
        <Route path={RouteE.AddRolesToTeam.replace(RouteE.AWX, '')} element={<AddRolesToTeam />} />

        {/* <Route path={RouteE.CredentialTypes} element={<CredentialTypes />} /> */}
        {/* <Route path={RouteE.Notifications} element={<Notifications />} /> */}
        {/* <Route path={RouteE.ManagementJobs} element={<ManagementJobs />} /> */}

        <Route path={RouteE.InstanceGroups.replace(RouteE.AWX, '')} element={<InstanceGroups />} />

        <Route path={RouteE.Instances.replace(RouteE.AWX, '')} element={<Instances />} />
        <Route
          path={RouteE.InstanceDetails.replace(RouteE.AWX, '')}
          element={<InstanceDetails />}
        />
        <Route path={RouteE.EditInstance.replace(RouteE.AWX, '')} element={<EditInstance />} />

        {/* <Route path={RouteE.Applications} element={<Applications />} /> */}
        <Route
          path={RouteE.ExecutionEnvironments.replace(RouteE.AWX, '')}
          element={<ExecutionEnvironments />}
        />

        <Route path={RouteE.Settings.replace(RouteE.AWX, '')} element={<Settings />} />

        <Route path={RouteE.AwxDebug.replace(RouteE.AWX, '')} element={<Debug />} />
      </Routes>
    </Suspense>
  );
}

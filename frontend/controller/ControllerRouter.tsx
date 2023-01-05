import { Bullseye, Spinner } from '@patternfly/react-core';
import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AutomationServersPage } from '../automation-servers/AutomationServersPage';
import Debug from '../common/Debug';
import { RouteE } from '../Routes';
import { OrganizationDetails } from './access/organizations/OrganizationDetails';
import { CreateOrganization, EditOrganization } from './access/organizations/OrganizationForm';
import { Organizations } from './access/organizations/Organizations';
import { TeamDetails } from './access/teams/TeamDetails';
import { CreateTeam, EditTeam } from './access/teams/TeamForm';
import { Teams } from './access/teams/Teams';
import { UserDetailsPage } from './access/users/UserDetails';
import { CreateUser, EditUser } from './access/users/UserForm';
import { Users } from './access/users/Users';
import { ExecutionEnvironments } from './administration/execution-environments/ExecutionEnvironments';
import { InstanceGroups } from './administration/instance-groups/InstanceGroups';
import { EditInstance } from './administration/instances/EditInstance';
import { InstanceDetails } from './administration/instances/InstanceDetails';
import { Instances } from './administration/instances/Instances';
import Dashboard from './Dashboard';
import { Credentials } from './resources/credentials/Credentials';
import { Hosts } from './resources/hosts/Hosts';
import { Inventories } from './resources/inventories/Inventories';
import { Projects } from './resources/projects/Projects';
import { TemplateDetail } from './resources/templates/TemplateDetail';
import { Templates } from './resources/templates/Templates';
import Settings from './settings/Settings';
import Jobs from './views/jobs/Jobs';

export function ControllerRouter() {
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
          path={RouteE.ControllerAutomationServers.replace(RouteE.Controller, '')}
          element={<AutomationServersPage />}
        />
        <Route path={RouteE.Dashboard.replace(RouteE.Controller, '')} element={<Dashboard />} />
        <Route path={RouteE.Jobs.replace(RouteE.Controller, '')} element={<Jobs />} />
        {/* <Route path={RouteE.Schedules} element={<Schedules />} /> */}
        {/* <Route path={RouteE.ActivityStream} element={<ActivityStreeam />} /> */}
        {/* <Route path={RouteE.WorkflowApprovals} element={<WorkflowApprovals />} /> */}

        <Route path={RouteE.Templates.replace(RouteE.Controller, '')} element={<Templates />} />
        <Route
          path={RouteE.JobTemplateDetails.replace(RouteE.Controller, '')}
          element={<TemplateDetail />}
        />

        <Route path={RouteE.Credentials.replace(RouteE.Controller, '')} element={<Credentials />} />

        <Route path={RouteE.Projects.replace(RouteE.Controller, '')} element={<Projects />} />
        {/* <Route path={RouteE.ProjectDetails} element={<ProjectsDetails />} /> */}
        {/* <Route path={RouteE.ProjectEdit} element={<ProjectEdit />} /> */}

        <Route path={RouteE.Inventories.replace(RouteE.Controller, '')} element={<Inventories />} />

        <Route path={RouteE.Hosts.replace(RouteE.Controller, '')} element={<Hosts />} />

        <Route
          path={RouteE.Organizations.replace(RouteE.Controller, '')}
          element={<Organizations />}
        />
        <Route
          path={RouteE.OrganizationDetails.replace(RouteE.Controller, '')}
          element={<OrganizationDetails />}
        />
        <Route
          path={RouteE.CreateOrganization.replace(RouteE.Controller, '')}
          element={<CreateOrganization />}
        />
        <Route
          path={RouteE.EditOrganization.replace(RouteE.Controller, '')}
          element={<EditOrganization />}
        />

        <Route path={RouteE.Users.replace(RouteE.Controller, '')} element={<Users />} />
        <Route
          path={RouteE.UserDetails.replace(RouteE.Controller, '')}
          element={<UserDetailsPage />}
        />
        <Route path={RouteE.CreateUser.replace(RouteE.Controller, '')} element={<CreateUser />} />
        <Route path={RouteE.EditUser.replace(RouteE.Controller, '')} element={<EditUser />} />

        <Route path={RouteE.Teams.replace(RouteE.Controller, '')} element={<Teams />} />
        <Route path={RouteE.TeamDetails.replace(RouteE.Controller, '')} element={<TeamDetails />} />
        <Route path={RouteE.CreateTeam.replace(RouteE.Controller, '')} element={<CreateTeam />} />
        <Route path={RouteE.EditTeam.replace(RouteE.Controller, '')} element={<EditTeam />} />

        {/* <Route path={RouteE.CredentialTypes} element={<CredentialTypes />} /> */}
        {/* <Route path={RouteE.Notifications} element={<Notifications />} /> */}
        {/* <Route path={RouteE.ManagementJobs} element={<ManagementJobs />} /> */}

        <Route
          path={RouteE.InstanceGroups.replace(RouteE.Controller, '')}
          element={<InstanceGroups />}
        />

        <Route path={RouteE.Instances.replace(RouteE.Controller, '')} element={<Instances />} />
        <Route
          path={RouteE.InstanceDetails.replace(RouteE.Controller, '')}
          element={<InstanceDetails />}
        />
        <Route
          path={RouteE.EditInstance.replace(RouteE.Controller, '')}
          element={<EditInstance />}
        />

        {/* <Route path={RouteE.Applications} element={<Applications />} /> */}
        <Route
          path={RouteE.ExecutionEnvironments.replace(RouteE.Controller, '')}
          element={<ExecutionEnvironments />}
        />

        <Route path={RouteE.Settings.replace(RouteE.Controller, '')} element={<Settings />} />

        <Route path={RouteE.ControllerDebug.replace(RouteE.Controller, '')} element={<Debug />} />

        <Route path="*" element={<Navigate to={RouteE.AutomationServers} replace />} />
      </Routes>
    </Suspense>
  );
}

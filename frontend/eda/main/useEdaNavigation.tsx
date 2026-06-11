import { PageNavigationItem } from '@ansible/ansible-ui-framework/PageNavigation/PageNavigationItem';
import { PageSettingsDetails } from '@ansible/ansible-ui-framework/PageSettings/PageSettingsDetails';
import { PageSettingsForm } from '@ansible/ansible-ui-framework/PageSettings/PageSettingsForm';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import {
  CreateCredentialType,
  EditCredentialType,
} from '../access/credential-types/CredentialTypeForm';
import { CredentialTypeCredentials } from '../access/credential-types/CredentialTypePage/CredentialTypeCredentials';
import { CredentialTypeDetails } from '../access/credential-types/CredentialTypePage/CredentialTypeDetails';
import { CredentialTypePage } from '../access/credential-types/CredentialTypePage/CredentialTypePage';
import { CredentialTypes } from '../access/credential-types/CredentialTypes';
import { EdaCredentialAddUsers } from '../access/credentials/components/EdaCredentialAddUsers';
import { EdaCredentialAssignTeams } from '../access/credentials/components/EdaCredentialAssignTeams';
import { EdaCredentialManageUsers } from '../access/credentials/components/EdaCredentialManageUsers';
import { CreateCredential } from '../access/credentials/CreateCredential';
import { CredentialDetails } from '../access/credentials/CredentialPage/CredentialDetails';
import { CredentialPage } from '../access/credentials/CredentialPage/CredentialPage';
import { CredentialTeamAccess } from '../access/credentials/CredentialPage/CredentialTeamAccess';
import { CredentialUserAccess } from '../access/credentials/CredentialPage/CredentialUserAccess';
import { Credentials } from '../access/credentials/Credentials';
import { EditCredential } from '../access/credentials/EditCredential';
import { EdaRoleDetails } from '../access/roles/EdaRoleDetails';
import { EdaRolePage } from '../access/roles/EdaRolePage';
import { EdaRoles } from '../access/roles/EdaRoles';
import { CreateRole, EditRole } from '../access/roles/RoleForm';
import { EdaAddTeamRoles } from '../access/teams/EdaAddTeamRoles';
import { EdaTeamRoles } from '../access/teams/TeamPage/EdaTeamRoles';
import { TeamDetails } from '../access/teams/TeamPage/TeamDetails';
import { CreateTeam, EditTeam } from '../access/teams/TeamPage/TeamForm';
import { TeamPage } from '../access/teams/TeamPage/TeamPage';
import { Teams } from '../access/teams/Teams';
import { EdaAddUserRoles } from '../access/users/EdaAddUserRoles';
import { CreateUser, EditCurrentUser, EditUser } from '../access/users/EditUser';
import { EdaMyDetails } from '../access/users/UserPage/EdaMyDetails';
import { EdaUserDetails } from '../access/users/UserPage/EdaUserDetails';
import { EdaUserRoles } from '../access/users/UserPage/EdaUserRoles';
import { MyPage } from '../access/users/UserPage/MyPage';
import { UserPage } from '../access/users/UserPage/UserPage';
import { Users } from '../access/users/Users';
import { EdaDecisionEnvironmentAddUsers } from '../decision-environments/components/EdaDecisionEnvironmentAddUsers';
import { EdaDecisionEnvironmentAssignTeams } from '../decision-environments/components/EdaDecisionEnvironmentAssignTeams';
import { EdaDecisionEnvironmentManageUsers } from '../decision-environments/components/EdaDecisionEnvironmentManageUsers';
import {
  CreateDecisionEnvironment,
  EditDecisionEnvironment,
} from '../decision-environments/DecisionEnvironmentForm';
import { DecisionEnvironmentDetails } from '../decision-environments/DecisionEnvironmentPage/DecisionEnvironmentDetails';
import { DecisionEnvironmentPage } from '../decision-environments/DecisionEnvironmentPage/DecisionEnvironmentPage';
import { DecisionEnvironmentTeamAccess } from '../decision-environments/DecisionEnvironmentPage/DecisionEnvironmentTeamAccess';
import { DecisionEnvironmentUserAccess } from '../decision-environments/DecisionEnvironmentPage/DecisionEnvironmentUserAccess';
import { DecisionEnvironments } from '../decision-environments/DecisionEnvironments';
import { EdaEventStreamAddUsers } from '../event-streams/components/EdaEventStreamAddUsers';
import { EdaEventStreamAssignTeams } from '../event-streams/components/EdaEventStreamAssignTeams';
import { EdaEventStreamManageUsers } from '../event-streams/components/EdaEventStreamManageUsers';
import { CreateEventStream, EditEventStream } from '../event-streams/EventStreamForm';
import { EventStreamActivations } from '../event-streams/EventStreamPage/EventStreamActivations';
import { EventStreamDetails } from '../event-streams/EventStreamPage/EventStreamDetails';
import { EventStreamPage } from '../event-streams/EventStreamPage/EventStreamPage';
import { EventStreamTeamAccess } from '../event-streams/EventStreamPage/EventStreamTeamAccess';
import { EventStreamUserAccess } from '../event-streams/EventStreamPage/EventStreamUserAccess';
import { EventStreams } from '../event-streams/EventStreams';
import { EdaOverview } from '../overview/EdaOverview';
import { EdaProjectAddUsers } from '../projects/components/EdaProjectAddUsers';
import { EdaProjectAssignTeams } from '../projects/components/EdaProjectAssignTeams';
import { EdaProjectManageUsers } from '../projects/components/EdaProjectManageUsers';
import { CreateProject, EditProject } from '../projects/EditProject';
import { ProjectDetails } from '../projects/ProjectPage/ProjectDetails';
import { ProjectPage } from '../projects/ProjectPage/ProjectPage';
import { ProjectTeamAccess } from '../projects/ProjectPage/ProjectTeamAccess';
import { ProjectUserAccess } from '../projects/ProjectPage/ProjectUserAccess';
import { Projects } from '../projects/Projects';
import { RuleAudit } from '../rule-audit/RuleAudit';
import { RuleAuditActions } from '../rule-audit/RuleAuditPage/RuleAuditActions';
import { RuleAuditDetails } from '../rule-audit/RuleAuditPage/RuleAuditDetails';
import { RuleAuditEvents } from '../rule-audit/RuleAuditPage/RuleAuditEvents';
import { RuleAuditPage } from '../rule-audit/RuleAuditPage/RuleAuditPage';
import { ActivationInstanceDetails } from '../rulebook-activations/ActivationInstancePage/ActivationInstanceDetails';
import { ActivationInstancePage } from '../rulebook-activations/ActivationInstancePage/ActivationInstancePage';
import { EdaRulebookActivationAddUsers } from '../rulebook-activations/components/EdaRulebookActivationAddUsers';
import { EdaRulebookActivationAssignTeams } from '../rulebook-activations/components/EdaRulebookActivationAssignTeams';
import { EdaRulebookActivationManageUsers } from '../rulebook-activations/components/EdaRulebookActivationManageUsers';
import {
  CreateRulebookActivation,
  EditRulebookActivation,
} from '../rulebook-activations/RulebookActivationForm';
import { RulebookActivationDetails } from '../rulebook-activations/RulebookActivationPage/RulebookActivationDetails';
import { RulebookActivationHistory } from '../rulebook-activations/RulebookActivationPage/RulebookActivationHistory';
import { RulebookActivationPage } from '../rulebook-activations/RulebookActivationPage/RulebookActivationPage';
import { RulebookActivationTeamAccess } from '../rulebook-activations/RulebookActivationPage/RuleBookActivationTeamAccess';
import { RulebookActivationUserAccess } from '../rulebook-activations/RulebookActivationPage/RuleBookActivationUserAccess';
import { RulebookActivations } from '../rulebook-activations/RulebookActivations';
import { EdaRoute } from './EdaRoutes';
import { useEdaOrganizationRoutes } from './routes/useEdaOrganizationsRoutes';

export function useEdaNavigation() {
  const { t } = useTranslation();
  const edaOrganizationRoutes = useEdaOrganizationRoutes();
  const navigationItems: PageNavigationItem[] = [
    {
      id: EdaRoute.Overview,
      label: t('Overview'),
      path: 'overview',
      element: <EdaOverview />,
    },
    {
      id: EdaRoute.RuleAudits,
      label: t('Rule Audit'),
      path: 'rule-audits',
      children: [
        {
          id: EdaRoute.RuleAuditPage,
          path: ':id',
          element: <RuleAuditPage />,
          children: [
            {
              id: EdaRoute.RuleAuditDetails,
              path: 'details',
              element: <RuleAuditDetails />,
            },
            {
              id: EdaRoute.RuleAuditActions,
              path: 'actions',
              element: <RuleAuditActions />,
            },
            {
              id: EdaRoute.RuleAuditEvents,
              path: 'events',
              element: <RuleAuditEvents />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          path: '',
          element: <RuleAudit />,
        },
      ],
    },
    {
      id: EdaRoute.RulebookActivations,
      label: t('Rulebook Activations'),
      path: 'rulebook-activations',
      children: [
        {
          id: EdaRoute.CreateRulebookActivation,
          path: 'create',
          element: <CreateRulebookActivation />,
        },
        {
          id: EdaRoute.EditRulebookActivation,
          path: 'edit/:id',
          element: <EditRulebookActivation />,
        },
        {
          id: EdaRoute.RulebookActivationInstancePage,
          path: ':id/history/:instanceId',
          element: <ActivationInstancePage />,
          children: [
            {
              id: EdaRoute.RulebookActivationInstanceDetails,
              path: 'details',
              element: <ActivationInstanceDetails />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          id: EdaRoute.RulebookActivationPage,
          path: ':id',
          element: <RulebookActivationPage />,
          children: [
            {
              id: EdaRoute.RulebookActivationDetails,
              path: 'details',
              element: <RulebookActivationDetails />,
            },
            {
              id: EdaRoute.RulebookActivationHistory,
              path: 'history',
              element: <RulebookActivationHistory />,
            },
            {
              id: EdaRoute.RulebookActivationTeamAccess,
              path: 'team-access',
              element: <RulebookActivationTeamAccess />,
            },
            {
              id: EdaRoute.RulebookActivationUserAccess,
              path: 'user-access',
              element: <RulebookActivationUserAccess />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          id: EdaRoute.RulebookActivationAddUsers,
          path: ':id/user-access/add',
          element: <EdaRulebookActivationAddUsers />,
        },
        {
          id: EdaRoute.RulebookActivationManageUsers,
          path: ':resource_id/user-access/:resource_type/:user_id/manage',
          element: <EdaRulebookActivationManageUsers />,
        },
        {
          id: EdaRoute.RulebookActivationAssignTeams,
          path: ':id/team-access/assign',
          element: <EdaRulebookActivationAssignTeams />,
        },
        {
          path: '',
          element: <RulebookActivations />,
        },
      ],
    },
    {
      id: EdaRoute.Projects,
      label: t('Projects'),
      path: 'projects',
      children: [
        {
          id: EdaRoute.CreateProject,
          path: 'create',
          element: <CreateProject />,
        },
        {
          id: EdaRoute.EditProject,
          path: 'edit/:id',
          element: <EditProject />,
        },
        {
          id: EdaRoute.ProjectPage,
          path: ':id',
          element: <ProjectPage />,
          children: [
            {
              id: EdaRoute.ProjectDetails,
              path: 'details',
              element: <ProjectDetails />,
            },
            {
              id: EdaRoute.ProjectTeamAccess,
              path: 'team-access',
              element: <ProjectTeamAccess />,
            },
            {
              id: EdaRoute.ProjectUserAccess,
              path: 'user-access',
              element: <ProjectUserAccess />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          id: EdaRoute.ProjectAddUsers,
          path: ':id/user-access/add',
          element: <EdaProjectAddUsers />,
        },
        {
          id: EdaRoute.ProjectManageUsers,
          path: ':resource_id/user-access/:resource_type/:user_id/manage',
          element: <EdaProjectManageUsers />,
        },
        {
          id: EdaRoute.ProjectAssignTeams,
          path: ':id/team-access/assign',
          element: <EdaProjectAssignTeams />,
        },
        {
          path: '',
          element: <Projects />,
        },
      ],
    },
    {
      id: EdaRoute.DecisionEnvironments,
      label: t('Decision Environments'),
      path: 'decision-environments',
      children: [
        {
          id: EdaRoute.CreateDecisionEnvironment,
          path: 'create',
          element: <CreateDecisionEnvironment />,
        },
        {
          id: EdaRoute.EditDecisionEnvironment,
          path: 'edit/:id',
          element: <EditDecisionEnvironment />,
        },
        {
          id: EdaRoute.DecisionEnvironmentPage,
          path: ':id',
          element: <DecisionEnvironmentPage />,
          children: [
            {
              id: EdaRoute.DecisionEnvironmentDetails,
              path: 'details',
              element: <DecisionEnvironmentDetails />,
            },
            {
              id: EdaRoute.DecisionEnvironmentTeamAccess,
              path: 'team-access',
              element: <DecisionEnvironmentTeamAccess />,
            },
            {
              id: EdaRoute.DecisionEnvironmentUserAccess,
              path: 'user-access',
              element: <DecisionEnvironmentUserAccess />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          id: EdaRoute.DecisionEnvironmentAddUsers,
          path: ':id/user-access/add',
          element: <EdaDecisionEnvironmentAddUsers />,
        },
        {
          id: EdaRoute.DecisionEnvironmentManageUsers,
          path: ':resource_id/user-access/:resource_type/:user_id/manage',
          element: <EdaDecisionEnvironmentManageUsers />,
        },
        {
          id: EdaRoute.DecisionEnvironmentAssignTeams,
          path: ':id/team-access/assign',
          element: <EdaDecisionEnvironmentAssignTeams />,
        },
        {
          path: '',
          element: <DecisionEnvironments />,
        },
      ],
    },
    {
      id: EdaRoute.EventStreams,
      label: t('Event Streams'),
      path: 'event-streams',
      children: [
        {
          id: EdaRoute.CreateEventStream,
          path: 'create',
          element: <CreateEventStream />,
        },
        {
          id: EdaRoute.EditEventStream,
          path: 'edit/:id',
          element: <EditEventStream />,
        },
        {
          id: EdaRoute.EventStreamPage,
          path: ':id',
          element: <EventStreamPage />,
          children: [
            {
              id: EdaRoute.EventStreamDetails,
              path: 'details',
              element: <EventStreamDetails />,
            },
            {
              id: EdaRoute.EventStreamActivations,
              path: 'activations',
              element: <EventStreamActivations />,
            },
            {
              id: EdaRoute.EventStreamTeamAccess,
              path: 'team-access',
              element: <EventStreamTeamAccess />,
            },
            {
              id: EdaRoute.EventStreamUserAccess,
              path: 'user-access',
              element: <EventStreamUserAccess />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          id: EdaRoute.EventStreamAddUsers,
          path: ':id/user-access/add',
          element: <EdaEventStreamAddUsers />,
        },
        {
          id: EdaRoute.EventStreamManageUsers,
          path: ':resource_id/user-access/:resource_type/:user_id/manage',
          element: <EdaEventStreamManageUsers />,
        },
        {
          id: EdaRoute.EventStreamAssignTeams,
          path: ':id/team-access/assign',
          element: <EdaEventStreamAssignTeams />,
        },
        {
          path: '',
          element: <EventStreams />,
        },
      ],
    },
    {
      id: EdaRoute.Access,
      label: t('Access Management'),
      path: 'access',
      children: [
        {
          id: EdaRoute.Users,
          label: t('Users'),
          path: 'users',
          children: [
            {
              path: 'me',
              element: <MyPage />,
              id: EdaRoute.MyPage,
              children: [
                {
                  id: EdaRoute.MyDetails,
                  path: 'details',
                  element: <EdaMyDetails />,
                },
                {
                  path: '',
                  element: <Navigate to="details" />,
                },
              ],
            },
            {
              id: EdaRoute.CreateUser,
              path: 'create',
              element: <CreateUser />,
            },
            {
              id: EdaRoute.EditUser,
              path: 'edit/:id',
              element: <EditUser />,
            },
            {
              id: EdaRoute.EditCurrentUser,
              path: 'edit/me',
              element: <EditCurrentUser />,
            },
            {
              id: EdaRoute.UserPage,
              element: <UserPage />,
              path: ':id',
              children: [
                {
                  id: EdaRoute.UserDetails,
                  path: 'details',
                  element: <EdaUserDetails />,
                },
                {
                  id: EdaRoute.UserRoles,
                  path: 'roles',
                  element: <EdaUserRoles />,
                },
                {
                  path: '',
                  element: <Navigate to="details" />,
                },
              ],
            },
            {
              id: EdaRoute.UserAddRoles,
              path: ':id/roles/add-roles',
              element: <EdaAddUserRoles />,
            },
            {
              path: '',
              element: <Users />,
            },
          ],
        },
        {
          id: EdaRoute.Teams,
          label: t('Teams'),
          path: 'teams',
          children: [
            {
              id: EdaRoute.CreateTeam,
              path: 'create',
              element: <CreateTeam />,
            },
            {
              id: EdaRoute.EditTeam,
              path: ':id/edit',
              element: <EditTeam />,
            },
            {
              id: EdaRoute.TeamPage,
              path: ':id',
              element: <TeamPage />,
              children: [
                {
                  id: EdaRoute.TeamRoles,
                  path: 'roles',
                  element: <EdaTeamRoles />,
                },
                {
                  id: EdaRoute.TeamDetails,
                  path: 'details',
                  element: <TeamDetails />,
                },
                {
                  path: '',
                  element: <Navigate to="details" />,
                },
              ],
            },
            {
              id: EdaRoute.TeamAddRoles,
              path: ':id/roles/add-roles',
              element: <EdaAddTeamRoles />,
            },
            {
              path: '',
              element: <Teams />,
            },
          ],
        },
        edaOrganizationRoutes,
        {
          id: EdaRoute.Roles,
          label: t('Roles'),
          path: 'roles',
          children: [
            {
              id: EdaRoute.CreateRole,
              path: 'create',
              element: <CreateRole />,
            },
            {
              id: EdaRoute.EditRole,
              path: 'edit/:id',
              element: <EditRole />,
            },
            {
              id: EdaRoute.RolePage,
              path: ':id/',
              element: <EdaRolePage />,
              children: [
                {
                  id: EdaRoute.RoleDetails,
                  path: 'details',
                  element: <EdaRoleDetails />,
                },
                {
                  path: '',
                  element: <Navigate to="details" />,
                },
              ],
            },
            {
              path: '',
              element: <EdaRoles />,
            },
          ],
        },
        {
          id: EdaRoute.Credentials,
          label: t('Credentials'),
          path: 'credentials',
          children: [
            {
              id: EdaRoute.CreateCredential,
              path: 'create',
              element: <CreateCredential />,
            },
            {
              id: EdaRoute.EditCredential,
              path: 'edit/:id',
              element: <EditCredential />,
            },
            {
              id: EdaRoute.CredentialPage,
              path: ':id',
              element: <CredentialPage />,
              children: [
                {
                  id: EdaRoute.CredentialDetails,
                  path: 'details',
                  element: <CredentialDetails />,
                },
                {
                  id: EdaRoute.CredentialTeamAccess,
                  path: 'team-access',
                  element: <CredentialTeamAccess />,
                },
                {
                  id: EdaRoute.CredentialUserAccess,
                  path: 'user-access',
                  element: <CredentialUserAccess />,
                },
                {
                  path: '',
                  element: <Navigate to="details" />,
                },
              ],
            },
            {
              id: EdaRoute.CredentialAddUsers,
              path: ':id/user-access/assign',
              element: <EdaCredentialAddUsers />,
            },
            {
              id: EdaRoute.CredentialManageUsers,
              path: ':resource_id/user-access/:resource_type/:user_id/manage',
              element: <EdaCredentialManageUsers />,
            },
            {
              id: EdaRoute.CredentialAssignTeams,
              path: ':id/team-access/assign',
              element: <EdaCredentialAssignTeams />,
            },
            {
              path: '',
              element: <Credentials />,
            },
          ],
        },
        {
          id: EdaRoute.CredentialTypes,
          label: t('Credential Types'),
          path: 'credential-types',
          children: [
            {
              id: EdaRoute.CreateCredentialType,
              path: 'create',
              element: <CreateCredentialType />,
            },
            {
              id: EdaRoute.EditCredentialType,
              path: 'edit/:id',
              element: <EditCredentialType />,
            },
            {
              id: EdaRoute.CredentialTypePage,
              path: ':id',
              element: <CredentialTypePage />,
              children: [
                {
                  id: EdaRoute.CredentialTypeDetails,
                  path: 'details',
                  element: <CredentialTypeDetails />,
                },
                {
                  id: EdaRoute.CredentialTypeCredentials,
                  path: 'credentials',
                  element: <CredentialTypeCredentials />,
                },
                {
                  path: '',
                  element: <Navigate to="details" />,
                },
              ],
            },
            {
              path: '',
              element: <CredentialTypes />,
            },
          ],
        },
      ],
    },
    {
      id: EdaRoute.Settings,
      label: t('Settings'),
      path: 'settings',
      children: [
        {
          id: EdaRoute.SettingsPreferences,
          label: t('User Preferences'),
          path: 'preferences',
          children: [
            {
              path: 'edit',
              element: <PageSettingsForm />,
            },
            {
              path: '',
              element: <PageSettingsDetails />,
            },
          ],
        },
      ],
    },
    {
      path: '',
      element: <Navigate to={'./overview'} replace />,
    },
  ];
  return navigationItems;
}

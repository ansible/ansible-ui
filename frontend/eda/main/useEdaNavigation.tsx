import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNotImplemented } from '../../../framework';
import { PageNavigationItem } from '../../../framework/PageNavigation/PageNavigationItem';
import { PageSettingsDetails } from '../../../framework/PageSettings/PageSettingsDetails';
import { PageSettingsForm } from '../../../framework/PageSettings/PageSettingsForm';
import { EdaCredentialTypeAddTeams } from '../access/credential-types/components/EdaCredentialTypeAddTeams';
import { EdaCredentialTypeAddUsers } from '../access/credential-types/components/EdaCredentialTypeAddUsers';
import {
  CreateCredentialType,
  EditCredentialType,
} from '../access/credential-types/CredentialTypeForm';
import { CredentialTypeCredentials } from '../access/credential-types/CredentialTypePage/CredentialTypeCredentials';
import { CredentialTypeDetails } from '../access/credential-types/CredentialTypePage/CredentialTypeDetails';
import { CredentialTypePage } from '../access/credential-types/CredentialTypePage/CredentialTypePage';
import { CredentialTypeTeamAccess } from '../access/credential-types/CredentialTypePage/CredentialTypeTeamAccess';
import { CredentialTypeUserAccess } from '../access/credential-types/CredentialTypePage/CredentialTypeUserAccess';
import { CredentialTypes } from '../access/credential-types/CredentialTypes';
import { EdaCredentialAddTeams } from '../access/credentials/components/EdaCredentialAddTeams';
import { EdaCredentialAddUsers } from '../access/credentials/components/EdaCredentialAddUsers';
import { CreateCredential, EditCredential } from '../access/credentials/CredentialForm';
import { CredentialDetails } from '../access/credentials/CredentialPage/CredentialDetails';
import { CredentialPage } from '../access/credentials/CredentialPage/CredentialPage';
import { CredentialTeamAccess } from '../access/credentials/CredentialPage/CredentialTeamAccess';
import { CredentialUserAccess } from '../access/credentials/CredentialPage/CredentialUserAccess';
import { Credentials } from '../access/credentials/Credentials';
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
import { CreateControllerToken } from '../access/users/CreateControllerToken';
import { EdaAddUserRoles } from '../access/users/EdaAddUserRoles';
import { CreateUser, EditCurrentUser, EditUser } from '../access/users/EditUser';
import { ControllerTokens } from '../access/users/UserPage/ControllerTokens';
import { EdaMyDetails } from '../access/users/UserPage/EdaMyDetails';
import { EdaUserDetails } from '../access/users/UserPage/EdaUserDetails';
import { EdaUserRoles } from '../access/users/UserPage/EdaUserRoles';
import { MyPage } from '../access/users/UserPage/MyPage';
import { UserPage } from '../access/users/UserPage/UserPage';
import { Users } from '../access/users/Users';
import { EdaDecisionEnvironmentAddTeams } from '../decision-environments/components/EdaDecisionEnvironmentAddTeams';
import { EdaDecisionEnvironmentAddUsers } from '../decision-environments/components/EdaDecisionEnvironmentAddUsers';
import {
  CreateDecisionEnvironment,
  EditDecisionEnvironment,
} from '../decision-environments/DecisionEnvironmentForm';
import { DecisionEnvironmentDetails } from '../decision-environments/DecisionEnvironmentPage/DecisionEnvironmentDetails';
import { DecisionEnvironmentPage } from '../decision-environments/DecisionEnvironmentPage/DecisionEnvironmentPage';
import { DecisionEnvironmentTeamAccess } from '../decision-environments/DecisionEnvironmentPage/DecisionEnvironmentTeamAccess';
import { DecisionEnvironmentUserAccess } from '../decision-environments/DecisionEnvironmentPage/DecisionEnvironmentUserAccess';
import { DecisionEnvironments } from '../decision-environments/DecisionEnvironments';
import { EdaOverview } from '../overview/EdaOverview';
import { EdaProjectAddTeams } from '../projects/components/EdaProjectAddTeams';
import { EdaProjectAddUsers } from '../projects/components/EdaProjectAddUsers';
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
import { EdaRulebookActivationAddTeams } from '../rulebook-activations/components/EdaRulebookActivationAddTeams';
import { EdaRulebookActivationAddUsers } from '../rulebook-activations/components/EdaRulebookActivationAddUsers';
import { CreateRulebookActivation } from '../rulebook-activations/RulebookActivationForm';
import { RulebookActivationDetails } from '../rulebook-activations/RulebookActivationPage/RulebookActivationDetails';
import { RulebookActivationHistory } from '../rulebook-activations/RulebookActivationPage/RulebookActivationHistory';
import { RulebookActivationPage } from '../rulebook-activations/RulebookActivationPage/RulebookActivationPage';
import { RulebookActivationTeamAccess } from '../rulebook-activations/RulebookActivationPage/RuleBookActivationTeamAccess';
import { RulebookActivationUserAccess } from '../rulebook-activations/RulebookActivationPage/RuleBookActivationUserAccess';
import { RulebookActivations } from '../rulebook-activations/RulebookActivations';
import { CreateWebhook, EditWebhook } from '../webhooks/WebhookForm';
import { WebhookDetails } from '../webhooks/WebhookPage/WebhookDetails';
import { WebhookPage } from '../webhooks/WebhookPage/WebhookPage';
import { Webhooks } from '../webhooks/Webhooks';
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
          id: EdaRoute.RulebookActivationAddTeams,
          path: ':id/team-access/add',
          element: <EdaRulebookActivationAddTeams />,
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
            {
              id: EdaRoute.ProjectUserAccess,
              path: 'user-access',
              element: <PageNotImplemented />,
            },
          ],
        },
        {
          id: EdaRoute.ProjectAddUsers,
          path: ':id/user-access/add',
          element: <EdaProjectAddUsers />,
        },
        {
          id: EdaRoute.ProjectAddTeams,
          path: ':id/team-access/add',
          element: <EdaProjectAddTeams />,
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
          id: EdaRoute.DecisionEnvironmentAddTeams,
          path: ':id/team-access/add',
          element: <EdaDecisionEnvironmentAddTeams />,
        },
        {
          path: '',
          element: <DecisionEnvironments />,
        },
      ],
    },
    {
      id: EdaRoute.Webhooks,
      label: t('Event Streams'),
      path: 'webhooks',
      children: [
        {
          id: EdaRoute.CreateWebhook,
          path: 'create',
          element: <CreateWebhook />,
        },
        {
          id: EdaRoute.EditWebhook,
          path: 'edit/:id',
          element: <EditWebhook />,
        },
        {
          id: EdaRoute.WebhookPage,
          path: ':id',
          element: <WebhookPage />,
          children: [
            {
              id: EdaRoute.WebhookDetails,
              path: 'details',
              element: <WebhookDetails />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          path: '',
          element: <Webhooks />,
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
                  id: EdaRoute.MyTokens,
                  path: 'tokens',
                  element: <ControllerTokens />,
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
                  id: EdaRoute.UserTokens,
                  path: 'tokens',
                  element: <ControllerTokens />,
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
              path: 'tokens',
              children: [
                {
                  id: EdaRoute.CreateControllerToken,
                  path: 'create',
                  element: <CreateControllerToken />,
                },
              ],
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
              path: ':id/user-access/add',
              element: <EdaCredentialAddUsers />,
            },
            {
              id: EdaRoute.CredentialAddTeams,
              path: ':id/team-access/add',
              element: <EdaCredentialAddTeams />,
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
                  id: EdaRoute.CredentialTypeTeamAccess,
                  path: 'team-access',
                  element: <CredentialTypeTeamAccess />,
                },
                {
                  id: EdaRoute.CredentialTypeUserAccess,
                  path: 'user-access',
                  element: <CredentialTypeUserAccess />,
                },
                {
                  path: '',
                  element: <Navigate to="details" />,
                },
              ],
            },
            {
              id: EdaRoute.CredentialTypeAddUsers,
              path: ':id/user-access/add',
              element: <EdaCredentialTypeAddUsers />,
            },
            {
              id: EdaRoute.CredentialTypeAddTeams,
              path: ':id/team-access/add',
              element: <EdaCredentialTypeAddTeams />,
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

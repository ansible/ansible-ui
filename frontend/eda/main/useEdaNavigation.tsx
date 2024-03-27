import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../framework/PageNavigation/PageNavigationItem';
import { PageSettings } from '../../../framework/PageSettings/PageSettings';
import { CredentialDetails } from '../access/credentials/CredentialPage/CredentialDetails';
import { CredentialPage } from '../access/credentials/CredentialPage/CredentialPage';
import { Credentials } from '../access/credentials/Credentials';
import { CreateCredential, EditCredential } from '../access/credentials/CredentialForm';
import { EdaRoleDetails } from '../access/roles/EdaRoleDetails';
import { EdaRolePage } from '../access/roles/EdaRolePage';
import { EdaRoles } from '../access/roles/EdaRoles';
import { EditRole } from '../access/roles/EditRole';
import { CreateControllerToken } from '../access/users/CreateControllerToken';
import { CreateUser, EditCurrentUser, EditUser } from '../access/users/EditUser';
import { ControllerTokens } from '../access/users/UserPage/ControllerTokens';
import { EdaMyDetails } from '../access/users/UserPage/EdaMyDetails';
import { EdaUserDetails } from '../access/users/UserPage/EdaUserDetails';
import { MyPage } from '../access/users/UserPage/MyPage';
import { UserPage } from '../access/users/UserPage/UserPage';
import { Users } from '../access/users/Users';
import {
  CreateDecisionEnvironment,
  EditDecisionEnvironment,
} from '../decision-environments/DecisionEnvironmentForm';
import { DecisionEnvironmentDetails } from '../decision-environments/DecisionEnvironmentPage/DecisionEnvironmentDetails';
import { DecisionEnvironmentPage } from '../decision-environments/DecisionEnvironmentPage/DecisionEnvironmentPage';
import { DecisionEnvironments } from '../decision-environments/DecisionEnvironments';
import { EdaOverview } from '../overview/EdaOverview';
import { CreateProject, EditProject } from '../projects/EditProject';
import { ProjectDetails } from '../projects/ProjectPage/ProjectDetails';
import { ProjectPage } from '../projects/ProjectPage/ProjectPage';
import { Projects } from '../projects/Projects';
import { RuleAudit } from '../rule-audit/RuleAudit';
import { RuleAuditActions } from '../rule-audit/RuleAuditPage/RuleAuditActions';
import { RuleAuditDetails } from '../rule-audit/RuleAuditPage/RuleAuditDetails';
import { RuleAuditEvents } from '../rule-audit/RuleAuditPage/RuleAuditEvents';
import { RuleAuditPage } from '../rule-audit/RuleAuditPage/RuleAuditPage';
import { ActivationInstanceDetails } from '../rulebook-activations/ActivationInstancePage/ActivationInstanceDetails';
import { ActivationInstancePage } from '../rulebook-activations/ActivationInstancePage/ActivationInstancePage';
import { CreateRulebookActivation } from '../rulebook-activations/RulebookActivationForm';
import { RulebookActivationDetails } from '../rulebook-activations/RulebookActivationPage/RulebookActivationDetails';
import { RulebookActivationHistory } from '../rulebook-activations/RulebookActivationPage/RulebookActivationHistory';
import { RulebookActivationPage } from '../rulebook-activations/RulebookActivationPage/RulebookActivationPage';
import { RulebookActivations } from '../rulebook-activations/RulebookActivations';
import { CreateWebhook, EditWebhook } from '../webhooks/EditWebhook';
import { WebhookDetails } from '../webhooks/WebhookPage/WebhookDetails';
import { WebhookPage } from '../webhooks/WebhookPage/WebhookPage';
import { Webhooks } from '../webhooks/Webhooks';
import { CredentialTypes } from '../access/credential-types/CredentialTypes';
import { CredentialTypeDetails } from '../access/credential-types/CredentialTypePage/CredentialTypeDetails';
import { CredentialTypePage } from '../access/credential-types/CredentialTypePage/CredentialTypePage';
import {
  CreateCredentialType,
  EditCredentialType,
} from '../access/credential-types/CredentialTypeForm';
import { EdaRoute } from './EdaRoutes';
import { EdaProjectAddUsers } from '../projects/components/EdaProjectAddUsers';
import { EdaProjectAddTeams } from '../projects/components/EdaProjectAddTeams';
import { PageNotImplemented } from '../../../framework';

export function useEdaNavigation() {
  const { t } = useTranslation();
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
              path: '',
              element: <Navigate to="details" />,
            },
          ],
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
              path: '',
              element: <Navigate to="details" />,
            },
            {
              id: EdaRoute.ProjectUsers,
              path: 'users',
              element: <PageNotImplemented />,
            },
          ],
        },
        {
          id: EdaRoute.ProjectAddUsers,
          path: ':id/users/add-users',
          element: <EdaProjectAddUsers />,
        },
        {
          id: EdaRoute.ProjectAddTeams,
          path: ':id/teams/add-teams',
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
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          path: '',
          element: <DecisionEnvironments />,
        },
      ],
    },
    {
      id: EdaRoute.Webhooks,
      label: t('Webhooks'),
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
          id: EdaRoute.Roles,
          label: t('Roles'),
          path: 'roles',
          children: [
            {
              id: EdaRoute.CreateRole,
              path: 'create',
              element: <EditRole />,
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
                  path: '',
                  element: <Navigate to="details" />,
                },
              ],
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
          element: <PageSettings />,
        },
      ],
    },
    {
      path: '',
      element: <Navigate to={'./overview'} />,
    },
  ];
  return navigationItems;
}

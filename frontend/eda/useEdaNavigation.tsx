import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import {
  PageNavigationItem,
  removeLeadingSlash,
} from '../../framework/PageNavigation/PageNavigationItem';
import { Login } from '../common/Login';
import { EdaRoute } from './EdaRoutes';
import { CredentialDetails } from './Resources/credentials/CredentialPage/CredentialDetails';
import { Credentials } from './Resources/credentials/Credentials';
import { CredentialPage } from './Resources/credentials/CredentialPage/CredentialPage';
import { CreateCredential, EditCredential } from './Resources/credentials/EditCredential';
import { DecisionEnvironmentDetails } from './Resources/decision-environments/DecisionEnvironmentPage/DecisionEnvironmentDetails';
import {
  CreateDecisionEnvironment,
  EditDecisionEnvironment,
} from './Resources/decision-environments/DecisionEnvironmentForm';
import { DecisionEnvironments } from './Resources/decision-environments/DecisionEnvironments';
import { CreateProject, EditProject } from './Resources/projects/EditProject';
import { ProjectDetails } from './Resources/projects/ProjectPage/ProjectDetails';
import { ProjectPage } from './Resources/projects/ProjectPage/ProjectPage';
import { Projects } from './Resources/projects/Projects';
import { EditRole } from './UserAccess/Roles/EditRole';
import { RoleDetails } from './UserAccess/Roles/RoleDetails';
import { Roles } from './UserAccess/Roles/Roles';
import { CreateControllerToken } from './UserAccess/Users/CreateControllerToken';
import { CreateUser, EditCurrentUser, EditUser } from './UserAccess/Users/EditUser';
import { Users } from './UserAccess/Users/Users';
import { EdaDashboard } from './dashboard/EdaDashboard';
import { ActivationInstanceDetails } from './rulebook-activations/ActivationInstancePage/ActivationInstanceDetails';
import { ActivationInstancePage } from './rulebook-activations/ActivationInstancePage/ActivationInstancePage';
import { CreateRulebookActivation } from './rulebook-activations/RulebookActivationForm';
import { RulebookActivationDetails } from './rulebook-activations/RulebookActivationPage/RulebookActivationDetails';
import { RulebookActivationHistory } from './rulebook-activations/RulebookActivationPage/RulebookActivationHistory';
import { RulebookActivationPage } from './rulebook-activations/RulebookActivationPage/RulebookActivationPage';
import { RulebookActivations } from './rulebook-activations/RulebookActivations';
import { RuleAudit } from './views/RuleAudit/RuleAudit';
import { RuleAuditDetails } from './views/RuleAudit/RuleAuditPage/RuleAuditDetails';
import { DecisionEnvironmentPage } from './Resources/decision-environments/DecisionEnvironmentPage/DecisionEnvironmentPage';
import { ControllerTokens } from './UserAccess/Users/UserPage/ControllerTokens';
import { UserPage } from './UserAccess/Users/UserPage/UserPage';
import { MyPage } from './UserAccess/Users/UserPage/MyPage';
import { MyDetails } from './UserAccess/Users/UserPage/MyDetails';
import { UserDetails } from './UserAccess/Users/UserPage/UserDetails';
import { RuleAuditPage } from './views/RuleAudit/RuleAuditPage/RuleAuditPage';
import { RuleAuditActions } from './views/RuleAudit/RuleAuditPage/RuleAuditActions';
import { RuleAuditEvents } from './views/RuleAudit/RuleAuditPage/RuleAuditEvents';

export function useEdaNavigation() {
  const { t } = useTranslation();
  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    const navigationItems: PageNavigationItem[] = [
      {
        label: '',
        path: removeLeadingSlash(process.env.EDA_ROUTE_PREFIX),
        children: [
          {
            id: EdaRoute.Dashboard,
            label: t('Dashboard'),
            path: 'dashboard',
            element: <EdaDashboard />,
          },
          {
            label: t('Views'),
            path: 'views',
            children: [
              {
                id: EdaRoute.RuleAudits,
                label: t('Rule Audits'),
                path: 'rule-audits',
                children: [
                  {
                    id: EdaRoute.RuleAuditPage,
                    path: 'details/:id',
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
            ],
          },
          {
            label: t('Resources'),
            path: 'resources',
            children: [
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
                    path: 'details/:id',
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
                    ],
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
                    path: 'details/:id',
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
                    path: 'details/:id',
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
            ],
          },
          {
            label: t('User Access'),
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
                        element: <MyDetails />,
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
                    path: 'details/:id',
                    children: [
                      {
                        id: EdaRoute.UserDetails,
                        path: 'details',
                        element: <UserDetails />,
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
                    path: 'details/:id',
                    element: <RoleDetails />,
                  },
                  {
                    path: '',
                    element: <Roles />,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: EdaRoute.Login,
        path: 'login',
        element: <Login />,
      },
      {
        id: EdaRoute.Eda,
        path: '',
        element: (
          <Navigate
            to={
              process.env.EDA_ROUTE_PREFIX
                ? process.env.EDA_ROUTE_PREFIX + '/dashboard'
                : 'dashboard'
            }
          />
        ),
      },
    ];
    return navigationItems;
  }, [t]);

  return pageNavigationItems;
}

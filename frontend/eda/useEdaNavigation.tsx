import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import {
  PageNavigationItem,
  removeLeadingSlash,
} from '../../framework/PageNavigation/PageNavigationItem';
import { Login } from '../common/Login';
import { EdaRoute } from './EdaRoutes';
import { CredentialDetails } from './Resources/credentials/CredentialDetails';
import { Credentials } from './Resources/credentials/Credentials';
import { CreateCredential, EditCredential } from './Resources/credentials/EditCredential';
import { DecisionEnvironmentDetails } from './Resources/decision-environments/DecisionEnvironmentDetails';
import {
  CreateDecisionEnvironment,
  EditDecisionEnvironment,
} from './Resources/decision-environments/DecisionEnvironmentForm';
import { DecisionEnvironments } from './Resources/decision-environments/DecisionEnvironments';
import { CreateProject, EditProject } from './Resources/projects/EditProject';
import { ProjectDetails } from './Resources/projects/ProjectDetails';
import { Projects } from './Resources/projects/Projects';
import { EditRole } from './UserAccess/Roles/EditRole';
import { RoleDetails } from './UserAccess/Roles/RoleDetails';
import { Roles } from './UserAccess/Roles/Roles';
import { CreateControllerToken } from './UserAccess/Users/CreateControllerToken';
import { EdaMyDetails, EdaUserDetails } from './UserAccess/Users/EdaUserDetails';
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
import { RuleAuditDetails } from './views/RuleAudit/RuleAuditDetails';

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
                    path: ':id/*',
                    element: <RuleAuditDetails />,
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
                  // {
                  //   id: EdaRoute.RulebookActivationPage,
                  //   path: 'details/:id',
                  //   element: <RulebookActivationPage initialTabIndex={0} />,
                  // },
                  // {
                  //   id: EdaRoute.RulebookActivationHistory,
                  //   path: 'details/:id/history',
                  //   element: <RulebookActivationPage initialTabIndex={1} />,
                  // },
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
                    element: <ProjectDetails />,
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
                    element: <DecisionEnvironmentDetails />,
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
                    element: <CredentialDetails />,
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
                    children: [
                      {
                        id: EdaRoute.MyTokens,
                        path: 'tokens',
                        element: <EdaMyDetails initialTabIndex={1} />,
                      },
                      {
                        id: EdaRoute.MyPage,
                        path: '',
                        element: <EdaMyDetails initialTabIndex={0} />,
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
                    path: 'details/:id',
                    children: [
                      {
                        id: EdaRoute.UserTokens,
                        path: 'tokens',
                        element: <EdaUserDetails initialTabIndex={1} />,
                      },
                      {
                        path: '',
                        element: <EdaUserDetails initialTabIndex={0} />,
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

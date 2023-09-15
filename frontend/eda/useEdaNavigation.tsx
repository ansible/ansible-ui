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
import { EditGroup } from './UserAccess/Groups/EditGroup';
import { GroupDetails } from './UserAccess/Groups/GroupDetails';
import { Groups } from './UserAccess/Groups/Groups';
import { EditRole } from './UserAccess/Roles/EditRole';
import { RoleDetails } from './UserAccess/Roles/RoleDetails';
import { Roles } from './UserAccess/Roles/Roles';
import { CreateControllerToken } from './UserAccess/Users/CreateControllerToken';
import { EdaMyDetails, EdaUserDetails } from './UserAccess/Users/EdaUserDetails';
import { CreateUser, EditUser } from './UserAccess/Users/EditUser';
import { Users } from './UserAccess/Users/Users';
import { EdaDashboard } from './dashboard/EdaDashboard';
import { ActivationInstanceDetails } from './rulebook-activations/ActivationInstanceDetails';
import { RulebookActivationDetails } from './rulebook-activations/RulebookActivationDetails';
import { CreateRulebookActivation } from './rulebook-activations/RulebookActivationForm';
import { RulebookActivations } from './rulebook-activations/RulebookActivations';
import { RulebookDetails } from './rulebooks/RulebookDetails';
import { Rulebooks } from './rulebooks/Rulebooks';
import { EditRule } from './rules/EditRule';
import { RuleDetails } from './rules/RuleDetails';
import { Rules } from './rules/Rules';
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
                label: t('Rule Audits'),
                path: 'rule-audits',
                children: [
                  {
                    id: EdaRoute.RuleAuditPage,
                    path: ':id/*',
                    element: <RuleAuditDetails />,
                  },
                  {
                    id: EdaRoute.RuleAudits,
                    path: '',
                    element: <RuleAudit />,
                  },
                ],
              },
              {
                label: t('Rulebook Activations'),
                path: 'rulebook-activations',
                children: [
                  {
                    id: EdaRoute.CreateRulebookActivation,
                    path: 'create',
                    element: <CreateRulebookActivation />,
                  },
                  {
                    id: EdaRoute.RulebookActivationPage,
                    path: 'details/:id',
                    element: <RulebookActivationDetails initialTabIndex={0} />,
                  },
                  {
                    id: EdaRoute.RulebookActivationHistory,
                    path: 'details/:id/history',
                    element: <RulebookActivationDetails initialTabIndex={1} />,
                  },
                  {
                    id: EdaRoute.RulebookActivationInstancesPage,
                    path: 'activations-instances/details/:id',
                    element: <ActivationInstanceDetails />,
                  },
                  { id: EdaRoute.RulebookActivations, path: '', element: <RulebookActivations /> },
                ],
              },
              {
                // label: t('Rulebooks'),
                path: 'rulebooks',
                children: [
                  {
                    id: EdaRoute.RulebookPage,
                    path: ':id/*',
                    element: <RulebookDetails />,
                  },
                  {
                    id: EdaRoute.Rulebooks,
                    path: '',
                    element: <Rulebooks />,
                  },
                ],
              },
              {
                // label: t('Rules'),
                path: 'rules',
                children: [
                  {
                    id: EdaRoute.CreateRule,
                    path: 'create',
                    element: <EditRule />,
                  },
                  {
                    id: EdaRoute.EditRule,
                    path: 'edit/:id',
                    element: <EditRule />,
                  },
                  {
                    id: EdaRoute.RulePage,
                    path: 'details/:id',
                    element: <RuleDetails />,
                  },
                  {
                    id: EdaRoute.Rules,
                    path: '',
                    element: <Rules />,
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
                    id: EdaRoute.Projects,
                    path: '',
                    element: <Projects />,
                  },
                ],
              },
              {
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
                    id: EdaRoute.DecisionEnvironments,
                    path: '',
                    element: <DecisionEnvironments />,
                  },
                ],
              },
              {
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
                    id: EdaRoute.Credentials,
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
                // label: t('Groups'),
                path: 'groups',
                children: [
                  {
                    id: EdaRoute.CreateGroup,
                    path: 'create',
                    element: <EditGroup />,
                  },
                  {
                    id: EdaRoute.EditGroup,
                    path: 'edit/:id',
                    element: <EditGroup />,
                  },
                  {
                    id: EdaRoute.GroupPage,
                    path: 'details/:id',
                    element: <GroupDetails />,
                  },
                  {
                    id: EdaRoute.Groups,
                    path: '',
                    element: <Groups />,
                  },
                ],
              },
              {
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
                    path: 'details/:id',
                    children: [
                      {
                        id: EdaRoute.UserTokens,
                        path: 'tokens',
                        element: <EdaUserDetails initialTabIndex={1} />,
                      },
                      {
                        id: EdaRoute.UserPage,
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
                    id: EdaRoute.Users,
                    path: '',
                    element: <Users />,
                  },
                ],
              },
              {
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
                    id: EdaRoute.Roles,
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

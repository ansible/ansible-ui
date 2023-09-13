import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  PageNavigationItem,
  useNavigationRoutes,
} from '../../framework/PageNavigation/PageNavigation';
import { Login } from '../common/Login';
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

export enum EdaRoute {
  Eda = 'eda',

  Dashboard = 'eda-dashboard',

  RuleAudits = 'eda-rule-audits',
  RuleAuditDetails = 'eda-rule-audit-details',

  RulebookActivations = 'eda-rulebook-activations',
  CreateRulebookActivation = 'eda-create-rulebook-activation',
  RulebookActivationDetails = 'eda-rulebook-activation-details',
  RulebookActivationHistory = 'eda-rulebook-activation-history',
  RulebookActivationInstancesDetails = 'eda-rulebook-activation-instances-details',

  Rulebooks = 'eda-rulebooks',
  RulebookDetails = 'eda-rulebook-details',

  Projects = 'eda-projects',
  CreateProject = 'eda-create-project',
  EditProject = 'eda-edit-project',
  ProjectDetails = 'eda-project-details',

  DecisionEnvironments = 'eda-decision-environments',
  CreateDecisionEnvironment = 'eda-create-decision-environment',
  EditDecisionEnvironment = 'eda-edit-decision-environment',
  DecisionEnvironmentDetails = 'eda-decision-environment-details',

  Credentials = 'eda-credentials',
  CreateCredential = 'eda-create-credential',
  EditCredential = 'eda-edit-credential',
  CredentialDetails = 'eda-credential-details',

  Groups = 'eda-groups',
  CreateGroup = 'eda-create-group',
  EditGroup = 'eda-edit-group',
  GroupDetails = 'eda-group-details',

  Users = 'eda-users',
  CreateUser = 'eda-create-user',
  EditUser = 'eda-edit-user',
  UserDetails = 'eda-user-details',
  UserTokens = 'eda-user-tokens',

  Rules = 'eda-rules',
  CreateRule = 'eda-create-rule',
  EditRule = 'eda-edit-rule',
  RuleDetails = 'eda-rule-details',

  Roles = 'eda-roles',
  CreateRole = 'eda-create-role',
  EditRole = 'eda-edit-role',
  RoleDetails = 'eda-role-details',

  EdaMyDetails = 'eda-my-details',
  EdaMyTokens = 'eda-my-tokens',

  CreateControllerToken = 'eda-create-controller-token',

  Login = 'eda-login',
}

export function useEdaNavigation() {
  const { t } = useTranslation();
  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    const navigationItems: PageNavigationItem[] = [
      {
        label: '',
        path: process.env.EDA_ROUTE_PREFIX,
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
                    id: EdaRoute.RuleAuditDetails,
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
                    id: EdaRoute.RulebookActivationDetails,
                    path: 'details/:id',
                    element: <RulebookActivationDetails initialTabIndex={0} />,
                  },
                  {
                    id: EdaRoute.RulebookActivationHistory,
                    path: 'details/:id/history',
                    element: <RulebookActivationDetails initialTabIndex={1} />,
                  },
                  {
                    id: EdaRoute.RulebookActivationInstancesDetails,
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
                    id: EdaRoute.RulebookDetails,
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
                    id: EdaRoute.RuleDetails,
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
                    id: EdaRoute.ProjectDetails,
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
                    id: EdaRoute.DecisionEnvironmentDetails,
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
                    id: EdaRoute.CredentialDetails,
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
                    id: EdaRoute.GroupDetails,
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
                        id: EdaRoute.EdaMyTokens,
                        path: 'tokens',
                        element: <EdaMyDetails initialTabIndex={1} />,
                      },
                      {
                        id: EdaRoute.EdaMyDetails,
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
                        id: EdaRoute.UserDetails,
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
                    id: EdaRoute.RoleDetails,
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

export function useEdaNavigate() {
  const navigate = useNavigate();
  const navigation = useEdaNavigation();
  const routes = useNavigationRoutes(navigation);
  return (route: EdaRoute) => navigate(routes[route]);
}

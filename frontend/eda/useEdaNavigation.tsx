import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../framework/PageNavigation/PageNavigationItem';
import { EdaRoute } from './EdaRoutes';
import { CredentialDetails } from './Resources/credentials/CredentialPage/CredentialDetails';
import { CredentialPage } from './Resources/credentials/CredentialPage/CredentialPage';
import { Credentials } from './Resources/credentials/Credentials';
import { CreateCredential, EditCredential } from './Resources/credentials/EditCredential';
import {
  CreateDecisionEnvironment,
  EditDecisionEnvironment,
} from './Resources/decision-environments/DecisionEnvironmentForm';
import { DecisionEnvironmentDetails } from './Resources/decision-environments/DecisionEnvironmentPage/DecisionEnvironmentDetails';
import { DecisionEnvironmentPage } from './Resources/decision-environments/DecisionEnvironmentPage/DecisionEnvironmentPage';
import { DecisionEnvironments } from './Resources/decision-environments/DecisionEnvironments';
import { CreateProject, EditProject } from './Resources/projects/EditProject';
import { ProjectDetails } from './Resources/projects/ProjectPage/ProjectDetails';
import { ProjectPage } from './Resources/projects/ProjectPage/ProjectPage';
import { Projects } from './Resources/projects/Projects';
import { EdaRoles } from './UserAccess/Roles/EdaRoles';
import { EditRole } from './UserAccess/Roles/EditRole';
import { RoleDetails } from './UserAccess/Roles/RoleDetails';
import { CreateControllerToken } from './UserAccess/Users/CreateControllerToken';
import { CreateUser, EditCurrentUser, EditUser } from './UserAccess/Users/EditUser';
import { ControllerTokens } from './UserAccess/Users/UserPage/ControllerTokens';
import { EdaMyDetails } from './UserAccess/Users/UserPage/EdaMyDetails';
import { EdaUserDetails } from './UserAccess/Users/UserPage/EdaUserDetails';
import { MyPage } from './UserAccess/Users/UserPage/MyPage';
import { UserPage } from './UserAccess/Users/UserPage/UserPage';
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
import { RuleAuditActions } from './views/RuleAudit/RuleAuditPage/RuleAuditActions';
import { RuleAuditDetails } from './views/RuleAudit/RuleAuditPage/RuleAuditDetails';
import { RuleAuditEvents } from './views/RuleAudit/RuleAuditPage/RuleAuditEvents';
import { RuleAuditPage } from './views/RuleAudit/RuleAuditPage/RuleAuditPage';

export function useEdaNavigation() {
  const { t } = useTranslation();
  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    const navigationItems: PageNavigationItem[] = [
      {
        id: EdaRoute.Overview,
        label: t('Overview'),
        path: 'overview',
        element: <EdaDashboard />,
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
        id: EdaRoute.Access,
        label: t('Access'),
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
                path: ':id',
                element: <RoleDetails />,
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
        ],
      },
      {
        path: '',
        element: <Navigate to={'./overview'} />,
      },
    ];
    return navigationItems;
  }, [t]);

  return pageNavigationItems;
}

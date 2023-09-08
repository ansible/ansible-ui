import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet } from 'react-router-dom';
import { PageNavigationItem } from '../../framework/PageNavigation/PageNavigation';
import { ActiveEdaUserProvider } from '../common/useActiveUser';
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
        path: process.env.EDA_ROUTE_PREFIX,
        element: <EdaRoot />,
        children: [
          {
            label: t('Dashboard'),
            path: 'dashboard',
            element: <EdaDashboard />,
          },
          {
            label: t('Views'),
            path: 'views',
            children: [
              {
                label: t('Rule Audit'),
                path: 'rule-audit',
                children: [
                  { path: ':id/*', element: <RuleAuditDetails /> },
                  { path: '', element: <RuleAudit /> },
                ],
              },
              {
                label: t('Rulebook Activations'),
                path: 'rulebook-activations',
                children: [
                  { path: 'create', element: <CreateRulebookActivation /> },
                  {
                    path: 'details/:id',
                    element: <RulebookActivationDetails initialTabIndex={0} />,
                  },
                  {
                    path: 'details/:id/history',
                    element: <RulebookActivationDetails initialTabIndex={1} />,
                  },
                  {
                    path: 'activations-instances/details/:id',
                    element: <ActivationInstanceDetails />,
                  },
                  { path: '', element: <RulebookActivations /> },
                ],
              },
              {
                // label: t('Rulebooks'),
                path: 'rulebooks',
                children: [
                  { path: ':id/*', element: <RulebookDetails /> },
                  { path: '', element: <Rulebooks /> },
                ],
              },
              {
                // label: t('Rules'),
                path: 'rules',
                children: [
                  { path: 'create', element: <EditRule /> },
                  { path: 'edit/:id', element: <EditRule /> },
                  { path: 'details/:id', element: <RuleDetails /> },
                  { path: '', element: <Rules /> },
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
                  { path: 'create', element: <CreateProject /> },
                  { path: 'edit/:id', element: <EditProject /> },
                  { path: 'details/:id', element: <ProjectDetails /> },
                  { path: '', element: <Projects /> },
                ],
              },
              {
                label: t('Decision Environments'),
                path: 'decision-environments',
                children: [
                  { path: 'create', element: <CreateDecisionEnvironment /> },
                  { path: 'edit/:id', element: <EditDecisionEnvironment /> },
                  { path: 'details/:id', element: <DecisionEnvironmentDetails /> },
                  { path: '', element: <DecisionEnvironments /> },
                ],
              },
              {
                label: t('Credentials'),
                path: 'credentials',
                children: [
                  { path: 'create', element: <CreateCredential /> },
                  { path: 'edit/:id', element: <EditCredential /> },
                  { path: 'details/:id', element: <CredentialDetails /> },
                  { path: '', element: <Credentials /> },
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
                  { path: 'create', element: <EditGroup /> },
                  { path: 'edit/:id', element: <EditGroup /> },
                  { path: 'details/:id', element: <GroupDetails /> },
                  { path: '', element: <Groups /> },
                ],
              },
              {
                label: t('Users'),
                path: 'users',
                children: [
                  {
                    path: 'me',
                    children: [
                      { path: 'tokens', element: <EdaMyDetails initialTabIndex={1} /> },
                      { path: '', element: <EdaMyDetails initialTabIndex={0} /> },
                    ],
                  },
                  { path: 'create', element: <CreateUser /> },
                  { path: 'edit/:id', element: <EditUser /> },
                  {
                    path: 'details/:id',
                    children: [
                      { path: 'tokens', element: <EdaUserDetails initialTabIndex={1} /> },
                      { path: '', element: <EdaUserDetails initialTabIndex={0} /> },
                    ],
                  },
                  {
                    path: 'tokens',
                    children: [{ path: 'create', element: <CreateControllerToken /> }],
                  },
                  { path: '', element: <Users /> },
                ],
              },
              {
                label: t('Roles'),
                path: 'roles',
                children: [
                  { path: 'create', element: <EditRole /> },
                  { path: 'edit/:id', element: <EditRole /> },
                  { path: 'details/:id', element: <RoleDetails /> },
                  { path: '', element: <Roles /> },
                ],
              },
            ],
          },
        ],
      },
      {
        path: '/',
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

export function EdaRoot() {
  return (
    <ActiveEdaUserProvider>
      <Outlet />
    </ActiveEdaUserProvider>
  );
}

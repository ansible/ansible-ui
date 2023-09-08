import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet } from 'react-router-dom';
import { PageNavigationItem } from '../../framework/PageNavigation/PageNavigation';
import { PageNotImplemented } from '../common/PageNotImplemented';
import { ActiveUserProvider } from '../common/useActiveUser';
import { CreateOrganization, EditOrganization } from './access/organizations/OrganizationForm';
import { OrganizationPage } from './access/organizations/OrganizationPage/OrganizationPage';
import { Organizations } from './access/organizations/Organizations';
import { CreateTeam, EditTeam } from './access/teams/TeamForm';
import { TeamPage } from './access/teams/TeamPage/TeamPage';
import { Teams } from './access/teams/Teams';
import { AddRolesToTeam } from './access/teams/components/AddRolesToTeam';
import { CreateUser, EditUser } from './access/users/UserForm';
import { UserPage } from './access/users/UserPage/UserPage';
import { Users } from './access/users/Users';
import { AddRolesToUser } from './access/users/components/AddRolesToUser';
import { ApplicationPage } from './administration/applications/ApplicationPage/ApplicationPage';
import { Applications } from './administration/applications/Applications';
import { CredentialTypePage } from './administration/credential-types/CredentialTypePage/CredentialTypePage';
import { CredentialTypes } from './administration/credential-types/CredentialTypes';
import { ExecutionEnvironments } from './administration/execution-environments/ExecutionEnvironments';
import { InstanceGroups } from './administration/instance-groups/InstanceGroups';
import { EditInstance } from './administration/instances/EditInstance';
import { InstanceDetails } from './administration/instances/InstanceDetails';
import { Instances } from './administration/instances/Instances';
import { ManagementJobPage } from './administration/management-jobs/ManagementJobPage/ManagementJobPage';
import { ManagementJobs } from './administration/management-jobs/ManagementJobs';
import { NotificationPage } from './administration/notifications/NotificationPage/NotificationPage';
import { Notifications } from './administration/notifications/Notifications';
import Reports from './analytics/Reports/Reports';
import SubscriptionUsage from './analytics/subscription-usage/SubscriptionUsage';
import { AwxConfigProvider } from './common/useAwxConfig';
import { WebSocketProvider } from './common/useAwxWebSocket';
import { AwxDashboard } from './dashboard/AwxDashboard';
import { CreateCredential, EditCredential } from './resources/credentials/CredentialForm';
import { CredentialPage } from './resources/credentials/CredentialPage/CredentialPage';
import { Credentials } from './resources/credentials/Credentials';
import { HostPage } from './resources/hosts/HostPage/HostPage';
import { Hosts } from './resources/hosts/Hosts';
import { Inventories } from './resources/inventories/Inventories';
import { CreateInventory, EditInventory } from './resources/inventories/InventoryForm';
import { InventoryPage } from './resources/inventories/InventoryPage/InventoryPage';
import { CreateProject, EditProject } from './resources/projects/ProjectPage/ProjectForm';
import { ProjectPage } from './resources/projects/ProjectPage/ProjectPage';
import { Projects } from './resources/projects/Projects';
import { CreateJobTemplate, EditJobTemplate } from './resources/templates/TemplateForm';
import { TemplatePage } from './resources/templates/TemplatePage/TemplatePage';
import { Templates } from './resources/templates/Templates';
import { WorkflowJobTemplatePage } from './resources/templates/WorkflowJobTemplatePage/WorkflowJobTemplatePage';
import Settings from './settings/Settings';
import HostMetrics from './views/jobs/HostMetrics';
import { JobPage } from './views/jobs/JobPage';
import Jobs from './views/jobs/Jobs';
import { CreateSchedule } from './views/schedules/ScheduleForm';
import { SchedulePage } from './views/schedules/SchedulePage/SchedulePage';
import { Schedules } from './views/schedules/Schedules';

export function useAwxNavigation() {
  const { t } = useTranslation();
  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    const navigationItems: PageNavigationItem[] = [
      {
        label: '',
        path: process.env.AWX_ROUTE_PREFIX,
        element: <AwxRoot />,
        children: [
          {
            label: t('Dashboard'),
            path: 'dashboard',
            element: <AwxDashboard />,
          },
          {
            label: t('Views'),
            path: 'views',
            children: [
              {
                label: t('Jobs'),
                path: 'jobs',
                children: [
                  { path: ':job_type/:id/*', element: <JobPage /> },
                  { path: '', element: <Jobs /> },
                ],
              },
              {
                label: t('Schedules'),
                path: 'schedules',
                children: [
                  { path: 'create', element: <CreateSchedule /> },
                  {
                    path: ':resource_type/:resource_id/:schedule_id/edit',
                    element: <SchedulePage />,
                  },
                  { path: '', element: <Schedules /> },
                ],
              },
              {
                label: t('Activity Stream'),
                path: 'activity-stream',
                element: <PageNotImplemented />,
              },
              {
                label: t('Workflow Approvals'),
                path: 'workflow-approvals',
                children: [
                  { path: ':id/*', element: <PageNotImplemented /> },
                  { path: '', element: <PageNotImplemented /> },
                ],
              },
            ],
          },
          {
            label: t('Resources'),
            path: 'resources',
            children: [
              {
                label: 'Templates',
                path: 'templates',
                children: [
                  {
                    path: 'jobs',
                    children: [
                      { path: 'create', element: <CreateJobTemplate /> },
                      { path: ':id/edit', element: <EditJobTemplate /> },
                      { path: ':id/schedules/:schedule_id/*', element: <SchedulePage /> },
                      { path: ':id/*', element: <TemplatePage /> },
                    ],
                  },
                  {
                    path: 'workflows',
                    children: [
                      { path: ':id/schedules/:schedule_id/*', element: <SchedulePage /> },
                      { path: ':id/*', element: <WorkflowJobTemplatePage /> },
                    ],
                  },
                  { path: '', element: <Templates /> },
                ],
              },
              {
                label: t('Credentials'),
                path: 'credentials',
                children: [
                  { path: 'create', element: <CreateCredential /> },
                  { path: ':id/edit', element: <EditCredential /> },
                  { path: ':id/*', element: <CredentialPage /> },
                  { path: '', element: <Credentials /> },
                ],
              },
              {
                label: t('Projects'),
                path: 'projects',
                children: [
                  { path: 'create', element: <CreateProject /> },
                  { path: ':id/edit', element: <EditProject /> },
                  { path: ':id/schedules/:schedule_id/*', element: <SchedulePage /> },
                  { path: ':id/*', element: <ProjectPage /> },
                  { path: '', element: <Projects /> },
                ],
              },
              {
                label: t('Inventories'),
                path: 'inventories',
                children: [
                  { path: 'create', element: <CreateInventory /> },
                  { path: ':id/edit', element: <EditInventory /> },
                  {
                    path: ':inventory_type/:id/schedules/:schedule_id/*',
                    element: <SchedulePage />,
                  },
                  { path: ':inventory_type/:id/*', element: <InventoryPage /> },
                  { path: '', element: <Inventories /> },
                ],
              },
              {
                label: t('Hosts'),
                path: 'hosts',
                children: [
                  { path: ':id/*', element: <HostPage /> },
                  { path: '', element: <Hosts /> },
                ],
              },
            ],
          },
          {
            label: t('Access'),
            path: 'access',
            children: [
              {
                label: t('Organizations'),
                path: 'organizations',
                children: [
                  { path: 'create', element: <CreateOrganization /> },
                  { path: ':id/edit', element: <EditOrganization /> },
                  { path: ':id/*', element: <OrganizationPage /> },
                  { path: '', element: <Organizations /> },
                ],
              },
              {
                label: t('Teams'),
                path: 'teams',
                children: [
                  { path: 'create', element: <CreateTeam /> },
                  { path: ':id/edit', element: <EditTeam /> },
                  { path: ':id/roles/add', element: <AddRolesToTeam /> },
                  { path: ':id/*', element: <TeamPage /> },
                  { path: '', element: <Teams /> },
                ],
              },
              {
                label: t('Users'),
                path: 'users',
                children: [
                  { path: 'create', element: <CreateUser /> },
                  { path: ':id/edit', element: <EditUser /> },
                  { path: ':id/roles/add', element: <AddRolesToUser /> },
                  { path: ':id/*', element: <UserPage /> },
                  { path: '', element: <Users /> },
                ],
              },
            ],
          },
          {
            label: t('Administration'),
            path: 'administration',
            children: [
              {
                label: t('Credential Types'),
                path: 'credential-types',
                children: [
                  { path: ':id/*', element: <CredentialTypePage /> },
                  { path: '', element: <CredentialTypes /> },
                ],
              },
              {
                label: t('Notifictions'),
                path: 'notifications',
                children: [
                  { path: ':id/*', element: <NotificationPage /> },
                  { path: '', element: <Notifications /> },
                ],
              },
              {
                label: t('Management Jobs'),
                path: 'management-jobs',
                children: [
                  {
                    path: ':resource_id/schedules/:schedule_id/details',
                    element: <SchedulePage />,
                  },
                  { path: ':id/*', element: <ManagementJobPage /> },
                  { path: '', element: <ManagementJobs /> },
                ],
              },
              {
                label: t('Instance Groups'),
                path: 'instance-groups',
                element: <InstanceGroups />,
              },
              {
                label: t('Instances'),
                path: 'instances',
                children: [
                  { path: ':id/edit', element: <EditInstance /> },
                  { path: ':id/*', element: <InstanceDetails /> },
                  { path: '', element: <Instances /> },
                ],
              },
              {
                label: t('Applications'),
                path: 'applications',
                children: [
                  { path: ':id/*', element: <ApplicationPage /> },
                  { path: '', element: <Applications /> },
                ],
              },
              {
                label: t('Execution Environments'),
                path: 'execution-environments',
                element: <ExecutionEnvironments />,
              },
              {
                label: 'Topology View',
                path: 'topology',
                element: <PageNotImplemented />,
              },
            ],
          },
          {
            label: t('Analytics'),
            path: 'analytics',
            children: [
              {
                label: t('Reports'),
                path: 'reports',
                element: <Reports />,
              },
              {
                label: 'Host Metrics',
                path: 'host-metrics',
                element: <HostMetrics />,
              },
              {
                label: 'Subscription Usage',
                path: 'subscription-usage',
                element: <SubscriptionUsage />,
              },
            ],
          },
          {
            label: t('Settings'),
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
      {
        path: '/',
        element: (
          <Navigate
            to={
              process.env.AWX_ROUTE_PREFIX
                ? process.env.AWX_ROUTE_PREFIX + '/dashboard'
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

export function AwxRoot() {
  return (
    <WebSocketProvider>
      <ActiveUserProvider>
        <AwxConfigProvider>
          <Outlet />
        </AwxConfigProvider>
      </ActiveUserProvider>
    </WebSocketProvider>
  );
}

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet } from 'react-router-dom';
import {
  PageNavigationItem,
  removeLeadingSlash,
} from '../../framework/PageNavigation/PageNavigationItem';
import { PageNotImplemented } from '../common/PageNotImplemented';
import { ActiveUserProvider } from '../common/useActiveUser';
import { AwxLogin } from './AwxLogin';
import { AwxRoute } from './AwxRoutes';
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
        id: AwxRoute.Login,
        path: 'login',
        element: <AwxLogin />,
      },
      {
        label: '',
        path: removeLeadingSlash(process.env.AWX_ROUTE_PREFIX),
        element: (
          <WebSocketProvider>
            <ActiveUserProvider>
              <AwxConfigProvider>
                <Outlet />
              </AwxConfigProvider>
            </ActiveUserProvider>
          </WebSocketProvider>
        ),
        children: [
          {
            id: AwxRoute.Dashboard,
            label: t('Dashboard'),
            path: 'dashboard',
            element: <AwxDashboard />,
          },
          {
            label: t('Views'),
            path: 'views',
            children: [
              {
                id: AwxRoute.Jobs,
                label: t('Jobs'),
                path: 'jobs',
                children: [
                  {
                    id: AwxRoute.JobPage,
                    path: ':job_type/:id/*',
                    element: <JobPage />,
                  },
                  {
                    path: '',
                    element: <Jobs />,
                  },
                ],
              },
              {
                id: AwxRoute.Schedules,
                label: t('Schedules'),
                path: 'schedules',
                children: [
                  {
                    id: AwxRoute.CreateSchedule,
                    path: 'create',
                    element: <CreateSchedule />,
                  },
                  {
                    id: AwxRoute.EditSchedule,
                    path: ':resource_type/:resource_id/:schedule_id/edit',
                    element: <SchedulePage />,
                  },
                  {
                    path: '',
                    element: <Schedules />,
                  },
                ],
              },
              {
                id: AwxRoute.ActivityStream,
                label: t('Activity Stream'),
                path: 'activity-stream',
                element: <PageNotImplemented />,
              },
              {
                id: AwxRoute.WorkflowApprovals,
                label: t('Workflow Approvals'),
                path: 'workflow-approvals',
                children: [
                  {
                    id: AwxRoute.WorkflowApprovalPage,
                    path: ':id/*',
                    element: <PageNotImplemented />,
                  },
                  {
                    path: '',
                    element: <PageNotImplemented />,
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
                id: AwxRoute.Templates,
                label: 'Templates',
                path: 'templates',
                children: [
                  {
                    path: 'jobs',
                    children: [
                      {
                        id: AwxRoute.CreateTemplate,
                        path: 'create',
                        element: <CreateJobTemplate />,
                      },
                      {
                        id: AwxRoute.EditTemplate,
                        path: ':id/edit',
                        element: <EditJobTemplate />,
                      },
                      {
                        id: AwxRoute.TemplateSchedule,
                        path: ':id/schedules/:schedule_id/*',
                        element: <SchedulePage />,
                      },
                      {
                        id: AwxRoute.TemplatePage,
                        path: ':id/*',
                        element: <TemplatePage />,
                      },
                    ],
                  },
                  {
                    path: 'workflows',
                    children: [
                      {
                        id: AwxRoute.WorkflowJobTemplateSchedule,
                        path: ':id/schedules/:schedule_id/*',
                        element: <SchedulePage />,
                      },
                      {
                        id: AwxRoute.WorkflowJobTemplatePage,
                        path: ':id/*',
                        element: <WorkflowJobTemplatePage />,
                      },
                    ],
                  },
                  {
                    path: '',
                    element: <Templates />,
                  },
                ],
              },
              {
                id: AwxRoute.Inventories,
                label: t('Credentials'),
                path: 'credentials',
                children: [
                  {
                    id: AwxRoute.CreateCredential,
                    path: 'create',
                    element: <CreateCredential />,
                  },
                  {
                    id: AwxRoute.EditCredential,
                    path: ':id/edit',
                    element: <EditCredential />,
                  },
                  {
                    id: AwxRoute.CredentialPage,
                    path: ':id/*',
                    element: <CredentialPage />,
                  },
                  {
                    path: '',
                    element: <Credentials />,
                  },
                ],
              },
              {
                id: AwxRoute.Projects,
                label: t('Projects'),
                path: 'projects',
                children: [
                  {
                    id: AwxRoute.CreateProject,
                    path: 'create',
                    element: <CreateProject />,
                  },
                  {
                    id: AwxRoute.EditProject,
                    path: ':id/edit',
                    element: <EditProject />,
                  },
                  {
                    id: AwxRoute.ProjectSchedules,
                    path: ':id/schedules/:schedule_id/*',
                    element: <SchedulePage />,
                  },
                  {
                    id: AwxRoute.ProjectPage,
                    path: ':id/*',
                    element: <ProjectPage />,
                  },
                  {
                    path: '',
                    element: <Projects />,
                  },
                ],
              },
              {
                id: AwxRoute.Inventories,
                label: t('Inventories'),
                path: 'inventories',
                children: [
                  {
                    id: AwxRoute.CreateInventory,
                    path: 'create',
                    element: <CreateInventory />,
                  },
                  {
                    id: AwxRoute.EditInventory,
                    path: ':id/edit',
                    element: <EditInventory />,
                  },
                  {
                    id: AwxRoute.InventorySchedules,
                    path: ':inventory_type/:id/schedules/:schedule_id/*',
                    element: <SchedulePage />,
                  },
                  {
                    id: AwxRoute.InventoryPage,
                    path: ':inventory_type/:id/*',
                    element: <InventoryPage />,
                  },
                  {
                    path: '',
                    element: <Inventories />,
                  },
                ],
              },
              {
                id: AwxRoute.Hosts,
                label: t('Hosts'),
                path: 'hosts',
                children: [
                  {
                    id: AwxRoute.HostPage,
                    path: ':id/*',
                    element: <HostPage />,
                  },
                  {
                    path: '',
                    element: <Hosts />,
                  },
                ],
              },
            ],
          },
          {
            label: t('Access'),
            path: 'access',
            children: [
              {
                id: AwxRoute.Organizations,
                label: t('Organizations'),
                path: 'organizations',
                children: [
                  {
                    id: AwxRoute.CreateOrganization,
                    path: 'create',
                    element: <CreateOrganization />,
                  },
                  {
                    id: AwxRoute.EditOrganization,
                    path: ':id/edit',
                    element: <EditOrganization />,
                  },
                  {
                    id: AwxRoute.OrganizationPage,
                    path: ':id/*',
                    element: <OrganizationPage />,
                  },
                  {
                    path: '',
                    element: <Organizations />,
                  },
                ],
              },
              {
                id: AwxRoute.Teams,
                label: t('Teams'),
                path: 'teams',
                children: [
                  {
                    id: AwxRoute.CreateTeam,
                    path: 'create',
                    element: <CreateTeam />,
                  },
                  {
                    id: AwxRoute.EditTeam,
                    path: ':id/edit',
                    element: <EditTeam />,
                  },
                  {
                    id: AwxRoute.AddRolesToTeam,
                    path: ':id/roles/add',
                    element: <AddRolesToTeam />,
                  },
                  {
                    id: AwxRoute.TeamPage,
                    path: ':id/*',
                    element: <TeamPage />,
                  },
                  {
                    path: '',
                    element: <Teams />,
                  },
                ],
              },
              {
                id: AwxRoute.Users,
                label: t('Users'),
                path: 'users',
                children: [
                  {
                    id: AwxRoute.CreateUser,
                    path: 'create',
                    element: <CreateUser />,
                  },
                  {
                    id: AwxRoute.EditUser,
                    path: ':id/edit',
                    element: <EditUser />,
                  },
                  {
                    id: AwxRoute.AddRolesToUser,
                    path: ':id/roles/add',
                    element: <AddRolesToUser />,
                  },
                  {
                    id: AwxRoute.UserPage,
                    path: ':id/*',
                    element: <UserPage />,
                  },
                  {
                    path: '',
                    element: <Users />,
                  },
                ],
              },
            ],
          },
          {
            label: t('Administration'),
            path: 'administration',
            children: [
              {
                id: AwxRoute.CredentialTypes,
                label: t('Credential Types'),
                path: 'credential-types',
                children: [
                  {
                    id: AwxRoute.CredentialType,
                    path: ':id/*',
                    element: <CredentialTypePage />,
                  },
                  {
                    path: '',
                    element: <CredentialTypes />,
                  },
                ],
              },
              {
                id: AwxRoute.Notifications,
                label: t('Notifictions'),
                path: 'notifications',
                children: [
                  {
                    id: AwxRoute.NotificationPage,
                    path: ':id/*',
                    element: <NotificationPage />,
                  },
                  {
                    path: '',
                    element: <Notifications />,
                  },
                ],
              },
              {
                id: AwxRoute.ManagementJobs,
                label: t('Management Jobs'),
                path: 'management-jobs',
                children: [
                  {
                    id: AwxRoute.ManagementJobSchedules,
                    path: ':resource_id/schedules/:schedule_id/details',
                    element: <SchedulePage />,
                  },
                  {
                    id: AwxRoute.ManagementJobPage,
                    path: ':id/*',
                    element: <ManagementJobPage />,
                  },
                  {
                    path: '',
                    element: <ManagementJobs />,
                  },
                ],
              },
              {
                id: AwxRoute.InstanceGroups,
                label: t('Instance Groups'),
                path: 'instance-groups',
                element: <InstanceGroups />,
              },
              {
                id: AwxRoute.Instances,
                label: t('Instances'),
                path: 'instances',
                children: [
                  {
                    id: AwxRoute.EditInstance,
                    path: ':id/edit',
                    element: <EditInstance />,
                  },
                  {
                    id: AwxRoute.InstancePage,
                    path: ':id/*',
                    element: <InstanceDetails />,
                  },
                  {
                    path: '',
                    element: <Instances />,
                  },
                ],
              },
              {
                id: AwxRoute.Applications,
                label: t('Applications'),
                path: 'applications',
                children: [
                  {
                    id: AwxRoute.ApplicationPage,
                    path: ':id/*',
                    element: <ApplicationPage />,
                  },
                  {
                    path: '',
                    element: <Applications />,
                  },
                ],
              },
              {
                id: AwxRoute.ExecutionEnvironments,
                label: t('Execution Environments'),
                path: 'execution-environments',
                element: <ExecutionEnvironments />,
              },
              {
                id: AwxRoute.TopologyView,
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
                id: AwxRoute.Reports,
                label: t('Reports'),
                path: 'reports',
                element: <Reports />,
              },
              {
                id: AwxRoute.HostMetrics,
                label: 'Host Metrics',
                path: 'host-metrics',
                element: <HostMetrics />,
              },
              {
                id: AwxRoute.SubscriptionUsage,
                label: 'Subscription Usage',
                path: 'subscription-usage',
                element: <SubscriptionUsage />,
              },
            ],
          },
          {
            id: AwxRoute.Settings,
            label: t('Settings'),
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
      {
        id: AwxRoute.Awx,
        path: '',
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

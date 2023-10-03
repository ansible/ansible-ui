import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import {
  PageNavigationItem,
  removeLeadingSlash,
} from '../../framework/PageNavigation/PageNavigationItem';
import { PageNotImplemented } from '../common/PageNotImplemented';
import { AwxLogin } from './AwxLogin';
import { AwxRoute } from './AwxRoutes';
import { CreateOrganization, EditOrganization } from './access/organizations/OrganizationForm';
import { OrganizationAccess } from './access/organizations/OrganizationPage/OrganizationAccess';
import { OrganizationDetails } from './access/organizations/OrganizationPage/OrganizationDetails';
import { OrganizationPage } from './access/organizations/OrganizationPage/OrganizationPage';
import { OrganizationTeams } from './access/organizations/OrganizationPage/OrganizationTeams';
import { Organizations } from './access/organizations/Organizations';
import { CreateTeam, EditTeam } from './access/teams/TeamForm';
import { TeamAccess } from './access/teams/TeamPage/TeamAccess';
import { TeamDetails } from './access/teams/TeamPage/TeamDetails';
import { TeamPage } from './access/teams/TeamPage/TeamPage';
import { TeamRoles } from './access/teams/TeamPage/TeamRoles';
import { Teams } from './access/teams/Teams';
import { AddRolesToTeam } from './access/teams/components/AddRolesToTeam';
import { CreateUser, EditUser } from './access/users/UserForm';
import { UserDetails } from './access/users/UserPage/UserDetails';
import { UserOrganizations } from './access/users/UserPage/UserOrganizations';
import { UserPage } from './access/users/UserPage/UserPage';
import { UserRoles } from './access/users/UserPage/UserRoles';
import { UserTeams } from './access/users/UserPage/UserTeams';
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
import { Test } from './analytics/AnalyticsReportBuilder/Test';
import ReportsList from './analytics/Reports/ReportsList';
import SubscriptionUsage from './analytics/subscription-usage/SubscriptionUsage';
import { AwxDashboard } from './dashboard/AwxDashboard';
import { CreateCredential, EditCredential } from './resources/credentials/CredentialForm';
import { CredentialDetails } from './resources/credentials/CredentialPage/CredentialDetails';
import { CredentialPage } from './resources/credentials/CredentialPage/CredentialPage';
import { Credentials } from './resources/credentials/Credentials';
import { HostPage } from './resources/hosts/HostPage/HostPage';
import { Hosts } from './resources/hosts/Hosts';
import { Inventories } from './resources/inventories/Inventories';
import { CreateInventory, EditInventory } from './resources/inventories/InventoryForm';
import { InventoryDetails } from './resources/inventories/InventoryPage/InventoryDetails';
import { InventoryPage } from './resources/inventories/InventoryPage/InventoryPage';
import { ProjectDetails } from './resources/projects/ProjectPage/ProjectDetails';
import { CreateProject, EditProject } from './resources/projects/ProjectPage/ProjectForm';
import { ProjectPage } from './resources/projects/ProjectPage/ProjectPage';
import { Projects } from './resources/projects/Projects';
import { CreateJobTemplate, EditJobTemplate } from './resources/templates/TemplateForm';
import { TemplateDetails } from './resources/templates/TemplatePage/TemplateDetails';
import { TemplatePage } from './resources/templates/TemplatePage/TemplatePage';
import { Templates } from './resources/templates/Templates';
import {
  CreateWorkflowJobTemplate,
  EditWorkflowJobTemplate,
} from './resources/templates/WorkflowJobTemplateForm';
import { WorkflowJobTemplateDetails } from './resources/templates/WorkflowJobTemplatePage/WorkflowJobTemplateDetails';
import { WorkflowJobTemplatePage } from './resources/templates/WorkflowJobTemplatePage/WorkflowJobTemplatePage';
import Settings from './settings/Settings';
import HostMetrics from './views/jobs/HostMetrics';
import { JobDetails } from './views/jobs/JobDetails';
import { JobOutput } from './views/jobs/JobOutput/JobOutput';
import { JobPage } from './views/jobs/JobPage';
import Jobs from './views/jobs/Jobs';
import { CreateSchedule } from './views/schedules/ScheduleForm';
import { ScheduleDetails } from './views/schedules/SchedulePage/ScheduleDetails';
import { SchedulePage } from './views/schedules/SchedulePage/SchedulePage';
import { ScheduleRules } from './views/schedules/SchedulePage/ScheduleRules';
import { Schedules } from './views/schedules/Schedules';
import { TemplateLaunchWizard } from './resources/templates/TemplatePage/TemplateLaunchWizard';
import { WorkflowJobTemplateVisualizer } from './resources/templates/WorkflowVisualizer/WorkflowVisualizer';

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
                    path: ':job_type/:id',
                    element: <JobPage />,
                    children: [
                      {
                        id: AwxRoute.JobOutput,
                        path: 'output',
                        element: <JobOutput />,
                      },
                      {
                        id: AwxRoute.JobDetails,
                        path: 'details',
                        element: <JobDetails />,
                      },
                    ],
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
                label: t('Templates'),
                path: 'templates',
                children: [
                  {
                    path: 'job_template',
                    children: [
                      {
                        id: AwxRoute.CreateJobTemplate,
                        path: 'create',
                        element: <CreateJobTemplate />,
                      },
                      {
                        id: AwxRoute.EditJobTemplate,
                        path: ':id/edit',
                        element: <EditJobTemplate />,
                      },
                      {
                        id: AwxRoute.JobTemplateScheduleCreate,
                        path: ':id/schedules/create',
                        element: <CreateSchedule />,
                      },
                      {
                        id: AwxRoute.JobTemplateEditSchedule,
                        path: ':id/schedules/:schedule_id/edit',
                        element: <PageNotImplemented />,
                      },
                      {
                        id: AwxRoute.JobTemplateSchedulePage,
                        path: ':id/schedules/:schedule_id',
                        element: (
                          <SchedulePage
                            backTab={{
                              label: t('Back to Templates'),
                              page: AwxRoute.Templates,
                              persistentFilterKey: 'job_template-schedules',
                            }}
                            tabs={[
                              {
                                label: t('Details'),
                                page: AwxRoute.JobTemplateScheduleDetails,
                              },
                              {
                                label: t('Rules'),
                                page: AwxRoute.JobTemplateScheduleRrules,
                              },
                            ]}
                          />
                        ),
                        children: [
                          {
                            id: AwxRoute.JobTemplateScheduleDetails,
                            path: 'details',
                            element: <ScheduleDetails />,
                          },
                          {
                            id: AwxRoute.JobTemplateScheduleRrules,
                            path: 'rrules',
                            element: <ScheduleRules />,
                          },
                        ],
                      },
                      {
                        id: AwxRoute.JobTemplatePage,
                        path: ':id',
                        element: <TemplatePage />,
                        children: [
                          {
                            id: AwxRoute.JobTemplateDetails,
                            path: 'details',
                            element: <TemplateDetails />,
                          },
                          {
                            id: AwxRoute.JobTemplateAccess,
                            path: 'access',
                            element: <PageNotImplemented />,
                          },
                          {
                            id: AwxRoute.JobTemplateJobs,
                            path: 'job',
                            element: <PageNotImplemented />,
                          },
                          {
                            id: AwxRoute.JobTemplateNotifications,
                            path: 'notifications',
                            element: <PageNotImplemented />,
                          },
                          {
                            id: AwxRoute.JobTemplateSurvey,
                            path: 'survey',
                            element: <PageNotImplemented />,
                          },
                          {
                            id: AwxRoute.JobTemplateSchedules,
                            path: 'schedules',
                            element: <Schedules sublistEndpoint={`/api/v2/job_templates`} />,
                          },
                          {
                            path: '',
                            element: <Navigate to="details" />,
                          },
                        ],
                      },
                      {
                        id: AwxRoute.TemplateLaunchWizard,
                        path: ':id/launch',
                        element: <TemplateLaunchWizard />,
                      },
                    ],
                  },
                  {
                    path: 'workflow_job_template',
                    children: [
                      {
                        id: AwxRoute.CreateWorkflowJobTemplate,
                        path: 'create',
                        element: <CreateWorkflowJobTemplate />,
                      },
                      {
                        id: AwxRoute.EditWorkflowJobTemplate,
                        path: ':id/edit',
                        element: <EditWorkflowJobTemplate />,
                      },
                      {
                        id: AwxRoute.WorkflowJobTemplateScheduleCreate,
                        path: ':id/schedules/create',
                        element: <CreateSchedule />,
                      },
                      {
                        id: AwxRoute.WorkflowJobTemplateEditSchedule,
                        path: ':id/schedules/:schedule_id/edit',
                        element: <PageNotImplemented />,
                      },
                      {
                        id: AwxRoute.WorkflowJobTemplateSchedulePage,
                        path: ':id/schedules/:schedule_id',
                        element: (
                          <SchedulePage
                            backTab={{
                              label: t('Back to Schedules'),
                              page: AwxRoute.WorkflowJobTemplateSchedules,
                              persistentFilterKey: 'workflow_job_template-schedules',
                            }}
                            tabs={[
                              {
                                label: t('Details'),
                                page: AwxRoute.WorkflowJobTemplateScheduleDetails,
                              },
                              {
                                label: t('Rules'),
                                page: AwxRoute.WorkflowJobTemplateScheduleRrules,
                              },
                            ]}
                          />
                        ),
                        children: [
                          {
                            id: AwxRoute.WorkflowJobTemplateScheduleDetails,
                            path: 'details',
                            element: <ScheduleDetails />,
                          },
                          {
                            id: AwxRoute.WorkflowJobTemplateScheduleRrules,
                            path: 'rrules',
                            element: <ScheduleRules />,
                          },
                        ],
                      },
                      {
                        id: AwxRoute.WorkflowJobTemplatePage,
                        path: ':id',
                        element: <WorkflowJobTemplatePage />,
                        children: [
                          {
                            id: AwxRoute.WorkflowJobTemplateDetails,
                            path: 'details',
                            element: <WorkflowJobTemplateDetails />,
                          },
                          {
                            id: AwxRoute.WorkflowJobTemplateAccess,
                            path: 'access',
                            element: <PageNotImplemented />,
                          },
                          {
                            id: AwxRoute.WorkflowJobTemplateJobs,
                            path: 'workflow_jobs',
                            element: <PageNotImplemented />,
                          },
                          {
                            id: AwxRoute.WorkflowJobTemplateSurvey,
                            path: 'survey',
                            element: <PageNotImplemented />,
                          },
                          {
                            id: AwxRoute.WorkflowVisualizer,
                            path: 'visualizer',
                            element: <WorkflowJobTemplateVisualizer />,
                          },
                          {
                            id: AwxRoute.WorkflowJobTemplateSchedules,
                            path: 'schedules',
                            element: (
                              <Schedules sublistEndpoint={`/api/v2/workflow_job_templates`} />
                            ),
                          },
                          {
                            id: AwxRoute.WorkflowJobTemplateNotifications,
                            path: 'notifications',
                            element: <PageNotImplemented />,
                          },
                          {
                            path: '',
                            element: <Navigate to="details" />,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    id: AwxRoute.Templates,
                    path: '',
                    element: <Templates />,
                  },
                ],
              },
              {
                id: AwxRoute.Credentials,
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
                    path: ':id',
                    element: <CredentialPage />,
                    children: [
                      {
                        id: AwxRoute.CredentialDetails,
                        path: 'details',
                        element: <CredentialDetails />,
                      },
                      {
                        id: AwxRoute.CredentialAccess,
                        path: 'access',
                        element: <PageNotImplemented />,
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
                    id: AwxRoute.ProjectScheduleCreate,
                    path: ':id/schedules/create',
                    element: <CreateSchedule />,
                  },
                  {
                    id: AwxRoute.ProjectScheduleEdit,
                    path: ':id/schedules/:schedule_id/edit',
                    element: <PageNotImplemented />,
                  },
                  {
                    id: AwxRoute.ProjectSchedulePage,
                    path: ':id/schedules/:schedule_id',
                    element: (
                      <SchedulePage
                        backTab={{
                          label: t('Back to Schedules'),
                          page: AwxRoute.ProjectSchedules,
                          persistentFilterKey: 'project-schedules',
                        }}
                        tabs={[
                          {
                            label: t('Details'),
                            page: AwxRoute.ProjectScheduleDetails,
                          },
                          {
                            label: t('Rules'),
                            page: AwxRoute.ProjectScheduleRrules,
                          },
                        ]}
                      />
                    ),
                    children: [
                      {
                        id: AwxRoute.ProjectScheduleDetails,
                        path: 'details',
                        element: <ScheduleDetails />,
                      },
                      {
                        id: AwxRoute.ProjectScheduleRrules,
                        path: 'rrules',
                        element: <ScheduleRules />,
                      },
                    ],
                  },

                  {
                    id: AwxRoute.ProjectPage,
                    path: ':id',
                    element: <ProjectPage />,
                    children: [
                      { id: AwxRoute.ProjectDetails, path: 'details', element: <ProjectDetails /> },
                      {
                        id: AwxRoute.ProjectAccess,
                        path: 'access',
                        element: <PageNotImplemented />,
                      },
                      {
                        id: AwxRoute.ProjectJobTemplates,
                        path: 'job_templates',
                        element: <PageNotImplemented />,
                      },
                      {
                        id: AwxRoute.ProjectNotifications,
                        path: 'notifications',
                        element: <PageNotImplemented />,
                      },
                      {
                        id: AwxRoute.ProjectSurvey,
                        path: 'survey',
                        element: <PageNotImplemented />,
                      },
                      {
                        id: AwxRoute.ProjectSchedules,
                        path: 'schedules',
                        element: <Schedules sublistEndpoint={`/api/v2/projects`} />,
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
                    id: AwxRoute.InventorySourceScheduleCreate,
                    path: ':id/sources/:source_id/schedules/create',
                    element: <CreateSchedule />,
                  },
                  {
                    id: AwxRoute.InventorySourceScheduleEdit,
                    path: ':id/sources/:source_id/schedules/edit',
                    element: <PageNotImplemented />,
                  },
                  {
                    id: AwxRoute.InventorySourceSchedulePage,
                    path: ':id/inventory_source/:source_id/schedules/:schedule_id/*',
                    element: (
                      <SchedulePage
                        backTab={{
                          label: t('Back to Schedules'),
                          page: AwxRoute.InventorySourceSchedules,
                          persistentFilterKey: 'inventory-schedules',
                        }}
                        tabs={[
                          {
                            label: t('Details'),
                            page: AwxRoute.InventorySourceScheduleDetails,
                          },
                          {
                            label: t('Rules'),
                            page: AwxRoute.InventorySourceScheduleRrules,
                          },
                        ]}
                      />
                    ),
                    children: [
                      {
                        id: AwxRoute.InventorySourceScheduleDetails,
                        path: 'details',
                        element: <ScheduleDetails />,
                      },
                      {
                        id: AwxRoute.InventorySourceScheduleRrules,
                        path: 'rrules',
                        element: <ScheduleRules />,
                      },
                    ],
                  },
                  {
                    id: AwxRoute.EditInventory,
                    path: ':id/edit',
                    element: <EditInventory />,
                  },
                  {
                    id: AwxRoute.InventoryPage,
                    path: ':inventory_type/:id/',
                    element: <InventoryPage />,
                    children: [
                      {
                        id: AwxRoute.InventoryDetails,
                        path: 'details',
                        element: <InventoryDetails />,
                      },
                      {
                        id: AwxRoute.InventoryAccess,
                        path: 'access',
                        element: <PageNotImplemented />,
                      },
                      {
                        id: AwxRoute.InventoryGroups,
                        path: 'groups',
                        element: <PageNotImplemented />,
                      },
                      {
                        id: AwxRoute.InventoryHosts,
                        path: 'hosts',
                        element: <PageNotImplemented />,
                      },
                      {
                        id: AwxRoute.InventorySources,
                        path: 'sources',
                        element: <PageNotImplemented />,
                      },
                      {
                        id: AwxRoute.InventoryJobs,
                        path: 'jobs',
                        element: <PageNotImplemented />,
                      },
                      {
                        id: AwxRoute.InventoryJobTemplates,
                        path: 'templates',
                        element: <PageNotImplemented />,
                      },
                    ],
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
                    path: ':id',
                    element: <OrganizationPage />,
                    children: [
                      {
                        id: AwxRoute.OrganizationDetails,
                        path: 'details',
                        element: <OrganizationDetails />,
                      },
                      {
                        id: AwxRoute.OrganizationAccess,
                        path: 'access',
                        element: <OrganizationAccess />,
                      },
                      {
                        id: AwxRoute.OrganizationTeams,
                        path: 'teams',
                        element: <OrganizationTeams />,
                      },
                      {
                        id: AwxRoute.OrganizationExecutionEnvironments,
                        path: 'execution-environments',
                        element: <PageNotImplemented />,
                      },
                      {
                        id: AwxRoute.OrganizationNotifications,
                        path: 'notifications',
                        element: <PageNotImplemented />,
                      },
                      {
                        path: '',
                        element: <Navigate to="details" />,
                      },
                    ],
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
                    path: ':id',
                    element: <TeamPage />,
                    children: [
                      {
                        id: AwxRoute.TeamDetails,
                        path: 'details',
                        element: <TeamDetails />,
                      },
                      {
                        id: AwxRoute.TeamAccess,
                        path: 'access',
                        element: <TeamAccess />,
                      },
                      {
                        id: AwxRoute.TeamRoles,
                        path: 'roles',
                        element: <TeamRoles />,
                      },
                      {
                        path: '',
                        element: <Navigate to="details" />,
                      },
                    ],
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
                    path: ':id',
                    element: <UserPage />,
                    children: [
                      {
                        id: AwxRoute.UserDetails,
                        path: 'details',
                        element: <UserDetails />,
                      },
                      {
                        id: AwxRoute.UserOrganizations,
                        path: 'organizations',
                        element: <UserOrganizations />,
                      },
                      {
                        id: AwxRoute.UserTeams,
                        path: 'teams',
                        element: <UserTeams />,
                      },
                      {
                        id: AwxRoute.UserRoles,
                        path: 'roles',
                        element: <UserRoles />,
                      },
                      {
                        path: '',
                        element: <Navigate to="details" />,
                      },
                    ],
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
                    path: ':id/',
                    element: <CredentialTypePage />,
                    children: [
                      {
                        id: AwxRoute.CredentialTypeDetails,
                        path: 'details',
                        element: <PageNotImplemented />,
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
              {
                id: AwxRoute.NotificationTemplates,
                label: t('Notifications'),
                path: 'notifications',
                children: [
                  {
                    id: AwxRoute.NotificationTemplatePage,
                    path: ':id/*',
                    element: <NotificationPage />,
                    children: [
                      {
                        id: AwxRoute.NotificationTemplateDetails,
                        path: 'details',
                        element: <PageNotImplemented />,
                      },
                      {
                        path: '',
                        element: <Navigate to="details" />,
                      },
                    ],
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
                    id: AwxRoute.ManagementJobSchedulePage,
                    path: ':id/schedules/:schedule_id',
                    element: (
                      <SchedulePage
                        backTab={{
                          label: t('Back to Schedules'),
                          page: AwxRoute.ManagementJobSchedules,
                          persistentFilterKey: 'management-jobs-schedules',
                        }}
                        tabs={[
                          {
                            label: t('Details'),
                            page: AwxRoute.ManagementJobScheduleDetails,
                          },
                          {
                            label: t('Rules'),
                            page: AwxRoute.ManagementJobScheduleRrules,
                          },
                        ]}
                      />
                    ),
                  },
                  {
                    id: AwxRoute.ManagementJobEditSchedule,
                    path: ':id/schedules/:schedule_id/edit',
                    element: <PageNotImplemented />,
                  },
                  {
                    id: AwxRoute.ManagementJobPage,
                    path: ':id',
                    element: <ManagementJobPage />,
                    children: [
                      {
                        id: AwxRoute.ManagementJobSchedules,
                        path: 'schedules',
                        element: <Schedules sublistEndpoint={`/api/v2/system_job_templates`} />,
                      },
                      {
                        id: AwxRoute.ManagementJobNotifications,
                        path: 'notifications',
                        element: <PageNotImplemented />,
                      },
                      {
                        path: '',
                        element: <Navigate to="schedules" />,
                      },
                    ],
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
                children: [
                  {
                    id: AwxRoute.CreateInstanceGroup,
                    path: 'create',
                    element: <PageNotImplemented />,
                  },
                  {
                    id: AwxRoute.EditInstanceGroup,
                    path: ':id/edit',
                    element: <PageNotImplemented />,
                  },
                  {
                    id: AwxRoute.InstanceGroupPage,
                    path: ':id/*',
                    element: <PageNotImplemented />,
                  },
                  {
                    path: '',
                    element: <InstanceGroups />,
                  },
                ],
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
            id: AwxRoute.Analytics,
            label: t('Analytics'),
            path: 'analytics',
            children: [
              {
                id: AwxRoute.Reports,
                label: t('Reports'),
                path: 'reports',
                element: <ReportsList />,
              },
              {
                id: AwxRoute.AutomationCalculator,
                label: t('Automation Calculator'),
                path: 'automation-calculator',
                element: <Reports />,
              },
              {
                id: 'TestAnalyticsBuilder',
                label: t('Analytics builder'),
                path: 'builder',
                element: <Test />,
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

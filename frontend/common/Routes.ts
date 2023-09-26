export type RouteType = `/${string}`;

const awxRoutePrefix: RouteType = process.env.AWX_ROUTE_PREFIX
  ? (process.env.AWX_ROUTE_PREFIX as RouteType)
  : '/ui_next';

const edaRoutePrefix: RouteType = process.env.EDA_ROUTE_PREFIX
  ? (process.env.EDA_ROUTE_PREFIX as RouteType)
  : '/eda';

export const RouteObj = {
  Login: '/login',

  AWX: `${awxRoutePrefix}`,

  // Dashboard: `${awxRoutePrefix}/dashboard`,

  // Views/Jobs
  // Jobs: `${awxRoutePrefix}/views/jobs`,
  // JobPage: `${awxRoutePrefix}/views/jobs/:job_type/:id/*`,
  JobOutput: `${awxRoutePrefix}/views/jobs/:job_type/:id/output`,
  JobDetails: `${awxRoutePrefix}/views/jobs/:job_type/:id/details`,
  // Schedules: `${awxRoutePrefix}/views/schedules`,
  // EditSchedule: `${awxRoutePrefix}/views/:resource_type/:resource_id/schedules/:schedule_id/edit`,
  ScheduleDetails: `${awxRoutePrefix}/views/:schedule_id/:resource_id/schedules/:schedule_id/details`,
  CreateSchedule: `${awxRoutePrefix}/views/schedules/create`,

  // Resources
  Templates: `${awxRoutePrefix}/resources/templates`,
  JobTemplatePage: `${awxRoutePrefix}/resources/templates/job_template/:id/*`,
  JobTemplateDetails: `${awxRoutePrefix}/resources/templates/job_template/:id/details`,
  JobTemplateAccess: `${awxRoutePrefix}/resources/templates/job_template/:id/access`,
  JobTemplateNotifications: `${awxRoutePrefix}/resources/templates/job_template/:id/notifications`,
  JobTemplateJobs: `${awxRoutePrefix}/resources/templates/job_template/:id/jobs`,
  JobTemplateSurvey: `${awxRoutePrefix}/resources/templates/job_template/:id/survey`,

  JobTemplateSchedules: `${awxRoutePrefix}/resources/templates/job_template/:id/schedules/`,
  JobTemplateSchedulePage: `${awxRoutePrefix}/resources/templates/job_template/:id/schedules/:schedule_id/*`,
  JobTemplateScheduleDetails: `${awxRoutePrefix}/resources/templates/job_template/:id/schedules/:schedule_id/details`,
  JobTemplateScheduleRules: `${awxRoutePrefix}/resources/templates/job_template/:id/schedules/:schedule_id/rules`,
  JobTemplateCreateScheduleRules: `${awxRoutePrefix}/resources/templates/job_template/:id/schedules/:schedule_id/rules/create`,
  JobTemplateSchedulesCreate: `${awxRoutePrefix}/resources/templates/job_template/:id/schedules/create`,
  WorkflowJobTemplatePage: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/*`,
  WorkflowJobTemplateDetails: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/details`,
  WorkflowJobTemplateAccess: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/access`,
  WorkflowJobTemplateNotifications: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/notifications`,
  WorkflowJobTemplateSchedules: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/schedules`,
  WorkflowJobTemplateSchedulePage: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/schedules/:schedule_id/*`,
  WorkflowJobTemplateSchedulesCreate: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/schedules/create`,
  WorkflowJobTemplateScheduleDetails: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/schedules/:schedule_id/details`,
  WorkflowJobTemplateCreateScheduleRules: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/schedules/:schedule_id/rules/create`,
  WorkflowJobTemplateScheduleRules: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/schedules/:schedule_id/rules`,
  WorkflowJobTemplateJobs: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/jobs`,
  WorkflowJobTemplateSurvey: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/survey`,
  WorkflowJobTemplateVisualizer: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/visualizer`,
  CreateWorkflowJobTemplate: `${awxRoutePrefix}/resources/templates/workflow_job_template/create`,
  CreateJobTemplate: `${awxRoutePrefix}/resources/templates/job_template/create`,
  EditJobTemplate: `${awxRoutePrefix}/resources/templates/job_template/:id/edit`,
  EditWorkflowJobTemplate: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/edit`,

  CredentialPage: `${awxRoutePrefix}/resources/credentials/:id/*`,
  CredentialDetails: `${awxRoutePrefix}/resources/credentials/:id/details`,
  CredentialAccess: `${awxRoutePrefix}/resources/credentials/:id/access`,

  Projects: `${awxRoutePrefix}/resources/projects`,
  ProjectPage: `${awxRoutePrefix}/resources/projects/:id/*`,
  ProjectDetails: `${awxRoutePrefix}/resources/projects/:id/details`,
  ProjectAccess: `${awxRoutePrefix}/resources/projects/:id/access`,
  ProjectTemplates: `${awxRoutePrefix}/resources/projects/:id/templates`,
  ProjectNotifications: `${awxRoutePrefix}/resources/projects/:id/notifications`,
  ProjectSchedules: `${awxRoutePrefix}/resources/projects/:id/schedules`,
  ProjectSchedulePage: `${awxRoutePrefix}/resources/projects/:id/schedules/:schedule_id/*`,
  ProjectSchedulesCreate: `${awxRoutePrefix}/resources/projects/:id/schedules/create`,
  ProjectScheduleDetails: `${awxRoutePrefix}/resources/projects/:id/schedules/:schedule_id/details`,
  ProjectCreateScheduleRules: `${awxRoutePrefix}/resources/project/:id/schedules/:schedule_id/rules/create`,
  ProjectScheduleRules: `${awxRoutePrefix}/resources/project/:id/schedules/:schedule_id/rules`,
  EditProject: `${awxRoutePrefix}/resources/projects/:id/edit`,

  Inventories: `${awxRoutePrefix}/resources/inventories`,
  InventoryPage: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/*`,
  InventoryDetails: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/details`,
  InventoryAccess: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/access`,
  InventoryGroups: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/groups`,
  InventoryHosts: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/hosts`,
  InventorySources: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources`,
  InventorySourcesPage: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources/:source_id/*`,
  InventorySourcesDetails: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources/:source_id/details`,
  InventorySourceSchedulesCreate: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources/:source_id/schedules/create`,
  InventorySourceSchedules: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources/:source_id/schedules`,
  InventorySourceSchedulePage: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources/:source_id/schedules/:schedule_id/*`,
  InventorySourceScheduleDetails: `${awxRoutePrefix}/resources/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/details`,
  InventorySourceCreateScheduleRules: `${awxRoutePrefix}/resources/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/rules/create`,
  InventorySourceScheduleRules: `${awxRoutePrefix}/resources/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/rules`,
  InventoryJobs: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/jobs`,
  InventoryJobTemplates: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/job_templates`,

  HostPage: `${awxRoutePrefix}/resources/hosts/:id/*`,
  HostDetails: `${awxRoutePrefix}/resources/hosts/:id/details`,
  HostFacts: `${awxRoutePrefix}/resources/hosts/:id/facts`,
  HostGroups: `${awxRoutePrefix}/resources/hosts/:id/groups`,
  HostJobs: `${awxRoutePrefix}/resources/hosts/:id/jobs`,

  // Access
  OrganizationPage: `${awxRoutePrefix}/access/organizations/:id/*`,
  OrganizationDetails: `${awxRoutePrefix}/access/organizations/:id/details`,
  OrganizationAccess: `${awxRoutePrefix}/access/organizations/:id/access`,
  OrganizationTeams: `${awxRoutePrefix}/access/organizations/:id/teams`,
  OrganizationExecutionEnvironments: `${awxRoutePrefix}/access/organizations/:id/execution_environments`,
  OrganizationNotifications: `${awxRoutePrefix}/access/organizations/:id/notifications`,

  TeamPage: `${awxRoutePrefix}/access/teams/:id/*`,
  TeamDetails: `${awxRoutePrefix}/access/teams/:id/details`,
  TeamAccess: `${awxRoutePrefix}/access/teams/:id/access`,
  TeamRoles: `${awxRoutePrefix}/access/teams/:id/roles`,

  UserPage: `${awxRoutePrefix}/access/users/:id/*`,
  UserDetails: `${awxRoutePrefix}/access/users/:id/details`,
  UserOrganizations: `${awxRoutePrefix}/access/users/:id/organizations`,
  UserTeams: `${awxRoutePrefix}/access/users/:id/teams`,
  UserRoles: `${awxRoutePrefix}/access/users/:id/roles`,

  // Administration
  CredentialTypes: `${awxRoutePrefix}/administration/credential_types`,
  CredentialTypePage: `${awxRoutePrefix}/administration/credential_types/:id/*`,
  CredentialTypeDetails: `${awxRoutePrefix}/administration/credential_types/:id/details`,

  NotificationPage: `${awxRoutePrefix}/administration/notification_templates/:id/*`,
  NotificationDetails: `${awxRoutePrefix}/administration/notification_templates/:id/details`,
  ManagementJobs: `${awxRoutePrefix}/administration/management_jobs`,
  ManagementJobPage: `${awxRoutePrefix}/administration/management_jobs/:id/*`,
  ManagementJobSchedules: `${awxRoutePrefix}/administration/management_jobs/:id/schedules`,
  ManagementJobSchedulesDetails: `${awxRoutePrefix}/administration/management_jobs/:id/schedules/:schedule_id/details`,
  ManagementJobNotifications: `${awxRoutePrefix}/administration/management_jobs/:id/notifications`,

  InstanceGroupDetails: `${awxRoutePrefix}/administration/instance-groups/:id`,

  ExecutionEnvironmentDetails: `${awxRoutePrefix}/administration/execution-environments/:id/details`,
  CreateExecutionEnvironment: `${awxRoutePrefix}/administration/execution-environments/create`,
  EditExecutionEnvironment: `${awxRoutePrefix}/administration/execution-environments/:id/edit`,

  RulesetPage: `${edaRoutePrefix}/rulesets/details/:id`,
  EdaUserDetailsTokens: `${edaRoutePrefix}/access/users/details/:id/tokens`,
};

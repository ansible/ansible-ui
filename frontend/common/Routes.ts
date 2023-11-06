export type RouteType = `/${string}`;

const awxRoutePrefix: RouteType = process.env.AWX_ROUTE_PREFIX
  ? (process.env.AWX_ROUTE_PREFIX as RouteType)
  : '/ui_next';

const edaRoutePrefix: RouteType = process.env.EDA_ROUTE_PREFIX
  ? (process.env.EDA_ROUTE_PREFIX as RouteType)
  : '/eda';

export const RouteObj = {
  Login: '/login',

  // Views/Jobs
  JobOutput: `${awxRoutePrefix}/views/jobs/:job_type/:id/output`,
  JobDetails: `${awxRoutePrefix}/views/jobs/:job_type/:id/details`,
  CreateSchedule: `${awxRoutePrefix}/views/schedules/create`,

  // Resources
  Templates: `${awxRoutePrefix}/resources/templates`,
  JobTemplateDetails: `${awxRoutePrefix}/resources/templates/job_template/:id/details`,

  JobTemplateSchedules: `${awxRoutePrefix}/resources/templates/job_template/:id/schedules/`,
  JobTemplateSchedulePage: `${awxRoutePrefix}/resources/templates/job_template/:id/schedules/:schedule_id/*`,
  JobTemplateScheduleDetails: `${awxRoutePrefix}/resources/templates/job_template/:id/schedules/:schedule_id/details`,
  JobTemplateScheduleRules: `${awxRoutePrefix}/resources/templates/job_template/:id/schedules/:schedule_id/rules`,
  JobTemplateCreateScheduleRules: `${awxRoutePrefix}/resources/templates/job_template/:id/schedules/:schedule_id/rules/create`,
  JobTemplateSchedulesCreate: `${awxRoutePrefix}/resources/templates/job_template/:id/schedules/create`,
  WorkflowJobTemplatePage: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/*`,
  WorkflowJobTemplateDetails: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/details`,
  WorkflowJobTemplateSchedules: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/schedules`,
  WorkflowJobTemplateSchedulePage: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/schedules/:schedule_id/*`,
  WorkflowJobTemplateSchedulesCreate: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/schedules/create`,
  WorkflowJobTemplateScheduleDetails: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/schedules/:schedule_id/details`,
  WorkflowJobTemplateCreateScheduleRules: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/schedules/:schedule_id/rules/create`,
  WorkflowJobTemplateScheduleRules: `${awxRoutePrefix}/resources/templates/workflow_job_template/:id/schedules/:schedule_id/rules`,

  CredentialPage: `${awxRoutePrefix}/resources/credentials/:id/*`,
  CredentialDetails: `${awxRoutePrefix}/resources/credentials/:id/details`,

  CredentialTypePage: `${awxRoutePrefix}/resources/credential-types/:id/*`,
  CredentialTypeDetails: `${awxRoutePrefix}/resources/credential-types/:id/details`,

  Projects: `${awxRoutePrefix}/resources/projects`,
  ProjectDetails: `${awxRoutePrefix}/resources/projects/:id/details`,
  ProjectSchedules: `${awxRoutePrefix}/resources/projects/:id/schedules`,
  ProjectSchedulePage: `${awxRoutePrefix}/resources/projects/:id/schedules/:schedule_id/*`,
  ProjectSchedulesCreate: `${awxRoutePrefix}/resources/projects/:id/schedules/create`,
  ProjectScheduleDetails: `${awxRoutePrefix}/resources/projects/:id/schedules/:schedule_id/details`,
  ProjectCreateScheduleRules: `${awxRoutePrefix}/resources/project/:id/schedules/:schedule_id/rules/create`,
  ProjectScheduleRules: `${awxRoutePrefix}/resources/project/:id/schedules/:schedule_id/rules`,
  EditProject: `${awxRoutePrefix}/resources/projects/:id/edit`,

  Inventories: `${awxRoutePrefix}/resources/inventories`,
  InventoryDetails: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/details`,
  InventorySourcesDetails: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources/:source_id/details`,
  InventorySourceSchedulesCreate: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources/:source_id/schedules/create`,
  InventorySourceSchedules: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources/:source_id/schedules`,
  InventorySourceSchedulePage: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources/:source_id/schedules/:schedule_id/*`,
  InventorySourceScheduleDetails: `${awxRoutePrefix}/resources/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/details`,
  InventorySourceCreateScheduleRules: `${awxRoutePrefix}/resources/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/rules/create`,
  InventorySourceScheduleRules: `${awxRoutePrefix}/resources/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/rules`,

  HostDetails: `${awxRoutePrefix}/resources/hosts/:id/details`,

  // Access
  TeamPage: `${awxRoutePrefix}/access/teams/:id/*`,
  TeamDetails: `${awxRoutePrefix}/access/teams/:id/details`,
  UserDetails: `${awxRoutePrefix}/access/users/:id/details`,

  // Administration
  ManagementJobs: `${awxRoutePrefix}/administration/management_jobs`,
  ManagementJobSchedulesDetails: `${awxRoutePrefix}/administration/management_jobs/:id/schedules/:schedule_id/details`,
  InstanceGroupDetails: `${awxRoutePrefix}/administration/instance-groups/:id`,
  ExecutionEnvironmentDetails: `${awxRoutePrefix}/administration/execution-environments/:id/details`,
  CreateExecutionEnvironment: `${awxRoutePrefix}/administration/execution-environments/create`,
  EditExecutionEnvironment: `${awxRoutePrefix}/administration/execution-environments/:id/edit`,

  // EDA
  EdaUserDetailsTokens: `${edaRoutePrefix}/access/users/details/:id/tokens`,
  EdaRulebookActivationPage: `${edaRoutePrefix}/views/rulebook-activations/:id/*`,
  EdaRulebookActivationDetails: `${edaRoutePrefix}/views/rulebook-activations/:id/details`,
  EdaRulebookActivationHistory: `${edaRoutePrefix}/views/rulebook-activations/:id/history`,
};

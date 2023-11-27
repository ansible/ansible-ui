export type RouteType = `/${string}`;

/** @deprecated Use usePageUrl and usePagenavigation with AwxRoute, EdaRoute, and HubRoute instead. */
export const RouteObj = {
  Login: '/login',

  // Views/Jobs
  JobOutput: `/views/jobs/:job_type/:id/output`,
  JobDetails: `/views/jobs/:job_type/:id/details`,
  CreateSchedule: `/views/schedules/create`,

  // Resources
  Templates: `/resources/templates`,
  JobTemplateDetails: `/resources/templates/job_template/:id/details`,

  JobTemplateSchedules: `/resources/templates/job_template/:id/schedules/`,
  JobTemplateSchedulePage: `/resources/templates/job_template/:id/schedules/:schedule_id/*`,
  JobTemplateScheduleDetails: `/resources/templates/job_template/:id/schedules/:schedule_id/details`,
  JobTemplateScheduleRules: `/resources/templates/job_template/:id/schedules/:schedule_id/rules`,
  JobTemplateCreateScheduleRules: `/resources/templates/job_template/:id/schedules/:schedule_id/rules/create`,
  JobTemplateSchedulesCreate: `/resources/templates/job_template/:id/schedules/create`,
  WorkflowJobTemplatePage: `/resources/templates/workflow_job_template/:id/*`,
  WorkflowJobTemplateDetails: `/resources/templates/workflow_job_template/:id/details`,
  WorkflowJobTemplateSchedules: `/resources/templates/workflow_job_template/:id/schedules`,
  WorkflowJobTemplateSchedulePage: `/resources/templates/workflow_job_template/:id/schedules/:schedule_id/*`,
  WorkflowJobTemplateSchedulesCreate: `/resources/templates/workflow_job_template/:id/schedules/create`,
  WorkflowJobTemplateScheduleDetails: `/resources/templates/workflow_job_template/:id/schedules/:schedule_id/details`,
  WorkflowJobTemplateCreateScheduleRules: `/resources/templates/workflow_job_template/:id/schedules/:schedule_id/rules/create`,
  WorkflowJobTemplateScheduleRules: `/resources/templates/workflow_job_template/:id/schedules/:schedule_id/rules`,

  CredentialPage: `/resources/credentials/:id/*`,
  CredentialDetails: `/resources/credentials/:id/details`,

  CredentialTypePage: `/resources/credential-types/:id/*`,
  CredentialTypeDetails: `/resources/credential-types/:id/details`,

  Projects: `/resources/projects`,
  ProjectDetails: `/resources/projects/:id/details`,
  ProjectSchedules: `/resources/projects/:id/schedules`,
  ProjectSchedulePage: `/resources/projects/:id/schedules/:schedule_id/*`,
  ProjectSchedulesCreate: `/resources/projects/:id/schedules/create`,
  ProjectScheduleDetails: `/resources/projects/:id/schedules/:schedule_id/details`,
  ProjectCreateScheduleRules: `/resources/project/:id/schedules/:schedule_id/rules/create`,
  ProjectScheduleRules: `/resources/project/:id/schedules/:schedule_id/rules`,
  EditProject: `/resources/projects/:id/edit`,

  Inventories: `/resources/inventories`,
  InventoryDetails: `/resources/inventories/:inventory_type/:id/details`,
  InventorySourcesDetails: `/resources/inventories/:inventory_type/:id/sources/:source_id/details`,
  InventorySourceSchedulesCreate: `/resources/inventories/:inventory_type/:id/sources/:source_id/schedules/create`,
  InventorySourceSchedules: `/resources/inventories/:inventory_type/:id/sources/:source_id/schedules`,
  InventorySourceSchedulePage: `/resources/inventories/:inventory_type/:id/sources/:source_id/schedules/:schedule_id/*`,
  InventorySourceScheduleDetails: `/resources/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/details`,
  InventorySourceCreateScheduleRules: `/resources/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/rules/create`,
  InventorySourceScheduleRules: `/resources/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/rules`,

  HostDetails: `/resources/hosts/:id/details`,

  // Access
  TeamPage: `/access/teams/:id/*`,
  TeamDetails: `/access/teams/:id/details`,
  UserDetails: `/access/users/:id/details`,

  // Administration
  ManagementJobs: `/administration/management_jobs`,
  ManagementJobSchedulesDetails: `/administration/management_jobs/:id/schedules/:schedule_id/details`,
  InstanceGroupDetails: `/administration/instance-groups/:id`,
  ExecutionEnvironmentDetails: `/administration/execution-environments/:id/details`,
  CreateExecutionEnvironment: `/administration/execution-environments/create`,
  EditExecutionEnvironment: `/administration/execution-environments/:id/edit`,

  // EDA
  EdaUserDetailsTokens: `/access/users/details/:id/tokens`,
  EdaRulebookActivationPage: `/views/rulebook-activations/:id/*`,
  EdaRulebookActivationDetails: `/views/rulebook-activations/:id/details`,
  EdaRulebookActivationHistory: `/views/rulebook-activations/:id/history`,

  EdaRuleAuditPage: `/views/rule-audits/:id/*`,
  EdaRuleAuditDetails: `/views/rule-audits/:id/details`,
  EdaRuleAuditActions: `/views/rule-audits/:id/actions`,
  EdaRuleAuditEvents: `/views/rule-audits/:id/events`,
};

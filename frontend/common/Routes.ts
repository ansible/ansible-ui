export type RouteType = `/${string}`;

/** @deprecated Use useGetPageUrl and usePageNavigation with AwxRoute, EdaRoute, and HubRoute instead. */
export const RouteObj = {
  /** DO NOT ADD NEW VALUES - DEPRECATED */
  JobOutput: `/jobs/:job_type/:id/output`,
  JobDetails: `/jobs/:job_type/:id/details`,
  CreateSchedule: `/schedules/create`,

  /** DO NOT ADD NEW VALUES - DEPRECATED */
  Templates: `/templates`,
  JobTemplateDetails: `/templates/job_template/:id/details`,

  /** DO NOT ADD NEW VALUES - DEPRECATED */
  JobTemplateSchedules: `/templates/job_template/:id/schedules/`,
  JobTemplateSchedulePage: `/templates/job_template/:id/schedules/:schedule_id/*`,
  JobTemplateScheduleDetails: `/templates/job_template/:id/schedules/:schedule_id/details`,
  JobTemplateScheduleRules: `/templates/job_template/:id/schedules/:schedule_id/rules`,
  JobTemplateCreateScheduleRules: `/templates/job_template/:id/schedules/:schedule_id/rules/create`,
  JobTemplateSchedulesCreate: `/templates/job_template/:id/schedules/create`,
  WorkflowJobTemplatePage: `/templates/workflow_job_template/:id/*`,
  WorkflowJobTemplateDetails: `/templates/workflow_job_template/:id/details`,
  WorkflowJobTemplateSchedules: `/templates/workflow_job_template/:id/schedules`,
  WorkflowJobTemplateSchedulePage: `/templates/workflow_job_template/:id/schedules/:schedule_id/*`,
  WorkflowJobTemplateSchedulesCreate: `/templates/workflow_job_template/:id/schedules/create`,
  WorkflowJobTemplateScheduleDetails: `/templates/workflow_job_template/:id/schedules/:schedule_id/details`,
  WorkflowJobTemplateCreateScheduleRules: `/templates/workflow_job_template/:id/schedules/:schedule_id/rules/create`,
  WorkflowJobTemplateScheduleRules: `/templates/workflow_job_template/:id/schedules/:schedule_id/rules`,

  /** DO NOT ADD NEW VALUES - DEPRECATED */
  Projects: `/projects`,
  ProjectDetails: `/projects/:id/details`,
  ProjectSchedules: `/projects/:id/schedules`,
  ProjectSchedulePage: `/projects/:id/schedules/:schedule_id/*`,
  ProjectSchedulesCreate: `/projects/:id/schedules/create`,
  ProjectScheduleDetails: `/projects/:id/schedules/:schedule_id/details`,
  ProjectCreateScheduleRules: `/project/:id/schedules/:schedule_id/rules/create`,
  ProjectScheduleRules: `/project/:id/schedules/:schedule_id/rules`,
  EditProject: `/projects/:id/edit`,

  /** DO NOT ADD NEW VALUES - DEPRECATED */
  Inventories: `/infrastructure/inventories`,
  InventoryDetails: `/infrastructure/inventories/:inventory_type/:id/details`,
  InventorySourcesDetails: `/infrastructure/inventories/:inventory_type/:id/sources/:source_id/details`,
  InventorySourceSchedulesCreate: `/infrastructure/inventories/:inventory_type/:id/sources/:source_id/schedules/create`,
  InventorySourceSchedules: `/infrastructure/inventories/:inventory_type/:id/sources/:source_id/schedules`,
  InventorySourceSchedulePage: `/infrastructure/inventories/:inventory_type/:id/sources/:source_id/schedules/:schedule_id/*`,
  InventorySourceScheduleDetails: `/infrastructure/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/details`,
  InventorySourceCreateScheduleRules: `/infrastructure/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/rules/create`,
  InventorySourceScheduleRules: `/infrastructure/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/rules`,

  /** DO NOT ADD NEW VALUES - DEPRECATED */
  HostDetails: `/infrastructure/hosts/:id/details`,

  /** DO NOT ADD NEW VALUES - DEPRECATED */
  TeamPage: `/access/teams/:id/*`,
  TeamDetails: `/access/teams/:id/details`,
  UserDetails: `/access/users/:id/details`,

  /** DO NOT ADD NEW VALUES - DEPRECATED */
  ManagementJobs: `/administration/management_jobs`,
  ManagementJobSchedulesDetails: `/administration/management_jobs/:id/schedules/:schedule_id/details`,
  InstanceGroupDetails: `/infrastructure/instance-groups/:id`,
  ExecutionEnvironmentDetails: `/administration/execution-environments/:id/details`,
  CreateExecutionEnvironment: `/administration/execution-environments/create`,
  EditExecutionEnvironment: `/administration/execution-environments/:id/edit`,

  /** DO NOT ADD NEW VALUES - DEPRECATED */
  EdaUserDetailsTokens: `/access/users/details/:id/tokens`,
  EdaRulebookActivationPage: `/rulebook-activations/:id/*`,
  EdaRulebookActivationDetails: `/rulebook-activations/:id/details`,
  EdaRulebookActivationHistory: `/rulebook-activations/:id/history`,

  /** DO NOT ADD NEW VALUES - DEPRECATED */
  EdaRuleAuditPage: `/rule-audits/:id/*`,
  EdaRuleAuditDetails: `/rule-audits/:id/details`,
  EdaRuleAuditActions: `/rule-audits/:id/actions`,
  EdaRuleAuditEvents: `/rule-audits/:id/events`,

  /** DO NOT ADD NEW VALUES - DEPRECATED */
};

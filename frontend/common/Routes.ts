/** @deprecated Use useGetPageUrl and usePageNavigation with AwxRoute, EdaRoute, and HubRoute instead. */
export const RouteObj = {
  /** DO NOT ADD NEW VALUES - DEPRECATED */
  JobOutput: `/jobs/:job_type/:id/output`,
  CreateSchedule: `/schedules/create`,

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
  ProjectSchedules: `/projects/:id/schedules`,
  ProjectSchedulePage: `/projects/:id/schedules/:schedule_id/*`,
  ProjectSchedulesCreate: `/projects/:id/schedules/create`,
  ProjectScheduleDetails: `/projects/:id/schedules/:schedule_id/details`,
  ProjectCreateScheduleRules: `/project/:id/schedules/:schedule_id/rules/create`,
  ProjectScheduleRules: `/project/:id/schedules/:schedule_id/rules`,

  /** DO NOT ADD NEW VALUES - DEPRECATED */
  InventorySourceSchedulesCreate: `/infrastructure/inventories/:inventory_type/:id/sources/:source_id/schedules/create`,
  InventorySourceSchedules: `/infrastructure/inventories/:inventory_type/:id/sources/:source_id/schedules`,
  InventorySourceSchedulePage: `/infrastructure/inventories/:inventory_type/:id/sources/:source_id/schedules/:schedule_id/*`,
  InventorySourceScheduleDetails: `/infrastructure/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/details`,
  InventorySourceCreateScheduleRules: `/infrastructure/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/rules/create`,
  InventorySourceScheduleRules: `/infrastructure/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/rules`,

  /** DO NOT ADD NEW VALUES - DEPRECATED */
  InstanceGroupDetails: `/infrastructure/instance-groups/:id`,
  ExecutionEnvironmentDetails: `/administration/execution-environments/:id/details`,

  /** DO NOT ADD NEW VALUES - DEPRECATED */
};

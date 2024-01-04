/** @deprecated Use useGetPageUrl and usePageNavigation with AwxRoute, EdaRoute, and HubRoute instead. */
export const RouteObj = {
  /** DO NOT ADD NEW VALUES - DEPRECATED */
  JobOutput: `/jobs/:job_type/:id/output`,
  JobTemplateScheduleRules: `/templates/job_template/:id/schedules/:schedule_id/rules`,
  WorkflowJobTemplateScheduleRules: `/templates/workflow_job_template/:id/schedules/:schedule_id/rules`,
  ProjectScheduleRules: `/project/:id/schedules/:schedule_id/rules`,
  InventorySourceScheduleRules: `/infrastructure/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/rules`,
};

export interface DashboardTableItem {
  name: string;
  value: number;
}

export interface IJobTemplate {
  id: number;
  name: string;
  runs: number;
  num_hosts: number;
  time_taken_manually_execute_minutes: number;
  time_taken_create_automation_minutes: number;
  elapsed: string;
  automated_costs: number;
  manual_costs: number;
  savings: number;
}

export interface ITemplateOptions {
  manual_cost_automation_per_hour: number;
  automated_process_cost_per_minute: number;
  enable_template_creation_time: boolean;
}

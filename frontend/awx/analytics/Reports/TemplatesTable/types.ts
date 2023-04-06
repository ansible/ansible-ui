export interface Template {
  name: string;
  id: number;
  elapsed: number;
  host_count: number;
  total_count: number;
  total_org_count: number;
  total_cluster_count: number;
  total_inventory_count: number;
  successful_hosts_total: number;
  successful_elapsed_total: number;
  template_success_rate: number;
  successful_hosts_savings: number;
  failed_hosts_costs: number;
  manual_effort_minutes: number;
  // Calculated fields
  //delta: number;
  //avgRunTime: number;
  //manualCost: number;
  //automatedCost: number;
  //enabled: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monetary_gain?: number | any;
  // Anything else accidentally having it
  [key: string]: string | number | boolean;
}

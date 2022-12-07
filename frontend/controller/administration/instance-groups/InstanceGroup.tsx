export interface InstanceGroup {
  type: 'instance_group';
  id: number;
  name: string;
  created: string;
  modified: string;
  capacity: number;
  consumed_capacity: number;
  percent_capacity_remaining: number;
  jobs_running: number;
  jobs_total: number;
  instances: number;
  is_container_group: boolean;
  credential: number | null;
  policy_instance_percentage: number;
  policy_instance_minimum: number;
  // policy_instance_list: []
  pod_spec_override: string;
}

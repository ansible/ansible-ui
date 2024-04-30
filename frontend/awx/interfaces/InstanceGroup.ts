import { InstanceGroup as SwaggerInstanceGroup } from './generated-from-swagger/api';
import { SummaryFieldObjectRole } from './summary-fields/summary-fields';

export interface InstanceGroup
  extends Omit<
    SwaggerInstanceGroup,
    | 'id'
    | 'name'
    | 'percent_capacity_remaining'
    | 'consumed_capacity'
    | 'capacity'
    | 'results'
    | 'summary_fields'
  > {
  id: number;
  name: string;
  description?: string;
  consumed_capacity: number;
  percent_capacity_remaining: number;
  is_container_group: boolean;
  max_forks: number;
  max_concurrent_jobs: number;
  capacity: number;
  results: InstanceGroup[];
  summary_fields: {
    object_roles: {
      admin_role: SummaryFieldObjectRole;
      update_role: SummaryFieldObjectRole;
      adhoc_role: SummaryFieldObjectRole;
      use_role: SummaryFieldObjectRole;
      read_role: SummaryFieldObjectRole;
    };
    user_capabilities: {
      edit: boolean;
      delete: boolean;
    };
  };
}

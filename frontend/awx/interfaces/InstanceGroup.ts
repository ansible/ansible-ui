import { InstanceGroup as SwaggerInstanceGroup } from './generated-from-swagger/api';
import { SummaryFieldCredential, SummaryFieldObjectRole } from './summary-fields/summary-fields';

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
  max_concurrent_jobs: number;
  max_forks: number;
  pod_spec_override: string;
  percent_capacity_remaining: number;
  is_container_group: boolean;
  capacity: number | null;
  results: InstanceGroup[];
  summary_fields: {
    credential?: SummaryFieldCredential;
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

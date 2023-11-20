import { InstanceGroup as SwaggerInstanceGroup } from './generated-from-swagger/api';
import { SummeryFieldObjectRole } from './summary-fields/summary-fields';

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
  capacity: number;
  results: InstanceGroup[];
  summary_fields: {
    object_roles: {
      admin_role: SummeryFieldObjectRole;
      update_role: SummeryFieldObjectRole;
      adhoc_role: SummeryFieldObjectRole;
      use_role: SummeryFieldObjectRole;
      read_role: SummeryFieldObjectRole;
    };
    user_capabilities: {
      edit: boolean;
      delete: boolean;
    };
  };
}

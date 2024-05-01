import { Team as SwaggerTeam } from './generated-from-swagger/api';
import {
  SummaryFieldsByUser,
  SummaryFieldsOrganization,
  SummaryFieldObjectRole,
} from './summary-fields/summary-fields';

export interface Team extends Omit<SwaggerTeam, 'id' | 'name' | 'summary_fields'> {
  id: number;
  name: string;
  summary_fields: {
    resource: {
      ansible_id: string;
      resource_type: 'shared.team';
    };
    organization: SummaryFieldsOrganization;
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    object_roles: {
      admin_role: SummaryFieldObjectRole;
      member_role: SummaryFieldObjectRole;
      read_role: SummaryFieldObjectRole;
    };
    user_capabilities: {
      edit: boolean;
      delete: boolean;
    };
  };
}

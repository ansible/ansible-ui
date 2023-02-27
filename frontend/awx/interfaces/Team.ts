import { Team as SwaggerTeam } from './generated-from-swagger/api';
import {
  SummaryFieldsByUser,
  SummaryFieldsOrganization,
  SummeryFieldObjectRole,
} from './summary-fields/summary-fields';

export interface Team extends Omit<SwaggerTeam, 'id' | 'name' | 'summary_fields'> {
  id: number;
  name: string;
  summary_fields: {
    organization: SummaryFieldsOrganization;
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    object_roles: {
      admin_role: SummeryFieldObjectRole;
      member_role: SummeryFieldObjectRole;
      read_role: SummeryFieldObjectRole;
    };
    user_capabilities: {
      edit: boolean;
      delete: boolean;
    };
  };
}

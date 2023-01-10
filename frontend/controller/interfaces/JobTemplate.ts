import { JobTemplate as SwaggerJobTemplate } from './generated-from-swagger/api';
import { SummaryFieldsByUser } from './summary-fields/summary-fields';

export interface JobTemplate extends Omit<SwaggerJobTemplate, 'id' | 'name' | 'summary_fields'> {
  id: number;
  name: string;
  summary_fields: {
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    object_roles: {
      admin_role: { id: number };
      read_role: { id: number };
      use_role: { id: number };
    };
  };
}
